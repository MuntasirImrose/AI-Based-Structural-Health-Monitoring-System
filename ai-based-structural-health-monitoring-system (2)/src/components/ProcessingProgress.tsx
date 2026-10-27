import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProcessingProgressProps {
  currentStep: number; // 0 to 5
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ currentStep }) => {
  const steps = [
    { title: 'Analyzing image...', detail: 'Image uploaded successfully. Inspecting dimensions & illumination.' },
    { title: 'Enhancing image...', detail: 'Applying bilateral noise reduction & adaptive contrast (CLAHE).' },
    { title: 'Detecting crack regions...', detail: 'Extracting directional edge ridges & morphological fissures.' },
    { title: 'Measuring crack characteristics...', detail: 'Calculating pixel length, width, density, and orientation.' },
    { title: 'Generating recommendations...', detail: 'Synthesizing structural health condition & risk guidance.' },
  ];

  return (
    <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span>AI & Computer Vision Processing Pipeline</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Passing image through multi-stage segmentation, measurement, and structural health estimation
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          Step {Math.min(steps.length, currentStep + 1)} of {steps.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-150 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.title}
              className={`p-3 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'border-blue-500 bg-blue-50/70 shadow-sm'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/40 text-slate-700'
                  : 'border-slate-200 bg-slate-50/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-mono text-slate-400 shrink-0">
                    {idx + 1}
                  </span>
                )}
                <span
                  className={`text-xs font-semibold truncate ${
                    isCurrent ? 'text-blue-900' : isDone ? 'text-emerald-900' : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                {step.detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
