

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { StudentProfile, ConnectionStatus, Message, ImageResolution, LearningStats } from '../types';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, downsampleTo16000 } from '../utils/audioUtils';

interface UseGeminiLiveProps {
  profile: StudentProfile | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  imageResolution: ImageResolution;
}

// Tool definition for Image Generation
const generateImageTool: FunctionDeclaration = {
  name: 'generate_educational_image',
  description: 'Generates a visual aid. Use this PROACTIVELY when explaining physical objects, scientific concepts, math geometry, or history.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'A highly detailed, descriptive prompt for the image generator. Include style (e.g. "photorealistic", "colorful cartoon diagram", "labeled scientific illustration"), colors, and key elements.',
      },
    },
    required: ['prompt'],
  },
};

// Tool definition for Progress Tracking
const updateProgressTool: FunctionDeclaration = {
  name: 'update_student_progress',
  description: 'Updates the student\'s understanding score and difficulty level based on their recent responses. Call this frequently to keep the dashboard in sync.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      score: { 
        type: Type.NUMBER, 
        description: 'Current estimated understanding score (0-100) based on correctness and confidence.' 
      },
      difficulty: { 
        type: Type.STRING, 
        description: 'The difficulty level. MUST be one of: "Beginner", "Intermediate", "Advanced".' 
      },
      reason: { 
        type: Type.STRING, 
        description: 'Brief reason for the update (e.g. "Correctly identified photosynthesis process", "Seemed confused by fractions").' 
      }
    },
    required: ['score', 'difficulty', 'reason']
  }
};

export const useGeminiLive = ({ profile, videoRef, imageResolution }: UseGeminiLiveProps) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  // Transcription State - Initialized from LocalStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
        const saved = localStorage.getItem('lumi_chat_history');
        if (saved) {
            return JSON.parse(saved).map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp) // Revive Date objects
            }));
        }
    } catch (e) {
        console.warn("Failed to load chat history", e);
    }
    return [];
  });

  const [liveInput, setLiveInput] = useState('');
  const [liveOutput, setLiveOutput] = useState('');
  
  // Learning Stats State - Initialized from LocalStorage with fallback safety
  const [learningStats, setLearningStats] = useState<LearningStats>(() => {
    const defaultStats: LearningStats = { understandingScore: 50, difficultyLevel: 'Beginner' };
    try {
        const saved = localStorage.getItem('lumi_learning_stats');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Verify structure to avoid null/undefined issues
            if (parsed && typeof parsed === 'object' && 'difficultyLevel' in parsed) {
                return parsed;
            }
        }
    } catch (e) {
        // ignore errors
    }
    return defaultStats;
  });

  // Persistence Effects
  useEffect(() => {
    try {
        localStorage.setItem('lumi_chat_history', JSON.stringify(messages));
    } catch (e) {
        console.warn("Failed to save chat history (quota exceeded?)", e);
    }
  }, [messages]);

  useEffect(() => {
    if (learningStats) {
        localStorage.setItem('lumi_learning_stats', JSON.stringify(learningStats));
    }
  }, [learningStats]);

  // Audio Context - Unified for Mobile Compatibility
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Processing Nodes
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  
  // API & Session
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RETRIES = 3;
  const isLiveRef = useRef(false); // Guard to prevent sending data before handshake

  // Playback Queue & Scheduling
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const audioQueueRef = useRef<Promise<void>>(Promise.resolve());

  // Video Frame Interval
  const videoIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Analyzers for visualization
  const inputAnalyzerRef = useRef<AnalyserNode | null>(null);
  const outputAnalyzerRef = useRef<AnalyserNode | null>(null);

  // Refs for accumulating transcript parts
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  
  // Track current resolution for tool calls
  const imageResolutionRef = useRef(imageResolution);

  useEffect(() => {
    imageResolutionRef.current = imageResolution;
  }, [imageResolution]);

  useEffect(() => {
    canvasRef.current = document.createElement('canvas');
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(async () => {
    isLiveRef.current = false;
    setIsAiSpeaking(false);

    // Cleanup audio nodes
    if (inputSourceRef.current) {
        try { inputSourceRef.current.disconnect(); } catch(e) {}
        inputSourceRef.current = null;
    }
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch(e) {}
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    
    // CRITICAL: Clear analyzers and gain nodes so they aren't reused with the wrong AudioContext
    if (inputAnalyzerRef.current) {
        try { inputAnalyzerRef.current.disconnect(); } catch(e) {}
        inputAnalyzerRef.current = null;
    }
    if (outputAnalyzerRef.current) {
        try { outputAnalyzerRef.current.disconnect(); } catch(e) {}
        outputAnalyzerRef.current = null;
    }
    if (outputGainNodeRef.current) {
        try { outputGainNodeRef.current.disconnect(); } catch(e) {}
        outputGainNodeRef.current = null;
    }
    
    // Stop output sources
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { /* ignore */ }
    });
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    audioQueueRef.current = Promise.resolve(); // Reset queue

    // Close AudioContext
    if (audioContextRef.current?.state !== 'closed') {
      try {
        await audioContextRef.current?.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }

    // Clear video interval
    if (videoIntervalRef.current) {
      window.clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }

    // Close session gracefully
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            try {
                if (typeof session.close === 'function') {
                    session.close();
                }
            } catch (e) {
                console.warn("Error closing session", e);
            }
        });
        sessionPromiseRef.current = null;
    }

    setStatus(ConnectionStatus.DISCONNECTED);
    setLiveInput('');
    setLiveOutput('');
    currentInputRef.current = '';
    currentOutputRef.current = '';
  }, []);

  const playFeedbackSound = useCallback((type: 'success' | 'notification') => {
    const ctx = audioContextRef.current;
    if (!ctx || ctx.state === 'closed') return;
    
    try {
        // Create oscillator and gain node
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        const now = ctx.currentTime;
        
        if (type === 'success') {
          // Magic sparkle sound (Arpeggio sweep)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.linearRampToValueAtTime(1046.50, now + 0.1); // C6
          
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          
          osc.start(now);
          osc.stop(now + 0.5);
        } else {
          // Notification blip (Level up/Stat update)
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now); // A4
          osc.frequency.setValueAtTime(880, now + 0.08); // A5
          
          gainNode.gain.setValueAtTime(0.03, now);
          gainNode.gain.linearRampToValueAtTime(0.001, now + 0.15);
          
          osc.start(now);
          osc.stop(now + 0.15);
        }
    } catch (e) {
        console.warn("Could not play feedback sound", e);
    }
  }, []);

  const toggleMessageProperty = useCallback((id: string, property: 'isFavorite' | 'isFlagged') => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, [property]: !msg[property] } : msg
    ));
  }, []);

  const sendTextMessage = useCallback((text: string, mode: 'chat' | 'instruction' = 'chat') => {
    if (!text.trim()) return;

    // Prepare payload
    let textPayload = text;
    
    // If it's an instruction, prepend the director tag
    if (mode === 'instruction') {
        textPayload = `[DIRECTOR]: ${text}`;
        
        // Add to chat history as a system message (invisible to "student", visible to "teacher")
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            text: `(Director) ${text}`,
            timestamp: new Date()
        }]);
    } else {
        // Normal chat simulation
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            timestamp: new Date()
        }]);
    }

    sessionPromiseRef.current?.then(session => {
       // Attempt to send text via standard `send` if available
       if (typeof (session as any).send === 'function') {
         (session as any).send({
            client_content: {
                turns: [{ role: 'user', parts: [{ text: textPayload }] }],
                turn_complete: true
            }
         });
       } 
       // Fallback
       else if (typeof session.sendRealtimeInput === 'function') {
         (session as any).sendRealtimeInput({
            content: {
                role: 'user',
                parts: [{ text: textPayload }]
            }
         });
       } else {
         console.warn("Could not find a method to send text.");
       }
    }).catch(err => {
      console.error("Failed to send text message:", err);
    });
  }, []);

  const sendUploadedImage = useCallback((base64Data: string, mimeType: string) => {
    if (!base64Data) return;

    // Add to chat history as a user upload
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: '📄 Uploaded an image assignment',
      image: `data:${mimeType};base64,${base64Data}`,
      timestamp: new Date()
    }]);

    // Send to Gemini Live session
    sessionPromiseRef.current?.then(session => {
        session.sendRealtimeInput({
            media: {
                mimeType: mimeType,
                data: base64Data
            }
        });
    }).catch(err => {
        console.error("Failed to upload image:", err);
    });
  }, []);

  const connect = useCallback(async () => {
    if (!profile) return;
    
    const hasEnvKey = !!process.env.API_KEY;
    const hasAiStudio = !!(window as any).aistudio;

    if (!hasEnvKey && !hasAiStudio) {
      alert("API Key is missing! Check API_KEY in your .env file.");
      setStatus(ConnectionStatus.ERROR);
      return;
    }

    if (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR) {
       reconnectAttemptsRef.current = 0;
    }
    isLiveRef.current = false;

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ latencyHint: 'interactive' });
    }

    try {
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
    } catch (e) {
        console.warn("Audio Context resume failed", e);
    }

    const establishConnection = async () => {
        try {
            setStatus(ConnectionStatus.CONNECTING);
            
            const win = window as any;
            if (win.aistudio) {
                const hasKey = await win.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                await win.aistudio.openSelectKey();
                }
            }

            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

            const ctx = audioContextRef.current!;

            if (!inputAnalyzerRef.current) inputAnalyzerRef.current = ctx.createAnalyser();
            if (!outputAnalyzerRef.current) outputAnalyzerRef.current = ctx.createAnalyser();
            
            if (!outputGainNodeRef.current) {
                outputGainNodeRef.current = ctx.createGain();
                outputGainNodeRef.current.connect(outputAnalyzerRef.current!);
                outputAnalyzerRef.current!.connect(ctx.destination);
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000, 
                } 
            });
            
            const systemInstructionText = `
                You are Lumi, a magical, high-energy AI tutor for ${profile.name} (${profile.grade}).
                
                CORE IDENTITY:
                - You are a friendly, encouraging mentor.
                - You speak quickly, clearly, and with enthusiasm.
                - You NEVER start by saying "Hello" or "Hi" yourself. Wait for the user to speak first.
                
                SUPERVISOR OVERRIDE:
                - If you receive a message starting with "[DIRECTOR]:", this is a hidden instruction from a teacher/parent.
                - Do NOT read the instruction out loud.
                - IMMEDIATELY adjust your behavior or teaching style based on the instruction.
                - Example: "[DIRECTOR]: Give him a hint" -> You say: "Here's a clue to help you get started..."
                
                VISION CAPABILITY:
                - You can SEE. You receive video frames of the user and their environment.
                - You can also receive UPLOADED IMAGES (assignments, worksheets).
                - INTERACT VISUALLY: If the user shows you a book, worksheet, or object, describe it and use it in your teaching.
                - If the camera is on but you don't see anything specific, just chat face-to-face.

                STARTUP TASK:
                - Wait for the user to speak. Once they do, ask: "How much homework do you have today, and what subjects are they in?"
                
                ADAPTIVE LEARNING PROTOCOL:
                1. TRACKING: Continuously assess ${profile.name}'s understanding (0-100%).
                2. DIFFICULTY ADJUSTMENT: Beginner (0-40%), Intermediate (41-75%), Advanced (76-100%).
                3. CHECKPOINTS: Every 3-4 turns, ask a specific "Check for Understanding" question.
                4. VISUALS: Use 'generate_educational_image' proactively for visual topics.
                
                CHAIN OF THOUGHT (CoT):
                1. ANALYZE user input.
                2. CALCULATE understanding score.
                3. CALL 'update_student_progress'.
                4. PLAN explanation.
                5. SPEAK.
                
                RULES:
                - Keep verbal responses concise (max 3 sentences).
                - Use analogies related to ${profile.learningStyle} learning.
                - Be extra patient with ${profile.struggleTopic}.
            `;

            const config = {
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                onopen: async () => {
                    console.log("Session connected");
                    reconnectAttemptsRef.current = 0; 
                    setStatus(ConnectionStatus.CONNECTED);
                    
                    setTimeout(() => {
                        sessionPromiseRef.current?.then(session => {
                            if ((session as any).send) {
                                (session as any).send({ 
                                    client_content: {
                                        turns: [{ role: 'user', parts: [{ text: `Hello! I am ${profile.name}.` }] }],
                                        turn_complete: true
                                    } 
                                });
                            }
                            isLiveRef.current = true;
                        });
                    }, 500);
                    
                    const currentCtx = audioContextRef.current;
                    if (!currentCtx) return;
                    
                    inputSourceRef.current = currentCtx.createMediaStreamSource(stream);
                    inputSourceRef.current.connect(inputAnalyzerRef.current!); 
                    
                    processorRef.current = currentCtx.createScriptProcessor(4096, 1, 1);
                    
                    processorRef.current.onaudioprocess = (e) => {
                        if (isMuted || !isLiveRef.current) return; 
                        
                        const inputData = e.inputBuffer.getChannelData(0);
                        const downsampledData = downsampleTo16000(inputData, currentCtx.sampleRate);
                        const pcmBlob = createPcmBlob(downsampledData);
                        
                        sessionPromiseRef.current?.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    inputSourceRef.current.connect(processorRef.current);
                    
                    const silenceNode = currentCtx.createGain();
                    silenceNode.gain.value = 0;
                    processorRef.current.connect(silenceNode);
                    silenceNode.connect(currentCtx.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const serverContent = message.serverContent;
                    
                    const hasModelAudio = message.serverContent?.modelTurn?.parts?.some(p => p.inlineData);
                    const hasModelText = !!message.serverContent?.outputTranscription;

                    if ((hasModelAudio || hasModelText) && currentInputRef.current.trim()) {
                        const newMsg: Message = {
                            id: Date.now().toString(),
                            role: 'user',
                            text: currentInputRef.current.trim(),
                            timestamp: new Date()
                        };
                        setMessages(prev => [...prev, newMsg]);
                        currentInputRef.current = '';
                        setLiveInput('');
                    }

                    const parts = message.serverContent?.modelTurn?.parts || [];
                    for (const part of parts) {
                        if (part.inlineData?.data && audioContextRef.current && outputGainNodeRef.current) {
                            const base64Audio = part.inlineData.data;
                            
                            audioQueueRef.current = audioQueueRef.current.then(async () => {
                                if (!audioContextRef.current || !outputGainNodeRef.current) return;
                                const ctx = audioContextRef.current;
                                
                                const bufferingDelay = 0.08; 
                                if (nextStartTimeRef.current < ctx.currentTime) {
                                    nextStartTimeRef.current = ctx.currentTime + bufferingDelay;
                                }

                                try {
                                    const audioBuffer = await decodeAudioData(
                                        base64ToUint8Array(base64Audio),
                                        ctx,
                                        24000, 
                                        1
                                    );

                                    const segmentGain = ctx.createGain();
                                    segmentGain.gain.value = 1;

                                    const source = ctx.createBufferSource();
                                    source.buffer = audioBuffer;
                                    
                                    source.connect(segmentGain);
                                    segmentGain.connect(outputGainNodeRef.current);

                                    const startTime = nextStartTimeRef.current;
                                    const fadeDuration = 0.005; 
                                    
                                    segmentGain.gain.setValueAtTime(0, startTime);
                                    segmentGain.gain.linearRampToValueAtTime(1, startTime + fadeDuration);
                                    
                                    source.addEventListener('ended', () => {
                                        audioSourcesRef.current.delete(source);
                                        if (audioSourcesRef.current.size === 0) {
                                          setIsAiSpeaking(false);
                                        }
                                        
                                        setTimeout(() => {
                                          try {
                                            source.disconnect();
                                            segmentGain.disconnect();
                                          } catch(e) {}
                                        }, 100);
                                    });
                                    
                                    source.start(startTime);
                                    nextStartTimeRef.current += audioBuffer.duration;
                                    audioSourcesRef.current.add(source);
                                    setIsAiSpeaking(true); 
                                } catch (e) {
                                    console.error("Error decoding audio", e);
                                }
                            });
                        }
                    }

                    if (message.toolCall) {
                        for (const fc of message.toolCall.functionCalls) {
                            if (fc.name === 'generate_educational_image') {
                                const prompt = (fc.args as any).prompt;
                                setMessages(prev => [...prev, {
                                    id: Date.now().toString(),
                                    role: 'system',
                                    text: `🎨 Drawing: "${prompt}"...`,
                                    timestamp: new Date()
                                }]);

                                const generateImage = async () => {
                                    try {
                                        if (!aiRef.current) throw new Error("AI Client not initialized");

                                        const enhancedPrompt = `Educational illustration, clear, high-contrast, simple background: ${prompt}`;

                                        const result = await aiRef.current.models.generateContent({
                                            model: 'gemini-2.5-flash-image', 
                                            contents: { parts: [{ text: enhancedPrompt }] },
                                            config: {
                                                imageConfig: {
                                                    aspectRatio: "16:9" 
                                                }
                                            }
                                        });

                                        let base64Image = null;
                                        for (const candidate of result.candidates || []) {
                                            for (const part of candidate.content?.parts || []) {
                                                if (part.inlineData) {
                                                    base64Image = part.inlineData.data;
                                                    break;
                                                }
                                            }
                                            if (base64Image) break;
                                        }

                                        if (base64Image) {
                                            const imageUrl = `data:image/png;base64,${base64Image}`;
                                            playFeedbackSound('success'); 
                                            setMessages(prev => [...prev, {
                                                id: Date.now().toString(),
                                                role: 'assistant',
                                                text: `Here is a visualization for: ${prompt}`,
                                                image: imageUrl,
                                                timestamp: new Date()
                                            }]);

                                            sessionPromiseRef.current?.then(session => {
                                                session.sendToolResponse({
                                                    functionResponses: [{
                                                        id: fc.id,
                                                        name: fc.name,
                                                        response: { result: "Image displayed." }
                                                    }]
                                                });
                                            });
                                        } else {
                                            throw new Error("No image data returned from model");
                                        }
                                    } catch (err: any) {
                                        console.error("Image gen failed", err);
                                        let errorMsg = "Image generation failed.";
                                        
                                        if (err.message?.includes('429')) {
                                            errorMsg = "⚠️ Image quota exceeded. Try again later.";
                                        } else if (err.message?.includes('403')) {
                                            errorMsg = "⚠️ Permission denied for Image Generation. Check API Key billing/permissions.";
                                        }

                                        setMessages(prev => [...prev, {
                                            id: Date.now().toString(),
                                            role: 'system',
                                            text: errorMsg,
                                            timestamp: new Date()
                                        }]);
                                        
                                        sessionPromiseRef.current?.then(session => {
                                            session.sendToolResponse({
                                                functionResponses: [{
                                                    id: fc.id,
                                                    name: fc.name,
                                                    response: { result: "Image generation failed. Apologize to the user." }
                                                }]
                                            });
                                        });
                                    }
                                };
                                await generateImage();
                            }

                            if (fc.name === 'update_student_progress') {
                                const score = (fc.args as any).score;
                                const difficulty = (fc.args as any).difficulty;
                                const reason = (fc.args as any).reason;

                                setLearningStats({
                                    understandingScore: score,
                                    difficultyLevel: difficulty,
                                    lastUpdateReason: reason
                                });
                                
                                playFeedbackSound('notification'); 

                                sessionPromiseRef.current?.then(session => {
                                    session.sendToolResponse({
                                        functionResponses: [{
                                            id: fc.id,
                                            name: fc.name,
                                            response: { result: "Dashboard updated." }
                                        }]
                                    });
                                });
                            }
                        }
                    }

                    if (serverContent) {
                        if (serverContent.inputTranscription?.text) {
                            currentInputRef.current += serverContent.inputTranscription.text;
                            setLiveInput(currentInputRef.current);
                        }
                        if (serverContent.outputTranscription?.text) {
                            currentOutputRef.current += serverContent.outputTranscription.text;
                            setLiveOutput(currentOutputRef.current);
                        }
                        
                        if (serverContent.turnComplete) {
                            if (currentInputRef.current.trim()) {
                                const newMsg: Message = {
                                    id: Date.now().toString() + Math.random().toString().slice(2,5),
                                    role: 'user',
                                    text: currentInputRef.current.trim(),
                                    timestamp: new Date()
                                };
                                setMessages(prev => [...prev, newMsg]);
                                currentInputRef.current = '';
                                setLiveInput('');
                            }
                            if (currentOutputRef.current.trim()) {
                                const newMsg: Message = {
                                    id: Date.now().toString() + Math.random().toString().slice(2,5),
                                    role: 'assistant',
                                    text: currentOutputRef.current.trim(),
                                    timestamp: new Date()
                                };
                                setMessages(prev => [...prev, newMsg]);
                                currentOutputRef.current = '';
                                setLiveOutput('');
                            }
                        }
                    }
                    
                    if (message.serverContent?.interrupted) {
                        audioSourcesRef.current.forEach(src => src.stop());
                        audioSourcesRef.current.clear();
                        setIsAiSpeaking(false);
                        nextStartTimeRef.current = 0;
                        audioQueueRef.current = Promise.resolve(); 
                        
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
                    console.log("Session closed");
                    isLiveRef.current = false;
                    setIsAiSpeaking(false);
                    setStatus(ConnectionStatus.DISCONNECTED);
                },
                onerror: (err: any) => {
                    console.error("Gemini Live Error:", err);
                    isLiveRef.current = false;
                    setIsAiSpeaking(false);
                    
                    if (err.message?.includes('403')) {
                        setMessages(prev => [...prev, {
                            id: Date.now().toString(),
                            role: 'system',
                            text: "⚠️ Permission Denied. Check API Key.",
                            timestamp: new Date()
                        }]);
                        setStatus(ConnectionStatus.ERROR);
                    } else {
                        if (reconnectAttemptsRef.current < MAX_RETRIES) {
                            reconnectAttemptsRef.current++;
                            console.log(`Connection error. Retrying ${reconnectAttemptsRef.current}/${MAX_RETRIES}...`);
                            setStatus(ConnectionStatus.CONNECTING);
                            disconnect().then(() => {
                                setTimeout(establishConnection, 2000);
                            });
                        } else {
                            setStatus(ConnectionStatus.ERROR);
                        }
                    }
                }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ functionDeclarations: [generateImageTool, updateProgressTool] }],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } }
                    },
                    systemInstruction: {
                        parts: [{ text: systemInstructionText }]
                    }
                }
            };

            const sessionPromise = aiRef.current.live.connect(config);
            sessionPromiseRef.current = sessionPromise;

        } catch (error) {
            console.error("Connection setup failed", error);
            if (reconnectAttemptsRef.current < MAX_RETRIES) {
                reconnectAttemptsRef.current++;
                console.log(`Setup failed. Retrying ${reconnectAttemptsRef.current}/${MAX_RETRIES}...`);
                setStatus(ConnectionStatus.CONNECTING);
                disconnect().then(() => {
                    setTimeout(establishConnection, 2000);
                });
            } else {
                setStatus(ConnectionStatus.ERROR);
            }
        }
    };

    await establishConnection();

  }, [profile, isMuted, disconnect, playFeedbackSound]);

  useEffect(() => {
    if (isVideoActive && status === ConnectionStatus.CONNECTED && videoRef.current && canvasRef.current && isLiveRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const video = videoRef.current;

      videoIntervalRef.current = window.setInterval(() => {
        if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
          canvasRef.current!.width = video.videoWidth;
          canvasRef.current!.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
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
      }, 500); 
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
    liveOutput,
    learningStats,
    sendTextMessage,
    sendUploadedImage,
    toggleMessageProperty,
    isAiSpeaking
  };
};
