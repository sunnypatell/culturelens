"use client";

import { useEffect, useRef, useState } from "react";

interface AdvancedWaveformProps {
  isRecording: boolean;
  isPaused?: boolean;
  amplitudeData?: number[];
}

export function AdvancedWaveform({
  isRecording,
  isPaused = false,
  amplitudeData,
}: AdvancedWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [bars, setBars] = useState<number[]>(Array(80).fill(0));
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      if (!isRecording || isPaused) {
        // Idle state - gentle wave
        const newBars = bars.map((_, i) => {
          const idle = Math.sin(timeRef.current * 0.02 + i * 0.2) * 0.15 + 0.15;
          return idle;
        });
        setBars(newBars);
      } else {
        // Recording state - dynamic bars
        const newBars = bars.map((_, i) => {
          if (amplitudeData && amplitudeData[i] !== undefined) {
            return amplitudeData[i];
          }
          // Simulate realistic voice amplitude
          const wave = Math.sin(timeRef.current * 0.05 + i * 0.3) * 0.3;
          const noise = Math.random() * 0.4;
          const peak = Math.sin(timeRef.current * 0.02) * 0.3;
          return Math.max(0.1, Math.min(1, 0.4 + wave + noise + peak));
        });
        setBars(newBars);
      }

      // Draw bars with gradient
      const barWidth = width / bars.length;
      const centerY = height / 2;

      bars.forEach((amplitude, i) => {
        const x = i * barWidth;
        const barHeight = amplitude * height * 0.8;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(
          x,
          centerY - barHeight / 2,
          x,
          centerY + barHeight / 2
        );

        if (isRecording && !isPaused) {
          // Active recording - vibrant colors
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.9)");
          gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.95)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.9)");
        } else {
          // Idle - muted colors
          gradient.addColorStop(0, "rgba(148, 163, 184, 0.4)");
          gradient.addColorStop(0.5, "rgba(148, 163, 184, 0.5)");
          gradient.addColorStop(1, "rgba(148, 163, 184, 0.4)");
        }

        ctx.fillStyle = gradient;

        // Draw bar with rounded caps
        const radius = barWidth * 0.3;
        ctx.beginPath();
        ctx.roundRect(
          x + barWidth * 0.1,
          centerY - barHeight / 2,
          barWidth * 0.8,
          barHeight,
          radius
        );
        ctx.fill();

        // Add glow effect when recording
        if (isRecording && !isPaused && amplitude > 0.6) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = "rgba(99, 102, 241, 0.6)";
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      timeRef.current++;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, isPaused, bars, amplitudeData]);

  return (
    <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800">
      <canvas ref={canvasRef} className="w-full h-full" />
      {isRecording && !isPaused && (
        <div className="absolute top-3 right-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Recording
        </div>
      )}
      {isPaused && (
        <div className="absolute top-3 right-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          Paused
        </div>
      )}
    </div>
  );
}
