// sync user profile from Firebase Auth to Firestore

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  DatabaseError,
} from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import {
  getDocument,
  createDocumentWithId,
  updateDocument,
} from "@/lib/firebase-server-utils";
import { COLLECTIONS, generateUserIdFromUid } from "@/lib/firestore-constants";

/**
 * POST /api/user/sync-profile
 * creates or updates user profile in Firestore from Auth user data
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    console.log(`[API_SYNC_PROFILE] Syncing user profile`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    // get user data from request body
    const body = await request.json();
    const {
      email,
      displayName,
      phoneNumber,
      photoURL,
      emailVerified,
      linkedProviders,
    } = body;

    try {
      // check if profile already exists
      const existingProfile = await getDocument(COLLECTIONS.USERS, userId);

      if (existingProfile) {
        console.log(`[API_SYNC_PROFILE] Updating existing profile:`, userId);

        // update existing profile
        await updateDocument(COLLECTIONS.USERS, userId, {
          email,
          displayName,
          phoneNumber,
          photoURL,
          emailVerified,
          linkedProviders,
          updatedAt: new Date().toISOString(),
        });
      } else {
        console.log(`[API_SYNC_PROFILE] Creating new profile:`, userId);

        // create new profile
        await createDocumentWithId(COLLECTIONS.USERS, userId, {
          uid: decodedToken.uid,
          email,
          displayName,
          phoneNumber,
          photoURL,
          emailVerified,
          linkedProviders,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      console.log(`[API_SYNC_PROFILE] Profile synced successfully`);

      return apiSuccess(
        {
          id: userId,
          uid: decodedToken.uid,
          email,
          displayName,
          phoneNumber,
          photoURL,
          emailVerified,
          linkedProviders,
        },
        {
          message: "profile synced",
        }
      );
    } catch (error) {
      throw new DatabaseError(
        "profile sync",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}

/**
 * GET /api/user/sync-profile
 * retrieves user profile from Firestore
 */
export async function GET(request: Request) {
  return apiHandler(async () => {
    console.log(`[API_GET_PROFILE] Fetching user profile`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    try {
      const profile = await getDocument(COLLECTIONS.USERS, userId);

      if (!profile) {
        console.warn(`[API_GET_PROFILE] Profile not found for:`, userId);
        return apiSuccess(null, { message: "profile not found" });
      }

      console.log(`[API_GET_PROFILE] Profile retrieved successfully`);

      return apiSuccess(profile);
    } catch (error) {
      throw new DatabaseError(
        "profile retrieval",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
