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
import {
  getDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase-server-utils";
import { COLLECTIONS } from "@/lib/firestore-constants";
import { SessionSchemas } from "@/lib/api/schemas";
import { z } from "zod";
import { logger } from "@/lib/logger";

const UpdateSessionSchema = z.object({
  status: z
    .enum(["recording", "uploading", "processing", "ready", "failed"])
    .optional(),
  duration: z.number().optional(),
  audioUrl: z.string().optional(),
  audioPath: z.string().optional(),
});

/**
 * GET /api/sessions/[id]
 * retrieves a single session by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    logger.info(`[API_SESSION_GET] Fetching session`);

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

    // fetch session
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

    logger.info(`[API_SESSION_GET] Session ${id} retrieved successfully`);

    return apiSuccess(session);
  });
}

/**
 * PATCH /api/sessions/[id]
 * updates session metadata
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    logger.info(`[API_SESSION_PATCH] Updating session`);

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

    logger.info(`[API_SESSION_PATCH] Session ${id} updated successfully`);

    return apiSuccess({ message: "session updated successfully" });
  });
}

/**
 * DELETE /api/sessions/[id]
 * deletes a session and its associated data
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    logger.info(`[API_SESSION_DELETE] Deleting session`);

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

    // fetch session to verify ownership
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
      throw new AuthorizationError("not authorized to delete this session");
    }

    // delete session
    try {
      await deleteDocument(COLLECTIONS.SESSIONS, id);
    } catch (error) {
      throw new DatabaseError(
        "session deletion",
        error instanceof Error ? error.message : undefined
      );
    }

    logger.info(`[API_SESSION_DELETE] Session ${id} deleted successfully`);

    return apiSuccess({ message: "session deleted successfully" });
  });
}
