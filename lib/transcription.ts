// CultureLens — Transcription Pipeline
// Handles audio-to-text conversion with speaker diarization.
//
// TODO: implement one of these approaches:
//   - OpenAI Whisper API (requires OPENAI_API_KEY)
//   - Deepgram (requires DEEPGRAM_API_KEY, has built-in diarization)
//   - AssemblyAI (requires ASSEMBLYAI_API_KEY, has built-in diarization)

import { Segment } from "./types";

/**
 * Transcribes an audio blob into timestamped segments with speaker labels.
 * @param audioBlob - The recorded audio (webm or wav)
 * @returns Array of transcript segments with timestamps and speaker IDs
 */
export async function transcribeAudio(audioBlob: Blob): Promise<Segment[]> {
  // TODO: implement transcription API call
  // 1. Convert blob to appropriate format if needed
  // 2. Send to transcription service
  // 3. Parse response into Segment[] format
  // 4. Apply speaker diarization (if not built into the service)
  throw new Error("transcribeAudio not implemented — see lib/transcription.ts");
}
