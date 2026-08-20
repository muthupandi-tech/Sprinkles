"use client";

import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
  isPaused: boolean;
}

export function WaveformVisualizer({ analyser, isRecording, isPaused }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fix high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // If paused, we don't request new frames but keep the last drawing
      if (isPaused) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // If not recording, we can draw a flat line or just stop
      if (!isRecording) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        // Draw flat line
        ctx.fillStyle = "rgba(100, 116, 139, 0.2)"; // Slate 500 light
        ctx.fillRect(0, rect.height / 2 - 1, rect.width, 2);
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);

      const barWidth = (rect.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // scale down a bit to fit canvas height

        // Gradient based on height
        const gradient = ctx.createLinearGradient(0, rect.height, 0, 0);
        gradient.addColorStop(0, "#3b82f6"); // blue-500
        gradient.addColorStop(1, "#8b5cf6"); // violet-500

        ctx.fillStyle = gradient;
        
        // Draw centered vertically
        const y = (rect.height - barHeight) / 2;
        
        // Rounded top and bottom would be nice, but fillRect is faster
        // Using roundRect for a premium look
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth - 1, barHeight || 2, 5); // 5px radius, ensure min height 2
        } else {
            ctx.rect(x, y, barWidth - 1, barHeight || 2);
        }
        ctx.fill();

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isRecording, isPaused]);

  return (
    <div className="w-full h-24 bg-slate-50/50 rounded-2xl p-2 border border-slate-100 flex items-center justify-center overflow-hidden relative shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {!isRecording && !isPaused && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-400">
          Ready to record
        </div>
      )}
    </div>
  );
}
