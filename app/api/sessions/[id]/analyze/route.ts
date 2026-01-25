// session analysis pipeline API endpoint

import {
  AnalysisResult,
  Segment,
  Metrics,
  Insight,
  Debrief,
} from "@/lib/types";
import { updateDocument, getDocument } from "@/lib/firebase-server-utils";
import {
  apiHandler,
  apiSuccess,
  ApiErrors,
  DatabaseError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  validateParams,
} from "@/lib/api";
import { SessionSchemas } from "@/lib/api/schemas";
import { verifyIdToken } from "@/lib/auth-server";
import { COLLECTIONS } from "@/lib/firestore-constants";

/**
 * POST /api/sessions/[id]/analyze
 * triggers the full analysis pipeline for a session
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    console.log(`[API_ANALYZE_POST] Received analysis request`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log(`[API_ANALYZE_POST] Authenticated user:`, userId);

    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    // check if session exists
    let session: any;
    try {
      session = await getDocument(COLLECTIONS.SESSIONS, id);
    } catch (error) {
      throw new DatabaseError(
        "session retrieval",
        error instanceof Error ? error.message : undefined
      );
    }

    if (!session) {
      throw new NotFoundError("session", id);
    }

    // verify ownership
    if (session.userId !== userId) {
      console.error(
        `[API_ANALYZE_POST] Authorization failed: session ${id} belongs to ${session.userId}, not ${userId}`
      );
      throw new AuthorizationError("not authorized to access this session");
    }

    if (session.status !== "processing") {
      return ApiErrors.badRequest(
        "session is not ready for analysis",
        `current status: ${session.status}`
      );
    }

    // TODO: implement actual analysis pipeline
    // for now, create mock analysis results
    const mockSegments: Segment[] = [
      {
        startMs: 0,
        endMs: 5000,
        speaker: "A",
        text: "Hello, how are you doing today?",
        confidence: 0.95,
      },
      {
        startMs: 5500,
        endMs: 10000,
        speaker: "B",
        text: "I'm doing well, thank you. How about you?",
        confidence: 0.92,
      },
    ];

    const mockMetrics: Metrics = {
      talkTimeMs: { A: 5000, B: 4500 },
      turnCount: { A: 1, B: 1 },
      avgTurnLengthMs: { A: 5000, B: 4500 },
      interruptionCount: { A: 0, B: 0 },
      overlapEvents: [],
      silenceEvents: [
        {
          startMs: 5000,
          endMs: 5500,
          afterSpeaker: "A",
        },
      ],
      escalation: [],
    };

    const mockInsights: Insight[] = [];

    const mockDebrief: Debrief = {
      text: "This is a placeholder debrief. Analysis pipeline not yet implemented.",
      audioUrl: "https://example.com/debrief.mp3",
      durationMs: 30000,
      sections: [
        {
          title: "Introduction",
          startChar: 0,
          endChar: 50,
        },
      ],
    };

    const analysisResult: AnalysisResult = {
      session,
      segments: mockSegments,
      metrics: mockMetrics,
      insights: mockInsights,
      debrief: mockDebrief,
    };

    // store analysis results in firestore
    try {
      await updateDocument(COLLECTIONS.SESSIONS, id, {
        status: "ready",
        analysisResult,
        analyzedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new DatabaseError(
        "analysis storage",
        error instanceof Error ? error.message : undefined
      );
    }

    return apiSuccess(analysisResult, {
      message: "analysis completed successfully",
    });
  });
}

/**
 * GET /api/sessions/[id]/analyze
 * retrieves analysis results for a session
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    console.log(`[API_ANALYZE_GET] Fetching analysis results`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log(`[API_ANALYZE_GET] Authenticated user:`, userId);

    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    let session: any;
    try {
      session = await getDocument(COLLECTIONS.SESSIONS, id);
    } catch (error) {
      throw new DatabaseError(
        "session retrieval",
        error instanceof Error ? error.message : undefined
      );
    }

    if (!session) {
      throw new NotFoundError("session", id);
    }

    // verify ownership
    if (session.userId !== userId) {
      console.error(
        `[API_ANALYZE_GET] Authorization failed: session ${id} belongs to ${session.userId}, not ${userId}`
      );
      throw new AuthorizationError("not authorized to access this session");
    }

    if (session.status !== "ready" || !session.analysisResult) {
      return ApiErrors.badRequest(
        "analysis not complete",
        `current status: ${session.status}`
      );
    }

    return apiSuccess(session.analysisResult);
  });
}
