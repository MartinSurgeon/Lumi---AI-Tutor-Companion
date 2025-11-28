import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Play, Sparkles, User, Bot, Zap, ImageIcon, Settings, Monitor, Search, BrainCircuit, TrendingUp, Award, BookOpen, Keyboard, Send, Clock, AlertCircle, ScanEye, Copy, Check, Heart, Flag } from 'lucide-react';
import SetupModal from './components/SetupModal';
import Waveform from './components/Waveform';
import { StudentProfile, ConnectionStatus, ImageResolution } from './types';
import { useGeminiLive } from './hooks/useGeminiLive';
import lumilogo from './assets/Lumilogo.png';

const App: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [imageResolution, setImageResolution] = useState<ImageResolution>('1K');
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [teacherInput, setTeacherInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    status,
    connect,
    disconnect,
    isMuted,
    setIsMuted,
    isVideoActive,
    setIsVideoActive,
    inputAnalyzer,
    outputAnalyzer,
    messages,
    liveInput,
    liveOutput,
    learningStats,
    sendTextMessage,
    toggleMessageProperty
  } = useGeminiLive({ profile, videoRef, imageResolution });

  // Handle Camera Stream locally for the video element
  useEffect(() => {
    if (isVideoActive) {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera access not available. Ensure you're using HTTPS or localhost.");
        setIsVideoActive(false);
        return;
      }

      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera access denied", err);
          setIsVideoActive(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isVideoActive, setIsVideoActive]);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveInput, liveOutput]);

  // Auto-mute when Teacher Mode is activated
  useEffect(() => {
    if (isTeacherMode && status === ConnectionStatus.CONNECTED) {
      setIsMuted(true);
    }
  }, [isTeacherMode, status, setIsMuted]);

  const handleTeacherSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacherInput.trim()) {
      sendTextMessage(teacherInput);
      setTeacherInput('');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!profile) {
    return <SetupModal onComplete={setProfile} />;
  }

  const isConnected = status === ConnectionStatus.CONNECTED;

  return (
    <div className="h-[100dvh] bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-fuchsia-500 selection:text-white safe-area-inset">
      
      {/* Enhanced Cosmic Background (Animated) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-950 to-black animate-gradient"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-fuchsia-600/30 via-pink-500/20 to-purple-600/20 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-gradient-to-br from-cyan-600/30 via-blue-500/20 to-teal-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-gradient-to-br from-indigo-600/15 via-purple-500/10 to-fuchsia-500/10 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        
        {/* Enhanced Floating Particles with varied animations */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-fuchsia-400 rounded-full blur-[1px] animate-float opacity-60" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full blur-[2px] animate-float opacity-50" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[1px] animate-float opacity-40" style={{ animationDelay: '2s', animationDuration: '6s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-2.5 h-2.5 bg-pink-400 rounded-full blur-[1.5px] animate-float opacity-45" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full blur-[1px] animate-float opacity-50" style={{ animationDelay: '1.5s', animationDuration: '5.5s' }}></div>
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer opacity-5"></div>
      </div>

      {/* Header - Mobile Optimized with Enhanced Animations */}
      <header className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 sticky top-0 left-0 safe-area-top animate-slide-up">
        <div className="flex items-center gap-2 animate-slide-in-left">
          <div className="bg-gradient-to-br from-fuchsia-500 to-violet-600 p-1 sm:p-1.5 rounded-lg shadow-lg shadow-fuchsia-500/30 flex items-center justify-center overflow-hidden animate-bounce-in hover:scale-110 transition-transform duration-300">
            <img 
              src={lumilogo} 
              alt="Lumi Logo" 
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-pink-300 to-cyan-300 tracking-tight animate-gradient" style={{ backgroundSize: '200% 200%' }}>
            Lumi
          </h1>
        </div>
        
        {/* Profile / Stats Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
           <div className={`hidden sm:flex px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border uppercase tracking-wide bg-slate-900/80 backdrop-blur-md ${
                learningStats.difficultyLevel === 'Advanced' ? 'bg-red-900/30 border-red-500/50 text-red-300' :
                learningStats.difficultyLevel === 'Intermediate' ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300' :
                'bg-emerald-900/30 border-emerald-500/50 text-emerald-300'
            }`}>
                {learningStats.difficultyLevel} Mode
           </div>
           
           <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border-2 border-cyan-300/50">
             <span className="text-[10px] sm:text-xs font-bold text-white">{profile.name.charAt(0).toUpperCase()}</span>
           </div>
        </div>
      </header>

      {/* Main Layout - Mobile First: Stack on mobile, side-by-side on desktop */}
      <main className="flex-1 w-full h-full flex flex-col lg:flex-row z-10 pt-14 sm:pt-16 pb-20 sm:pb-24 lg:pb-0 overflow-hidden relative">
        
        {/* TOP/LEFT: Visualizer & Video Call Area - Mobile: Full width, Desktop: Side panel */}
        <div className="relative flex-[0.7] sm:flex-[0.8] lg:flex-[1.5] flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-900/30 min-h-[40vh] sm:min-h-[50vh] lg:min-h-0 lg:max-h-full w-full lg:w-auto">
          
          {/* VIDEO CALL BACKGROUND LAYER */}
          <div className="absolute inset-0 z-0">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-700 ${isVideoActive ? 'opacity-100' : 'opacity-0'}`} 
             />
             
             {/* VISUAL ANALYSIS HUD (Shown only when video is active) */}
             {isVideoActive && (
               <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border border-cyan-500/20 rounded-xl"></div>
                  {/* Corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-xl"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-xl"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-xl"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/60 rounded-br-xl"></div>
                  
                  {/* Scanline */}
                  <div className="absolute left-0 w-full h-0.5 bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan"></div>
                  
                  {/* Analysis Tag */}
                  <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-cyan-500/30 flex items-center gap-2">
                    <ScanEye size={12} className="text-cyan-400" />
                    <span className="text-[10px] font-mono text-cyan-300 animate-pulse">ANALYZING...</span>
                  </div>
               </div>
             )}

             {/* Overlay gradient to make AI Orb visible over video */}
             <div className={`absolute inset-0 bg-slate-950/60 transition-opacity duration-500 ${isVideoActive ? 'opacity-70' : 'opacity-0'}`}></div>
          </div>

          {/* AI ORB LAYER */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
            
            {/* Status Indicator - Mobile Optimized */}
            <div className="absolute top-2 left-2 sm:top-2 sm:left-4 z-20 flex gap-1.5 sm:gap-2 flex-wrap">
              {isConnected ? (
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md border border-emerald-500/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-400 tracking-wide">LIVE</span>
                  </div>
              ) : (
                  <div className="bg-black/60 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/10">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400">OFFLINE</span>
                  </div>
              )}
              {isTeacherMode && isConnected && (
                <div className="flex items-center gap-1 sm:gap-2 bg-amber-900/60 backdrop-blur-md border border-amber-500/30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    <Keyboard size={10} className="sm:w-3 sm:h-3 text-amber-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-amber-400 tracking-wide uppercase">Teacher</span>
                </div>
              )}
            </div>

            {/* The Magic Orb - Enhanced with More Animations */}
            <div className={`relative transition-all duration-700 ${isConnected ? 'scale-100 animate-bounce-in' : 'scale-90 grayscale opacity-80'}`}>
               
               {/* Enhanced Core Glow */}
               <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${isConnected ? 'bg-fuchsia-500/30 scale-150 animate-pulse-glow animate-glow-pulse' : 'bg-transparent scale-100'}`}></div>
               
               {/* Additional Glow Layers */}
               {isConnected && (
                 <>
                   <div className="absolute -inset-12 rounded-full blur-[80px] bg-cyan-500/20 animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
                   <div className="absolute -inset-16 rounded-full blur-[100px] bg-purple-500/15 animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
                 </>
               )}
               
               {/* Enhanced Spinning Rings - Only visible when connected */}
               {isConnected && (
                 <>
                   <div className="absolute -inset-4 border-2 border-cyan-500/40 rounded-[40%] animate-spin-slow blur-[1px] shadow-[0_0_20px_rgba(34,211,238,0.3)]"></div>
                   <div className="absolute -inset-8 border border-fuchsia-500/30 rounded-[45%] animate-reverse-spin-slow blur-[1px] shadow-[0_0_30px_rgba(236,72,153,0.2)]"></div>
                   <div className="absolute -inset-12 border border-purple-500/20 rounded-[50%] animate-spin-slow blur-[2px]" style={{ animationDuration: '15s' }}></div>
                 </>
               )}

               <div className={`
                 rounded-full bg-slate-950/80 backdrop-blur-sm border-[3px] sm:border-[4px] border-slate-700/50 flex items-center justify-center relative overflow-hidden shadow-2xl z-20
                 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 2xl:w-80 2xl:h-80
                 transition-all duration-500
                 ${isVideoActive ? 'border-fuchsia-500/40 shadow-fuchsia-900/20 animate-glow-pulse' : 'border-slate-700/50'}
                 ${isConnected ? 'animate-scale-in' : ''}
               `}>
                  {/* Grid Background inside Orb */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-600 via-transparent to-transparent"></div>

                  {/* Lumi's Voice */}
                  <div className="w-3/4 h-24 z-30">
                      <Waveform analyzer={outputAnalyzer} isListening={isConnected} color="#e879f9" />
                  </div>
                  
                  {!isConnected && (
                     <div className="absolute inset-0 flex items-center justify-center z-40">
                        <Play className="w-16 h-16 md:w-20 md:h-20 text-white/20 fill-white/10 ml-2" />
                     </div>
                  )}
               </div>

               {/* User Voice Indicator - Floating Bubble */}
               {isConnected && (
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 md:w-40 h-10 flex justify-center items-center bg-black/60 backdrop-blur-md rounded-full border border-cyan-500/30 shadow-lg z-30">
                    <div className="w-full h-full px-3 py-2 opacity-90">
                       <Waveform analyzer={inputAnalyzer} isListening={!isMuted && isConnected} color="#22d3ee" />
                    </div>
                 </div>
               )}
            </div>

            {/* Intro Text - Mobile Optimized */}
            {!isConnected && (
               <div className="mt-4 sm:mt-6 md:mt-8 text-center px-4 sm:px-6 animate-slide-up max-w-sm">
                   <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1 sm:mb-2 drop-shadow-lg">Hi {profile.name}! 👋</h2>
                   <p className="text-xs sm:text-sm md:text-base text-slate-200 drop-shadow-md">
                     I'm ready to help with <span className="text-fuchsia-400 font-bold">{profile.favoriteSubject || 'learning'}</span>.
                   </p>
               </div>
            )}
            
          </div>
        </div>

        {/* BOTTOM/RIGHT: Chat & Progress - Mobile: Full width below, Desktop: Right panel */}
        <div className="flex-1 lg:flex-[1] flex flex-col min-h-0 bg-slate-950 lg:bg-slate-950/50 backdrop-blur-xl border-l border-white/5 relative w-full lg:w-auto overflow-hidden">
           
           {/* Progress Bar Header - Mobile Optimized */}
           <div className="p-2 sm:p-3 bg-white/5 border-b border-white/5 flex items-center gap-2 sm:gap-3 flex-shrink-0">
               <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                       <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider truncate">Lumi's Confidence</span>
                       <span className="text-[10px] sm:text-xs text-white font-bold flex-shrink-0 ml-2">{learningStats.understandingScore}%</span>
                   </div>
                   <div className="w-full h-1 sm:h-1.5 bg-black/40 rounded-full overflow-hidden">
                       <div 
                          className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-yellow-500 transition-all duration-1000 ease-out"
                          style={{ width: `${learningStats.understandingScore}%` }}
                       ></div>
                   </div>
               </div>
               {learningStats.lastUpdateReason && (
                   <div className="hidden sm:flex p-1 sm:p-1.5 bg-cyan-500/10 rounded-lg flex-shrink-0">
                       <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5 text-cyan-400" />
                   </div>
               )}
           </div>

           {/* Chat Messages - Mobile Optimized */}
           <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8 custom-scrollbar scroll-smooth min-h-0" ref={scrollRef}>
                {messages.length === 0 && !liveInput && !liveOutput ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 mt-6 sm:mt-10 px-4">
                    <Bot size={36} className="sm:w-12 sm:h-12 mb-3 sm:mb-4 text-fuchsia-300" />
                    <p className="text-center text-sm sm:text-base text-slate-300">Start speaking or type in Teacher Mode...</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      if (msg.role === 'system') {
                        return (
                          <div key={msg.id} className="flex justify-center animate-bounce-in my-4">
                            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-400 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 animate-scale-in">
                               <AlertCircle size={12} className="animate-pulse" />
                               {msg.text}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={msg.id} className={`group flex gap-2 sm:gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end animate-slide-up`} style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}>
                          
                          {/* Avatar - Mobile Optimized with Animation */}
                          <div className={`
                            w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl border-2 transition-all duration-300 hover:scale-110
                            ${msg.role === 'user' 
                              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-white/20 animate-bounce-in' 
                              : 'bg-gradient-to-br from-fuchsia-600 to-violet-600 border-white/20 animate-bounce-in'
                            }
                          `}>
                            {msg.role === 'user' ? <User size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-white"/> : <Sparkles size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-white animate-pulse"/>}
                          </div>

                          {/* Message Content - Mobile Optimized with Enhanced Animations */}
                          <div className={`flex flex-col max-w-[80%] sm:max-w-[82%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-scale-in`} style={{ animationDelay: `${Math.min(index * 0.05 + 0.1, 0.4)}s` }}>
                            
                            <div className={`
                              relative px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 rounded-2xl sm:rounded-3xl shadow-lg border transition-all duration-300 hover:scale-[1.02]
                              ${msg.role === 'user' 
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 rounded-br-sm border-blue-400/20 hover:shadow-blue-500/30' 
                                : 'bg-slate-800/95 rounded-bl-sm border-fuchsia-500/30 hover:shadow-fuchsia-500/30'
                              }
                            `} style={{ zIndex: 10, backdropFilter: 'blur(8px)' }}>
                              <p 
                                className={`leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-base md:text-lg relative font-medium ${msg.role === 'user' ? 'text-white' : 'text-slate-50'}`}
                                style={{ 
                                  color: msg.role === 'user' ? '#ffffff' : '#f8fafc',
                                  textShadow: msg.role === 'user' ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.8)',
                                  zIndex: 20,
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                  opacity: 1
                                }}
                              >
                                {msg.text || ''}
                              </p>
                              
                              {msg.image && (
                                <div className="mt-4 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    <div className="relative">
                                      <img src={msg.image} alt="Generated content" className="w-full h-auto object-cover" />
                                      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1">
                                        <ImageIcon size={10} /> Generated
                                      </div>
                                    </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Toolbar - Mobile Optimized */}
                            <div className={`
                                flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full
                                opacity-100 sm:opacity-70 md:opacity-0 md:group-hover:opacity-100 
                                transition-opacity duration-200 
                                ${msg.role === 'user' ? 'flex-row-reverse bg-slate-900/50' : 'flex-row bg-slate-800/50'}
                            `}>
                               <button 
                                 onClick={() => handleCopy(msg.text, msg.id)}
                                 className="text-slate-400 hover:text-white transition-transform duration-200 hover:scale-125 active:scale-90 p-1"
                                 title="Copy text"
                               >
                                 {copiedId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                               </button>
                               <button 
                                 onClick={() => toggleMessageProperty(msg.id, 'isFavorite')}
                                 className={`transition-transform duration-200 hover:scale-125 active:scale-90 p-1 ${msg.isFavorite ? 'text-pink-500 scale-110' : 'text-slate-400 hover:text-pink-400'}`}
                                 title="Favorite"
                               >
                                 <Heart size={14} fill={msg.isFavorite ? "currentColor" : "none"} className={msg.isFavorite ? "animate-[pulse_0.4s_ease-in-out]" : ""} />
                               </button>
                               <button 
                                 onClick={() => toggleMessageProperty(msg.id, 'isFlagged')}
                                 className={`transition-transform duration-200 hover:scale-125 active:scale-90 p-1 ${msg.isFlagged ? 'text-amber-500' : 'text-slate-400 hover:text-amber-400'}`}
                                 title="Flag for Review"
                               >
                                 <Flag size={14} fill={msg.isFlagged ? "currentColor" : "none"} />
                               </button>
                               <span className="w-1 h-1 rounded-full bg-slate-600 mx-1"></span>
                               <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                                 {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>

                          </div>
                        </div>
                      );
                    })}

                    {/* Live Typing Indicators - Mobile Optimized */}
                    {liveInput && (
                      <div className="group flex gap-2 sm:gap-3 md:gap-4 flex-row-reverse items-end animate-pulse">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-white/20 flex items-center justify-center shadow-xl">
                           <User size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-white"/>
                        </div>
                        <div className="flex flex-col max-w-[80%] sm:max-w-[82%] md:max-w-[75%] items-end">
                            <div className="relative px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 rounded-2xl sm:rounded-3xl text-sm sm:text-base md:text-lg shadow-lg border backdrop-blur-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm border-blue-400/20 opacity-80 z-10">
                                <p className="leading-relaxed whitespace-pre-wrap text-white text-sm sm:text-base md:text-lg">{liveInput}</p>
                            </div>
                        </div>
                      </div>
                    )}
                    
                    {liveOutput && (
                      <div className="group flex gap-2 sm:gap-3 md:gap-4 flex-row items-end">
                         <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-fuchsia-600 to-violet-600 border-2 border-white/20 flex items-center justify-center shadow-xl">
                            <Sparkles size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] text-white"/>
                         </div>
                         <div className="flex flex-col max-w-[80%] sm:max-w-[82%] md:max-w-[75%] items-start">
                             <div className="relative px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 rounded-2xl sm:rounded-3xl text-sm sm:text-base md:text-lg shadow-lg border backdrop-blur-sm bg-slate-800/90 text-slate-100 rounded-bl-sm border-fuchsia-500/30 z-10">
                                <p className="leading-relaxed whitespace-pre-wrap text-slate-100 text-sm sm:text-base md:text-lg">
                                    {liveOutput}
                                    <span className="inline-block w-1 h-3 sm:w-1.5 sm:h-4 ml-1 bg-fuchsia-400 animate-pulse align-middle rounded-full"></span>
                                </p>
                             </div>
                         </div>
                      </div>
                    )}
                  </>
                )}
           </div>
           
           {/* TEACHER MODE INPUT - Mobile Optimized */}
           {isTeacherMode && isConnected && (
             <div className="p-2 sm:p-3 bg-slate-900/90 border-t border-white/10 z-20 flex-shrink-0 safe-area-bottom">
               <form onSubmit={handleTeacherSend} className="flex gap-2">
                  <input
                    type="text"
                    value={teacherInput}
                    onChange={(e) => setTeacherInput(e.target.value)}
                    placeholder="Type a response..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-slate-500 shadow-inner"
                  />
                  <button 
                    type="submit"
                    className="p-2.5 sm:p-3 bg-gradient-to-r from-amber-600 to-orange-600 active:from-amber-500 active:to-orange-500 text-white rounded-full transition-transform transform active:scale-95 shadow-lg disabled:opacity-50 touch-manipulation"
                    disabled={!teacherInput.trim()}
                    aria-label="Send message"
                  >
                    <Send size={18} className="sm:w-5 sm:h-5" />
                  </button>
               </form>
             </div>
           )}
        </div>
      </main>

      {/* Floating Control Dock - Mobile First Design */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[calc(100vw-2rem)] safe-area-bottom">
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1.5 sm:p-2 rounded-2xl sm:rounded-full shadow-2xl ring-1 ring-white/5">
             {!isConnected ? (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR) {
                      connect();
                    }
                  }}
                  onTouchStart={(e) => {
                    const target = e.currentTarget;
                    target.style.transform = 'scale(0.95)';
                    target.style.opacity = '0.9';
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const target = e.currentTarget;
                    target.style.transform = '';
                    target.style.opacity = '';
                  }}
                  disabled={status === ConnectionStatus.CONNECTING || status === ConnectionStatus.CONNECTED}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-violet-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all text-sm sm:text-base touch-manipulation cursor-pointer w-full sm:w-auto min-h-[44px] sm:min-h-auto disabled:opacity-60 disabled:cursor-not-allowed animate-bounce-in relative overflow-hidden group"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    backgroundSize: '200% 200%'
                  }}
                  aria-label="Start Learning"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${status === ConnectionStatus.CONNECTING ? 'animate-spin' : 'animate-pulse'} flex-shrink-0 relative z-10`} />
                  <span className="hidden sm:inline relative z-10">{status === ConnectionStatus.CONNECTING ? 'Connecting...' : 'Start Learning'}</span>
                  <span className="sm:hidden relative z-10">{status === ConnectionStatus.CONNECTING ? '...' : 'Start'}</span>
                </button>
             ) : (
                <>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2.5 sm:p-3.5 rounded-full transition-all duration-300 touch-manipulation ${isMuted && !isTeacherMode ? 'bg-red-500 text-white shadow-red-500/30 shadow-lg' : 'bg-slate-700 text-white active:bg-slate-600'} ${isTeacherMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isTeacherMode}
                    title={isTeacherMode ? "Mic disabled in Teacher Mode" : "Toggle Microphone"}
                    aria-label="Toggle Microphone"
                  >
                    {isMuted ? <MicOff size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" /> : <Mic size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" />}
                  </button>
                  
                  <button 
                    onClick={() => setIsVideoActive(!isVideoActive)}
                    className={`p-2.5 sm:p-3.5 rounded-full transition-all duration-300 touch-manipulation ${isVideoActive ? 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg' : 'bg-slate-700 text-white active:bg-slate-600'}`}
                    aria-label="Toggle Video"
                  >
                    {isVideoActive ? <Video size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" /> : <VideoOff size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" />}
                  </button>

                  {/* Teacher Mode Toggle */}
                  <button
                    onClick={() => setIsTeacherMode(!isTeacherMode)}
                    className={`p-2.5 sm:p-3.5 rounded-full transition-all duration-300 border touch-manipulation ${isTeacherMode ? 'bg-amber-600 border-amber-400 text-white shadow-amber-500/30 shadow-lg' : 'bg-slate-700 border-transparent text-slate-300 active:bg-slate-600'}`}
                    title="Toggle Teacher Mode (Text Input)"
                    aria-label="Toggle Teacher Mode"
                  >
                    <Keyboard size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" />
                  </button>

                  <div className="w-px h-6 sm:h-8 bg-white/20 mx-0.5 sm:mx-1"></div>

                  <button 
                    onClick={disconnect}
                    className="p-2.5 sm:p-3.5 rounded-full bg-red-500/20 text-red-400 active:bg-red-500 active:text-white transition-all duration-300 border border-red-500/30 touch-manipulation"
                    aria-label="Disconnect"
                  >
                    <PhoneOff size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" />
                  </button>
                </>
             )}
        </div>
      </div>

    </div>
  );
};

export default App;