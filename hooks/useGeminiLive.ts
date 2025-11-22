
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { StudentProfile, ConnectionStatus, Message } from '../types';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, downsampleTo16000 } from '../utils/audioUtils';

interface UseGeminiLiveProps {
  profile: StudentProfile | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const useGeminiLive = ({ profile, videoRef }: UseGeminiLiveProps) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  
  // Transcription State
  const [messages, setMessages] = useState<Message[]>([]);
  // We track the "in-progress" text separately to avoid jitter in the main message list
  const [liveInput, setLiveInput] = useState('');
  const [liveOutput, setLiveOutput] = useState('');

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  // Processing Nodes
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  
  // API & Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Playback Queue
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Video Frame Interval
  const videoIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Analyzers for visualization
  const inputAnalyzerRef = useRef<AnalyserNode | null>(null);
  const outputAnalyzerRef = useRef<AnalyserNode | null>(null);

  // Refs for accumulating transcript parts before committing to history
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');

  useEffect(() => {
    // Initialize canvas for video processing
    canvasRef.current = document.createElement('canvas');
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(async () => {
    // Cleanup audio
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
    }
    
    // Stop output sources
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { /* ignore */ }
    });
    audioSourcesRef.current.clear();

    // Close AudioContexts
    if (inputAudioContextRef.current?.state !== 'closed') {
      await inputAudioContextRef.current?.close();
    }
    if (outputAudioContextRef.current?.state !== 'closed') {
      await outputAudioContextRef.current?.close();
    }

    // Clear video interval
    if (videoIntervalRef.current) {
      window.clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    // Close session
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current = null;
    }

    setStatus(ConnectionStatus.DISCONNECTED);
    setLiveInput('');
    setLiveOutput('');
  }, []);

  const connect = useCallback(async () => {
    if (!profile || !process.env.API_KEY) return;

    try {
      setStatus(ConnectionStatus.CONNECTING);
      
      // Initialize AI
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Setup Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Setup Analyzers
      inputAnalyzerRef.current = inputAudioContextRef.current.createAnalyser();
      outputAnalyzerRef.current = outputAudioContextRef.current.createAnalyser();
      
      // Setup Output Node
      outputGainNodeRef.current = outputAudioContextRef.current.createGain();
      outputGainNodeRef.current.connect(outputAnalyzerRef.current);
      outputAnalyzerRef.current.connect(outputAudioContextRef.current.destination);

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: async () => {
            setStatus(ConnectionStatus.CONNECTED);
            
            // Start Input Stream Processing
            if (!inputAudioContextRef.current) return;
            
            inputSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            inputSourceRef.current.connect(inputAnalyzerRef.current!); // Connect for visualization
            
            // Use a buffer size of 4096.
            processorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processorRef.current.onaudioprocess = (e) => {
              if (isMuted) return; // Don't send if muted
              
              const inputData = e.inputBuffer.getChannelData(0);
              const downsampledData = downsampleTo16000(inputData, inputAudioContextRef.current!.sampleRate);
              const pcmBlob = createPcmBlob(downsampledData);
              
              sessionPromiseRef.current?.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            inputSourceRef.current.connect(processorRef.current);
            processorRef.current.connect(inputAudioContextRef.current.destination);

            // --- TRIGGER WELCOME MESSAGE ---
            // We send a text input to the model to force it to speak the welcome message defined in the system instruction.
            sessionPromiseRef.current?.then(session => {
                session.sendRealtimeInput({
                    content: [{ text: `User ${profile.name} has joined the session. Start by greeting them enthusiastically.` }]
                });
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current && outputGainNodeRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx,
                24000, // Gemini always sends 24kHz audio
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputGainNodeRef.current);
              
              source.addEventListener('ended', () => {
                audioSourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }

            // Handle Transcription
            const serverContent = message.serverContent;
            if (serverContent) {
              if (serverContent.inputTranscription) {
                const text = serverContent.inputTranscription.text;
                if (text) {
                   currentInputRef.current += text;
                   setLiveInput(currentInputRef.current);
                }
              }

              if (serverContent.outputTranscription) {
                const text = serverContent.outputTranscription.text;
                if (text) {
                   currentOutputRef.current += text;
                   setLiveOutput(currentOutputRef.current);
                }
              }

              if (serverContent.turnComplete) {
                // User turn complete
                if (currentInputRef.current.trim()) {
                   setMessages(prev => [...prev, {
                     id: Date.now().toString(),
                     role: 'user',
                     text: currentInputRef.current.trim(),
                     timestamp: new Date()
                   }]);
                   currentInputRef.current = '';
                   setLiveInput('');
                }
                
                // Model turn complete
                if (currentOutputRef.current.trim()) {
                   setMessages(prev => [...prev, {
                     id: (Date.now() + 1).toString(),
                     role: 'assistant',
                     text: currentOutputRef.current.trim(),
                     timestamp: new Date()
                   }]);
                   currentOutputRef.current = '';
                   setLiveOutput('');
                }
              }
            }
            
            // Handle Interruption
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(src => src.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              // If interrupted, commit whatever we have so far
              if (currentOutputRef.current.trim()) {
                 setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    text: currentOutputRef.current.trim() + "...",
                    timestamp: new Date()
                 }]);
                 currentOutputRef.current = '';
                 setLiveOutput('');
              }
            }
          },
          onclose: () => {
            setStatus(ConnectionStatus.DISCONNECTED);
          },
          onerror: (err: any) => {
            console.error("Gemini Live Error:", err);
            setStatus(ConnectionStatus.ERROR);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          // Updated System Instruction for Adaptive Learning & HCI
          systemInstruction: `
            You are Lumi, a magical, high-energy, and super-fast AI tutor for ${profile.name} (${profile.grade}).
            
            GOAL:
            Help ${profile.name} master ${profile.favoriteSubject} and conquer ${profile.struggleTopic}.
            
            PERSONALITY:
            - You are NOT a boring robot. You are a fun companion!
            - Use short, punchy sentences. Speak like a friend.
            - Be encouraging! Use emojis in your tone (high energy).
            
            PROTOCOL:
            1. **INITIAL GREETING**: As soon as connected, say exactly: "Hi ${profile.name}! It's Lumi! I'm so ready to explore ${profile.favoriteSubject} with you today. Shall we tackle ${profile.struggleTopic}?"
            2. **ADAPTIVE TEACHING**: 
               - If ${profile.name} hesitates or says "I don't know", slow down. Break the concept into tiny pieces.
               - Use analogies related to ${profile.learningStyle === 'visual' ? 'pictures and movies' : profile.learningStyle === 'hands-on' ? 'building blocks and games' : 'stories and songs'}.
            3. **SOCRATIC METHOD**: Never give the answer. Ask "What do you think happens next?" or "Look at the image, what do you see?"
            4. **CHECKPOINT**: Every few interactions, ask "Does that click for you?" or "Show me with a thumbs up in your voice!"
            
            Keep responses under 2 sentences unless explaining a story. Speed is key!
          `
        }
      };

      // Connect
      sessionPromiseRef.current = aiRef.current.live.connect(config);

    } catch (error) {
      console.error("Connection failed", error);
      setStatus(ConnectionStatus.ERROR);
    }
  }, [profile, isMuted]);

  // Video Streaming Logic
  useEffect(() => {
    if (isVideoActive && status === ConnectionStatus.CONNECTED && videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const video = videoRef.current;

      videoIntervalRef.current = window.setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
          canvasRef.current!.width = video.videoWidth;
          canvasRef.current!.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          // Convert to base64 JPEG
          const base64Data = canvasRef.current!.toDataURL('image/jpeg', 0.6).split(',')[1];
          
          sessionPromiseRef.current?.then(session => {
            session.sendRealtimeInput({
              media: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            });
          });
        }
      }, 1000); 
    } else {
      if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
        videoIntervalRef.current = null;
      }
    }
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [isVideoActive, status, videoRef]);

  return {
    status,
    connect,
    disconnect,
    isMuted,
    setIsMuted,
    isVideoActive,
    setIsVideoActive,
    inputAnalyzer: inputAnalyzerRef.current,
    outputAnalyzer: outputAnalyzerRef.current,
    messages,
    liveInput,
    liveOutput
  };
};
