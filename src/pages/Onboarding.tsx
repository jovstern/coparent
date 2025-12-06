import { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { storage, db, functions } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

type OnboardingStep = 'upload' | 'analyzing';

export default function Onboarding() {
  const [step, setStep] = useState<OnboardingStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(file);
    } else {
      alert('Please upload a PDF or DOCX file');
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setStep('analyzing');

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `agreements/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Analyze with Gemini AI (saves to Firestore automatically)
      setAnalyzing(true);
      await analyzeDocument(downloadURL);
      setAnalyzing(false);

      // Mark onboarding as complete
      await updateDoc(doc(db, 'users', user.uid), {
        hasCompletedOnboarding: true,
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload and analyze document');
      setStep('upload');
    } finally {
      setUploading(false);
    }
  };

  const analyzeDocument = async (fileUrl: string): Promise<void> => {
    try {
      // Call the Cloud Function (saves to Firestore automatically)
      const analyzeAgreement = httpsCallable(functions, 'analyzeAgreement');
      await analyzeAgreement({
        fileUrl,
        userId: user?.uid,
      });
    } catch (error) {
      debugger
      console.error('Analysis error:', error);
      throw new Error('Failed to analyze document. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Let's organize your co-parenting journey
          </h1>
          <p className="text-zinc-600">
            Upload your divorce agreement or court ruling, and we'll extract the important details
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-primary-600' : 'text-secondary-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-primary-100' : 'bg-secondary-100'}`}>
                {step !== 'upload' ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="font-medium">Upload</span>
            </div>

            <div className="w-16 h-0.5 bg-zinc-300" />

            <div className={`flex items-center gap-2 ${step === 'analyzing' ? 'text-primary-600' : 'text-zinc-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'analyzing' ? 'bg-primary-100' : 'bg-zinc-100'}`}>
                {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : '2'}
              </div>
              <span className="font-medium">Analyze</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 'upload' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-zinc-800 mb-6">Upload Your Agreement</h2>

            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive ? 'border-primary-500 bg-primary-50' : 'border-zinc-300 hover:border-primary-400'
                }`}
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-zinc-400" />
                <p className="text-lg text-zinc-700 mb-2">Drag & drop your document here</p>
                <p className="text-sm text-zinc-500 mb-4">or</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="px-6 py-2 bg-primary-600 text-white rounded-md cursor-pointer hover:bg-primary-700 transition-colors inline-block">
                    Browse Files
                  </span>
                </label>
                <p className="text-xs text-zinc-500 mt-4">Supports PDF and DOCX files</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg">
                  <FileText className="w-8 h-8 text-primary-600" />
                  <div className="flex-1">
                    <p className="font-medium text-zinc-800">{file.name}</p>
                    <p className="text-sm text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full py-3 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Analyze Document'}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'analyzing' && (
          <div className="bg-white rounded-lg shadow-md p-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary-600 animate-spin" />
              <h2 className="text-2xl font-semibold text-zinc-800 mb-4">Analyzing your agreement...</h2>
              <p className="text-zinc-600 mb-8">
                Our AI is scanning your document for key information
              </p>

              <div className="space-y-3 max-w-md mx-auto text-left">
                <div className="flex items-center gap-3 text-zinc-700">
                  <CheckCircle className="w-5 h-5 text-secondary-500" />
                  <span>Scanning for child support details</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-700">
                  <CheckCircle className="w-5 h-5 text-secondary-500" />
                  <span>Identifying custody schedule</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-700">
                  <CheckCircle className="w-5 h-5 text-secondary-500" />
                  <span>Extracting expense split ratios</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-700">
                  {analyzing ? (
                    <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-secondary-500" />
                  )}
                  <span>Finding holiday schedules</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
