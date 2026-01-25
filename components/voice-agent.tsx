"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Orb, type AgentState } from "@/components/ui/orb";

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
  const [sessionId] = useState(
    () => providedSessionId || `session-${Date.now()}`
  );
  const transcriptRef = useRef<string[]>([]);

  // Keep the ref in sync with the state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    onSessionId?.(sessionId);
  }, [onSessionId, sessionId]);

  const conversation = useConversation({
    onConnect: () => {
      setStatus("connected");
    },
    onDisconnect: () => {
      setStatus("idle");
      // Save final transcript when disconnecting
      saveTranscript();
    },
    onError: (e) => {
      setError(
        typeof e === "string" ? e : ((e as Error)?.message ?? "Unknown error")
      );
      setStatus("idle");
    },
    onMessage: (message) => {
      // Capture conversation messages with speaker attribution
      const messageText =
        typeof message === "string" ? message : JSON.stringify(message);

      setTranscript((prev) => {
        // Alternate speakers: user (A) speaks first, then agent (B)
        // This assumes a conversational pattern where speakers alternate
        const speaker = prev.length % 2 === 0 ? "A" : "B";
        return [
          ...prev,
          `[${new Date().toISOString()}] ${speaker}: ${messageText}`,
        ];
      });
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
        console.error("no auth token available for transcript save");
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

      console.log(
        `[VoiceAgent] Transcript saved and session ${sessionId} marked as processing`
      );
    } catch (error) {
      console.error("[VoiceAgent] Failed to save transcript:", error);
      // silently fail - transcript saving is not critical to user experience
    }
  }, [sessionId, getIdToken]);

  const connect = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      // Public agent — connect directly with agentId (no backend call needed)
      // connectionType: 'websocket' for WebSocket, 'webrtc' for WebRTC
      // Override voice settings for natural conversation
      // Docs: https://elevenlabs.io/docs/agents-platform/libraries/react#startSession
      if (AGENT_ID) {
        const sessionConfig: any = {
          agentId: AGENT_ID,
          connectionType: "websocket",
        };

        // Only override voice if not using agent's preset voice
        if (!useAgentVoice) {
          sessionConfig.overrides = {
            tts: {
              voiceId: selectedVoice,
              ...getVoiceSettings(),
            },
          };
        }

        await conversation.startSession(sessionConfig);
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
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Agent is listening — speak naturally
            {conversation.isSpeaking && (
              <span className="ml-2 text-primary font-medium">
                Agent is speaking...
              </span>
            )}
          </div>

          {/* Modern circular orb visualization */}
          <div className="w-full flex justify-center py-8">
            <div className="w-64 h-64">
              <Orb
                agentState={agentState}
                colors={["#6366f1", "#8b5cf6"]}
                className="w-full h-full"
              />
            </div>
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
