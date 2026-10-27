/**
 * Structural Health Monitoring (SHM) System - Core Data Types
 */

export type CrackSeverity = 'Low' | 'Moderate' | 'High' | 'Critical' | 'None';

export type CrackType =
  | 'Hairline crack'
  | 'Surface crack'
  | 'Structural crack'
  | 'Vertical crack'
  | 'Horizontal crack'
  | 'Diagonal crack'
  | 'Branching crack'
  | 'Unknown'
  | 'No crack detected';

export type CrackDensity = 'Low' | 'Medium' | 'High' | 'None';

export type CrackOrientation = 'Vertical' | 'Horizontal' | 'Diagonal' | 'Irregular' | 'N/A';

export type StructuralCondition =
  | 'NORMAL'
  | 'MINOR DAMAGE'
  | 'MODERATE DAMAGE'
  | 'SEVERE DAMAGE'
  | 'REQUIRES PROFESSIONAL INSPECTION';

export interface CrackMetrics {
  crackDetected: boolean;
  severity: CrackSeverity;
  crackType: CrackType;
  lengthPx: number;
  lengthMm: number; // calculated via calibration
  widthPx: number;
  widthMm: number;
  maxWidthPx: number;
  maxWidthMm: number;
  density: CrackDensity;
  orientation: CrackOrientation;
  affectedAreaPercentage: number;
  confidence: number;
  numRegions: number;
  totalCrackPixels: number;
  longestCrackPx: number;
  longestCrackMm: number;
  dominantDirection: string;
  structuralCondition: StructuralCondition;
}

export interface PipelineStages {
  originalUrl: string;
  enhancedUrl: string;
  binaryMaskUrl: string;
  overlayUrl: string;
  width: number;
  height: number;
}

export interface AIObservations {
  engineeringInterpretation: string;
  probableCauses: string[];
  potentialRisks: string[];
  technicalRecommendations: string[];
  monitoringInterval: string;
  screeningSummary: string;
}

export interface InspectionRecord {
  id: string;
  reportId: string;
  timestamp?: string;
  dateStr: string;
  timeStr: string;
  imageName: string;
  structureName: string;
  componentType: string;
  environmentalExposure?: string;
  metrics: CrackMetrics;
  stages: PipelineStages;
  aiObservations: AIObservations;
  calibrationMmPerPx: number;
  notes?: string;
}

export interface IoTSensorData {
  id: string;
  name: string;
  type: 'vibration' | 'temperature' | 'humidity' | 'tilt' | 'strain' | 'displacement';
  value: number;
  unit: string;
  normalRange: [number, number];
  warningThreshold: number;
  status: 'normal' | 'warning' | 'alert';
  history: { time: string; value: number }[];
}

export interface SystemCalibration {
  mmPerPixel: number; // e.g. 0.25 mm/px
  referenceObjectName: string;
}

export type AIDocumentType =
  | 'engineering-assessment'
  | 'executive-summary'
  | 'repair-work-order'
  | 'safety-hazard-memo'
  | 'shm-monitoring-plan';

export interface AIDocumentSection {
  heading: string;
  body: string;
  bulletPoints?: string[];
}

export interface GeneratedAIDocument {
  id: string;
  reportId: string;
  title: string;
  subtitle: string;
  documentType: AIDocumentType;
  standard: string;
  targetAudience: string;
  createdAt: string;
  executiveSummary: string;
  sections: AIDocumentSection[];
  keyRecommendations: string[];
  materialsOrEquipment?: string[];
  structuralRiskLevel: string;
  source: 'gemini-3.8-flash' | 'engineering-expert-system';
}
