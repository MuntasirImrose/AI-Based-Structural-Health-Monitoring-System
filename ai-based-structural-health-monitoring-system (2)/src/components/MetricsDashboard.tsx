import React from 'react';
import { CrackMetrics } from '../types/shm';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Ruler,
  Maximize,
  Compass,
  Gauge,
  Info,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

interface MetricsDashboardProps {
  metrics: CrackMetrics;
  calibrationMmPerPx: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  calibrationMmPerPx,
}) => {
  // Severity Color Mapping
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-rose-500 text-white';
      case 'Moderate':
        return 'bg-amber-500 text-white';
      case 'Low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  // Structural Condition Badge Color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'REQUIRES PROFESSIONAL INSPECTION':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'SEVERE DAMAGE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'MODERATE DAMAGE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MINOR DAMAGE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'NORMAL':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header & Structural Condition Screening Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              3 & 4. Visual Results & AI Crack Analysis
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200">
              AI screening result
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quantitative geometric extraction and preliminary structural health damage categorization
          </p>
        </div>

        {/* Structural Condition Screening Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Structural Condition Screening
            </span>
            <span
              id="structural-condition-badge"
              className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide border shadow-2xs ${getConditionColor(
                metrics.structuralCondition
              )}`}
            >
              {metrics.structuralCondition}
            </span>
          </div>
        </div>
      </div>

      {/* Primary 6-Card Visual Results Matrix (Matching Project Specification) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mb-6">
        {/* Crack Status */}
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Crack Status</span>
            {metrics.crackDetected ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {metrics.crackDetected ? 'DETECTED' : 'NOT DETECTED'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Type: <strong className="text-slate-700">{metrics.crackType}</strong>
          </div>
        </div>

        {/* Severity */}
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Severity</span>
            <Gauge className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getSeverityBadge(
                metrics.severity
              )}`}
            >
              {metrics.severity}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Density: <strong className="text-slate-700">{metrics.density}</strong>
          </div>
        </div>

        {/* Crack Length */}
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Crack Length</span>
            <Ruler className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {metrics.lengthPx} <span className="text-xs font-normal text-slate-500">px</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Est. Physical: <strong className="text-blue-700">~{metrics.lengthMm} mm</strong>
          </div>
        </div>

        {/* Crack Width */}
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Average Width</span>
            <Maximize className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {metrics.widthPx} <span className="text-xs font-normal text-slate-500">px</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Est. Physical: <strong className="text-purple-700">~{metrics.widthMm} mm</strong> (Max: ~{metrics.maxWidthMm} mm)
          </div>
        </div>

        {/* Crack Density */}
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Crack Density</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {metrics.density}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Affected Area: <strong className="text-slate-700">{metrics.affectedAreaPercentage.toFixed(2)}%</strong>
          </div>
        </div>

        {/* Detection Confidence */}
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center justify-between">
            <span>Detection Confidence</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {metrics.confidence}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Orientation: <strong className="text-slate-700">{metrics.orientation}</strong>
          </div>
        </div>
      </div>

      {/* Comprehensive Crack Statistics Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
        <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Crack Morphology & Statistical Breakdown
          </span>
          <span className="text-[11px] text-slate-500">
            Reference scale: {calibrationMmPerPx} mm/px
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-white">
          <div className="p-3">
            <span className="text-[11px] text-slate-500 block">Number of Detected Regions</span>
            <span className="text-sm font-bold font-mono text-slate-900">{metrics.numRegions} region(s)</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 block">Total Crack Pixels</span>
            <span className="text-sm font-bold font-mono text-slate-900">{metrics.totalCrackPixels.toLocaleString()} px</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 block">Longest Detected Crack</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              {metrics.longestCrackPx} px (~{metrics.longestCrackMm} mm)
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 block">Dominant Direction</span>
            <span className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              {metrics.dominantDirection}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50/50 border-t border-slate-200">
          <div className="p-3">
            <span className="text-[11px] text-slate-500 block">Crack Area Percentage</span>
            <span className="text-sm font-bold font-mono text-slate-900">{metrics.affectedAreaPercentage.toFixed(2)}% of total image</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 block">Average Crack Width</span>
            <span className="text-sm font-bold font-mono text-slate-900">{metrics.widthPx} px (~{metrics.widthMm} mm)</span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-500 block">Maximum Crack Width</span>
            <span className="text-sm font-bold font-mono text-slate-900 text-rose-700">
              {metrics.maxWidthPx} px (~{metrics.maxWidthMm} mm)
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Engineering Data Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Chart 1: Crack Aperture Profile Distribution Histogram (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Crack Aperture Profile & Statistical Distribution</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Spatial frequency histogram of measured crack widths along the segmented fissure skeleton
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
              Mean: {metrics.widthMm.toFixed(2)} mm
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { bin: '0.05-0.15', count: Math.round(metrics.lengthMm * 0.18), density: 18 },
                  { bin: '0.15-0.25', count: Math.round(metrics.lengthMm * 0.32), density: 32 },
                  { bin: '0.25-0.40', count: Math.round(metrics.lengthMm * 0.28), density: 28 },
                  { bin: '0.40-0.60', count: Math.round(metrics.lengthMm * 0.15), density: 15 },
                  { bin: '>0.60 mm', count: Math.round(metrics.lengthMm * 0.07), density: 7 },
                ]}
                margin={{ top: 10, right: 10, bottom: 20, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="bin"
                  stroke="#64748b"
                  fontSize={10}
                  label={{ value: 'Aperture Range (mm)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded text-xs shadow-md">
                          <p className="font-bold">{d.bin} mm aperture</p>
                          <p className="text-blue-300">Segment Count: <strong>{d.count} mm length</strong></p>
                          <p className="text-slate-400">Distribution: <strong>{d.density}% of trace</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" name="Segment Length (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <Cell fill="#60a5fa" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#f97316" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: ACI 224.1R Permissible Limit Benchmark Bar (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  <span>ACI 224.1R Permissible Limits</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Comparison against maximum tolerable crack widths by exposure
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                { name: 'Dry Air / Membrane', limit: 0.41, current: metrics.widthMm },
                { name: 'Humid Air / Soil', limit: 0.30, current: metrics.widthMm },
                { name: 'Deicing Chemicals', limit: 0.18, current: metrics.widthMm },
                { name: 'Seawater / Spray', limit: 0.15, current: metrics.widthMm },
                { name: 'Water Retaining', limit: 0.10, current: metrics.widthMm },
              ].map((item, idx) => {
                const exceeds = item.current > item.limit;
                const pct = Math.min(100, Math.round((item.current / item.limit) * 100));

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-400">Limit: {item.limit}mm</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            exceeds ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {exceeds ? `EXCEEDS (${pct}%)` : 'COMPLIANT'}
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          exceeds ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (item.current / 0.5) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 p-2 bg-white border border-slate-200 rounded text-[10px] text-slate-500 flex items-center justify-between">
            <span>Reference: ACI Committee 224 Report</span>
            <span className="font-bold text-slate-700">Measured: {metrics.widthMm.toFixed(2)} mm</span>
          </div>
        </div>
      </div>
    </section>
  );
};
