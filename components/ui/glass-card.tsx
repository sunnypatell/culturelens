"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  blur?: string;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  gradient = "from-white/10 to-white/5",
  blur = "md",
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-6",
        "bg-gradient-to-br",
        gradient,
        "backdrop-blur-" + blur,
        "border border-white/20",
        "shadow-xl shadow-black/10",
        "transition-all duration-300",
        "hover:shadow-2xl hover:shadow-black/20",
        "hover:border-white/30",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="relative z-10">{children}</div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </motion.div>
  );
}

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
}

export function GradientCard({
  children,
  className,
  gradientFrom = "#6366f1",
  gradientTo = "#8b5cf6",
  onClick,
}: GradientCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -8 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative rounded-3xl p-1",
        "bg-gradient-to-br",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <div className="relative rounded-[22px] bg-background p-6 h-full">
        <div className="relative z-10">{children}</div>
      </div>

      {/* Glow effect */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-50 blur-xl transition-opacity group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          zIndex: -1,
        }}
      />
    </motion.div>
  );
}
