// session audio upload API endpoint

import {
  getDocument,
  updateDocument,
  uploadFile,
} from "@/lib/firebase-server-utils";
import {
  apiHandler,
  apiSuccess,
  ApiErrors,
  DatabaseError,
  ExternalServiceError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  validateParams,
} from "@/lib/api";
import { SessionSchemas } from "@/lib/api/schemas";
import { verifyIdToken } from "@/lib/auth-server";
import { COLLECTIONS } from "@/lib/firestore-constants";

/**
 * POST /api/sessions/[id]/upload
 * uploads audio file for a session and updates session status
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    console.log(`[API_UPLOAD_POST] Received upload request`);

    // authenticate user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log(`[API_UPLOAD_POST] Authenticated user:`, userId);

    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    // check if session exists
    let session: any;
    try {
      session = await getDocument(COLLECTIONS.SESSIONS, id);
    } catch (error) {
      throw new DatabaseError(
        "session retrieval",
        error instanceof Error ? error.message : undefined
      );
    }

    if (!session) {
      throw new NotFoundError("session", id);
    }

    // verify ownership
    if (session.userId !== userId) {
      console.error(
        `[API_UPLOAD_POST] Authorization failed: session ${id} belongs to ${session.userId}, not ${userId}`
      );
      throw new AuthorizationError("not authorized to access this session");
    }

    if (session.status !== "recording") {
      return ApiErrors.badRequest(
        "session is not in recording state",
        `current status: ${session.status}`
      );
    }

    // extract audio file from form data
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return ApiErrors.badRequest("no audio file provided");
    }

    // validate file type - only allow audio files
    const allowedMimeTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/m4a",
      "audio/mp4",
    ];

    if (!allowedMimeTypes.includes(audioFile.type)) {
      return ApiErrors.validationError(
        "invalid file type",
        `only audio files are allowed. received: ${audioFile.type}`
      );
    }

    // validate file size - max 50MB
    const maxSizeBytes = 50 * 1024 * 1024; // 50MB
    if (audioFile.size > maxSizeBytes) {
      return ApiErrors.validationError(
        "file too large",
        `maximum file size is 50MB. received: ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`
      );
    }

    // upload to firebase storage
    const storagePath = `audio/${id}/${audioFile.name}`;
    let downloadURL: string;

    try {
      const result = await uploadFile(audioFile, storagePath);
      downloadURL = result.downloadURL;
    } catch (error) {
      throw new ExternalServiceError(
        "firebase storage",
        error instanceof Error ? error.message : undefined
      );
    }

    // update session status and add audio url
    try {
      await updateDocument(COLLECTIONS.SESSIONS, id, {
        status: "processing",
        audioUrl: downloadURL,
        audioPath: storagePath,
      });
    } catch (error) {
      throw new DatabaseError(
        "session update",
        error instanceof Error ? error.message : undefined
      );
    }

    return apiSuccess(
      {
        sessionId: id,
        audioUrl: downloadURL,
      },
      {
        message: "audio uploaded successfully",
        status: 200,
      }
    );
  });
}
