import { logger } from "@/lib/logger";

// Firestore collection names and document ID conventions
// ensures consistent, human-readable naming across the application

/**
 * collection names - top level collections in Firestore
 */
export const COLLECTIONS = {
  USERS: "users",
  SESSIONS: "sessions",
  TRANSCRIPTS: "transcripts",
} as const;

/**
 * subcollection names - nested under parent documents
 */
export const SUBCOLLECTIONS = {
  USER_SESSIONS: "user_sessions",
  SESSION_SEGMENTS: "session_segments",
  SESSION_INSIGHTS: "session_insights",
  USER_LINKED_ACCOUNTS: "linked_accounts",
} as const;

/**
 * document ID prefixes for readable IDs
 */
export const DOC_PREFIXES = {
  USER: "user",
  SESSION: "session",
  TRANSCRIPT: "transcript",
  AUDIO: "audio",
  ANALYSIS: "analysis",
  SEGMENT: "segment",
  INSIGHT: "insight",
} as const;

/**
 * generates a human-readable document ID with timestamp and random string
 * @param prefix - the prefix for the document type
 * @returns formatted document ID like "session_20260125_a1b2c3d4"
 */
export function generateDocId(prefix: string): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14); // YYYYMMDDHHmmss
  const random = Math.random().toString(36).substring(2, 10); // 8 char random
  const docId = `${prefix}_${timestamp}_${random}`;

  logger.info(
    {
      prefix,
      timestamp,
      random,
      fullId: docId,
    },
    `[FIRESTORE_ID] Generated document ID:`
  );

  return docId;
}

/**
 * generates a user document ID from email
 * @param email - user's email address
 * @returns formatted user ID like "user_john_doe_example_com"
 */
export function generateUserId(email: string): string {
  // sanitize email for use as document ID
  const sanitized = email
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  const userId = `${DOC_PREFIXES.USER}_${sanitized}`;

  logger.info(
    {
      email,
      userId,
    },
    `[FIRESTORE_ID] Generated user ID from email:`
  );

  return userId;
}

/**
 * generates a user document ID from Firebase UID
 * @param uid - Firebase auth UID
 * @returns formatted user ID like "user_abc123def456"
 */
export function generateUserIdFromUid(uid: string): string {
  const userId = `${DOC_PREFIXES.USER}_${uid}`;

  logger.info(
    {
      uid,
      userId,
    },
    `[FIRESTORE_ID] Generated user ID from UID:`
  );

  return userId;
}

/**
 * storage path conventions for Firebase Storage
 */
export const STORAGE_PATHS = {
  AUDIO: (sessionId: string, filename: string) =>
    `audio/${sessionId}/${filename}`,
  TRANSCRIPTS: (sessionId: string) => `transcripts/${sessionId}.json`,
  ANALYSIS: (sessionId: string) => `analysis/${sessionId}.json`,
  USER_AVATARS: (userId: string) => `avatars/${userId}`,
} as const;

/**
 * field names - standardized field names for Firestore documents
 */
export const FIELDS = {
  // common fields
  ID: "id",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  DELETED_AT: "deletedAt",

  // user fields
  EMAIL: "email",
  DISPLAY_NAME: "displayName",
  PHONE_NUMBER: "phoneNumber",
  PHOTO_URL: "photoURL",
  EMAIL_VERIFIED: "emailVerified",
  LINKED_PROVIDERS: "linkedProviders",

  // session fields
  SESSION_ID: "sessionId",
  STATUS: "status",
  CONSENT: "consent",
  SETTINGS: "settings",
  AUDIO_URL: "audioUrl",
  AUDIO_PATH: "audioPath",
  TRANSCRIPT_ID: "transcriptId",
  ANALYSIS_ID: "analysisId",

  // transcript fields
  TRANSCRIPT_TEXT: "transcript",
  SEGMENTS: "segments",
  SPEAKER: "speaker",
  START_MS: "startMs",
  END_MS: "endMs",
  CONFIDENCE: "confidence",

  // analysis fields
  METRICS: "metrics",
  INSIGHTS: "insights",
  DEBRIEF: "debrief",
  SUMMARY: "summary",
} as const;

/**
 * status values for session lifecycle
 */
export const SESSION_STATUS = {
  RECORDING: "recording",
  PROCESSING: "processing",
  READY: "ready",
  ERROR: "error",
  DELETED: "deleted",
} as const;

/**
 * authentication provider names
 */
export const AUTH_PROVIDERS = {
  EMAIL_PASSWORD: "email_password",
  GOOGLE: "google.com",
  PHONE: "phone",
  EMAIL_LINK: "email_link",
} as const;
