// session analysis pipeline API endpoint

import {
  AnalysisResult,
  Segment,
  Metrics,
  Insight,
  Debrief,
} from "@/lib/types";
import {
  updateDocument,
  getDocument,
  getDocuments,
  whereEqual,
} from "@/lib/firebase-server-utils";
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

    // fetch transcript for this session
    let transcript: any = null;
    try {
      const transcripts = await getDocuments(COLLECTIONS.TRANSCRIPTS, [
        whereEqual("sessionId", id),
      ]);
      transcript = transcripts[0];
    } catch (error) {
      console.error(`[API_ANALYZE_POST] Failed to fetch transcript:`, error);
    }

    // if no transcript, create basic mock data
    if (!transcript || !transcript.transcript) {
      console.warn(
        `[API_ANALYZE_POST] No transcript found for session ${id}, using mock data`
      );

      const mockSegments: Segment[] = [
        {
          startMs: 0,
          endMs: 5000,
          speaker: "A",
          text: "conversation transcript not available",
          confidence: 1.0,
        },
      ];

      const mockMetrics: Metrics = {
        talkTimeMs: { A: 5000, B: 0 },
        turnCount: { A: 1, B: 0 },
        avgTurnLengthMs: { A: 5000, B: 0 },
        interruptionCount: { A: 0, B: 0 },
        overlapEvents: [],
        silenceEvents: [],
        escalation: [],
      };

      const mockInsights: Insight[] = [
        {
          id: "1",
          category: "culturalLens",
          title: "transcript unavailable",
          summary: "no transcript was found for this session",
          confidence: "low",
          evidence: [],
          whyThisWasFlagged:
            "analysis requires a transcript to generate insights",
        },
      ];

      const mockDebrief: Debrief = {
        text: "no transcript available for this session. please ensure the recording captured audio successfully.",
        audioUrl: "",
        durationMs: 0,
        sections: [],
      };

      const analysisResult: AnalysisResult = {
        session,
        segments: mockSegments,
        metrics: mockMetrics,
        insights: mockInsights,
        debrief: mockDebrief,
      };

      await updateDocument(COLLECTIONS.SESSIONS, id, {
        status: "ready",
        analysisResult,
        analyzedAt: new Date().toISOString(),
      });

      return apiSuccess(analysisResult, {
        message: "analysis completed with mock data (no transcript found)",
      });
    }

    // parse transcript into segments
    const transcriptText: string = transcript.transcript;
    const lines = transcriptText.split("\n").filter((line) => line.trim());

    const segments: Segment[] = lines
      .map((line, index) => {
        // try to extract timestamp and speaker from transcript format
        // expected format: "[2024-01-25T12:34:56.789Z] speaker: text"
        const timestampMatch = line.match(/\[([^\]]+)\]/);
        const speakerMatch = line.match(/\]\s*([AB]|speaker\s*[AB]?):/i);
        const textMatch = line.match(/:\s*(.+)$/);

        const timestamp = timestampMatch
          ? new Date(timestampMatch[1]).getTime()
          : index * 5000;
        const speaker = speakerMatch ? "A" : index % 2 === 0 ? "A" : "B";
        const text = textMatch ? textMatch[1].trim() : line;

        return {
          startMs: timestamp,
          endMs: timestamp + 3000, // assume 3 second duration per segment
          speaker: speaker as "A" | "B" | "unknown",
          text,
          confidence: 0.9,
        };
      })
      .filter((seg) => seg.text.length > 0);

    // calculate metrics from segments
    const talkTimeA = segments
      .filter((s) => s.speaker === "A")
      .reduce((sum, s) => sum + (s.endMs - s.startMs), 0);
    const talkTimeB = segments
      .filter((s) => s.speaker === "B")
      .reduce((sum, s) => sum + (s.endMs - s.startMs), 0);

    const turnCountA = segments.filter((s) => s.speaker === "A").length;
    const turnCountB = segments.filter((s) => s.speaker === "B").length;

    const metrics: Metrics = {
      talkTimeMs: { A: talkTimeA, B: talkTimeB },
      turnCount: { A: turnCountA, B: turnCountB },
      avgTurnLengthMs: {
        A: turnCountA > 0 ? talkTimeA / turnCountA : 0,
        B: turnCountB > 0 ? talkTimeB / turnCountB : 0,
      },
      interruptionCount: { A: 0, B: 0 }, // TODO: detect interruptions
      overlapEvents: [],
      silenceEvents: [],
      escalation: [],
    };

    // generate insights based on metrics
    const insights: Insight[] = [];

    // turn-taking balance insight
    const totalTalkTime = talkTimeA + talkTimeB;
    const balanceRatio =
      totalTalkTime > 0 ? talkTimeA / totalTalkTime : 0.5;

    if (balanceRatio < 0.3 || balanceRatio > 0.7) {
      insights.push({
        id: "balance",
        category: "turnTaking",
        title: "unbalanced participation",
        summary: `participant ${balanceRatio > 0.5 ? "A" : "B"} dominated the conversation with ${Math.round(Math.max(balanceRatio, 1 - balanceRatio) * 100)}% of speaking time`,
        confidence: "high",
        evidence: [
          {
            startMs: 0,
            endMs: segments[segments.length - 1]?.endMs || 0,
            quote: "full conversation",
          },
        ],
        whyThisWasFlagged:
          "significant imbalance in speaking time can indicate power dynamics or engagement issues",
      });
    }

    // generate debrief text
    const debriefText = `conversation analysis complete.

participated: ${turnCountA + turnCountB} total turns
speaking time: participant A spoke for ${Math.round(talkTimeA / 1000)} seconds (${Math.round(balanceRatio * 100)}%), participant B spoke for ${Math.round(talkTimeB / 1000)} seconds (${Math.round((1 - balanceRatio) * 100)}%)

${insights.length > 0 ? `key insights:\n${insights.map((i) => `- ${i.title}: ${i.summary}`).join("\n")}` : "no significant patterns detected"}`;

    const debrief: Debrief = {
      text: debriefText,
      audioUrl: "", // TODO: generate audio via elevenlabs
      durationMs: 0,
      sections: [
        {
          title: "overview",
          startChar: 0,
          endChar: debriefText.indexOf("\n\n"),
        },
      ],
    };

    const analysisResult: AnalysisResult = {
      session,
      segments,
      metrics,
      insights,
      debrief,
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
