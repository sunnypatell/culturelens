"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";

// Public agent ID — exposed to browser via NEXT_PUBLIC_ prefix.
// For public agents, no signed URL is needed — connects directly.
// Docs: https://elevenlabs.io/docs/agents-platform/libraries/react
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

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

export function VoiceAgent() {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id); // Default to Rachel

  const conversation = useConversation({
    onConnect: () => setStatus("connected"),
    onDisconnect: () => setStatus("idle"),
    onError: (e) => {
      setError(
        typeof e === "string" ? e : ((e as Error)?.message ?? "Unknown error")
      );
      setStatus("idle");
    },
  });

  const getVoiceSettings = () => ({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.4,
    use_speaker_boost: true,
  });

  const connect = useCallback(async () => {
    setError(null);
    setStatus("connecting");

    try {
      // Public agent — connect directly with agentId (no backend call needed)
      // connectionType: 'websocket' for WebSocket, 'webrtc' for WebRTC
      // Override voice settings for natural conversation
      // Docs: https://elevenlabs.io/docs/agents-platform/libraries/react#startSession
      if (AGENT_ID) {
        await conversation.startSession({
          agentId: AGENT_ID,
          connectionType: "websocket",
          // Override with selected voice and natural settings
          overrides: {
            tts: {
              voiceId: selectedVoice,
              ...getVoiceSettings(),
            },
          },
        });
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

  return (
    <div className="space-y-4">
      {/* Voice Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Select Voice
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
      </div>

      {/* Connection Controls */}
      <div className="flex gap-2 items-center flex-wrap">
        <button
          className="border px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={connect}
          disabled={status !== "idle"}
        >
          {status === "connecting" ? "Connecting…" : "Connect to Agent"}
        </button>

        <button
          className="border px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={disconnect}
          disabled={status !== "connected"}
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
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Agent is listening — speak naturally
          {conversation.isSpeaking && (
            <span className="ml-2 text-primary font-medium">
              Agent is speaking...
            </span>
          )}
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
