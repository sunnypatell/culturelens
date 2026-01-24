// CultureLens — Audio Upload API
// POST /api/sessions/[id]/upload — receive recorded audio blob

import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/firebase-server-utils";
import { updateDocument, getDocument } from "@/lib/firebase-server-utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if session exists
    const session = await getDocument("sessions", id) as any;
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "recording") {
      return NextResponse.json(
        { error: "Session is not in recording state" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Upload to Firebase Storage
    const storagePath = `audio/${id}/${audioFile.name}`;
    const { downloadURL } = await uploadFile(audioFile, storagePath);

    // Update session status and add audio URL
    await updateDocument("sessions", id, {
      status: "processing",
      audioUrl: downloadURL,
      audioPath: storagePath,
    });

    return NextResponse.json({
      success: true,
      sessionId: id,
      audioUrl: downloadURL,
      message: "Audio uploaded successfully",
    });
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload audio" },
      { status: 500 }
    );
  }
}
