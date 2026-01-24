// CultureLens — Linguistic Pattern Extraction
// Detects communication patterns using keyword/regex matching.
// No API calls needed — pure text analysis.

import { Segment } from "./types";

export type MarkerCategory =
  | "hedging" // "maybe", "kind of", "I guess", "sort of"
  | "blame" // "you always", "you never", "it's your fault"
  | "repair" // "that's not what I meant", "let me rephrase"
  | "validation" // "I hear you", "that makes sense"
  | "faceSaving" // "it's fine", "don't worry about it"
  | "directives"; // "you need to", "you should", "stop"

export type LinguisticMarker = {
  category: MarkerCategory;
  segment: Segment;
  matchedPhrase: string;
  position: { start: number; end: number };
};

/**
 * Scans transcript segments for linguistic patterns.
 *
 * @param segments - Transcribed segments
 * @returns Array of detected linguistic markers with their locations
 */
export function extractMarkers(segments: Segment[]): LinguisticMarker[] {
  // TODO: implement pattern matching
  //
  // For each category, define regex/keyword lists:
  //   hedging: /\b(maybe|kind of|i guess|sort of|probably|might)\b/gi
  //   blame: /\b(you always|you never|it's your fault|because of you)\b/gi
  //   repair: /\b(that's not what i meant|let me rephrase|i'm trying to say)\b/gi
  //   validation: /\b(i hear you|that makes sense|i understand|you're right)\b/gi
  //   faceSaving: /\b(it's fine|don't worry|no problem|whatever)\b/gi
  //   directives: /\b(you need to|you should|you have to|stop)\b/gi
  //
  // Scan each segment's text, collect matches with positions

  throw new Error(
    "extractMarkers not implemented — see lib/linguistic-markers.ts"
  );
}
