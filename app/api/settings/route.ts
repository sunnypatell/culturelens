// settings management API endpoints

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  DatabaseError,
  validateRequest,
} from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import {
  getDocument,
  updateDocument,
  createDocumentWithId,
} from "@/lib/firebase-server-utils";
import { COLLECTIONS, generateUserIdFromUid } from "@/lib/firestore-constants";
import { z } from "zod";

const SettingsSchema = z.object({
  notifications: z.boolean().optional(),
  autoSave: z.boolean().optional(),
  culturalAnalysis: z.boolean().optional(),
  dataRetention: z.string().optional(),
  sensitivityLevel: z.number().min(1).max(5).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  focusAreas: z.array(z.string()).optional(),
});

/**
 * GET /api/settings
 * retrieves user settings
 */
export async function GET(request: Request) {
  return apiHandler(async () => {
    console.log(`[API_SETTINGS_GET] Fetching settings`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    try {
      const user = (await getDocument(COLLECTIONS.USERS, userId)) as any;

      return apiSuccess(user?.settings || {});
    } catch (error) {
      throw new DatabaseError(
        "settings retrieval",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}

/**
 * PUT /api/settings
 * updates user settings
 */
export async function PUT(request: Request) {
  return apiHandler(async () => {
    console.log(`[API_SETTINGS_PUT] Updating settings`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    // validate request body
    const body = await validateRequest(request, SettingsSchema);

    try {
      // check if user document exists
      const existingUser = await getDocument(COLLECTIONS.USERS, userId);

      if (existingUser) {
        // update existing settings
        await updateDocument(COLLECTIONS.USERS, userId, {
          settings: body,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // create user document with settings
        await createDocumentWithId(COLLECTIONS.USERS, userId, {
          uid: decodedToken.uid,
          email: decodedToken.email || null,
          settings: body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      console.log(`[API_SETTINGS_PUT] Settings updated for user ${userId}`);

      return apiSuccess({ message: "settings saved" });
    } catch (error) {
      throw new DatabaseError(
        "settings update",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
