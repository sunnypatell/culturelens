// session management API endpoints

import { Session } from "@/lib/types";
import {
  createDocument,
  getDocuments,
  orderByField,
} from "@/lib/firebase-server-utils";
import {
  apiHandler,
  apiSuccess,
  ApiErrors,
  DatabaseError,
  validateRequest,
} from "@/lib/api";
import { SessionSchemas } from "@/lib/api/schemas";

/**
 * POST /api/sessions
 * creates a new conversation session with consent and settings
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    // validate request body
    const body = await validateRequest(request, SessionSchemas.create);

    // validate dual consent
    if (!(body.consent.personA && body.consent.personB)) {
      return ApiErrors.validationError(
        "both participants must consent",
        "consent.personA and consent.personB must both be true"
      );
    }

    // generate unique session id
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: Session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      consent: {
        ...body.consent,
        timestamp: body.consent.timestamp || new Date().toISOString(),
      },
      settings: body.settings,
      status: "recording",
    };

    // store in firestore
    try {
      await createDocument("sessions", session);
    } catch (error) {
      throw new DatabaseError(
        "session creation",
        error instanceof Error ? error.message : undefined
      );
    }

    return apiSuccess(session, {
      message: "session created successfully",
      status: 201,
    });
  });
}

/**
 * GET /api/sessions
 * retrieves all sessions, ordered by creation date (most recent first)
 */
export async function GET() {
  return apiHandler(async () => {
    try {
      const sessions = await getDocuments("sessions", [
        orderByField("createdAt", "desc"),
      ]);

      return apiSuccess(sessions, {
        meta: { total: sessions.length },
      });
    } catch (error) {
      throw new DatabaseError(
        "session retrieval",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
