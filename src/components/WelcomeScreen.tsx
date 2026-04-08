import { useState, FC } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, BookOpen, Info, X, Compass, MousePointer2, Search, Zap, LogOut, History, Shield, CheckCircle2, AlertCircle, Fingerprint, Loader2, Bot, Star, Send } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  onOpenAi: () => void;
  isVerified: boolean;
  setIsVerified: (verified: boolean) => void;
}

export const WelcomeScreen: FC<WelcomeScreenProps> = ({ onStart, onOpenAi, isVerified, setIsVerified }) => {
  const [activeModal, setActiveModal] = useState<'instructions' | 'credits' | 'update-log' | 'terms' | 'feedback' | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [feedbackList, setFeedbackList] = useState<{name: string, rating: number, text: string, date: string}[]>(() => {
    const saved = localStorage.getItem('solaris_feedback_list');
    return saved ? JSON.parse(saved) : [];
  });

  const [feedbackForm, setFeedbackForm] = useState({ name: '', rating: 0, text: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleSendFeedback = () => {
    if (!feedbackForm.name || !feedbackForm.text) return;
    setIsSubmittingFeedback(true);
    
    setTimeout(() => {
      const newFeedback = {
        ...feedbackForm,
        date: new Date().toLocaleDateString()
      };
      const updatedList = [newFeedback, ...feedbackList];
      setFeedbackList(updatedList);
      localStorage.setItem('solaris_feedback_list', JSON.stringify(updatedList));
      setFeedbackForm({ name: '', rating: 0, text: '' });
      setIsSubmittingFeedback(false);
    }, 1000);
  };

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => {
    return localStorage.getItem('solaris_terms_accepted') === 'true';
  });
  const [hasOpenedTerms, setHasOpenedTerms] = useState(() => {
    return localStorage.getItem('solaris_terms_opened') === 'true';
  });

  const handleOpenTerms = () => {
    setHasOpenedTerms(true);
    localStorage.setItem('solaris_terms_opened', 'true');
    setActiveModal('terms');
  };

  const handleAcceptTerms = (accepted: boolean) => {
    setHasAcceptedTerms(accepted);
    localStorage.setItem('solaris_terms_accepted', accepted ? 'true' : 'false');
  };

  const instructions = [
    { icon: MousePointer2, title: "Explore", desc: "Drag to rotate the system, scroll to zoom in/out." },
    { icon: Search, title: "Search", desc: "Use the search bar to find specific planets or satellites." },
    { icon: Zap, title: "Live Feeds", desc: "Access real-time telemetry and camera feeds from active missions." },
    { icon: Info, title: "Artemis II", desc: "Select Artemis II to view the lunar surface feed and mission landing logs." },
  ];

  const updateLogs = [
    { version: "v1.6.3", date: "2026.04.08", changes: ["Integrated 'System Feedback' Archive: Users can now submit persistent ratings and reviews.", "Implemented Local Archive Protocol: Feedback is stored in the system's long-term memory (localStorage).", "Enhanced Star Rating System: Support for 0-5 star evaluation of the Solaris interface.", "Updated system versioning to v1.6.3."] },
    { version: "v1.6.2", date: "2026.04.08", changes: ["Integrated 'Space Bot' AI Assistant: A specialized cosmic guide powered by Gemini.", "Enhanced AI Chat: Implemented markdown rendering for clear, formatted responses (bold, lists, etc.).", "Improved UI Contrast: Optimized chat input text visibility with high-contrast white formatting.", "AI Guide Protocol: Programmed Space Bot with full interface knowledge to assist new users.", "Floating Off-set GUI: Implemented a compact, floating AI widget for desktop that doesn't disrupt the main layout.", "Unified AI Access: Integrated Space Bot into Welcome Screen and Main Header for seamless access."] },
    { version: "v1.6.1", date: "2026.04.07", changes: ["Mission Accomplished: Artemis II has successfully completed its lunar mission and is returning to Earth.", "Updated Artemis II status to 'Trans-Earth Trajectory' with final mission telemetry.", "Disabled interactive 3D view for Artemis II to reflect the mission's re-entry phase.", "Transitioned Orion live broadcast to high-fidelity Lunar Surface feeds and Archive Footage.", "Removed 'LIVE' indicators from Artemis II feeds to reflect mission completion.", "Updated mission logs and achievements to celebrate the historic landing."] },
    { version: "v1.6.0", date: "2026.04.06", changes: ["Integrated Live YouTube Broadcast for Artemis II and ISS mission feeds.", "Added Voyager 1 & Apollo 11 Archives: Historical launch footage with direct player interaction.", "Implemented 'Stealth View' (Zoom & Clip) for live mission feeds to hide branding.", "Disabled mouse interactions on live mission broadcasts to prevent UI interference.", "Isolated live feeds from simulated signal loss and camera error events.", "Enhanced Mission View Usage: Added support for multiple view stages (Orion Cam, Lunar Approach, Live Broadcast).", "Updated Artemis II (Orion) status: Spacecraft has entered the Lunar Sphere of Influence.", "Adjusted orbital trajectory to reflect proximity to the Moon (382,700 km from Earth)."] },
    { version: "v1.5.9", date: "2026.04.05", changes: ["Updated Artemis II (Orion) status: Spacecraft is in the final stages of its approach for a historic lunar flyby.", "Adjusted orbital trajectory parameters for deep space transit, moving the craft closer to the Moon.", "Updated system telemetry to reflect current mission distance (382,500 km)."] },
    { version: "v1.5.8", date: "2026.04.04", changes: ["Implemented cinematic zoom-in effect when switching camera views for all satellites.", "Enhanced visual consistency across different mission feeds.", "Optimized transition animations for camera telemetry."] },
    { version: "v1.5.7", date: "2026.04.04", changes: ["Updated Artemis II location to High Earth Orbit (HEO) on a Trans-Lunar trajectory.", "Hidden orbit lines for objects in transit (Artemis II).", "Adjusted orbital parameters for deep space missions."] },
    { version: "v1.5.6", date: "2026.04.04", changes: ["Updated Artemis II location to Low Earth Orbit (LEO)", "Restored random camera interference events for satellites", "Optimized satellite camera troubleshooting speed (faster recovery)", "Applied high-fidelity JWST-style visual effects to all satellite feeds"] },
    { version: "v1.5.5", date: "2026.04.04", changes: ["Removed random signal loss and camera interference events.", "System diagnostics now only trigger on real network offline status.", "Updated system versioning to 1.5.5"] },
    { version: "v1.5.4", date: "2026.04.04", changes: ["Integrated Artemis II (Orion) 3D spacecraft model with interactive controls.", "Added Artemis II mission conversation logs and high-resolution mission imagery.", "Updated system versioning to 1.5.4"] },
    { version: "v1.5.3", date: "2026.04.04", changes: ["Optimized identity verification to persist within the application state but reset on full page reload.", "Implemented session-based identity persistence using sessionStorage (deprecated).", "Updated system versioning to 1.5.3"] },
    { version: "v1.5.2", date: "2026.04.04", changes: ["Replaced external reCAPTCHA with an integrated Simulated Identity Verification system.", "Enhanced terminal-style security UI with biometric simulation.", "Updated system versioning to 1.5.2"] },
    { version: "v1.5.1", date: "2026.04.04", changes: ["Integrated Google reCAPTCHA security system for interface initialization.", "Enhanced Welcome Screen with security verification module.", "Updated system versioning to 1.5.1"] },
    { version: "v1.5.0", date: "2026.03.31", changes: ["Fixed bug where 'Diagnose System' button caused unintended page reloads.", "Removed unused legacy reload logic from Welcome Screen.", "Optimized state transitions between signal loss and troubleshooting.", "Fixed troubleshooting progress reset bug in InfoPanel and App.", "Resolved stability timer dependency issue in TroubleshootScreen.", "Implemented local state reset when switching celestial objects."] },
    { version: "v1.4.9", date: "2026.03.29", changes: ["Implemented 'Critical Recovery' protocol with 20s stability verification.", "Added AI-simulated network stress testing and lag threshold calibration.", "Globalized signal loss triggers to include Welcome Screen context.", "Enhanced automated restart logic for interrupted troubleshooting sequences."] },
    { version: "v1.4.8", date: "2026.03.29", changes: ["Implemented automatic offline detection and system-wide signal collapse.", "Added real-time network status monitoring and automated debug recovery.", "Updated system versioning to 1.4.8"] },
    { version: "v1.4.7", date: "2026.03.29", changes: ["Integrated Artemis II mission live feed with Orion Spacecraft telemetry.", "Implemented 'Interface Signal Lost' error handling for network instability.", "Added full-system interface collapse protocol triggered by interaction desync.", "Enhanced troubleshooting system with automated debug and repair sequences.", "Updated 3D engine to support global animation freezing during signal loss."] },
    { version: "v1.4.6", date: "2026.03.28", changes: ["Added real-time Lunar Event tracking for the Moon", "Integrated dynamic Solar/Lunar eclipse data", "Updated system versioning to 1.4.6"] },
    { version: "v1.4.5", date: "2026.03.27", changes: ["Enhanced live feed realism with extended event durations", "Implemented deep space signal troubleshooting system", "Updated collaborator list (NASA, VNSC)", "Refined UI versioning and credits"] },
    { version: "v1.4", date: "2026.03.27", changes: ["Added environmental effects (Nebulae, Solar Corona)", "Updated interface versioning", "Added session exit protocols", "Enhanced loading sequence"] },
    { version: "v1.3", date: "2026.03.20", changes: ["Improved 3D rendering performance", "Added satellite telemetry data", "Fixed orbital calculation bugs"] },
    { version: "v1.2", date: "2026.03.15", changes: ["Integrated real-time mission logs", "Added search functionality", "New UI animations"] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-[#050505] flex flex-col items-center justify-start sm:justify-center p-6 overflow-y-auto custom-scrollbar"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none fixed">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center py-12">
        {/* Logo Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl sm:rounded-3xl text-blue-400 shadow-lg shadow-blue-500/10">
              <Compass size={32} className="sm:w-12 sm:h-12" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic text-white">
            Solaris Explorer
          </h1>
          <p className="text-[10px] sm:text-sm font-mono text-blue-400/60 uppercase tracking-[0.3em] mt-2">
            Advanced Celestial Interface
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setActiveModal('instructions')}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 py-3 px-4 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
            >
              <BookOpen size={14} />
              Manual
            </button>
            <button
              onClick={() => setActiveModal('credits')}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 py-3 px-4 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
            >
              <Info size={14} />
              Credits
            </button>
            <button
              onClick={() => setActiveModal('update-log')}
              className="flex items-center justify-center gap-2 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 text-blue-400/70 py-3 px-4 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
            >
              <History size={14} />
              Update Log
            </button>
            <button
              onClick={() => setActiveModal('feedback')}
              className="flex items-center justify-center gap-2 bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 text-yellow-400/70 py-3 px-4 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all"
            >
              <Star size={14} />
              Feedback
            </button>
            <button
              onClick={onOpenAi}
              className="flex items-center justify-center gap-2 bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 text-purple-400/70 py-3 px-4 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all col-span-2"
            >
              <Bot size={14} />
              Ask Space Bot
            </button>
          </div>

          {/* Terms Checkbox at the bottom */}
          <div className="flex flex-col gap-2 mt-2">
            <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
              hasAcceptedTerms ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'
            } ${!hasOpenedTerms ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}>
              <input
                type="checkbox"
                checked={hasAcceptedTerms}
                disabled={!hasOpenedTerms}
                onChange={(e) => handleAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-black/50 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
              />
              <div className="text-left">
                <p className="text-[10px] font-mono text-white/70 leading-tight">
                  I have read and accepted the <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); handleOpenTerms(); }}
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >Terms of Use</button>
                </p>
                {!hasOpenedTerms && (
                  <p className="text-[8px] font-mono text-blue-400/40 uppercase tracking-widest mt-1 italic">
                    * Please open Terms to unlock
                  </p>
                )}
              </div>
            </label>
          </div>

          {/* Simulated Security Verification */}
          <div className="mt-2 flex flex-col items-center gap-3 w-full">
            <button
              onClick={() => {
                if (!hasAcceptedTerms || isVerified || isVerifying) return;
                setIsVerifying(true);
                setTimeout(() => {
                  setIsVerifying(false);
                  setIsVerified(true);
                }, 2000);
              }}
              disabled={!hasAcceptedTerms || isVerified || isVerifying}
              className={`w-full relative flex items-center justify-between p-4 rounded-xl border transition-all overflow-hidden ${
                isVerified 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : isVerifying
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : hasAcceptedTerms
                      ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                      : 'bg-white/5 border-white/10 text-white/10 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {isVerified ? (
                  <CheckCircle2 size={18} className="text-green-400" />
                ) : isVerifying ? (
                  <Loader2 size={18} className="animate-spin text-blue-400" />
                ) : (
                  <Fingerprint size={18} className={hasAcceptedTerms ? 'text-blue-400' : 'text-white/20'} />
                )}
                <span className="text-[10px] font-mono uppercase tracking-widest">
                  {isVerified ? 'Identity Verified' : isVerifying ? 'Scanning Biometrics...' : 'Verify Identity'}
                </span>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-mono opacity-40 uppercase tracking-tighter">
                  {isVerified ? 'Auth: 0x772-OK' : isVerifying ? 'Processing...' : 'Protocol 7.4'}
                </span>
              </div>

              {/* Scanning Animation */}
              {isVerifying && (
                <motion.div
                  initial={{ top: '-100%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-blue-400/30 blur-sm pointer-events-none"
                />
              )}
            </button>

            {!isVerified && (
              <p className="text-[9px] font-mono text-blue-400/40 uppercase tracking-[0.3em] animate-pulse">
                {hasAcceptedTerms ? 'Verification Required' : 'Accept Terms to Verify'}
              </p>
            )}
          </div>

          <button
            onClick={onStart}
            disabled={!hasAcceptedTerms || !isVerified}
            className={`group relative flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-xl overflow-hidden mt-2 ${
              hasAcceptedTerms && isVerified
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20' 
                : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
            }`}
          >
            {hasAcceptedTerms && isVerified && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}
            <Play size={18} fill="currentColor" className={hasAcceptedTerms && isVerified ? 'text-white' : 'text-white/10'} />
            Initialize System
          </button>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/30 hover:text-white transition-colors z-[110] bg-black/50 rounded-full p-1 backdrop-blur-sm"
              >
                <X size={20} />
              </button>

              {activeModal === 'instructions' ? (
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mb-6 flex items-center gap-3 sticky top-0 bg-[#0a0a0a] py-2 z-10">
                    <BookOpen className="text-blue-400" />
                    Interface Manual
                  </h2>
                  <div className="grid gap-6">
                    {instructions.map((item, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <item.icon size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-mono uppercase tracking-widest text-white mb-1">{item.title}</h3>
                          <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="h-px bg-white/5 my-2" />
                    
                    <div className="space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                          <Shield size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-mono uppercase tracking-widest text-white mb-1">Verification Guide</h3>
                          <p className="text-sm text-white/50 leading-relaxed">
                            To access the system, you must first accept the <span className="text-blue-400">Terms of Use</span>. Once accepted, use the <span className="text-blue-400">Verify Identity</span> module to complete a biometric scan. This is a simulated protocol required for deep space data access.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                          <Zap size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-mono uppercase tracking-widest text-white mb-1">Mission View Usage</h3>
                          <p className="text-sm text-white/50 leading-relaxed">
                            Active missions like <span className="text-blue-400">Artemis II</span> and the <span className="text-blue-400">ISS</span> feature multiple view stages. Navigate to the <span className="text-blue-400">Live Feed</span> tab to switch between internal/external cameras and the Mission Control broadcast. Historical missions like <span className="text-blue-400">Voyager 1</span> and <span className="text-blue-400">Apollo 11</span> now include archive launch footage with direct player access.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeModal === 'update-log' ? (
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mb-6 flex items-center gap-3 sticky top-0 bg-[#0a0a0a] py-2 z-10">
                    <History className="text-blue-400" />
                    Update Log
                  </h2>
                  <div className="space-y-6">
                    {updateLogs.map((log, i) => (
                      <div key={i} className="border-l-2 border-blue-500/20 pl-4 py-1">
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="text-lg font-bold text-white">{log.version}</h3>
                          <span className="text-[10px] font-mono text-white/30">{log.date}</span>
                        </div>
                        <ul className="space-y-1">
                          {log.changes.map((change, j) => (
                            <li key={j} className="text-sm text-white/50 flex items-start gap-2">
                              <span className="text-blue-400 mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeModal === 'feedback' ? (
                <div className="overflow-y-auto pr-2 custom-scrollbar flex flex-col h-full">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mb-6 flex items-center gap-3 sticky top-0 bg-[#0a0a0a] py-2 z-10">
                    <Star className="text-yellow-400" />
                    System Feedback
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Feedback Form */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Your Name</label>
                        <input 
                          type="text" 
                          value={feedbackForm.name}
                          onChange={(e) => setFeedbackForm({...feedbackForm, name: e.target.value})}
                          placeholder="Explorer Name..."
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setFeedbackForm({...feedbackForm, rating: feedbackForm.rating === star ? 0 : star})}
                              className={`p-1 transition-all ${feedbackForm.rating >= star ? 'text-yellow-400' : 'text-white/10 hover:text-white/30'}`}
                            >
                              <Star size={20} fill={feedbackForm.rating >= star ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                          {feedbackForm.rating === 0 && (
                            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest self-center ml-2">0 Stars</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Message</label>
                        <textarea 
                          value={feedbackForm.text}
                          onChange={(e) => setFeedbackForm({...feedbackForm, text: e.target.value})}
                          placeholder="Share your experience with the Solaris interface..."
                          rows={3}
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white resize-none"
                        />
                      </div>

                      <button
                        onClick={handleSendFeedback}
                        disabled={!feedbackForm.name || !feedbackForm.text || isSubmittingFeedback}
                        className={`w-full py-4 rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                          feedbackForm.name && feedbackForm.text && !isSubmittingFeedback
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                        }`}
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Transmitting...
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            Submit Feedback
                          </>
                        )}
                      </button>
                    </div>

                    {/* Feedback List */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Transmission Archive</h3>
                      {feedbackList.length === 0 ? (
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest text-center py-8 italic">
                          No feedback recorded in the archives yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {feedbackList.map((fb, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-white">{fb.name}</p>
                                  <div className="flex gap-0.5">
                                    {fb.rating === 0 ? (
                                      <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">0 Stars</span>
                                    ) : (
                                      [1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={10} className={fb.rating >= star ? 'text-yellow-400' : 'text-white/10'} fill={fb.rating >= star ? 'currentColor' : 'none'} />
                                      ))
                                    )}
                                  </div>
                                </div>
                                <span className="text-[8px] font-mono text-white/20">{fb.date}</span>
                              </div>
                              <p className="text-[11px] font-mono text-white/50 leading-relaxed italic">"{fb.text}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeModal === 'terms' ? (
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mb-6 flex items-center gap-3 sticky top-0 bg-[#0a0a0a] py-2 z-10">
                    <Shield className="text-blue-400" />
                    Terms of Use
                  </h2>
                  <div className="space-y-6">
                    {[
                      { title: "1. Acceptance of Protocols", content: "By initializing the Solaris Explorer interface, you agree to adhere to all celestial data transmission protocols and system integrity requirements." },
                      { title: "2. Data Usage & Telemetry", content: "All celestial data, including planet positions and moon phases, is provided for exploratory and educational purposes. Real-time telemetry is subject to signal interruptions." },
                      { title: "3. System Integrity Shield", content: "Users are strictly prohibited from attempting to bypass the 'Interface Signal Lost' collapse protocol or the 'Stability Shield'. These are critical safety measures." },
                      { title: "4. Signal Loss Liability", content: "Solaris Systems is not responsible for any data desynchronization, visual buffer freezes, or 'space-time' disorientation caused by local network instability." },
                      { title: "5. Privacy & Transmission", content: "No personal identifiers are stored. Only session-based telemetry and performance metrics are transmitted for system optimization." }
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">{item.title}</h3>
                        <p className="text-[11px] font-mono text-white/50 leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-y-auto pr-2 custom-scrollbar">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mb-6 flex items-center justify-center gap-3 sticky top-0 bg-[#0a0a0a] py-2 z-10">
                      <Info className="text-blue-400" />
                      Project Credits
                    </h2>
                    <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-2">Ownership</p>
                      <p className="text-white text-lg font-medium">CEO Vũ Khánh An</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-2">Developed By</p>
                      <p className="text-white text-lg font-medium">Solaris Interface Team</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-2">Inspired By</p>
                      <p className="text-white/70 text-sm italic">Star Wars, Interstellar, 2001: A Space Odyssey</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-2">Collaborated With</p>
                      <p className="text-white/70 text-sm italic">NASA, VNSC, International Space Federation & SpaceX</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-2">Data Sources</p>
                      <p className="text-white/70 text-sm italic">NASA Open Data Portal, JPL Horizons, ESA Archives</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-2">System Integrity</p>
                      <p className="text-white/70 text-sm italic">Automated Signal Collapse & Stability Shield Active</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div>
                      <p className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] mb-2">Security Module</p>
                      <p className="text-white/70 text-sm italic">Simulated Identity Verification & App-State Persistence</p>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                        Version 1.6.3 // Build 2026.04.08
                      </p>
                      <p className="text-[9px] font-mono text-white/10 uppercase tracking-widest">
                        © 2026 Solaris Systems. All Rights Reserved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none">
        <p className="text-[9px] font-mono text-white/10 uppercase tracking-[0.5em]">
          Deep Space Interface // Protocol 7.4
        </p>
      </div>
    </motion.div>
  );
};
