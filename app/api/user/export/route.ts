// user data export API

import { AuthenticationError, DatabaseError } from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import {
  getDocument,
  getDocuments,
  whereEqual,
} from "@/lib/firebase-server-utils";
import { COLLECTIONS, generateUserIdFromUid } from "@/lib/firestore-constants";
import { logger } from "@/lib/logger";

/**
 * POST /api/user/export
 * exports all user data as JSON
 */
export async function POST(request: Request) {
  try {
    logger.info(`[API_EXPORT_POST] Exporting user data`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    // fetch all user data
    let profile, sessions;
    try {
      [profile, sessions] = await Promise.all([
        getDocument(COLLECTIONS.USERS, userId),
        getDocuments(COLLECTIONS.SESSIONS, [
          whereEqual("userId", decodedToken.uid),
        ]),
      ]);
    } catch (error) {
      throw new DatabaseError(
        "data export",
        error instanceof Error ? error.message : undefined
      );
    }

    const exportData = {
      profile,
      sessions,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };

    logger.info(
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
    // use standard error envelope for API errors
    if (error instanceof AuthenticationError) {
      return Response.json(
        {
          success: false,
          error: { code: error.code, message: error.message },
        },
        { status: error.status }
      );
    }
    if (error instanceof DatabaseError) {
      return Response.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            hint: error.hint,
          },
        },
        { status: error.status }
      );
    }

    logger.error({ data: error }, "[API_EXPORT_POST] Export error:");
    return Response.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "failed to export data" },
      },
      { status: 500 }
    );
  }
}
