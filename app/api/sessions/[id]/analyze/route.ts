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
    const session = await getDocument("sessions", id) as any;
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "processing") {
      return NextResponse.json(
        { error: "Session is not ready for analysis" },
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
    await updateDocument("sessions", id, {
      status: "ready",
      analysisResult,
      analyzedAt: new Date().toISOString(),
    });

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze session" },
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

    const session = await getDocument("sessions", id) as any;
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "ready" || !session.analysisResult) {
      return NextResponse.json(
        { error: "Analysis not complete" },
        { status: 202 }
      );
    }

    return NextResponse.json(session.analysisResult);
  } catch (error) {
    console.error("Analysis retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to get analysis results" },
      { status: 500 }
    );
  }
}
