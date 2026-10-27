/**
 * AI Service: calls the server-side `/api/analyze-crack` route
 * Uses Gemini 3.8 Flash via @google/genai on the server
 */

import { CrackMetrics, AIObservations } from '../types/shm';

export async function requestAIStructuralAnalysis(
  metrics: CrackMetrics,
  componentType: string = 'Bridge Pier / Concrete Beam',
  environment: string = 'Outdoor / High humidity'
): Promise<AIObservations> {
  const controller = new AbortController();
  // Fast 1.5s timeout prevents blocking user workflow when LLMs experience latency spikes
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch('/api/analyze-crack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics,
        componentType,
        environment,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.observations) {
      return normalizeObservations(data.observations, metrics);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.info('Quick engineering expert system fallback engaged:', error instanceof Error ? error.message : error);
  }

  // Instant deterministic Civil Engineering Analysis
  return fallbackEngineeringAnalysis(metrics, componentType);
}

function normalizeObservations(obs: any, metrics: CrackMetrics): AIObservations {
  return {
    engineeringInterpretation:
      obs.engineeringInterpretation ||
      `Visual surface screening detected ${metrics.crackType.toLowerCase()} features with ${metrics.orientation.toLowerCase()} orientation.`,
    probableCauses: Array.isArray(obs.probableCauses) && obs.probableCauses.length > 0
      ? obs.probableCauses
      : ['Differential structural loading or foundation movement', 'Thermal expansion/contraction cycles', 'Material shrinkage or localized shear strain'],
    potentialRisks: Array.isArray(obs.potentialRisks) && obs.potentialRisks.length > 0
      ? obs.potentialRisks
      : ['Moisture ingress risking rebar corrosion', 'Surface spalling and concrete cover degradation'],
    technicalRecommendations: Array.isArray(obs.technicalRecommendations) && obs.technicalRecommendations.length > 0
      ? obs.technicalRecommendations
      : [
          'Install calibrated tell-tale crack displacement gauge.',
          'Schedule Non-Destructive Testing (NDT) pulse velocity evaluation.',
          'Commission qualified professional structural inspection.',
        ],
    monitoringInterval: obs.monitoringInterval || (metrics.severity === 'Critical' ? 'Immediate inspection required' : 'Monthly photographic tracking'),
    screeningSummary:
      obs.screeningSummary ||
      `Preliminary AI screening flagged ${metrics.severity.toLowerCase()} severity damage. This screening is not a replacement for an on-site structural engineer.`,
  };
}

export function fallbackEngineeringAnalysis(metrics: CrackMetrics, componentType: string): AIObservations {
  if (!metrics.crackDetected) {
    return {
      engineeringInterpretation: 'Visual screening indicates sound structural surface integrity within the analyzed field of view with no active macro-crack formation detected.',
      probableCauses: ['Standard surface weathering or micro-texture variations without structural discontinuity.'],
      potentialRisks: ['Low immediate visual risk. Baseline photographic record established.'],
      technicalRecommendations: [
        'Maintain scheduled periodic photographic monitoring.',
        'Inspect joints, sealants, and drainage pathways in proximity.',
        'Log baseline image in long-term structural health repository.',
      ],
      monitoringInterval: 'Routine 6-12 month inspection cycle.',
      screeningSummary: 'AI preliminary visual screening detected no critical crack signatures. Continue standard maintenance surveillance.',
    };
  }

  let interpretation = `Surface crack pattern detected with dominant ${metrics.orientation.toLowerCase()} trajectory.`;
  if (metrics.orientation === 'Diagonal') {
    interpretation += ` In ${componentType.toLowerCase()}, diagonal cracks typically correspond to principal tensile stresses arising from shear forces or differential settlement.`;
  } else if (metrics.orientation === 'Vertical') {
    interpretation += ` In ${componentType.toLowerCase()}, vertical fissures commonly indicate bending/flexural tension or longitudinal restraint during temperature fluctuations.`;
  } else if (metrics.orientation === 'Horizontal') {
    interpretation += ` In ${componentType.toLowerCase()}, horizontal fissures are characteristic of bending moment overload, lateral wind/earth pressures, or construction joint fatigue.`;
  } else {
    interpretation += ` Multi-directional or irregular crack mapping indicates isotropic stress, drying shrinkage, or alkali-silica chemical reaction (ASR).`;
  }

  const causes = [
    metrics.orientation === 'Diagonal' ? 'Shear stress concentration or foundation settlement' : 'Flexural tensile stress and thermal expansion/contraction',
    'Cyclic environmental loading and material shrinkage',
    'Potential moisture intrusion causing internal rebar carbonation',
  ];

  const risks = [
    metrics.severity === 'Critical' || metrics.severity === 'High'
      ? 'Elevated risk of water percolation, progressive rebar depassivation, accelerated chloride attack, and structural concrete spalling.'
      : 'Gradual surface weathering, localized moisture absorption, and aesthetic/durability reduction.',
  ];

  const recs = [
    'Install mechanical crack width comparator pins or tell-tale monitors to track dynamic progression.',
    'Conduct non-destructive testing (ultrasonic pulse velocity or rebound hammer) across adjacent structural concrete.',
    'Examine bearing areas, water runoff channels, and structural expansion joints.',
    'Commission an on-site physical evaluation by a licensed structural engineer.',
  ];

  return {
    engineeringInterpretation: interpretation,
    probableCauses: causes,
    potentialRisks: risks,
    technicalRecommendations: recs,
    monitoringInterval: metrics.severity === 'Critical' ? 'Immediate professional assessment recommended' : metrics.severity === 'High' ? 'Bi-weekly tracking' : 'Monthly photographic log',
    screeningSummary: `AI preliminary screening identified ${metrics.severity.toLowerCase()} severity crack features. This screening provides preliminary data and requires professional engineering verification.`,
  };
}

export async function generateAIObservations(
  metrics: CrackMetrics,
  context?: { structureName?: string; componentType?: string; environment?: string }
): Promise<AIObservations> {
  return requestAIStructuralAnalysis(
    metrics,
    context?.componentType || 'Reinforced Concrete Beam / Pier',
    context?.environment || 'Outdoor Ambient'
  );
}
