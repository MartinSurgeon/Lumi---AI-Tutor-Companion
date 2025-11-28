import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Play, Sparkles, User, Bot, Zap, ImageIcon, Settings, Monitor, Search, BrainCircuit, TrendingUp, Award, BookOpen, Keyboard, Send, Clock, AlertCircle, ScanEye, Copy, Check, Heart, Flag } from 'lucide-react';
import Lumilogo from './assets/Lumilogo.png';
import SetupModal from './components/SetupModal';
import Waveform from './components/Waveform';
import { StudentProfile, ConnectionStatus, ImageResolution } from './types';
import { useGeminiLive } from './hooks/useGeminiLive';

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
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-fuchsia-500 selection:text-white">
      
      {/* Cosmic Background (Animated) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-950 to-black"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-glow delay-1000"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-fuchsia-400 rounded-full blur-[1px] animate-float opacity-40"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full blur-[2px] animate-float delay-700 opacity-40"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-yellow-300 rounded-full blur-[1px] animate-float delay-1500 opacity-30"></div>
      </div>

      {/* Header - Compact & Transparent */}
      <header className="w-full px-4 py-3 flex justify-between items-center z-50 bg-slate-950/40 backdrop-blur-sm border-b border-white/5 fixed top-0 left-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/40">
              <img
                src={Lumilogo}
                alt="Lumi logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-300 uppercase tracking-[0.2em]">
                Lumi
              </span>
              <span className="text-xs text-slate-400 hidden xs:block">
                Your magical AI tutor
              </span>
            </div>
          </div>
        </div>
        
        {/* Profile / Stats Pill */}
        <div className="flex items-center gap-3">
           <div className={`hidden md:flex px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide bg-slate-900/80 backdrop-blur-md ${
                learningStats.difficultyLevel === 'Advanced' ? 'bg-red-900/30 border-red-500/50 text-red-300' :
                learningStats.difficultyLevel === 'Intermediate' ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300' :
                'bg-emerald-900/30 border-emerald-500/50 text-emerald-300'
            }`}>
                {learningStats.difficultyLevel} Mode
           </div>
           
           <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border-2 border-cyan-300/50">
             <span className="text-xs font-bold text-white">{profile.name.charAt(0)}</span>
           </div>
        </div>
      </header>

      {/* Main Layout - Responsive Split */}
      <main className="flex-1 w-full h-full flex flex-col lg:flex-row z-10 pt-16 pb-24 md:pb-6">
        
        {/* TOP/LEFT: Visualizer & Video Call Area */}
        <div className="relative flex-[0.8] lg:flex-[1.5] flex flex-col items-center justify-center p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-900/30">
          
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
            
            {/* Status Indicator */}
            <div className="absolute top-2 left-4 z-20 flex gap-2">
              {isConnected ? (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-emerald-400 tracking-wide">LIVE</span>
                  </div>
              ) : (
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-xs font-bold text-slate-400">OFFLINE</span>
                  </div>
              )}
              {isTeacherMode && isConnected && (
                <div className="flex items-center gap-2 bg-amber-900/60 backdrop-blur-md border border-amber-500/30 px-3 py-1 rounded-full">
                    <Keyboard size={12} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">Teacher Mode</span>
                </div>
              )}
            </div>

            {/* The Magic Orb - Enhanced */}
            <div className={`relative transition-all duration-700 ${isConnected ? 'scale-100' : 'scale-90 grayscale opacity-80'}`}>
               
               {/* Core Glow */}
               <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${isConnected ? 'bg-fuchsia-500/30 scale-150 animate-pulse-glow' : 'bg-transparent scale-100'}`}></div>
               
               {/* Spinning Rings - Only visible when connected */}
               {isConnected && (
                 <>
                   <div className="absolute -inset-4 border border-cyan-500/30 rounded-[40%] animate-spin-slow blur-[1px]"></div>
                   <div className="absolute -inset-8 border border-fuchsia-500/20 rounded-[45%] animate-reverse-spin-slow blur-[1px]"></div>
                 </>
               )}

               <div className={`
                 rounded-full bg-slate-950/80 backdrop-blur-sm border-[4px] border-slate-700/50 flex items-center justify-center relative overflow-hidden shadow-2xl z-20
                 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80
                 ${isVideoActive ? 'border-fuchsia-500/40 shadow-fuchsia-900/20' : ''}
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

            {/* Intro Text (Hidden when connected to save space on mobile) */}
            {!isConnected && (
               <div className="mt-8 text-center px-6 animate-slide-up max-w-sm">
                   <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Hi {profile.name}!</h2>
                   <p className="text-sm md:text-base text-slate-300">
                     I'm ready to help with <span className="text-fuchsia-400 font-bold">{profile.favoriteSubject}</span>.
                   </p>
               </div>
            )}
          </div>
        </div>

        {/* BOTTOM/RIGHT: Chat & Progress */}
        <div className="flex-1 lg:flex-[1] flex flex-col min-h-0 bg-slate-950 lg:bg-slate-950/50 backdrop-blur-xl border-l border-white/5 relative">
           
           {/* Progress Bar Header (Visible in Chat Section) */}
           <div className="p-3 bg-white/5 border-b border-white/5 flex items-center gap-3">
               <div className="flex-1">
                   <div className="flex justify-between items-center mb-1">
                       <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lumi's Confidence</span>
                       <span className="text-xs text-white font-bold">{learningStats.understandingScore}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                       <div 
                          className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-yellow-500 transition-all duration-1000 ease-out"
                          style={{ width: `${learningStats.understandingScore}%` }}
                       ></div>
                   </div>
               </div>
               {learningStats.lastUpdateReason && (
                   <div className="hidden md:flex p-1.5 bg-cyan-500/10 rounded-lg">
                       <TrendingUp size={14} className="text-cyan-400" />
                   </div>
               )}
           </div>

           {/* Chat Messages */}
           <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 custom-scrollbar scroll-smooth" ref={scrollRef}>
                {messages.length === 0 && !liveInput && !liveOutput ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 mt-10">
                    <Bot size={48} className="mb-4 text-fuchsia-300" />
                    <p className="text-center text-base text-slate-300">Start speaking or type in Teacher Mode...</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      if (msg.role === 'system') {
                        return (
                          <div key={msg.id} className="flex justify-center animate-zoom-in my-4">
                            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-400 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                               <AlertCircle size={12} />
                               {msg.text}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={msg.id} className={`group flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end animate-slide-up`}>
                          
                          {/* Avatar */}
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl border-2 
                            ${msg.role === 'user' 
                              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-white/20' 
                              : 'bg-gradient-to-br from-fuchsia-600 to-violet-600 border-white/20'
                            }
                          `}>
                            {msg.role === 'user' ? <User size={18} className="text-white"/> : <Sparkles size={18} className="text-white"/>}
                          </div>

                          {/* Message Content */}
                          <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            
                            <div className={`
                              relative px-5 py-4 rounded-3xl text-base md:text-lg shadow-lg border backdrop-blur-sm z-10
                              ${msg.role === 'user' 
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 rounded-br-sm border-blue-400/20' 
                                : 'bg-slate-800/90 rounded-bl-sm border-fuchsia-500/30'
                              }
                            `}>
                              <p className={`leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-slate-100'}`}>
                                {msg.text}
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
                            
                            {/* Action Toolbar */}
                            <div className={`
                                flex items-center gap-3 mt-1.5 px-3 py-1.5 rounded-full
                                opacity-100 md:opacity-0 md:group-hover:opacity-100 
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

                    {/* Live Typing Indicators - Styled identically to messages so transition is invisible */}
                    {liveInput && (
                      <div className="group flex gap-4 flex-row-reverse items-end animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-white/20 flex items-center justify-center shadow-xl">
                           <User size={18} className="text-white"/>
                        </div>
                        <div className="flex flex-col max-w-[85%] md:max-w-[75%] items-end">
                            <div className="relative px-5 py-4 rounded-3xl text-base md:text-lg shadow-lg border backdrop-blur-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm border-blue-400/20 opacity-80 z-10">
                                <p className="leading-relaxed whitespace-pre-wrap text-white">{liveInput}</p>
                            </div>
                        </div>
                      </div>
                    )}
                    
                    {liveOutput && (
                      <div className="group flex gap-4 flex-row items-end">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-600 to-violet-600 border-2 border-white/20 flex items-center justify-center shadow-xl">
                            <Sparkles size={18} className="text-white"/>
                         </div>
                         <div className="flex flex-col max-w-[85%] md:max-w-[75%] items-start">
                             <div className="relative px-5 py-4 rounded-3xl text-base md:text-lg shadow-lg border backdrop-blur-sm bg-slate-800/90 text-slate-100 rounded-bl-sm border-fuchsia-500/30 z-10">
                                <p className="leading-relaxed whitespace-pre-wrap text-slate-100">
                                    {liveOutput}
                                    <span className="inline-block w-1.5 h-4 ml-1 bg-fuchsia-400 animate-pulse align-middle rounded-full"></span>
                                </p>
                             </div>
                         </div>
                      </div>
                    )}
                  </>
                )}
           </div>
           
           {/* TEACHER MODE INPUT - Only visible in Teacher Mode */}
           {isTeacherMode && isConnected && (
             <div className="p-3 bg-slate-900/90 border-t border-white/10 z-20">
               <form onSubmit={handleTeacherSend} className="flex gap-2">
                  <input
                    type="text"
                    value={teacherInput}
                    onChange={(e) => setTeacherInput(e.target.value)}
                    placeholder="Simulate student response..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-slate-500 shadow-inner"
                  />
                  <button 
                    type="submit"
                    className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-full transition-transform transform active:scale-95 shadow-lg disabled:opacity-50"
                    disabled={!teacherInput.trim()}
                  >
                    <Send size={20} />
                  </button>
               </form>
             </div>
           )}
        </div>
      </main>

      {/* Floating Control Dock (Mobile Friendly) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 p-2 rounded-full shadow-2xl ring-1 ring-white/5">
             {!isConnected ? (
                <button 
                  onClick={connect}
                  className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  <span>Start Learning</span>
                </button>
             ) : (
                <>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3.5 rounded-full transition-all duration-300 ${isMuted && !isTeacherMode ? 'bg-red-500 text-white shadow-red-500/30 shadow-lg' : 'bg-slate-700 text-white hover:bg-slate-600'} ${isTeacherMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isTeacherMode}
                    title={isTeacherMode ? "Mic disabled in Teacher Mode" : "Toggle Microphone"}
                  >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                  
                  <button 
                    onClick={() => setIsVideoActive(!isVideoActive)}
                    className={`p-3.5 rounded-full transition-all duration-300 ${isVideoActive ? 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                  >
                    {isVideoActive ? <Video size={22} /> : <VideoOff size={22} />}
                  </button>

                  {/* Teacher Mode Toggle */}
                  <button
                    onClick={() => setIsTeacherMode(!isTeacherMode)}
                    className={`p-3.5 rounded-full transition-all duration-300 border ${isTeacherMode ? 'bg-amber-600 border-amber-400 text-white shadow-amber-500/30 shadow-lg' : 'bg-slate-700 border-transparent text-slate-300 hover:bg-slate-600'}`}
                    title="Toggle Teacher Mode (Text Input)"
                  >
                    <Keyboard size={22} />
                  </button>

                  <div className="w-px h-8 bg-white/20 mx-1"></div>

                  <button 
                    onClick={disconnect}
                    className="p-3.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/30"
                  >
                    <PhoneOff size={22} />
                  </button>
                </>
             )}
        </div>
      </div>

    </div>
  );
};

export default App;