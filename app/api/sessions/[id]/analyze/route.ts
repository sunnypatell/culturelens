// session analysis pipeline API endpoint

import { AnalysisResult, Segment, Metrics, Insight, Debrief } from "@/lib/types";
import { updateDocument, getDocument } from "@/lib/firebase-server-utils";
import {
  apiHandler,
  apiSuccess,
  ApiErrors,
  DatabaseError,
  NotFoundError,
  validateParams,
} from "@/lib/api";
import { SessionSchemas } from "@/lib/api/schemas";

/**
 * POST /api/sessions/[id]/analyze
 * triggers the full analysis pipeline for a session
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    // check if session exists
    let session: any;
    try {
      session = await getDocument("sessions", id);
    } catch (error) {
      throw new DatabaseError("session retrieval", error instanceof Error ? error.message : undefined);
    }

    if (!session) {
      throw new NotFoundError("session", id);
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
      await updateDocument("sessions", id, {
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
    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    let session: any;
    try {
      session = await getDocument("sessions", id);
    } catch (error) {
      throw new DatabaseError("session retrieval", error instanceof Error ? error.message : undefined);
    }

    if (!session) {
      throw new NotFoundError("session", id);
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
