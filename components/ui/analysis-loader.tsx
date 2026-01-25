"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FlipWords } from "./flip-words";
import { cn } from "@/lib/utils";
import {
  Brain,
  Sparkles,
  MessageSquare,
  BarChart3,
  Lightbulb,
} from "lucide-react";

interface AnalysisLoaderProps {
  className?: string;
  currentStep?: number;
  totalSteps?: number;
  showSteps?: boolean;
}

// fun quirky loading words that cycle through
const analysisWords = [
  "pondering",
  "cogitating",
  "analyzing",
  "contemplating",
  "deciphering",
  "investigating",
  "ruminating",
  "processing",
  "synthesizing",
  "connecting dots",
  "finding patterns",
  "brewing insights",
  "mapping culture",
  "reading vibes",
  "sensing tones",
];

// analysis steps with icons
const analysisSteps = [
  {
    icon: MessageSquare,
    label: "parsing transcript",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    label: "analyzing patterns",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: BarChart3,
    label: "calculating metrics",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Lightbulb,
    label: "generating insights",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Sparkles,
    label: "crafting debrief",
    color: "from-indigo-500 to-violet-500",
  },
];

export function AnalysisLoader({
  className,
  currentStep = 0,
  totalSteps = 5,
  showSteps = true,
}: AnalysisLoaderProps) {
  return (
    <div
      className={cn(
        "relative min-h-[400px] flex flex-col items-center justify-center overflow-hidden rounded-3xl",
        className
      )}
    >
      {/* animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* large primary orb */}
        <motion.div
          animate={{
            x: [0, 100, 50, -50, 0],
            y: [0, -50, 100, 50, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-3xl"
        />
        {/* secondary orb */}
        <motion.div
          animate={{
            x: [0, -80, 40, 80, 0],
            y: [0, 60, -40, 20, 0],
            scale: [1, 0.9, 1.3, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-500/20 via-blue-500/30 to-indigo-500/20 rounded-full blur-3xl"
        />
        {/* tertiary orb */}
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* glass container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-lg w-full mx-4"
      >
        {/* inner glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />

        {/* brain icon with pulse animation */}
        <motion.div
          className="relative flex justify-center mb-8"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative">
            {/* outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-xl"
            />
            {/* icon container */}
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-10 h-10 text-white" />
              {/* spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/50 border-r-white/30"
              />
            </div>
          </div>
        </motion.div>

        {/* main text with FlipWords */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
            gemini is{" "}
            <FlipWords
              words={analysisWords}
              duration={2000}
              className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-bold"
            />
          </h2>
          <p className="text-sm text-muted-foreground">
            analyzing cultural communication patterns...
          </p>
        </div>

        {/* step progress indicator */}
        {showSteps && (
          <div className="space-y-3">
            {analysisSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              const isPending = index > currentStep;

              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                    isActive &&
                      "bg-white/10 dark:bg-white/5 border border-white/20",
                    isComplete && "opacity-60",
                    isPending && "opacity-40"
                  )}
                >
                  {/* step icon */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      isActive && `bg-gradient-to-br ${step.color} shadow-lg`,
                      isComplete && "bg-green-500/20",
                      isPending && "bg-muted/50"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {isComplete ? (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-4 h-4 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4",
                              isActive ? "text-white" : "text-muted-foreground"
                            )}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* step label */}
                  <span
                    className={cn(
                      "text-sm font-medium flex-1",
                      isActive && "text-foreground",
                      isComplete && "text-muted-foreground line-through",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>

                  {/* loading dots for active step */}
                  {isActive && (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color}`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* progress bar at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 h-1 bg-muted/30 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          />
        </motion.div>

        {/* fun fact or tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 text-xs text-center text-muted-foreground/70 italic"
        >
          💡 tip: cultural communication patterns reveal how we connect across
          differences
        </motion.p>
      </motion.div>
    </div>
  );
}

// simpler inline loader for smaller spaces
export function AnalysisLoaderCompact({ className }: { className?: string }) {
  const compactWords = [
    "pondering...",
    "analyzing...",
    "thinking...",
    "processing...",
    "synthesizing...",
  ];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500"
      />
      <span className="text-sm text-muted-foreground">
        gemini is{" "}
        <FlipWords
          words={compactWords}
          duration={1500}
          className="text-indigo-500 dark:text-indigo-400 font-medium"
        />
      </span>
    </div>
  );
}
