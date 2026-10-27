import React, { useState } from 'react';
import { InspectionRecord } from '../types/shm';
import {
  History,
  TrendingUp,
  AlertTriangle,
  FileDown,
  Eye,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { generateStructuralPDFReport } from '../services/pdfReportService';

interface HistorySectionProps {
  records: InspectionRecord[];
  onSelectRecord: (record: InspectionRecord) => void;
  onClearHistory: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  records,
  onSelectRecord,
  onClearHistory,
}) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Check if crack lengths are generally increasing over chronological sequence
  const hasIncreasingTrend = () => {
    if (records.length < 2) return false;
    const sorted = [...records].reverse(); // chronological
    let increases = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].metrics.lengthPx > sorted[i - 1].metrics.lengthPx) {
        increases++;
      }
    }
    return increases >= Math.floor(sorted.length / 2);
  };

  const isTrendIncreasing = hasIncreasingTrend();

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        setSelectedForCompare([...selectedForCompare.slice(1), id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const compareRecords = records.filter((r) => selectedForCompare.includes(r.id));

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            9. Monitoring History & Temporal Crack Growth Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of longitudinal structural scans with comparative metrics and growth trend diagnostics
          </p>
        </div>

        {records.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No inspection records logged yet</p>
          <p className="text-xs mt-1">Upload an image or run a demo scenario to initiate the longitudinal database.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trend Chart Card */}
          <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Visual Crack Measurement Trend
                </span>
                <span className="text-[11px] text-slate-400">
                  Chronological progression of crack length across saved visual inspections
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {records.length} Inspection Point{records.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Measurement Bars Visualization */}
            <div className="space-y-3 my-4">
              {[...records].reverse().map((rec, idx) => {
                const maxVal = Math.max(...records.map((r) => r.metrics.lengthPx), 350);
                const percent = Math.min(100, Math.max(10, (rec.metrics.lengthPx / maxVal) * 100));

                return (
                  <div key={rec.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-2">
                        <span className="text-slate-500 font-bold">#{idx + 1}</span>
                        <span>{rec.dateStr}</span>
                        <span className="text-slate-500 truncate max-w-[140px]">({rec.structureName})</span>
                      </span>
                      <span className="font-bold text-blue-400">
                        {rec.metrics.lengthPx} px{' '}
                        <span className="text-slate-400 text-[10px] font-normal">
                          (~{rec.metrics.lengthMm} mm)
                        </span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rec.metrics.severity === 'Critical' || rec.metrics.severity === 'High'
                            ? 'bg-gradient-to-r from-amber-500 to-red-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trend Alert Indicator */}
            {isTrendIncreasing && (
              <div className="mt-4 p-3 rounded-lg bg-amber-950/80 border border-amber-700/60 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-100">
                    "Increase detected in image-based crack measurements. Professional assessment may be appropriate."
                  </p>
                  <p className="text-[11px] text-amber-300/80">
                    Note: An increase in pixel-detected dimensions does not automatically conclude that the structure is unsafe. Factors such as camera distance and illumination angle should be verified.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Comparison Drawer if 2 or 3 selected */}
          {compareRecords.length >= 2 && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                    Inspection Delta Comparison ({compareRecords.length} Selected)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Clear Selection
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {compareRecords.map((r, i) => (
                  <div key={r.id} className="p-3 bg-white rounded-lg border border-blue-100 text-xs space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Inspection {i + 1}</span>
                      <span className="text-[10px] text-slate-400">{r.dateStr}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Length: <strong className="text-blue-700">{r.metrics.lengthPx} px</strong> (~{r.metrics.lengthMm} mm)
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Width: <strong className="text-purple-700">{r.metrics.widthPx} px</strong> (~{r.metrics.widthMm} mm)
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Severity: <strong className="text-slate-800">{r.metrics.severity}</strong>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">{r.reportId}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Records Table */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Compare</th>
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Image Name</th>
                  <th className="p-3">Crack Detected</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Crack Length</th>
                  <th className="p-3">Crack Width</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {records.map((rec) => {
                  const isChecked = selectedForCompare.includes(rec.id);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCompare(rec.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono font-medium text-slate-800 text-[11px]">
                        {rec.reportId}
                      </td>
                      <td className="p-3 text-slate-600">
                        {rec.dateStr} <span className="text-slate-400 text-[10px]">{rec.timeStr}</span>
                      </td>
                      <td className="p-3 text-slate-800 font-medium truncate max-w-[120px]">
                        {rec.imageName}
                      </td>
                      <td className="p-3">
                        {rec.metrics.crackDetected ? (
                          <span className="text-red-600 font-semibold">YES</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">NO</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            rec.metrics.severity === 'Critical' || rec.metrics.severity === 'High'
                              ? 'bg-red-100 text-red-800'
                              : rec.metrics.severity === 'Moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rec.metrics.severity}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        {rec.metrics.lengthPx} px{' '}
                        <span className="text-slate-400 text-[10px]">(~{rec.metrics.lengthMm} mm)</span>
                      </td>
                      <td className="p-3 font-mono">
                        {rec.metrics.widthPx} px{' '}
                        <span className="text-slate-400 text-[10px]">(~{rec.metrics.widthMm} mm)</span>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{rec.metrics.confidence}%</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onSelectRecord(rec)}
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5"
                          title="View Analysis"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => generateStructuralPDFReport(rec)}
                          className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-0.5"
                          title="Download PDF Report"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
