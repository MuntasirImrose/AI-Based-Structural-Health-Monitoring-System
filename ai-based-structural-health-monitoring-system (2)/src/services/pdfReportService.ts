/**
 * PDF Report Generator using jsPDF
 * Generates an official "AI-Based Structural Health Monitoring Report"
 * containing all 21 mandated structural items, images, tables, recommendations, and warnings.
 */

import { jsPDF } from 'jspdf';
import { InspectionRecord } from '../types/shm';

export async function generateStructuralPDFReport(record: InspectionRecord): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // 1. Header Banner (Dark Blue Engineering Style)
  doc.setFillColor(15, 23, 42); // #0f172a (Deep navy)
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('AI-BASED STRUCTURAL HEALTH MONITORING REPORT', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Automated Computer Vision & AI Preliminary Screening Documentation', margin, 18);
  doc.text(`REPORT ID: ${record.reportId}`, pageWidth - margin - 50, 18);

  y = 34;

  // Metadata Grid
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('INSPECTION DATE & TIME:', margin + 4, y + 6);
  doc.text('TARGET STRUCTURE:', margin + 65, y + 6);
  doc.text('COMPONENT TYPE:', margin + 125, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.text(`${record.dateStr}  ${record.timeStr}`, margin + 4, y + 12);
  doc.text(record.structureName || 'Bridge Pier #4 (South Abutment)', margin + 65, y + 12);
  doc.text(record.componentType || 'Reinforced Concrete Pier', margin + 125, y + 12);

  y += 26;

  // Inspection Scope & Evaluation Protocol Box
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');

  doc.setTextColor(30, 41, 59); // Slate 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('STRUCTURAL HEALTH ASSESSMENT SCOPE & PROTOCOL:', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const protocolText = 'Automated computer vision crack surface extraction and quantitative geometric measurement calibrated at 0.25 mm/pixel. Observations documented for engineering review and structural monitoring.';
  const wrappedProtocol = doc.splitTextToSize(protocolText, contentWidth - 8);
  doc.text(wrappedProtocol, margin + 4, y + 8.5);

  y += 16;

  // Section 1: Computer Vision Pipeline Stages (4-Grid)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. COMPUTER VISION PROCESSING PIPELINE STAGES', margin, y);
  y += 4;

  const cardW = (contentWidth - 6) / 4;
  const cardH = 34;

  const stages = [
    { title: 'Stage 1: Original', url: record.stages.originalUrl },
    { title: 'Stage 2: Enhanced', url: record.stages.enhancedUrl },
    { title: 'Stage 3: Binary Mask', url: record.stages.binaryMaskUrl },
    { title: 'Stage 4: Detection Overlay', url: record.stages.overlayUrl },
  ];

  stages.forEach((stage, idx) => {
    const xPos = margin + idx * (cardW + 2);
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(241, 245, 249);
    doc.rect(xPos, y, cardW, cardH, 'FD');

    try {
      doc.addImage(stage.url, 'PNG', xPos + 1, y + 1, cardW - 2, cardH - 8, undefined, 'FAST');
    } catch (e) {
      // Fallback placeholder
      doc.setFontSize(6);
      doc.text('[Image]', xPos + 8, y + 16);
    }

    doc.setFillColor(255, 255, 255);
    doc.rect(xPos, y + cardH - 6, cardW, 6, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(stage.title, xPos + 1.5, y + cardH - 2);
  });

  y += cardH + 6;

  // Section 2: Quantitative Crack Metrics Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. QUANTITATIVE VISUAL MEASUREMENTS & CHARACTERISTICS', margin, y);
  y += 4;

  const m = record.metrics;
  const tableData = [
    ['Crack Detection Result', m.crackDetected ? 'YES (Crack Detected)' : 'NO (No Crack Detected)', 'Estimated Severity', m.severity.toUpperCase()],
    ['Estimated Crack Type', m.crackType, 'Estimated Crack Length', `${m.lengthPx} px  (~${m.lengthMm} mm)`],
    ['Estimated Average Width', `${m.widthPx} px  (~${m.widthMm} mm)`, 'Estimated Maximum Width', `${m.maxWidthPx} px  (~${m.maxWidthMm} mm)`],
    ['Crack Density', m.density, 'Crack Orientation', m.orientation],
    ['Affected Image Area', `${m.affectedAreaPercentage.toFixed(2)}%`, 'Detection Confidence', `${m.confidence}%`],
    ['Detected Crack Regions', `${m.numRegions} region(s)`, 'Dominant Direction', m.dominantDirection],
    ['Preliminary Structural Condition', m.structuralCondition, 'Calibration Reference', `${record.calibrationMmPerPx} mm/px`],
  ];

  doc.setFontSize(7.5);
  const rowHeight = 5.2;
  const col1W = 42;
  const col2W = 45;
  const col3W = 42;
  const col4W = contentWidth - (col1W + col2W + col3W);

  tableData.forEach((row, i) => {
    const rowY = y + i * rowHeight;
    doc.setFillColor(i % 2 === 0 ? 248 : 255, i % 2 === 0 ? 250 : 255, i % 2 === 0 ? 252 : 255);
    doc.rect(margin, rowY, contentWidth, rowHeight, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, rowY, margin + contentWidth, rowY);

    // Label 1
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(row[0], margin + 2, rowY + 3.8);

    // Value 1
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(row[1], margin + col1W + 2, rowY + 3.8);

    // Label 2
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(row[2], margin + col1W + col2W + 2, rowY + 3.8);

    // Value 2
    doc.setFont('helvetica', 'bold');
    if (row[3].includes('CRITICAL') || row[3].includes('HIGH') || row[3].includes('SEVERE') || row[3].includes('REQUIRES')) {
      doc.setTextColor(220, 38, 38);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(row[3], margin + col1W + col2W + col3W + 2, rowY + 3.8);
  });

  y += tableData.length * rowHeight + 6;

  // Section 3: AI Observations & Engineering Causations
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. AI PRELIMINARY OBSERVATIONS & ENGINEERING CAUSATIONS', margin, y);
  y += 4.5;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('ENGINEERING INTERPRETATION:', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const wrappedInterp = doc.splitTextToSize(record.aiObservations.engineeringInterpretation, contentWidth - 6);
  doc.text(wrappedInterp, margin + 3, y + 9);

  y += 26;

  // Section 4: Recommended Engineering Actions
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('4. RECOMMENDED TECHNICAL INSPECTION & MITIGATION ACTIONS', margin, y);
  y += 4;

  const recs = record.aiObservations.technicalRecommendations;
  recs.forEach((rec, idx) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(`ACTION ${idx + 1}:`, margin + 3, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(rec, margin + 22, y + 4.5);
    y += 8;
  });

  y += 3;

  // Section 5: AI System Limitations & Signature Disclaimer
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('SYSTEM LIMITATIONS & CERTIFIED INSPECTION REQUIREMENT:', margin + 3, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const limitations = '1. Crack detection accuracy depends on image resolution, illumination, angle of incidence, and camera calibration. 2. Non-destructive visual screening cannot determine internal concrete rebar bonding, sub-surface voids, or foundation settlement. 3. This report serves solely as triage surveillance data and MUST be verified by a licensed Professional Structural Engineer (PE/SE).';
  const wrappedLimits = doc.splitTextToSize(limitations, contentWidth - 6);
  doc.text(wrappedLimits, margin + 3, y + 8);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('AI-Based Structural Health Monitoring System - Official Preliminary Report', margin, pageHeight - 6);
  doc.text(`Page 1 of 1 | Report ID: ${record.reportId}`, pageWidth - margin - 48, pageHeight - 6);

  // Save/Download
  doc.save(`${record.reportId}_Structural_Health_Report.pdf`);
}
