// session analysis pipeline API endpoint

import {
  Session,
  AnalysisResult,
  Segment,
  Metrics,
  Insight,
  Debrief,
} from "@/lib/types";
import { analyzeTranscriptWithGemini } from "@/lib/gemini-analysis";
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
import { logger } from "@/lib/logger";

/**
 * POST /api/sessions/[id]/analyze
 * triggers the full analysis pipeline for a session
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    logger.info(`[API_ANALYZE_POST] Received analysis request`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    logger.info({ data: userId }, `[API_ANALYZE_POST] Authenticated user:`);

    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    // check if session exists
    let session: (Session & { id: string }) | null;
    try {
      session = (await getDocument(COLLECTIONS.SESSIONS, id)) as
        | (Session & { id: string })
        | null;
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
      logger.error(
        `[API_ANALYZE_POST] Authorization failed: session ${id} belongs to ${session.userId}, not ${userId}`
      );
      throw new AuthorizationError("not authorized to access this session");
    }

    // allow analysis for sessions that haven't been analyzed yet
    // or are in processing state - skip only if already "ready" with results
    if (session.status === "ready" && session.analysisResult) {
      logger.info(
        `[API_ANALYZE_POST] Session ${id} already analyzed, returning existing results`
      );
      return apiSuccess(session.analysisResult, {
        message: "analysis already completed",
      });
    }

    // update status to processing
    await updateDocument(COLLECTIONS.SESSIONS, id, {
      status: "processing",
    });

    // fetch transcript for this session
    let transcript: { transcript?: string; id: string } | null = null;
    try {
      const transcripts = await getDocuments(COLLECTIONS.TRANSCRIPTS, [
        whereEqual("sessionId", id),
      ]);
      transcript = transcripts[0] as { transcript?: string; id: string };
    } catch (error) {
      logger.error(
        { data: error },
        `[API_ANALYZE_POST] Failed to fetch transcript:`
      );
    }

    // if no transcript, create basic mock data
    if (!transcript || !transcript.transcript) {
      logger.warn(
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

    // detect interruptions (speaker changes with gap < 500ms)
    let interruptionCountA = 0;
    let interruptionCountB = 0;
    const overlapEvents: Metrics["overlapEvents"] = [];

    for (let i = 1; i < segments.length; i++) {
      const prev = segments[i - 1];
      const curr = segments[i];

      if (
        prev.speaker !== curr.speaker &&
        (curr.speaker === "A" || curr.speaker === "B")
      ) {
        const gap = curr.startMs - prev.endMs;

        if (gap < 500) {
          // interruption detected
          if (curr.speaker === "A") {
            interruptionCountA++;
          } else {
            interruptionCountB++;
          }

          overlapEvents.push({
            atMs: curr.startMs,
            by: curr.speaker,
            snippet: curr.text.substring(0, 50),
          });
        }
      }
    }

    const metrics: Metrics = {
      talkTimeMs: { A: talkTimeA, B: talkTimeB },
      turnCount: { A: turnCountA, B: turnCountB },
      avgTurnLengthMs: {
        A: turnCountA > 0 ? talkTimeA / turnCountA : 0,
        B: turnCountB > 0 ? talkTimeB / turnCountB : 0,
      },
      interruptionCount: { A: interruptionCountA, B: interruptionCountB },
      overlapEvents,
      silenceEvents: [],
      escalation: [],
    };

    // ============================================================================
    // GEMINI AI INTEGRATION (Production)
    // ============================================================================
    // Using Google Gemini 2.5 Flash for sophisticated cultural analysis
    // Project: CultureLens
    // Gemini Project ID: gen-lang-client-0985823799
    // Gemini Project Number: 119358341094
    // ============================================================================

    logger.info(`[API_ANALYZE_POST] Running Gemini AI analysis...`);

    // prepare segments for Gemini analysis
    const geminiSegments = segments.map((seg) => ({
      speaker: seg.speaker,
      text: seg.text,
      startTime: seg.startMs,
      endTime: seg.endMs,
    }));

    // run Gemini analysis
    const geminiAnalysis = await analyzeTranscriptWithGemini(
      transcriptText,
      geminiSegments
    );

    logger.info(
      {
        summaryLength: geminiAnalysis.summary.length,
        keyPointsCount: geminiAnalysis.keyPoints.length,
        culturalObservationsCount: geminiAnalysis.culturalObservations.length,
        communicationPatternsCount: geminiAnalysis.communicationPatterns.length,
        recommendationsCount: geminiAnalysis.recommendations.length,
      },
      `[API_ANALYZE_POST] Gemini analysis complete:`
    );

    // convert Gemini analysis to insights format
    const insights: Insight[] = [];

    // add cultural observations as insights
    geminiAnalysis.culturalObservations.forEach((observation, index) => {
      insights.push({
        id: `cultural-${index}`,
        category: "culturalLens",
        title: `cultural observation ${index + 1}`,
        summary: observation,
        confidence: "high",
        evidence: [],
        whyThisWasFlagged:
          "identified by Gemini AI cultural communication analysis",
      });
    });

    // add communication patterns as insights
    geminiAnalysis.communicationPatterns.forEach((pattern, index) => {
      insights.push({
        id: `pattern-${index}`,
        category: "turnTaking",
        title: `communication pattern ${index + 1}`,
        summary: pattern,
        confidence: "high",
        evidence: [],
        whyThisWasFlagged:
          "identified by Gemini AI communication pattern detection",
      });
    });

    // add balance insight based on metrics
    const totalTalkTime = talkTimeA + talkTimeB;
    const balanceRatio = totalTalkTime > 0 ? talkTimeA / totalTalkTime : 0.5;
    const totalInterruptions = interruptionCountA + interruptionCountB;

    if (balanceRatio < 0.3 || balanceRatio > 0.7) {
      insights.push({
        id: "balance",
        category: "turnTaking",
        title: "participation balance",
        summary: `participant ${balanceRatio > 0.5 ? "A" : "B"} contributed ${Math.round(Math.max(balanceRatio, 1 - balanceRatio) * 100)}% of speaking time`,
        confidence: "high",
        evidence: [],
        whyThisWasFlagged: "measured from conversation metrics",
      });
    }

    // generate comprehensive debrief text using Gemini analysis
    const debriefText = `${geminiAnalysis.summary}

Key Discussion Points:
${geminiAnalysis.keyPoints.map((point) => `• ${point}`).join("\n")}

Cultural Communication Insights:
${geminiAnalysis.culturalObservations.map((obs) => `• ${obs}`).join("\n")}

Communication Patterns Identified:
${geminiAnalysis.communicationPatterns.map((pattern) => `• ${pattern}`).join("\n")}

Recommendations for Future Conversations:
${geminiAnalysis.recommendations.map((rec) => `• ${rec}`).join("\n")}

Participation Metrics:
• Total turns: ${turnCountA + turnCountB} (Participant A: ${turnCountA}, Participant B: ${turnCountB})
• Speaking time distribution: Participant A ${Math.round(balanceRatio * 100)}%, Participant B ${Math.round((1 - balanceRatio) * 100)}%
${totalInterruptions > 0 ? `• Interruptions detected: ${totalInterruptions}` : "• No interruptions detected"}

This analysis was powered by Google Gemini AI with CultureLens cultural communication expertise.`;

    const debrief: Debrief = {
      text: debriefText,
      audioUrl: "",
      durationMs: 0,
      sections: [
        {
          title: "overview",
          startChar: 0,
          endChar: debriefText.indexOf("participation"),
        },
        {
          title: "metrics",
          startChar: debriefText.indexOf("participation"),
          endChar: debriefText.indexOf("key insights"),
        },
        {
          title: "insights",
          startChar: debriefText.indexOf("key insights"),
          endChar: debriefText.length,
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
    logger.info(`[API_ANALYZE_GET] Fetching analysis results`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    logger.info({ data: userId }, `[API_ANALYZE_GET] Authenticated user:`);

    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    let session: (Session & { id: string }) | null;
    try {
      session = (await getDocument(COLLECTIONS.SESSIONS, id)) as
        | (Session & { id: string })
        | null;
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
      logger.error(
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
