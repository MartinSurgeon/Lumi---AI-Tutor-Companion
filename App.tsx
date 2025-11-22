
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Play, Sparkles, User, Bot, Brain, Zap } from 'lucide-react';
import SetupModal from './components/SetupModal';
import Waveform from './components/Waveform';
import { StudentProfile, ConnectionStatus } from './types';
import { useGeminiLive } from './hooks/useGeminiLive';

const App: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
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
    liveOutput
  } = useGeminiLive({ profile, videoRef });

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

  if (!profile) {
    return <SetupModal onComplete={setProfile} />;
  }

  const isConnected = status === ConnectionStatus.CONNECTED;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col relative selection:bg-fuchsia-500 selection:text-white">
      
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-950 to-black"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center z-20 bg-slate-900/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-fuchsia-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-fuchsia-500/30">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-cyan-300 tracking-tight">
              Lumi
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-sm font-bold text-slate-200">{profile.name}</span>
             <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">{profile.grade}</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
             <User className="text-white w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 z-10 h-[calc(100vh-80px)]">
        
        {/* LEFT: Visualizer & Controls */}
        <div className="flex-[3] flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
          
          {/* Status Badge */}
          <div className="absolute top-6 left-6 z-30">
             {isConnected ? (
                <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                   <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-bold text-emerald-400">LIVE</span>
                </div>
             ) : (
                <div className="bg-slate-800/60 px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-sm font-bold text-slate-400">OFFLINE</span>
                </div>
             )}
          </div>

          {/* Center Stage */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            
            {/* Main AI Orb */}
            <div className={`relative transition-all duration-500 ${isConnected ? 'scale-100' : 'scale-90 grayscale opacity-50'}`}>
               {/* Outer Glow */}
               <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${isConnected ? 'bg-fuchsia-500/30 scale-150' : 'bg-transparent scale-100'}`}></div>
               
               {/* The Visualizer Container */}
               <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-slate-950 border-[6px] border-slate-800/80 flex items-center justify-center relative shadow-[0_0_60px_-15px_rgba(168,85,247,0.5)] overflow-hidden">
                  
                  {/* Background grid inside orb */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-800 via-transparent to-transparent"></div>

                  {/* Lumi's Voice (Output) */}
                  <div className="w-3/4 h-32 z-10">
                      <Waveform analyzer={outputAnalyzer} isListening={isConnected} color="#d8b4fe" />
                  </div>
                  
                  {/* Eyes/Face Decoration */}
                  {!isConnected && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-24 h-24 text-white/20 fill-white/10 ml-2" />
                     </div>
                  )}
               </div>

               {/* User Voice Feedback (Floating below) */}
               {isConnected && (
                 <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-12 flex justify-center items-center bg-slate-900/80 backdrop-blur rounded-full border border-white/10 shadow-lg">
                    <div className="w-full h-full opacity-80 px-4 py-2">
                       <Waveform analyzer={inputAnalyzer} isListening={!isMuted && isConnected} color="#22d3ee" />
                    </div>
                 </div>
               )}
            </div>

            {/* Prompts / Helper Text */}
            <div className="mt-16 text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {!isConnected && (
                <>
                   <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Hi {profile.name}!</h2>
                   <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
                     I'm ready to help you master <span className="text-fuchsia-400 font-bold">{profile.favoriteSubject}</span>. 
                     Click start to wake me up!
                   </p>
                </>
              )}
            </div>
          </div>

          {/* Picture in Picture Camera */}
          {isVideoActive && (
             <div className="absolute top-6 right-6 w-48 md:w-64 aspect-video bg-slate-950 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl shadow-black/50 group z-30 ring-4 ring-black/20">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform scale-x-[-1]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                   <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Brain size={12} className="text-fuchsia-400" />
                      Lumi is watching
                   </span>
                </div>
             </div>
          )}

          {/* Controls Bar */}
          <div className="p-6 md:p-8 bg-slate-900/40 backdrop-blur-md border-t border-white/5 flex justify-center items-center gap-6 md:gap-8 z-20">
             {!isConnected ? (
                <button 
                  onClick={connect}
                  className="group relative flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-[0_0_40px_-10px_rgba(192,38,211,0.6)] transition-all transform hover:scale-105 hover:-translate-y-1"
                >
                  <Sparkles className="w-6 h-6 animate-pulse" />
                  <span>Wake Up Lumi</span>
                </button>
             ) : (
                <>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-5 rounded-full transition-all duration-300 shadow-lg ${isMuted ? 'bg-red-500 text-white hover:bg-red-400 ring-4 ring-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700 ring-2 ring-white/10 hover:ring-white/30'}`}
                    title={isMuted ? "Unmute Mic" : "Mute Mic"}
                  >
                    {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                  </button>
                  
                  <button 
                    onClick={() => setIsVideoActive(!isVideoActive)}
                    className={`p-5 rounded-full transition-all duration-300 shadow-lg ${isVideoActive ? 'bg-emerald-500 text-white hover:bg-emerald-400 ring-4 ring-emerald-500/30' : 'bg-slate-800 text-white hover:bg-slate-700 ring-2 ring-white/10 hover:ring-white/30'}`}
                    title={isVideoActive ? "Turn Off Camera" : "Turn On Camera"}
                  >
                    {isVideoActive ? <Video size={28} /> : <VideoOff size={28} />}
                  </button>

                  <div className="h-12 w-px bg-white/10 mx-2"></div>

                  <button 
                    onClick={disconnect}
                    className="group px-8 py-5 rounded-full bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all flex items-center gap-2"
                  >
                    <PhoneOff size={24} className="group-hover:rotate-90 transition-transform" />
                    <span className="hidden md:inline">End</span>
                  </button>
                </>
             )}
          </div>
        </div>

        {/* RIGHT: Transcript Chat (Kid Friendly) */}
        <div className="flex-[1.5] flex flex-col gap-4 min-w-[350px] h-full">
           
           {/* Stats/Topic Card */}
           <div className="bg-gradient-to-r from-violet-900/50 to-fuchsia-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-lg">
               <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 bg-white/10 rounded-2xl text-fuchsia-300">
                    <Zap size={24} fill="currentColor" />
                 </div>
                 <div>
                    <p className="text-xs text-fuchsia-200 uppercase font-extrabold tracking-wider mb-1">Current Mission</p>
                    <p className="font-bold text-white text-lg leading-none">{profile.struggleTopic}</p>
                 </div>
               </div>
               <div className="w-full bg-white/10 rounded-full h-1.5 mt-4">
                  <div className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 h-1.5 rounded-full w-1/3"></div>
               </div>
           </div>

           {/* Chat Box */}
           <div className="flex-1 bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl flex flex-col shadow-inner relative">
              
              {/* Chat Header */}
              <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                  Conversation
                </h3>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth" ref={scrollRef}>
                
                {messages.length === 0 && !liveInput && !liveOutput ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <Bot size={48} className="mb-4 text-white" />
                    <p className="text-center text-slate-300 font-medium">Say "Hello Lumi!"<br/>to start learning.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2 duration-300`}>
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 ${msg.role === 'user' ? 'bg-cyan-500 border-cyan-300' : 'bg-fuchsia-600 border-fuchsia-400'}`}>
                           {msg.role === 'user' ? <User size={20} className="text-white"/> : <Sparkles size={20} className="text-white"/>}
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`px-5 py-3.5 rounded-2xl text-base md:text-lg font-medium leading-snug shadow-md ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none' 
                              : 'bg-gradient-to-br from-slate-800 to-slate-700 text-white border border-white/10 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-wide px-1">
                            {msg.role === 'user' ? 'You' : 'Lumi'}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Live User Input (Typing effect) */}
                    {liveInput && (
                      <div className="flex gap-3 flex-row-reverse opacity-80">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/50 flex items-center justify-center flex-shrink-0 border-2 border-cyan-500/30">
                           <User size={20} className="text-white"/>
                        </div>
                        <div className="flex flex-col items-end max-w-[80%]">
                          <div className="px-5 py-3.5 rounded-2xl text-base md:text-lg bg-cyan-900/40 border border-cyan-500/30 text-cyan-100 rounded-tr-none italic">
                            {liveInput}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live Lumi Output (Typing effect) */}
                    {liveOutput && (
                      <div className="flex gap-3 flex-row opacity-80">
                        <div className="w-10 h-10 rounded-full bg-fuchsia-600/50 flex items-center justify-center flex-shrink-0 border-2 border-fuchsia-500/30">
                           <Sparkles size={20} className="text-white"/>
                        </div>
                        <div className="flex flex-col items-start max-w-[80%]">
                          <div className="px-5 py-3.5 rounded-2xl text-base md:text-lg bg-fuchsia-900/40 border border-fuchsia-500/30 text-fuchsia-100 rounded-tl-none">
                            {liveOutput}
                            <span className="inline-block w-1.5 h-4 ml-1 bg-fuchsia-400 animate-pulse align-middle"></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;
