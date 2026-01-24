"use client";

import { useConversation } from "@elevenlabs/react";
import { useEffect, useState } from "react";

export default function VoiceAgent() {
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    // IMPORTANT: do NOT set textOnly
    onConnect: () => setStatus("connected"),
    onDisconnect: () => setStatus("idle"),
    onError: (e) => setError(typeof e === "string" ? e : (e as any)?.message ?? "Unknown error"),
  });

  async function connect() {
    setError(null);
    setStatus("connecting");

    const r = await fetch("/api/elevenlabs/signed-url");
    const data = await r.json();
    if (!data?.signed_url) {
      setStatus("idle");
      setError("No signed_url returned");
      return;
    }

    // Starts session and handles audio streaming internally (mic + playback)
    await conversation.startSession({
      signedUrl: data.signed_url,
    } as any);
  }

  async function disconnect() {
    setError(null);
    await conversation.endSession();
  }

  // Push-to-talk style controls
  function startTalking() {
    // begins capturing mic audio to send to agent
    conversation.startRecording?.();
  }

  function stopTalking() {
    conversation.stopRecording?.();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <button
          className="border px-3 py-2 rounded"
          onClick={connect}
          disabled={status !== "idle"}
        >
          {status === "connecting" ? "Connecting…" : "Connect"}
        </button>

        <button
          className="border px-3 py-2 rounded"
          onClick={disconnect}
          disabled={status !== "connected"}
        >
          Disconnect
        </button>

        <span className="text-sm opacity-70">Status: {status}</span>
      </div>

      <button
        className="border px-4 py-3 rounded w-full"
        disabled={status !== "connected"}
        onMouseDown={startTalking}
        onMouseUp={stopTalking}
        onTouchStart={startTalking}
        onTouchEnd={stopTalking}
      >
        Hold to Talk
      </button>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="text-xs opacity-70">
        Tip: the browser will ask for microphone permission the first time.
      </div>
    </div>
  );
}
