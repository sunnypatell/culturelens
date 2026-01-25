#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const platform = os.platform();
const backendDir = path.join(__dirname, "..", "backend");

// determine the correct pytest path based on platform
let pytestPath;

if (platform === "win32") {
  // windows
  pytestPath = path.join(backendDir, "venv", "Scripts", "pytest.exe");
} else {
  // unix-based (mac, linux)
  pytestPath = path.join(backendDir, "venv", "bin", "pytest");
}

const spawnOptions = {
  cwd: backendDir,
  stdio: "inherit",
};

// Only use shell on Windows to handle .cmd extensions
if (platform === "win32") {
  spawnOptions.shell = true;
}

const child = spawn(pytestPath, ["-v"], spawnOptions);

child.on("error", (error) => {
  console.error("❌ failed to run pytest:", error);
  console.error("💡 make sure you ran: npm run setup");
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
