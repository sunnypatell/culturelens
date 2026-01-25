#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const platform = os.platform();
const backendDir = path.join(__dirname, "..", "backend");

// determine the correct ruff path based on platform
let ruffPath;

if (platform === "win32") {
  // windows
  ruffPath = path.join(backendDir, "venv", "Scripts", "ruff.exe");
} else {
  // unix-based (mac, linux)
  ruffPath = path.join(backendDir, "venv", "bin", "ruff");
}

const spawnOptions = {
  cwd: backendDir,
  stdio: "inherit",
};

// Only use shell on Windows to handle .cmd extensions
if (platform === "win32") {
  spawnOptions.shell = true;
}

const child = spawn(ruffPath, ["format", "."], spawnOptions);

child.on("error", (error) => {
  console.error("❌ failed to run ruff:", error);
  console.error("💡 make sure you ran: npm run setup");
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
