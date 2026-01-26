/**
 * Test script for Gemini analysis pipeline
 * Simulates the full flow: create session -> save transcript -> trigger analysis
 */

const BASE_URL = "http://localhost:3000";

// Mock transcript simulating ElevenLabs conversation output
const MOCK_TRANSCRIPT = `[2024-01-25T10:00:00.000Z] A: I think we need to talk about the project timeline. I'm concerned we're falling behind.

[2024-01-25T10:00:15.000Z] B: I hear your concern. Can you be more specific about which milestones you're worried about?

[2024-01-25T10:00:30.000Z] A: Well, the design phase was supposed to be done last week, but we're still making changes.

[2024-01-25T10:00:45.000Z] B: You're right, we did extend that. But I felt the extra time was necessary to get buy-in from stakeholders.

[2024-01-25T10:01:00.000Z] A: I understand, but now we're putting pressure on the development team. They're already working overtime.

[2024-01-25T10:01:15.000Z] B: That's a fair point. Maybe we should look at reducing scope instead of pushing the team harder.

[2024-01-25T10:01:30.000Z] A: I appreciate you being open to that. What features do you think we could defer?

[2024-01-25T10:01:45.000Z] B: Let me pull up the priority matrix. I think the reporting module could wait until v2.`;

async function testGeminiAnalysis() {
  console.log("=".repeat(60));
  console.log("GEMINI ANALYSIS PIPELINE TEST");
  console.log("=".repeat(60));

  // For testing, we need a valid Firebase auth token
  // In a real test, you'd get this from Firebase Auth
  console.log("\n⚠️  This test requires a valid Firebase auth token.");
  console.log("To get one:");
  console.log("1. Open the app in browser: http://localhost:3000");
  console.log("2. Sign in with your account");
  console.log("3. Open browser console and run:");
  console.log("   await firebase.auth().currentUser.getIdToken()");
  console.log("4. Copy the token and set it as AUTH_TOKEN env var\n");

  const token = process.env.AUTH_TOKEN;

  if (!token) {
    console.log("❌ No AUTH_TOKEN provided. Running Gemini-only test...\n");
    await testGeminiDirectly();
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    // Step 1: Create a session
    console.log("\n📝 Step 1: Creating session...");
    const sessionRes = await fetch(`${BASE_URL}/api/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        consent: {
          personA: true,
          personB: true,
          timestamp: new Date().toISOString(),
        },
        settings: {
          title: "Gemini Test Session",
          sessionType: "Professional Meeting",
          participantCount: 2,
          culturalContextTags: ["Direct Communication", "Collaborative"],
          sensitivityLevel: 3.5,
          analysisMethod: "standard",
          storageMode: "transcriptOnly",
          voiceId: "test",
        },
      }),
    });

    const sessionData = await sessionRes.json();
    if (!sessionRes.ok) {
      throw new Error(
        `Session creation failed: ${JSON.stringify(sessionData)}`
      );
    }

    const sessionId = sessionData.data.id;
    console.log(`✅ Session created: ${sessionId}`);

    // Step 2: Save transcript
    console.log("\n📄 Step 2: Saving transcript...");
    const transcriptRes = await fetch(`${BASE_URL}/api/transcripts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        sessionId,
        transcript: MOCK_TRANSCRIPT,
        timestamp: new Date().toISOString(),
        segments: [],
      }),
    });

    const transcriptData = await transcriptRes.json();
    if (!transcriptRes.ok) {
      throw new Error(
        `Transcript save failed: ${JSON.stringify(transcriptData)}`
      );
    }
    console.log(`✅ Transcript saved`);

    // Step 3: Trigger analysis
    console.log("\n🧠 Step 3: Triggering Gemini analysis...");
    console.log("(This may take 10-30 seconds...)\n");

    const startTime = Date.now();
    const analyzeRes = await fetch(
      `${BASE_URL}/api/sessions/${sessionId}/analyze`,
      {
        method: "POST",
        headers,
      }
    );
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    const analysisData = await analyzeRes.json();

    if (!analyzeRes.ok) {
      throw new Error(`Analysis failed: ${JSON.stringify(analysisData)}`);
    }

    console.log(`✅ Analysis complete in ${elapsed}s\n`);
    console.log("=".repeat(60));
    console.log("GEMINI ANALYSIS RESULTS");
    console.log("=".repeat(60));

    const result = analysisData.data;

    // Display debrief
    if (result.debrief?.text) {
      console.log("\n📋 DEBRIEF:");
      console.log("-".repeat(40));
      console.log(result.debrief.text);
    }

    // Display insights
    if (result.insights?.length > 0) {
      console.log("\n\n💡 INSIGHTS:");
      console.log("-".repeat(40));
      result.insights.forEach((insight, i) => {
        console.log(`\n[${insight.category}] ${insight.title}`);
        console.log(`  ${insight.summary}`);
        console.log(`  Confidence: ${insight.confidence}`);
      });
    }

    // Display metrics
    if (result.metrics) {
      console.log("\n\n📊 METRICS:");
      console.log("-".repeat(40));
      console.log(
        `Talk time: A=${result.metrics.talkTimeMs?.A}ms, B=${result.metrics.talkTimeMs?.B}ms`
      );
      console.log(
        `Turn count: A=${result.metrics.turnCount?.A}, B=${result.metrics.turnCount?.B}`
      );
      console.log(
        `Interruptions: A=${result.metrics.interruptionCount?.A}, B=${result.metrics.interruptionCount?.B}`
      );
    }

    console.log("\n\n" + "=".repeat(60));
    console.log("TEST COMPLETE");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

async function testGeminiDirectly() {
  // Test Gemini module directly without API
  console.log("Testing Gemini module directly...\n");

  try {
    // Dynamic import for ES module compatibility
    const { analyzeTranscriptWithGemini } =
      await import("../lib/gemini-analysis.ts");

    const segments = [
      {
        speaker: "A",
        text: "I think we need to talk about the project timeline.",
        startTime: 0,
        endTime: 5000,
      },
      {
        speaker: "B",
        text: "Can you be more specific about which milestones you're worried about?",
        startTime: 5000,
        endTime: 10000,
      },
      {
        speaker: "A",
        text: "The design phase was supposed to be done last week.",
        startTime: 10000,
        endTime: 15000,
      },
      {
        speaker: "B",
        text: "You're right. The extra time was necessary for stakeholder buy-in.",
        startTime: 15000,
        endTime: 20000,
      },
    ];

    console.log("Calling Gemini API...\n");
    const result = await analyzeTranscriptWithGemini(MOCK_TRANSCRIPT, segments);

    console.log("=".repeat(60));
    console.log("GEMINI RESPONSE");
    console.log("=".repeat(60));
    console.log("\n📋 Summary:", result.summary);
    console.log("\n🔑 Key Points:", result.keyPoints);
    console.log("\n🌍 Cultural Observations:", result.culturalObservations);
    console.log("\n💬 Communication Patterns:", result.communicationPatterns);
    console.log("\n✅ Recommendations:", result.recommendations);
  } catch (error) {
    console.error("Direct test failed:", error.message);
    console.log(
      "\nNote: Direct testing requires running in Node with tsx or ts-node"
    );
  }
}

testGeminiAnalysis();
