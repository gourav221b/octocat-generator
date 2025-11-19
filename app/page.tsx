'use client';

import { useState, useRef, useEffect } from 'react';

interface HistoryItem {
  id: string;
  original: string;
  generated: string;
  timestamp: number;
}

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop',
];

const STORAGE_KEYS = {
  API_KEY: 'gemini_api_key',
  RATE_LIMIT: 'octocat_rate_limit',
} as const;

const MAX_HISTORY_ITEMS = 10;
const RATE_LIMIT_RESET_DURATION_MS = 3600000; // 1 hour

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ count: number; lastReset: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load API key and rate limit info from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    }

    const savedRateLimit = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT);
    if (savedRateLimit) {
      try {
        const parsed = JSON.parse(savedRateLimit);
        // Reset if more than 1 hour old
        if (Date.now() - parsed.lastReset < RATE_LIMIT_RESET_DURATION_MS) {
          setRateLimitInfo(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT);
          setRateLimitInfo(null); // Fix: Reset state when expired
        }
      } catch (err) {
        console.error('Failed to load rate limit info:', err);
      }
    }
  }, []);

  // Handle Escape key to close history modal
  useEffect(() => {
    if (!showHistory) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowHistory(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showHistory]);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
      setShowApiKeyInput(false);
      setError(null);
    } else {
      setError('Please enter a valid API key');
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    setApiKey('');
    setShowApiKeyInput(true);
  };

  const loadSampleImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setError('Failed to load sample image');
      console.error('Sample image error:', err);
    }
  };

  const saveToHistory = (original: string, generated: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      original,
      generated,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS));
  };

  const loadFromHistory = (item: HistoryItem) => {
    setImage(item.original);
    setGeneratedImage(item.generated);
    setShowHistory(false);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const trackRateLimit = (errorMessage: string) => {
    const lowerError = errorMessage.toLowerCase();
    if (lowerError.includes('quota') ||
        lowerError.includes('rate limit') ||
        lowerError.includes('429') ||
        lowerError.includes('resource exhausted')) {
      const now = Date.now();
      const info = rateLimitInfo || { count: 0, lastReset: now };
      const updated = {
        count: info.count + 1,
        lastReset: info.lastReset
      };
      setRateLimitInfo(updated);
      localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(updated));
    }
  };

  const dismissRateLimit = () => {
    setRateLimitInfo(null);
    localStorage.removeItem(STORAGE_KEYS.RATE_LIMIT);
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const generateOctocat = async () => {
    if (!image) return;

    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key first');
      setShowApiKeyInput(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Convert base64 to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'photo.jpg');
      formData.append('apiKey', apiKey.trim());

      // Call API
      const apiResponse = await fetch('/api/generate-octocat', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to generate Octocat');
      }

      const data = await apiResponse.json();
      setGeneratedImage(data.imageUrl);

      // Save to history
      if (image) {
        saveToHistory(image, data.imageUrl);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      trackRateLimit(errorMsg);
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'my-octocat.png';
      link.click();
    }
  };

  const reset = () => {
    setImage(null);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Rate Limit Banner */}
      {rateLimitInfo && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>
                API rate limit reached ({rateLimitInfo.count} {rateLimitInfo.count === 1 ? 'error' : 'errors'}). Please try again later or check your quota.
              </span>
            </div>
            <button
              onClick={dismissRateLimit}
              className="text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
              aria-label="Dismiss rate limit warning"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Octocat Generator
          </h1>
          {!showApiKeyInput && (
            <div className="flex items-center gap-3">
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  aria-expanded={showHistory}
                  aria-label={`${showHistory ? 'Hide' : 'Show'} generation history`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History ({history.length})
                </button>
              )}
              <button
                onClick={clearApiKey}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Change API Key
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* History Modal */}
        {showHistory && (
          <div
            role="region"
            aria-labelledby="history-title"
            className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="history-title" className="text-lg font-semibold text-gray-900 dark:text-white">Generation History</h2>
              <div className="flex gap-2">
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item) => (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => loadFromHistory(item)}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-[#0969da] dark:hover:border-[#0969da] transition-colors w-full"
                  >
                    <img
                      src={item.generated}
                      alt="Generated Octocat"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(item.id);
                    }}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    aria-label="Delete this item"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Key Section */}
        {showApiKeyInput ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Get Started
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your Gemini API key to transform photos into Octocats
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0969da] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get your free API key from{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0969da] dark:text-[#58a6ff] underline hover:text-[#0860ca] dark:hover:text-[#79c0ff]"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>
              <button
                onClick={saveApiKey}
                className="w-full bg-[#2da44e] hover:bg-[#2c974b] text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full">
            {/* Left Column - Info & Preview */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Transform Your Photo into a GitHub Octocat
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Upload your image and let our AI create a personalized GitHub Octocat avatar. Perfect for your GitHub profile!
                </p>
              </div>

              {/* Generated Result */}
              {generatedImage && (
                <div className="space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Original</h3>
                      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <img
                          src={image!}
                          alt="Original photo"
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Octocat</h3>
                      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <img
                          src={generatedImage}
                          alt="Generated Octocat"
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadImage}
                      className="flex-1 bg-[#2da44e] hover:bg-[#2c974b] text-white font-medium py-3 px-5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={reset}
                      className="px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-colors"
                    >
                      Create Another
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview (when captured/uploaded but not generated) */}
              {image && !generatedImage && (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <img
                      src={image}
                      alt="Your photo"
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={generateOctocat}
                      disabled={isGenerating}
                      className="flex-1 bg-[#2da44e] hover:bg-[#2c974b] text-white font-medium py-3 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating Your Octocat...
                        </span>
                      ) : (
                        'Generate Octocat'
                      )}
                    </button>
                    <button
                      onClick={reset}
                      className="px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Upload Area */}
            <div className="lg:sticky lg:top-8">
              {!image && (
                <div className="space-y-4">
                  {/* Drag and Drop Area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors bg-gray-50 dark:bg-gray-800/50"
                  >
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      Drag and drop images here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      or click to select files
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Sample Images */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Try a sample image:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {SAMPLE_IMAGES.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => loadSampleImage(url)}
                          aria-label={`Use sample image ${index + 1}`}
                          className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-[#0969da] dark:hover:border-[#0969da] transition-all hover:scale-105"
                        >
                          <img
                            src={url}
                            alt={`Sample ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Powered by Google Gemini AI • All processing happens securely</p>
        </div>
      </div>
    </div>
  );
}
