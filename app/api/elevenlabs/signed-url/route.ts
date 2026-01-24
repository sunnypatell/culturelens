// CultureLens — ElevenLabs Signed URL Endpoint
// GET /api/elevenlabs/signed-url
//
// Used for PRIVATE agents that require authentication.
// If your agent is PUBLIC, the client connects directly with agentId
// and this endpoint is not needed.
//
// Docs: https://elevenlabs.io/docs/conversational-ai/api-reference/conversations/get-signed-url
// Note: API key must have "Agents Write" (convai_write) permission scope.

import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      {
        error: "Missing ElevenLabs environment variables",
        hint: "Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID in .env.local",
      },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey } }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body?.detail;

    // Provide actionable error messages
    if (detail?.status === "missing_permissions") {
      return NextResponse.json(
        {
          error: "API key missing required permission",
          hint: "Regenerate your ElevenLabs API key with 'Agents Write' (convai_write) permission enabled. Or use NEXT_PUBLIC_ELEVENLABS_AGENT_ID for public agent mode instead.",
          detail: detail.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to get signed URL from ElevenLabs",
        status: response.status,
        detail: detail?.message || JSON.stringify(body),
      },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
