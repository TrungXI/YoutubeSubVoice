'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Youtube } from 'lucide-react';
import type { Language, VoiceProfile, CreateJobRequest } from '@/types';

interface JobFormProps {
  onJobCreated?: () => void;
}

const LANGUAGES: Language[] = [
  { code: 'vi', name: 'Vietnamese' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'th', name: 'Thai' },
];

const VOICE_PROFILES: VoiceProfile[] = [
  { id: 'female_soft', name: 'Female (Soft)' },
  { id: 'male_warm', name: 'Male (Warm)' },
];

export default function JobForm({ onJobCreated }: JobFormProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [targetLang, setTargetLang] = useState('vi');
  const [enableDub, setEnableDub] = useState(false);
  const [voiceId, setVoiceId] = useState('female_soft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestBody: CreateJobRequest = {
        youtubeUrl: url,
        targetLang,
        enableDub,
        voiceId: enableDub ? voiceId : undefined,
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create job');
      }

      const job = await response.json();
      setUrl('');
      onJobCreated?.();
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center mb-6">
        <Youtube className="w-8 h-8 text-red-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* YouTube URL */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Target Language */}
        <div>
          <label htmlFor="targetLang" className="block text-sm font-medium text-gray-700 mb-2">
            Target Language
          </label>
          <select
            id="targetLang"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Enable Voiceover */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="enableDub"
            checked={enableDub}
            onChange={(e) => setEnableDub(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <label htmlFor="enableDub" className="text-sm font-medium text-gray-700">
              Enable AI Voiceover (Pro)
            </label>
            <p className="text-xs text-gray-500">
              Generate AI voiceover with voice mixing and time-stretching
            </p>
          </div>
        </div>

        {/* Voice Profile (if enabled) */}
        {enableDub && (
          <div>
            <label htmlFor="voiceId" className="block text-sm font-medium text-gray-700 mb-2">
              Voice Profile
            </label>
            <select
              id="voiceId"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {VOICE_PROFILES.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !url}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
              Processing...
            </>
          ) : (
            'Start Processing'
          )}
        </button>
      </form>
    </div>
  );
}

