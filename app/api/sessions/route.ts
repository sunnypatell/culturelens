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
        { error: "Missing consent or settings" },
        { status: 400 }
      );
    }

    // Validate dual consent
    if (!(consent.personA && consent.personB)) {
      return NextResponse.json(
        { error: "Both participants must consent" },
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
    await createDocument("sessions", session);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
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
    console.error("Session listing error:", error);
    return NextResponse.json(
      { error: "Failed to list sessions" },
      { status: 500 }
    );
  }
}
