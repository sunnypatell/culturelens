// user data export API

import {
  apiHandler,
  AuthenticationError,
  DatabaseError,
} from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import {
  getDocument,
  getDocuments,
  whereEqual,
} from "@/lib/firebase-server-utils";
import { COLLECTIONS, generateUserIdFromUid } from "@/lib/firestore-constants";

/**
 * POST /api/user/export
 * exports all user data as JSON
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    console.log(`[API_EXPORT_POST] Exporting user data`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    try {
      // fetch all user data
      const [profile, sessions] = await Promise.all([
        getDocument(COLLECTIONS.USERS, userId),
        getDocuments(COLLECTIONS.SESSIONS, [whereEqual("userId", decodedToken.uid)]),
      ]);

      const exportData = {
        profile,
        sessions,
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      console.log(
        `[API_EXPORT_POST] Exported ${sessions.length} sessions for user ${userId}`
      );

      // return as downloadable JSON file
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="culturelens-data-${Date.now()}.json"`,
        },
      });
    } catch (error) {
      throw new DatabaseError(
        "data export",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
