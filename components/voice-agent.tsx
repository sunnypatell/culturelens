"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Orb, type AgentState } from "@/components/ui/orb";
import { motion, AnimatePresence } from "framer-motion";
import { clientLogger } from "@/lib/client-logger";

// Public agent ID — exposed to browser via NEXT_PUBLIC_ prefix.
// For public agents, no signed URL is needed — connects directly.
// Docs: https://elevenlabs.io/docs/agents-platform/libraries/react
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

// validate critical environment variable
if (typeof window !== "undefined" && !AGENT_ID) {
  throw new Error(
    "missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID environment variable. " +
      "please add it to your .env file. " +
      "see README.md for setup instructions."
  );
}

// Natural-sounding free voices (pre-made by ElevenLabs)
// These are available on free tier and sound conversational
const VOICES = [
  {
    id: "21m00Tcm4TlvDq8ikWAM", // Rachel - conversational, friendly
    name: "Rachel",
    gender: "Female",
    description: "Warm, conversational (recommended)",
  },
  {
    id: "pNInz6obpgDQGcFmaJgB", // Drew - male, warm
    name: "Drew",
    gender: "Male",
    description: "Approachable, natural pacing",
  },
  {
    id: "2EiwWnXFnvU5JabPnv8n", // Clyde - male, calm
    name: "Clyde",
    gender: "Male",
    description: "Calm, thoughtful",
  },
  {
    id: "MF3mGyEYCl7XYWbV9V6O", // Elli - female, energetic
    name: "Elli",
    gender: "Female",
    description: "Energetic, engaging",
  },
];
type VoiceAgentProps = {
  sessionId?: string;
  onSessionId?: (sessionId: string) => void;
};

export function VoiceAgent({
  sessionId: providedSessionId,
  onSessionId,
}: VoiceAgentProps) {
  const { getIdToken } = useAuth();
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id); // Default to Rachel
  const [useAgentVoice, setUseAgentVoice] = useState(true); // Use agent's preset voice by default
  const [transcript, setTranscript] = useState<string[]>([]);
  // use provided sessionId directly, or generate fallback only if truly not provided
  const [sessionId, setSessionId] = useState(
    () => providedSessionId || `session-${Date.now()}`
  );
  const transcriptRef = useRef<string[]>([]);

  // sync sessionId when providedSessionId changes (important for proper transcript saving)
  useEffect(() => {
    if (providedSessionId && providedSessionId !== sessionId) {
      clientLogger.info(
        `[VoiceAgent] Syncing sessionId: ${sessionId} -> ${providedSessionId}`
      );
      setSessionId(providedSessionId);
    }
  }, [providedSessionId, sessionId]);

  // Keep the ref in sync with the state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    onSessionId?.(sessionId);
  }, [onSessionId, sessionId]);

  // ElevenLabs SDK callback types (from docs):
  // onConnect: (props: { conversationId: string }) => void
  // onDisconnect: (details: { reason: "user" | "agent" | "error" }) => void
  // onMessage: (props: { message: string; source: "user" | "agent" }) => void
  // onError: (error: string | Error) => void
  // onModeChange: (mode: { mode: "listening" | "speaking" }) => void
  // onStatusChange: (status: "connected" | "disconnected" | "connecting") => void

  const conversation = useConversation({
    onConnect: (props: { conversationId: string }) => {
      clientLogger.info("[VoiceAgent] Connected to ElevenLabs", {
        conversationId: props.conversationId,
        timestamp: new Date().toISOString(),
      });
      setStatus("connected");
    },
    onDisconnect: (details: { reason?: "user" | "agent" | "error" }) => {
      const reason = details?.reason || "unknown";
      clientLogger.info("[VoiceAgent] Disconnected from ElevenLabs", {
        reason,
        reasonExplanation:
          reason === "user"
            ? "user initiated disconnect"
            : reason === "agent"
              ? "agent ended conversation"
              : reason === "error"
                ? "error occurred during session"
                : "unknown disconnection reason",
        hadTranscript: transcriptRef.current.length > 0,
        transcriptLength: transcriptRef.current.length,
        timestamp: new Date().toISOString(),
      });
      setStatus("idle");
      // Save final transcript when disconnecting
      saveTranscript();
    },
    onError: (e: string | Error) => {
      const errorMsg =
        typeof e === "string" ? e : ((e as Error)?.message ?? "Unknown error");
      clientLogger.error("[VoiceAgent] Error from ElevenLabs:", {
        error: errorMsg,
        fullError: e,
        timestamp: new Date().toISOString(),
      });
      setError(errorMsg);
      setStatus("idle");
    },
    onModeChange: (mode: { mode: "listening" | "speaking" }) => {
      clientLogger.info("[VoiceAgent] Mode changed:", {
        mode: mode.mode,
        timestamp: new Date().toISOString(),
      });
    },
    onStatusChange: (prop: {
      status: "connected" | "disconnected" | "connecting" | "disconnecting";
    }) => {
      clientLogger.info("[VoiceAgent] Status changed:", {
        status: prop.status,
        timestamp: new Date().toISOString(),
      });
    },
    onMessage: (props: { message: string; source: "user" | "ai" }) => {
      // Capture conversation messages with speaker attribution from ElevenLabs
      const speaker = props.source === "user" ? "A" : "B";
      const messageText = props.message;

      clientLogger.info("[VoiceAgent] Message received:", {
        source: props.source,
        speaker,
        messageLength: messageText.length,
        timestamp: new Date().toISOString(),
      });

      setTranscript((prev) => [
        ...prev,
        `[${new Date().toISOString()}] ${speaker}: ${messageText}`,
      ]);
    },
  });

  const getVoiceSettings = () => ({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.4,
    use_speaker_boost: true,
  });

  const saveTranscript = useCallback(async () => {
    const currentTranscript = transcriptRef.current;
    if (currentTranscript.length === 0) {
      return;
    }

    try {
      const token = await getIdToken();
      if (!token) {
        clientLogger.error("no auth token available for transcript save");
        return;
      }

      const transcriptText = currentTranscript.join("\n\n");

      // save transcript to firestore
      const transcriptResponse = await fetch("/api/transcripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: sessionId,
          transcript: transcriptText,
          timestamp: new Date().toISOString(),
          segments: [],
        }),
      });

      if (!transcriptResponse.ok) {
        throw new Error(`transcript save failed: ${transcriptResponse.status}`);
      }

      // update session status to "processing" to trigger analysis
      const statusResponse = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "processing",
        }),
      });

      if (!statusResponse.ok) {
        throw new Error(`status update failed: ${statusResponse.status}`);
      }

      clientLogger.info(
        `[VoiceAgent] Transcript saved and session ${sessionId} marked as processing`
      );
    } catch (error) {
      clientLogger.error("[VoiceAgent] Failed to save transcript:", error);
      // silently fail - transcript saving is not critical to user experience
    }
  }, [sessionId, getIdToken]);

  const connect = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      // Request microphone permission first
      clientLogger.info("[VoiceAgent] Requesting microphone permission...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        clientLogger.info("[VoiceAgent] Microphone permission granted");
        // Stop the test stream immediately - ElevenLabs will create its own
        stream.getTracks().forEach((track) => track.stop());
      } catch (micError) {
        clientLogger.error(
          "[VoiceAgent] Microphone permission denied:",
          micError
        );
        throw new Error(
          "Microphone permission denied. Please allow microphone access to use the voice agent."
        );
      }

      // Public agent — connect directly with agentId (no backend call needed)
      // connectionType: 'websocket' for WebSocket, 'webrtc' for WebRTC
      // Override voice settings for natural conversation
      // Docs: https://elevenlabs.io/docs/agents-platform/libraries/react#startSession
      if (AGENT_ID) {
        const sessionConfig = {
          agentId: AGENT_ID,
          connectionType: "webrtc" as const,
          ...(!useAgentVoice && {
            overrides: {
              tts: {
                voiceId: selectedVoice,
                ...getVoiceSettings(),
              },
            },
          }),
        };

        clientLogger.info(
          "[VoiceAgent] Starting session with config:",
          sessionConfig
        );
        await conversation.startSession(sessionConfig);
        clientLogger.info("[VoiceAgent] Session started successfully");
        return;
      }

      // Fallback: private agent — get signed URL from backend
      // Requires ELEVENLABS_API_KEY with "Agents Write" permission
      const res = await fetch("/api/elevenlabs/signed-url");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `API returned ${res.status}`);
      }

      const data = await res.json();
      if (!data?.signed_url) {
        throw new Error("No signed_url returned from server");
      }

      await conversation.startSession({ signedUrl: data.signed_url });
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "Failed to connect");
    }
  }, [conversation, selectedVoice]);

  const disconnect = useCallback(async () => {
    setError(null);
    await conversation.endSession();
  }, [conversation]);

  // Compute agent state for the Orb visualization
  const agentState: AgentState = useMemo(() => {
    if (status !== "connected") return null;
    if (conversation.isSpeaking) return "talking";
    return "listening";
  }, [status, conversation.isSpeaking]);

  return (
    <div className="space-y-4">
      {/* Voice Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Voice Settings
          </label>
        </div>

        {/* Voice Mode Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="use-agent-voice"
            checked={useAgentVoice}
            onChange={(e) => setUseAgentVoice(e.target.checked)}
            disabled={status !== "idle"}
            className="rounded"
            aria-label="toggle agent's preset voice"
          />
          <label
            htmlFor="use-agent-voice"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Use agent's preset voice
          </label>
        </div>

        {/* Custom Voice Selection */}
        {!useAgentVoice && (
          <>
            <label className="text-sm font-medium text-foreground">
              Select Custom Voice
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VOICES.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => setSelectedVoice(voice.id)}
                  disabled={status !== "idle"}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedVoice === voice.id
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={`select ${voice.name} voice - ${voice.gender}, ${voice.description}`}
                  aria-pressed={selectedVoice === voice.id}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{voice.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {voice.gender}
                      </div>
                    </div>
                    {selectedVoice === voice.id && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {voice.description}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Connection Controls */}
      <div className="flex gap-2 items-center flex-wrap">
        <button
          className="border px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={connect}
          disabled={status !== "idle"}
          aria-label={
            status === "connecting"
              ? "connecting to voice agent"
              : "connect to voice agent"
          }
        >
          {status === "connecting" ? "Connecting…" : "Connect to Agent"}
        </button>

        <button
          className="border px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={disconnect}
          disabled={status !== "connected"}
          aria-label="disconnect from voice agent"
        >
          Disconnect
        </button>

        <span className="text-sm opacity-70">
          {status === "connected" && "● Connected"}
          {status === "connecting" && "○ Connecting..."}
          {status === "idle" && "○ Not connected"}
        </span>
      </div>

      {status === "connected" && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground flex items-center justify-center gap-2 mb-4"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-500"
            />
            Agent is listening — speak naturally
            <AnimatePresence>
              {conversation.isSpeaking && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-2 text-primary font-medium"
                >
                  Agent is speaking...
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Enhanced Orb Visualization - Main Conversation Screen */}
          <div className="relative w-full flex justify-center py-12">
            {/* Glassmorphic container with floating animation */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: conversation.isSpeaking ? [1, 1.05, 1] : 1,
              }}
              transition={{
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 1, repeat: Infinity },
              }}
              className="relative"
            >
              {/* Outer glow rings */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent blur-3xl opacity-50"
                style={{ transform: "scale(1.5)" }}
              />

              {/* Middle glow ring */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-accent to-primary blur-2xl opacity-40"
                style={{ transform: "scale(1.3)" }}
              />

              {/* Glassmorphic border */}
              <div className="relative p-2 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                {/* Inner shadow ring */}
                <div className="p-3 rounded-full bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-md">
                  {/* Orb container */}
                  <div className="w-80 h-80 relative">
                    {/* Animated pulse ring when speaking */}
                    <AnimatePresence>
                      {conversation.isSpeaking && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5],
                          }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 rounded-full border-4 border-primary"
                        />
                      )}
                    </AnimatePresence>

                    <Orb
                      agentState={agentState}
                      colors={["#6366f1", "#8b5cf6"]}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Floating particles around orb */}
              {conversation.isSpeaking &&
                [...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [
                        0,
                        Math.cos((i * Math.PI * 2) / 6) * 100,
                        Math.cos((i * Math.PI * 2) / 6) * 150,
                      ],
                      y: [
                        0,
                        Math.sin((i * Math.PI * 2) / 6) * 100,
                        Math.sin((i * Math.PI * 2) / 6) * 150,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeOut",
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary"
                    style={{ marginLeft: "-4px", marginTop: "-4px" }}
                  />
                ))}
            </motion.div>
          </div>
        </>
      )}

      {/* Transcript Display */}
      {transcript.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Conversation Transcript
            </label>
            <button
              onClick={saveTranscript}
              className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded text-primary"
              aria-label="save conversation transcript to file"
            >
              Save to File
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto bg-muted/50 rounded-lg p-3 text-xs font-mono">
            {transcript.map((line, index) => (
              <div key={index} className="mb-1 text-muted-foreground">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {status === "idle" && (
        <p className="text-xs text-muted-foreground">
          The browser will ask for microphone permission when you connect.
        </p>
      )}
    </div>
  );
}
