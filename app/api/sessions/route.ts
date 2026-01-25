// CultureLens — Session Management API
// POST /api/sessions — create a new recording session
// GET  /api/sessions — list sessions (for analysis library)

import { NextResponse } from "next/server";
import { Session } from "@/lib/types";
import { createDocument, getDocuments, orderByField } from "@/lib/firebase-server-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { consent, settings } = body;

    if (!consent || !settings) {
      return NextResponse.json(
        { error: "missing consent or settings" },
        { status: 400 }
      );
    }

    // Validate dual consent
    if (!(consent.personA && consent.personB)) {
      return NextResponse.json(
        { error: "both participants must consent" },
        { status: 400 }
      );
    }

    // Generate unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: Session = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      consent,
      settings,
      status: "recording",
    };

    // Store in Firestore
    try {
      await createDocument("sessions", session);
    } catch (firestoreError) {
      console.error("firestore error creating session:", firestoreError);
      return NextResponse.json(
        { error: "database error while creating session" },
        { status: 503 }
      );
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("session creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { error: "failed to create session", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all sessions from Firestore, ordered by createdAt desc
    const sessions = await getDocuments("sessions", [orderByField("createdAt", "desc")]);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("session listing error:", error);
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { error: "failed to list sessions", details: errorMessage },
      { status: 500 }
    );
  }
}
