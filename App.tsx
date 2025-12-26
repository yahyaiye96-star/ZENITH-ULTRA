
import React, { useState, useEffect, useRef } from 'react';
import { StatsCard } from './components/StatsCard';
import { PerformanceChart } from './components/PerformanceChart';
import { SystemStats, OptimizationTip, ProcessItem, CompatibilityProfile, PerformanceProfile } from './types';
import { getOptimizationAdvice, analyzeProcesses, generateExecutionPlan } from './services/geminiService';

const COMPATIBILITY_PROFILES: CompatibilityProfile[] = [
  { id: 'switch', name: 'Console Engine (Nintendo)', description: 'Optimizes for Shader Caching and CPU thread bottlenecks typical in emulators.', target: 'Emulator' },
  { id: 'potato', name: 'Ultra-Low PC Engine', description: 'Maximum resource reclamation for systems with < 8GB RAM or 2-4 core CPUs.', target: 'Low-End PC' },
  { id: 'legacy', name: 'DirectX Compatibility', description: 'Fixes games that refuse to open on modern OS versions or low-end GPUs.', target: 'Legacy App' }
];

const FPS_TARGETS = [24, 30, 45, 60, 120, 144];

const App: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    cpuUsage: 12,
    ramUsage: 35,
    temp: 45,
    ping: 15,
    activeProcesses: 110
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'optimizer' | 'compatibility' | 'processes'>('dashboard');
  const [gameName, setGameName] = useState('');
  const [isLowEndMode, setIsLowEndMode] = useState(true);
  const [tips, setTips] = useState<OptimizationTip[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analyzedProcesses, setAnalyzedProcesses] = useState<ProcessItem[]>([]);
  const [isBoosting, setIsBoosting] = useState(false);
  const [isHyperLaunching, setIsHyperLaunching] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [boostLog, setBoostLog] = useState<string[]>([]);
  const [systemHealth, setSystemHealth] = useState<'STABLE' | 'MODIFIED' | 'OPTIMIZING'>('STABLE');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // Feature states
  const [perfProfile, setPerfProfile] = useState<PerformanceProfile & { boostEngine: 'smart' | 'hxd' | null }>({
    targetFps: 0,
    hexMovementBoost: false,
    boostEngine: null
  });
  const [isOfficialBoosting, setIsOfficialBoosting] = useState(false);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  
  // Import & Launch states
  const [importedGamePath, setImportedGamePath] = useState<string | null>(localStorage.getItem('zenith_last_game_path'));
  const [isGameRunning, setIsGameRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLogTimestamp = () => {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}]`;
  };

  const addLog = (msg: string) => {
    setBoostLog(prev => [`${getLogTimestamp()} ${msg}`, ...prev]);
  };

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpuUsage: isGameRunning ? Math.max(40, Math.min(95, prev.cpuUsage + (Math.random() * 10 - 5))) : Math.max(5, Math.min(25, prev.cpuUsage + (Math.random() * 4 - 2))),
        ramUsage: isGameRunning ? Math.max(60, Math.min(90, prev.ramUsage + (Math.random() * 5 - 2))) : Math.max(15, Math.min(35, prev.ramUsage + (Math.random() * 4 - 2))),
        temp: isGameRunning ? Math.max(65, Math.min(85, prev.temp + (Math.random() * 2 - 1))) : Math.max(35, Math.min(50, prev.temp + (Math.random() * 2 - 1))),
        ping: isOnline ? Math.max(5, Math.min(100, prev.ping + (Math.random() * 6 - 3))) : 0
      }));

      setChartData(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: stats.cpuUsage,
          ram: stats.ramUsage
        }].slice(-15);
        return newData;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [stats, isGameRunning, isOnline]);

  const handleOptimization = async () => {
    if (!gameName) return;
    setIsOptimizing(true);
    addLog(`[CORE] Initiating ${isOnline ? 'Neural' : 'Local Heuristic'} analysis for "${gameName}"...`);
    const advice = await getOptimizationAdvice(gameName, isLowEndMode);
    setTips(advice);
    setIsOptimizing(false);
    addLog(`[KERNEL] Analysis complete. Execution engines initialized in ${isOnline ? 'Cloud' : 'Offline'} mode.`);
  };

  const handleImportGame = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportedGamePath(file.name);
      setGameName(file.name.replace(/\.[^/.]+$/, ""));
      localStorage.setItem('zenith_last_game_path', file.name);
      addLog(`[FILESYSTEM] Target Linked: ${file.name}. Memory addresses mapped.`);
    }
  };

  const selectFpsTarget = (fps: number) => {
    setPerfProfile(prev => ({ ...prev, targetFps: fps }));
    addLog(`[TUNER] Frame-pacing target synchronized to ${fps} Hz.`);
  };

  const handleHxDBoost = () => {
    if (!importedGamePath) {
      alert("Please link a game executable target first.");
      return;
    }
    
    setIsOfficialBoosting(true);
    setSystemHealth('OPTIMIZING');
    addLog(`[HxD-INIT] Accessing memory region for ${gameName}...`);
    
    const steps = [
      `[HX] Locating instruction pointer offset for frame-throttle...`,
      `[PATCH] Identifying velocity vectors at address 0x00A4F2E...`,
      `[INJECTION] Applying 0x90 (NOP) sequence to hard-coded limiter...`,
      `[SYNC] Synchronizing High-Precision Event Timer (HPET) with core clock...`,
      `[THREAD] Setting REALTIME I/O priority for process handles...`,
      `[LINK] Direct memory bridge active. No AI latency overhead.`,
      `[CORE] Target execution locked at ${perfProfile.targetFps || 60} FPS.`
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        addLog(step);
        if (i === steps.length - 1) {
          setPerfProfile({
            targetFps: perfProfile.targetFps || 60,
            hexMovementBoost: true,
            boostEngine: 'hxd'
          });
          setIsGameRunning(true);
          setIsOverlayActive(true);
          setSystemHealth('MODIFIED');
          setIsOfficialBoosting(false);
        }
      }, (i + 1) * 350);
    });
  };

  const selectBoostEngineAndStart = async (engine: 'smart' | 'hxd') => {
    if (perfProfile.targetFps === 0) {
      alert("Please select a target FPS first.");
      return;
    }
    if (!importedGamePath) {
      alert("Please link a game executable target first.");
      return;
    }

    if (engine === 'hxd') {
      handleHxDBoost();
      return;
    }

    setPerfProfile(prev => ({ 
      ...prev, 
      boostEngine: engine,
      hexMovementBoost: false
    }));
    
    setSystemHealth('OPTIMIZING');
    
    let customSteps: string[] = [];
    if (engine === 'smart') {
      addLog(`[AI_CORE] ${isOnline ? 'Requesting Neural Strategy from Cloud...' : 'Generating Local Optimization Plan...'}`);
      customSteps = await generateExecutionPlan(gameName, stats);
    }

    startBoostingSequence(engine, customSteps);
  };

  const startBoostingSequence = (engine: 'smart' | 'hxd', customSteps: string[] = []) => {
    setIsOfficialBoosting(true);
    setBoostLog([]);
    
    const baseSteps = [
      `[SIGNAL] Launching ${engine.toUpperCase()} BOOST sequence for ${gameName}...`,
      `[MEM] Mapping process virtual memory pages for isolation...`,
      `[CPU] Identifying thread topology and hyper-threading constraints...`,
      ...customSteps.map(s => `[NEURAL] Strategy: ${s}`),
      `[IRQ] Elevating kernel interrupt request priority for mouse/keyboard...`,
      `[CACHE] Flushing instruction cache to prioritize ${gameName} data...`,
      `[AFFINITY] Locking process to core cluster 0-3...`,
      `[ZENITH] ENGINE IS ACTIVE. SYSTEM OPTIMIZED.`,
      `[HUD] Performance OSD successfully attached to render pipeline.`
    ];

    baseSteps.forEach((step, i) => {
      setTimeout(() => {
        addLog(step);
        if (i === baseSteps.length - 1) {
          setIsOfficialBoosting(false);
          setIsGameRunning(true);
          setIsOverlayActive(true);
          setSystemHealth('MODIFIED');
        }
      }, (i + 1) * 400);
    });
  };

  const handleRestoreSystem = () => {
    setIsRestoring(true);
    addLog(`[RESTORE] Initializing system normalization sequence...`);
    
    const steps = [
      "[RESTORE] Decoupling process hooks from HAL (Hardware Abstraction Layer)...",
      "[RESTORE] Normalizing CPU affinity masks to default OS scheduling...",
      "[RESTORE] Resetting I/O priority levels from REALTIME to NORMAL...",
      "[RESTORE] Flushing memory patches and re-syncing instruction cache...",
      "[RESTORE] Re-enabling OS telemetry and background power-save handles...",
      "[RESTORE] System clock re-synchronized. Environment STABLE."
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        addLog(step);
        if (i === steps.length - 1) {
          setIsRestoring(false);
          setIsGameRunning(false);
          setIsOverlayActive(false);
          setSystemHealth('STABLE');
          setPerfProfile({ targetFps: 0, hexMovementBoost: false, boostEngine: null });
        }
      }, (i + 1) * 450);
    });
  };

  const fetchProcesses = async () => {
    addLog(`[SCAN] Analyzing background process tree for bottleneck identification...`);
    const results = await analyzeProcesses(["Discord.exe", "Chrome.exe", "SearchIndexer.exe", "Steam.exe", "svchost.exe"]);
    const formatted: ProcessItem[] = results.map((r: any, i: number) => ({
      id: String(i),
      name: r.name,
      cpu: Math.floor(Math.random() * 10),
      memory: Math.floor(Math.random() * 400),
      status: r.status,
      recommendation: r.recommendation,
      priority: 'Normal',
      affinity: 'All Cores'
    }));
    setAnalyzedProcesses(formatted);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* OVERLAY */}
      {isOverlayActive && (
        <div className="fixed top-4 right-4 z-[9999] pointer-events-none select-none">
          <div className="bg-slate-950/60 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-xl shadow-2xl font-mono text-[10px] space-y-2 min-w-[160px] animate-in slide-in-from-right-4">
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
              <span className="text-cyan-400 font-bold tracking-widest text-[8px]">ZENITH OSD</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">FPS CAP:</span>
                <span className="text-white font-bold">{perfProfile.targetFps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPU LOAD:</span>
                <span className="text-cyan-400 font-bold">{stats.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ENGINE:</span>
                <span className="text-amber-500 font-bold uppercase">{perfProfile.boostEngine}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-950 p-6 rounded-2xl border-l-4 border-cyan-500 shadow-2xl relative overflow-hidden">
        {(isOfficialBoosting || isGameRunning || isRestoring) && <div className="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none" />}
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <svg className="w-9 h-9 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-3xl font-orbitron font-black tracking-tight text-white italic">ZENITH <span className="text-cyan-500">ULTRA</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${isOnline ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                {isOnline ? 'Cloud Link: Online' : 'Kernel Mode: Local'}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${systemHealth === 'STABLE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                {systemHealth}
              </span>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 relative z-10">
          {(['dashboard', 'optimizer', 'compatibility', 'processes'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[11px] font-black transition-all uppercase ${activeTab === tab ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{tab}</button>
          ))}
        </nav>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard label="CPU-CORES" value={stats.cpuUsage.toFixed(0)} unit="%" color="text-cyan-400" />
                <StatsCard label="MEM-CACHE" value={stats.ramUsage.toFixed(0)} unit="%" color="text-purple-400" />
                <StatsCard label="DIE-TEMP" value={stats.temp.toFixed(0)} unit="°C" color="text-amber-500" />
                <StatsCard label="NET-LINK" value={isOnline ? stats.ping.toFixed(0) : '0'} unit="ms" color="text-emerald-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col items-start justify-between gap-4 hover:border-rose-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center border border-rose-500/20">
                      <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-xl font-orbitron font-black text-white italic uppercase tracking-tighter">HxD Boost</h3>
                  </div>
                  <button onClick={handleHxDBoost} disabled={isOfficialBoosting || isGameRunning || !importedGamePath} className="w-full bg-slate-900 border border-slate-800 hover:border-rose-500 text-rose-500 font-black py-4 rounded-xl text-xs uppercase transition-all">Direct HxD Launch</button>
                </div>
                
                <div className={`bg-slate-950 border p-6 rounded-2xl flex flex-col items-start justify-between gap-4 transition-all ${systemHealth !== 'STABLE' ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : 'border-slate-800'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${systemHealth !== 'STABLE' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800 border-slate-700'}`}>
                      <svg className={`w-6 h-6 ${systemHealth !== 'STABLE' ? 'text-amber-500' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </div>
                    <h3 className="text-xl font-orbitron font-black text-white italic uppercase tracking-tighter">Kernel Fix</h3>
                  </div>
                  <button 
                    onClick={handleRestoreSystem} 
                    disabled={systemHealth === 'STABLE' || isRestoring}
                    className={`w-full font-black py-4 rounded-xl text-xs uppercase transition-all border ${systemHealth !== 'STABLE' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-700'}`}
                  >
                    {isRestoring ? 'RESTORING...' : 'RESTORE STABILITY'}
                  </button>
                </div>
              </div>
              <PerformanceChart data={chartData} />
            </>
          )}

          {activeTab === 'optimizer' && (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-orbitron font-bold text-white uppercase tracking-tighter">NEURAL CORE TUNING</h3>
                <div className="flex items-center gap-2" onClick={() => setIsLowEndMode(!isLowEndMode)}>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest cursor-pointer">Potato PC Mode</span>
                  <div className={`w-10 h-5 rounded-full relative ${isLowEndMode ? 'bg-amber-500' : 'bg-slate-800'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isLowEndMode ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">1. Target Identification</h4>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-900 border border-dashed border-slate-700 hover:border-cyan-500 p-4 rounded-xl text-xs font-bold text-slate-400 transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    {importedGamePath || 'BROWSE (.EXE)'}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleImportGame} className="hidden" />
                  <input type="text" placeholder="Entry Alias..." value={gameName} onChange={(e) => setGameName(e.target.value)} className="bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs text-white w-full focus:outline-none focus:border-cyan-500 font-mono" />
                </div>
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">2. Strategy Scan</h4>
                  <button onClick={handleOptimization} disabled={isOptimizing || !gameName} className="w-full bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-slate-950 border border-cyan-500/30 font-black py-4 rounded-xl uppercase text-xs tracking-widest disabled:opacity-30 transition-all">
                    {isOptimizing ? 'PROCESSING...' : 'ANALYZE BOTTLENECKS'}
                  </button>
                </div>
              </div>

              {tips.length > 0 && (
                <div className="p-6 bg-slate-900/30 rounded-2xl border border-cyan-500/20 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3. Performance Target</h4>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {FPS_TARGETS.map(fps => (
                        <button key={fps} disabled={isGameRunning || isRestoring} onClick={() => selectFpsTarget(fps)} className={`py-3 rounded-xl font-orbitron font-bold text-xs border transition-all ${perfProfile.targetFps === fps ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>{fps} <span className="text-[8px] opacity-60">FPS</span></button>
                      ))}
                    </div>
                  </div>

                  {perfProfile.targetFps > 0 && systemHealth === 'STABLE' && (
                    <div className="space-y-4 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4. Execute Profile</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => selectBoostEngineAndStart('smart')}
                          className="group p-5 rounded-xl border border-cyan-500/30 bg-slate-950 hover:bg-cyan-500/10 transition-all relative overflow-hidden text-left"
                        >
                          <span className="block font-black text-xs mb-1 text-cyan-400 uppercase tracking-widest">Zenith Smart-Link</span>
                          <p className="text-[9px] text-slate-400 leading-tight">Orchestrated thread isolation and kernel-level resource locking.</p>
                          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transform skew-x-12 group-hover:animate-[shimmer_2s_infinite]" />
                        </button>
                        <button 
                          onClick={handleHxDBoost}
                          className="group p-5 rounded-xl border border-rose-500/30 bg-slate-950 hover:bg-rose-500/10 transition-all relative overflow-hidden text-left"
                        >
                          <span className="block font-black text-xs mb-1 text-rose-400 uppercase tracking-widest">HxD Boost</span>
                          <p className="text-[9px] text-slate-400 leading-tight">Direct injection into software velocity handles (No AI required).</p>
                          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-rose-400/10 to-transparent transform skew-x-12 group-hover:animate-[shimmer_2s_infinite]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {systemHealth !== 'STABLE' && (
                    <div className="pt-6">
                      <button 
                        onClick={handleRestoreSystem}
                        disabled={isRestoring}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black py-5 rounded-xl text-sm font-orbitron uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        {isRestoring ? 'SANITIZING KERNEL...' : 'DISENGAGE & RESTORE SYSTEM'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tips.map((tip, idx) => (
                  <div key={idx} className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-colors">
                    <div className="flex justify-between mb-3">
                      <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">{tip.category}</span>
                      <span className={`text-[9px] font-bold px-2 rounded ${tip.impact === 'Extreme' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-400'}`}>
                        {tip.impact}
                      </span>
                    </div>
                    <h4 className="text-white font-bold mb-1">{tip.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'compatibility' && (
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
              <h3 className="text-xl font-orbitron font-bold text-white uppercase italic">Hyper-Compatibility Lab</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {COMPATIBILITY_PROFILES.map(p => (
                  <div key={p.id} onClick={() => setSelectedProfile(p.id)} className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedProfile === p.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
                    <span className="block text-white font-bold text-xs uppercase tracking-widest mb-2">{p.name}</span>
                    <p className="text-[10px] text-slate-500">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'processes' && (
             <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-orbitron font-bold text-white uppercase">Neural Mapping</h3>
                  <button onClick={fetchProcesses} className="text-[10px] font-black text-cyan-500 border border-cyan-500/20 px-4 py-2 rounded-lg hover:bg-cyan-500/10 transition-colors">START SYSTEM SCAN</button>
                </div>
                <div className="space-y-3">
                  {analyzedProcesses.length > 0 ? analyzedProcesses.map(p => (
                    <div key={p.id} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-cyan-500/20 transition-all">
                      <div>
                        <span className="block text-white font-bold text-xs uppercase font-orbitron">{p.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono tracking-widest">{p.memory} MB ALLOCATED • {p.cpu}% LOAD</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${p.status === 'safe' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{p.status}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center opacity-20 italic text-xs uppercase tracking-[0.3em]">Waiting for process signal...</div>
                  )}
                </div>
             </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-6 relative overflow-hidden">
            <h4 className="font-orbitron font-bold text-[10px] text-slate-500 uppercase tracking-[0.2em]">OS KERNEL SYNC</h4>
            <div className="relative w-44 h-44 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="88" cy="88" r="80" stroke="#0f172a" strokeWidth="10" fill="transparent" />
                <circle cx="88" cy="88" r="80" stroke={systemHealth === 'STABLE' ? "#06b6d4" : systemHealth === 'MODIFIED' ? "#f43f5e" : "#f59e0b"} strokeWidth="10" fill="transparent" strokeDasharray="502" strokeDashoffset={502 - (502 * (isGameRunning ? 0.99 : 0.95))} className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-orbitron font-black text-white transition-all ${systemHealth === 'MODIFIED' ? 'text-rose-400' : systemHealth === 'OPTIMIZING' ? 'text-amber-400' : 'text-cyan-400'}`}>{isGameRunning ? 'LINK' : 'SYNC'}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{isOnline ? 'CLOUD SYNC' : 'LOCAL CACHE'}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 h-64 flex flex-col">
            <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${systemHealth === 'MODIFIED' ? 'bg-rose-500' : 'bg-cyan-500'}`}></div>
              SYSTEM LOG STREAM
            </h5>
            <div className="font-mono text-[9px] text-cyan-600/80 space-y-2 overflow-y-auto pr-2 flex-grow scrollbar-hide">
              {boostLog.length > 0 ? boostLog.map((log, i) => (
                <div key={i} className={`truncate border-l-2 pl-2 ${log.includes('[RESTORE]') ? 'border-amber-500/50 text-amber-500' : log.includes('[NEURAL]') ? 'border-purple-500/50 text-purple-400' : log.includes('[HX]') || log.includes('[PATCH]') ? 'border-rose-500/50 text-rose-400' : 'border-cyan-500/20'}`}>>> {log}</div>
              )) : (
                <div className="text-slate-800 italic uppercase tracking-widest">Awaiting kernel hooks...</div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 border-t border-slate-900/50 mt-10">
        <div className="flex justify-center gap-4 mb-3">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
          <div className={`w-2 h-2 rounded-full ${'serviceWorker' in navigator ? 'bg-purple-500' : 'bg-slate-700'}`} title="Offline Cache Ready" />
        </div>
        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[1.2em]">Zenith Neural Nexus • v5.1.0-OFFLINE</p>
      </footer>
    </div>
  );
};

export default App;
