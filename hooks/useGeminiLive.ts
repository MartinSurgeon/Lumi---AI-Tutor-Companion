
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
  
  // Transcription State
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveInput, setLiveInput] = useState('');
  const [liveOutput, setLiveOutput] = useState('');
  
  // Learning Stats State
  const [learningStats, setLearningStats] = useState<LearningStats>({
    understandingScore: 50,
    difficultyLevel: 'Beginner',
  });

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

  // Playback Queue
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

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

    // Cleanup audio nodes
    if (inputSourceRef.current) {
        try { inputSourceRef.current.disconnect(); } catch(e) {}
    }
    if (processorRef.current) {
      try { processorRef.current.disconnect(); } catch(e) {}
      processorRef.current.onaudioprocess = null;
    }
    
    // Stop output sources
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { /* ignore */ }
    });
    audioSourcesRef.current.clear();

    // Close AudioContext
    if (audioContextRef.current?.state !== 'closed') {
      try {
        await audioContextRef.current?.close();
      } catch (e) {
        // ignore
      }
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
    if (!ctx) return;
    
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

  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Immediately add to local messages
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    }]);

    sessionPromiseRef.current?.then(session => {
       // Attempt to send text via standard `send` if available (casting to any to avoid strict interface blocks)
       if (typeof (session as any).send === 'function') {
         (session as any).send({
            client_content: {
                turns: [{ role: 'user', parts: [{ text }] }],
                turn_complete: true
            }
         });
       } 
       // Fallback: Try passing content via sendRealtimeInput (supported by some backend versions)
       else if (typeof session.sendRealtimeInput === 'function') {
         (session as any).sendRealtimeInput({
            content: {
                role: 'user',
                parts: [{ text }]
            }
         });
       } else {
         console.warn("Could not find a method to send text on the current session object.");
       }
    }).catch(err => {
      console.error("Failed to send text message:", err);
    });
  }, []);

  const connect = useCallback(async () => {
    if (!profile) return;
    
    // Reset retries if manually connecting
    if (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR) {
       reconnectAttemptsRef.current = 0;
    }
    isLiveRef.current = false;

    // Unified Audio Context for Mobile Compatibility
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ latencyHint: 'interactive' });
    }

    // Resume immediately to unlock audio on some browsers (User Gesture)
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
            
            // 1. Enforce API Key Selection
            const win = window as any;
            if (win.aistudio) {
                const hasKey = await win.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                await win.aistudio.openSelectKey();
                }
            }

            // 2. Initialize AI
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const ctx = audioContextRef.current!;

            // Setup Analyzers
            if (!inputAnalyzerRef.current) inputAnalyzerRef.current = ctx.createAnalyser();
            if (!outputAnalyzerRef.current) outputAnalyzerRef.current = ctx.createAnalyser();
            
            // Setup Output Node
            if (!outputGainNodeRef.current) {
                outputGainNodeRef.current = ctx.createGain();
                outputGainNodeRef.current.connect(outputAnalyzerRef.current!);
                outputAnalyzerRef.current!.connect(ctx.destination);
            }

            // Get Microphone Stream with Mobile-Friendly Constraints
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000, // Try to request 16k directly if possible
                } 
            });
            
            const systemInstructionText = `
                You are Lumi, a magical, high-energy AI tutor for ${profile.name} (${profile.grade}).
                
                CORE IDENTITY:
                - You are a friendly, encouraging mentor.
                - You speak quickly, clearly, and with enthusiasm.
                - You NEVER start by saying "Hello" or "Hi" yourself. Wait for the user to speak first.
                
                VISION CAPABILITY:
                - You can SEE. You receive video frames of the user and their environment.
                - INTERACT VISUALLY: If the user shows you a book, worksheet, or object, describe it and use it in your teaching.
                - Example: "I see you're holding a geometry worksheet. Let's look at problem 3 together!"
                - If the camera is on but you don't see anything specific, just chat face-to-face.

                STARTUP TASK:
                - Wait for the user to speak. Once they do, ask: "How much homework do you have today, and what subjects are they in?"
                
                ADAPTIVE LEARNING PROTOCOL:
                1. TRACKING: Continuously assess ${profile.name}'s understanding (0-100%).
                - Correct answer + explanation = +10-20% (Score goes up)
                - Correct answer only = +5-10%
                - Confusion/Wrong answer = -5-10% (Score goes down)
                2. DIFFICULTY ADJUSTMENT:
                - 0-40% Score: Beginner Mode (Simple words, many analogies, slow pace).
                - 41-75% Score: Intermediate Mode (Standard academic terms, normal pace).
                - 76-100% Score: Advanced Mode (Complex synthesis, challenge questions).
                3. CHECKPOINTS: Every 3-4 turns, ask a specific "Check for Understanding" question to verify they are following.
                4. VISUALS: Use 'generate_educational_image' proactively for visual topics.
                
                CHAIN OF THOUGHT (CoT):
                1. ANALYZE user input (audio and video).
                2. CALCULATE new understanding score.
                3. CALL 'update_student_progress' if the score or difficulty changes.
                4. PLAN the explanation based on the current Difficulty Level.
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
                    reconnectAttemptsRef.current = 0; // Reset retries on success
                    setStatus(ConnectionStatus.CONNECTED);
                    
                    // Send Initial Handshake - Greeting text
                    // Added delay to ensure socket is ready, THEN enable audio streaming
                    setTimeout(() => {
                        sessionPromiseRef.current?.then(session => {
                            // Try sending handshake text
                            if ((session as any).send) {
                                (session as any).send({ 
                                    client_content: {
                                        turns: [{ role: 'user', parts: [{ text: `Hello! I am ${profile.name}.` }] }],
                                        turn_complete: true
                                    } 
                                });
                            }
                            // Enable Audio Streaming AFTER handshake
                            isLiveRef.current = true;
                        });
                    }, 500);
                    
                    // Setup Microphone Logic
                    const currentCtx = audioContextRef.current;
                    if (!currentCtx) return;
                    
                    inputSourceRef.current = currentCtx.createMediaStreamSource(stream);
                    inputSourceRef.current.connect(inputAnalyzerRef.current!); 
                    
                    // Use ScriptProcessor for input capture (compatible with iOS/older browsers)
                    // Note: AudioWorklet is preferred for modern apps but harder to bundle in a single file
                    processorRef.current = currentCtx.createScriptProcessor(4096, 1, 1);
                    
                    processorRef.current.onaudioprocess = (e) => {
                        if (isMuted || !isLiveRef.current) return; // Block audio if not ready
                        
                        const inputData = e.inputBuffer.getChannelData(0);
                        const downsampledData = downsampleTo16000(inputData, currentCtx.sampleRate);
                        const pcmBlob = createPcmBlob(downsampledData);
                        
                        sessionPromiseRef.current?.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    inputSourceRef.current.connect(processorRef.current);
                    
                    // Silence node to prevent feedback & keep processor alive on iOS
                    const silenceNode = currentCtx.createGain();
                    silenceNode.gain.value = 0;
                    processorRef.current.connect(silenceNode);
                    silenceNode.connect(currentCtx.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const serverContent = message.serverContent;
                    
                    // 0. EARLY COMMIT: Detect if model is starting to respond
                    const hasModelAudio = message.serverContent?.modelTurn?.parts?.some(p => p.inlineData);
                    const hasModelText = !!message.serverContent?.outputTranscription;

                    if ((hasModelAudio || hasModelText) && currentInputRef.current.trim()) {
                        setMessages(prev => [...prev, {
                            id: Date.now().toString(),
                            role: 'user',
                            text: currentInputRef.current.trim(),
                            timestamp: new Date()
                        }]);
                        currentInputRef.current = '';
                        setLiveInput('');
                    }

                    // 1. Audio Output with Fade Envelope
                    const parts = message.serverContent?.modelTurn?.parts || [];
                    for (const part of parts) {
                        if (part.inlineData?.data && audioContextRef.current && outputGainNodeRef.current) {
                            const base64Audio = part.inlineData.data;
                            const ctx = audioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            try {
                                const audioBuffer = await decodeAudioData(
                                    base64ToUint8Array(base64Audio),
                                    ctx,
                                    24000, 
                                    1
                                );

                                // Create a dedicated gain node for this chunk's envelope
                                const segmentGain = ctx.createGain();
                                segmentGain.gain.value = 1;

                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                
                                // Connect: Source -> SegmentGain -> MainGain -> Destination
                                source.connect(segmentGain);
                                segmentGain.connect(outputGainNodeRef.current);

                                const startTime = nextStartTimeRef.current;
                                const endTime = startTime + audioBuffer.duration;
                                const fadeDuration = 0.05; // 50ms fade-out

                                // Anti-click Fade-in (10ms)
                                segmentGain.gain.setValueAtTime(0, startTime);
                                segmentGain.gain.linearRampToValueAtTime(1, startTime + 0.01);
                                
                                // Smooth Fade-out (50ms)
                                if (audioBuffer.duration > fadeDuration) {
                                  segmentGain.gain.setValueAtTime(1, endTime - fadeDuration);
                                  segmentGain.gain.linearRampToValueAtTime(0, endTime);
                                }

                                source.addEventListener('ended', () => {
                                    audioSourcesRef.current.delete(source);
                                    // Disconnect nodes to free memory
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
                            } catch (e) {
                                console.error("Error decoding audio", e);
                            }
                        }
                    }

                    // 2. Tool Calls
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
                                        const imageAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
                                        const result = await imageAi.models.generateContent({
                                            model: 'gemini-2.5-flash-image', 
                                            contents: { parts: [{ text: prompt }] },
                                        });

                                        let base64Image = null;
                                        for (const part of result.candidates?.[0]?.content?.parts || []) {
                                            if (part.inlineData) {
                                                base64Image = part.inlineData.data;
                                                break;
                                            }
                                        }

                                        if (base64Image) {
                                            const imageUrl = `data:image/png;base64,${base64Image}`;
                                            playFeedbackSound('success'); // Play magic sound
                                            setMessages(prev => [...prev, {
                                                id: Date.now().toString(),
                                                role: 'assistant',
                                                text: `Here is the image you asked for:`,
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
                                            throw new Error("No image data");
                                        }
                                    } catch (err) {
                                        console.error("Image gen failed", err);
                                        setMessages(prev => [...prev, {
                                            id: Date.now().toString(),
                                            role: 'system',
                                            text: `❌ Image failed.`,
                                            timestamp: new Date()
                                        }]);
                                        sessionPromiseRef.current?.then(session => {
                                            session.sendToolResponse({
                                                functionResponses: [{
                                                    id: fc.id,
                                                    name: fc.name,
                                                    response: { result: "Image failed." }
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
                                
                                playFeedbackSound('notification'); // Play notification blip

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

                    // 3. Transcription Handling
                    if (serverContent) {
                        if (serverContent.inputTranscription?.text) {
                            currentInputRef.current += serverContent.inputTranscription.text;
                            setLiveInput(currentInputRef.current);
                        }
                        if (serverContent.outputTranscription?.text) {
                            currentOutputRef.current += serverContent.outputTranscription.text;
                            setLiveOutput(currentOutputRef.current);
                        }
                        
                        // Handle turn completion
                        if (serverContent.turnComplete) {
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
                    
                    // 4. Interruption
                    if (message.serverContent?.interrupted) {
                        audioSourcesRef.current.forEach(src => src.stop());
                        audioSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
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
                    setStatus(ConnectionStatus.DISCONNECTED);
                },
                onerror: (err: any) => {
                    console.error("Gemini Live Error:", err);
                    isLiveRef.current = false;
                    
                    if (err.message?.includes('403')) {
                        setMessages(prev => [...prev, {
                            id: Date.now().toString(),
                            role: 'system',
                            text: "⚠️ Permission Denied. Check API Key.",
                            timestamp: new Date()
                        }]);
                        setStatus(ConnectionStatus.ERROR);
                    } else {
                        // Retry logic
                        if (reconnectAttemptsRef.current < MAX_RETRIES) {
                            reconnectAttemptsRef.current++;
                            console.log(`Connection error. Retrying ${reconnectAttemptsRef.current}/${MAX_RETRIES}...`);
                            setStatus(ConnectionStatus.CONNECTING);
                            // Cleanup then retry
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
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
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

  // Video Streaming Logic
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
      }, 500); // 2 FPS (500ms) for better interactivity
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
    toggleMessageProperty
  };
};
