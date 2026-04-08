import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TroubleshootScreen } from './TroubleshootScreen';
import { CelestialObject } from '../data/solarSystem';
import { Thermometer, Globe, Orbit, Satellite, Info, ArrowRight, ArrowLeft, Clock, Camera, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut, ScrollText, Trophy, Terminal, Zap, Calendar, Wrench, AlertTriangle } from 'lucide-react';
import { ModelViewer } from './ModelViewer';

type TabType = 'overview' | 'logs' | 'feed';

interface InfoPanelProps {
  object: CelestialObject | null;
  onSelectSatellite: (id: string) => void;
  onBack: () => void;
  parentName?: string;
  isInterfaceSignalLost: boolean;
  setIsInterfaceSignalLost: (val: boolean) => void;
}

const formatNumber = (num: number) => {
  return num.toLocaleString('en-US'); // Uses , for thousands and . for decimals
};

const formatYearLength = (days: number | undefined) => {
  if (days === undefined || days === 0) return 'N/A';
  if (days > 99999) return 'Interstellar (Infinite)';
  
  const totalHours = Math.round(days * 24);
  const totalDays = Math.round(days);
  const months = (days / 30.44).toFixed(1);
  
  return `${formatNumber(totalHours)}h, ${formatNumber(totalDays)}d, ${months}m`;
};

const formatDataString = (str: string) => {
  // Returns original string as it already uses US formatting in data (e.g. 384,400 and 149.6)
  return str;
};

const getIndochinaComparison = (temp: number) => {
  const indochinaAvg = 27;
  if (temp === indochinaAvg) return "Same as Indochina avg";
  
  if (temp > indochinaAvg) {
    const ratio = (temp / indochinaAvg).toFixed(1);
    return `${ratio}x hotter than Indochina avg`;
  } else {
    const diff = Math.abs(temp - indochinaAvg).toFixed(0);
    return `${diff}°C cooler than Indochina avg`;
  }
};

const getMoonEvent = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-indexed
  const day = date.getDate();

  // 2026 Eclipses
  if (year === 2026) {
    if (month === 2 && day === 17) return "Annular Solar Eclipse";
    if (month === 3 && day === 3) return "Total Lunar Eclipse";
    if (month === 8 && day === 12) return "Total Solar Eclipse";
    if (month === 8 && day === 28) return "Partial Lunar Eclipse";
  }
  
  // 2025 Eclipses (for context if user changes time)
  if (year === 2025) {
    if (month === 3 && day === 14) return "Total Lunar Eclipse";
    if (month === 3 && day === 29) return "Partial Solar Eclipse";
    if (month === 9 && day === 7) return "Total Lunar Eclipse";
    if (month === 9 && day === 21) return "Partial Solar Eclipse";
  }

  return "N/A";
};

const formatSpeed = (kmh: number | undefined) => {
  if (kmh === undefined) return null;
  const mach = (kmh / 1225.04).toFixed(1);
  const beta = (kmh / 1079252849).toExponential(2);
  return {
    kmh: `${formatNumber(kmh)} km/h`,
    mach: `Mach ${mach}`,
    beta: `${beta}β`
  };
};

const CamEventOverlay: React.FC<{ event: 'none' | 'los' | 'calibrating' | 'interference' | 'interface_signal_lost' }> = ({ event }) => {
  if (event === 'none') return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {event === 'interface_signal_lost' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-20 h-20 border-2 border-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-500 animate-pulse" />
              </div>
              <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping opacity-20" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[12px] font-mono text-red-500 font-bold uppercase tracking-[0.4em]">Critical Error</span>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Interface Signal Lost</span>
              <div className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-[8px] font-mono text-red-400/80 text-center leading-relaxed max-w-[200px]">
                  Local network instability detected. Data stream interrupted to prevent interface desynchronization.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {event === 'los' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-white/60 uppercase tracking-[0.3em] animate-pulse">Signal Lost</span>
              <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Attempting Reconnection...</span>
            </div>
          </motion.div>
        )}

        {event === 'calibrating' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex flex-col"
          >
            <div className="flex-1 grid grid-cols-7 h-full">
              <div className="bg-[#c0c0c0]" />
              <div className="bg-[#c0c000]" />
              <div className="bg-[#00c0c0]" />
              <div className="bg-[#00c000]" />
              <div className="bg-[#c000c0]" />
              <div className="bg-[#c00000]" />
              <div className="bg-[#0000c0]" />
            </div>
            <div className="h-1/4 grid grid-cols-7">
              <div className="bg-[#0000c0]" />
              <div className="bg-[#131313]" />
              <div className="bg-[#c000c0]" />
              <div className="bg-[#131313]" />
              <div className="bg-[#00c0c0]" />
              <div className="bg-[#131313]" />
              <div className="bg-[#c0c0c0]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-md border border-white/20 px-6 py-3 rounded-lg">
                <span className="text-[12px] font-mono text-white uppercase tracking-[0.4em] font-bold">Sensor Calibration</span>
              </div>
            </div>
          </motion.div>
        )}

        {event === 'interference' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/10 mix-blend-overlay flex flex-col justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 animate-pulse" />
            <motion.div 
              className="w-full h-8 bg-white/20 blur-xl"
              animate={{ y: [-100, 400] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="w-full h-1 bg-white/40"
              animate={{ y: [-100, 400] }}
              transition={{ duration: 0.2, repeat: Infinity, ease: "linear", delay: 0.1 }}
            />
            <div className="absolute top-4 left-4">
              <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest font-bold animate-pulse">Signal Interference</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MissionTimeline: React.FC<{ logs: any[] }> = ({ logs }) => {
  return (
    <div className="relative py-8 px-4 overflow-x-auto no-scrollbar">
      <div className="flex gap-8 min-w-max relative">
        {/* Horizontal Line */}
        <div className="absolute top-[22px] left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0" />
        
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative flex flex-col items-center w-48 text-center group"
          >
            {/* Point on Timeline */}
            <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 group-hover:scale-110 ${
              log.source === 'LCC' ? 'bg-red-950/80 border-red-500/50 text-red-400' : 
              log.source === 'MCC' ? 'bg-blue-950/80 border-blue-500/50 text-blue-400' : 
              log.source === 'ORION' ? 'bg-orange-950/80 border-orange-500/50 text-orange-400' :
              log.source === 'BOOSTER' ? 'bg-yellow-950/80 border-yellow-500/50 text-yellow-400' :
              'bg-gray-900 border-gray-500/50 text-gray-400'
            }`}>
              <Clock size={18} />
            </div>
            
            {/* Content */}
            <div className="mt-4 space-y-2">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-white/80 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {log.source}
                </span>
                <span className="text-[9px] font-mono text-white/40 mt-1">{log.timestamp}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 shadow-xl group-hover:border-white/20 transition-all">
                <p className="text-[11px] text-white/90 font-mono leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                  {log.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const InfoPanel: React.FC<InfoPanelProps> = ({ 
  object, 
  onSelectSatellite, 
  onBack, 
  parentName,
  isInterfaceSignalLost,
  setIsInterfaceSignalLost
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [camOffset, setCamOffset] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1.3);
  const [jwstView, setJwstView] = React.useState<'deep' | 'alpha' | 'pismis' | 'discovery' | 'tarantula'>('deep');
  const [hubbleView, setHubbleView] = React.useState<'telescope' | 'galaxy' | 'whirlpool' | 'orion'>('galaxy');
  const [issView, setIssView] = React.useState<'interior' | 'exterior1' | 'exterior2' | 'exterior3' | 'live_broadcast'>('interior');
  const [voyagerView, setVoyagerView] = React.useState<'pale_blue_dot' | 'jupiter_storm' | 'launch_video'>('pale_blue_dot');
  const [apolloView, setApolloView] = React.useState<'earth_rise' | 'lunar_surface' | 'launch_video'>('earth_rise');
  const [artemisView, setArtemisView] = React.useState<'orion_cam' | 'lunar_approach' | 'archive_feed'>('orion_cam');
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');
  const [camEvent, setCamEvent] = React.useState<'none' | 'los' | 'calibrating' | 'interference'>('none');
  const [isTroubleshooting, setIsTroubleshooting] = React.useState(false);
  const [hasTroubleshot, setHasTroubleshot] = React.useState(false);
  const [networkQuality, setNetworkQuality] = React.useState<'good' | 'poor'>('good');

  const hasFeed = ['iss', 'jwst', 'voyager1', 'eht', 'hubble', 'apollo11', 'artemis2'].includes(object?.id || '');
  const hasLogs = !!(object?.missionLogs && object.missionLogs.length > 0);

  React.useEffect(() => {
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
    window.addEventListener('offline', () => setNetworkQuality('poor'));
    window.addEventListener('online', () => checkNetwork());
    return () => {
      window.removeEventListener('offline', () => setNetworkQuality('poor'));
      window.removeEventListener('online', () => checkNetwork());
    };
  }, []);

  React.useEffect(() => {
    setActiveTab('overview');
    setIsTroubleshooting(false);
    setHasTroubleshot(false);
    setCamEvent('none');
  }, [object?.id]);
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    // Full interface signal loss only on real network loss
    if (networkQuality === 'poor') {
      setCamEvent('los');
      return;
    }

    // Random camera events only for satellites
    if (object?.type !== 'satellite') {
      setCamEvent('none');
      return;
    }

    let timeoutId: NodeJS.Timeout;
    
    const scheduleNext = () => {
      // If troubleshot, events are much rarer
      const minDelay = hasTroubleshot ? 60000 : 15000;
      const maxDelay = hasTroubleshot ? 120000 : 45000;
      const nextDelay = minDelay + Math.random() * (maxDelay - minDelay);
      
      timeoutId = setTimeout(() => {
        const availableEvents: ('los' | 'calibrating' | 'interference')[] = ['los', 'interference'];
        if (!hasTroubleshot) {
          availableEvents.push('calibrating');
        }
        
        const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        setCamEvent(randomEvent);
        
        // Events last 15-30 seconds for satellites
        const duration = 15000 + Math.random() * 15000;
        timeoutId = setTimeout(() => {
          setCamEvent('none');
          scheduleNext();
        }, duration);
      }, nextDelay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [hasTroubleshot, networkQuality, object?.id, object?.type]);

  const moveCam = (dx: number, dy: number) => {
    setCamOffset(prev => ({
      x: Math.max(-15, Math.min(15, prev.x + dx)),
      y: Math.max(-15, Math.min(15, prev.y + dy))
    }));
  };

  const resetCam = () => {
    setCamOffset({ x: 0, y: 0 });
    setZoom(1.3);
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 1.0));

  const handleTroubleshootComplete = React.useCallback(() => {
    setIsTroubleshooting(false);
    setHasTroubleshot(true);
    setCamEvent('none');
    setIsInterfaceSignalLost(false);
  }, [setIsInterfaceSignalLost]);

  if (!object) return (
    <div className="h-full flex items-center justify-center text-white/30 font-mono italic text-center px-8">
      Select a celestial body from the map to initialize data stream
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={object.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="h-full flex flex-col gap-6 overflow-y-auto scrollbar-hide"
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 hover:text-blue-400 transition-colors group w-fit"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Back to {parentName || 'System'}
        </button>

        {/* 3D Model Viewer */}
        {!object.isPlanned && object.id !== 'artemis2' ? (
          <ModelViewer object={object} />
        ) : (
          <div className="w-full h-[300px] bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center animate-spin-slow">
              <Satellite size={32} className="text-white/20" />
            </div>
            <div className="text-center z-10">
              <span className={`text-[10px] font-mono uppercase tracking-[0.3em] ${object.id === 'artemis2' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'} px-3 py-1 rounded-full border`}>
                {object.id === 'artemis2' ? 'Mission Complete' : 'Planned Mission'}
              </span>
              <p className="text-[11px] font-mono text-white/30 mt-3 uppercase tracking-widest">
                {object.id === 'artemis2' ? '3D Telemetry Offline // Spacecraft Re-entering' : '3D Telemetry Offline // Mission Not Yet Launched'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-full shadow-inner shrink-0"
            style={{ 
              backgroundColor: object.color,
              boxShadow: `inset -5px -5px 10px rgba(0,0,0,0.5), 0 0 15px ${object.color}44`
            }}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tighter text-white uppercase leading-none">{object.name}</h2>
              {object.isPlanned && (
                <span className="text-[8px] font-mono bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase tracking-widest">
                  PLANNED
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mt-1">{object.type}</p>
          </div>
        </div>

        <p className="text-white/70 leading-relaxed italic font-serif text-lg border-l-2 border-blue-500/30 pl-4">
          "{object.description}"
        </p>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all ${activeTab === 'overview' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white/60'}`}
          >
            <Info size={12} /> Overview
          </button>
          {hasLogs && (
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all ${activeTab === 'logs' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white/60'}`}
            >
              <ScrollText size={12} /> Mission Logs
            </button>
          )}
          {hasFeed && (
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-mono uppercase tracking-widest rounded-lg transition-all ${activeTab === 'feed' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white/60'}`}
            >
              <Camera size={12} /> Live Feed
            </button>
          )}
        </div>

        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-3">
              <StatCard 
                icon={<Globe size={16} />} 
                label="Distance to Earth" 
                value={object.distanceFromEarth === '0' ? 'N/A (Home)' : `${formatDataString(object.distanceFromEarth)} km`} 
              />
              {object.speed && (
                <StatCard 
                  icon={<Zap size={16} />} 
                  label="Orbital Speed" 
                  value={formatSpeed(object.speed)?.kmh || ''} 
                  subValue={`${formatSpeed(object.speed)?.mach} | ${formatSpeed(object.speed)?.beta}`}
                  color="text-yellow-400"
                />
              )}
              <StatCard 
                icon={<Thermometer size={16} />} 
                label="Avg. Temperature" 
                value={`${formatNumber(object.temperature)}°C`} 
                subValue={getIndochinaComparison(object.temperature)}
                color={object.temperature > 27 ? 'text-orange-400' : 'text-blue-400'}
              />
              <StatCard 
                icon={<Orbit size={16} />} 
                label="Natural Orbit" 
                value={object.naturalOrbit || 'None'} 
              />
              <StatCard 
                icon={<Clock size={16} />} 
                label="Year Length (H, D, M)" 
                value={formatYearLength(object.orbitalPeriod)} 
                subValue={object.timeType}
              />
              <StatCard 
                icon={<Satellite size={16} />} 
                label="Artificial Orbit" 
                value={object.artificialOrbit || 'None'} 
              />
              {object.id === 'moon' && (
                <StatCard 
                  icon={<Calendar size={16} />} 
                  label="Lunar Events" 
                  value={getMoonEvent(currentTime)} 
                  color={getMoonEvent(currentTime) !== 'N/A' ? 'text-yellow-400' : 'text-white/40'}
                />
              )}
            </div>

            {/* Natural Moons & Features Section */}
            {object.satellites && object.satellites.some(sat => !sat.isArtificial) && (
              <div className="flex flex-col gap-3">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Orbit size={12} /> Natural Moons & Features
                </h3>
                <div className="flex flex-col gap-2">
                  {object.satellites.filter(sat => !sat.isArtificial).map(moon => (
                    <div key={moon.id} className="bg-white/5 border border-white/5 p-3 rounded-xl border-l-2" style={{ borderLeftColor: moon.color }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{moon.name}</span>
                        <span className="text-[9px] font-mono text-white/20">NATURAL SATELLITE</span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed italic">
                        {moon.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {object.satellites && object.satellites.length > 0 && (
              <div className="mt-2">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                  <Satellite size={12} /> Satellites & Spacecraft
                </h3>
                <div className="flex flex-wrap gap-2">
                  {object.satellites.map(sat => (
                    <button
                      key={sat.id}
                      onClick={() => onSelectSatellite(sat.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs text-white/80 group"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sat.color }} />
                      {sat.name}
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'logs' && hasLogs && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Achievements */}
            {object.achievements && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Trophy size={12} className="text-yellow-500" /> Key Achievements
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {object.achievements.map((achievement, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                      <p className="text-xs text-white/80 leading-relaxed">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mission Logs Timeline */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Calendar size={12} className="text-blue-400" /> Mission Timeline
              </h3>
              <MissionTimeline logs={object.missionLogs || []} />
            </div>

            {/* Mission Logs List (Detailed) */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Terminal size={12} className="text-blue-400" /> Mission Control Logs
              </h3>
              <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                {object.missionLogs?.map((log, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full bg-black border border-white/20 flex items-center justify-center z-10">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        log.source === 'LCC' ? 'bg-red-500' : 
                        log.source === 'MCC' ? 'bg-blue-500' : 
                        log.source === 'ORION' ? 'bg-orange-500' :
                        log.source === 'BOOSTER' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-white/60">{log.source}</span>
                        <span className="text-[9px] font-mono text-white/30">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-white/90 font-mono leading-relaxed">
                        <span className="text-blue-400 mr-2">{'>'}</span>
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'feed' && hasFeed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* ISS Live Feed Simulation */}
            {object.id === 'iss' && (
              <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-blue-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Live Camera Feed</span>
              </div>
              <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
                <button 
                  onClick={() => setIssView('interior')}
                  className={`px-2 py-1 rounded text-[8px] font-mono border transition-all whitespace-nowrap ${issView === 'interior' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  INTERIOR
                </button>
                <button 
                  onClick={() => setIssView('exterior1')}
                  className={`px-2 py-1 rounded text-[8px] font-mono border transition-all whitespace-nowrap ${issView === 'exterior1' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  CAM 1
                </button>
                <button 
                  onClick={() => setIssView('exterior2')}
                  className={`px-2 py-1 rounded text-[8px] font-mono border transition-all whitespace-nowrap ${issView === 'exterior2' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  EARTH
                </button>
                <button 
                  onClick={() => setIssView('exterior3')}
                  className={`px-2 py-1 rounded text-[8px] font-mono border transition-all whitespace-nowrap ${issView === 'exterior3' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  ARRAYS
                </button>
                <button 
                  onClick={() => setIssView('live_broadcast')}
                  className={`px-2 py-1 rounded text-[8px] font-mono border transition-all whitespace-nowrap ${issView === 'live_broadcast' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  LIVE BROADCAST
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-[9px] font-mono text-white font-bold tracking-[0.2em] drop-shadow-md">
                    LIVE // {issView === 'live_broadcast' ? 'MISSION-CONTROL-ISS' : `HDEV-2 ${issView.toUpperCase()}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">REC: 00:00:00:00</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 items-end h-2">
                    <div className={`w-0.5 h-1 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-blue-500/60' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-1.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-blue-500/60' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-2 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-blue-500/60' : 'bg-red-500/40'}`} />
                    <div className="w-0.5 h-1 bg-white/10" />
                  </div>
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter">
                    {isInterfaceSignalLost ? 'SIG: CRITICAL' : camEvent === 'none' ? 'SIG: STABLE' : `SIG: ${camEvent.toUpperCase()}`}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-white/60 tabular-nums drop-shadow-md">
                  {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="relative w-full aspect-video overflow-hidden">
                {issView === 'live_broadcast' ? (
                  <div className="w-full h-full bg-black overflow-hidden relative">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/sWasdbDVNvc?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1"
                      title="ISS Live Broadcast"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full scale-[1.05] pointer-events-none"
                    />
                    {/* Transparent overlay to ensure no interactions reach the iframe */}
                    <div className="absolute inset-0 z-10" />
                  </div>
                ) : isTroubleshooting ? (
                  <TroubleshootScreen 
                    onComplete={handleTroubleshootComplete} 
                    isSignalLost={isInterfaceSignalLost} 
                    isCriticalRecovery={false}
                    isLocal={true}
                    title="Camera Troubleshooting"
                  />
                ) : (
                  <>
                    <CamEventOverlay event={isInterfaceSignalLost ? 'interface_signal_lost' : camEvent} />
                    
                    {/* Troubleshoot Button */}
                    <AnimatePresence>
                      {(camEvent !== 'none' || isInterfaceSignalLost) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
                        >
                          <button
                            onClick={() => setIsTroubleshooting(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/40 border border-blue-400/50 transition-all active:scale-95"
                          >
                            <Wrench size={14} />
                            Troubleshoot Cam
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                <motion.div
                  key={issView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ 
                      x: [0, 5, -5, 0],
                      y: [0, -3, 3, 0],
                    }}
                    transition={{ 
                      duration: 20,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.img 
                      key={issView}
                      src={
                        issView === 'interior' ? "https://www.thisiscolossal.com/wp-content/uploads/2020/08/longitudinal-view-destiny.jpg" :
                        issView === 'exterior1' ? "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/ISS-cam-port-8-cams-unlabled.jpg/250px-ISS-cam-port-8-cams-unlabled.jpg" :
                        issView === 'exterior2' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm_mJb_NOVXL65FOgOhLVjkXW2qngIFF8wGg&s" :
                        "https://i.ytimg.com/vi/tpaCAmFUYLg/maxresdefault.jpg"
                      } 
                      alt={`ISS ${issView} View`} 
                      className="w-full h-full object-cover"
                      initial={{ scale: zoom - 0.2 }}
                      animate={{ 
                        x: `${camOffset.x}%`,
                        y: `${camOffset.y}%`,
                        scale: zoom
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 100,
                        damping: 30
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </motion.div>
                
                {/* Camera Controller */}
                <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <div />
                    <button 
                      onClick={() => moveCam(0, 5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <div />
                    
                    <button 
                      onClick={() => moveCam(5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={resetCam}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button 
                      onClick={() => moveCam(-5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <ChevronRight size={14} />
                    </button>
                    
                    <div />
                    <button 
                      onClick={() => moveCam(0, -5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <div />
                  </div>
                  <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <button 
                      onClick={zoomIn}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      onClick={zoomOut}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                  </div>
                  <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">Cam Control</span>
                </div>

                {/* Static/Noise overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                
                {/* Random Glitch Effect */}
                <motion.div 
                  className="absolute inset-0 bg-blue-500/10 mix-blend-overlay pointer-events-none"
                  animate={{ 
                    opacity: [0, 0.1, 0, 0.05, 0],
                    x: [0, -2, 2, 0]
                  }}
                  transition={{ 
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                />
              </>
            )}
          </div>
              
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-50" />
              
              {/* Intermittent signal interference */}
              <motion.div 
                className="absolute inset-x-0 h-[1px] bg-white/10 pointer-events-none z-20"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono text-blue-400 uppercase tracking-tighter">Altitude: 408.2 km</span>
                  <span className="text-[8px] font-mono text-blue-400 uppercase tracking-tighter">Velocity: 7.66 km/s</span>
                </div>
              </div>
              
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            </div>
          </div>
        )}

            {/* JWST Live Feed Simulation */}
            {object.id === 'jwst' && (
              <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-yellow-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Deep Space Observatory Feed</span>
              </div>
              <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                <button 
                  onClick={() => setJwstView('deep')}
                  className={`px-2 py-1 text-[8px] font-mono uppercase tracking-tighter rounded transition-all ${jwstView === 'deep' ? 'bg-yellow-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
                >
                  Deep Field
                </button>
                <button 
                  onClick={() => setJwstView('alpha')}
                  className={`px-2 py-1 text-[8px] font-mono uppercase tracking-tighter rounded transition-all ${jwstView === 'alpha' ? 'bg-yellow-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
                >
                  Alpha Centauri
                </button>
                <button 
                  onClick={() => setJwstView('pismis')}
                  className={`px-2 py-1 text-[8px] font-mono uppercase tracking-tighter rounded transition-all ${jwstView === 'pismis' ? 'bg-yellow-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
                >
                  Pismis 24
                </button>
                <button 
                  onClick={() => setJwstView('discovery')}
                  className={`px-2 py-1 text-[8px] font-mono uppercase tracking-tighter rounded transition-all ${jwstView === 'discovery' ? 'bg-yellow-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
                >
                  Discovery
                </button>
                <button 
                  onClick={() => setJwstView('tarantula')}
                  className={`px-2 py-1 text-[8px] font-mono uppercase tracking-tighter rounded transition-all ${jwstView === 'tarantula' ? 'bg-yellow-500 text-black font-bold' : 'text-white/40 hover:text-white'}`}
                >
                  Tarantula
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-[9px] font-mono text-white font-bold tracking-[0.2em] drop-shadow-md">
                    LIVE // {
                      jwstView === 'deep' ? 'NIRCam INFRARED' : 
                      jwstView === 'alpha' ? 'MIRI ALPHA-C' : 
                      jwstView === 'pismis' ? 'NIRSpec PISMIS' :
                      jwstView === 'discovery' ? 'NIRCam DISCOVERY' :
                      'MIRI TARANTULA'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">REC: 00:00:00:00</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 items-end h-2">
                    <div className={`w-0.5 h-2 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-yellow-500/60' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-1.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-yellow-500/60' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-2 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-yellow-500/60' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-1.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-yellow-500/60' : 'bg-red-500/40'}`} />
                  </div>
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter">
                    {isInterfaceSignalLost ? 'SIG: CRITICAL' : camEvent === 'none' ? 'SIG: L2-RELAY' : `SIG: ${camEvent.toUpperCase()}`}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-white/60 tabular-nums drop-shadow-md">
                  {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="relative w-full aspect-video overflow-hidden">
                {isTroubleshooting ? (
                  <TroubleshootScreen 
                    onComplete={handleTroubleshootComplete} 
                    isSignalLost={isInterfaceSignalLost} 
                    isCriticalRecovery={false}
                    isLocal={true}
                    title="Camera Troubleshooting"
                  />
                ) : (
                  <>
                    <CamEventOverlay event={isInterfaceSignalLost ? 'interface_signal_lost' : camEvent} />
                    
                    {/* Troubleshoot Button */}
                    <AnimatePresence>
                      {(camEvent !== 'none' || isInterfaceSignalLost) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
                        >
                          <button
                            onClick={() => setIsTroubleshooting(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/40 border border-blue-400/50 transition-all active:scale-95"
                          >
                            <Wrench size={14} />
                            Troubleshoot Cam
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                <motion.div
                  key={jwstView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ 
                      x: [0, 3, -3, 0],
                      y: [0, -2, 2, 0],
                    }}
                    transition={{ 
                      duration: 30,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.img 
                      src={
                        jwstView === 'deep' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYo9kkF-cY6bn0rYrJ7Do_YrHucJGGiXIaUA&s" : 
                        jwstView === 'alpha' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTWLVHbskmnVl3K2usMEp5Kn4AxxNcH7hjEC-cl33M62t6tVgALiJrHtSugiVgs5TXWUsfTvYViKJq-8bxW4CuYi9UDmmel6Sm_LLQxrvuQQ&s=10" :
                        jwstView === 'pismis' ? "https://science.nasa.gov/wp-content/uploads/2023/07/pismis-24.jpg" :
                        jwstView === 'discovery' ? "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/webb/science/2025/11/STScI-01K34EC16CKMDAPB54D4SWQ79V.png?w=900&h=681&fit=crop&crop=faces%2Cfocalpoint" :
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Tarantula_Nebula_by_JWST.jpg/330px-Tarantula_Nebula_by_JWST.jpg"
                      }
                      alt={
                        jwstView === 'deep' ? "JWST Deep Space View" : 
                        jwstView === 'alpha' ? "JWST Alpha Centauri View" : 
                        jwstView === 'pismis' ? "JWST Pismis 24 View" :
                        jwstView === 'discovery' ? "JWST New Discovery View" :
                        "JWST Tarantula Nebula View"
                      }
                      className="w-full h-full object-cover"
                      animate={{ 
                        x: `${camOffset.x}%`,
                        y: `${camOffset.y}%`,
                        scale: zoom
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 80,
                        damping: 40
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </motion.div>
                
                {/* HUD Overlays */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 border-t border-l border-white/20" />
                    <div className="w-8 h-8 border-t border-r border-white/20" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-b border-l border-white/20" />
                    <div className="w-8 h-8 border-b border-r border-white/20" />
                  </div>
                </div>
                
                {/* Camera Controller */}
                <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <div />
                    <button 
                      onClick={() => moveCam(0, 5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-yellow-500"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <div />
                    
                    <button 
                      onClick={() => moveCam(5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-yellow-500"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={resetCam}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-yellow-500"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button 
                      onClick={() => moveCam(-5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-yellow-500"
                    >
                      <ChevronRight size={14} />
                    </button>
                    
                    <div />
                    <button 
                      onClick={() => moveCam(0, -5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-yellow-500"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <div />
                  </div>
                  <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <button 
                      onClick={zoomIn}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-yellow-500"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      onClick={zoomOut}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-yellow-500"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                  </div>
                  <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">Observatory Control</span>
                </div>

                {/* Static/Noise overlay */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                
                {/* Random Glitch Effect (Golden for JWST) */}
                <motion.div 
                  className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay pointer-events-none"
                  animate={{ 
                    opacity: [0, 0.08, 0, 0.04, 0],
                    x: [0, -1, 1, 0]
                  }}
                  transition={{ 
                    duration: 0.3,
                    repeat: Infinity,
                    repeatDelay: 8
                  }}
                />
              </>
            )}
          </div>
              
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,200,0,0.02),rgba(255,255,255,0.01),rgba(255,200,0,0.02))] bg-[length:100%_4px,3px_100%] opacity-40" />
              
              {/* Intermittent signal interference */}
              <motion.div 
                className="absolute inset-x-0 h-[1px] bg-yellow-500/10 pointer-events-none z-20"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono text-yellow-500 uppercase tracking-tighter">Station: L2 Point</span>
                  <span className="text-[8px] font-mono text-yellow-500 uppercase tracking-tighter">Target: {
                    jwstView === 'deep' ? 'Deep Field Alpha' : 
                    jwstView === 'alpha' ? 'Alpha Centauri Binary' : 
                    jwstView === 'pismis' ? 'Pismis 24 Cluster' :
                    jwstView === 'discovery' ? 'STScI-2025 Discovery' :
                    'Tarantula Nebula'
                  }</span>
                </div>
              </div>
              
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
            </div>
          </div>
        )}

        {/* EHT Live Feed Simulation */}
        {object.id === 'eht' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-orange-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Event Horizon Telescope Feed</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-[9px] font-mono text-white font-bold tracking-[0.2em] drop-shadow-md">
                    LIVE // EHT POLARIZED
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">REC: 00:00:00:00</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 items-end h-2">
                    <div className={`w-0.5 h-1 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-orange-500/60 animate-pulse' : 'bg-red-500/40'}`} />
                    <div className="w-0.5 h-1 bg-white/10" />
                    <div className={`w-0.5 h-1.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-orange-500/60 animate-pulse' : 'bg-red-500/40'}`} />
                    <div className="w-0.5 h-1 bg-white/10" />
                  </div>
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter">
                    {isInterfaceSignalLost ? 'SIG: CRITICAL' : camEvent === 'none' ? 'SIG: WEAK/INTERFERE' : `SIG: ${camEvent.toUpperCase()}`}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-white/60 tabular-nums drop-shadow-md">
                  {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="relative w-full aspect-video overflow-hidden">
                {isTroubleshooting ? (
                  <TroubleshootScreen 
                    onComplete={handleTroubleshootComplete} 
                    isSignalLost={isInterfaceSignalLost} 
                    isCriticalRecovery={false}
                    isLocal={true}
                    title="Camera Troubleshooting"
                  />
                ) : (
                  <>
                    <CamEventOverlay event={isInterfaceSignalLost ? 'interface_signal_lost' : camEvent} />
                    
                    {/* Troubleshoot Button */}
                    <AnimatePresence>
                      {(camEvent !== 'none' || isInterfaceSignalLost) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
                        >
                          <button
                            onClick={() => setIsTroubleshooting(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/40 border border-blue-400/50 transition-all active:scale-95"
                          >
                            <Wrench size={14} />
                            Troubleshoot Cam
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                <motion.div
                  className="w-full h-full"
                  animate={{ 
                    x: [0, 1, -1, 0],
                    y: [0, -1, 1, 0],
                  }}
                  transition={{ 
                    duration: 50,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/A_view_of_the_M87_supermassive_black_hole_in_polarised_light.tif/lossy-page1-250px-A_view_of_the_M87_supermassive_black_hole_in_polarised_light.tif.jpg" 
                    alt="M87 Black Hole View" 
                    className="w-full h-full object-cover"
                    animate={{ 
                      x: `${camOffset.x}%`,
                      y: `${camOffset.y}%`,
                      scale: zoom
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 70,
                      damping: 45
                    }}
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                
                {/* HUD Overlays */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 border-t border-l border-white/20" />
                    <div className="w-8 h-8 border-t border-r border-white/20" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-b border-l border-white/20" />
                    <div className="w-8 h-8 border-b border-r border-white/20" />
                  </div>
                </div>
                
                {/* Camera Controller */}
                <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <div />
                    <button 
                      onClick={() => moveCam(0, 5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-orange-500"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <div />
                    
                    <button 
                      onClick={() => moveCam(5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-orange-500"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={resetCam}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-orange-500"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button 
                      onClick={() => moveCam(-5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-orange-500"
                    >
                      <ChevronRight size={14} />
                    </button>
                    
                    <div />
                    <button 
                      onClick={() => moveCam(0, -5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-orange-500"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <div />
                  </div>
                  <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <button 
                      onClick={zoomIn}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-orange-500"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      onClick={zoomOut}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-orange-500"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                  </div>
                  <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">EHT Control</span>
                </div>

                {/* Static/Noise overlay */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-10" />
                
                {/* Random Glitch Effect */}
                <motion.div 
                  className="absolute inset-0 bg-orange-500/5 mix-blend-overlay pointer-events-none z-10"
                  animate={{ 
                    opacity: [0, 0.1, 0, 0.05, 0],
                    x: [0, -2, 2, 0]
                  }}
                  transition={{ 
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 4
                  }}
                />
              </>
            )}
          </div>
              
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,100,0,0.02),rgba(255,255,255,0.01),rgba(255,100,0,0.02))] bg-[length:100%_4px,3px_100%] opacity-40 z-20" />
              
              {/* Intermittent signal interference */}
              <motion.div 
                className="absolute inset-x-0 h-[1px] bg-white/10 pointer-events-none z-20"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono text-orange-500 uppercase tracking-tighter">Location: Global Array</span>
                  <span className="text-[8px] font-mono text-orange-500 uppercase tracking-tighter">Target: M87 Event Horizon</span>
                </div>
              </div>
              
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]" />
            </div>
          </div>
        )}

        {/* Voyager 1 Live Feed Simulation */}
        {object.id === 'voyager1' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-gray-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Interstellar Camera Feed</span>
              </div>
              <div className="flex gap-1 bg-black/40 p-0.5 rounded-md border border-white/5">
                <button 
                  onClick={() => setVoyagerView('pale_blue_dot')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${voyagerView === 'pale_blue_dot' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  PALE BLUE DOT
                </button>
                <button 
                  onClick={() => setVoyagerView('jupiter_storm')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${voyagerView === 'jupiter_storm' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  JUPITER STORM
                </button>
                <button 
                  onClick={() => setVoyagerView('launch_video')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${voyagerView === 'launch_video' ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white/60'}`}
                >
                  LAUNCH VIDEO
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-[9px] font-mono text-white font-bold tracking-[0.2em] drop-shadow-md">
                    LIVE // {voyagerView === 'pale_blue_dot' ? 'NARROW ANGLE CAMERA' : voyagerView === 'jupiter_storm' ? 'WIDE FIELD CAMERA' : 'ARCHIVE-V1-LAUNCH'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">REC: 00:00:00:00</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 items-end h-2">
                    <div className={`w-0.5 h-0.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-white/40 animate-pulse' : 'bg-red-500/40'}`} />
                    <div className="w-0.5 h-0.5 bg-white/10" />
                    <div className="w-0.5 h-0.5 bg-white/10" />
                    <div className="w-0.5 h-0.5 bg-white/10" />
                  </div>
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter">
                    {isInterfaceSignalLost ? 'SIG: CRITICAL' : camEvent === 'none' ? 'SIG: DEEP-SPACE/CRITICAL' : `SIG: ${camEvent.toUpperCase()}`}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-white/60 tabular-nums drop-shadow-md">
                  {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="relative w-full aspect-video overflow-hidden">
                {voyagerView === 'launch_video' ? (
                  <div className="w-full h-full bg-black overflow-hidden relative">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/3LoWEncvTLQ?autoplay=0&mute=0&controls=1&showinfo=1&rel=0&modestbranding=0"
                      title="Voyager 1 Launch Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : isTroubleshooting ? (
                  <TroubleshootScreen 
                    onComplete={handleTroubleshootComplete} 
                    isSignalLost={isInterfaceSignalLost} 
                    isCriticalRecovery={false}
                    isLocal={true}
                    title="Camera Troubleshooting"
                  />
                ) : (
                  <>
                    <CamEventOverlay event={isInterfaceSignalLost ? 'interface_signal_lost' : camEvent} />
                    
                    {/* Troubleshoot Button */}
                    <AnimatePresence>
                      {(camEvent !== 'none' || isInterfaceSignalLost) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
                        >
                          <button
                            onClick={() => setIsTroubleshooting(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/40 border border-blue-400/50 transition-all active:scale-95"
                          >
                            <Wrench size={14} />
                            Troubleshoot Cam
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                <motion.div
                  key={voyagerView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ 
                      x: [0, 2, -2, 0],
                      y: [0, -1, 1, 0],
                    }}
                    transition={{ 
                      duration: 40,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.img 
                      key={voyagerView}
                      src={voyagerView === 'pale_blue_dot' 
                        ? "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/PIA23645-Earth-PaleBlueDot-6Bkm-Voyager1-orig19900214-upd20200212.jpg/250px-PIA23645-Earth-PaleBlueDot-6Bkm-Voyager1-orig19900214-upd20200212.jpg"
                        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQpCb7Mm0oqd0knKFaN9omo5trr5YXqNnKrg&s"
                      } 
                      alt={voyagerView === 'pale_blue_dot' ? "Voyager 1 Pale Blue Dot" : "Jupiter Storm from Voyager 1"} 
                      className="w-full h-full object-cover"
                      initial={{ scale: zoom - 0.2 }}
                      animate={{ 
                        x: `${camOffset.x}%`,
                        y: `${camOffset.y}%`,
                        scale: zoom
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 60,
                        damping: 50
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </motion.div>
                
                {/* Camera Controller */}
                <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <div />
                    <button 
                      onClick={() => moveCam(0, 5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <div />
                    
                    <button 
                      onClick={() => moveCam(5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={resetCam}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button 
                      onClick={() => moveCam(-5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <ChevronRight size={14} />
                    </button>
                    
                    <div />
                    <button 
                      onClick={() => moveCam(0, -5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <div />
                  </div>
                  <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <button 
                      onClick={zoomIn}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      onClick={zoomOut}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                  </div>
                  <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">Voyager Control</span>
                </div>

                {/* Static/Noise overlay (Heavier for Voyager) */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                
                {/* Random Glitch Effect (White/Gray for Voyager) */}
                <motion.div 
                  className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"
                  animate={{ 
                    opacity: [0, 0.15, 0, 0.08, 0],
                    x: [0, -3, 3, 0]
                  }}
                  transition={{ 
                    duration: 0.4,
                    repeat: Infinity,
                    repeatDelay: 12
                  }}
                />
              </>
            )}
          </div>
              
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01),rgba(255,255,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-60" />
              
              {/* Intermittent signal interference */}
              <motion.div 
                className="absolute inset-x-0 h-[1px] bg-white/20 pointer-events-none z-20"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono text-gray-300 uppercase tracking-tighter">Location: Interstellar Space</span>
                  <span className="text-[8px] font-mono text-gray-300 uppercase tracking-tighter">Target: Earth (Pale Blue Dot)</span>
                </div>
              </div>
              
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,1)]" />
            </div>
          </div>
        )}

        {/* Hubble Live Feed Simulation */}
        {object.id === 'artemis2' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-gray-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Lunar Surface Feed</span>
              </div>
              <div className="flex gap-1 bg-black/40 p-0.5 rounded-md border border-white/5">
                <button 
                  onClick={() => setArtemisView('orion_cam')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${artemisView === 'orion_cam' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  SURFACE CAM
                </button>
                <button 
                  onClick={() => setArtemisView('lunar_approach')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${artemisView === 'lunar_approach' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  HORIZON VIEW
                </button>
                <button 
                  onClick={() => setArtemisView('archive_feed')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${artemisView === 'archive_feed' ? 'bg-blue-500/20 text-blue-400' : 'text-white/40 hover:text-white/60'}`}
                >
                  ARCHIVE FEED
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-white font-bold tracking-[0.2em] drop-shadow-md">
                    {artemisView === 'archive_feed' ? 'ARCHIVE' : 'FEED'} // {artemisView === 'orion_cam' ? 'LUNAR-SURFACE-1' : artemisView === 'lunar_approach' ? 'LUNAR-HORIZON-CAM' : 'MISSION-LANDING-ARCHIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">REC: 00:00:00:00</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 items-end h-2">
                    <div className={`w-0.5 h-1 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-white/40' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-1.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-white/40' : 'bg-red-500/40'}`} />
                    <div className="w-0.5 h-1 bg-white/10" />
                    <div className="w-0.5 h-1 bg-white/10" />
                  </div>
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter">
                    {isInterfaceSignalLost ? 'SIG: CRITICAL' : camEvent === 'none' ? 'SIG: DEEP-SPACE-NETWORK' : `SIG: ${camEvent.toUpperCase()}`}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-white/60 tabular-nums drop-shadow-md">
                  {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="relative w-full aspect-video overflow-hidden">
                {isTroubleshooting ? (
                  <TroubleshootScreen 
                    onComplete={handleTroubleshootComplete} 
                    isSignalLost={isInterfaceSignalLost} 
                    isCriticalRecovery={false}
                    isLocal={true}
                    title="Camera Troubleshooting"
                  />
                ) : (
                  <>
                    <CamEventOverlay event={isInterfaceSignalLost ? 'interface_signal_lost' : camEvent} />
                    
                    {/* Troubleshoot Button */}
                    <AnimatePresence>
                      {(camEvent !== 'none' || isInterfaceSignalLost) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
                        >
                          <button
                            onClick={() => setIsTroubleshooting(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/40 border border-blue-400/50 transition-all active:scale-95"
                          >
                            <Wrench size={14} />
                            Troubleshoot Cam
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                <motion.div
                  key={artemisView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  {artemisView === 'archive_feed' ? (
                    <div className="w-full h-full bg-black overflow-hidden relative">
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/vMGuObY8_sw?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=vMGuObY8_sw"
                        title="Artemis II Archive Feed"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full scale-[1.05] pointer-events-none"
                      />
                      {/* Transparent overlay to ensure no interactions reach the iframe */}
                      <div className="absolute inset-0 z-10" />
                    </div>
                  ) : (
                    <motion.div
                      className="w-full h-full"
                      animate={{ 
                        x: [0, 1, -1, 0],
                        y: [0, -0.5, 0.5, 0],
                      }}
                      transition={{ 
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <motion.img 
                        key={artemisView}
                        src={artemisView === 'orion_cam' 
                          ? (object.imageUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq6_wP0wvTc_VaAdbCIoPu1UOuFB5c5SNMyw&s")
                          : "https://www.popsci.com/wp-content/uploads/2023/04/06/orion-moon-flyby-artemis-1.jpg?quality=85&w=2000"
                        } 
                        alt={artemisView === 'orion_cam' ? "Lunar Surface Feed" : "Lunar Horizon View"} 
                        className="w-full h-full object-cover"
                        initial={{ scale: zoom - 0.2 }}
                        animate={{ 
                          x: `${camOffset.x}%`,
                          y: `${camOffset.y}%`,
                          scale: zoom
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 60,
                          damping: 50
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  )}
                </motion.div>
                
                {/* Camera Controller */}
                {artemisView !== 'archive_feed' && (
                  <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                      <div />
                      <button 
                        onClick={() => moveCam(0, 5)}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <div />
                      
                      <button 
                        onClick={() => moveCam(5, 0)}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button 
                        onClick={resetCam}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button 
                        onClick={() => moveCam(-5, 0)}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      >
                        <ChevronRight size={14} />
                      </button>
                      
                      <div />
                      <button 
                        onClick={() => moveCam(0, -5)}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <div />
                    </div>
                    <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                      <button 
                        onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      >
                        <ZoomIn size={14} />
                      </button>
                      <button 
                        onClick={() => setZoom(prev => Math.max(prev - 0.2, 1))}
                        className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      >
                        <ZoomOut size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Static/Noise overlay */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-10" />
                
                {/* Random Glitch Effect */}
                <motion.div 
                  className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none z-10"
                  animate={{ 
                    opacity: [0, 0.1, 0, 0.05, 0],
                    x: [0, -2, 2, 0]
                  }}
                  transition={{ 
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                />
              </>
            )}
          </div>
            </div>
          </div>
        )}

        {object.id === 'apollo11' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-gray-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Lunar Module Feed</span>
              </div>
              <div className="flex gap-1 bg-black/40 p-0.5 rounded-md border border-white/5">
                <button 
                  onClick={() => setApolloView('earth_rise')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${apolloView === 'earth_rise' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  EARTHRISE
                </button>
                <button 
                  onClick={() => setApolloView('lunar_surface')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${apolloView === 'lunar_surface' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`}
                >
                  LUNAR SURFACE
                </button>
                <button 
                  onClick={() => setApolloView('launch_video')}
                  className={`px-2 py-0.5 text-[8px] font-mono rounded transition-all ${apolloView === 'launch_video' ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white/60'}`}
                >
                  LAUNCH VIDEO
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  <span className="text-[9px] font-mono text-white font-bold tracking-[0.2em] drop-shadow-md">
                    LIVE // {apolloView === 'earth_rise' ? 'DAC-16MM CAMERA' : apolloView === 'lunar_surface' ? 'HASSELBLAD 500EL' : 'ARCHIVE-A11-LAUNCH'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">REC: 00:00:00:00</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 items-end h-2">
                    <div className={`w-0.5 h-1 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-white/40' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-1.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-white/40' : 'bg-red-500/40'}`} />
                    <div className="w-0.5 h-1 bg-white/10" />
                    <div className="w-0.5 h-1 bg-white/10" />
                  </div>
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter">
                    {isInterfaceSignalLost ? 'SIG: CRITICAL' : camEvent === 'none' ? 'SIG: LUNAR-LINK' : `SIG: ${camEvent.toUpperCase()}`}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-white/60 tabular-nums drop-shadow-md">
                  {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="relative w-full aspect-video overflow-hidden">
                {apolloView === 'launch_video' ? (
                  <div className="w-full h-full bg-black overflow-hidden relative">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/FubpK1Tho6M?autoplay=0&mute=0&controls=1&showinfo=1&rel=0&modestbranding=0"
                      title="Apollo 11 Launch Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : isTroubleshooting ? (
                  <TroubleshootScreen 
                    onComplete={handleTroubleshootComplete} 
                    isSignalLost={isInterfaceSignalLost} 
                    isCriticalRecovery={false}
                    isLocal={true}
                    title="Camera Troubleshooting"
                  />
                ) : (
                  <>
                    <CamEventOverlay event={isInterfaceSignalLost ? 'interface_signal_lost' : camEvent} />
                    
                    {/* Troubleshoot Button */}
                    <AnimatePresence>
                      {(camEvent !== 'none' || isInterfaceSignalLost) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
                        >
                          <button
                            onClick={() => setIsTroubleshooting(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/40 border border-blue-400/50 transition-all active:scale-95"
                          >
                            <Wrench size={14} />
                            Troubleshoot Cam
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                <motion.div
                  key={apolloView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ 
                      x: [0, 1, -1, 0],
                      y: [0, -0.5, 0.5, 0],
                    }}
                    transition={{ 
                      duration: 30,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.img 
                      key={apolloView}
                      src={apolloView === 'earth_rise' 
                        ? "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/solar/2023/09/a/as11-44-6549_med.jpg?w=1800&h=1800&fit=clip&crop=faces%2Cfocalpoint"
                        : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWzGizQAbN8ibz-SmUhdsXh87Z7_iqrhGZLA&s"
                      } 
                      alt={apolloView === 'earth_rise' ? "Earthrise from Apollo 11" : "Lunar Surface from Apollo 11"} 
                      className="w-full h-full object-cover"
                      initial={{ scale: zoom - 0.2 }}
                      animate={{ 
                        x: `${camOffset.x}%`,
                        y: `${camOffset.y}%`,
                        scale: zoom
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 60,
                        damping: 50
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </motion.div>
                
                {/* Camera Controller */}
                <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <div />
                    <button 
                      onClick={() => moveCam(0, 5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <div />
                    
                    <button 
                      onClick={() => moveCam(5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={resetCam}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button 
                      onClick={() => moveCam(-5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <ChevronRight size={14} />
                    </button>
                    
                    <div />
                    <button 
                      onClick={() => moveCam(0, -5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <div />
                  </div>
                  <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <button 
                      onClick={zoomIn}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      onClick={zoomOut}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-gray-300"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                  </div>
                  <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">Apollo Control</span>
                </div>

                {/* Static/Noise overlay */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-10" />
                
                {/* Random Glitch Effect */}
                <motion.div 
                  className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none z-10"
                  animate={{ 
                    opacity: [0, 0.1, 0, 0.05, 0],
                    x: [0, -2, 2, 0]
                  }}
                  transition={{ 
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                />
              </>
            )}
          </div>
              
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01),rgba(255,255,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-40 z-20" />
              
              {/* Intermittent signal interference */}
              <motion.div 
                className="absolute inset-x-0 h-[1px] bg-white/10 pointer-events-none z-20"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-mono text-gray-300 uppercase tracking-tighter">Location: Moon Surface</span>
                  <span className="text-[8px] font-mono text-gray-300 uppercase tracking-tighter">Mission: Apollo 11</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {object.id === 'hubble' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-blue-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Hubble Live Camera</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => setHubbleView('galaxy')}
                  className={`px-2 py-1 rounded text-[8px] font-mono border transition-all ${hubbleView === 'galaxy' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  DEEP FIELD
                </button>
                <button 
                  onClick={() => setHubbleView('whirlpool')}
                  className={`px-2 py-1 rounded text-[8px] font-mono border transition-all ${hubbleView === 'whirlpool' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  WHIRLPOOL GALAXY
                </button>
                <button 
                  onClick={() => setHubbleView('orion')}
                  className={`px-2 py-1 rounded text-[8px] font-mono border transition-all ${hubbleView === 'orion' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  ORION NEBULA
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  <span className="text-[9px] font-mono text-white font-bold tracking-[0.2em] drop-shadow-md">
                    LIVE // HST-WFC3
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-white/40 rounded-full" />
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">REC: 00:00:00:00</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5 items-end h-2">
                    <div className={`w-0.5 h-1.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-blue-400/60' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-1 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-blue-400/60' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-2 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-blue-400/60' : 'bg-red-500/40'}`} />
                    <div className={`w-0.5 h-1.5 ${camEvent === 'none' && !isInterfaceSignalLost ? 'bg-blue-400/60' : 'bg-red-500/40'}`} />
                  </div>
                  <span className="text-[7px] font-mono text-white/40 uppercase tracking-tighter">
                    {isInterfaceSignalLost ? 'SIG: CRITICAL' : camEvent === 'none' ? 'SIG: STABLE' : `SIG: ${camEvent.toUpperCase()}`}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-white/60 tabular-nums drop-shadow-md">
                  {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="relative w-full aspect-video overflow-hidden">
                {isTroubleshooting ? (
                  <TroubleshootScreen 
                    onComplete={handleTroubleshootComplete} 
                    isSignalLost={isInterfaceSignalLost} 
                    isCriticalRecovery={false}
                    isLocal={true}
                    title="Camera Troubleshooting"
                  />
                ) : (
                  <>
                    <CamEventOverlay event={isInterfaceSignalLost ? 'interface_signal_lost' : camEvent} />
                    
                    {/* Troubleshoot Button */}
                    <AnimatePresence>
                      {(camEvent !== 'none' || isInterfaceSignalLost) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
                        >
                          <button
                            onClick={() => setIsTroubleshooting(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-mono text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-600/40 border border-blue-400/50 transition-all active:scale-95"
                          >
                            <Wrench size={14} />
                            Troubleshoot Cam
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                <motion.div
                  key={hubbleView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  <motion.div
                    className="w-full h-full"
                    animate={{ 
                      x: [0, 2, -2, 0],
                      y: [0, -1, 1, 0],
                    }}
                    transition={{ 
                      duration: 25,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.img 
                      key={hubbleView}
                      src={
                        hubbleView === 'telescope' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCmttPzRNKnu8ovpPhR6EE0capgk9Gp5kDhtPgkS5kQzRIRpee2YG3wCloJRmd-FH9D12_h3aLbwb0kT0WkZ_QYPlUTv6eoI0aDXpnxXWc4w&s=10" :
                        hubbleView === 'galaxy' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe1nT9Jphvr39gQnS85ngRdPxf-hog1esstmbvqKHYPyEIYZpblu39gN2NporiAXNugHEpr8jXG0cjUGZTa5zIh-Uq7Nx4Rp--FtF--K3Z&s=10" :
                        hubbleView === 'whirlpool' ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrUeIefcAwLhQbW5YJhri8QN3qXdpZmQt6Gg&s" :
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa3og8jPOd59_0W7QM0I-22nbsj_K8vocpVg&s"
                      } 
                      alt="Hubble View" 
                      className="w-full h-full object-cover"
                      initial={{ scale: zoom - 0.2 }}
                      animate={{ 
                        x: `${camOffset.x}%`,
                        y: `${camOffset.y}%`,
                        scale: zoom
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 90,
                        damping: 35
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </motion.div>
                
                {/* HUD Overlays */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-20">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 border-t border-l border-white/40" />
                    <div className="w-8 h-8 border-t border-r border-white/40" />
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-[1px] bg-white/20" />
                      <div className="w-1 h-1 bg-white/60 rounded-full" />
                      <div className="w-16 h-[1px] bg-white/20" />
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 border-b border-l border-white/40" />
                    <div className="w-8 h-8 border-b border-r border-white/40" />
                  </div>
                </div>

                {/* Camera Controls Overlay */}
                <div className="absolute bottom-4 right-4 z-30 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <div />
                    <button 
                      onClick={() => moveCam(0, 5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <div />
                    
                    <button 
                      onClick={() => moveCam(5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={resetCam}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <RotateCcw size={12} />
                    </button>
                    <button 
                      onClick={() => moveCam(-5, 0)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <ChevronRight size={14} />
                    </button>
                    
                    <div />
                    <button 
                      onClick={() => moveCam(0, -5)}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <div />
                  </div>
                  <div className="flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <button 
                      onClick={zoomIn}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      onClick={zoomOut}
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-blue-400"
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                  </div>
                  <span className="text-[7px] font-mono text-white/30 uppercase tracking-widest">HST Control</span>
                </div>

                {/* Static/Noise overlay */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat z-10" />
                
                {/* Random Glitch Effect */}
                <motion.div 
                  className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none z-10"
                  animate={{ 
                    opacity: [0, 0.1, 0, 0.05, 0],
                    x: [0, -2, 2, 0]
                  }}
                  transition={{ 
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 6
                  }}
                />
              </>
            )}
          </div>
              
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(0,255,255,0.02),rgba(255,255,255,0.01),rgba(0,255,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-40 z-20" />
              
              {/* Intermittent signal interference */}
              <motion.div 
                className="absolute inset-x-0 h-[1px] bg-white/10 pointer-events-none z-20"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />

              <div className="absolute bottom-4 left-4 z-30 flex flex-col gap-0.5">
                <span className="text-[7px] font-mono text-white/60 uppercase tracking-tighter">Target: {hubbleView === 'telescope' ? 'HST Self-Check' : 'Deep Field Galaxy Cluster'}</span>
                <span className="text-[7px] font-mono text-white/60 uppercase tracking-tighter">Exposure: 1200s</span>
                <span className="text-[7px] font-mono text-white/60 uppercase tracking-tighter">Filter: F814W</span>
              </div>
              
              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] z-40" />
            </div>
          </div>
        )}
      </motion.div>
    )}
  </motion.div>
</AnimatePresence>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; subValue?: string; color?: string }> = ({ icon, label, value, subValue, color }) => (
  <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
    <div className="p-2 bg-white/5 rounded-lg text-blue-400">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-0.5">{label}</p>
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-base font-bold ${color || 'text-white'}`}>{value}</p>
        {subValue && <p className="text-[9px] font-mono text-white/30 italic">{subValue}</p>}
      </div>
    </div>
  </div>
);
