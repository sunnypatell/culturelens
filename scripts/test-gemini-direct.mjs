/**
 * Direct test of Gemini analysis - no auth required
 * Tests the analyzeTranscriptWithGemini function directly
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Load env vars manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && !key.startsWith("#")) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const GEMINI_MODEL = "gemini-2.5-flash";

// Mock transcript simulating ElevenLabs conversation
const MOCK_TRANSCRIPT = `[Speaker A] I think we need to talk about the project timeline. I'm concerned we're falling behind.

[Speaker B] I hear your concern. Can you be more specific about which milestones you're worried about?

[Speaker A] Well, the design phase was supposed to be done last week, but we're still making changes.

[Speaker B] You're right, we did extend that. But I felt the extra time was necessary to get buy-in from stakeholders.

[Speaker A] I understand, but now we're putting pressure on the development team. They're already working overtime.

[Speaker B] That's a fair point. Maybe we should look at reducing scope instead of pushing the team harder.

[Speaker A] I appreciate you being open to that. What features do you think we could defer?

[Speaker B] Let me pull up the priority matrix. I think the reporting module could wait until v2.`;

async function testGeminiAnalysis() {
  console.log("=".repeat(60));
  console.log("GEMINI DIRECT ANALYSIS TEST");
  console.log("=".repeat(60));

  const apiKey = envVars.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.error("❌ GOOGLE_AI_API_KEY not found in .env file");
    process.exit(1);
  }

  console.log("✅ API key found");
  console.log("📦 Model:", GEMINI_MODEL);
  console.log("\n📄 Test Transcript:");
  console.log("-".repeat(40));
  console.log(MOCK_TRANSCRIPT);
  console.log("-".repeat(40));

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are a cultural communication expert analyzing a conversation transcript.

CONVERSATION METADATA:
- Duration: 60 seconds
- Participants: 2 speakers
- Context: Workplace conversation for conflict resolution

TRANSCRIPT:
${MOCK_TRANSCRIPT}

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

IMPORTANT: Use plain text only. Do not use asterisks (*), double asterisks (**), or any markdown formatting.`;

    console.log("\n🧠 Calling Gemini API...");
    const startTime = Date.now();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("✅ Response received in " + elapsed + "s");
    console.log("\n" + "=".repeat(60));
    console.log("GEMINI ANALYSIS OUTPUT");
    console.log("=".repeat(60));
    console.log("\n" + analysisText);
    console.log("\n" + "=".repeat(60));
    console.log("TEST COMPLETE");
    console.log("=".repeat(60));

    // Parse and validate structure
    console.log("\n📊 Structure Validation:");
    const hasSummary = analysisText.includes("SUMMARY:");
    const hasKeyPoints = analysisText.includes("KEY POINTS:");
    const hasCultural = analysisText.includes("CULTURAL OBSERVATIONS:");
    const hasPatterns = analysisText.includes("COMMUNICATION PATTERNS:");
    const hasRecs = analysisText.includes("RECOMMENDATIONS:");

    console.log("  SUMMARY: " + (hasSummary ? "✅" : "❌"));
    console.log("  KEY POINTS: " + (hasKeyPoints ? "✅" : "❌"));
    console.log("  CULTURAL OBSERVATIONS: " + (hasCultural ? "✅" : "❌"));
    console.log("  COMMUNICATION PATTERNS: " + (hasPatterns ? "✅" : "❌"));
    console.log("  RECOMMENDATIONS: " + (hasRecs ? "✅" : "❌"));
  } catch (error) {
    console.error("\n❌ Gemini API error:", error.message);
    if (error.message.includes("API_KEY")) {
      console.log("\nHint: Check that your GOOGLE_AI_API_KEY is valid");
    }
    process.exit(1);
  }
}

testGeminiAnalysis();
