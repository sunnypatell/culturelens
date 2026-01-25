"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { AdvancedWaveform } from "@/components/audio/advanced-waveform";
import { VoiceAgent } from "@/components/voice-agent";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";

type RecordingState =
  | "setup"
  | "agent"
  | "recording"
  | "paused"
  | "processing"
  | "results";

// delay for simulating processing time before showing results
const PROCESSING_DELAY_MS = 3000;

interface RecordingStudioProps {
  onNavigate?: (
    view: "home" | "record" | "library" | "insights" | "settings"
  ) => void;
  onViewInsights?: (sessionId: string) => void;
}

export function RecordingStudio({
  onNavigate,
  onViewInsights,
}: RecordingStudioProps = {}) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const [state, setState] = useState<RecordingState>("setup");
  const [duration, setDuration] = useState(0);
  const [_waveformData, setWaveformData] = useState<number[]>(
    Array(60).fill(0)
  );
  const [mounted, setMounted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [_agentSessionId, _setAgentSessionId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Session settings
  const [sessionTitle, setSessionTitle] = useState("");
  const [numberOfParticipants, setNumberOfParticipants] = useState("2 people");
  const [sessionType, setSessionType] = useState("Personal Conversation");

  // Analysis settings
  const [analysisMethod, setAnalysisMethod] = useState("standard");
  const [culturalContext, setCulturalContext] = useState<string[]>([]);
  const [sensitivityLevel, setSensitivityLevel] = useState([70]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state === "recording") {
      intervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
        setWaveformData((prev) => {
          const newData = [...prev.slice(1), Math.random() * 100];
          return newData;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const _startRecording = () => {
    setDuration(0);
    setState("recording");
  };

  const pauseRecording = () => {
    setState("paused");
  };

  const resumeRecording = () => {
    setState("recording");
  };

  const stopRecording = () => {
    setState("processing");
    setTimeout(() => {
      setState("results");
    }, PROCESSING_DELAY_MS);
  };

  const handleStartSession = async () => {
    // clear previous validation errors
    setValidationError(null);

    // validate required fields
    if (!sessionTitle.trim()) {
      setValidationError("session title is required");
      toast.error("session title is required");
      return;
    }

    if (sessionTitle.trim().length < 3) {
      setValidationError("session title must be at least 3 characters");
      toast.error("session title must be at least 3 characters");
      return;
    }

    try {
      setCreating(true);
      const token = await getIdToken();

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consent: {
            personA: true,
            personB: true,
            timestamp: new Date().toISOString(),
          },
          settings: {
            title: sessionTitle.trim(),
            sessionType,
            participantCount: parseInt(numberOfParticipants.split(" ")[0]),
            culturalContextTags: culturalContext,
            sensitivityLevel: sensitivityLevel[0] / 20,
            analysisMethod,
            storageMode: "transcriptOnly",
            voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("failed to create session");
      }

      const result = await response.json();
      setCurrentSessionId(result.data.id);

      console.log("[RecordingStudio] Session created:", result.data.id);
      toast.success("session created successfully");

      setState("agent");
    } catch (error) {
      console.error("[RecordingStudio] Session creation error:", error);
      toast.error("failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const toggleCulturalContext = (context: string) => {
    setCulturalContext((prev) =>
      prev.includes(context)
        ? prev.filter((c) => c !== context)
        : [...prev, context]
    );
  };

  if (state === "setup") {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div
            className={cn(
              "space-y-2",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-4 duration-700"
            )}
          >
            <h1 className="text-4xl font-bold text-foreground">
              Recording Studio
            </h1>
            <p className="text-lg text-muted-foreground">
              Set up your session before recording
            </p>
          </div>

          {/* Session Info */}
          <Card
            className={cn(
              "p-8",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
            )}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Session Information
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="session-title"
                  className="text-base font-medium"
                >
                  Session Title
                </Label>
                <input
                  id="session-title"
                  type="text"
                  placeholder="e.g., Team Meeting, Client Call, Brainstorming Session"
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    validationError
                      ? "border-destructive focus:ring-destructive"
                      : "border-input"
                  )}
                  value={sessionTitle}
                  onChange={(e) => {
                    setSessionTitle(e.target.value);
                    setValidationError(null);
                  }}
                />
                {validationError && (
                  <p className="text-sm text-destructive mt-1">
                    {validationError}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="participants"
                    className="text-base font-medium"
                  >
                    Number of Participants
                  </Label>
                  <select
                    id="participants"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={numberOfParticipants}
                    onChange={(e) => setNumberOfParticipants(e.target.value)}
                  >
                    <option>2 people</option>
                    <option>3 people</option>
                    <option>4 people</option>
                    <option>5+ people</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="session-type"
                    className="text-base font-medium"
                  >
                    Session Type
                  </Label>
                  <select
                    id="session-type"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                  >
                    <option>Personal Conversation</option>
                    <option>Professional Meeting</option>
                    <option>Interview</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Analysis Settings */}
          <Card
            className={cn(
              "p-8",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
            )}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Analysis Configuration
            </h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-medium">Analysis Depth</Label>
                <RadioGroup
                  value={analysisMethod}
                  onValueChange={setAnalysisMethod}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        analysisMethod === "quick"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="quick" id="quick" />
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">
                          Quick Scan
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Basic patterns and key moments
                        </div>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        analysisMethod === "standard"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="standard" id="standard" />
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">
                          Standard
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Comprehensive communication analysis
                        </div>
                      </div>
                    </label>
                    <label
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        analysisMethod === "deep"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value="deep" id="deep" />
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">
                          Deep Dive
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Detailed patterns with cultural context
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Cultural Context (Optional)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Help the AI understand relevant cultural communication norms
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Direct Communication",
                    "Indirect Communication",
                    "High Context",
                    "Low Context",
                    "Formal",
                    "Casual",
                    "Collaborative",
                    "Hierarchical",
                  ].map((context) => (
                    <Badge
                      key={context}
                      variant={
                        culturalContext.includes(context)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => toggleCulturalContext(context)}
                    >
                      {context}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">
                    Cultural Sensitivity Level
                  </Label>
                  <span className="text-sm font-medium text-primary">
                    {sensitivityLevel[0]}%
                  </span>
                </div>
                <Slider
                  value={sensitivityLevel}
                  onValueChange={setSensitivityLevel}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Higher sensitivity applies more cultural awareness to pattern
                  detection
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div
            className={cn(
              "flex items-center justify-between",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
            )}
          >
            <Button variant="outline" size="lg">
              Cancel
            </Button>
            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={creating}
              className="px-8"
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "agent") {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-bold text-foreground">
              Voice Agent Session
            </h1>
            <p className="text-lg text-muted-foreground">
              Interact with your ElevenLabs agent for culturally-aware
              communication analysis.
            </p>
          </div>

          {/* Voice Agent */}
          <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="space-y-4">
              <VoiceAgent
                sessionId={currentSessionId || undefined}
                onSessionId={_setAgentSessionId}
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <Button variant="outline" onClick={() => setState("setup")}>
              Back to Setup
            </Button>
            <Button
              onClick={() => {
                if (currentSessionId) {
                  onViewInsights?.(currentSessionId);
                }
              }}
              disabled={!currentSessionId}
              className="px-6"
            >
              View Analysis Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Animated gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5" />

        {/* Floating orbs background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 30, 0],
              x: [0, -20, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-2xl w-full px-8"
        >
          <div className="backdrop-blur-xl bg-background/30 border border-white/20 rounded-3xl p-12 space-y-8">
            {/* Animated icon */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto relative"
            >
              <Sparkles className="w-12 h-12 text-white" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-50 blur-xl animate-pulse" />
            </motion.div>

            {/* Text Generate Effect */}
            <div className="text-center space-y-4">
              <TextGenerateEffect
                words="Analyzing conversation patterns and cultural context"
                className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
                duration={0.8}
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="text-lg text-muted-foreground"
              >
                Our AI is processing your recording to extract meaningful
                insights and cultural observations
              </motion.p>
            </div>

            {/* Progress indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="space-y-3"
            >
              {[
                "Transcribing audio",
                "Identifying communication patterns",
                "Analyzing cultural context",
                "Generating insights",
              ].map((step, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 + index * 0.2, duration: 0.4 }}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                  />
                  {step}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state === "results") {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-bold text-foreground">
              Session Complete
            </h1>
            <p className="text-lg text-muted-foreground">
              Your recording has been processed. Use the voice agent below to
              hear your culturally-aware debrief.
            </p>
          </div>

          {/* Session Summary */}
          <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Session Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-bold text-foreground">
                  {formatTime(duration)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-xl font-bold text-foreground">2</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Analysis</p>
                <p className="text-xl font-bold text-foreground capitalize">
                  {analysisMethod}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Sensitivity</p>
                <p className="text-xl font-bold text-foreground">
                  {sensitivityLevel[0]}%
                </p>
              </div>
            </div>
          </Card>

          {/* Voice Agent Debrief */}
          <Card className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Audio Debrief
                </h2>
                <p className="text-sm text-muted-foreground">
                  Connect to the CultureLens voice agent to receive a neutral,
                  culturally-aware audio reflection of your conversation
                  patterns.
                </p>
              </div>
              <VoiceAgent sessionId={currentSessionId || undefined} />
              <p className="text-xs text-muted-foreground italic">
                CultureLens provides reflection, not advice or therapy.
                Interpretations are hypotheses, not facts.
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button
              variant="outline"
              onClick={() => {
                setState("setup");
                setDuration(0);
              }}
            >
              New Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Recording or Paused State
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Live Recording
            </h1>
            <p className="text-muted-foreground">Team Meeting Discussion</p>
          </div>
          <Badge
            variant={state === "recording" ? "default" : "secondary"}
            className="text-base px-4 py-2"
          >
            {state === "recording" ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                Recording
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                Paused
              </span>
            )}
          </Badge>
        </div>

        {/* Main Recording Card */}
        <Card className="p-12">
          <div className="space-y-12">
            {/* Timer */}
            <div className="text-center space-y-4">
              <div className="text-7xl font-bold text-foreground tabular-nums tracking-tight">
                {formatTime(duration)}
              </div>
              <p className="text-muted-foreground">Duration</p>
            </div>

            {/* Waveform Visualization */}
            <AdvancedWaveform
              isRecording={state === "recording"}
              isPaused={state === "paused"}
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              {state === "recording" ? (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={pauseRecording}
                    className="w-32 bg-transparent"
                  >
                    Pause
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopRecording}
                    className="w-32"
                  >
                    Stop
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" onClick={resumeRecording} className="w-32">
                    Resume
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopRecording}
                    className="w-32"
                  >
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-2xl font-bold text-foreground">2</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Speaking Turns</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.floor(duration / 5)}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Avg Turn Length</p>
              <p className="text-2xl font-bold text-foreground">12s</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-foreground">48/52</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
