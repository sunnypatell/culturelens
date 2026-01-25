// session update API endpoint

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  NotFoundError,
  validateParams,
  validateRequest,
} from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import { getDocument, updateDocument } from "@/lib/firebase-server-utils";
import { COLLECTIONS } from "@/lib/firestore-constants";
import { SessionSchemas } from "@/lib/api/schemas";
import { z } from "zod";

const UpdateSessionSchema = z.object({
  status: z
    .enum(["recording", "uploading", "processing", "ready", "failed"])
    .optional(),
  duration: z.number().optional(),
  audioUrl: z.string().optional(),
  audioPath: z.string().optional(),
});

/**
 * PATCH /api/sessions/[id]
 * updates session metadata
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    console.log(`[API_SESSION_PATCH] Updating session`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    // check if session exists
    let session: any;
    try {
      session = await getDocument(COLLECTIONS.SESSIONS, id);
    } catch (error) {
      throw new DatabaseError(
        "session retrieval",
        error instanceof Error ? error.message : undefined
      );
    }

    if (!session) {
      throw new NotFoundError("session", id);
    }

    // verify ownership
    if (session.userId !== userId) {
      throw new AuthorizationError("not authorized to access this session");
    }

    // validate request body
    const body = await validateRequest(request, UpdateSessionSchema);

    // update session
    try {
      await updateDocument(COLLECTIONS.SESSIONS, id, {
        ...body,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new DatabaseError(
        "session update",
        error instanceof Error ? error.message : undefined
      );
    }

    console.log(`[API_SESSION_PATCH] Session ${id} updated successfully`);

    return apiSuccess({ message: "session updated successfully" });
  });
}
