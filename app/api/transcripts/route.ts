// transcript management API endpoint

import { createDocument } from "@/lib/firebase-server-utils";
import {
  apiHandler,
  apiSuccess,
  DatabaseError,
  validateRequest,
} from "@/lib/api";
import { TranscriptSchemas } from "@/lib/api/schemas";

/**
 * POST /api/transcripts
 * saves a conversation transcript
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    // validate request body
    const body = await validateRequest(request, TranscriptSchemas.create);

    // store transcript in firestore
    let transcriptId: string;
    try {
      transcriptId = await createDocument("transcripts", {
        sessionId: body.sessionId,
        transcript: body.transcript,
        timestamp: body.timestamp || new Date().toISOString(),
        segments: body.segments || [],
      });
    } catch (error) {
      throw new DatabaseError("transcript save", error instanceof Error ? error.message : undefined);
    }

    return apiSuccess(
      {
        transcriptId,
        sessionId: body.sessionId,
      },
      {
        message: "transcript saved successfully",
        status: 201,
      }
    );
  });
}
