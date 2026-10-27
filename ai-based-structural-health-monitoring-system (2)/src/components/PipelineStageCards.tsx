import React, { useState } from 'react';
import { PipelineStages } from '../types/shm';
import { Eye, Maximize2, Download, Check, Sparkles, Layers } from 'lucide-react';

interface PipelineStageCardsProps {
  stages: PipelineStages;
  onSelectStageForInspection?: (stageKey: keyof PipelineStages) => void;
}

export const PipelineStageCards: React.FC<PipelineStageCardsProps> = ({
  stages,
  onSelectStageForInspection,
}) => {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; desc: string } | null>(null);

  const stageCards = [
    {
      key: 'originalUrl' as const,
      stageNumber: 1,
      title: 'Stage 1: Original Image',
      subtitle: 'Raw Structural Photo',
      description: 'Unprocessed RGB input of the building, bridge, beam, or masonry component.',
      badge: 'Input',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      url: stages.originalUrl,
    },
    {
      key: 'enhancedUrl' as const,
      stageNumber: 2,
      title: 'Stage 2: Enhanced Image',
      subtitle: 'Noise Reduction & CLAHE',
      description: 'Grayscale conversion, bilateral filtering, and adaptive local contrast enhancement to expose micro-fissures.',
      badge: 'Preprocessed',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      url: stages.enhancedUrl,
    },
    {
      key: 'binaryMaskUrl' as const,
      stageNumber: 3,
      title: 'Stage 3: Binary Mask',
      subtitle: 'Ridge Segmentation',
      description: 'Morphological closing and valley-line thresholding isolating continuous crack pixels from surface texture.',
      badge: 'Segmented',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      url: stages.binaryMaskUrl,
    },
    {
      key: 'overlayUrl' as const,
      stageNumber: 4,
      title: 'Stage 4: Detection Overlay',
      subtitle: 'Visual Crack Highlight',
      description: 'Detected cracks emphasized in red highlight lines with uncertain boundary contours in yellow.',
      badge: 'CV Detection',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      url: stages.overlayUrl,
    },
  ];

  const handleDownloadImage = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    a.click();
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            2. Image Processing Pipeline Stages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step transformation from raw structural capture to segmented binary mask and visual detection overlay
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Canvas: {stages.width} × {stages.height} px
        </span>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stageCards.map((card) => (
          <div
            key={card.key}
            id={`pipeline-card-stage-${card.stageNumber}`}
            className="group rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
          >
            {/* Card Header */}
            <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {card.title}
                </span>
                <span className="text-[11px] text-slate-500">{card.subtitle}</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            {/* Stage Preview Canvas Image */}
            <div
              className="relative aspect-[4/3] bg-slate-900 overflow-hidden cursor-pointer"
              onClick={() => {
                if (card.url) {
                  setSelectedImage({ url: card.url, title: card.title, desc: card.description });
                }
              }}
            >
              {card.url ? (
                <img
                  src={card.url}
                  alt={card.title}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-900/90 text-slate-400">
                  <Layers className="w-7 h-7 text-slate-600 mb-1" />
                  <span className="text-[11px] font-medium text-slate-300">Archived Record</span>
                  <span className="text-[9px] text-slate-500">Image unbuffered</span>
                </div>
              )}

              {/* Hover actions overlay */}
              {card.url && (
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage({ url: card.url, title: card.title, desc: card.description });
                    }}
                    className="p-1.5 rounded-md bg-white/90 hover:bg-white text-slate-900 shadow-sm text-xs font-medium flex items-center gap-1"
                    title="Enlarge view"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Enlarge</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadImage(card.url, card.title);
                    }}
                    className="p-1.5 rounded-md bg-white/90 hover:bg-white text-slate-900 shadow-sm text-xs font-medium flex items-center gap-1"
                    title="Download stage image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Description Footer */}
            <div className="p-3 text-[11px] text-slate-600 bg-slate-50/70 border-t border-slate-100 flex-1">
              <p className="line-clamp-2 leading-relaxed">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Lightbox for Image Inspection */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{selectedImage.title}</h3>
                <p className="text-xs text-slate-300">{selectedImage.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadImage(selectedImage.url, selectedImage.title)}
                  className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-2.5 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded font-bold"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
