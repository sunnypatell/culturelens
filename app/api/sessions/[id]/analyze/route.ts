// CultureLens — Analysis Pipeline API
// POST /api/sessions/[id]/analyze — trigger the full analysis pipeline
// GET  /api/sessions/[id]/analyze — get analysis results

import { NextResponse } from "next/server";
import { AnalysisResult, Segment, Metrics, Insight, Debrief } from "@/lib/types";
import { updateDocument, getDocument } from "@/lib/firebase-server-utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if session exists
    let session: any;
    try {
      session = await getDocument("sessions", id);
    } catch (firestoreError) {
      console.error("firestore error fetching session:", firestoreError);
      return NextResponse.json(
        { error: "database error while fetching session" },
        { status: 503 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "processing") {
      return NextResponse.json(
        { error: "session is not ready for analysis" },
        { status: 400 }
      );
    }

    // TODO: Implement actual analysis pipeline
    // For now, create mock analysis results
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

    const mockInsights: Insight[] = []; // Currently empty as requested

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

    // Store analysis results in Firestore
    try {
      await updateDocument("sessions", id, {
        status: "ready",
        analysisResult,
        analyzedAt: new Date().toISOString(),
      });
    } catch (firestoreError) {
      console.error("firestore error storing analysis:", firestoreError);
      return NextResponse.json(
        { error: "analysis completed but failed to store results" },
        { status: 503 }
      );
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { error: "failed to analyze session", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let session: any;
    try {
      session = await getDocument("sessions", id);
    } catch (firestoreError) {
      console.error("firestore error fetching session:", firestoreError);
      return NextResponse.json(
        { error: "database error while fetching session" },
        { status: 503 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "ready" || !session.analysisResult) {
      return NextResponse.json(
        { error: "analysis not complete" },
        { status: 202 }
      );
    }

    return NextResponse.json(session.analysisResult);
  } catch (error) {
    console.error("analysis retrieval error:", error);
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { error: "failed to get analysis results", details: errorMessage },
      { status: 500 }
    );
  }
}
