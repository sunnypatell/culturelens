// CultureLens — ElevenLabs Text-to-Speech API
// POST /api/elevenlabs/tts — convert debrief script to audio
//
// Uses ElevenLabs TTS API to generate the audio debrief.
// Requires ELEVENLABS_API_KEY env var.

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import {
  apiHandler,
  apiSuccess,
  ExternalServiceError,
  validateRequest,
} from "@/lib/api";
import { ElevenLabsSchemas } from "@/lib/api/schemas";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new ExternalServiceError(
        "elevenlabs configuration",
        "ELEVENLABS_API_KEY environment variable is not set"
      );
    }

    // validate request body
    const body = await validateRequest(request, ElevenLabsSchemas.tts);
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = body; // default to rachel voice

    // call elevenlabs TTS API
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
      throw new ExternalServiceError(
        "elevenlabs API",
        `${response.status} - ${errorData?.detail || response.statusText}`
      );
    }

    // receive audio stream (mpeg)
    const audioBuffer = await response.arrayBuffer();

    // upload to firebase storage
    const fileName = `tts-${Date.now()}-${Math.random().toString(36).substring(2)}.mp3`;
    const storagePath = `audio/tts/${fileName}`;
    const storageRef = ref(storage, storagePath);

    let downloadURL: string;
    try {
      const snapshot = await uploadBytes(storageRef, audioBuffer, {
        contentType: "audio/mpeg",
      });
      downloadURL = await getDownloadURL(snapshot.ref);
    } catch (error) {
      throw new ExternalServiceError(
        "firebase storage",
        error instanceof Error ? error.message : undefined
      );
    }

    // calculate duration estimate (~150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const estimatedDurationMs = Math.max(3000, (wordCount / 150) * 60 * 1000); // minimum 3 seconds

    return apiSuccess(
      {
        audioUrl: downloadURL,
        durationMs: Math.round(estimatedDurationMs),
        wordCount,
      },
      {
        message: "audio generated successfully",
      }
    );
  });
}
