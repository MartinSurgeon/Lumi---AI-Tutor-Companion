import React, { useEffect, useRef } from 'react';

interface WaveformProps {
  analyzer: AnalyserNode | null;
  isListening: boolean;
  color: string;
}

const Waveform: React.FC<WaveformProps> = ({ analyzer, isListening, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyzer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestRef.current = requestAnimationFrame(draw);

      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dynamic styling based on listening state
      if (!isListening) {
        // Gentle pulse when idle
        const time = Date.now() * 0.002;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 5 + Math.sin(time) * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
        return;
      }

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Mirror effect for symmetry
        ctx.fillStyle = color;
        
        // Top bars
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [analyzer, isListening, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={100} 
      className="w-full h-full"
    />
  );
};

export default Waveform;