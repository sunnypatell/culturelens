// CultureLens — ElevenLabs Signed URL Endpoint
// GET /api/elevenlabs/signed-url
//
// Used for PRIVATE agents that require authentication.
// If your agent is PUBLIC, the client connects directly with agentId
// and this endpoint is not needed.
//
// Docs: https://elevenlabs.io/docs/conversational-ai/api-reference/conversations/get-signed-url
// Note: API key must have "Agents Write" (convai_write) permission scope.

import {
  apiHandler,
  apiSuccess,
  AuthenticationError,
  ExternalServiceError,
} from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  return apiHandler(async () => {
    logger.info(`[API_SIGNED_URL] Requesting signed URL`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    logger.info({ data: userId }, `[API_SIGNED_URL] Authenticated user:`);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      throw new ExternalServiceError(
        "elevenlabs configuration",
        "ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID environment variables must be set"
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": apiKey } }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const detail = body?.detail;

      // provide actionable error messages for permission issues
      if (detail?.status === "missing_permissions") {
        throw new AuthenticationError(
          "API key missing required permission",
          "regenerate your ElevenLabs API key with 'Agents Write' (convai_write) permission enabled. or use NEXT_PUBLIC_ELEVENLABS_AGENT_ID for public agent mode instead."
        );
      }

      throw new ExternalServiceError(
        "elevenlabs API",
        detail?.message || `status ${response.status}: ${JSON.stringify(body)}`
      );
    }

    const data = await response.json();
    return apiSuccess(data);
  });
}
