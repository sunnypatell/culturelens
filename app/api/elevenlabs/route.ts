import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.elevenlabs_api;
  const agentId = process.env.elevenlabs_agent_id;

  if (!apiKey || !agentId) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const r = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey } }
  );

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ error: "Failed to get signed url", detail: text }, { status: 500 });
  }

  const data = await r.json(); // { signed_url: "wss://..." }
  return NextResponse.json(data);
}
