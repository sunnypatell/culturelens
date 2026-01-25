#!/usr/bin/env node

/**
 * comprehensive API route testing script
 * tests all endpoints with proper authentication
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// load environment variables manually from .env.local
function loadEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    content.split("\n").forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.warn(`⚠️  could not load ${filePath}:`, error.message);
  }
}

loadEnvFile(path.join(__dirname, "../.env.local"));

const API_BASE = "http://localhost:3000/api";
const TEST_USER_EMAIL = "api-test@culturelens.test";
const TEST_USER_PASSWORD = "TestPassword123!";

// initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const auth = admin.auth();
const db = admin.firestore();

// configure firestore settings
db.settings({ ignoreUndefinedProperties: true });

let testUserId = null;
let testToken = null;

/**
 * create a test user for API testing
 */
async function createTestUser() {
  console.log("\n📝 creating test user...");

  try {
    // try to get existing user first
    const existingUser = await auth.getUserByEmail(TEST_USER_EMAIL);
    testUserId = existingUser.uid;
    console.log(`✅ using existing test user: ${testUserId}`);
  } catch (error) {
    // create new user if doesn't exist
    const user = await auth.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      displayName: "API Test User",
      emailVerified: true,
    });
    testUserId = user.uid;
    console.log(`✅ created test user: ${testUserId}`);
  }

  // create custom token for authentication
  testToken = await auth.createCustomToken(testUserId);
  console.log(`✅ generated auth token`);

  return { userId: testUserId, token: testToken };
}

/**
 * test endpoint helper
 */
async function testEndpoint(name, method, path, options = {}) {
  console.log(`\n🧪 testing: ${method} ${path}`);

  try {
    const headers = {
      "Content-Type": "application/json",
      ...(options.auth && testToken
        ? { Authorization: `Bearer ${testToken}` }
        : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (response.ok) {
      console.log(`✅ ${name} passed (${response.status})`);
      console.log(`   response:`, JSON.stringify(data).substring(0, 200));
      return { success: true, data, status: response.status };
    } else {
      console.log(`⚠️  ${name} returned ${response.status}`);
      console.log(`   error:`, JSON.stringify(data).substring(0, 200));
      return { success: false, data, status: response.status };
    }
  } catch (error) {
    console.log(`❌ ${name} failed with error:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * run all tests
 */
async function runTests() {
  console.log("\n🚀 starting API route tests\n");
  console.log("=".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // create test user
  await createTestUser();

  // test 1: sync user profile (POST)
  const syncResult = await testEndpoint(
    "sync user profile",
    "POST",
    "/user/sync-profile",
    {
      auth: true,
      body: {
        email: TEST_USER_EMAIL,
        displayName: "API Test User",
        emailVerified: true,
      },
    }
  );
  syncResult.success ? results.passed++ : results.failed++;

  // test 2: get user profile (GET)
  const getProfileResult = await testEndpoint(
    "get user profile",
    "GET",
    "/user/sync-profile",
    { auth: true }
  );
  getProfileResult.success ? results.passed++ : results.failed++;

  // test 3: create session without auth (should fail)
  const noAuthResult = await testEndpoint(
    "create session without auth",
    "POST",
    "/sessions",
    {
      auth: false,
      body: {
        consent: { personA: true, personB: true },
        settings: { title: "test session" },
      },
    }
  );
  // expecting 401
  if (noAuthResult.status === 401) {
    console.log(`✅ correctly rejected unauthenticated request`);
    results.passed++;
  } else {
    console.log(`⚠️  should have returned 401, got ${noAuthResult.status}`);
    results.warnings++;
  }

  // test 4: create session with auth
  const sessionResult = await testEndpoint(
    "create session with auth",
    "POST",
    "/sessions",
    {
      auth: true,
      body: {
        consent: {
          personA: true,
          personB: true,
          timestamp: new Date().toISOString(),
        },
        settings: {
          title: "API Test Session",
          sessionType: "casual",
          participantCount: 2,
          culturalContextTags: ["general"],
          sensitivityLevel: "standard",
          analysisMethod: "comprehensive",
          storageMode: "transcriptOnly",
        },
      },
    }
  );
  sessionResult.success ? results.passed++ : results.failed++;

  let testSessionId = null;
  if (sessionResult.success && sessionResult.data?.data?.id) {
    testSessionId = sessionResult.data.data.id;
    console.log(`   created session ID: ${testSessionId}`);
  }

  // test 5: get all sessions
  const getSessionsResult = await testEndpoint(
    "get all user sessions",
    "GET",
    "/sessions",
    { auth: true }
  );
  getSessionsResult.success ? results.passed++ : results.failed++;

  // test 6: get specific session (if created)
  if (testSessionId) {
    const getSessionResult = await testEndpoint(
      "get specific session",
      "GET",
      `/sessions/${testSessionId}`,
      { auth: true }
    );
    getSessionResult.success ? results.passed++ : results.failed++;

    // test 7: toggle favorite
    const favoriteResult = await testEndpoint(
      "toggle session favorite",
      "PATCH",
      `/sessions/${testSessionId}/favorite`,
      { auth: true }
    );
    favoriteResult.success ? results.passed++ : results.failed++;
  } else {
    console.log(`⚠️  skipping session-specific tests (no session ID)`);
    results.warnings += 2;
  }

  // test 8: update settings
  const settingsResult = await testEndpoint(
    "update user settings",
    "PUT",
    "/settings",
    {
      auth: true,
      body: {
        theme: "dark",
        notifications: true,
        autoSave: true,
      },
    }
  );
  settingsResult.success ? results.passed++ : results.failed++;

  // test 9: get settings
  const getSettingsResult = await testEndpoint(
    "get user settings",
    "GET",
    "/settings",
    { auth: true }
  );
  getSettingsResult.success ? results.passed++ : results.failed++;

  // summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 test results:");
  console.log(`✅ passed: ${results.passed}`);
  console.log(`❌ failed: ${results.failed}`);
  console.log(`⚠️  warnings: ${results.warnings}`);

  const total = results.passed + results.failed + results.warnings;
  const successRate = ((results.passed / total) * 100).toFixed(1);
  console.log(`\n📈 success rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log("\n🎉 all critical tests passed!\n");
  } else {
    console.log("\n⚠️  some tests failed - review errors above\n");
  }
}

// run tests and exit
runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ test suite failed:", error);
    process.exit(1);
  });
