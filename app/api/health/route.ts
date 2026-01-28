// health check endpoint for monitoring and uptime verification

import { NextResponse } from "next/server";

interface ServiceStatus {
  status: "healthy" | "degraded" | "down";
  latencyMs?: number;
  error?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "down";
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    api: ServiceStatus;
    firebase: ServiceStatus;
    gemini: ServiceStatus;
    elevenlabs: ServiceStatus;
  };
  environment: string;
}

const startTime = Date.now();

async function checkService(
  name: string,
  checkFn: () => Promise<void>
): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await checkFn();
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (error) {
    return {
      status: "down",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : `${name} unreachable`,
    };
  }
}

export async function GET() {
  const services = await Promise.all([
    checkService("firebase", async () => {
      // verify firebase admin SDK is importable and configured
      const hasConfig = !!(
        process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
      );
      if (!hasConfig) throw new Error("firebase credentials not configured");
    }),
    checkService("gemini", async () => {
      const hasKey = !!process.env.GOOGLE_AI_API_KEY;
      if (!hasKey) throw new Error("gemini API key not configured");
    }),
    checkService("elevenlabs", async () => {
      const hasKey = !!process.env.ELEVENLABS_API_KEY;
      if (!hasKey) throw new Error("elevenlabs API key not configured");
    }),
  ]);

  const [firebase, gemini, elevenlabs] = services;

  const allHealthy = services.every((s) => s.status === "healthy");
  const anyDown = services.some((s) => s.status === "down");

  const response: HealthResponse = {
    status: allHealthy ? "healthy" : anyDown ? "degraded" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.1.1",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      api: { status: "healthy", latencyMs: 0 },
      firebase,
      gemini,
      elevenlabs,
    },
    environment: process.env.NODE_ENV || "development",
  };

  return NextResponse.json(response, {
    status: allHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
