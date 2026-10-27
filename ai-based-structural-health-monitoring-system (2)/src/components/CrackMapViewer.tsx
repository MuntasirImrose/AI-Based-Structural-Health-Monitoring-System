import React, { useState, useRef } from 'react';
import { PipelineStages } from '../types/shm';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Maximize2,
  Crosshair,
  Layers,
  Info
} from 'lucide-react';

interface CrackMapViewerProps {
  stages: PipelineStages;
}

export const CrackMapViewer: React.FC<CrackMapViewerProps> = ({ stages }) => {
  const [activeStage, setActiveStage] = useState<'overlay' | 'original' | 'enhanced' | 'mask'>('overlay');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [splitMode, setSplitMode] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50); // percentage
  const containerRef = useRef<HTMLDivElement>(null);

  const getStageUrl = (stage: 'overlay' | 'original' | 'enhanced' | 'mask') => {
    switch (stage) {
      case 'original': return stages.originalUrl;
      case 'enhanced': return stages.enhancedUrl;
      case 'mask': return stages.binaryMaskUrl;
      case 'overlay':
      default: return stages.overlayUrl;
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-red-600" />
            5. Visual Crack Map & Inspection Viewer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive multi-spectrum canvas with high-resolution digital zoom and comparative overlay inspection
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-xs"></span>
            <span className="text-slate-700 font-medium">Red: Detected Crack</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-xs"></span>
            <span className="text-slate-700 font-medium">Yellow: Uncertain Boundary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-400 shadow-xs"></span>
            <span className="text-slate-700 font-medium">Normal Surface</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
        {/* Stage View Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-slate-200 shadow-2xs">
          {(
            [
              { id: 'overlay', label: 'Overlay' },
              { id: 'original', label: 'Original' },
              { id: 'enhanced', label: 'Enhanced' },
              { id: 'mask', label: 'Mask' },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              id={`crack-map-toggle-${st.id}`}
              onClick={() => {
                setActiveStage(st.id);
                setSplitMode(false);
              }}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                !splitMode && activeStage === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
          <button
            id="crack-map-split-toggle"
            onClick={() => setSplitMode(!splitMode)}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
              splitMode
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Side-by-side split comparison"
          >
            <Sliders className="w-3 h-3" />
            <span>Split Slider</span>
          </button>
        </div>

        {/* Zoom & Navigation Tools */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-md border border-slate-200 shadow-2xs p-0.5">
            <button
              id="zoom-out-btn"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-xs font-semibold text-slate-700 select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              id="zoom-in-btn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded hover:bg-slate-100"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="zoom-reset-btn"
            onClick={handleResetZoom}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 text-xs shadow-2xs flex items-center gap-1 font-medium"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Canvas Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none ${
          zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-crosshair'
        }`}
      >
        {/* Single View or Split Slider */}
        {!getStageUrl(activeStage) ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Layers className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-300">Historical Inspection Archive</p>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1">
              High-resolution canvas imagery was omitted to conserve local storage quota. Fracture metrics, orientation, and engineering recommendations are fully available.
            </p>
          </div>
        ) : !splitMode ? (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={getStageUrl(activeStage)}
              alt="Structural Crack Analysis Stage"
              className="max-w-full max-h-full object-contain pointer-events-none"
            />
          </div>
        ) : (
          /* Split Comparison Mode: Original vs Overlay */
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Background: Detection Overlay */}
            <img
              src={stages.overlayUrl}
              alt="Overlay"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Foreground: Original clipped by splitPosition */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${splitPosition}%`, borderRight: '2px solid #3b82f6' }}
            >
              <img
                src={stages.originalUrl}
                alt="Original"
                className="absolute inset-0 w-full h-full object-contain max-w-none"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
              />
            </div>

            {/* Split Slider Handle */}
            <div
              className="absolute top-0 bottom-0 z-20 flex flex-col items-center justify-center pointer-events-auto cursor-ew-resize"
              style={{ left: `${splitPosition}%`, transform: 'translateX(-50%)' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const handleDrag = (moveEvent: MouseEvent) => {
                  if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const newPos = Math.max(5, Math.min(95, ((moveEvent.clientX - rect.left) / rect.width) * 100));
                    setSplitPosition(newPos);
                  }
                };
                const handleUp = () => {
                  window.removeEventListener('mousemove', handleDrag);
                  window.removeEventListener('mouseup', handleUp);
                };
                window.addEventListener('mousemove', handleDrag);
                window.addEventListener('mouseup', handleUp);
              }}
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center text-[10px] font-bold border-2 border-white">
                ↔
              </div>
            </div>
          </div>
        )}

        {/* View Indicator Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-xs font-mono border border-slate-700/60 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span>
            {splitMode ? `Split View: Original (${Math.round(splitPosition)}%) / Overlay` : `Active Spectrum: ${activeStage.toUpperCase()}`}
          </span>
          <span className="text-slate-400 text-[10px]">| Zoom: {Math.round(zoomLevel * 100)}%</span>
        </div>

        {/* Interactive Tip */}
        <div className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-sm text-slate-300 text-[10px] px-2.5 py-1 rounded border border-slate-700/50">
          <Info className="w-3 h-3 text-blue-400" />
          <span>Zoom in and drag to inspect micro-cracks</span>
        </div>
      </div>
    </section>
  );
};
