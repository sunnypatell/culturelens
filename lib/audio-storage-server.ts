/**
 * server-side audio storage using firestore (free tier workaround)
 * stores audio as base64-encoded strings in firestore documents
 *
 * NOTE: firebase storage IS available on free tier, but this provides
 * an alternative solution using only firestore
 */

import { createDocument, getDocument } from "./firebase-server-utils";

export interface StoredAudio {
  id: string;
  audioData: string; // base64 encoded audio
  contentType: string;
  size: number; // original size in bytes
  userId: string; // owner of the audio file
  sessionId?: string; // optional session association
  createdAt: string;
  expiresAt?: string; // optional expiration (for cleanup)
}

/**
 * stores audio file as base64 in firestore
 * alternative to firebase storage for free tier
 */
export async function storeAudioInFirestore(
  audioBuffer: ArrayBuffer,
  userId: string,
  contentType: string = "audio/mpeg",
  expiresInDays: number = 7, // auto-expire after 7 days
  sessionId?: string // optional session association
): Promise<{ id: string; size: number }> {
  // convert arraybuffer to base64
  const base64Audio = arrayBufferToBase64(audioBuffer);

  // check size limit (firestore doc limit is 1MB, base64 adds ~33% overhead)
  const estimatedSize = base64Audio.length;
  if (estimatedSize > 900000) {
    // 900KB to be safe
    const estimatedKB = Math.round(estimatedSize / 1024);
    const originalKB = Math.round(audioBuffer.byteLength / 1024);
    throw new Error(
      `audio file too large: ${estimatedKB}KB (max ~900KB after base64 encoding). original size: ${originalKB}KB`
    );
  }

  // calculate expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // store in firestore
  const audioId = await createDocument("audioFiles", {
    audioData: base64Audio,
    contentType,
    size: audioBuffer.byteLength,
    userId,
    sessionId,
    expiresAt: expiresAt.toISOString(),
  });

  return {
    id: audioId,
    size: audioBuffer.byteLength,
  };
}

/**
 * retrieves audio from firestore by ID (for API route to serve)
 */
export async function getAudioFromFirestore(
  audioId: string
): Promise<StoredAudio | null> {
  const doc = (await getDocument("audioFiles", audioId)) as
    | (StoredAudio & { id: string })
    | null;

  if (!doc) {
    return null;
  }

  // check expiration
  if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
    return null; // expired
  }

  return {
    id: audioId,
    audioData: doc.audioData,
    contentType: doc.contentType || "audio/mpeg",
    size: doc.size,
    userId: doc.userId,
    sessionId: doc.sessionId,
    createdAt: doc.createdAt,
    expiresAt: doc.expiresAt,
  };
}

/**
 * converts arraybuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return Buffer.from(binary, "binary").toString("base64");
}

/**
 * converts base64 string back to buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}
