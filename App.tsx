
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Play, Sparkles, User, Bot, Zap, ImageIcon, Settings, Monitor, Search, BrainCircuit, TrendingUp, Award, BookOpen, Keyboard, Send, Clock, AlertCircle, ScanEye, Copy, Check, Heart, Flag, Ghost, RefreshCw, LogOut } from 'lucide-react';
import SetupModal from './components/SetupModal';
import Waveform from './components/Waveform';
import { StudentProfile, ConnectionStatus, ImageResolution } from './types';
import { useGeminiLive } from './hooks/useGeminiLive';

const App: React.FC = () => {
  // Initialize Profile from LocalStorage
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    try {
        const saved = localStorage.getItem('lumi_student_profile');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
  });

  const [imageResolution, setImageResolution] = useState<ImageResolution>('1K');
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [teacherInput, setTeacherInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save profile to LocalStorage whenever it changes
  useEffect(() => {
    if (profile) {
        localStorage.setItem('lumi_student_profile', JSON.stringify(profile));
    }
  }, [profile]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?\n\nThis will delete your profile and chat history from this device.")) {
        localStorage.removeItem('lumi_student_profile');
        localStorage.removeItem('lumi_chat_history');
        localStorage.removeItem('lumi_learning_stats');
        setProfile(null);
        // Force reload to clear all in-memory states/hooks
        window.location.reload();
    }
  };
  
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
    toggleMessageProperty,
    isAiSpeaking
  } = useGeminiLive({ profile, videoRef, imageResolution });

  // Handle Camera Stream locally for the video element
  useEffect(() => {
    if (isVideoActive) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
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
  }, [isVideoActive, setIsVideoActive, cameraFacingMode]);

  const toggleCamera = () => {
    setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

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
  const isConnecting = status === ConnectionStatus.CONNECTING;

  return (
    <div className="h-[100dvh] bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-fuchsia-500 selection:text-white">
      
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
      <header className="w-full px-4 py-3 flex justify-between items-center z-50 absolute top-0 left-0 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-black/20 backdrop-blur-md p-1.5 rounded-xl border border-white/5">
          <div className="bg-gradient-to-br from-fuchsia-500 to-violet-600 p-1.5 rounded-lg shadow-lg shadow-fuchsia-500/30">
            <Ghost className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-cyan-300 tracking-tight">
            Lumi
          </h1>
        </div>
        
        {/* Profile / Stats Pill */}
        <div className="flex items-center gap-3 pointer-events-auto">
           {isConnected && (
               <div className={`hidden md:flex px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide bg-slate-900/80 backdrop-blur-md ${
                    learningStats.difficultyLevel === 'Advanced' ? 'bg-red-900/30 border-red-500/50 text-red-300' :
                    learningStats.difficultyLevel === 'Intermediate' ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300' :
                    'bg-emerald-900/30 border-emerald-500/50 text-emerald-300'
                }`}>
                    {learningStats.difficultyLevel} Mode
               </div>
           )}
           
           <div className="flex items-center gap-2">
               <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border-2 border-cyan-300/50">
                <span className="text-xs font-bold text-white">{profile.name.charAt(0)}</span>
               </div>
               <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all bg-black/20 rounded-full backdrop-blur-md border border-white/5"
                title="Log Out & Clear Data"
               >
                   <LogOut size={18} />
               </button>
           </div>
        </div>
      </header>

      {/* Main Layout - Visual Stage + Bottom Sheet */}
      <main className="flex-1 w-full h-full flex flex-col lg:flex-row relative">
        
        {/* === VISUAL STAGE (Top on Mobile, Left on Desktop) === */}
        <div className="relative w-full h-[45dvh] lg:h-full lg:flex-[1.5] flex flex-col items-center justify-center p-4 overflow-hidden lg:border-r border-white/10 z-0">
          
          {/* VIDEO CALL BACKGROUND LAYER */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className={`w-full h-full object-cover transition-opacity duration-700 ${isVideoActive ? 'opacity-100' : 'opacity-0'} ${cameraFacingMode === 'user' ? 'transform scale-x-[-1]' : ''}`} 
             />
             
             {/* CLEAN VIDEO CALL OVERLAY */}
             {isVideoActive && (
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/40">
                  {/* Just a clean frame/vignette */}
               </div>
             )}

             {/* Dark overlay for better orb contrast even when video is on */}
             <div className={`absolute inset-0 bg-slate-950/60 transition-opacity duration-500 ${isVideoActive ? 'opacity-0' : 'opacity-100'}`}></div>
          </div>

          {/* AI ORB LAYER */}
          {/* Adjusted padding-bottom to ensure orb clears the bottom sheet on mobile */}
          <div className={`relative z-10 flex flex-col items-center justify-center w-full h-full transition-all duration-700 ${isVideoActive ? 'justify-end pb-20 lg:pb-24' : ''}`}>
            
            {/* Status Pills */}
            <div className={`absolute left-1/2 -translate-x-1/2 z-20 flex gap-2 transition-all duration-700 ${isVideoActive ? 'top-4' : 'top-16 lg:top-8'}`}>
              {isConnected ? (
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full shadow-lg">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 tracking-wide">LIVE</span>
                  </div>
              ) : (
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                    <span className="text-[10px] font-bold text-slate-400">OFFLINE</span>
                  </div>
              )}
              {isTeacherMode && isConnected && (
                <div className="flex items-center gap-2 bg-amber-900/60 backdrop-blur-md border border-amber-500/30 px-3 py-1 rounded-full shadow-lg">
                    <Keyboard size={10} className="text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 tracking-wide uppercase">Teacher Mode</span>
                </div>
              )}
            </div>

            {/* The Magic Orb */}
            <div className={`relative transition-all duration-700 ${isConnected ? 'scale-100' : 'scale-90 grayscale opacity-80'} ${isVideoActive ? 'scale-75 translate-y-4' : ''} mt-4`}>
               {/* Speaking Indicator Glow */}
               <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-300 
                  ${isConnected ? 'bg-fuchsia-500/30' : 'bg-transparent'}
                  ${isAiSpeaking ? 'scale-175 opacity-100' : 'scale-125 opacity-40 animate-pulse-glow'}
               `}></div>
               
               {isConnected && (
                 <>
                   <div className="absolute -inset-4 border border-cyan-500/30 rounded-[40%] animate-spin-slow blur-[1px]"></div>
                   <div className="absolute -inset-8 border border-fuchsia-500/20 rounded-[45%] animate-reverse-spin-slow blur-[1px]"></div>
                 </>
               )}

               <div className={`
                 rounded-full bg-slate-950/80 backdrop-blur-sm border-[4px] flex items-center justify-center relative overflow-hidden shadow-2xl z-20 transition-all duration-300
                 w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72
                 ${isVideoActive ? 'border-fuchsia-500/40 shadow-fuchsia-900/20' : ''}
                 ${isAiSpeaking ? 'border-fuchsia-400 shadow-[0_0_40px_rgba(232,121,249,0.5)]' : 'border-slate-700/50'}
               `}>
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-600 via-transparent to-transparent"></div>
                  <div className="w-3/4 h-20 z-30">
                      <Waveform analyzer={outputAnalyzer} isListening={isConnected} color="#e879f9" />
                  </div>
                  {!isConnected && (
                     <div className="absolute inset-0 flex items-center justify-center z-40">
                        <Play className="w-12 h-12 md:w-20 md:h-20 text-white/20 fill-white/10 ml-2" />
                     </div>
                  )}
               </div>

               {/* User Voice Indicator */}
               {isConnected && (
                 <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-28 md:w-40 h-8 md:h-10 flex justify-center items-center bg-black/60 backdrop-blur-md rounded-full border border-cyan-500/30 shadow-lg z-30">
                    <div className="w-full h-full px-3 py-1.5 opacity-90">
                       <Waveform analyzer={inputAnalyzer} isListening={!isMuted && isConnected} color="#22d3ee" />
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* === CHAT SHEET (Bottom on Mobile, Right on Desktop) === */}
        <div className="relative flex-1 flex flex-col w-full h-full lg:h-auto bg-slate-950 lg:bg-slate-950/50 backdrop-blur-xl lg:backdrop-blur-none rounded-t-[2.5rem] lg:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.6)] lg:shadow-none overflow-hidden z-30 -mt-10 lg:mt-0 border-t border-white/10 lg:border-0 lg:border-l">
           
           {/* Sheet Handle (Mobile Only) */}
           <div className="w-full flex justify-center pt-3 pb-1 lg:hidden pointer-events-none">
               <div className="w-12 h-1.5 bg-white/10 rounded-full"></div>
           </div>

           {/* START SCREEN (When Offline) */}
           {!isConnected ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                    <div className="max-w-md space-y-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                Hi, {profile.name}! 👋
                            </h2>
                            <p className="text-slate-400 text-sm md:text-base">
                                Ready to crush your <span className="text-fuchsia-400 font-bold">{profile.favoriteSubject}</span> homework?
                            </p>
                        </div>

                        {/* Primary Call To Action - Centered & Visible */}
                        <button 
                            onClick={connect}
                            disabled={isConnecting}
                            className={`w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 transition-all group ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
                        >
                            {isConnecting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 text-fuchsia-600 group-hover:rotate-12 transition-transform" />
                                    <span>Start Learning</span>
                                </>
                            )}
                        </button>
                        
                        <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Video size={12}/> Video Supported</span>
                            <span className="flex items-center gap-1"><Mic size={12}/> Voice Interactive</span>
                        </div>
                    </div>
                </div>
           ) : (
                /* CHAT INTERFACE (When Connected) */
               <>
                    {/* Confidence Header */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 animate-fade-in">
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <BrainCircuit size={12} /> Lumi's Confidence
                                </span>
                                <span className="text-[10px] text-white font-bold">{learningStats.understandingScore}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-yellow-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${learningStats.understandingScore}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-6 custom-scrollbar scroll-smooth" ref={scrollRef}>
                            {messages.map((msg) => {
                            if (msg.role === 'system') {
                                return (
                                <div key={msg.id} className="flex justify-center animate-zoom-in my-2">
                                    <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 uppercase tracking-wide">
                                    <AlertCircle size={10} />
                                    {msg.text}
                                    </div>
                                </div>
                                );
                            }

                            return (
                                <div key={msg.id} className={`group flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end animate-slide-up`}>
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border 
                                    ${msg.role === 'user' 
                                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-white/20' 
                                    : 'bg-gradient-to-br from-fuchsia-600 to-violet-600 border-white/20'
                                    }
                                `}>
                                    {msg.role === 'user' ? <User size={14} className="text-white"/> : <Ghost size={14} className="text-white"/>}
                                </div>

                                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                    relative px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-md border z-10
                                    ${msg.role === 'user' 
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm border-blue-400/20' 
                                        : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border-white/10'
                                    }
                                    `}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                    {msg.image && (
                                        <div className="mt-3 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                            <img src={msg.image} alt="Generated content" className="w-full h-auto object-cover" />
                                        </div>
                                    )}
                                    </div>
                                    
                                    {/* Action Toolbar */}
                                    <div className={`
                                        flex items-center gap-2 mt-1 px-2 py-1 rounded-full
                                        opacity-100 md:opacity-0 md:group-hover:opacity-100 
                                        transition-opacity duration-200 
                                    `}>
                                    <button onClick={() => handleCopy(msg.text, msg.id)} className="text-slate-500 hover:text-white transition-colors p-1">
                                        {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    </button>
                                    <button onClick={() => toggleMessageProperty(msg.id, 'isFavorite')} className={`p-1 ${msg.isFavorite ? 'text-pink-500' : 'text-slate-500 hover:text-pink-400'}`}>
                                        <Heart size={12} fill={msg.isFavorite ? "currentColor" : "none"} />
                                    </button>
                                    <span className="text-[9px] font-medium text-slate-600 ml-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    </div>
                                </div>
                                </div>
                            );
                            })}

                            {/* Live Typing */}
                            {(liveInput || liveOutput) && (
                            <div className={`group flex gap-3 ${liveInput ? 'flex-row-reverse' : 'flex-row'} items-end animate-pulse`}>
                                <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center ${liveInput ? 'bg-blue-600' : 'bg-fuchsia-600'}`}>
                                {liveInput ? <User size={14} className="text-white"/> : <Sparkles size={14} className="text-white"/>}
                                </div>
                                <div className="relative px-4 py-3 rounded-2xl text-[15px] shadow-md border border-white/10 bg-slate-800/60 text-slate-300">
                                <p>{liveInput || liveOutput}<span className="inline-block w-1.5 h-3.5 ml-1 bg-white/50 animate-pulse rounded-full align-middle"></span></p>
                                </div>
                            </div>
                            )}
                    </div>

                    {/* === CONTROL DOCK (Pinned to Bottom of Sheet) === */}
                    <div className="absolute bottom-0 left-0 w-full z-50">
                        {/* Gradient Fade for Content */}
                        <div className="h-12 w-full bg-gradient-to-t from-slate-950 to-transparent pointer-events-none absolute bottom-full left-0"></div>
                        
                        <div className="bg-slate-950/80 backdrop-blur-xl border-t border-white/10 p-4 pb-6 flex flex-col items-center gap-4 animate-slide-up">
                            
                            {/* Teacher Input */}
                            {isTeacherMode && (
                            <form onSubmit={handleTeacherSend} className="w-full max-w-lg flex gap-2">
                                <input
                                    type="text"
                                    value={teacherInput}
                                    onChange={(e) => setTeacherInput(e.target.value)}
                                    placeholder="Type response..."
                                    className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                                <button type="submit" className="p-2 bg-amber-600 text-white rounded-full hover:bg-amber-500"><Send size={16} /></button>
                            </form>
                            )}

                            {/* Call Controls */}
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsMuted(!isMuted)} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'}`}>
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                                </button>
                                
                                <button onClick={() => setIsVideoActive(!isVideoActive)} className={`p-4 rounded-full transition-all ${isVideoActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'}`}>
                                {isVideoActive ? <Video size={24} /> : <VideoOff size={24} />}
                                </button>

                                {isVideoActive && (
                                <button onClick={toggleCamera} className="p-4 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:text-white">
                                    <RefreshCw size={24} className={cameraFacingMode === 'environment' ? 'rotate-180' : ''} />
                                </button>
                                )}

                                <div className="w-px h-8 bg-white/10 mx-2"></div>

                                <button onClick={disconnect} className="p-4 rounded-full bg-red-500 text-white shadow-lg shadow-red-900/20 hover:bg-red-600 active:scale-95 transition-all">
                                <PhoneOff size={24} />
                                </button>
                            </div>
                            
                            {/* Secondary Toggles (Small) */}
                            <div className="flex gap-4">
                                <button onClick={() => setIsTeacherMode(!isTeacherMode)} className={`text-xs font-medium flex items-center gap-1 ${isTeacherMode ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
                                <Keyboard size={12} /> {isTeacherMode ? 'TEACHER ON' : 'Teacher Mode'}
                                </button>
                            </div>
                        </div>
                    </div>
               </>
           )}

        </div>
      </main>
    </div>
  );
};

export default App;
