// CultureLens — Audio Serving API
// GET /api/audio/[id] — serve audio files from firestore
//
// retrieves audio files stored in firestore as base64
// and serves them as streamable audio responses

import { NextRequest, NextResponse } from "next/server";
import {
  getAudioFromFirestore,
  base64ToBuffer,
} from "@/lib/audio-storage-server";
import { verifyIdToken } from "@/lib/auth-server";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  logger.info(`[API_AUDIO_GET] Received audio request`);

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "invalid_audio_id",
          message: "audio ID is required",
        },
      },
      { status: 400 }
    );
  }

  // authenticate user
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    logger.error(`[API_AUDIO_GET] Missing authorization header`);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "unauthorized",
          message: "authentication required",
        },
      },
      { status: 401 }
    );
  }

  let userId: string;
  try {
    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    userId = decodedToken.uid;
    logger.info({ data: userId }, `[API_AUDIO_GET] Authenticated user:`);
  } catch (error) {
    logger.error({ data: error }, `[API_AUDIO_GET] Invalid token:`);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "unauthorized",
          message: "invalid authentication token",
        },
      },
      { status: 401 }
    );
  }

  // retrieve audio from firestore
  let audioData;
  try {
    audioData = await getAudioFromFirestore(id);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "database_error",
          message: "failed to retrieve audio",
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }

  if (!audioData) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "not_found",
          message: `audio file not found: ${id}`,
        },
      },
      { status: 404 }
    );
  }

  // verify ownership
  if (audioData.userId !== userId) {
    logger.error(
      `[API_AUDIO_GET] Authorization failed: audio ${id} belongs to ${audioData.userId}, not ${userId}`
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "forbidden",
          message: "not authorized to access this audio file",
        },
      },
      { status: 403 }
    );
  }

  // convert base64 to buffer
  const audioBuffer = base64ToBuffer(audioData.audioData);

  // convert buffer to uint8array for web response API
  const audioArray = new Uint8Array(audioBuffer);

  // return audio response with proper headers
  return new Response(audioArray, {
    status: 200,
    headers: {
      "Content-Type": audioData.contentType,
      "Content-Length": audioData.size.toString(),
      "Cache-Control": "public, max-age=86400", // cache for 24 hours
      "Accept-Ranges": "bytes",
    },
  });
}
