import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Database,
  Cpu,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Search,
  HelpCircle,
  Activity,
  Maximize2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  BarChart2,
  ScatterChart as ScatterIcon,
  PieChart as PieIcon,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import { InspectionRecord } from '../types/shm';
import {
  buildMiningCorpus,
  runKMeansClustering,
  mineAssociationRules,
  computeCorrelationMatrix,
  calculateDegradationForecast,
  detectStructuralAnomalies,
  exportMinedDataToCSV,
  MinedFeatureRecord,
  ClusterResult,
  AssociationRule
} from '../services/dataMiningService';

interface DataMiningModuleProps {
  userRecords: InspectionRecord[];
  activeRecord: InspectionRecord | null;
  onSelectRecordForInspection?: (recordId: string) => void;
}

export const DataMiningModule: React.FC<DataMiningModuleProps> = ({
  userRecords,
  activeRecord,
  onSelectRecordForInspection,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'clustering' | 'association-rules' | 'correlation' | 'rul-forecast' | 'anomalies'
  >('clustering');

  // Clustering controls
  const [clusterK, setClusterK] = useState<number>(3);

  // Association rule controls
  const [minSupport, setMinSupport] = useState<number>(15);
  const [minConfidence, setMinConfidence] = useState<number>(60);
  const [ruleSearch, setRuleSearch] = useState<string>('');

  // Selected correlation cell for drill-down bivariate plot
  const [selectedVarPair, setSelectedVarPair] = useState<[string, string]>(['Crack Width (mm)', 'Strain (με)']);

  // Selected asset for RUL forecast
  const [selectedAssetReportId, setSelectedAssetReportId] = useState<string>(
    activeRecord?.reportId || 'SHM-MIN-401'
  );

  // Filter corpus by asset category
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('all');

  // 1. Build unified mining corpus
  const rawCorpus = useMemo(() => {
    return buildMiningCorpus(userRecords, activeRecord);
  }, [userRecords, activeRecord]);

  const corpus = useMemo(() => {
    if (assetCategoryFilter === 'all') return rawCorpus;
    return rawCorpus.filter((item) =>
      item.componentType.toLowerCase().includes(assetCategoryFilter.toLowerCase())
    );
  }, [rawCorpus, assetCategoryFilter]);

  // 2. Compute Data Mining Models
  const clusterResults = useMemo(() => {
    return runKMeansClustering(corpus, clusterK);
  }, [corpus, clusterK]);

  const associationRules = useMemo(() => {
    return mineAssociationRules(corpus, minSupport, minConfidence);
  }, [corpus, minSupport, minConfidence]);

  const filteredRules = useMemo(() => {
    if (!ruleSearch) return associationRules;
    const term = ruleSearch.toLowerCase();
    return associationRules.filter(
      (r) =>
        r.antecedent.some((a) => a.toLowerCase().includes(term)) ||
        r.consequent.toLowerCase().includes(term) ||
        r.engineeringTakeaway.toLowerCase().includes(term)
    );
  }, [associationRules, ruleSearch]);

  const correlationData = useMemo(() => {
    return computeCorrelationMatrix(corpus);
  }, [corpus]);

  const anomaliesList = useMemo(() => {
    return detectStructuralAnomalies(corpus);
  }, [corpus]);

  const activeAnomalies = useMemo(() => {
    return anomaliesList.filter((a) => a.isAnomaly);
  }, [anomaliesList]);

  // Target record for RUL forecast
  const forecastTarget = useMemo(() => {
    return corpus.find((c) => c.reportId === selectedAssetReportId) || corpus[0] || null;
  }, [corpus, selectedAssetReportId]);

  const rulForecast = useMemo(() => {
    return calculateDegradationForecast(forecastTarget);
  }, [forecastTarget]);

  // Bivariate scatter data for correlation view
  const bivariateScatterData = useMemo(() => {
    const keyMap: Record<string, keyof MinedFeatureRecord> = {
      'Crack Width (mm)': 'crackWidthMm',
      'Max Width (mm)': 'maxWidthMm',
      'Length (mm)': 'crackLengthMm',
      'Affected Area (%)': 'affectedAreaPct',
      'Vibration (mg)': 'vibrationPeakMg',
      'Strain (με)': 'strainMicrostrain',
      'Asset Age (yrs)': 'structureAgeYears',
      'Temperature (°C)': 'ambientTempC',
      'Humidity (%)': 'ambientHumidityPct',
      'Severity Score': 'severityScore',
    };

    const k1 = keyMap[selectedVarPair[0]] || 'crackWidthMm';
    const k2 = keyMap[selectedVarPair[1]] || 'strainMicrostrain';

    return corpus.map((d) => ({
      name: d.structureName,
      x: Number(d[k1]) || 0,
      y: Number(d[k2]) || 0,
      severity: d.severityLabel,
      reportId: d.reportId,
    }));
  }, [corpus, selectedVarPair]);

  const handleExportCSV = () => {
    exportMinedDataToCSV(anomaliesList);
  };

  return (
    <div className="space-y-6">
      {/* Hero / Mining Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Advanced Structural Health Data Mining & Machine Learning</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              SHM Data Mining & Predictive Structural Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Uncover latent failure patterns, cluster damage archetypes with K-Means, mine fracture association rules with Apriori, compute cross-sensor correlation heatmaps, and forecast Remaining Useful Life (RUL) via Paris-Erdogan fracture kinetics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Mined Dataset (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Quick Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Mined Corpus
            </span>
            <span className="text-lg font-bold font-mono text-white">{corpus.length} Assets</span>
            <span className="text-[10px] text-slate-400 block">12 Features/Asset</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              K-Means Clusters
            </span>
            <span className="text-lg font-bold font-mono text-indigo-400">k = {clusterResults.k}</span>
            <span className="text-[10px] text-slate-400 block">Silhouette: {clusterResults.silhouetteScore}</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Mined Rules
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400">{filteredRules.length} Rules</span>
            <span className="text-[10px] text-slate-400 block">Apriori Engine</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Anomalies Flagged
            </span>
            <span className="text-lg font-bold font-mono text-amber-400">{activeAnomalies.length} Critical</span>
            <span className="text-[10px] text-slate-400 block">Z-Score &gt; 2.1σ</span>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Degradation Model
            </span>
            <span className="text-lg font-bold font-mono text-sky-400">Paris-Erdogan</span>
            <span className="text-[10px] text-slate-400 block">da/dN Kinetics</span>
          </div>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex space-x-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('clustering')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'clustering'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ScatterIcon className="w-3.5 h-3.5" />
            <span>K-Means Damage Clustering</span>
          </button>

          <button
            onClick={() => setActiveSubTab('association-rules')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'association-rules'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Apriori Association Rules</span>
          </button>

          <button
            onClick={() => setActiveSubTab('correlation')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'correlation'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Pearson Correlation Heatmap</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rul-forecast')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'rul-forecast'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Paris-Erdogan RUL Forecast</span>
          </button>

          <button
            onClick={() => setActiveSubTab('anomalies')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'anomalies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Anomaly & Outlier Mining</span>
          </button>
        </div>

        {/* Global Asset Category Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter Category:</span>
          <select
            value={assetCategoryFilter}
            onChange={(e) => setAssetCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs font-medium focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Structures ({rawCorpus.length})</option>
            <option value="pier">Bridge Piers</option>
            <option value="beam">RC Beams</option>
            <option value="column">Columns</option>
            <option value="wall">Retaining Walls</option>
            <option value="tunnel">Tunnel Linings</option>
          </select>
        </div>
      </div>

      {/* ----------------------------------------------------------------------------------------- */}
      {/* SUB-TAB 1: K-MEANS DAMAGE ARCHETYPE CLUSTERING */}
      {/* ----------------------------------------------------------------------------------------- */}
      {activeSubTab === 'clustering' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Number of Clusters (k):
              </span>
              <div className="flex items-center gap-1.5">
                {[2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setClusterK(val)}
                    className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                      clusterK === val
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-400">Within-Cluster Sum of Squares (Inertia): </span>
                <strong className="font-mono text-slate-800">{clusterResults.inertia}</strong>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400">Silhouette Score: </span>
                <strong className={`font-mono ${clusterResults.silhouetteScore >= 0.4 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {clusterResults.silhouetteScore}
                </strong>
                <span className="text-[10px] text-slate-400 ml-1">
                  ({clusterResults.silhouetteScore >= 0.4 ? 'Well Separated' : 'Moderate Overlap'})
                </span>
              </div>
            </div>
          </div>

          {/* 2D Scatter Plot: Crack Length vs Crack Width with Clusters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <ScatterIcon className="w-4 h-4 text-indigo-600" />
                    <span>Multivariate Damage Cluster Map (Normalized 6D Feature Space)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Crack Length (mm) vs. Crack Aperture (mm) projected with K-Means assignments and centroids
                  </p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Crack Length"
                      unit=" mm"
                      stroke="#64748b"
                      fontSize={11}
                      label={{ value: 'Crack Length (mm)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Crack Width"
                      unit=" mm"
                      stroke="#64748b"
                      fontSize={11}
                      label={{ value: 'Crack Width (mm)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#64748b' }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg border border-slate-700 space-y-1">
                              <p className="font-bold text-slate-100">{data.structureName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Ref: {data.reportId}</p>
                              <div className="pt-1 border-t border-slate-800 text-[11px] space-y-0.5">
                                <p>Length: <span className="font-bold font-mono text-blue-300">{data.x} mm</span></p>
                                <p>Width: <span className="font-bold font-mono text-emerald-300">{data.y} mm</span></p>
                                <p>Cluster: <span className="font-semibold text-amber-300">{data.clusterName}</span></p>
                                <p>Vibration: <span className="font-mono text-purple-300">{data.vibration} mg</span></p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ fontSize: '11px' }}
                    />

                    {clusterResults.clusters.map((cluster) => {
                      const data = cluster.records.map((r) => ({
                        x: r.crackLengthMm,
                        y: r.crackWidthMm,
                        structureName: r.structureName,
                        reportId: r.reportId,
                        clusterName: cluster.name,
                        vibration: r.vibrationPeakMg,
                      }));

                      return (
                        <Scatter
                          key={cluster.id}
                          name={`Cluster ${cluster.id + 1}: ${cluster.name.split(':')[1]?.trim() || cluster.name}`}
                          data={data}
                          fill={cluster.color}
                        />
                      );
                    })}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Code guideline reference zone */}
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
                <span>ACI 224.1R Permissible Crack Width Threshold: <strong>0.40 mm</strong></span>
                <span className="text-slate-400">Centroids recalculate iteratively via Lloyd's algorithm</span>
              </div>
            </div>

            {/* Cluster Archetype Profiles (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Identified Damage Archetypes ({clusterResults.clusters.length})
              </h3>

              {clusterResults.clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5 transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cluster.color }}
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Cluster {cluster.id + 1}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {cluster.count} structures ({Math.round((cluster.count / corpus.length) * 100)}%)
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    {cluster.name}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {cluster.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="p-1.5 rounded bg-slate-50">
                      <span className="text-slate-400 block">Avg Width</span>
                      <strong className="font-mono text-slate-800">
                        {cluster.centroid.crackWidthMm} mm
                      </strong>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50">
                      <span className="text-slate-400 block">Avg Length</span>
                      <strong className="font-mono text-slate-800">
                        {cluster.centroid.crackLengthMm} mm
                      </strong>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50">
                      <span className="text-slate-400 block">Vibration</span>
                      <strong className="font-mono text-slate-800">
                        {cluster.centroid.vibrationPeakMg} mg
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cluster Membership Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Asset Cluster Assignments & Mined Parameters
              </h4>
              <span className="text-xs text-slate-500">Showing {corpus.length} monitored assets</span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0">
                  <tr>
                    <th className="p-3">Asset & Location</th>
                    <th className="p-3">Component Type</th>
                    <th className="p-3">Cluster</th>
                    <th className="p-3">Width (mm)</th>
                    <th className="p-3">Length (mm)</th>
                    <th className="p-3">Vibration (mg)</th>
                    <th className="p-3">Strain (με)</th>
                    <th className="p-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {corpus.map((rec) => {
                    const cluster = clusterResults.clusters.find((c) =>
                      c.records.some((r) => r.reportId === rec.reportId)
                    );

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{rec.structureName}</p>
                          <span className="text-[10px] font-mono text-slate-400">{rec.reportId}</span>
                        </td>
                        <td className="p-3 text-slate-600">{rec.componentType}</td>
                        <td className="p-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ backgroundColor: cluster?.color || '#3b82f6' }}
                          >
                            Cluster {(cluster?.id ?? 0) + 1}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">{rec.crackWidthMm}</td>
                        <td className="p-3 font-mono text-slate-600">{rec.crackLengthMm}</td>
                        <td className="p-3 font-mono text-slate-600">{rec.vibrationPeakMg}</td>
                        <td className="p-3 font-mono text-slate-600">{rec.strainMicrostrain}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.severityLabel === 'Critical'
                                ? 'bg-red-100 text-red-800'
                                : rec.severityLabel === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {rec.severityLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------------- */}
      {/* SUB-TAB 2: APRIORI ASSOCIATION RULES */}
      {/* ----------------------------------------------------------------------------------------- */}
      {activeSubTab === 'association-rules' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Min Support:</span>
                  <span className="font-mono font-bold text-blue-600">{minSupport}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={minSupport}
                  onChange={(e) => setMinSupport(Number(e.target.value))}
                  className="w-36 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Min Confidence:</span>
                  <span className="font-mono font-bold text-blue-600">{minConfidence}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="5"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-36 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter rules by item..."
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 w-52"
                />
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Found <strong className="text-slate-800 font-mono">{filteredRules.length}</strong> strong structural patterns
            </div>
          </div>

          {/* Association Rules Card Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                    {rule.id.toUpperCase()} • APRIORI RULE
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rule.lift >= 2.0
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    Lift: {rule.lift}x
                  </span>
                </div>

                {/* Rule Antecedent -> Consequent Flow */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {rule.antecedent.map((ant, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold"
                      >
                        {ant}
                      </span>
                    ))}
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-1" />

                  <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {rule.consequent}
                  </span>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs pt-1">
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Support</span>
                    <strong className="font-mono text-slate-800">{rule.supportPct}%</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Confidence</span>
                    <strong className="font-mono text-emerald-600">{rule.confidencePct}%</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Association Lift</span>
                    <strong className="font-mono text-purple-600">{rule.lift}</strong>
                  </div>
                </div>

                {/* Engineering Interpretation */}
                <div className="text-[11px] text-slate-600 bg-blue-50/50 p-2.5 rounded border border-blue-100">
                  <span className="font-semibold text-blue-900 block mb-0.5">
                    Structural Forensic Takeaway:
                  </span>
                  {rule.engineeringTakeaway}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------------- */}
      {/* SUB-TAB 3: PEARSON CORRELATION MATRIX & HEATMAP */}
      {/* ----------------------------------------------------------------------------------------- */}
      {activeSubTab === 'correlation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Heatmap Grid (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    <span>Pearson Correlation Matrix (r ∈ [-1, +1])</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any cell to inspect bivariate scatter plot and linear regression trendline
                  </p>
                </div>

                {/* Color Legend */}
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-blue-700 font-bold">-1.0 (Inverse)</span>
                  <div className="w-24 h-2.5 rounded-sm bg-gradient-to-r from-blue-600 via-slate-100 to-rose-600" />
                  <span className="text-rose-700 font-bold">+1.0 (Direct)</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-center text-[10px]">
                  <thead>
                    <tr>
                      <th className="p-1 text-left text-slate-400 font-normal">Metric</th>
                      {correlationData.variables.map((v, i) => (
                        <th key={i} className="p-1 font-semibold text-slate-600 max-w-16 truncate" title={v}>
                          {v.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {correlationData.matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-1.5 text-left font-semibold text-slate-700 whitespace-nowrap">
                          {correlationData.variables[rIdx]}
                        </td>
                        {row.map((cell, cIdx) => {
                          const isSelected =
                            selectedVarPair[0] === cell.var1 && selectedVarPair[1] === cell.var2;

                          // Color mapping for correlation
                          let bgColor = 'bg-slate-50 text-slate-700';
                          if (cell.r >= 0.7) bgColor = 'bg-rose-600 text-white font-bold';
                          else if (cell.r >= 0.4) bgColor = 'bg-rose-400 text-white font-medium';
                          else if (cell.r >= 0.15) bgColor = 'bg-rose-100 text-rose-900';
                          else if (cell.r <= -0.7) bgColor = 'bg-blue-600 text-white font-bold';
                          else if (cell.r <= -0.4) bgColor = 'bg-blue-400 text-white font-medium';
                          else if (cell.r <= -0.15) bgColor = 'bg-blue-100 text-blue-900';

                          return (
                            <td key={cIdx} className="p-1">
                              <button
                                onClick={() => setSelectedVarPair([cell.var1, cell.var2])}
                                className={`w-11 h-8 rounded text-[11px] font-mono transition-all flex flex-col items-center justify-center ${bgColor} ${
                                  isSelected ? 'ring-2 ring-slate-900 scale-105 z-10' : 'hover:opacity-80'
                                }`}
                                title={`${cell.var1} vs ${cell.var2}: r = ${cell.r} (p = ${cell.pValue})`}
                              >
                                <span>{cell.r.toFixed(2)}</span>
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Bivariate Scatter Plot (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Bivariate Regression Inspection
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                  {selectedVarPair[0]} vs. {selectedVarPair[1]}
                </h4>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name={selectedVarPair[0]}
                      stroke="#64748b"
                      fontSize={10}
                      label={{ value: selectedVarPair[0], position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name={selectedVarPair[1]}
                      stroke="#64748b"
                      fontSize={10}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded text-xs shadow-lg space-y-1">
                              <p className="font-bold">{d.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Ref: {d.reportId}</p>
                              <p className="text-[11px]">
                                {selectedVarPair[0]}: <strong>{d.x}</strong>
                              </p>
                              <p className="text-[11px]">
                                {selectedVarPair[1]}: <strong>{d.y}</strong>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter
                      data={bivariateScatterData}
                      fill="#3b82f6"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pearson Coefficient r:</span>
                  <strong className="font-mono text-slate-800">
                    {correlationData.matrix
                      .find((row) => row[0].var1 === selectedVarPair[0])
                      ?.find((c) => c.var2 === selectedVarPair[1])?.r ?? '0.00'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sample Size N:</span>
                  <strong className="font-mono text-slate-800">{corpus.length} observations</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Statistical Significance:</span>
                  <strong className="font-mono text-emerald-600">p &lt; 0.01 (High)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------------- */}
      {/* SUB-TAB 4: PARIS-ERDOGAN RUL DEGRADATION FORECAST */}
      {/* ----------------------------------------------------------------------------------------- */}
      {activeSubTab === 'rul-forecast' && (
        <div className="space-y-6">
          {/* Target Asset Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Forecast Target Asset:
              </span>
              <select
                value={selectedAssetReportId}
                onChange={(e) => setSelectedAssetReportId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-hidden focus:border-blue-500"
              >
                {corpus.map((c) => (
                  <option key={c.reportId} value={c.reportId}>
                    {c.structureName} ({c.componentType}) — Width {c.crackWidthMm} mm
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400">Current Aperture: </span>
                <strong className="font-mono text-slate-800">{rulForecast.currentWidthMm} mm</strong>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400">Critical ACI Limit: </span>
                <strong className="font-mono text-red-600">{rulForecast.criticalLimitMm} mm</strong>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400">Estimated RUL to Critical: </span>
                <strong className="font-mono text-amber-600 font-bold">
                  {rulForecast.estimatedRULMonths} Months
                </strong>
              </div>
            </div>
          </div>

          {/* RUL Forecast Composed Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Paris-Erdogan Crack Progression Curve (da/dN = C · ΔKᵐ)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  60-Month unmitigated cyclic growth vs. structural epoxy remediation scenario (with 95% confidence bounds)
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-red-600" />
                  <span className="text-slate-600">Unmitigated Trajectory</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-600" />
                  <span className="text-slate-600">Mitigated (Epoxy Injection)</span>
                </div>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={rulForecast.forecastPoints} margin={{ top: 15, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748b"
                    fontSize={11}
                    unit=" mo"
                    label={{ value: 'Inspection Timeline (Months)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    unit=" mm"
                    domain={[0, 1.2]}
                    label={{ value: 'Crack Width (mm)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg space-y-1.5">
                            <p className="font-bold">Timeline Month {d.month}</p>
                            <div className="space-y-0.5 text-[11px]">
                              <p className="text-red-300">
                                Unmitigated Width: <strong>{d.unmitigatedMm} mm</strong>
                              </p>
                              <p className="text-slate-400 text-[10px]">
                                Bounds: [{d.unmitigatedLowerMm} - {d.unmitigatedUpperMm} mm]
                              </p>
                              <p className="text-emerald-300">
                                Mitigated Width: <strong>{d.mitigatedMm} mm</strong>
                              </p>
                              <p className="text-amber-300">
                                Damage State: <strong>{d.state}</strong>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Confidence Band */}
                  <Area
                    type="monotone"
                    dataKey="unmitigatedUpperMm"
                    stroke="none"
                    fill="#fee2e2"
                    fillOpacity={0.6}
                  />

                  {/* Critical Reference Lines */}
                  <ReferenceLine
                    y={0.40}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{ value: 'ACI 224 Limit (0.40 mm)', position: 'top', fill: '#dc2626', fontSize: 10 }}
                  />
                  <ReferenceLine
                    y={0.30}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'Humid Soil Limit (0.30 mm)', position: 'top', fill: '#f59e0b', fontSize: 10 }}
                  />

                  {/* Unmitigated Line */}
                  <Line
                    type="monotone"
                    dataKey="unmitigatedMm"
                    name="Unmitigated"
                    stroke="#dc2626"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#dc2626' }}
                  />

                  {/* Mitigated Line */}
                  <Line
                    type="monotone"
                    dataKey="mitigatedMm"
                    name="Mitigated Repair"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Model Equations Callout */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Fracture Mechanics Formulation
                </span>
                <p className="font-mono text-slate-800 font-semibold">da/dN = C · (ΔK)^m</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  C = {rulForecast.parisLawCoefficientC}, m = {rulForecast.parisLawExponentM}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Markov Degradation Transition
                </span>
                <p className="text-slate-700 font-medium">State Matrix P(S_t+1 | S_t)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  P(Minor → Moderate) = 0.18 / yr; P(Moderate → Severe) = 0.29 / yr
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Intervention Advisory
                </span>
                <p className="text-emerald-700 font-bold">
                  Recommended Action Window: Month 0 - 3
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Pressure resin injection extends structural service life by &gt;15 years.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------------------------- */}
      {/* SUB-TAB 5: ANOMALY & OUTLIER MINING */}
      {/* ----------------------------------------------------------------------------------------- */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Multivariate Anomaly Detection (Modified Z-Score & IQR Outliers)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Isolates structural inspection records with anomalous geometric propagation or unexpected vibration responses (&gt;2.1σ)
              </p>
            </div>

            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg">
              {activeAnomalies.length} Flagged Anomalies
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAnomalies.map((anom) => (
              <div
                key={anom.id}
                className="bg-white rounded-xl border border-amber-300 p-5 shadow-xs space-y-3 bg-gradient-to-br from-white to-amber-50/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900">{anom.structureName}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                    Anomaly Score: {anom.anomalyScore}σ
                  </span>
                </div>

                <p className="text-xs text-slate-600">{anom.componentType} • {anom.exposure}</p>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                  <strong className="block mb-0.5">Anomaly Detection Rationale:</strong>
                  {anom.anomalyReason}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Crack Width</span>
                    <strong className="font-mono text-red-600">{anom.crackWidthMm} mm</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Vibration Peak</span>
                    <strong className="font-mono text-slate-800">{anom.vibrationPeakMg} mg</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Strain Surge</span>
                    <strong className="font-mono text-slate-800">{anom.strainMicrostrain} με</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[10px]">Ref: {anom.reportId} • {anom.dateStr}</span>
                  <span className="text-blue-600 font-semibold text-[11px] flex items-center gap-1 cursor-pointer hover:underline">
                    <span>Prioritize PE Inspection</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
