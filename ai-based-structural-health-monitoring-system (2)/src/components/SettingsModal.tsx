import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Ruler,
  HelpCircle,
  FileCode,
  Terminal,
  Shield,
  Check,
  Save,
  BookOpen
} from 'lucide-react';

interface SettingsModalProps {
  calibrationMmPerPx: number;
  onUpdateCalibration: (val: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  calibrationMmPerPx,
  onUpdateCalibration,
  isOpen,
  onClose,
}) => {
  const [mmInput, setMmInput] = useState(calibrationMmPerPx.toString());
  const [referenceType, setReferenceType] = useState<'custom' | 'coin' | 'ruler' | 'sticker'>('custom');
  const [activeArchTab, setActiveArchTab] = useState<'python' | 'node'>('node');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (type: 'coin' | 'ruler' | 'sticker') => {
    setReferenceType(type);
    let val = 0.25;
    if (type === 'coin') val = 0.18; // ~24mm coin spanning ~130px
    if (type === 'ruler') val = 0.10; // High res optical ruler
    if (type === 'sticker') val = 0.30; // 50mm target marker
    setMmInput(val.toString());
  };

  const handleSave = () => {
    const parsed = parseFloat(mmInput);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateCalibration(parsed);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">System Calibration & Architecture Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md text-xs font-bold"
          >
            ✕ Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 13: Scale Calibration */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-blue-600" />
                  13. Scale Calibration (Pixel to Millimeter Conversion)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calibrate focal scale so detected pixel dimensions convert accurately into physical metric units.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded">
                Current: {calibrationMmPerPx} mm/px
              </span>
            </div>

            {/* Quick Reference Preset Helpers */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Calibration Helper (Known Reference Object):</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('coin')}
                  className={`p-2 rounded border text-left text-xs transition-all ${
                    referenceType === 'coin'
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">Standard Coin</span>
                  <span className="text-[10px] text-slate-500">~0.18 mm/px (Close-up)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('ruler')}
                  className={`p-2 rounded border text-left text-xs transition-all ${
                    referenceType === 'ruler'
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">Optical Metric Ruler</span>
                  <span className="text-[10px] text-slate-500">~0.10 mm/px (High-res)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetSelect('sticker')}
                  className={`p-2 rounded border text-left text-xs transition-all ${
                    referenceType === 'sticker'
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">50mm Target Sticker</span>
                  <span className="text-[10px] text-slate-500">~0.30 mm/px (Distant)</span>
                </button>
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manual mm/pixel Scale Factor:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10"
                    value={mmInput}
                    onChange={(e) => {
                      setMmInput(e.target.value);
                      setReferenceType('custom');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">
                    mm / pixel
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Scale</span>
              </button>
            </div>

            {savedSuccess && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Calibration updated successfully.
              </p>
            )}
          </div>

          {/* Section 14: Local Installation & Code Architecture */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  14. Local Installation & Backend Setup Documentation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instructions for running as a standalone Python/OpenCV microservice or Node.js Vite application.
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md border border-slate-700">
                <button
                  onClick={() => setActiveArchTab('node')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    activeArchTab === 'node'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Option B: Vite/Node.js
                </button>
                <button
                  onClick={() => setActiveArchTab('python')}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${
                    activeArchTab === 'python'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Option A: Python FastAPI
                </button>
              </div>
            </div>

            {activeArchTab === 'node' ? (
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-blue-400 font-bold"># Full-Stack TypeScript (Current Environment)</div>
                <div className="text-slate-400"># 1. Clone or download project</div>
                <div>git clone &lt;repo-url&gt; &amp;&amp; cd shm-system</div>
                <div className="text-slate-400"># 2. Install dependencies</div>
                <div>npm install</div>
                <div className="text-slate-400"># 3. Configure Gemini API key (optional for enhanced AI notes)</div>
                <div>export GEMINI_API_KEY="your_api_key_here"</div>
                <div className="text-slate-400"># 4. Start production dev server on port 3000</div>
                <div>npm run dev</div>
              </div>
            ) : (
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-blue-400 font-bold"># Option A: Python + FastAPI + OpenCV Setup</div>
                <div className="text-slate-400"># 1. Create virtual environment</div>
                <div>python -m venv venv &amp;&amp; source venv/bin/activate</div>
                <div className="text-slate-400"># 2. Install computer vision and API stack</div>
                <div>pip install fastapi uvicorn opencv-python-headless numpy scikit-image google-genai</div>
                <div className="text-slate-400"># 3. Start API server</div>
                <div>uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
