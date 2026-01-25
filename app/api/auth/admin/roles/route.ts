// CultureLens — Admin Role Management API
// POST /api/auth/admin/roles — set user roles (admin only)
//
// allows admins to set custom claims for role-based access control

import { NextRequest } from "next/server";
import {
  apiHandler,
  apiSuccess,
  apiError,
  AuthenticationError,
  validateRequest,
} from "@/lib/api";
import { verifyIdToken, setUserClaims, hasRole } from "@/lib/auth-server";
import { z } from "zod";

const setRoleSchema = z.object({
  uid: z.string().min(1),
  role: z.enum(["admin", "user", "moderator"]),
  plan: z.enum(["free", "pro", "enterprise"]).optional(),
});

export async function POST(request: NextRequest) {
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

      // check if user is admin
      const isAdmin = await hasRole(decodedToken.uid, "admin");
      if (!isAdmin) {
        return apiError(
          "forbidden",
          "insufficient permissions: admin role required",
          { status: 403 }
        );
      }

      // validate request body
      const body = await validateRequest(request, setRoleSchema);

      // set user claims
      const claims: {
        role: "admin" | "user" | "moderator";
        plan?: "free" | "pro" | "enterprise";
      } = { role: body.role };
      if (body.plan) {
        claims.plan = body.plan;
      }

      await setUserClaims(body.uid, claims);

      return apiSuccess(
        {
          uid: body.uid,
          claims,
        },
        { message: "user role updated successfully" }
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new AuthenticationError(error.message);
      }
      throw new AuthenticationError("failed to update user role");
    }
  });
}
