import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Search, 
  Shield, 
  Cpu, 
  Database, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Network,
  Gauge,
  Brain,
  WifiOff,
  Globe,
  TowerControl as Tower
} from 'lucide-react';

interface TroubleshootScreenProps {
  onComplete: () => void;
  isSignalLost?: boolean;
  isCriticalRecovery?: boolean;
  isThreatActive?: boolean;
  isLocal?: boolean;
  title?: string;
}

export const TroubleshootScreen: React.FC<TroubleshootScreenProps> = ({ 
  onComplete, 
  isSignalLost,
  isCriticalRecovery,
  isThreatActive: initialThreatActive,
  isLocal = false,
  title
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOfflineInterrupted, setIsOfflineInterrupted] = useState(false);
  const [isThreatInterrupted, setIsThreatInterrupted] = useState(initialThreatActive);
  const [stabilityTimer, setStabilityTimer] = useState(0);
  const [stressTestScale, setStressTestScale] = useState(0);
  
  const STABILITY_REQUIRED = 20; // 20 seconds of stable internet
  const TOTAL_DURATION = isCriticalRecovery ? 45000 : (isLocal ? 3500 : (isSignalLost ? 12000 : 8000));

  // Periodic threat check
  useEffect(() => {
    const checkThreat = () => {
      const threat = localStorage.getItem('SOLARIS_THREAT_DETECTED') === 'true';
      setIsThreatInterrupted(threat);
    };
    const interval = setInterval(checkThreat, 2000);
    return () => clearInterval(interval);
  }, []);

  const simulateCloseThreat = () => {
    localStorage.removeItem('SOLARIS_THREAT_DETECTED');
    setIsThreatInterrupted(false);
  };

  const steps = isCriticalRecovery ? [
    { icon: Search, label: "Initializing Deep Diagnostic", desc: "Scanning core system integrity..." },
    { icon: Network, label: "Network Stability Check", desc: "Waiting for 20s of consistent uptime..." },
    { icon: Brain, label: "AI Lag Calibration", desc: "Analyzing device performance thresholds..." },
    { icon: Gauge, label: "Interface Stress Test", desc: "Simulating high-load data streams..." },
    { icon: Shield, label: "Protocol Re-synchronization", desc: "Aligning telemetry buffers..." },
    { icon: CheckCircle2, label: "System Restoration", desc: "Finalizing interface handshake..." }
  ] : (isLocal ? [
    { icon: Search, label: "Scanning Lens Array", desc: "Checking for physical obstructions..." },
    { icon: Shield, label: "Sensor Calibration", desc: "Re-aligning CCD/CMOS sensors..." },
    { icon: Cpu, label: "Video Processor Reset", desc: "Clearing local frame buffers..." },
    { icon: Database, label: "Syncing Local Cache", desc: "Restoring telemetry metadata..." },
    { icon: CheckCircle2, label: "Feed Restored", desc: "Camera operational." }
  ] : (isSignalLost ? [
    { icon: Search, label: "Scanning Signal Path", desc: "Identifying interruption source..." },
    { icon: Shield, label: "Verifying Encryption", desc: "Re-establishing secure handshake..." },
    { icon: Cpu, label: "Re-syncing Telemetry", desc: "Aligning data streams..." },
    { icon: Database, label: "Buffering Visuals", desc: "Restoring camera feed buffers..." },
    { icon: CheckCircle2, label: "Signal Restored", desc: "Interface operational." }
  ] : [
    { icon: Search, label: "Diagnosing Connection", desc: "Checking satellite link status..." },
    { icon: Shield, label: "Verifying Security", desc: "Validating access protocols..." },
    { icon: Cpu, label: "Optimizing Stream", desc: "Adjusting bandwidth allocation..." },
    { icon: CheckCircle2, label: "Repair Complete", desc: "System performance optimized." }
  ]));

  // Handle offline interruption
  useEffect(() => {
    if (!isCriticalRecovery) return;

    const handleOffline = () => {
      setIsOfflineInterrupted(true);
      setStabilityTimer(0);
      setProgress(0);
      setCurrentStep(0);
    };

    const handleOnline = () => {
      setIsOfflineInterrupted(false);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    if (!navigator.onLine) {
      setIsOfflineInterrupted(true);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [isCriticalRecovery]);

  // Stability Timer Logic
  useEffect(() => {
    if (!isCriticalRecovery || isOfflineInterrupted || isSuccess) return;

    const interval = setInterval(() => {
      setStabilityTimer(prev => {
        if (prev >= STABILITY_REQUIRED) return prev;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCriticalRecovery, isOfflineInterrupted, isSuccess]);

  // Main Progress Logic
  const isStabilityMet = stabilityTimer >= STABILITY_REQUIRED;

  useEffect(() => {
    if (!isLocal && (isOfflineInterrupted || isThreatInterrupted)) return;

    // For critical recovery, we only start progressing after stability check
    if (isCriticalRecovery && !isStabilityMet) {
      setCurrentStep(1);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / TOTAL_DURATION) * 100, 100);
      
      setProgress(newProgress);
      
      // Calculate step
      const stepIndex = Math.min(
        Math.floor((newProgress / 100) * steps.length),
        steps.length - 1
      );
      setCurrentStep(stepIndex);

      // Stress test visual logic
      if (isCriticalRecovery && stepIndex >= 2 && stepIndex <= 3) {
        setStressTestScale(Math.sin(Date.now() / 200) * 50 + 50);
      } else {
        setStressTestScale(0);
      }

      if (newProgress >= 100) {
        clearInterval(interval);
        setIsSuccess(true);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [TOTAL_DURATION, steps.length, isOfflineInterrupted, isThreatInterrupted, isLocal, isCriticalRecovery, isStabilityMet]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onComplete]);

  const defaultTitle = isSuccess ? "Restoration Complete" : (isLocal ? "Camera Troubleshooting" : (isOfflineInterrupted ? "Connection Interrupted" : (isThreatInterrupted ? "Security Threat Detected" : "System Diagnostic")));
  const displayTitle = title || defaultTitle;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${isLocal ? 'relative w-full h-full' : 'fixed inset-0 z-[150]'} bg-[#050505] flex items-center justify-center p-6 overflow-hidden`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isLocal ? 'w-[400px] h-[400px]' : 'w-[800px] h-[800px]'} bg-blue-500/5 rounded-full blur-[120px] pointer-events-none`} />
      
      <div className={`relative w-full ${isLocal ? 'max-w-md scale-90' : 'max-w-2xl'}`}>
        {/* Header */}
        <div className={`text-center ${isLocal ? 'mb-6' : 'mb-12'}`}>
          <motion.div
            animate={isOfflineInterrupted || isThreatInterrupted ? { scale: [1, 1.1, 1], color: ['#ef4444', '#f87171', '#ef4444'] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`inline-flex items-center justify-center ${isLocal ? 'w-12 h-12 mb-4' : 'w-20 h-20 mb-6'} rounded-3xl ${
              isOfflineInterrupted || isThreatInterrupted ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            } border shadow-2xl`}
          >
            {isSuccess ? (
              <CheckCircle2 size={isLocal ? 24 : 40} className="text-green-400" />
            ) : isOfflineInterrupted || isThreatInterrupted ? (
              <WifiOff size={isLocal ? 24 : 40} />
            ) : (
              <Activity size={isLocal ? 24 : 40} className="animate-pulse" />
            )}
          </motion.div>
          
          <h2 className={`${isLocal ? 'text-xl' : 'text-3xl'} font-black uppercase italic tracking-tighter mb-2`}>
            {displayTitle}
          </h2>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">
            {isCriticalRecovery ? "Emergency Protocol 0x882-SIG" : "Standard Maintenance Protocol"}
          </p>
        </div>

        {/* Threat Warning Overlay */}
        <AnimatePresence>
          {isThreatInterrupted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`${isLocal ? 'p-4' : 'p-6'} mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center space-y-4`}
            >
              <div className="flex items-center justify-center gap-3 text-red-500">
                <Shield size={isLocal ? 18 : 24} className="animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-widest">Cybersecurity Warning</h3>
              </div>
              <p className="text-[10px] font-mono text-red-400/80 leading-relaxed uppercase tracking-widest">
                A dangerous external domain is currently active in your environment. Troubleshooting is suspended to prevent data harvesting.
              </p>
              {!isLocal && (
                <div className="bg-black/40 p-3 rounded-xl border border-red-500/10 text-left">
                  <p className="text-[9px] font-mono text-red-500/60 uppercase mb-1">Detected Threat:</p>
                  <p className="text-[10px] font-mono text-white/80 break-all">https://unauthorized-data-harvest.io/phishing/solaris-telemetry</p>
                  <p className="text-[9px] font-mono text-red-500/60 uppercase mt-2">Reason:</p>
                  <p className="text-[10px] font-mono text-white/80">Unauthorized attempts to intercept encrypted satellite handshake detected.</p>
                </div>
              )}
              <button
                onClick={simulateCloseThreat}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all active:scale-95"
              >
                Simulate Closing Dangerous Site
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stability Check Overlay */}
        {isCriticalRecovery && stabilityTimer < STABILITY_REQUIRED && !isOfflineInterrupted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${isLocal ? 'p-4' : 'p-6'} mb-8 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center`}
          >
            <p className="text-xs font-mono text-blue-400/60 uppercase tracking-widest mb-4">Uptime Stability Verification</p>
            <div className="flex justify-center gap-2">
              {Array.from({ length: STABILITY_REQUIRED }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-1 h-4 rounded-full transition-all duration-500 ${
                    i < stabilityTimer ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-white/5'
                  }`}
                />
              ))}
            </div>
            <p className="mt-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
              Stable Link: {stabilityTimer}s / {STABILITY_REQUIRED}s
            </p>
          </motion.div>
        )}

        {/* Stress Test Visualization */}
        {stressTestScale > 0 && (
          <div className={`${isLocal ? 'h-12' : 'h-24'} mb-8 flex items-end justify-center gap-1`}>
            {Array.from({ length: isLocal ? 20 : 40 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: Math.random() * (isLocal ? stressTestScale / 2 : stressTestScale) + 10,
                  backgroundColor: stressTestScale > 80 ? '#ef4444' : '#3b82f6'
                }}
                className="w-1 rounded-full opacity-40"
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className={`relative h-1.5 bg-white/5 rounded-full ${isLocal ? 'mb-6' : 'mb-12'} overflow-hidden`}>
          <motion.div
            className={`absolute top-0 left-0 h-full ${isOfflineInterrupted ? 'bg-red-500' : 'bg-blue-500'} shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
        </div>

        {/* Steps Grid */}
        <div className={`grid grid-cols-1 ${isLocal ? '' : 'md:grid-cols-2'} gap-4`}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            // In local mode, only show current and completed steps to save space if needed, 
            // but let's try showing all first.
            if (isLocal && !isActive && !isCompleted && index > currentStep + 1) return null;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0.3, y: 10 }}
                animate={{ 
                  opacity: isActive ? 1 : (isCompleted ? 0.6 : 0.2),
                  y: 0,
                  scale: isActive ? 1.02 : 1,
                  borderColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)'
                }}
                className={`${isLocal ? 'p-3' : 'p-4'} rounded-2xl border bg-white/[0.02] flex items-start gap-4 transition-all`}
              >
                <div className={`p-2 rounded-xl ${
                  isActive ? 'bg-blue-500/20 text-blue-400' : (isCompleted ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/20')
                }`}>
                  <Icon size={isLocal ? 14 : 18} className={isActive ? 'animate-spin' : ''} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`${isLocal ? 'text-[9px]' : 'text-[11px]'} font-bold uppercase tracking-wider mb-1`}>
                    {step.label}
                  </h3>
                  {!isLocal && (
                    <p className="text-[9px] font-mono text-white/30 leading-tight">
                      {step.desc}
                    </p>
                  )}
                </div>
                {isCompleted && (
                  <CheckCircle2 size={14} className="text-green-400 mt-1" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Status Footer */}
        <div className={`${isLocal ? 'mt-6' : 'mt-12'} flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.3em]`}>
          <div className="flex items-center gap-2 text-white/20">
            <Activity size={10} />
            <span>Load: {Math.round(progress * 0.8 + 10)}%</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400/60">
            <Zap size={10} />
            <span>{isSuccess ? "Ready" : (isOfflineInterrupted || isThreatInterrupted ? "Waiting" : "Processing")}</span>
          </div>
        </div>
      </div>

      {/* Interruption Overlay */}
      <AnimatePresence>
        {(isOfflineInterrupted || isThreatInterrupted) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/20 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-bounce">
              {isOfflineInterrupted ? "Link Failure" : "Threat Detected"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
