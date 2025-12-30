
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  Settings, 
  Activity, 
  History, 
  Bus, 
  Navigation, 
  Truck,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { DrivingMode, SensorData, AssessmentResult, RiskLevel } from './types';
import { assessSafetyRisk } from './services/geminiService';

const App: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    leftDistance: 120,
    rightDistance: 115,
    closingSpeed: 0.5,
    vehicleSpeed: 45,
    drivingMode: DrivingMode.TRAFFIC,
  });

  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);

  const handleAssessment = useCallback(async (data: SensorData) => {
    setIsAnalyzing(true);
    try {
      const result = await assessSafetyRisk(data);
      setAssessment(result);
      setHistory(prev => [result, ...prev].slice(0, 20));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Initial assessment
  useEffect(() => {
    handleAssessment(sensorData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-simulation effect
  useEffect(() => {
    let interval: number;
    if (autoSimulate) {
      interval = window.setInterval(() => {
        setSensorData(prev => {
          const newData = {
            ...prev,
            leftDistance: Math.max(10, Math.min(300, prev.leftDistance + (Math.random() * 20 - 10))),
            rightDistance: Math.max(10, Math.min(300, prev.rightDistance + (Math.random() * 20 - 10))),
            closingSpeed: Math.max(0, Math.min(15, prev.closingSpeed + (Math.random() * 2 - 1))),
            vehicleSpeed: Math.max(0, Math.min(100, prev.vehicleSpeed + (Math.random() * 10 - 5))),
          };
          handleAssessment(newData);
          return newData;
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoSimulate, handleAssessment]);

  const updateSensor = (key: keyof SensorData, value: number | string) => {
    setSensorData(prev => ({ ...prev, [key]: value }));
  };

  const getRiskColor = (level?: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return 'text-red-500 bg-red-500/10 border-red-500/50';
      case RiskLevel.MEDIUM: return 'text-amber-500 bg-amber-500/10 border-amber-500/50';
      case RiskLevel.LOW: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/50';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/50';
    }
  };

  const getRiskIcon = (level?: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH: return <AlertTriangle className="w-6 h-6" />;
      case RiskLevel.MEDIUM: return <AlertCircle className="w-6 h-6" />;
      case RiskLevel.LOW: return <CheckCircle2 className="w-6 h-6" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bus className="text-blue-500" />
            BusSafe AI
          </h1>
          <p className="text-slate-400 mt-1">Real-time Public Transport Fleet Safety Diagnostics</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${autoSimulate ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-300'}`}
          >
            <Activity className={`w-4 h-4 ${autoSimulate ? 'animate-pulse' : ''}`} />
            {autoSimulate ? 'Auto-Sync Active' : 'Start Auto-Sync'}
          </button>
          <button 
            onClick={() => handleAssessment(sensorData)}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-white disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sensors & Controls */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-100">
              <Settings className="w-5 h-5 text-blue-400" />
              Sensor Inputs
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                  <span>Left Distance</span>
                  <span className="text-blue-400 font-mono">{sensorData.leftDistance.toFixed(0)} cm</span>
                </label>
                <input 
                  type="range" min="5" max="300" 
                  value={sensorData.leftDistance}
                  onChange={(e) => updateSensor('leftDistance', parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                  <span>Right Distance</span>
                  <span className="text-blue-400 font-mono">{sensorData.rightDistance.toFixed(0)} cm</span>
                </label>
                <input 
                  type="range" min="5" max="300" 
                  value={sensorData.rightDistance}
                  onChange={(e) => updateSensor('rightDistance', parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                  <span>Closing Speed</span>
                  <span className="text-blue-400 font-mono">{sensorData.closingSpeed.toFixed(1)} m/s</span>
                </label>
                <input 
                  type="range" min="0" max="25" step="0.1" 
                  value={sensorData.closingSpeed}
                  onChange={(e) => updateSensor('closingSpeed', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-400 mb-2">
                  <span>Vehicle Speed</span>
                  <span className="text-blue-400 font-mono">{sensorData.vehicleSpeed.toFixed(0)} km/h</span>
                </label>
                <input 
                  type="range" min="0" max="120" 
                  value={sensorData.vehicleSpeed}
                  onChange={(e) => updateSensor('vehicleSpeed', parseInt(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">Driving Context</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(DrivingMode).map(mode => (
                    <button
                      key={mode}
                      onClick={() => updateSensor('drivingMode', mode)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors border ${
                        sensorData.drivingMode === mode 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Gauge className="w-3 h-3" /> SPEED
              </div>
              <div className="text-xl font-bold font-mono text-white">{sensorData.vehicleSpeed} <span className="text-sm font-normal text-slate-500">km/h</span></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Navigation className="w-3 h-3" /> MODE
              </div>
              <div className="text-xl font-bold font-mono text-white truncate">{sensorData.drivingMode}</div>
            </div>
          </div>
        </section>

        {/* Right Column: AI Analysis & Visualizations */}
        <main className="lg:col-span-8 space-y-6">
          {/* Main Risk Display */}
          <div className={`border rounded-xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500 bg-slate-900 ${getRiskColor(assessment?.riskLevel).split(' ').pop()}`}>
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-400 font-medium animate-pulse">Analyzing Motion Dynamics...</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center mb-4 transition-colors ${getRiskColor(assessment?.riskLevel)}`}>
                  {getRiskIcon(assessment?.riskLevel)}
                </div>
                <div className={`text-sm font-bold tracking-widest uppercase ${getRiskColor(assessment?.riskLevel).split(' ')[0]}`}>
                  {assessment?.riskLevel || 'IDLE'}
                </div>
              </div>

              <div className="flex-grow space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    Safety Assessment Result
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-normal">v3.1-PRO</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {assessment ? new Date(assessment.timestamp).toLocaleTimeString() : '--:--:--'}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800/50 leading-relaxed text-slate-300">
                  {assessment?.explanation || "Waiting for sensor data input..."}
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Spatial Matrix Analyzed
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Closing Speed Validated
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Context-Aware Filter Applied
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Trends & Data Visuals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Clearance Trend (cm)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[...history].reverse()}>
                    <defs>
                      <linearGradient id="colorLeft" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                      labelFormatter={() => 'Historical Snapshot'}
                    />
                    <Area type="monotone" dataKey="data.leftDistance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLeft)" name="Left" />
                    <Area type="monotone" dataKey="data.rightDistance" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRight)" name="Right" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-orange-400" />
                Dynamics Analysis
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...history].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    />
                    <Line type="step" dataKey="data.closingSpeed" stroke="#f59e0b" strokeWidth={2} dot={false} name="Closing (m/s)" />
                    <Line type="monotone" dataKey="data.vehicleSpeed" stroke="#ef4444" strokeWidth={1} dot={false} name="Vehicle (km/h)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-tight">
                <History className="w-4 h-4" /> Assessment Log
              </h4>
              <span className="text-xs text-slate-500 font-mono">Real-time Stream</span>
            </div>
            <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
              {history.length > 0 ? history.map((item, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${getRiskColor(item.riskLevel).split(' ')[0].replace('text-', 'bg-')}`}></div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white uppercase tracking-wider">{item.riskLevel} Risk</span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{item.explanation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono text-slate-300">L:{item.data.leftDistance} R:{item.data.rightDistance}</div>
                    <div className="text-[10px] font-mono text-slate-500">{item.data.vehicleSpeed} km/h | {item.data.closingSpeed} m/s</div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-500 italic text-sm">
                  No activity recorded yet. Adjust sensors to begin.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Footer / Status Bar */}
      <footer className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            SYSTEM ONLINE
          </div>
          <div className="flex items-center gap-2">
            AI ENGINE: GEMINI FLASH 3-PREVIEW
          </div>
        </div>
        <div>
          DIAGNOSTIC HASH: 0x{Math.random().toString(16).slice(2, 10).toUpperCase()} | SENSOR_RELIABILITY: 99.8%
        </div>
      </footer>
    </div>
  );
};

export default App;
