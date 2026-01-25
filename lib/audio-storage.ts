/**
 * audio storage utilities using firestore (free tier workaround)
 * stores audio as base64-encoded strings in firestore documents
 */

import { db } from "./firebase";
import { collection, addDoc, getDoc, doc, Timestamp } from "firebase/firestore";

export interface StoredAudio {
  id: string;
  audioData: string; // base64 encoded audio
  contentType: string;
  size: number; // original size in bytes
  createdAt: string;
  expiresAt?: string; // optional expiration
}

/**
 * stores audio file as base64 in firestore
 * works around firebase storage not being available on free tier
 */
export async function storeAudioInFirestore(
  audioBuffer: ArrayBuffer,
  contentType: string = "audio/mpeg",
  expiresInDays?: number
): Promise<StoredAudio> {
  // convert arraybuffer to base64
  const base64Audio = arrayBufferToBase64(audioBuffer);

  // check size limit (firestore doc limit is 1MB, base64 adds ~33% overhead)
  const estimatedSize = base64Audio.length;
  if (estimatedSize > 900000) {
    // 900KB to be safe
    throw new Error(
      `audio file too large: ${estimatedSize} bytes (max ~900KB after base64 encoding)`
    );
  }

  // calculate expiration if specified
  let expiresAt: string | undefined;
  if (expiresInDays) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + expiresInDays);
    expiresAt = expDate.toISOString();
  }

  // store in firestore
  const docRef = await addDoc(collection(db, "audioFiles"), {
    audioData: base64Audio,
    contentType,
    size: audioBuffer.byteLength,
    createdAt: Timestamp.now(),
    expiresAt: expiresAt ? Timestamp.fromDate(new Date(expiresAt)) : null,
  });

  return {
    id: docRef.id,
    audioData: base64Audio,
    contentType,
    size: audioBuffer.byteLength,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
}

/**
 * retrieves audio from firestore by ID
 */
export async function getAudioFromFirestore(
  audioId: string
): Promise<StoredAudio | null> {
  const docRef = doc(db, "audioFiles", audioId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();

  // check expiration
  if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
    return null; // expired
  }

  return {
    id: docSnap.id,
    audioData: data.audioData,
    contentType: data.contentType,
    size: data.size,
    createdAt: data.createdAt.toDate().toISOString(),
    expiresAt: data.expiresAt?.toDate().toISOString(),
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
  return btoa(binary);
}

/**
 * converts base64 string back to arraybuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * generates a data URL from stored audio (for audio player src)
 */
export function getAudioDataUrl(storedAudio: StoredAudio): string {
  return `data:${storedAudio.contentType};base64,${storedAudio.audioData}`;
}
