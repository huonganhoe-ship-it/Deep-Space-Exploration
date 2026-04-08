import { useState, useMemo, useEffect, useCallback } from 'react';
import { SOLAR_SYSTEM_DATA, CelestialObject } from './data/solarSystem';
import { SolarSystem3D } from './components/SolarSystem3D';
import { InfoPanel } from './components/InfoPanel';
import { SolarStandardTime } from './components/SolarStandardTime';
import { LoadingScreen } from './components/LoadingScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TroubleshootScreen } from './components/TroubleshootScreen';
import { SpaceBot } from './components/ai/SpaceBot';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Compass, ArrowLeft, LogOut, AlertTriangle, Wrench, WifiOff, Bot } from 'lucide-react';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>('earth');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInterfaceSignalLost, setIsInterfaceSignalLost] = useState(false);
  const [isFullInterfaceSignalLost, setIsFullInterfaceSignalLost] = useState(false);
  const [isTroubleshooting, setIsTroubleshooting] = useState(false);
  const [isThreatActive, setIsThreatActive] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'good' | 'poor'>('good');
  
  // Always show loading screen on initial mount
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);

  // Check for AI mode in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'ai') {
      setIsAiMode(true);
    }
  }, []);

  // Network quality detection
  useEffect(() => {
    const checkNetwork = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
          setNetworkQuality('poor');
        } else {
          setNetworkQuality('good');
        }
      }
    };
    checkNetwork();
    
    const handleOffline = () => {
      setNetworkQuality('poor');
      setIsFullInterfaceSignalLost(true);
      setIsInterfaceSignalLost(true);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', () => checkNetwork());
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', () => checkNetwork());
    };
  }, []);

  // Interaction-based signal loss trigger (REMOVED - now only triggers on real offline)
  const triggerSignalLoss = useCallback(() => {
    // No longer triggering random signal loss
  }, []);

  // Cybersecurity Threat Detection (Simulated)
  useEffect(() => {
    const checkThreat = () => {
      // Check for simulated threat in localStorage
      if (localStorage.getItem('SOLARIS_THREAT_DETECTED') === 'true') {
        setIsThreatActive(true);
        setIsFullInterfaceSignalLost(true);
        setIsInterfaceSignalLost(true);
      }
    };

    // Check periodically
    const interval = setInterval(checkThreat, 5000);
    
    // Check on focus (user returns from another tab)
    window.addEventListener('focus', checkThreat);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkThreat);
    };
  }, []);

  useEffect(() => {
    // Random signal loss listeners removed
    return () => {};
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowWelcome(true);
  };

  const handleStart = () => {
    setShowWelcome(false);
    sessionStorage.setItem('app_loaded', 'true');
  };

  const handleExit = () => {
    setShowWelcome(true);
  };

  const handleTroubleshootComplete = useCallback(() => {
    setIsTroubleshooting(false);
    setIsFullInterfaceSignalLost(false);
    setIsInterfaceSignalLost(false);
    setIsThreatActive(false);
    localStorage.removeItem('SOLARIS_THREAT_DETECTED');
  }, []);

  const selectedObject = useMemo(() => {
    const findObject = (id: string, list: CelestialObject[]): CelestialObject | null => {
      for (const obj of list) {
        if (obj.id === id) return obj;
        if (obj.satellites) {
          const found = findObject(id, obj.satellites);
          if (found) return found;
        }
      }
      return null;
    };
    return selectedId ? findObject(selectedId, SOLAR_SYSTEM_DATA) : null;
  }, [selectedId]);

  const parentId = useMemo(() => {
    if (!selectedId) return null;
    const findParent = (id: string, list: CelestialObject[], parent: string | null = null): string | null => {
      for (const obj of list) {
        if (obj.id === id) return parent;
        if (obj.satellites) {
          const found = findParent(id, obj.satellites, obj.id);
          if (found) return found;
        }
      }
      return null;
    };
    return findParent(selectedId, SOLAR_SYSTEM_DATA);
  }, [selectedId]);

  const filteredObjects = useMemo(() => {
    const allObjects: CelestialObject[] = [];
    const collectAll = (list: CelestialObject[]) => {
      list.forEach(obj => {
        allObjects.push(obj);
        if (obj.satellites) collectAll(obj.satellites);
      });
    };
    collectAll(SOLAR_SYSTEM_DATA);

    if (!searchQuery) return SOLAR_SYSTEM_DATA;
    return allObjects.filter(obj => 
      obj.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const parentName = useMemo(() => {
    if (!parentId) return 'System';
    const findObject = (id: string, list: CelestialObject[]): CelestialObject | null => {
      for (const obj of list) {
        if (obj.id === id) return obj;
        if (obj.satellites) {
          const found = findObject(id, obj.satellites);
          if (found) return found;
        }
      }
      return null;
    };
    return findObject(parentId, SOLAR_SYSTEM_DATA)?.name || 'System';
  }, [parentId]);

  if (isAiMode) {
    return <SpaceBot isStandalone onClose={() => setIsAiMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 selection:text-blue-200">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" onComplete={handleLoadingComplete} />
        ) : isTroubleshooting ? (
          <TroubleshootScreen 
            key="troubleshoot" 
            onComplete={handleTroubleshootComplete} 
            isSignalLost={true} 
            isCriticalRecovery={true}
            isThreatActive={isThreatActive}
          />
        ) : isFullInterfaceSignalLost ? (
          <motion.div
            key="signal-lost"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
            
            <div className="relative mb-12">
              <div className="w-32 h-32 border-2 border-red-500/20 rounded-full flex items-center justify-center">
                <WifiOff size={48} className="text-red-500 animate-pulse" />
              </div>
              <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping opacity-20" />
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-red-500">Interface Signal Lost</h2>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">System-Wide Desynchronization</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
                <p className="text-xs font-mono text-red-400/80 leading-relaxed">
                  The interface has collapsed due to critical data stream interruption. All telemetry and visual buffers are frozen.
                </p>
                <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-red-500/60 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><AlertTriangle size={10} /> Error: 0x882-SIG</span>
                  <span className="flex items-center gap-1"><AlertTriangle size={10} /> Status: Offline</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsTroubleshooting(true);
                }}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-mono text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/40 border border-blue-400/50 transition-all active:scale-95 group"
              >
                <Wrench size={16} className="group-hover:rotate-12 transition-transform" />
                Diagnose System
              </button>
            </div>

            <div className="absolute bottom-12 left-0 right-0 text-[9px] font-mono text-white/10 uppercase tracking-[0.5em]">
              Solaris Interface // Emergency Protocol
            </div>
          </motion.div>
        ) : showWelcome ? (
          <WelcomeScreen 
            key="welcome" 
            onStart={handleStart} 
            onOpenAi={() => setIsAiMode(true)}
            isVerified={isIdentityVerified}
            setIsVerified={setIsIdentityVerified}
          />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col gap-6 sm:gap-8 min-h-screen px-safe pt-safe pb-safe">
              {/* Header */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl text-blue-400">
                    <Compass size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic">Solaris Explorer</h1>
                    <p className="text-[10px] sm:text-xs font-mono text-white/40 tracking-[0.3em] uppercase">Celestial System Interface v1.6.3</p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full md:w-auto gap-4 sm:gap-6">
                  <button 
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setIsAiMode(true);
                      } else {
                        setIsAiPanelOpen(!isAiPanelOpen);
                      }
                    }}
                    className={`p-2 sm:p-3 border rounded-xl sm:rounded-2xl transition-all group flex items-center gap-2 ${
                      isAiPanelOpen 
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' 
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20'
                    }`}
                    title="Ask Space Bot"
                  >
                    <Bot size={18} className="sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-widest">Space Bot</span>
                  </button>
                  <SolarStandardTime />
                  <button 
                    onClick={handleExit}
                    className="p-2 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl text-red-400 hover:bg-red-500/20 transition-all group"
                    title="Exit Session"
                  >
                    <LogOut size={18} className="sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </header>

              <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow relative">
                {/* Left Column: Visualizer */}
                <section className="lg:col-span-8 flex flex-col gap-6">
                  <div className="relative flex-grow">
                    <SolarSystem3D 
                      objects={SOLAR_SYSTEM_DATA} 
                      selectedId={selectedId} 
                      onSelect={setSelectedId} 
                      isPaused={isInterfaceSignalLost}
                    />
                    
                    {/* Search Overlay */}
                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-4">
                      {selectedId && (
                        <button
                          onClick={() => setSelectedId(parentId)}
                          className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl py-2 px-4 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <ArrowLeft size={14} />
                          <span className="hidden sm:inline">Back to {parentId ? SOLAR_SYSTEM_DATA.find(o => o.id === parentId)?.name : 'System'}</span>
                          <span className="sm:hidden">Back</span>
                        </button>
                      )}
                      <div className="relative w-40 sm:w-64">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/30 sm:w-4 sm:h-4" size={14} />
                        <input 
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-xl py-2 pl-9 sm:pl-10 pr-4 text-[10px] sm:text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Navigation */}
                  <div className="flex flex-wrap gap-2 pb-2">
                    {filteredObjects.map(obj => (
                      <button
                        key={obj.id}
                        onClick={() => setSelectedId(obj.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all whitespace-nowrap border ${
                          selectedId === obj.id 
                            ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {obj.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Right Column: Details */}
                <aside className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-md flex flex-col max-h-[600px] lg:max-h-none overflow-y-auto custom-scrollbar">
                  <InfoPanel 
                    object={selectedObject} 
                    onSelectSatellite={setSelectedId}
                    onBack={() => setSelectedId(parentId)}
                    parentName={parentName}
                    isInterfaceSignalLost={isInterfaceSignalLost}
                    setIsInterfaceSignalLost={setIsInterfaceSignalLost}
                  />
                </aside>

                {/* AI Floating Panel (Offset GUI) */}
                <AnimatePresence>
                  {isAiPanelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.95 }}
                      className="fixed bottom-24 right-6 sm:right-12 z-[80] w-[calc(100%-3rem)] sm:w-[400px] h-[500px] max-h-[70vh]"
                    >
                      <div className="h-full rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] bg-[#0a0a0a]/95 backdrop-blur-xl">
                        <SpaceBot onClose={() => setIsAiPanelOpen(false)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>

              <footer className="mt-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-white/20">
                <div className="flex gap-6">
                  <span>Orbital Data: NASA API (Simulated)</span>
                  <span>Ref: J2000 Epoch</span>
                </div>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-blue-400 transition-colors">System Status</a>
                  <span>© 2026 Solaris Interface</span>
                </div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
