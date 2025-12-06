import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as https from 'https';
import * as http from 'http';
import { defineSecret } from 'firebase-functions/params';
import { agreementDataSchema, extractionSchemaGemini } from '../../schemas';
import {
  agreementAnalyzerSystemPrompt,
  agreementAnalyzerUserPrompt,
  agreementAnalyzerConfig
} from '../../agents';

const db = admin.firestore();

// Define secret for Gemini API key
const geminiApiKey = defineSecret('GEMINI_API_KEY');

// Initialize Gemini API (will be done inside function with secret access)
let genAI: GoogleGenerativeAI;


/**
 * Download file from URL (with robust error handling)
 */
async function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (response) => {
      // 1. Handle HTTP error codes
      if (response.statusCode !== 200) {
        // Must destroy the response to free up resources
        response.destroy();
        reject(new Error(`Failed to download file: ${response.statusCode} - URL: ${url}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));

      // 2. Handle stream errors (less critical, but good practice)
      response.on('error', (err) => {
        console.error('Download response stream error:', err);
        reject(new Error(`Download stream error: ${err.message}`));
      });
    });

    // 3. CRITICAL: Handle request-level network errors (DNS, timeout, connection reset)
    req.on('error', (err) => {
      console.error('Download request error:', err);
      reject(new Error(`Download connection error: ${err.message}`));
    });

    // Set a timeout for the request, essential in cloud functions
    req.setTimeout(60000, () => { // 60 second timeout
      req.destroy();
      reject(new Error('Download timeout exceeded (60 seconds)'));
    });
  });
}

/**
 * Analyze divorce agreement document with Gemini using Files API
 */
export const analyzeAgreement = functions
  .runWith({
    secrets: ['GEMINI_API_KEY'],
    timeoutSeconds: 300,
    memory: '1GB'})
  .https.onCall(async (data, context) => {
  // Initialize Gemini API with secret
  genAI = new GoogleGenerativeAI(geminiApiKey.value());

  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { fileUrl, userId } = data;

  if (!fileUrl || !userId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters: fileUrl and userId');
  }

  // Verify user is requesting their own document
  if (context.auth.uid !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'User can only analyze their own documents');
  }

  // No file tracking needed with inline data
  const startTime = Date.now();

  try {
    console.log(`Analyzing agreement for user: ${userId}`);
    console.log(`File URL: ${fileUrl}`);

    // Download the PDF file
    const fileBuffer = await downloadFile(fileUrl);

    if (fileBuffer.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'The downloaded file is empty (zero bytes). Please check the file URL and contents.');
    }


    const fileSizeMB = fileBuffer.length / (1024 * 1024);
    console.log(`Downloaded file: ${fileSizeMB.toFixed(2)} MB`);

    // Check file size
    if (fileBuffer.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Downloaded file is empty');
    }

    if (fileBuffer.length > 50 * 1024 * 1024) {
      throw new functions.https.HttpsError('invalid-argument', 'File size exceeds 50MB limit');
    }

    // Validate PDF header (should start with %PDF)
    const pdfHeader = fileBuffer.slice(0, 5).toString('ascii');
    if (!pdfHeader.startsWith('%PDF')) {
      console.error(`Invalid PDF header: ${pdfHeader}`);
      throw new functions.https.HttpsError('invalid-argument', 'File is not a valid PDF document');
    }
    console.log(`Valid PDF header detected: ${pdfHeader}`);

    // Initialize Gemini model with structured schema
    const model = genAI.getGenerativeModel({
      model: agreementAnalyzerConfig.model,
      generationConfig: {
        responseSchema: extractionSchemaGemini as any,
        responseMimeType: agreementAnalyzerConfig.responseMimeType,
        temperature: agreementAnalyzerConfig.temperature,
      },
    });

    // Generate content using inline data (more reliable than Files API)
    console.log('Sending to Gemini API with inline data...');
    const result = await model.generateContent([
      {
        text: `${agreementAnalyzerSystemPrompt}\n\n${agreementAnalyzerUserPrompt}`,
      },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: fileBuffer.toString('base64'),
        },
      },
    ]);

    const response = result.response;
    const text = response.text();
    console.log('Received response from Gemini');

    // Parse JSON response
    const jsonData = JSON.parse(text);

    // Validate with Zod schema
    const parsedData = agreementDataSchema.parse(jsonData);

    // Log the actual response for debugging
    console.log('Parsed data structure:', JSON.stringify(parsedData).substring(0, 500));

    // No file cleanup needed with inline data

    // Ensure extractionMetadata exists with defaults
    if (!parsedData.extractionMetadata) {
      console.warn('extractionMetadata missing, using defaults');
      parsedData.extractionMetadata = {
        confidenceScore: 70,
        warnings: [],
        fieldsExtracted: [],
        fieldsNotFound: [],
      };
    }

    const processingTimeMs = Date.now() - startTime;
    console.log(`Analysis completed in ${processingTimeMs}ms`);

    // Save to Firestore
    await db.collection('agreements').doc(userId).set({
      parsedData,
      originalDocumentUrl: fileUrl,
      analysisMetadata: {
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        geminiModel: agreementAnalyzerConfig.model,
        confidenceScore: parsedData.extractionMetadata?.confidenceScore || 70,
        processingTimeMs,
      },
      status: 'pending', // Will be 'verified' after user confirms
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log('Saved to Firestore successfully');

    // Return parsed data to client
    return {
      success: true,
      data: parsedData,
      processingTimeMs,
    };
  } catch (error: any) {
    console.error('Error analyzing agreement:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('Error breakdown:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      name: error.name,
    });

    // No file cleanup needed with inline data

    // Log error to Firestore for debugging
    await db.collection('analysis_errors').add({
      userId,
      fileUrl,
      error: error.message,
      errorName: error.name,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Return user-friendly error based on error type
    const errorMessage = error.message || '';
    const errorName = error.name || '';

    // File upload/processing errors
    if (errorMessage.includes('File upload failed')) {
      throw new functions.https.HttpsError('internal', 'Failed to upload document to processing service. Please try again.');
    }

    if (errorMessage.includes('File failed to process')) {
      throw new functions.https.HttpsError('internal', 'Document failed to process. Please ensure it\'s a valid PDF and try again.');
    }

    if (errorMessage.includes('The document has no pages')) {
      throw new functions.https.HttpsError('invalid-argument', 'The uploaded document appears to be empty or corrupted. Please check the file and try again.');
    }

    // API key and authentication errors
    if (errorMessage.includes('API key') || error.status === 401 || error.status === 403) {
      throw new functions.https.HttpsError('internal', 'Authentication error with document analysis service. Please contact support.');
    }

    // Quota/rate limit errors
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || error.status === 429) {
      throw new functions.https.HttpsError('resource-exhausted', 'Too many requests. Please wait a moment and try again.');
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || error.status === 408 || error.status === 504) {
      throw new functions.https.HttpsError('deadline-exceeded', 'Analysis is taking too long. Please try with a smaller document or try again later.');
    }
    // Model not found errors
    if (errorMessage.includes('not found') && errorMessage.includes('model')) {

      throw new functions.https.HttpsError('internal', 'Document analysis model unavailable. Please contact support.');
    }

    // File download errors
    if (errorMessage.includes('Failed to download file')) {
      throw new functions.https.HttpsError('invalid-argument', 'Unable to access the document. Please ensure the file exists and try again.');
    }

    // JSON parsing errors
    if (errorName === 'SyntaxError' && errorMessage.includes('JSON')) {
      throw new functions.https.HttpsError('internal', 'Failed to parse analysis results. Please try again.');
    }

    // Generic bad request
    if (error.status === 400) {
      throw new functions.https.HttpsError('invalid-argument', `Invalid request: ${errorMessage.split(':').pop() || 'Please check your document and try again.'}`);
    }

    // Default error
    throw new functions.https.HttpsError(
      'internal',
      'An unexpected error occurred while analyzing your document. Please try again or contact support if the problem persists.'
    );
  }
});
