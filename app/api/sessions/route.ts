// CultureLens — Session Management API
// POST /api/sessions — create a new recording session
// GET  /api/sessions — list sessions (for analysis library)

import { NextResponse } from "next/server";
import { Session } from "@/lib/types";

// TODO: replace with Firebase or persistent storage
const sessions: Map<string, Session> = new Map();

export async function POST(request: Request) {
  // TODO: implement session creation
  //
  // 1. Parse request body (consent flags, settings)
  // 2. Generate unique session ID
  // 3. Store session with status: 'recording'
  // 4. Return session object

  return NextResponse.json(
    { error: "POST /api/sessions not implemented yet" },
    { status: 501 }
  );
}

export async function GET() {
  // TODO: implement session listing
  //
  // 1. Return all sessions (or paginated)
  // 2. Filter by status if query param provided

  return NextResponse.json(
    { error: "GET /api/sessions not implemented yet" },
    { status: 501 }
  );
}
