'use client';

import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import type { Job, JobStatus } from '@/types';

interface JobStatusProps {
  job: Job;
}

interface ProcessingStep {
  key: string;
  label: string;
  progress: number;
}

const STEPS: ProcessingStep[] = [
  { key: 'ingest', label: 'Download Video', progress: 20 },
  { key: 'transcribe', label: 'Transcribe Audio', progress: 40 },
  { key: 'translate', label: 'Translate Text', progress: 60 },
  { key: 'subtitles', label: 'Generate Subtitles', progress: 70 },
  { key: 'voiceover', label: 'Generate Voiceover', progress: 90 },
];

export default function JobStatus({ job }: JobStatusProps) {
  const getCurrentStep = () => {
    if (job.status === 'done') return STEPS.length;
    if (job.status === 'error' || job.status === 'queued') return 0;
    
    for (let i = STEPS.length - 1; i >= 0; i--) {
      if (job.progress >= STEPS[i].progress) {
        return i + 1;
      }
    }
    return 0;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {job.status === 'done' && <CheckCircle className="w-6 h-6 text-green-600" />}
          {job.status === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
          {job.status === 'running' && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
          {job.status === 'queued' && <Clock className="w-6 h-6 text-gray-600" />}
          
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {job.status === 'done' && 'Completed'}
              {job.status === 'error' && 'Failed'}
              {job.status === 'running' && 'Processing'}
              {job.status === 'queued' && 'Queued'}
            </p>
            {job.status === 'running' && (
              <p className="text-sm text-gray-500">
                Step {currentStep} of {job.enableDub ? STEPS.length : STEPS.length - 1}
              </p>
            )}
          </div>
        </div>

        {job.status === 'running' && (
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{job.progress}%</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {job.status === 'running' && (
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {job.status === 'error' && job.errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">Error:</p>
          <p className="text-sm text-red-600 mt-1">{job.errorMessage}</p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.filter((step) => job.enableDub || step.key !== 'voiceover').map((step, idx) => {
          const isComplete = currentStep > idx || job.status === 'done';
          const isCurrent = currentStep === idx && job.status === 'running';
          
          return (
            <div key={step.key} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isComplete ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <span className="text-sm text-gray-600">{idx + 1}</span>
                )}
              </div>
              <p className={`text-sm font-medium ${
                isComplete ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-xs text-gray-500">Target Language</p>
          <p className="text-sm font-medium text-gray-900">{job.targetLang.toUpperCase()}</p>
        </div>
        {job.originalLang && (
          <div>
            <p className="text-xs text-gray-500">Original Language</p>
            <p className="text-sm font-medium text-gray-900">{job.originalLang.toUpperCase()}</p>
          </div>
        )}
        {job.videoDuration && (
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="text-sm font-medium text-gray-900">
              {Math.floor(job.videoDuration / 60)}:{(job.videoDuration % 60).toString().padStart(2, '0')}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-500">Voiceover</p>
          <p className="text-sm font-medium text-gray-900">{job.enableDub ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>
    </div>
  );
}

