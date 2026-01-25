// CultureLens — Transcript Management API
// POST /api/transcripts — save conversation transcript

import { NextResponse } from "next/server";
import { createDocument } from "@/lib/firebase-server-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, transcript, timestamp, segments } = body;

    if (!sessionId || !transcript) {
      return NextResponse.json(
        { error: "missing sessionId or transcript" },
        { status: 400 }
      );
    }

    // store transcript in firestore
    const transcriptId = await createDocument("transcripts", {
      sessionId,
      transcript,
      timestamp: timestamp || new Date().toISOString(),
      segments: segments || [],
    });

    return NextResponse.json(
      {
        success: true,
        transcriptId,
        sessionId,
        message: "transcript saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("transcript save error:", error);
    return NextResponse.json(
      { error: "failed to save transcript" },
      { status: 500 }
    );
  }
}
