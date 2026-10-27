import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  AlertTriangle,
  Play,
  CheckCircle2,
  Cpu,
  ShieldAlert,
  Building2,
  Camera,
  ClipboardPaste,
  Sparkles
} from 'lucide-react';
import { DemoSample, getDemoSamples } from '../services/demoSamples';
import { CameraCaptureModal } from './CameraCaptureModal';

interface UploadSectionProps {
  onImageSelected: (dataUrl: string, fileName: string, context?: Partial<DemoSample>) => void;
  isProcessing: boolean;
  qualityWarning?: string | null;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onImageSelected,
  isProcessing,
  qualityWarning,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [pastedStatus, setPastedStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const demoSamples = getDemoSamples();

  // Listen for Clipboard Paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isProcessing) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setPastedStatus('Pasted image detected from clipboard...');
            setTimeout(() => setPastedStatus(null), 3000);
            validateAndProcessFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isProcessing]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateAndProcessFile = (file: File) => {
    setUploadError(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP, BMP.');
      return;
    }

    if (file.size === 0) {
      setUploadError('Uploaded file is empty. Please choose a valid image.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Image file is very large (>25MB). Please select a photo below 25MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setUploadError('Failed to read image data.');
        return;
      }
      onImageSelected(dataUrl, file.name);
    };
    reader.onerror = () => {
      setUploadError('Error reading file. The image may be corrupted.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleCameraCaptured = (dataUrl: string, fileName: string) => {
    onImageSelected(dataUrl, fileName);
  };

  const handleDemoClick = (sample: DemoSample) => {
    setUploadError(null);
    const dataUrl = sample.generateDataUrl();
    onImageSelected(dataUrl, `${sample.id}.png`, sample);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            1. Capture or Upload Crack Image
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Use live camera feed or upload structural photos of buildings, bridges, pillars, beams, or road surfaces
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800 font-medium text-[11px]">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Instant CV Acceleration (&lt;0.5s)
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Ridge & Edge Detector Ready
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Dual Primary Action Tiles: Live Camera & Photo Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Camera Option */}
          <div
            onClick={() => !isProcessing && setIsCameraOpen(true)}
            className="p-5 rounded-xl border-2 border-slate-200 hover:border-blue-500 bg-gradient-to-br from-blue-50/50 via-white to-slate-50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Live Stream
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Live Camera Capture
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Open webcam or device camera with real-time alignment reticle, surface grid, and instant snapshot capture.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                <span>Launch Camera Viewfinder</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  mobileCameraInputRef.current?.click();
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline md:hidden"
              >
                Direct Device Camera
              </button>
            </div>
          </div>

          {/* Photo Upload Option */}
          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className="p-5 rounded-xl border-2 border-slate-200 hover:border-indigo-500 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <FileImage className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Local Files
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Upload Photo from Device
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Select high-resolution inspection photos from your computer, phone, or drag and drop images directly.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                <span>Browse File Explorer</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">JPG • PNG • WEBP</span>
            </div>
          </div>
        </div>

        {/* Drag & Drop Dropzone + Clipboard Paste Area */}
        <div
          id="image-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/70 scale-[1.005]'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          } ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp,.bmp"
            className="hidden"
            id="shm-file-input"
          />
          {/* Mobile native camera capture input */}
          <input
            type="file"
            ref={mobileCameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
            id="shm-mobile-camera-input"
          />

          <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Drag & drop crack photo, or press <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-mono font-bold">Ctrl+V</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-mono font-bold">Cmd+V</kbd> to paste
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Maximum file size: 25 MB • High-contrast macro or surface photos recommended
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCameraOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Open Live Camera</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <FileImage className="w-4 h-4" />
                <span>Browse Photos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {pastedStatus && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pastedStatus}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {qualityWarning && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{qualityWarning}</span>
          </div>
        )}

        {/* Demo Mode Presets */}
        <div className="border-t border-slate-200 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Mode: Try Sample Structural Crack Scenarios</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Test full computer vision pipeline without uploading local files
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {demoSamples.map((sample) => (
              <button
                key={sample.id}
                id={`demo-sample-${sample.id}`}
                onClick={() => handleDemoClick(sample)}
                disabled={isProcessing}
                className="group relative p-3 text-left rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/80 hover:bg-blue-50/40 transition-all flex flex-col justify-between disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-800 group-hover:text-blue-600 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                      {sample.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        sample.expectedSeverity.includes('Critical') || sample.expectedSeverity.includes('High')
                          ? 'bg-red-100 text-red-700'
                          : sample.expectedSeverity.includes('Moderate')
                          ? 'bg-amber-100 text-amber-700'
                          : sample.expectedSeverity.includes('Normal')
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {sample.expectedSeverity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{sample.subtitle}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-blue-600 font-medium">
                  <span>Load Sample</span>
                  <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCaptured}
      />
    </section>
  );
};

