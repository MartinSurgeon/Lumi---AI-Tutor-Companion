import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Play, Sparkles, User, Bot, Zap, ImageIcon, Settings, Monitor, Search, BrainCircuit, TrendingUp, Award, BookOpen, Keyboard, Send, Clock, AlertCircle, ScanEye, Copy, Check, Heart, Flag, Menu, X, MessageSquare, Library, FolderOpen, ChevronRight } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);

  // Check if Tailwind CSS is loaded
  useEffect(() => {
    const checkTailwind = () => {
      // Check if Tailwind utilities are available by testing a class
      const testEl = document.createElement('div');
      testEl.className = 'flex';
      testEl.style.cssText = 'position: absolute; visibility: hidden; pointer-events: none;';
      document.body.appendChild(testEl);
      
      const computedStyle = window.getComputedStyle(testEl);
      const hasTailwind = computedStyle.display === 'flex' || computedStyle.display === '-webkit-box';
      
      document.body.removeChild(testEl);
      
      if (hasTailwind || (window as any).tailwind) {
        setStylesLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkTailwind, 100);
      }
    };
    
    // Wait a bit for scripts to load
    setTimeout(checkTailwind, 50);
    
    // Also listen for tailwind-loaded event
    const handleTailwindLoaded = () => {
      setStylesLoaded(true);
    };
    window.addEventListener('tailwind-loaded', handleTailwindLoaded);
    
    return () => {
      window.removeEventListener('tailwind-loaded', handleTailwindLoaded);
    };
  }, []);
  
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

  // Debug: Log current URL and styles status
  useEffect(() => {
    console.log('App loaded on:', window.location.href);
    console.log('Styles loaded:', stylesLoaded);
    console.log('Tailwind available:', typeof (window as any).tailwind !== 'undefined');
  }, [stylesLoaded]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 text-slate-900 font-sans overflow-hidden flex relative selection:bg-fuchsia-500 selection:text-white">
      
      {/* Soft Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-pink-100/50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Left Sidebar - ZAY-G Style */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 lg:w-72
        bg-white/80 backdrop-blur-xl
        border-r border-slate-200/50
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-yellow-400 flex items-center justify-center shadow-lg">
                <img src={Lumilogo} alt="Lumi" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">LUMI</h1>
                <p className="text-xs text-slate-500">AI Tutor Companion</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Q Search"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-300"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white hover:shadow-lg transition-all">
            <MessageSquare size={20} />
            <span className="font-medium">New Chat</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
            <Library size={20} />
            <span className="font-medium">Library</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
            <User size={20} />
            <span className="font-medium">My Sessions</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors">
            <FolderOpen size={20} />
            <span className="font-medium">Projects</span>
          </button>

          {/* Chat History */}
          <div className="mt-6 pt-6 border-t border-slate-200/50">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chat History</h3>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
            <div className="space-y-1">
              {messages.slice(0, 4).map((msg, idx) => (
                <button 
                  key={idx}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  <ChevronRight size={12} className="text-slate-400" />
                  <span className="truncate">{msg.text.substring(0, 30)}...</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${
              learningStats.difficultyLevel === 'Advanced' ? 'bg-red-100 border-red-300 text-red-700' :
              learningStats.difficultyLevel === 'Intermediate' ? 'bg-yellow-100 border-yellow-300 text-yellow-700' :
              'bg-emerald-100 border-emerald-300 text-emerald-700'
            }`}>
              {learningStats.difficultyLevel} Mode
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg border-2 border-cyan-300">
              <span className="text-xs font-bold text-white">{profile.name.charAt(0)}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200"
      >
        <Menu size={24} className="text-slate-700" />
      </button>

      {/* Main Content Area - ZAY-G Style */}
      <main className="flex-1 flex flex-col z-10 lg:ml-0">
        {/* Top Bar */}
        <div className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-yellow-400 flex items-center justify-center">
              <img src={Lumilogo} alt="Lumi" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">LUMI</h2>
            <ChevronRight size={16} className="text-slate-400" />
          </div>
          
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-700">LIVE</span>
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-300 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-slate-600">OFFLINE</span>
              </div>
            )}
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors relative"
            >
              <MessageSquare size={20} className="text-slate-700" />
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-fuchsia-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {messages.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
          {/* Video Background Layer */}
          <div className="absolute inset-0 z-0">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-700 ${isVideoActive ? 'opacity-20' : 'opacity-0'}`} 
            />
            {isVideoActive && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/40"></div>
            )}
          </div>

          {/* AI Orb Center */}
          <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl w-full">
            {/* Status Badges */}
            <div className="absolute -top-16 flex gap-2 flex-wrap justify-center">
              {isTeacherMode && isConnected && (
                <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                  <Keyboard size={12} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase">Teacher Mode</span>
                </div>
              )}
            </div>

            {/* The Magic Orb */}
            <div className={`relative transition-all duration-700 ${isConnected ? 'scale-100' : 'scale-90 opacity-80'}`}>
              {/* Core Glow */}
              <div className={`absolute inset-0 rounded-full blur-[60px] transition-all duration-1000 ${isConnected ? 'bg-fuchsia-400/40 scale-150 animate-pulse-glow' : 'bg-transparent scale-100'}`}></div>
              
              {/* Spinning Rings */}
              {isConnected && (
                <>
                  <div className="absolute -inset-4 border border-cyan-400/30 rounded-[40%] animate-spin-slow blur-[1px]"></div>
                  <div className="absolute -inset-8 border border-fuchsia-400/20 rounded-[45%] animate-reverse-spin-slow blur-[1px]"></div>
                </>
              )}

              <div className={`
                rounded-full bg-white/90 backdrop-blur-sm border-[4px] border-slate-200 flex items-center justify-center relative overflow-hidden shadow-2xl z-20
                w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80
                ${isVideoActive ? 'border-fuchsia-300 shadow-fuchsia-200' : ''}
              `}>
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-fuchsia-200 via-purple-200 to-cyan-200"></div>

                {/* Lumi's Voice */}
                <div className="w-3/4 h-24 z-30">
                  <Waveform analyzer={outputAnalyzer} isListening={isConnected} color="#a855f7" />
                </div>
                
                {!isConnected && (
                  <div className="absolute inset-0 flex items-center justify-center z-40">
                    <Play className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300 fill-slate-200 ml-2" />
                  </div>
                )}
              </div>

              {/* User Voice Indicator */}
              {isConnected && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-10 flex justify-center items-center bg-white/90 backdrop-blur-md rounded-full border border-cyan-300 shadow-lg z-30">
                  <div className="w-full h-full px-3 py-2 opacity-90">
                    <Waveform analyzer={inputAnalyzer} isListening={!isMuted && isConnected} color="#06b6d4" />
                  </div>
                </div>
              )}
            </div>

            {/* Welcome Message */}
            {!isConnected && (
              <div className="mt-12 text-center px-6 animate-slide-up">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3">
                  How can I help you today?
                </h2>
                <p className="text-base sm:text-lg text-slate-600 mb-8">
                  Hi {profile.name}! I'm ready to help with <span className="text-fuchsia-600 font-bold">{profile.favoriteSubject || 'learning'}</span>.
                </p>
              </div>
            )}

            {/* Chat Input */}
            <div className="w-full max-w-xl mt-8">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isConnected) connect();
                }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="+ Chat here.."
                  className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-300 shadow-lg text-base sm:text-lg"
                  disabled={!isConnected && !isTeacherMode}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Voice input"
                  >
                    <Mic size={20} className="text-slate-600" />
                  </button>
                </div>
              </form>

              {/* Suggested Actions */}
              {!isConnected && (
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <button className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <Zap size={16} />
                    Quick Start
                  </button>
                  <button className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <BookOpen size={16} />
                    Study Plan
                  </button>
                  <button className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <BrainCircuit size={16} />
                    Practice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Chat Window - ZAY-G Style */}
        <div className={`
          fixed lg:static inset-y-0 right-0 z-40
          w-full lg:w-96 xl:w-[420px]
          bg-white/95 backdrop-blur-xl
          border-l border-slate-200/50
          flex flex-col
          shadow-2xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${chatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-yellow-400 flex items-center justify-center">
                <img src={Lumilogo} alt="Lumi" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">LUMI Digital</h3>
                <p className="text-xs text-slate-500">Digital chatbot interface</p>
              </div>
            </div>
            <button 
              onClick={() => setChatOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="p-3 bg-slate-50/50 border-b border-slate-200/50">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Lumi's Confidence</span>
              <span className="text-xs text-slate-900 font-bold">{learningStats.understandingScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-yellow-400 transition-all duration-1000 ease-out"
                style={{ width: `${learningStats.understandingScore}%` }}
              ></div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar scroll-smooth" ref={scrollRef}>
            {messages.length === 0 && !liveInput && !liveOutput ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 mt-10">
                <Bot size={48} className="mb-4 text-fuchsia-400" />
                <p className="text-center text-sm text-slate-500">Start speaking or type in Teacher Mode...</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  if (msg.role === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center animate-zoom-in my-4">
                        <div className="bg-slate-100 border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                          <AlertCircle size={12} />
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`group flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end animate-slide-up`}>
                      {/* Avatar */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border-2 
                        ${msg.role === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-300' 
                          : 'bg-gradient-to-br from-fuchsia-500 to-violet-600 border-fuchsia-300'
                        }
                      `}>
                        {msg.role === 'user' ? <User size={16} className="text-white"/> : <Sparkles size={16} className="text-white"/>}
                      </div>

                      {/* Message Content */}
                      <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`
                          relative px-4 py-3 rounded-2xl text-sm shadow-sm border z-10
                          ${msg.role === 'user' 
                            ? 'bg-blue-500 text-white rounded-br-sm border-blue-400' 
                            : 'bg-slate-100 text-slate-900 rounded-bl-sm border-slate-200'
                          }
                        `}>
                          <p className="leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                          
                          {msg.image && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-white/20 shadow-md">
                              <img src={msg.image} alt="Generated content" className="w-full h-auto object-cover" />
                            </div>
                          )}
                        </div>
                        
                        {/* Action Toolbar */}
                        <div className={`
                          flex items-center gap-2 mt-1 px-2 py-1 rounded-full
                          opacity-0 group-hover:opacity-100 
                          transition-opacity duration-200 
                          ${msg.role === 'user' ? 'flex-row-reverse bg-blue-50' : 'flex-row bg-slate-50'}
                        `}>
                          <button 
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            title="Copy"
                          >
                            {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                          <button 
                            onClick={() => toggleMessageProperty(msg.id, 'isFavorite')}
                            className={`transition-colors p-1 ${msg.isFavorite ? 'text-pink-500' : 'text-slate-400 hover:text-pink-400'}`}
                            title="Favorite"
                          >
                            <Heart size={12} fill={msg.isFavorite ? "currentColor" : "none"} />
                          </button>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Live Typing Indicators */}
                {liveInput && (
                  <div className="flex gap-3 flex-row-reverse items-end animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-blue-300 flex items-center justify-center shadow-md">
                      <User size={16} className="text-white"/>
                    </div>
                    <div className="flex flex-col max-w-[80%] items-end">
                      <div className="px-4 py-3 rounded-2xl rounded-br-sm bg-blue-500 text-white text-sm shadow-sm border border-blue-400 opacity-80">
                        <p className="leading-relaxed whitespace-pre-wrap">{liveInput}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {liveOutput && (
                  <div className="flex gap-3 flex-row items-end">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 border-2 border-fuchsia-300 flex items-center justify-center shadow-md">
                      <Sparkles size={16} className="text-white"/>
                    </div>
                    <div className="flex flex-col max-w-[80%] items-start">
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-100 text-slate-900 text-sm shadow-sm border border-slate-200">
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {liveOutput}
                          <span className="inline-block w-1 h-3 ml-1 bg-fuchsia-400 animate-pulse align-middle rounded-full"></span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t border-slate-200/50 bg-white/80 backdrop-blur-sm">
            {isTeacherMode && isConnected ? (
              <form onSubmit={handleTeacherSend} className="flex gap-2">
                <input
                  type="text"
                  value={teacherInput}
                  onChange={(e) => setTeacherInput(e.target.value)}
                  placeholder="Chat here.."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 placeholder-slate-400 text-sm"
                />
                <button 
                  type="submit"
                  className="p-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full transition-transform transform active:scale-95 shadow-md disabled:opacity-50"
                  disabled={!teacherInput.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            ) : (
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <Zap size={18} className="text-slate-600" />
                </button>
                <input
                  type="text"
                  placeholder="Chat here.."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-300 placeholder-slate-400 text-sm"
                  disabled={!isConnected}
                />
                <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <Mic size={18} className="text-slate-600" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Chat Overlay */}
        {chatOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setChatOpen(false)}
          />
        )}
      </main>

      {/* Floating Control Dock - ZAY-G Style */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-slate-200 p-2 rounded-full shadow-2xl">
          {!isConnected ? (
            <button 
              onClick={connect}
              className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform text-sm sm:text-base"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span>Start Learning</span>
            </button>
          ) : (
            <>
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 ${isMuted && !isTeacherMode ? 'bg-red-500 text-white shadow-red-500/30 shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} ${isTeacherMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isTeacherMode}
                title={isTeacherMode ? "Mic disabled in Teacher Mode" : "Toggle Microphone"}
              >
                {isMuted ? <MicOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className="sm:w-5 sm:h-5" />}
              </button>
              
              <button 
                onClick={() => setIsVideoActive(!isVideoActive)}
                className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 ${isVideoActive ? 'bg-emerald-500 text-white shadow-emerald-500/30 shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                title="Toggle Video"
              >
                {isVideoActive ? <Video size={18} className="sm:w-5 sm:h-5" /> : <VideoOff size={18} className="sm:w-5 sm:h-5" />}
              </button>

              <button
                onClick={() => setIsTeacherMode(!isTeacherMode)}
                className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 border ${isTeacherMode ? 'bg-amber-500 border-amber-400 text-white shadow-amber-500/30 shadow-lg' : 'bg-slate-100 border-transparent text-slate-700 hover:bg-slate-200'}`}
                title="Toggle Teacher Mode"
              >
                <Keyboard size={18} className="sm:w-5 sm:h-5" />
              </button>

              <div className="w-px h-6 bg-slate-300 mx-1"></div>

              <button 
                onClick={disconnect}
                className="p-2.5 sm:p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-300"
                title="Disconnect"
              >
                <PhoneOff size={18} className="sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default App;