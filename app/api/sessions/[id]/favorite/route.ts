// session favorite toggle API endpoint

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  NotFoundError,
  validateParams,
} from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import { getDocument, updateDocument } from "@/lib/firebase-server-utils";
import { COLLECTIONS } from "@/lib/firestore-constants";
import { SessionSchemas } from "@/lib/api/schemas";

/**
 * PATCH /api/sessions/[id]/favorite
 * toggles favorite status for a session
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    console.log(`[API_FAVORITE_PATCH] Toggling favorite`);

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

    // toggle favorite status
    const newFavoriteStatus = !session.isFavorite;

    // update session
    try {
      await updateDocument(COLLECTIONS.SESSIONS, id, {
        isFavorite: newFavoriteStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new DatabaseError(
        "favorite update",
        error instanceof Error ? error.message : undefined
      );
    }

    console.log(
      `[API_FAVORITE_PATCH] Session ${id} favorite status: ${newFavoriteStatus}`
    );

    return apiSuccess({ isFavorite: newFavoriteStatus });
  });
}
