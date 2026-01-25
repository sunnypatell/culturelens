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

/**
 * DELETE /api/user/delete
 * deletes user account and all associated data
 */
export async function DELETE(request: Request) {
  return apiHandler(async () => {
    console.log(`[API_DELETE_USER] Deleting user account`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    try {
      // delete all user sessions
      const sessions = await getDocuments(COLLECTIONS.SESSIONS, [
        whereEqual("userId", decodedToken.uid),
      ]);

      console.log(`[API_DELETE_USER] Deleting ${sessions.length} sessions`);

      await Promise.all(
        sessions.map((session: any) =>
          deleteDocument(COLLECTIONS.SESSIONS, session.id)
        )
      );

      // delete user profile
      await deleteDocument(COLLECTIONS.USERS, userId);

      // delete firebase auth account
      const auth = getAuth();
      await auth.deleteUser(decodedToken.uid);

      console.log(`[API_DELETE_USER] Account deleted for user ${userId}`);

      return apiSuccess({ message: "account deleted" });
    } catch (error) {
      throw new DatabaseError(
        "account deletion",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
