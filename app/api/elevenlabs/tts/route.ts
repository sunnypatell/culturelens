// CultureLens — ElevenLabs Text-to-Speech API
// POST /api/elevenlabs/tts — convert debrief script to audio
//
// Uses ElevenLabs TTS API to generate the audio debrief.
// Requires ELEVENLABS_API_KEY env var.
//
// NOTE: stores audio in firestore as base64 (free tier workaround)
// instead of firebase storage

import {
  apiHandler,
  apiSuccess,
  ExternalServiceError,
  DatabaseError,
  AuthenticationError,
  validateRequest,
} from "@/lib/api";
import { ElevenLabsSchemas } from "@/lib/api/schemas";
import { storeAudioInFirestore } from "@/lib/audio-storage-server";
import { verifyIdToken } from "@/lib/auth-server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  return apiHandler(async () => {
    logger.info(`[API_TTS_POST] Received TTS request`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    logger.info({ data: userId }, `[API_TTS_POST] Authenticated user:`);

    // rate limiting: 10 requests per minute per user
    try {
      checkRateLimit(userId, 10, 60000);
    } catch (error) {
      logger.warn(`[API_TTS_POST] Rate limit exceeded for user ${userId}`);
      throw new ExternalServiceError(
        "rate limit",
        error instanceof Error ? error.message : "too many requests"
      );
    }

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

    // store in firestore (free tier workaround instead of firebase storage)
    let audioId: string;
    try {
      const stored = await storeAudioInFirestore(
        audioBuffer,
        userId,
        "audio/mpeg",
        7 // 7 day expiration
      );
      audioId = stored.id;
    } catch (error) {
      throw new DatabaseError(
        "audio storage",
        error instanceof Error ? error.message : undefined
      );
    }

    // calculate duration estimate (~150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const estimatedDurationMs = Math.max(3000, (wordCount / 150) * 60 * 1000); // minimum 3 seconds

    // return API route URL to serve the audio
    const audioUrl = `/api/audio/${audioId}`;

    return apiSuccess(
      {
        audioUrl,
        durationMs: Math.round(estimatedDurationMs),
        wordCount,
      },
      {
        message: "audio generated successfully",
      }
    );
  });
}
