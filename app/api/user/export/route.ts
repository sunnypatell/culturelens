// user data export API

import { NextResponse } from "next/server";
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
  try {
    console.log(`[API_EXPORT_POST] Exporting user data`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    // fetch all user data
    const [profile, sessions] = await Promise.all([
      getDocument(COLLECTIONS.USERS, userId),
      getDocuments(COLLECTIONS.SESSIONS, [
        whereEqual("userId", decodedToken.uid),
      ]),
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
    console.error("[API_EXPORT_POST] Export error:", error);
    return NextResponse.json(
      { error: "failed to export data" },
      { status: 500 }
    );
  }
}
