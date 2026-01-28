// transcript management API endpoint

import { createDocument } from "@/lib/firebase-server-utils";
import {
  apiHandler,
  apiSuccess,
  DatabaseError,
  AuthenticationError,
  validateRequest,
} from "@/lib/api";
import { TranscriptSchemas } from "@/lib/api/schemas";
import { verifyIdToken } from "@/lib/auth-server";
import { createRequestLogger } from "@/lib/logger";

/**
 * POST /api/transcripts
 * saves a conversation transcript
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    const logger = createRequestLogger("POST", "/api/transcripts");
    logger.info("saving transcript");

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    logger.info({ userId }, "authenticated user");

    // validate request body
    const body = await validateRequest(request, TranscriptSchemas.create);

    // store transcript in firestore with user ownership
    let transcriptId: string;
    try {
      transcriptId = await createDocument("transcripts", {
        userId, // add user ownership
        sessionId: body.sessionId,
        transcript: body.transcript,
        timestamp: body.timestamp || new Date().toISOString(),
        segments: body.segments || [],
      });
      logger.info({ transcriptId }, "transcript saved");
    } catch (error) {
      throw new DatabaseError(
        "transcript save",
        error instanceof Error ? error.message : undefined
      );
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
