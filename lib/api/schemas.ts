// Zod validation schemas for API requests

import { z } from "zod";

/**
 * sessions API schemas
 */
export const SessionSchemas = {
  // POST /api/sessions
  create: z.object({
    consent: z.object({
      personA: z.boolean(),
      personB: z.boolean(),
      timestamp: z.string().datetime().optional(),
    }),
    settings: z.object({
      storageMode: z.enum(["ephemeral", "transcriptOnly"]),
      voiceId: z.string(),
      analysisDepth: z.enum(["quick", "standard", "deep"]),
      culturalContextTags: z.array(z.string()),
      sensitivityLevel: z.number().min(0).max(100),
    }),
  }),

  // dynamic params
  params: z.object({
    id: z.string().min(1),
  }),

  // POST /api/sessions/[id]/upload
  upload: z.object({
    audio: z.instanceof(File),
  }),
};

/**
 * transcripts API schemas
 */
export const TranscriptSchemas = {
  // POST /api/transcripts
  create: z.object({
    sessionId: z.string().min(1),
    transcript: z.string().min(1),
    timestamp: z.string().datetime().optional(),
    segments: z.array(z.unknown()).optional(),
  }),
};

/**
 * elevenlabs API schemas
 */
export const ElevenLabsSchemas = {
  // POST /api/elevenlabs/tts
  tts: z.object({
    text: z.string().min(1).max(5000),
    voiceId: z.string().optional(),
  }),
};

/**
 * common parameter schemas
 */
export const CommonSchemas = {
  id: z.string().min(1, "id is required"),
  sessionId: z.string().min(1, "sessionId is required"),
};
