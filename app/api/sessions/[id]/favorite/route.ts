// toggle session favorite status

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  validateParams,
} from "@/lib/api";
import { SessionSchemas } from "@/lib/api/schemas";
import { verifyIdToken } from "@/lib/auth-server";
import { getDocument, updateDocument } from "@/lib/firebase-server-utils";
import { COLLECTIONS } from "@/lib/firestore-constants";

/**
 * PATCH /api/sessions/[id]/favorite
 * toggles the favorite status of a session
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    console.log(`[API_FAVORITE_PATCH] Toggling favorite status`);

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

    // get session
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
      console.error(
        `[API_FAVORITE_PATCH] Authorization failed: session ${id} belongs to ${session.userId}, not ${userId}`
      );
      throw new AuthorizationError("not authorized to access this session");
    }

    // toggle favorite status
    const newFavoriteStatus = !session.isFavorite;

    try {
      await updateDocument(COLLECTIONS.SESSIONS, id, {
        isFavorite: newFavoriteStatus,
      });
    } catch (error) {
      throw new DatabaseError(
        "session update",
        error instanceof Error ? error.message : undefined
      );
    }

    console.log(
      `[API_FAVORITE_PATCH] Toggled favorite for session ${id}: ${newFavoriteStatus}`
    );

    return apiSuccess(
      { isFavorite: newFavoriteStatus },
      {
        message: newFavoriteStatus
          ? "added to favorites"
          : "removed from favorites",
      }
    );
  });
}
