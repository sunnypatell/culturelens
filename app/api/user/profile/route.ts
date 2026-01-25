// user profile management API

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  DatabaseError,
  validateRequest,
} from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import { getDocument, updateDocument } from "@/lib/firebase-server-utils";
import { COLLECTIONS, generateUserIdFromUid } from "@/lib/firestore-constants";
import { z } from "zod";

const ProfileUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  organization: z.string().optional(),
  photoURL: z.string().url().optional(),
});

/**
 * PATCH /api/user/profile
 * updates user profile
 */
export async function PATCH(request: Request) {
  return apiHandler(async () => {
    console.log(`[API_PROFILE_PATCH] Updating profile`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    // validate request body
    const body = await validateRequest(request, ProfileUpdateSchema);

    try {
      // check if user document exists
      const existingUser = await getDocument(COLLECTIONS.USERS, userId);

      if (!existingUser) {
        throw new DatabaseError(
          "profile update",
          "user profile not found"
        );
      }

      // update firestore profile
      await updateDocument(COLLECTIONS.USERS, userId, {
        displayName: body.displayName,
        organization: body.organization,
        photoURL: body.photoURL,
        updatedAt: new Date().toISOString(),
      });

      console.log(`[API_PROFILE_PATCH] Profile updated for user ${userId}`);

      return apiSuccess({ message: "profile updated" });
    } catch (error) {
      throw new DatabaseError(
        "profile update",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
