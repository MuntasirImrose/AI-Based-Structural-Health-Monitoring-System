import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  FileText,
  Download,
  Copy,
  Printer,
  Check,
  RefreshCw,
  Edit3,
  Save,
  Trash2,
  Building2,
  HardHat,
  ShieldCheck,
  Radio,
  FileCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { InspectionRecord, GeneratedAIDocument, AIDocumentType } from '../types/shm';
import {
  generateAIDocument,
  exportAIDocumentToPDF,
  exportAIDocumentToMarkdown,
  getSavedAIDocuments,
  deleteAIDocument
} from '../services/aiDocumentService';
import { download30PageWordReport, downloadWordDocFallback } from '../services/wordReportGenerator';

interface AIDocumentCreatorProps {
  currentRecord: InspectionRecord | null;
  onNavigateToUpload: () => void;
}

export const AIDocumentCreator: React.FC<AIDocumentCreatorProps> = ({
  currentRecord,
  onNavigateToUpload,
}) => {
  const [selectedDocType, setSelectedDocType] = useState<AIDocumentType>('engineering-assessment');
  const [standard, setStandard] = useState('ACI 224.1R & ASTM Standards');
  const [targetAudience, setTargetAudience] = useState('Structural Engineers & Asset Managers');
  const [tone, setTone] = useState('Technical & Prescriptive');
  const [engineerNotes, setEngineerNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDocument, setActiveDocument] = useState<GeneratedAIDocument | null>(null);
  const [savedDocs, setSavedDocs] = useState<GeneratedAIDocument[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved documents on mount
  useEffect(() => {
    const list = getSavedAIDocuments();
    setSavedDocs(list);
    if (list.length > 0 && !activeDocument) {
      setActiveDocument(list[0]);
    }
  }, []);

  const documentTypesList = [
    {
      id: 'engineering-assessment' as AIDocumentType,
      title: 'Structural Engineering Assessment',
      subtitle: 'Technical condition survey, fracture mechanics, and code compliance',
      icon: FileCheck,
      color: 'blue',
      badge: 'Comprehensive',
    },
    {
      id: 'executive-summary' as AIDocumentType,
      title: 'Executive Risk & Integrity Summary',
      subtitle: 'High-level business appraisal, financial risk index, and asset life impact',
      icon: Building2,
      color: 'indigo',
      badge: 'Stakeholder',
    },
    {
      id: 'repair-work-order' as AIDocumentType,
      title: 'Contractor Remediation Work Order',
      subtitle: 'Technical specifications, injection protocol, surface prep, and materials',
      icon: HardHat,
      color: 'emerald',
      badge: 'Prescriptive',
    },
    {
      id: 'safety-hazard-memo' as AIDocumentType,
      title: 'Safety Hazard & Containment Memo',
      subtitle: 'Immediate precautionary cordon, load restrictions, and 24-hr escalation',
      icon: ShieldCheck,
      color: 'amber',
      badge: 'Urgent',
    },
    {
      id: 'shm-monitoring-plan' as AIDocumentType,
      title: 'SHM Sensor Telemetry Protocol',
      subtitle: 'IoT sensor schedules, dynamic vibration thresholds, and LoRaWAN cadence',
      icon: Radio,
      color: 'purple',
      badge: 'IoT Plan',
    },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const doc = await generateAIDocument({
        record: currentRecord,
        documentType: selectedDocType,
        standard,
        targetAudience,
        tone,
        engineerNotes,
      });
      setActiveDocument(doc);
      setSavedDocs(getSavedAIDocuments());
      setIsEditing(false);
    } catch (err) {
      console.error('Document generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!activeDocument) return;
    let fullText = `${activeDocument.title}\n${activeDocument.subtitle}\n\n`;
    fullText += `Standard: ${activeDocument.standard}\nAudience: ${activeDocument.targetAudience}\nRisk Index: ${activeDocument.structuralRiskLevel}\n\n`;
    fullText += `EXECUTIVE SUMMARY:\n${activeDocument.executiveSummary}\n\n`;

    activeDocument.sections.forEach((sec) => {
      fullText += `${sec.heading}\n${sec.body}\n`;
      if (sec.bulletPoints) {
        sec.bulletPoints.forEach((b) => (fullText += `• ${b}\n`));
      }
      fullText += `\n`;
    });

    if (activeDocument.keyRecommendations) {
      fullText += `KEY RECOMMENDATIONS:\n`;
      activeDocument.keyRecommendations.forEach((r, i) => (fullText += `${i + 1}. ${r}\n`));
      fullText += `\n`;
    }

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (activeDocument) {
      exportAIDocumentToPDF(activeDocument, currentRecord);
    }
  };

  const handleDownloadMarkdown = () => {
    if (activeDocument) {
      exportAIDocumentToMarkdown(activeDocument);
    }
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAIDocument(id);
    const updated = getSavedAIDocuments();
    setSavedDocs(updated);
    if (activeDocument?.id === id) {
      setActiveDocument(updated.length > 0 ? updated[0] : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>AI-Powered Structural Documentation Studio</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              AI Structural Health Document Creator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Synthesize computer vision crack metrics into official engineering assessment reports, executive stakeholder summaries, repair work orders, or IoT monitoring plans using Gemini AI.
            </p>
          </div>

          {currentRecord ? (
            <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-700/80 rounded-xl p-4 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Active Source Inspection
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">{currentRecord.structureName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentRecord.metrics.severity === 'Critical' || currentRecord.metrics.severity === 'High'
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {currentRecord.metrics.severity}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                {currentRecord.componentType} • {currentRecord.metrics.orientation} Crack • Max {currentRecord.metrics.maxWidthMm.toFixed(2)} mm
              </p>
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-xs text-center">
              <p className="text-slate-300 font-medium">No inspection selected</p>
              <button
                onClick={onNavigateToUpload}
                className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-[11px] inline-flex items-center gap-1"
              >
                <span>Upload Image or Run Demo</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Type Selector & Parameters (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Document Archetype Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>1. Select Document Template</span>
            </h3>

            <div className="space-y-2">
              {documentTypesList.map((docType) => {
                const Icon = docType.icon;
                const isSelected = selectedDocType === docType.id;
                return (
                  <button
                    key={docType.id}
                    onClick={() => setSelectedDocType(docType.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                          {docType.title}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {docType.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                        {docType.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Configuration Parameters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>2. Engineering Parameters & Codes</span>
            </h3>

            {/* Standard */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Governing Code / Standard
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="ACI 224.1R & ASTM Standards">ACI 224.1R (Causes & Repair of Cracks) & ASTM</option>
                <option value="AASHTO Manual for Bridge Evaluation">AASHTO Manual for Bridge Evaluation (LRFR)</option>
                <option value="Eurocode 2 (EN 1992-1-1)">Eurocode 2 (EN 1992: Concrete Structures)</option>
                <option value="ISO 13822 Existing Structures">ISO 13822 (Bases for Design: Existing Structures)</option>
                <option value="ICRI 310.1R Surface Repair">ICRI Technical Guideline No. 310.1R</option>
              </select>
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Target Audience
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Structural Engineers & Forensic Specialists">Structural Engineers & Forensic Specialists</option>
                <option value="Asset Owners & Facility Executives">Asset Owners & Facility Executives</option>
                <option value="Civil Contractors & Remediation Crew">Civil Contractors & Remediation Crew</option>
                <option value="Municipal Building Regulators & Inspectors">Municipal Regulators & City Inspectors</option>
              </select>
            </div>

            {/* Document Tone */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Editorial Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="Technical & Prescriptive">Technical & Prescriptive (Forensic Detail)</option>
                <option value="Executive & Concise">Executive & High-Level (Asset Health Focus)</option>
                <option value="Contractor Actionable">Contractor Actionable (Execution Sequences)</option>
              </select>
            </div>

            {/* Engineer Field Notes */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Field Engineer Notes / Site Context (Optional)
              </label>
              <textarea
                value={engineerNotes}
                onChange={(e) => setEngineerNotes(e.target.value)}
                placeholder="e.g. Fissure widened after seasonal freezing; heavy truck lane above pier; moisture seepage observed..."
                rows={3}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 resize-none"
              />
            </div>

            {/* Primary Generate Action */}
            <button
              id="ai-generate-doc-btn"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Document with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Generate Document with AI</span>
                </>
              )}
            </button>
          </div>

          {/* 3. Document Archive List */}
          {savedDocs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Document History ({savedDocs.length})
                </h3>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {savedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setActiveDocument(doc);
                      setIsEditing(false);
                    }}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                      activeDocument?.id === doc.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {doc.reportId} • {doc.createdAt}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Document View & Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeDocument ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Document Action Toolbar */}
              <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {activeDocument.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Engineering System'}
                  </span>
                  <span className="text-xs text-slate-300 hidden sm:inline">
                    Ref: {activeDocument.reportId}
                  </span>
                </div>

                {/* Export & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => download30PageWordReport(currentRecord)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    title="Download comprehensive 30-page forensic engineering assessment in Word (.docx) format"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-200" />
                    <span>30-Page Word (.docx)</span>
                  </button>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isEditing ? 'bg-amber-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    <span>{isEditing ? 'Finish Editing' : 'Edit Content'}</span>
                  </button>

                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Copy full document text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors hidden sm:flex"
                    title="Download Markdown"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Markdown</span>
                  </button>

                  <button
                    id="download-doc-pdf-btn"
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Formatted Document Paper Canvas */}
              <div className="p-6 sm:p-8 space-y-6 text-slate-800 bg-white">
                {/* Document Heading */}
                <div className="border-b border-slate-200 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      Official Engineering Technical Documentation
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeDocument.structuralRiskLevel === 'Critical' || activeDocument.structuralRiskLevel === 'High'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Risk Index: {activeDocument.structuralRiskLevel}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">{activeDocument.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{activeDocument.subtitle}</p>

                  {/* Metadata Chips */}
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
                      Standard: {activeDocument.standard}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
                      Audience: {activeDocument.targetAudience}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
                      Date: {activeDocument.createdAt}
                    </span>
                  </div>
                </div>

                {/* Executive Summary Callout */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-900 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-700" />
                    <span>Executive Damage Appraisal</span>
                  </h4>
                  {isEditing ? (
                    <textarea
                      value={activeDocument.executiveSummary}
                      onChange={(e) =>
                        setActiveDocument({ ...activeDocument, executiveSummary: e.target.value })
                      }
                      rows={3}
                      className="w-full text-xs p-2 bg-white border border-blue-300 rounded-lg text-slate-800 focus:outline-hidden"
                    />
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-800">
                      {activeDocument.executiveSummary}
                    </p>
                  )}
                </div>

                {/* Document Sections */}
                <div className="space-y-6">
                  {activeDocument.sections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={section.heading}
                          onChange={(e) => {
                            const newSections = [...activeDocument.sections];
                            newSections[sIdx].heading = e.target.value;
                            setActiveDocument({ ...activeDocument, sections: newSections });
                          }}
                          className="w-full text-xs font-bold text-slate-900 p-1.5 border border-slate-300 rounded"
                        />
                      ) : (
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs" />
                          <span>{section.heading}</span>
                        </h3>
                      )}

                      {isEditing ? (
                        <textarea
                          value={section.body}
                          onChange={(e) => {
                            const newSections = [...activeDocument.sections];
                            newSections[sIdx].body = e.target.value;
                            setActiveDocument({ ...activeDocument, sections: newSections });
                          }}
                          rows={3}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                        />
                      ) : (
                        <p className="text-xs text-slate-600 leading-relaxed">{section.body}</p>
                      )}

                      {section.bulletPoints && section.bulletPoints.length > 0 && (
                        <ul className="space-y-1.5 pt-1">
                          {section.bulletPoints.map((bp, bIdx) => (
                            <li key={bIdx} className="text-xs text-slate-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key Technical Actions */}
                {activeDocument.keyRecommendations && activeDocument.keyRecommendations.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Mandatory Technical Actions & Recommendations
                    </h4>
                    <div className="space-y-2">
                      {activeDocument.keyRecommendations.map((rec, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                            {rIdx + 1}
                          </span>
                          <span className="text-slate-800 leading-snug">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment & Materials Checklist */}
                {activeDocument.materialsOrEquipment && activeDocument.materialsOrEquipment.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Specified Equipment & Testing Instrumentation
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {activeDocument.materialsOrEquipment.map((mat, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-700 flex items-center gap-2"
                        >
                          <span className="w-4 h-4 rounded border border-slate-400 bg-white flex items-center justify-center shrink-0 text-[10px] text-slate-600">
                            ✓
                          </span>
                          <span className="truncate">{mat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engineering Sign-Off Box */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      System Author
                    </span>
                    <p className="font-semibold text-slate-800">AI Structural Health Engine</p>
                    <p className="text-[10px] text-slate-500">v3.8 Multi-Scale Processor</p>
                  </div>

                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Verification Status
                    </span>
                    <p className="font-semibold text-amber-700">Preliminary Assessment</p>
                    <p className="text-[10px] text-slate-500">Qualified PE Sign-off Required</p>
                  </div>

                  <div className="p-3 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Distribution
                    </span>
                    <p className="font-semibold text-slate-800">Auditable PDF Archive</p>
                    <p className="text-[10px] text-slate-500">Document ID: {activeDocument.id.slice(-8)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Document Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Configure your document template on the left and click "Generate Document with AI" to create a structural report.
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Assessment Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
