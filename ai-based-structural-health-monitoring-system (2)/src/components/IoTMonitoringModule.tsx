import React, { useState, useEffect } from 'react';
import { IoTSensorData } from '../types/shm';
import {
  Radio,
  Activity,
  Thermometer,
  Droplets,
  RotateCcw,
  Gauge,
  ArrowUpDown,
  Play,
  Pause,
  RefreshCw,
  Send,
  Code2,
  Cpu,
  Wifi,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export const IoTMonitoringModule: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<'MQTT' | 'REST' | 'WebSocket' | 'ESP32' | 'Arduino' | 'RaspberryPi'>('MQTT');
  const [injectedValue, setInjectedValue] = useState<string>('4.8');
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  // Initial sensor telemetry
  const [sensors, setSensors] = useState<IoTSensorData[]>([
    {
      id: 'sensor-vib-01',
      name: 'Vibration Sensor',
      type: 'vibration',
      value: 2.4,
      unit: 'mm/s',
      normalRange: [0.2, 3.5],
      warningThreshold: 4.5,
      status: 'normal',
      history: [
        { time: '10:00', value: 2.1 },
        { time: '10:05', value: 2.3 },
        { time: '10:10', value: 2.4 },
        { time: '10:15', value: 2.6 },
        { time: '10:20', value: 2.4 },
      ],
    },
    {
      id: 'sensor-temp-01',
      name: 'Ambient Temperature',
      type: 'temperature',
      value: 29.0,
      unit: '°C',
      normalRange: [10, 40],
      warningThreshold: 45,
      status: 'normal',
      history: [
        { time: '10:00', value: 28.5 },
        { time: '10:05', value: 28.7 },
        { time: '10:10', value: 28.9 },
        { time: '10:15', value: 29.1 },
        { time: '10:20', value: 29.0 },
      ],
    },
    {
      id: 'sensor-hum-01',
      name: 'Relative Humidity',
      type: 'humidity',
      value: 68.0,
      unit: '%',
      normalRange: [30, 80],
      warningThreshold: 85,
      status: 'normal',
      history: [
        { time: '10:00', value: 65 },
        { time: '10:05', value: 66 },
        { time: '10:10', value: 67 },
        { time: '10:15', value: 69 },
        { time: '10:20', value: 68 },
      ],
    },
    {
      id: 'sensor-tilt-01',
      name: 'Structural Inclinometer (Tilt)',
      type: 'tilt',
      value: 0.8,
      unit: '°',
      normalRange: [-1.0, 1.0],
      warningThreshold: 1.5,
      status: 'normal',
      history: [
        { time: '10:00', value: 0.75 },
        { time: '10:05', value: 0.78 },
        { time: '10:10', value: 0.80 },
        { time: '10:15', value: 0.82 },
        { time: '10:20', value: 0.80 },
      ],
    },
    {
      id: 'sensor-strain-01',
      name: 'Rebar Micro-Strain Gauge',
      type: 'strain',
      value: 125.0,
      unit: 'με',
      normalRange: [0, 250],
      warningThreshold: 350,
      status: 'normal',
      history: [
        { time: '10:00', value: 120 },
        { time: '10:05', value: 122 },
        { time: '10:10', value: 125 },
        { time: '10:15', value: 127 },
        { time: '10:20', value: 125 },
      ],
    },
    {
      id: 'sensor-disp-01',
      name: 'Crack Displacement Transducer',
      type: 'displacement',
      value: 1.2,
      unit: 'mm',
      normalRange: [0.0, 2.0],
      warningThreshold: 2.8,
      status: 'normal',
      history: [
        { time: '10:00', value: 1.15 },
        { time: '10:05', value: 1.18 },
        { time: '10:10', value: 1.20 },
        { time: '10:15', value: 1.22 },
        { time: '10:20', value: 1.20 },
      ],
    },
  ]);

  // Telemetry fluctuation simulator
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(
        now.getSeconds()
      ).padStart(2, '0')}`;

      setSensors((prev) =>
        prev.map((s) => {
          let delta = (Math.random() - 0.48) * (s.type === 'strain' ? 4 : s.type === 'vibration' ? 0.15 : 0.05);
          let newVal = Math.round((s.value + delta) * 100) / 100;

          let status: 'normal' | 'warning' | 'alert' = 'normal';
          if (newVal >= s.warningThreshold) {
            status = 'alert';
          } else if (newVal >= s.warningThreshold * 0.85) {
            status = 'warning';
          }

          const newHist = [...s.history.slice(-8), { time: timeStr, value: newVal }];
          return {
            ...s,
            value: newVal,
            status,
            history: newHist,
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleInjectTestSignal = () => {
    const val = parseFloat(injectedValue);
    if (isNaN(val)) return;

    setSensors((prev) =>
      prev.map((s) => {
        if (s.type === 'vibration') {
          return {
            ...s,
            value: val,
            status: val >= s.warningThreshold ? 'alert' : 'warning',
            history: [...s.history.slice(-8), { time: 'Now', value: val }],
          };
        }
        return s;
      })
    );

    setTestSuccessMessage(`Injected simulated test vibration peak of ${val} mm/s.`);
    setTimeout(() => setTestSuccessMessage(null), 4000);
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'vibration': return Activity;
      case 'temperature': return Thermometer;
      case 'humidity': return Droplets;
      case 'tilt': return RotateCcw;
      case 'strain': return Gauge;
      case 'displacement':
      default: return ArrowUpDown;
    }
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header with Demo Warning Tag */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600" />
              10. IoT Structural Sensor Integration Module
            </h2>
            <span
              id="simulated-sensor-badge"
              className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Demo / Simulated Sensor Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Continuous environmental and dynamic strain telemetry for hybrid vision-inertial monitoring
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isLive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLive ? 'Live Stream Active' : 'Stream Paused'}</span>
          </button>
        </div>
      </div>

      {/* 6 Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sensors.map((sensor) => {
          const Icon = getSensorIcon(sensor.type);
          const isAlert = sensor.status === 'alert';
          const isWarn = sensor.status === 'warning';

          // Generate simple SVG sparkline path
          const vals = sensor.history.map((h) => h.value);
          const min = Math.min(...vals) * 0.95;
          const max = Math.max(...vals) * 1.05 || 1;
          const range = max - min || 1;
          const width = 120;
          const height = 30;

          const points = vals
            .map((v, idx) => {
              const x = (idx / (vals.length - 1 || 1)) * width;
              const y = height - ((v - min) / range) * height;
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <div
              key={sensor.id}
              className={`p-4 rounded-xl border transition-all ${
                isAlert
                  ? 'border-red-300 bg-red-50/50 shadow-xs'
                  : isWarn
                  ? 'border-amber-300 bg-amber-50/50 shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isAlert ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-blue-600'}`} />
                  {sensor.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    isAlert
                      ? 'bg-red-200 text-red-800'
                      : isWarn
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {sensor.status}
                </span>
              </div>

              {/* Value display */}
              <div className="flex items-baseline gap-1.5 my-2">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {sensor.value.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-slate-500 font-mono">{sensor.unit}</span>
              </div>

              {/* Sparkline & Range */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                <div className="text-[10px] text-slate-400 font-mono">
                  Range: {sensor.normalRange[0]} - {sensor.normalRange[1]} {sensor.unit}
                </div>

                {/* SVG Mini Waveform */}
                <svg width={width} height={height} className="overflow-visible">
                  <polyline
                    fill="none"
                    stroke={isAlert ? '#dc2626' : isWarn ? '#d97706' : '#2563eb'}
                    strokeWidth="2"
                    points={points}
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced IoT Analytics & Frequency Spectra Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Chart 1: Fast Fourier Transform (FFT) Power Spectral Density Spectrum */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Fast Fourier Transform (FFT) Resonant Frequency Spectrum</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dynamic power spectral density across 0 - 20 Hz (Identifies modal frequency shift & structural stiffness loss)
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">
                f₁ = 3.25 Hz (Fundamental)
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-bold">
                f₂ = 8.10 Hz
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { freq: '0.5', psd: 0.05 },
                  { freq: '1.0', psd: 0.12 },
                  { freq: '1.5', psd: 0.22 },
                  { freq: '2.0', psd: 0.45 },
                  { freq: '2.5', psd: 1.10 },
                  { freq: '3.0', psd: 3.80 },
                  { freq: '3.25', psd: 7.45 }, // Peak fundamental
                  { freq: '3.5', psd: 4.10 },
                  { freq: '4.0', psd: 1.35 },
                  { freq: '5.0', psd: 0.65 },
                  { freq: '6.0', psd: 0.85 },
                  { freq: '7.0', psd: 1.40 },
                  { freq: '8.1', psd: 4.20 }, // Second harmonic
                  { freq: '9.0', psd: 1.80 },
                  { freq: '10.0', psd: 0.70 },
                  { freq: '12.0', psd: 0.35 },
                  { freq: '15.0', psd: 0.18 },
                  { freq: '18.0', psd: 0.08 },
                  { freq: '20.0', psd: 0.04 },
                ]}
                margin={{ top: 10, right: 15, bottom: 20, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="freq"
                  stroke="#64748b"
                  fontSize={10}
                  unit=" Hz"
                  label={{ value: 'Vibration Frequency (Hz)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis stroke="#64748b" fontSize={10} unit=" mg²/Hz" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2 rounded text-xs shadow-md">
                          <p className="font-bold">{d.freq} Hz frequency</p>
                          <p className="text-purple-300">PSD: <strong>{d.psd} mg²/Hz</strong></p>
                          {d.freq === '3.25' && <p className="text-emerald-400 font-bold text-[10px]">Fundamental Resonant Mode</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="psd"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="#c084fc"
                  fillOpacity={0.25}
                />
                <ReferenceLine x="3.25" stroke="#7c3aed" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Thermo-Elastic Scatter & Correlation */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Thermo-Elastic Regression Analysis</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Crack Displacement (mm) vs. Temperature (°C) with R² = 0.88 trendline
                </p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    dataKey="temp"
                    name="Temperature"
                    unit=" °C"
                    stroke="#64748b"
                    fontSize={10}
                    domain={[10, 35]}
                    label={{ value: 'Ambient Temp (°C)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="disp"
                    name="Displacement"
                    unit=" mm"
                    stroke="#64748b"
                    fontSize={10}
                    domain={[0.1, 0.9]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs shadow-md">
                            <p>Temperature: <strong>{d.temp} °C</strong></p>
                            <p>Displacement: <strong>{d.disp} mm</strong></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    name="Readings"
                    data={[
                      { temp: 12, disp: 0.22 },
                      { temp: 15, disp: 0.26 },
                      { temp: 18, disp: 0.32 },
                      { temp: 20, disp: 0.35 },
                      { temp: 22, disp: 0.39 },
                      { temp: 24, disp: 0.44 },
                      { temp: 26, disp: 0.48 },
                      { temp: 28, disp: 0.52 },
                      { temp: 30, disp: 0.57 },
                      { temp: 32, disp: 0.61 },
                    ]}
                    fill="#10b981"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600 flex items-center justify-between">
            <span>Regression: Δw = 0.019·ΔT + 0.03 mm</span>
            <span className="font-bold text-emerald-700">R² = 0.88 (Reversible Thermal Breathing)</span>
          </div>
        </div>
      </div>

      {/* Integration Protocols & Simulated Signal Testing */}
      <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
              Hardware Bridge Architecture (Future Integration)
            </span>
            <span className="text-[11px] text-slate-400">
              Ready for real edge devices: MQTT broker, RESTful API, WebSocket, ESP32, Arduino, Raspberry Pi
            </span>
          </div>

          {/* Protocol selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-md border border-slate-700">
            {(['MQTT', 'REST', 'WebSocket', 'ESP32', 'Arduino', 'RaspberryPi'] as const).map((proto) => (
              <button
                key={proto}
                onClick={() => setSelectedProtocol(proto)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  selectedProtocol === proto
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {proto}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sample payload schema */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
            <div className="text-slate-500 mb-1 flex items-center gap-1 text-[10px]">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Standard Structural IoT Payload Format ({selectedProtocol})</span>
            </div>
            <pre className="text-emerald-400 leading-relaxed">
{`{
  "node_id": "SHM-BRIDGE-SPAN-4",
  "timestamp": "${new Date().toISOString()}",
  "protocol": "${selectedProtocol}",
  "telemetry": {
    "vibration_rms": 2.4, // mm/s
    "temperature": 29.0, // °C
    "humidity": 68.0, // %
    "tilt_angle": 0.8, // degrees
    "micro_strain": 125, // με
    "crack_displacement": 1.2 // mm
  }
}`}
            </pre>
          </div>

          {/* Test Signal Injector */}
          <div className="flex flex-col justify-between space-y-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200 block mb-1">
                Simulate Dynamic Anomaly Signal
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Trigger a peak spike to test automated system response, threshold alerts, and hybrid risk classification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={injectedValue}
                onChange={(e) => setInjectedValue(e.target.value)}
                className="w-24 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                placeholder="Value"
              />
              <span className="text-xs text-slate-400">mm/s Vibration</span>
              <button
                onClick={handleInjectTestSignal}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded shadow-xs transition-all flex items-center gap-1 ml-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Inject Signal</span>
              </button>
            </div>

            {testSuccessMessage && (
              <div className="p-2 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{testSuccessMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
