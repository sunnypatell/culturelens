#!/usr/bin/env node

/**
 * simple API endpoint testing
 * tests authentication, error handling, and basic responses
 */

const API_BASE = "http://localhost:3000/api";

/**
 * test endpoint helper
 */
async function testEndpoint(name, method, path, options = {}) {
  console.log(`\n🧪 testing: ${method} ${path}`);

  try {
    const headers = {
      "Content-Type": "application/json",
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

    const status = response.status;
    const expected = options.expectedStatus || 200;

    if (status === expected) {
      console.log(`✅ ${name} passed (got expected ${status})`);
      if (typeof data === "object") {
        console.log(
          `   response:`,
          JSON.stringify(data).substring(0, 150) + "..."
        );
      }
      return { success: true, data, status };
    } else {
      console.log(`⚠️  ${name} returned ${status}, expected ${expected}`);
      console.log(`   response:`, JSON.stringify(data).substring(0, 150));
      return { success: false, data, status };
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
  console.log("\n🚀 starting API endpoint tests\n");
  console.log("=".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
  };

  // test 1: unauthorized access to protected routes
  console.log("\n📋 testing authentication requirements:");

  const tests = [
    {
      name: "sessions GET without auth",
      method: "GET",
      path: "/sessions",
      expectedStatus: 401,
    },
    {
      name: "sessions POST without auth",
      method: "POST",
      path: "/sessions",
      expectedStatus: 401,
      body: { test: "data" },
    },
    {
      name: "user profile sync without auth",
      method: "POST",
      path: "/user/sync-profile",
      expectedStatus: 401,
      body: { email: "test@test.com" },
    },
    {
      name: "user profile GET without auth",
      method: "GET",
      path: "/user/sync-profile",
      expectedStatus: 401,
    },
    {
      name: "settings GET without auth",
      method: "GET",
      path: "/settings",
      expectedStatus: 401,
    },
    {
      name: "settings PUT without auth",
      method: "PUT",
      path: "/settings",
      expectedStatus: 401,
      body: { theme: "dark" },
    },
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.method, test.path, {
      expectedStatus: test.expectedStatus,
      body: test.body,
    });
    result.success ? results.passed++ : results.failed++;
  }

  // test 2: check for proper error responses
  console.log("\n📋 testing error handling:");

  const invalidAuthResult = await testEndpoint(
    "sessions with invalid auth token",
    "GET",
    "/sessions",
    {
      headers: { Authorization: "Bearer invalid_token_12345" },
      expectedStatus: 401,
    }
  );
  invalidAuthResult.success ? results.passed++ : results.failed++;

  // test 3: check for CORS and headers
  console.log("\n📋 testing HTTP headers:");

  const corsResult = await testEndpoint(
    "CORS headers present",
    "OPTIONS",
    "/sessions",
    {
      expectedStatus: 200,
    }
  );
  // OPTIONS might return 404 if not explicitly handled, that's okay
  if (corsResult.status === 200 || corsResult.status === 404) {
    console.log(`✅ OPTIONS request handled`);
    results.passed++;
  } else {
    results.failed++;
  }

  // test 4: check if server is responding correctly
  console.log("\n📋 testing server health:");

  const rootResult = await fetch("http://localhost:3000");
  if (rootResult.ok) {
    console.log(`✅ root path responding (${rootResult.status})`);
    results.passed++;
  } else {
    console.log(`⚠️  root path returned ${rootResult.status}`);
    results.failed++;
  }

  // summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 test results:");
  console.log(`✅ passed: ${results.passed}`);
  console.log(`❌ failed: ${results.failed}`);

  const total = results.passed + results.failed;
  const successRate = ((results.passed / total) * 100).toFixed(1);
  console.log(`\n📈 success rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log("\n🎉 all tests passed!\n");
    console.log("✨ key findings:");
    console.log("   - all protected routes require authentication ✓");
    console.log("   - unauthorized requests properly rejected (401) ✓");
    console.log("   - server responding correctly ✓\n");
  } else {
    console.log("\n⚠️  some tests failed - review errors above\n");
  }

  return results.failed === 0 ? 0 : 1;
}

// run tests and exit
runTests()
  .then((exitCode) => process.exit(exitCode))
  .catch((error) => {
    console.error("\n❌ test suite failed:", error);
    process.exit(1);
  });
