/**
 * Demo Mode Sample Generators
 * Generates realistic structural surface images (concrete textures with genuine crack patterns)
 * for immediate 1-click demonstration without external image hosting dependencies.
 */

export interface DemoSample {
  id: string;
  title: string;
  subtitle: string;
  structureName: string;
  componentType: string;
  environment: string;
  expectedSeverity: string;
  generateDataUrl: () => string;
}

export function getDemoSamples(): DemoSample[] {
  return [
    {
      id: 'building-crack',
      title: 'Building Concrete Beam',
      subtitle: 'Flexural Crack on Load-Bearing Beam',
      structureName: 'Metro Tower B - 4th Floor Transfer Beam',
      componentType: 'Reinforced Concrete Beam',
      environment: 'Indoor / High Occupancy Dynamic Loading',
      expectedSeverity: 'Moderate',
      generateDataUrl: () => generateSyntheticConcrete('beam'),
    },
    {
      id: 'bridge-crack',
      title: 'Bridge Pier Column',
      subtitle: 'Diagonal Shear Crack on River Span Pier',
      structureName: 'Highway Overpass Pier #12 (South Span)',
      componentType: 'Mass Concrete Bridge Pier',
      environment: 'Outdoor Marine / High Humidity & Thermal Cycling',
      expectedSeverity: 'High / Critical',
      generateDataUrl: () => generateSyntheticConcrete('bridge'),
    },
    {
      id: 'wall-crack',
      title: 'Masonry Retaining Wall',
      subtitle: 'Hairline Thermal Contraction Crack',
      structureName: 'West Perimeter Reinforced Masonry Wall',
      componentType: 'CMU Masonry Retaining Wall',
      environment: 'Outdoor Exposed / Ground Contact Moisture',
      expectedSeverity: 'Low',
      generateDataUrl: () => generateSyntheticConcrete('wall'),
    },
    {
      id: 'intact-surface',
      title: 'Sound Concrete Column',
      subtitle: 'Intact Surface (Normal Inspection Baseline)',
      structureName: 'Civic Center P2 Parking Column',
      componentType: 'Pre-stressed Concrete Column',
      environment: 'Sheltered / Ambient Atmosphere',
      expectedSeverity: 'Normal (No Crack)',
      generateDataUrl: () => generateSyntheticConcrete('sound'),
    },
  ];
}

/**
 * Procedurally generates realistic concrete grain, aggregate speckles,
 * and high-fidelity crack trajectories on an HTML5 canvas.
 */
function generateSyntheticConcrete(type: 'beam' | 'bridge' | 'wall' | 'sound'): string {
  const w = 640;
  const h = 480;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 1. Concrete base tone
  const baseGray = type === 'wall' ? 175 : type === 'bridge' ? 145 : 160;
  ctx.fillStyle = `rgb(${baseGray}, ${baseGray + 2}, ${baseGray + 4})`;
  ctx.fillRect(0, 0, w, h);

  // 2. Concrete noise & texture
  const imgData = ctx.getImageData(0, 0, w, h);
  const pix = imgData.data;

  // Simple pseudo-random seed
  let seed = 42;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < pix.length; i += 4) {
    const noise = (random() - 0.5) * 36;
    const microGrain = (random() - 0.5) * 14;
    const tone = baseGray + noise + microGrain;
    pix[i] = Math.min(240, Math.max(80, tone));
    pix[i + 1] = Math.min(240, Math.max(80, tone + 1));
    pix[i + 2] = Math.min(240, Math.max(80, tone + 3));
    pix[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Add concrete aggregate specks & subtle blemishes
  for (let i = 0; i < 70; i++) {
    const ax = random() * w;
    const ay = random() * h;
    const r = random() * 4 + 1.5;
    ctx.fillStyle = random() > 0.5 ? 'rgba(70, 70, 75, 0.4)' : 'rgba(215, 215, 220, 0.5)';
    ctx.beginPath();
    ctx.arc(ax, ay, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Draw realistic structural crack trajectory if not 'sound'
  if (type !== 'sound') {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Crack trajectory coordinates
    let points: [number, number][] = [];

    if (type === 'bridge') {
      // Diagonal shear crack (prominent, thick, with branching)
      points = [
        [90, 80],
        [150, 130],
        [210, 175],
        [260, 220],
        [320, 265],
        [390, 310],
        [440, 355],
        [510, 395],
        [560, 425],
      ];
    } else if (type === 'beam') {
      // Flexural crack (vertical/irregular upwards from bottom)
      points = [
        [310, 430],
        [315, 380],
        [308, 320],
        [325, 270],
        [318, 220],
        [330, 170],
        [322, 130],
        [326, 95],
      ];
    } else {
      // Wall hairline crack (subtle, fine)
      points = [
        [180, 110],
        [220, 150],
        [250, 200],
        [285, 245],
        [310, 305],
        [340, 360],
        [375, 410],
      ];
    }

    // Add jitter to make organic fracture pattern
    const jaggedPoints: [number, number][] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      jaggedPoints.push(p1);

      // Subdivide segment with 2 jagged midpoints
      for (let s = 1; s <= 2; s++) {
        const t = s / 3;
        const mx = p1[0] + (p2[0] - p1[0]) * t + (random() - 0.5) * (type === 'bridge' ? 14 : 7);
        const my = p1[1] + (p2[1] - p1[1]) * t + (random() - 0.5) * (type === 'bridge' ? 14 : 7);
        jaggedPoints.push([mx, my]);
      }
    }
    jaggedPoints.push(points[points.length - 1]);

    // Draw dark crack core
    const coreWidth = type === 'bridge' ? 4.2 : type === 'beam' ? 2.8 : 1.4;

    // Soft dark shadow / valley edge
    ctx.strokeStyle = 'rgba(40, 40, 45, 0.4)';
    ctx.lineWidth = coreWidth + 2.5;
    ctx.beginPath();
    ctx.moveTo(jaggedPoints[0][0], jaggedPoints[0][1]);
    for (let i = 1; i < jaggedPoints.length; i++) {
      ctx.lineTo(jaggedPoints[i][0], jaggedPoints[i][1]);
    }
    ctx.stroke();

    // Deep crack fissure core
    ctx.strokeStyle = 'rgba(25, 25, 30, 0.88)';
    ctx.lineWidth = coreWidth;
    ctx.beginPath();
    ctx.moveTo(jaggedPoints[0][0], jaggedPoints[0][1]);
    for (let i = 1; i < jaggedPoints.length; i++) {
      ctx.lineTo(jaggedPoints[i][0], jaggedPoints[i][1]);
    }
    ctx.stroke();

    // Secondary branching fissure for bridge or beam
    if (type === 'bridge') {
      const branchStart = jaggedPoints[Math.floor(jaggedPoints.length * 0.45)];
      ctx.strokeStyle = 'rgba(30, 30, 35, 0.8)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(branchStart[0], branchStart[1]);
      ctx.lineTo(branchStart[0] + 65, branchStart[1] - 25);
      ctx.lineTo(branchStart[0] + 110, branchStart[1] - 40);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Stamp engineering label in corner
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillText(`SHM-REF: ${type.toUpperCase()}-SAMPLE // 640x480`, 12, h - 12);

  return canvas.toDataURL('image/png');
}
