// CultureLens — ElevenLabs Text-to-Speech API
// POST /api/elevenlabs/tts — convert debrief script to audio
//
// Uses ElevenLabs TTS API to generate the audio debrief.
// Requires ELEVENLABS_API_KEY env var.

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY" },
      { status: 500 }
    );
  }

  // TODO: implement TTS generation
  //
  // 1. Parse request body: { text: string, voiceId?: string }
  // 2. Call ElevenLabs TTS API:
  //    POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}
  //    Headers: { "xi-api-key": apiKey, "Content-Type": "application/json" }
  //    Body: { text, model_id: "eleven_multilingual_v2", voice_settings: { ... } }
  // 3. Receive audio stream (mpeg)
  // 4. Store/cache the audio file
  // 5. Return { audioUrl, durationMs }
  //
  // Default voice: use a neutral, professional voice ID from ElevenLabs

  return NextResponse.json(
    { error: "POST /api/elevenlabs/tts not implemented yet" },
    { status: 501 }
  );
}
