// CultureLens — ElevenLabs Text-to-Speech API
// POST /api/elevenlabs/tts — convert debrief script to audio
//
// Uses ElevenLabs TTS API to generate the audio debrief.
// Requires ELEVENLABS_API_KEY env var.

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY" },
      { status: 500 }
    );
  }

  try {
    // 1. Parse request body: { text: string, voiceId?: string }
    const body = await request.json();
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = body; // Default to Rachel voice

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    // 2. Call ElevenLabs TTS API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status} - ${errorData?.detail || response.statusText}` },
        { status: response.status }
      );
    }

    // 3. Receive audio stream (mpeg)
    const audioBuffer = await response.arrayBuffer();

    // 4. Store/cache the audio file
    const audioDir = path.join(process.cwd(), "public", "audio");
    await fs.mkdir(audioDir, { recursive: true });

    const fileName = `tts-${Date.now()}-${Math.random().toString(36).substring(2)}.mp3`;
    const filePath = path.join(audioDir, fileName);
    await fs.writeFile(filePath, Buffer.from(audioBuffer));

    // 5. Return { audioUrl, durationMs }
    // Note: Duration estimation (rough calculation: ~150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const estimatedDurationMs = Math.max(3000, (wordCount / 150) * 60 * 1000); // Minimum 3 seconds

    return NextResponse.json({
      audioUrl: `/audio/${fileName}`,
      durationMs: Math.round(estimatedDurationMs),
      wordCount,
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Internal server error during TTS generation" },
      { status: 500 }
    );
  }
}
