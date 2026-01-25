// CultureLens — Auth User API
// GET /api/auth/user — get current user info with claims
//
// retrieves authenticated user information including custom claims

import { NextRequest } from "next/server";
import {
  apiHandler,
  apiSuccess,
  apiError,
  AuthenticationError,
} from "@/lib/api";
import { verifyIdToken, getUserByUid } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  return apiHandler(async () => {
    // get authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("missing or invalid authorization header");
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
      // verify token
      const decodedToken = await verifyIdToken(idToken);

      // get full user data
      const user = await getUserByUid(decodedToken.uid);

      return apiSuccess({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        claims: user.customClaims,
        createdAt: user.createdAt,
        lastSignInTime: user.lastSignInTime,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new AuthenticationError(error.message);
      }
      throw new AuthenticationError("failed to get user");
    }
  });
}
