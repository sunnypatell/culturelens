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
    let session: any;
    try {
      session = await getDocument("sessions", id);
    } catch (firestoreError) {
      console.error("firestore error fetching session:", firestoreError);
      return NextResponse.json(
        { error: "database error while fetching session" },
        { status: 503 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "session not found" },
        { status: 404 }
      );
    }

    if (session.status !== "recording") {
      return NextResponse.json(
        { error: "session is not in recording state" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "no audio file provided" },
        { status: 400 }
      );
    }

    // Upload to Firebase Storage
    const storagePath = `audio/${id}/${audioFile.name}`;
    let downloadURL: string;
    try {
      const result = await uploadFile(audioFile, storagePath);
      downloadURL = result.downloadURL;
    } catch (storageError) {
      console.error("firebase storage error:", storageError);
      return NextResponse.json(
        { error: "failed to upload audio file to storage" },
        { status: 503 }
      );
    }

    // Update session status and add audio URL
    try {
      await updateDocument("sessions", id, {
        status: "processing",
        audioUrl: downloadURL,
        audioPath: storagePath,
      });
    } catch (firestoreError) {
      console.error("firestore error updating session:", firestoreError);
      return NextResponse.json(
        { error: "audio uploaded but failed to update session" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: id,
      audioUrl: downloadURL,
      message: "audio uploaded successfully",
    });
  } catch (error) {
    console.error("audio upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json(
      { error: "failed to upload audio", details: errorMessage },
      { status: 500 }
    );
  }
}
