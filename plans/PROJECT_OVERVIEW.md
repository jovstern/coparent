# CoParent - Project Overview

## Executive Summary

CoParent is a full-stack web application that helps divorced/separated parents manage custody schedules, financial obligations, and shared documents. The app uses AI (Google Gemini) to automatically parse divorce agreements and extract structured data, eliminating manual data entry.

**Tech Stack**: React + TypeScript + Firebase + Google Gemini AI

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  - Auth, Dashboard, Calendar, Wallet, Vault, Settings           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                       Firebase Services                          │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌────────────────┐  │
│  │   Auth   │  │ Firestore│  │ Storage │  │ Cloud Functions│  │
│  └──────────┘  └──────────┘  └─────────┘  └────────────────┘  │
└────────────────────────────────────────────────────────────────┘
                     │
                     ↓ (analyzeAgreement function)
┌─────────────────────────────────────────────────────────────────┐
│                      Google Gemini API                           │
│              AI Document Parsing & Extraction                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
coparent/
├── src/                      # React frontend
│   ├── pages/               # Route pages (Dashboard, Calendar, Wallet, etc.)
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom hooks (useAuth)
│   └── lib/                 # Firebase config
│
├── functions/               # Cloud Functions (Node.js)
│   └── src/
│       ├── analyzeAgreement.ts    # Main AI parsing function
│       ├── parseAgreement.ts      # Storage trigger
│       └── notifications.ts       # Notification handlers
│
├── schemas/                 # Zod validation schemas
│   ├── agreement.schema.ts  # Agreement data structure
│   ├── gemini-schema.ts     # Gemini API response format
│   ├── user.schema.ts       # User types
│   ├── financial.schema.ts  # Expenses, balances
│   └── schedule.schema.ts   # Custody schedules
│
├── agents/                  # AI agent configurations
│   ├── agreement-analyzer.ts # Prompts & config for Gemini
│   └── README.md            # Agent documentation
│
├── types/                   # Generated TypeScript types
│   ├── agreement.types.ts   # Mirrored from schemas
│   ├── user.types.ts
│   └── financial.types.ts
│
├── firebase.json            # Firebase configuration
├── firestore.rules          # Security rules
├── storage.rules            # Storage security
└── firestore.indexes.json   # Query indexes
```

---

## The Core Feature: AI Agreement Analysis

### The Problem
Parents have legal agreements (PDFs) containing custody schedules, child support amounts, expense splits, holiday arrangements, etc. Manually entering this data is time-consuming and error-prone.

### The Solution
Upload a PDF → AI extracts structured data → Auto-populate app

### How It Works: The `analyzeAgreement` Function

**Location**: `functions/src/analyzeAgreement.ts`

#### Step-by-Step Flow

```
1. User uploads PDF in Onboarding page
   ↓
2. Frontend uploads to Firebase Storage (agreements/{userId}/{fileName})
   ↓
3. Frontend calls Cloud Function: analyzeAgreement(fileUrl, userId)
   ↓
4. Cloud Function downloads PDF from Storage
   ↓
5. Validate PDF (check %PDF header, file size, not empty)
   ↓
6. Send to Google Gemini API with:
   - Base64-encoded PDF
   - System prompt (instructions for extraction)
   - Response schema (what JSON structure to return)
   ↓
7. Gemini returns JSON matching agreementDataSchema
   ↓
8. Validate response with Zod schema
   ↓
9. Save to Firestore: agreements/{userId}
   ↓
10. Return parsed data to frontend
```

#### Key Components

**1. File Download** (`downloadFile` function):
- Uses native Node.js https/http
- 60-second timeout
- Error handling for network issues
- Returns Buffer for processing

**2. PDF Validation**:
```typescript
// Check file not empty
if (fileBuffer.length === 0) throw Error

// Verify PDF header
const pdfHeader = fileBuffer.slice(0, 5).toString('ascii');
if (!pdfHeader.startsWith('%PDF')) throw Error
```

**3. Gemini API Call**:
```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseSchema: extractionSchemaGemini,  // What to extract
    responseMimeType: 'application/json',
    temperature: 0.0,  // Deterministic output
  },
});

const result = await model.generateContent([
  { text: systemPrompt + userPrompt },      // Instructions
  { inlineData: {                           // PDF as base64
      mimeType: 'application/pdf',
      data: fileBuffer.toString('base64'),
    }
  }
]);
```

**4. Response Validation**:
```typescript
const jsonData = JSON.parse(result.response.text());
const parsedData = agreementDataSchema.parse(jsonData);  // Zod validation
```

**5. Save to Firestore**:
```typescript
await db.collection('agreements').doc(userId).set({
  parsedData,                    // Structured agreement data
  originalDocumentUrl: fileUrl,  // Link to PDF in Storage
  analysisMetadata: {
    analyzedAt: serverTimestamp(),
    geminiModel: 'gemini-2.5-flash',
    confidenceScore: parsedData.extractionMetadata.confidenceScore,
    processingTimeMs,
  },
  status: 'pending',             // User needs to verify
  createdAt: serverTimestamp(),
});
```

#### Error Handling

The function has comprehensive error handling for:

- **Empty files**: "Downloaded file is empty"
- **Invalid PDFs**: "File is not a valid PDF document"
- **Network errors**: "Unable to access the document"
- **API errors**: Rate limits (429), timeouts (408/504), auth errors (401/403)
- **Parsing errors**: Invalid JSON response from Gemini

All errors are:
1. Logged to `analysis_errors` collection in Firestore
2. Converted to user-friendly messages
3. Returned as `HttpsError` with appropriate codes

---

## The AI Agent System

**Location**: `agents/agreement-analyzer.ts`

This separates AI configuration from business logic.

### System Prompt
Instructs Gemini on its role and extraction rules:
- Be precise, use null for unclear data
- Support Hebrew and English
- Format dates as ISO (YYYY-MM-DD)
- Ensure expense splits add to 100%
- Calculate confidence score (0-100)

### User Prompt
Simple task instruction: "Analyze the attached document and extract all information"

### Configuration
```typescript
{
  model: 'gemini-2.5-flash',
  temperature: 0.0,              // Deterministic for data extraction
  responseMimeType: 'application/json'
}
```

**Why Separate?**
- Easy to update prompts without touching function code
- Can reuse agent config across multiple functions
- Version control for prompt engineering
- Can A/B test different prompts

---

## Schema System: The Source of Truth

### Two Schema Formats

#### 1. Zod Schemas (`schemas/agreement.schema.ts`)
**Purpose**: Validate Gemini's response, generate TypeScript types

```typescript
export const childSupportSchema = z.object({
  amount: z.number().nullable().describe('Monthly amount'),
  currency: z.string().describe('Currency code (ILS, USD, EUR)'),
  frequency: z.enum(['monthly', 'weekly', 'biweekly', 'annual']),
  isCPILinked: z.boolean().describe('Linked to CPI'),
  startDate: z.string().nullable().describe('ISO format'),
  notes: z.string().nullable(),
});
```

**Used by**:
- Cloud Functions (validation)
- Frontend (type checking)
- Type generation (`types/*.types.ts`)

#### 2. Gemini Schema (`schemas/gemini-schema.ts`)
**Purpose**: Tell Gemini what JSON structure to generate

```typescript
export const extractionSchemaGemini = {
  type: SchemaType.OBJECT,
  properties: {
    childSupport: {
      type: SchemaType.OBJECT,
      description: 'Financial child support obligations...',
      properties: {
        amount: { type: SchemaType.NUMBER, nullable: true },
        currency: { type: SchemaType.STRING },
        frequency: {
          type: SchemaType.STRING,
          enum: ['monthly', 'weekly', 'biweekly', 'annual']
        },
        // ...
      },
      required: ['currency', 'frequency', 'isCPILinked'],
    },
    // ...
  }
};
```

**Used by**:
- Gemini API (responseSchema parameter)
- Instructs AI on output format

### Why Both?

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ Gemini API   │  JSON   │ Zod Schema   │  Types  │  App Code    │
│              │ ──────> │              │ ──────> │              │
│ (generates)  │         │ (validates)  │         │ (consumes)   │
└──────────────┘         └──────────────┘         └──────────────┘
      ↑
      │
      │ gemini-schema.ts
      │ (instructs what to generate)
```

**They serve different purposes**:
- **Gemini schema** → INPUT to AI (what to generate)
- **Zod schema** → OUTPUT validation (what we received)

**Maintenance**: Zod schemas are source of truth. When updating:
1. Update Zod schema with descriptions
2. Manually sync Gemini schema to match
3. Rebuild to regenerate types

---

## Data Flow Example: Uploading an Agreement

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: Onboarding.tsx                                         │
│                                                                  │
│ 1. User drops PDF file                                           │
│ 2. Upload to Storage: agreements/{userId}/divorce-agreement.pdf  │
│ 3. Get download URL                                              │
│ 4. Call analyzeAgreement({ fileUrl, userId })                   │
│ 5. Show loading spinner                                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLOUD FUNCTION: analyzeAgreement                                 │
│                                                                  │
│ 1. Authenticate user (context.auth.uid === userId)              │
│ 2. Download PDF from Storage URL                                 │
│ 3. Validate: size < 50MB, starts with %PDF, not empty           │
│ 4. Load agent config (prompt + model settings)                   │
│ 5. Initialize Gemini with extractionSchemaGemini                │
│ 6. Send: systemPrompt + PDF (base64)                            │
│ 7. Receive: JSON response                                        │
│ 8. Parse & validate with agreementDataSchema (Zod)              │
│ 9. Save to Firestore: agreements/{userId}                       │
│    - parsedData (full structure)                                 │
│    - originalDocumentUrl                                         │
│    - analysisMetadata (model, confidence, timing)                │
│    - status: 'pending'                                           │
│ 10. Return: { success: true, data: parsedData }                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND: Onboarding.tsx                                         │
│                                                                  │
│ 1. Receive parsed data                                           │
│ 2. Show confidence score & warnings                              │
│ 3. Display extracted info for user review                        │
│ 4. User confirms → update status to 'verified'                  │
│ 5. Redirect to dashboard                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Firestore Data Structure

```
agreements/{userId}/
├── parsedData: {
│   ├── childSupport: { amount, currency, frequency, ... }
│   ├── expenseSplit: { default, medical, education, ... }
│   ├── custodySchedule: { type, cycleDuration, parent1Days, ... }
│   ├── holidays: [{ name, year, assignedTo, ... }]
│   ├── children: [{ firstName, lastName, dateOfBirth, ... }]
│   ├── specialProvisions: string[]
│   └── extractionMetadata: {
│       ├── confidenceScore: 85
│       ├── warnings: ["Date format unclear in section 3"]
│       ├── fieldsExtracted: ["childSupport", "custodySchedule"]
│       └── fieldsNotFound: ["extracurricular expenses"]
│   }
├── originalDocumentUrl: "https://storage.googleapis.com/..."
├── analysisMetadata: {
│   ├── analyzedAt: Timestamp
│   ├── geminiModel: "gemini-2.5-flash"
│   ├── confidenceScore: 85
│   └── processingTimeMs: 3420
├── status: "pending" | "verified"
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

---

## Security Architecture

### Firestore Rules
```javascript
// Users can only access their own agreement
match /agreements/{agreementId} {
  allow read: if request.auth.uid == agreementId ||
                 resource.data.parent1Id == request.auth.uid ||
                 resource.data.parent2Id == request.auth.uid;
  allow write: if request.auth.uid == agreementId;
}
```

### Storage Rules
```javascript
// Only owner can upload to their agreement folder
match /agreements/{userId}/{fileName} {
  allow write: if request.auth.uid == userId;
  allow read: if request.auth != null;
}
```

### Function Authentication
```typescript
// Verify user is requesting their own document
if (!context.auth) {
  throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
}

if (context.auth.uid !== userId) {
  throw new functions.https.HttpsError('permission-denied', 'User can only analyze their own documents');
}
```

---

## Key Features Implementation Status

| Feature | Status | Frontend | Backend | Notes |
|---------|--------|----------|---------|-------|
| AI Agreement Parsing | ✅ Complete | ✅ | ✅ | Full implementation with Gemini |
| User Authentication | ✅ Complete | ✅ | ✅ | Email/password + Google OAuth |
| Dashboard | ✅ Complete | ✅ | ⚠️ | UI complete, using mock data |
| Calendar View | ✅ Complete | ✅ | ⚠️ | UI complete, no Firestore sync |
| Expense Tracking | ✅ Complete | ✅ | ⚠️ | UI complete, mock data |
| Document Vault | ✅ Complete | ✅ | ⚠️ | UI complete, mock data |
| Invite Co-Parent | ⚠️ Partial | ✅ | ❌ | Modal UI, no backend |
| Email Notifications | ❌ Not Started | ❌ | ⚠️ | Functions ready, need email service |
| Google Calendar Sync | ❌ Not Started | ⚠️ | ❌ | Modal UI only |
| CPI-Linked Updates | ⚠️ Partial | ❌ | ⚠️ | Scheduled function, needs CPI API |

---

## Development Workflow

### Making Changes to Agreement Structure

**Scenario**: Add a new field to child support (e.g., `endDate`)

1. **Update Zod Schema** (`schemas/agreement.schema.ts`):
```typescript
export const childSupportSchema = z.object({
  // ... existing fields
  endDate: z.string().nullable().describe('End date in ISO format (YYYY-MM-DD)'),
});
```

2. **Update Gemini Schema** (`schemas/gemini-schema.ts`):
```typescript
childSupport: {
  properties: {
    // ... existing properties
    endDate: {
      type: SchemaType.STRING,
      description: 'End date in ISO format (YYYY-MM-DD)',
      nullable: true,
    },
  }
}
```

3. **Update Type Definitions** (`types/agreement.types.ts`):
```typescript
export type ChildSupport = {
  // ... existing fields
  endDate: string | null;
};
```

4. **Rebuild Functions**:
```bash
cd functions && npm run build
```

5. **Deploy**:
```bash
firebase deploy --only functions:analyzeAgreement
```

6. **Test**:
- Upload a test PDF with end date
- Verify extraction in Firestore
- Check confidence score and warnings

---

## Critical Files Reference

### Must Understand
1. **`functions/src/analyzeAgreement.ts`** - Core AI parsing logic
2. **`schemas/agreement.schema.ts`** - Data structure source of truth
3. **`schemas/gemini-schema.ts`** - AI response format
4. **`agents/agreement-analyzer.ts`** - AI prompts and config
5. **`src/hooks/useAuth.tsx`** - Authentication context
6. **`firestore.rules`** - Security rules
7. **`storage.rules`** - File access rules

### Configuration Files
- **`firebase.json`** - Project configuration
- **`.env`** - API keys and secrets
- **`vite.config.ts`** - Build configuration
- **`firestore.indexes.json`** - Query indexes

---

## Common Development Tasks

### Adding a New Cloud Function
1. Create function in `functions/src/newFunction.ts`
2. Export from `functions/src/index.ts`
3. Add security rules if needed
4. Deploy: `firebase deploy --only functions:newFunction`

### Adding a New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in `src/components/Navigation.tsx`
4. Add `<ProtectedRoute>` if authentication required

### Updating AI Prompts
1. Edit `agents/agreement-analyzer.ts`
2. Rebuild: `cd functions && npm run build`
3. Deploy: `firebase deploy --only functions:analyzeAgreement`
4. Test with sample PDFs

### Debugging Failed Parsing
1. Check `analysis_errors` collection in Firestore
2. Review Cloud Function logs: `firebase functions:log --only analyzeAgreement`
3. Verify PDF is valid (download and open manually)
4. Check Gemini API quota and billing
5. Test with simpler document to isolate issue

---

## Environment Setup

### Required API Keys
1. **Firebase** - Create project at console.firebase.google.com
2. **Google Gemini** - Get key at ai.google.dev
3. **Email Service** (future) - SendGrid or AWS SES

### Local Development
```bash
# Install dependencies
npm install
cd functions && npm install

# Run frontend dev server
npm run dev

# Run functions emulator
firebase emulators:start --only functions,firestore,storage

# Build functions
cd functions && npm run build

# Deploy everything
firebase deploy
```

---

## Troubleshooting Guide

### "The document has no pages" Error
**Cause**: Empty PDF or invalid file
**Fix**: Added validation in `analyzeAgreement.ts`:
- Check file size > 0
- Verify PDF header (%PDF)
- Log file URL for debugging

### Zod Validation Errors
**Cause**: Gemini response doesn't match schema
**Fix**:
- Check `analysis_errors` collection
- Compare actual response to expected schema
- Update schema if legitimate new field
- Improve prompt if Gemini misunderstood

### Authentication Errors
**Cause**: User not signed in or permissions issue
**Fix**:
- Verify Firebase Auth is initialized
- Check Firestore rules allow access
- Ensure `context.auth.uid` matches document owner

---

## Next Steps for Development

### High Priority
1. **Connect UI to Firestore** - Replace mock data with real queries
2. **Implement Invite System** - Token generation and acceptance flow
3. **Email Notifications** - Integrate SendGrid/SES
4. **Error Recovery** - Retry mechanism for failed parses

### Medium Priority
1. **Google Calendar Sync** - OAuth flow and bidirectional sync
2. **Expense Approval Flow** - Notification + approval/dispute
3. **Multi-language Support** - i18n for Hebrew/English
4. **CPI API Integration** - Automatic payment updates

### Low Priority
1. **Mobile App** - React Native version
2. **Export Features** - PDF reports, CSV exports
3. **Analytics Dashboard** - Payment history, trends
4. **Chat/Messaging** - In-app communication between parents

---

## Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **Zod Documentation**: https://zod.dev
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com

---

**Last Updated**: December 2025
**Version**: 1.0
**Maintainer**: Development Team
