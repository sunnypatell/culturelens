import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "Missing ElevenLabs environment variables" },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey } }
  );

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: "Failed to get signed URL", detail: text },
      { status: 500 }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
