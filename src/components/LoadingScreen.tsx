import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, ShieldCheck, Cpu, Signal, Compass } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const steps = [
  { icon: Cpu, text: "Initializing Core Systems..." },
  { icon: Signal, text: "Establishing Satellite Link..." },
  { icon: ShieldCheck, text: "Verifying Telemetry Data..." },
  { icon: Compass, text: "Calibrating Orbital Vectors..." },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const duration = 2000; // 2 seconds loading
    const interval = 30;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsFinished(true);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepIndex = Math.min(
      Math.floor((progress / 100) * steps.length),
      steps.length - 1
    );
    setCurrentStep(stepIndex);
  }, [progress]);

  const handleEnter = () => {
    setIsEntering(true);
    // Wait for rocket animation to finish before calling onComplete
    setTimeout(onComplete, 1000);
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative w-full max-w-md flex flex-col items-center">
        {/* Rocket Launch Animation */}
        <div className="relative h-48 w-full flex items-center justify-center mb-12">
          {/* Launch Pad Base */}
          <div className="absolute bottom-0 w-32 h-1 bg-white/10 rounded-full" />
          
          {/* Flame/Smoke Particles */}
          <AnimatePresence>
            {(progress > 10 && !isFinished || isEntering) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1],
                  y: [0, 20, 40],
                }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="absolute bottom-4 w-12 h-24 bg-gradient-to-t from-orange-500/0 via-orange-500/40 to-yellow-400/60 blur-xl rounded-full"
              />
            )}
          </AnimatePresence>

          {/* Rocket Icon */}
          <motion.div
            animate={{
              y: isEntering ? -400 : (progress < 20 ? [0, -5, 0] : -progress * 1.2),
              rotate: progress < 20 ? [0, -2, 2, 0] : 0,
              opacity: isEntering ? 0 : 1,
            }}
            transition={{ 
              y: { duration: isEntering ? 1 : 0.5, ease: isEntering ? "easeIn" : "easeInOut" },
              rotate: { repeat: Infinity, duration: 0.2 },
              opacity: { duration: 0.5 }
            }}
            className="relative z-10 text-white"
          >
            <Rocket size={64} className="fill-white/10" />
          </motion.div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-2">
            Solaris Explorer
          </h1>
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em]"
              >
                <StepIcon size={12} className="animate-pulse" />
                <span>{steps[currentStep].text}</span>
              </motion.div>
            ) : (
              <motion.button
                key="enter-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnter}
                disabled={isEntering}
                className="group relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3 px-8 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-600/20"
              >
                {isEntering ? "Initiating..." : "Enter Interface"}
                <Compass size={14} className={`group-hover:rotate-90 transition-transform duration-500 ${isEntering ? 'animate-spin' : ''}`} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4 border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="flex justify-between w-full text-[10px] font-mono text-white/30 uppercase tracking-widest">
          <span>{isFinished ? "Ready for Link" : "System Boot"}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-[9px] font-mono text-white/10 uppercase tracking-[0.5em]">
          Deep Space Interface // Protocol 7.4
        </p>
      </div>
    </motion.div>
  );
};
