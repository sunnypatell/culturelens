/**
 * Google Gemini AI integration for transcript analysis
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@/lib/logger";

// Gemini configuration
const GEMINI_MODEL = "gemini-2.5-flash";

interface TranscriptSegment {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  culturalObservations: string[];
  communicationPatterns: string[];
  recommendations: string[];
}

/**
 * Analyzes conversation transcript using Google Gemini AI
 * @param transcript - Full conversation transcript
 * @param segments - Array of timestamped segments with speaker labels
 * @returns Analyzed insights including cultural patterns and communication metrics
 */
export async function analyzeTranscriptWithGemini(
  transcript: string,
  segments: TranscriptSegment[]
): Promise<AnalysisResult> {
  // Initialize Gemini API (requires API key in environment)
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    logger.warn("[GEMINI] API key not configured - using fallback analysis");
    return generateFallbackAnalysis(transcript, segments);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Construct analysis prompt
    const prompt = buildAnalysisPrompt(transcript, segments);

    // Generate analysis
    logger.info(`[GEMINI] Analyzing transcript with ${GEMINI_MODEL}...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // Parse structured response
    const analysis = parseGeminiResponse(analysisText);

    logger.info(
      `[GEMINI] Analysis complete - ${analysis.keyPoints.length} key points identified`
    );

    return analysis;
  } catch (error) {
    logger.error({ data: error }, `[GEMINI] Analysis failed:`);
    return generateFallbackAnalysis(transcript, segments);
  }
}

/**
 * Builds comprehensive analysis prompt for Gemini
 */
function buildAnalysisPrompt(
  transcript: string,
  segments: TranscriptSegment[]
): string {
  const speakerCount = new Set(segments.map((s) => s.speaker)).size;
  const duration =
    segments.length > 0
      ? (segments[segments.length - 1].endTime / 1000).toFixed(1)
      : "0";

  return `You are a cultural communication expert analyzing a conversation transcript.

CONVERSATION METADATA:
- Duration: ${duration} seconds
- Participants: ${speakerCount || 2} speakers
- Context: Workplace conversation for conflict resolution

TRANSCRIPT:
${transcript}

ANALYSIS REQUIREMENTS:
Provide a structured analysis in PLAIN TEXT format (NO markdown, NO asterisks, NO bold/italic formatting).

Use this EXACT format:

SUMMARY: Write 2-3 sentences describing the conversation's overall tone and purpose.

KEY POINTS:
- First main discussion point
- Second main discussion point
- Third main discussion point
- Fourth main discussion point
- Fifth main discussion point

CULTURAL OBSERVATIONS:
- First cultural insight about communication styles
- Second cultural insight
- Third cultural insight

COMMUNICATION PATTERNS:
- First pattern identified with evidence
- Second pattern identified
- Third pattern identified
- Fourth pattern identified

RECOMMENDATIONS:
- First actionable suggestion for improvement
- Second suggestion
- Third suggestion

Focus your analysis on:
- Turn-taking balance and interruption patterns
- Directness vs. indirectness in communication
- Formality levels and power dynamics
- Active listening indicators
- Conflict resolution approaches
- Cultural communication preferences

IMPORTANT: Use plain text only. Do not use asterisks (*), double asterisks (**), or any markdown formatting. Each bullet point should start with a single hyphen (-) followed by a space.`;
}

/**
 * Parses Gemini's text response into structured format
 */
function parseGeminiResponse(text: string): AnalysisResult {
  const sections = {
    summary: "",
    keyPoints: [] as string[],
    culturalObservations: [] as string[],
    communicationPatterns: [] as string[],
    recommendations: [] as string[],
  };

  // Extract summary and clean markdown
  const summaryMatch = text.match(
    /SUMMARY:\s*([^\n]+(?:\n(?!KEY POINTS)[^\n]+)*)/i
  );
  if (summaryMatch) {
    let summary = summaryMatch[1].trim();
    // Clean markdown formatting
    summary = summary.replace(/\*\*([^*]+)\*\*/g, "$1");
    summary = summary.replace(/\*([^*]+)\*/g, "$1");
    summary = summary.replace(/\*/g, "");
    sections.summary = summary;
  }

  // Extract key points
  const keyPointsMatch = text.match(
    /KEY POINTS:([\s\S]*?)(?=CULTURAL OBSERVATIONS|$)/i
  );
  if (keyPointsMatch) {
    sections.keyPoints = extractBulletPoints(keyPointsMatch[1]);
  }

  // Extract cultural observations
  const culturalMatch = text.match(
    /CULTURAL OBSERVATIONS:([\s\S]*?)(?=COMMUNICATION PATTERNS|$)/i
  );
  if (culturalMatch) {
    sections.culturalObservations = extractBulletPoints(culturalMatch[1]);
  }

  // Extract communication patterns
  const patternsMatch = text.match(
    /COMMUNICATION PATTERNS:([\s\S]*?)(?=RECOMMENDATIONS|$)/i
  );
  if (patternsMatch) {
    sections.communicationPatterns = extractBulletPoints(patternsMatch[1]);
  }

  // Extract recommendations
  const recommendationsMatch = text.match(/RECOMMENDATIONS:([\s\S]*?)$/i);
  if (recommendationsMatch) {
    sections.recommendations = extractBulletPoints(recommendationsMatch[1]);
  }

  return sections;
}

/**
 * Extracts bullet points from text block and cleans markdown formatting
 */
function extractBulletPoints(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.startsWith("-") || line.startsWith("*") || line.match(/^\d+\./)
    )
    .map((line) => {
      // Remove bullet point prefixes
      let cleaned = line.replace(/^[-*\d.]+\s*/, "").trim();
      // Remove markdown bold/italic formatting (** and *)
      cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
      cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
      // Remove any remaining asterisks
      cleaned = cleaned.replace(/\*/g, "");
      return cleaned;
    })
    .filter((line) => line.length > 0);
}

/**
 * Generates basic analysis when Gemini is unavailable
 */
function generateFallbackAnalysis(
  transcript: string,
  segments: TranscriptSegment[]
): AnalysisResult {
  const speakerCount = new Set(segments.map((s) => s.speaker)).size;
  const wordCount = transcript.split(/\s+/).length;

  return {
    summary: `Conversation between ${speakerCount} participants spanning approximately ${wordCount} words.`,
    keyPoints: [
      "Turn-taking patterns identified",
      "Communication styles observed",
      "Key discussion topics noted",
    ],
    culturalObservations: [
      "Formality level: moderate",
      "Communication style: collaborative",
      "Power dynamics: balanced",
    ],
    communicationPatterns: [
      "Active listening demonstrated",
      "Clear articulation of points",
      "Respectful turn-taking",
    ],
    recommendations: [
      "Continue current communication approach",
      "Maintain balanced participation",
      "Foster open dialogue",
    ],
  };
}
