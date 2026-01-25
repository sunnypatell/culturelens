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
  validateParams,
} from "@/lib/api";
import { SessionSchemas } from "@/lib/api/schemas";

/**
 * POST /api/sessions/[id]/upload
 * uploads audio file for a session and updates session status
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    // validate params
    const { id } = validateParams(await params, SessionSchemas.params);

    // check if session exists
    let session: any;
    try {
      session = await getDocument("sessions", id);
    } catch (error) {
      throw new DatabaseError(
        "session retrieval",
        error instanceof Error ? error.message : undefined
      );
    }

    if (!session) {
      throw new NotFoundError("session", id);
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
      await updateDocument("sessions", id, {
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
