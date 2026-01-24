// CultureLens — Audio Upload API
// POST /api/sessions/[id]/upload — receive recorded audio blob

import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // TODO: implement audio upload
  //
  // 1. Validate session exists and status is 'recording'
  // 2. Read audio blob from request (multipart/form-data or raw body)
  // 3. Store temporarily (filesystem, memory, or cloud storage)
  // 4. Update session status to 'uploading' → 'processing'
  // 5. Return success with file metadata

  return NextResponse.json(
    { error: `POST /api/sessions/${id}/upload not implemented yet` },
    { status: 501 }
  );
}
