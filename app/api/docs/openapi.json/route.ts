import { NextResponse } from "next/server";
import { buildOpenAPISpec } from "@/lib/api/openapi";

export async function GET() {
  const spec = buildOpenAPISpec();

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
