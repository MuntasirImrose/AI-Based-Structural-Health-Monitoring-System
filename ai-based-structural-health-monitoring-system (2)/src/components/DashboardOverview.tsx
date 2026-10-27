import React from 'react';
import { InspectionRecord } from '../types/shm';
import {
  Activity,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
  UploadCloud,
  Play,
  Calendar,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface DashboardOverviewProps {
  records: InspectionRecord[];
  onUploadClick: () => void;
  onTryDemo: () => void;
  onViewAnalysis: () => void;
  hasActiveInspection: boolean;
  onSelectRecord: (record: InspectionRecord) => void;
  onNavigateToDataMining?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  records,
  onUploadClick,
  onTryDemo,
  onViewAnalysis,
  hasActiveInspection,
  onSelectRecord,
  onNavigateToDataMining,
}) => {
  // Compute dashboard metrics
  const totalInspections = records.length;
  const cracksDetected = records.filter((r) => r.metrics.crackDetected).length;
  const highSeverityCases = records.filter(
    (r) => r.metrics.severity === 'High' || r.metrics.severity === 'Critical'
  ).length;
  const avgConfidence = totalInspections > 0
    ? Math.round(records.reduce((acc, r) => acc + r.metrics.confidence, 0) / totalInspections)
    : 88;

  // Severity counts
  const severityCounts = {
    None: records.filter((r) => !r.metrics.crackDetected).length,
    Low: records.filter((r) => r.metrics.crackDetected && r.metrics.severity === 'Low').length,
    Moderate: records.filter((r) => r.metrics.severity === 'Moderate').length,
    High: records.filter((r) => r.metrics.severity === 'High').length,
    Critical: records.filter((r) => r.metrics.severity === 'Critical').length,
  };

  return (
    <div className="space-y-8">
      {/* Hero / System Banner matching Section 1 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI & Computer Vision Structural Health Monitoring (SHM)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            AI-Based Structural Health Monitoring System
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            "AI-powered visual inspection for detecting and analyzing structural cracks and damage."
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onUploadClick}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Crack Image</span>
            </button>

            <button
              onClick={onTryDemo}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Try Demo Scenario</span>
            </button>

            {hasActiveInspection && (
              <button
                onClick={onViewAnalysis}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>View Current Inspection</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none hidden md:block" />
      </div>

      {/* 4 Main Sections Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Section 1: Upload Crack Image */}
        <div
          onClick={onUploadClick}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              1. Upload Crack Image
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Drag & drop photos of building beams, bridge piers, masonry walls, or pavements. Supports JPG, PNG, WEBP.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
            <span>Select Image File</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Section 2: AI Analysis */}
        <div
          onClick={onViewAnalysis}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              2. AI Analysis & Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Multi-spectrum CV pipeline: Original, Enhanced, Binary Mask, Detection Overlay with quantitative width & length.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
            <span>Inspect Processing</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Section 3: Structural Health Report */}
        <div
          onClick={onViewAnalysis}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              3. Structural Health Report
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Generate and download formal engineering PDF & Word reports containing all 21 verification parameters.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
            <span>Generate Report</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Section 4: Data Mining & ML */}
        <div
          onClick={onNavigateToDataMining || onViewAnalysis}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              4. Data Mining & ML
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              K-Means damage clustering, Apriori association rules, correlation heatmaps, and Paris-Erdogan RUL forecasting.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
            <span>Explore Analytics</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4 Main Summary Stat Cards (Matching Section 11 Dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inspections */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Inspections
          </span>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            {totalInspections}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Structural monitoring log</span>
          </div>
        </div>

        {/* Cracks Detected */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Cracks Detected
          </span>
          <div className="text-2xl font-extrabold font-mono text-red-600 mt-1">
            {cracksDetected}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span>{totalInspections > 0 ? Math.round((cracksDetected / totalInspections) * 100) : 0}% detection rate</span>
          </div>
        </div>

        {/* High-Severity Cases */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            High-Severity Cases
          </span>
          <div className="text-2xl font-extrabold font-mono text-amber-600 mt-1">
            {highSeverityCases}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Requires engineer triage</span>
          </div>
        </div>

        {/* Average Detection Confidence */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Avg Detection Confidence
          </span>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">
            {avgConfidence}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Computer vision fidelity</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Crack Severity Distribution */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              1. Crack Severity Distribution
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Visual Category Counts</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Critical (> 3.0mm width)', count: severityCounts.Critical, color: 'bg-red-600' },
              { label: 'High (1.5 - 3.0mm width)', count: severityCounts.High, color: 'bg-rose-500' },
              { label: 'Moderate (0.5 - 1.5mm width)', count: severityCounts.Moderate, color: 'bg-amber-500' },
              { label: 'Low (< 0.5mm hairline)', count: severityCounts.Low, color: 'bg-blue-500' },
              { label: 'Normal / Sound Surface', count: severityCounts.None, color: 'bg-emerald-500' },
            ].map((item) => {
              const maxVal = Math.max(1, totalInspections);
              const pct = (item.count / maxVal) * 100;

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Crack Measurements Over Time Trend */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>2. Crack Progression Over Time</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Length (mm) Growth</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Longitudinal tracking of estimated fissure length across successive scans.
            </p>

            {records.length > 0 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={records.slice(-10).map((rec, i) => ({
                      scan: `#${i + 1}`,
                      name: rec.structureName,
                      lengthMm: rec.metrics.lengthMm,
                      widthMm: rec.metrics.widthMm,
                      severity: rec.metrics.severity,
                      raw: rec,
                    }))}
                    margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient id="lengthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="scan" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} unit="mm" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded text-xs shadow-md space-y-1">
                              <p className="font-bold">{d.name}</p>
                              <p className="text-blue-300">Crack Length: <strong>{d.lengthMm} mm</strong></p>
                              <p className="text-purple-300">Crack Width: <strong>{d.widthMm} mm</strong></p>
                              <p className="text-amber-300">Severity: <strong>{d.severity}</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="lengthMm"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#lengthGradient)"
                      dot={{ r: 4, fill: '#2563eb' }}
                      activeDot={{ r: 6, fill: '#1d4ed8', onClick: (_, event: any) => {
                        const rec = (event?.payload as any)?.raw;
                        if (rec) onSelectRecord(rec);
                      }}}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No time-series data yet. Run an inspection to populate.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-3 flex items-center justify-between border-t border-slate-100 mt-2">
            <span>Measurement scale: 0.25 mm/px calibrated baseline</span>
            <button onClick={onViewAnalysis} className="text-blue-600 font-medium hover:underline">
              Inspect Timeline →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
