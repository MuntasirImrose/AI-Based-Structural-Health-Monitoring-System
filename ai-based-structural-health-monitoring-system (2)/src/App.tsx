import React, { useState, useEffect } from 'react';
import { InspectionRecord, CrackMetrics, PipelineStages, AIObservations } from './types/shm';
import { processStructuralImage } from './services/cvPipeline';
import { generateAIObservations } from './services/aiService';
import { getDemoSamples, DemoSample } from './services/demoSamples';
import { generateStructuralPDFReport } from './services/pdfReportService';
import { download30PageWordReport, downloadWordDocFallback } from './services/wordReportGenerator';

// UI Components
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { UploadSection } from './components/UploadSection';
import { ProcessingProgress } from './components/ProcessingProgress';
import { PipelineStageCards } from './components/PipelineStageCards';
import { CrackMapViewer } from './components/CrackMapViewer';
import { MetricsDashboard } from './components/MetricsDashboard';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { IoTMonitoringModule } from './components/IoTMonitoringModule';
import { HistorySection } from './components/HistorySection';
import { SettingsModal } from './components/SettingsModal';
import { AIDocumentCreator } from './components/AIDocumentCreator';
import { DataMiningModule } from './components/DataMiningModule';
import { FileText, Download, ShieldAlert, Sparkles, Layers, ArrowLeft } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'shm_history_records';

/**
 * Strips bulky base64 canvas imagery before saving to localStorage to prevent QuotaExceededError.
 * In-memory React state retains full stages during user session.
 */
function sanitizeRecordForStorage(record: InspectionRecord): InspectionRecord {
  return {
    ...record,
    stages: {
      originalUrl: '',
      enhancedUrl: '',
      binaryMaskUrl: '',
      overlayUrl: '',
      width: record.stages?.width || 640,
      height: record.stages?.height || 480,
    },
  };
}

function safePersistHistory(records: InspectionRecord[]): void {
  try {
    const sanitized = records.map(sanitizeRecordForStorage);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('LocalStorage quota warning; trimming history entries:', err);
    try {
      // Keep only most recent 8 records
      const trimmed = records.slice(0, 8).map(sanitizeRecordForStorage);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e2) {
      console.warn('LocalStorage quota exceeded after trimming, clearing history key:', e2);
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch {}
    }
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [calibrationMmPerPx, setCalibrationMmPerPx] = useState(0.25);

  const [currentRecord, setCurrentRecord] = useState<InspectionRecord | null>(null);
  const [historyRecords, setHistoryRecords] = useState<InspectionRecord[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [qualityWarning, setQualityWarning] = useState<string | null>(null);

  // Initialize with sample historical records for trend demonstration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistoryRecords(parsed);
          // If any older saved records still contained huge base64 strings, re-save sanitized to immediately free quota
          const hasHeavyStages = parsed.some(
            (r: any) =>
              (r.stages?.originalUrl && r.stages.originalUrl.length > 150) ||
              (r.stages?.overlayUrl && r.stages.overlayUrl.length > 150)
          );
          if (hasHeavyStages) {
            safePersistHistory(parsed);
          }
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse cached history', e);
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch {}
    }

    // Seed realistic longitudinal data
    const baselineRecords: InspectionRecord[] = [
      {
        id: 'rec-base-01',
        reportId: 'SHM-20250715-4819',
        dateStr: '2025-07-15',
        timeStr: '09:30 AM',
        imageName: 'bridge_pier_south_baseline.jpg',
        structureName: 'Highway Overpass Pier #12',
        componentType: 'Mass Concrete Bridge Pier',
        metrics: {
          crackDetected: true,
          severity: 'Low',
          crackType: 'Hairline crack',
          lengthPx: 120,
          lengthMm: 30.0,
          widthPx: 1.6,
          widthMm: 0.4,
          maxWidthPx: 2.2,
          maxWidthMm: 0.55,
          density: 'Low',
          orientation: 'Diagonal',
          affectedAreaPercentage: 0.85,
          confidence: 86,
          numRegions: 1,
          totalCrackPixels: 192,
          longestCrackPx: 120,
          longestCrackMm: 30.0,
          dominantDirection: 'Diagonal (45°)',
          structuralCondition: 'MINOR DAMAGE',
        },
        stages: {
          originalUrl: '',
          enhancedUrl: '',
          binaryMaskUrl: '',
          overlayUrl: '',
          width: 640,
          height: 480,
        },
        aiObservations: {
          engineeringInterpretation: 'Early stage hairline diagonal fissure observed. Likely attributable to early thermal curing contraction and micro-shear stresses.',
          probableCauses: ['Initial concrete drying shrinkage', 'Ambient temperature fluctuation'],
          potentialRisks: ['Moisture penetration if left unsealed'],
          technicalRecommendations: ['Log photographic baseline', 'Re-inspect in 6 months'],
          monitoringInterval: 'Semi-annual (6 months)',
          screeningSummary: 'AI preliminary screening indicates minor hairline cracking.',
        },
        calibrationMmPerPx: 0.25,
      },
      {
        id: 'rec-base-02',
        reportId: 'SHM-20251120-6291',
        dateStr: '2025-11-20',
        timeStr: '02:15 PM',
        imageName: 'bridge_pier_south_followup.jpg',
        structureName: 'Highway Overpass Pier #12',
        componentType: 'Mass Concrete Bridge Pier',
        metrics: {
          crackDetected: true,
          severity: 'Moderate',
          crackType: 'Structural crack',
          lengthPx: 175,
          lengthMm: 43.8,
          widthPx: 2.6,
          widthMm: 0.65,
          maxWidthPx: 3.4,
          maxWidthMm: 0.85,
          density: 'Medium',
          orientation: 'Diagonal',
          affectedAreaPercentage: 1.45,
          confidence: 89,
          numRegions: 1,
          totalCrackPixels: 455,
          longestCrackPx: 175,
          longestCrackMm: 43.8,
          dominantDirection: 'Diagonal (48°)',
          structuralCondition: 'MODERATE DAMAGE',
        },
        stages: {
          originalUrl: '',
          enhancedUrl: '',
          binaryMaskUrl: '',
          overlayUrl: '',
          width: 640,
          height: 480,
        },
        aiObservations: {
          engineeringInterpretation: 'Longitudinal expansion detected along the diagonal shear trajectory. Fissure widened from 0.40mm to 0.65mm.',
          probableCauses: ['Heavy vehicular dynamic impact loading', 'Freeze-thaw thermal expansion'],
          potentialRisks: ['Water ingress triggering rebar depassivation'],
          technicalRecommendations: ['Perform ultrasonic non-destructive testing', 'Re-inspect in 3 months'],
          monitoringInterval: 'Quarterly (3 months)',
          screeningSummary: 'AI preliminary screening indicates moderate shear fissure progression.',
        },
        calibrationMmPerPx: 0.25,
      },
    ];

    setHistoryRecords(baselineRecords);
    safePersistHistory(baselineRecords);
  }, []);

  const saveRecordToHistory = (record: InspectionRecord) => {
    setHistoryRecords((prev) => {
      const updated = [record, ...prev];
      safePersistHistory(updated);
      return updated;
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the inspection history log?')) {
      setHistoryRecords([]);
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch (err) {
        console.warn('Failed to clear history from localStorage:', err);
      }
    }
  };

  // Main Image Analysis Pipeline Runner
  const handleImageSelected = async (
    dataUrl: string,
    fileName: string,
    demoContext?: Partial<DemoSample>
  ) => {
    setIsProcessing(true);
    setProcessingStep(0); // Analyzing image...
    setQualityWarning(null);

    try {
      // Step 1: Image Enhancement & Noise Filtering (fast visual transition)
      setProcessingStep(1);
      await new Promise((r) => setTimeout(r, 35));

      // Execute Optimized Computer Vision Pipeline (< 60ms)
      const cvResult = await processStructuralImage(dataUrl, calibrationMmPerPx);

      if (cvResult.quality.warning) {
        setQualityWarning(cvResult.quality.warning);
      } else if (cvResult.quality.brightness < 45) {
        setQualityWarning(
          'Image quality note: Low illumination detected. Image quality may affect detection accuracy. Consider capturing with improved lighting.'
        );
      }

      setProcessingStep(2); // Detecting crack regions...
      await new Promise((r) => setTimeout(r, 35));

      setProcessingStep(3); // Measuring crack characteristics...
      await new Promise((r) => setTimeout(r, 35));

      setProcessingStep(4); // Generating recommendations...
      // Query AI / Fallback reasoning (with fast 1.5s timeout / instant fallback)
      const aiObs = await generateAIObservations(cvResult.metrics, {
        structureName: demoContext?.structureName || 'Structural Component',
        componentType: demoContext?.componentType || 'Reinforced Concrete',
        environment: demoContext?.environment || 'Ambient Environmental Exposure',
      });

      // Build inspection record
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const reportId = `SHM-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${randomSuffix}`;

      const newRecord: InspectionRecord = {
        id: `rec-${Date.now()}`,
        reportId,
        dateStr,
        timeStr,
        imageName: fileName,
        structureName: demoContext?.structureName || 'Reinforced Concrete Structure',
        componentType: demoContext?.componentType || 'Structural Surface Member',
        metrics: cvResult.metrics,
        stages: cvResult.stages,
        aiObservations: aiObs,
        calibrationMmPerPx,
      };

      setCurrentRecord(newRecord);
      saveRecordToHistory(newRecord);

      // Switch to analysis tab to show the results
      setActiveTab('analysis');
    } catch (error) {
      console.error('Image processing pipeline failed:', error);
      alert('An error occurred during image processing. Please check image format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Instant 1-click Demo Mode Trigger
  const handleTryDemo = () => {
    const samples = getDemoSamples();
    // Default to the prominent Bridge Crack scenario
    const sample = samples[1] || samples[0];
    const dataUrl = sample.generateDataUrl();
    handleImageSelected(dataUrl, `${sample.id}.png`, sample);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTryDemo={handleTryDemo}
        hasActiveInspection={!!currentRecord}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Processing Indicator if actively calculating */}
        {isProcessing && <ProcessingProgress currentStep={processingStep} />}

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            records={historyRecords}
            onUploadClick={() => setActiveTab('analysis')}
            onTryDemo={handleTryDemo}
            onViewAnalysis={() => setActiveTab('analysis')}
            hasActiveInspection={!!currentRecord}
            onSelectRecord={(rec) => {
              setCurrentRecord(rec);
              setActiveTab('analysis');
            }}
            onNavigateToDataMining={() => setActiveTab('data-mining')}
          />
        )}

        {/* Tab 2: Image Analysis (Primary Workspace) */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Upload Area */}
            <UploadSection
              onImageSelected={handleImageSelected}
              isProcessing={isProcessing}
              qualityWarning={qualityWarning}
            />

            {/* If an inspection is loaded, show the complete inspection suite */}
            {currentRecord ? (
              <>
                {/* 4 Pipeline Stage Cards */}
                <PipelineStageCards stages={currentRecord.stages} />

                {/* Quantitative Metrics & Results Matrix */}
                <MetricsDashboard
                  metrics={currentRecord.metrics}
                  calibrationMmPerPx={currentRecord.calibrationMmPerPx}
                />

                {/* Visual Crack Map Viewer */}
                <CrackMapViewer stages={currentRecord.stages} />

                {/* Recommendations & Report Actions */}
                <RecommendationsPanel
                  metrics={currentRecord.metrics}
                  aiObservations={currentRecord.aiObservations}
                  currentRecord={currentRecord}
                  onGenerateReport={() => setActiveTab('reports')}
                  onOpenAIDocuments={() => setActiveTab('ai-documents')}
                />
              </>
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No Active Image Inspection</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Upload an image above or click "Try Demo" to run the computer vision edge detection and AI structural assessment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Crack Detection (Dedicated High-Res Map Viewer) */}
        {activeTab === 'crack-map' && (
          <div>
            {currentRecord ? (
              <div className="space-y-6">
                <CrackMapViewer stages={currentRecord.stages} />
                <PipelineStageCards stages={currentRecord.stages} />
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-800">Crack Detection Viewer</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Please analyze an image or try a demo scenario first to activate the interactive crack map.
                </p>
                <button
                  onClick={handleTryDemo}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Launch Demo Crack Map
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: AI Documents Creator */}
        {activeTab === 'ai-documents' && (
          <AIDocumentCreator
            currentRecord={currentRecord}
            onNavigateToUpload={() => setActiveTab('analysis')}
          />
        )}

        {/* Tab 5: Data Mining & Predictive Analytics */}
        {activeTab === 'data-mining' && (
          <DataMiningModule
            userRecords={historyRecords}
            activeRecord={currentRecord}
            onSelectRecordForInspection={(recId) => {
              const rec = historyRecords.find((r) => r.id === recId || r.reportId === recId);
              if (rec) {
                setCurrentRecord(rec);
                setActiveTab('analysis');
              }
            }}
          />
        )}

        {/* Tab 6: IoT Monitoring */}
        {activeTab === 'iot' && <IoTMonitoringModule />}

        {/* Tab 5: History */}
        {activeTab === 'history' && (
          <HistorySection
            records={historyRecords}
            onSelectRecord={(rec) => {
              setCurrentRecord(rec);
              setActiveTab('analysis');
            }}
            onClearHistory={handleClearHistory}
          />
        )}

        {/* Tab 6: Reports */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Structural Health Reports & Export Center
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official engineering documentation: 30-Page Word Forensic Reports (.docx), PDF screening summaries, and audit logs
                </p>
              </div>

              {currentRecord && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    id="download-active-30page-word-btn"
                    onClick={() => download30PageWordReport(currentRecord)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4 text-indigo-200" />
                    <span>Download 30-Page Word (.docx)</span>
                  </button>

                  <button
                    onClick={() => generateStructuralPDFReport(currentRecord)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Report</span>
                  </button>
                </div>
              )}
            </div>

            {/* 30-Page Word Document Showcase Banner */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/50 shadow-md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Comprehensive 30-Page Forensic Investigation</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Full 30-Page Structural Health Monitoring Word Document (.docx)
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Generates a publication-grade, 30-page forensic engineering assessment conforming to ACI 224.1R, AASHTO Manual for Bridge Evaluation, and ASTM C881. Features 30 distinct sections including calibrated computer vision fracture mechanics, FEM load capacity correlation, UPV/GPR survey protocols, IoT LoRaWAN telemetry topologies, CFRP strengthening specifications, itemized BOQ remediation budget ($23.6k), and official Professional Engineer seal.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-indigo-200">
                    <span className="px-2 py-0.5 rounded bg-white/10 font-mono">30 Formatted Sections</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 font-mono">Explicit Page Breaks</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 font-mono">ASTM & ACI Tolerances</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 font-mono">PE Attestation Block</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
                  <button
                    id="showcase-download-docx-btn"
                    onClick={() => download30PageWordReport(currentRecord || historyRecords[0] || null)}
                    className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>Download 30-Page Word (.docx)</span>
                  </button>
                  <button
                    id="showcase-download-doc-fallback-btn"
                    onClick={() => downloadWordDocFallback(currentRecord || historyRecords[0] || null)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-300" />
                    <span>Download Word (.doc Format)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Active Report Preview Banner */}
            {currentRecord && (
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      ACTIVE REPORT: {currentRecord.reportId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        currentRecord.metrics.severity === 'Critical' || currentRecord.metrics.severity === 'High'
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {currentRecord.metrics.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {currentRecord.structureName} • Inspected: {currentRecord.dateStr} {currentRecord.timeStr}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => download30PageWordReport(currentRecord)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Word (.docx)</span>
                  </button>

                  <button
                    onClick={() => generateStructuralPDFReport(currentRecord)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Report</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reports List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Available Reports ({historyRecords.length})
              </h3>

              {historyRecords.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  No inspection reports available. Upload an image to generate an official document.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {historyRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900 truncate">
                            {rec.reportId}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              rec.metrics.severity === 'Critical' || rec.metrics.severity === 'High'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {rec.metrics.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {rec.structureName} • {rec.dateStr}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => download30PageWordReport(rec)}
                          className="px-2.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-medium rounded flex items-center gap-1 shadow-2xs transition-colors"
                          title="Download 30-Page Word (.docx)"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-200" />
                          <span>Word</span>
                        </button>

                        <button
                          onClick={() => generateStructuralPDFReport(rec)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded flex items-center gap-1 shadow-2xs transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Settings Trigger */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-900 mb-2">System Settings & Calibration</h2>
            <p className="text-xs text-slate-500 mb-4">
              Configure scale calibration factor (mm/pixel) or read local Python/FastAPI and Node.js setup guides.
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Open Calibration & Architecture Modal
            </button>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen || activeTab === 'settings'}
        onClose={() => {
          setIsSettingsOpen(false);
          if (activeTab === 'settings') setActiveTab('dashboard');
        }}
        calibrationMmPerPx={calibrationMmPerPx}
        onUpdateCalibration={(val) => setCalibrationMmPerPx(val)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-200">
              AI-Based Structural Health Monitoring System (SHM)
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Preliminary screening & auxiliary monitoring tool for civil infrastructure
            </p>
          </div>

          <div className="text-[11px] text-slate-400 max-w-lg text-right">
            <span>
              Disclaimer: Image-based analysis cannot replace physical, non-destructive, or core sample testing by a certified Professional Structural Engineer (PE/SE).
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
