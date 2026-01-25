// session management API endpoints

import { Session } from "@/lib/types";
import {
  createDocumentWithId,
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
import {
  COLLECTIONS,
  generateDocId,
  DOC_PREFIXES,
  FIELDS,
  SESSION_STATUS,
} from "@/lib/firestore-constants";

/**
 * POST /api/sessions
 * creates a new conversation session with consent and settings
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    console.log(`[API_SESSIONS_POST] Received session creation request`);

    // validate request body
    const body = await validateRequest(request, SessionSchemas.create);
    console.log(`[API_SESSIONS_POST] Request validated:`, {
      consentPersonA: body.consent.personA,
      consentPersonB: body.consent.personB,
      storageMode: body.settings.storageMode,
    });

    // validate dual consent
    if (!(body.consent.personA && body.consent.personB)) {
      console.error(
        `[API_SESSIONS_POST] Consent validation failed:`,
        body.consent
      );
      return ApiErrors.validationError(
        "both participants must consent",
        "consent.personA and consent.personB must both be true"
      );
    }

    // generate unique session id using standard format
    const sessionId = generateDocId(DOC_PREFIXES.SESSION);
    console.log(`[API_SESSIONS_POST] Generated session ID:`, sessionId);

    const session: Session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      consent: {
        ...body.consent,
        timestamp: body.consent.timestamp || new Date().toISOString(),
      },
      settings: body.settings,
      status: SESSION_STATUS.RECORDING,
    };

    // store in firestore with specific document ID
    try {
      console.log(`[API_SESSIONS_POST] Storing session in Firestore...`);
      await createDocumentWithId(COLLECTIONS.SESSIONS, sessionId, session);
      console.log(`[API_SESSIONS_POST] Session created successfully:`, sessionId);
    } catch (error) {
      console.error(`[API_SESSIONS_POST] Failed to create session:`, error);
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
    console.log(`[API_SESSIONS_GET] Fetching all sessions...`);

    try {
      const sessions = await getDocuments(COLLECTIONS.SESSIONS, [
        orderByField(FIELDS.CREATED_AT, "desc"),
      ]);

      console.log(`[API_SESSIONS_GET] Retrieved ${sessions.length} sessions`);

      return apiSuccess(sessions, {
        meta: { total: sessions.length },
      });
    } catch (error) {
      console.error(`[API_SESSIONS_GET] Failed to retrieve sessions:`, error);
      throw new DatabaseError(
        "session retrieval",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
