// sync user profile from Firebase Auth to Firestore

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  DatabaseError,
  validateRequest,
} from "@/lib/api";
import { SyncProfileSchemas } from "@/lib/api/schemas";
import { verifyIdToken } from "@/lib/auth-server";
import {
  getDocument,
  createDocumentWithId,
  updateDocument,
} from "@/lib/firebase-server-utils";
import { COLLECTIONS, generateUserIdFromUid } from "@/lib/firestore-constants";
import { logger } from "@/lib/logger";

/**
 * POST /api/user/sync-profile
 * creates or updates user profile in Firestore from Auth user data
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    logger.info(`[API_SYNC_PROFILE] Syncing user profile`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = generateUserIdFromUid(decodedToken.uid);

    // validate and parse request body
    const {
      email,
      displayName,
      phoneNumber,
      photoURL,
      emailVerified,
      linkedProviders,
    } = await validateRequest(request, SyncProfileSchemas.update);

    try {
      // filter out null and undefined values to avoid overwriting valid data
      const profileData: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };

      if (email != null) profileData.email = email;
      if (displayName != null) profileData.displayName = displayName;
      if (phoneNumber != null) profileData.phoneNumber = phoneNumber;
      if (photoURL != null) profileData.photoURL = photoURL;
      if (emailVerified != null) profileData.emailVerified = emailVerified;
      if (linkedProviders != null)
        profileData.linkedProviders = linkedProviders;

      // check if profile already exists
      const existingProfile = await getDocument(COLLECTIONS.USERS, userId);

      if (existingProfile) {
        logger.info(
          { data: userId },
          `[API_SYNC_PROFILE] Updating existing profile:`
        );

        // update existing profile (only defined fields)
        await updateDocument(COLLECTIONS.USERS, userId, profileData);
      } else {
        logger.info(
          { data: userId },
          `[API_SYNC_PROFILE] Creating new profile:`
        );

        // create new profile
        await createDocumentWithId(COLLECTIONS.USERS, userId, {
          uid: decodedToken.uid,
          ...profileData,
          createdAt: new Date().toISOString(),
        });
      }

      logger.info(`[API_SYNC_PROFILE] Profile synced successfully`);

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
    logger.info(`[API_GET_PROFILE] Fetching user profile`);

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
        logger.warn(
          { data: userId },
          `[API_GET_PROFILE] Profile not found for:`
        );
        return apiSuccess(null, { message: "profile not found" });
      }

      logger.info(`[API_GET_PROFILE] Profile retrieved successfully`);

      return apiSuccess(profile);
    } catch (error) {
      throw new DatabaseError(
        "profile retrieval",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
