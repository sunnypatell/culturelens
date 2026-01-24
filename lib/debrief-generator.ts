// CultureLens — Debrief Script Generator
// Generates a structured, neutral audio script from analysis results,
// then sends it to ElevenLabs TTS for audio generation.
//
// Script template (target ~80 seconds):
//   1. Safety framing (5s): "This is a reflection tool, not therapy or advice."
//   2. Neutral recap (15s): What happened in the conversation
//   3. Key patterns (30s): 2-3 most notable metrics with evidence
//   4. Cultural hypotheses (20s): 1-2 "In some communication styles..." observations
//   5. Close (10s): "Would you like to revisit specific moments?"

import { Metrics, Insight, Debrief } from './types'

/**
 * Generates a structured debrief script from analysis results.
 *
 * @param metrics - Computed communication metrics
 * @param insights - Cultural lens insights
 * @returns The debrief text script with section markers
 */
export function generateDebriefScript(
  metrics: Metrics,
  insights: Insight[]
): Omit<Debrief, 'audioUrl' | 'durationMs'> {
  // TODO: implement script generation
  //
  // Use template-driven approach:
  //   - Fill in metrics values (talk time percentages, turn counts)
  //   - Select top 2-3 insights by confidence
  //   - Generate neutral, non-judgmental language
  //   - Track section boundaries (startChar/endChar)
  //
  // Can use LLM for polish, but template ensures consistent structure

  throw new Error('generateDebriefScript not implemented — see lib/debrief-generator.ts')
}

/**
 * Sends the debrief script to ElevenLabs TTS and returns the audio URL.
 * Uses the /api/elevenlabs/tts endpoint.
 *
 * @param script - The text script to convert to speech
 * @returns Audio URL and duration
 */
export async function generateDebriefAudio(
  script: string
): Promise<{ audioUrl: string; durationMs: number }> {
  // TODO: implement TTS call
  //
  // POST to /api/elevenlabs/tts with { text: script, voiceId: ... }
  // Return the audio URL and estimated duration

  throw new Error('generateDebriefAudio not implemented — see lib/debrief-generator.ts')
}
