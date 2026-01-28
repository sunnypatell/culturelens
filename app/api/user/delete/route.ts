// account deletion API

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  DatabaseError,
} from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import {
  getDocuments,
  deleteDocument,
  whereEqual,
} from "@/lib/firebase-server-utils";
import { COLLECTIONS, generateUserIdFromUid } from "@/lib/firestore-constants";
import { getAuth } from "firebase-admin/auth";
import { logger } from "@/lib/logger";

/**
 * DELETE /api/user/delete
 * deletes user account and all associated data
 */
export async function DELETE(request: Request) {
  return apiHandler(async () => {
    logger.info(`[API_DELETE_USER] Deleting user account`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    try {
      // fetch all user sessions and transcripts
      const [sessions, transcripts] = await Promise.all([
        getDocuments(COLLECTIONS.SESSIONS, [
          whereEqual("userId", decodedToken.uid),
        ]),
        getDocuments(COLLECTIONS.TRANSCRIPTS, [
          whereEqual("userId", decodedToken.uid),
        ]),
      ]);

      logger.info(
        `[API_DELETE_USER] Deleting ${sessions.length} sessions, ${transcripts.length} transcripts`
      );

      // delete sessions and transcripts — use allSettled so partial failures
      // don't prevent profile + auth deletion
      const deleteResults = await Promise.allSettled([
        ...sessions.map((session) =>
          deleteDocument(COLLECTIONS.SESSIONS, session.id as string)
        ),
        ...transcripts.map((transcript) =>
          deleteDocument(COLLECTIONS.TRANSCRIPTS, transcript.id as string)
        ),
      ]);

      const failed = deleteResults.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        logger.warn(
          { failedCount: failed.length },
          `[API_DELETE_USER] ${failed.length} document deletions failed, proceeding with account deletion`
        );
      }

      // delete user profile
      await deleteDocument(COLLECTIONS.USERS, userId);

      // delete firebase auth account
      const auth = getAuth();
      await auth.deleteUser(decodedToken.uid);

      logger.info(`[API_DELETE_USER] Account deleted for user ${userId}`);

      return apiSuccess({ message: "account deleted" });
    } catch (error) {
      throw new DatabaseError(
        "account deletion",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
