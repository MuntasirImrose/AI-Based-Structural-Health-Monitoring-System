import React, { useState } from 'react';
import { CrackMetrics, AIObservations, InspectionRecord } from '../types/shm';
import {
  ClipboardCheck,
  FileDown,
  AlertOctagon,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building,
  Info
} from 'lucide-react';
import { generateStructuralPDFReport } from '../services/pdfReportService';
import { download30PageWordReport } from '../services/wordReportGenerator';

interface RecommendationsPanelProps {
  metrics: CrackMetrics;
  aiObservations: AIObservations;
  currentRecord?: InspectionRecord | null;
  onGenerateReport: () => void;
  onOpenAIDocuments?: () => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  metrics,
  aiObservations,
  currentRecord,
  onGenerateReport,
  onOpenAIDocuments,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!currentRecord) return;
    setIsGeneratingPdf(true);
    try {
      await generateStructuralPDFReport(currentRecord);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            7 & 8. Engineering Recommendations & Structural Health Report
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Contextual mitigation protocols, non-destructive inspection guidance, and official PDF report generation
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAIDocuments && (
            <button
              id="recommendations-open-ai-docs-btn"
              onClick={onOpenAIDocuments}
              className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Document Creator</span>
            </button>
          )}

          {currentRecord && (
            <>
              <button
                id="download-30page-word-btn"
                onClick={() => download30PageWordReport(currentRecord)}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                title="Download complete 30-page forensic engineering report in Word (.docx) format"
              >
                <FileDown className="w-4 h-4 text-indigo-200" />
                <span>Download 30-Page Word (.docx)</span>
              </button>

              <button
                id="download-pdf-report-btn"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
              </button>
            </>
          )}

          <button
            id="generate-structural-report-btn"
            onClick={onGenerateReport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Reports Center</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Observations & Probable Causes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Engineering Interpretation */}
          <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950 mb-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Preliminary Engineering Interpretation</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {aiObservations.engineeringInterpretation}
            </p>
          </div>

          {/* Probable Causations Grid */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Probable Structural Causations</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {aiObservations.probableCauses.map((cause, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actionable Recommendations Based on Severity */}
          <div className="p-4 rounded-lg bg-white border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Action Items</span>
            </h4>
            <div className="space-y-2">
              {aiObservations.technicalRecommendations.map((rec, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-slate-800 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Urgency, Monitoring Schedule, Safety Rules */}
        <div className="space-y-4">
          {/* Monitoring Interval Card */}
          <div className="p-4 rounded-lg bg-slate-900 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Monitoring Cycle
              </span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-sm font-bold text-slate-100 mb-2">
              {aiObservations.monitoringInterval}
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
              Consistent photographic baseline logs must be recorded at fixed distances, focal lengths, and illumination.
            </p>
          </div>

          {/* Potential Structural Risks */}
          <div className="p-4 rounded-lg bg-rose-50/70 border border-rose-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 mb-2 uppercase tracking-wide">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Potential Risk Factors</span>
            </div>
            <ul className="space-y-1.5 text-xs text-rose-800">
              {aiObservations.potentialRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Golden Rule of Structural Assessment */}
          <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1 text-slate-900">
              <Info className="w-3.5 h-3.5 text-slate-600" />
              <span>Inspection Protocol Rule</span>
            </div>
            <p className="leading-relaxed">
              Never declare a building or bridge as unconditionally safe or unsafe based only on single-angle surface images. A complete engineering assessment combines visual screening, core testing, and structural calculation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
