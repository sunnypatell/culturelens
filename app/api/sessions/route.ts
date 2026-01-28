// session management API endpoints

import { Session } from "@/lib/types";
import {
  createDocumentWithId,
  getDocuments,
  orderByField,
  whereEqual,
} from "@/lib/firebase-server-utils";
import {
  apiHandler,
  apiSuccess,
  ApiErrors,
  DatabaseError,
  validateRequest,
  AuthenticationError,
} from "@/lib/api";
import { SessionSchemas } from "@/lib/api/schemas";
import {
  COLLECTIONS,
  generateDocId,
  DOC_PREFIXES,
  FIELDS,
  SESSION_STATUS,
} from "@/lib/firestore-constants";
import { verifyIdToken } from "@/lib/auth-server";
import { logger } from "@/lib/logger";

/**
 * POST /api/sessions
 * creates a new conversation session with consent and settings
 */
export async function POST(request: Request) {
  return apiHandler(async () => {
    logger.info(`[API_SESSIONS_POST] Received session creation request`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    logger.info({ data: userId }, `[API_SESSIONS_POST] Authenticated user:`);

    // validate request body
    const body = await validateRequest(request, SessionSchemas.create);
    logger.info(
      {
        consentPersonA: body.consent.personA,
        consentPersonB: body.consent.personB,
        storageMode: body.settings.storageMode,
      },
      `[API_SESSIONS_POST] Request validated:`
    );

    // validate dual consent
    if (!(body.consent.personA && body.consent.personB)) {
      logger.error(
        { data: body.consent },
        `[API_SESSIONS_POST] Consent validation failed:`
      );
      return ApiErrors.validationError(
        "both participants must consent",
        "consent.personA and consent.personB must both be true"
      );
    }

    // generate unique session id using standard format
    const sessionId = generateDocId(DOC_PREFIXES.SESSION);
    logger.info(
      { data: sessionId },
      `[API_SESSIONS_POST] Generated session ID:`
    );

    const session: Session = {
      id: sessionId,
      userId, // add userId to session
      createdAt: new Date().toISOString(),
      consent: {
        ...body.consent,
        timestamp: body.consent.timestamp || new Date().toISOString(),
      },
      settings: body.settings,
      status: SESSION_STATUS.RECORDING,
      isFavorite: false, // initialize favorite status
    };

    // store in firestore with specific document ID
    try {
      logger.info(`[API_SESSIONS_POST] Storing session in Firestore...`);
      await createDocumentWithId(COLLECTIONS.SESSIONS, sessionId, session);
      logger.info(
        { data: sessionId },
        `[API_SESSIONS_POST] Session created successfully:`
      );
    } catch (error) {
      logger.error(
        { data: error },
        `[API_SESSIONS_POST] Failed to create session:`
      );
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
 * retrieves user's sessions, ordered by creation date (most recent first)
 */
export async function GET(request: Request) {
  return apiHandler(async () => {
    logger.info(`[API_SESSIONS_GET] Fetching sessions...`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    logger.info({ data: userId }, `[API_SESSIONS_GET] Authenticated user:`);

    try {
      const sessions = await getDocuments(COLLECTIONS.SESSIONS, [
        whereEqual("userId", userId),
        orderByField(FIELDS.CREATED_AT, "desc"),
      ]);

      logger.info(
        `[API_SESSIONS_GET] Retrieved ${sessions.length} sessions for user ${userId}`
      );

      return apiSuccess(sessions, {
        meta: { total: sessions.length },
      });
    } catch (error) {
      logger.error(
        { data: error },
        `[API_SESSIONS_GET] Failed to retrieve sessions:`
      );
      throw new DatabaseError(
        "session retrieval",
        error instanceof Error ? error.message : undefined
      );
    }
  });
}
