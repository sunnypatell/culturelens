#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const platform = os.platform();
const backendDir = path.join(__dirname, "..", "backend");

// Determine the correct uvicorn path based on platform
let uvicornPath;

if (platform === "win32") {
  // Windows
  uvicornPath = path.join(backendDir, "venv", "Scripts", "uvicorn.exe");
} else {
  // Unix-based (Mac, Linux)
  uvicornPath = path.join(backendDir, "venv", "bin", "uvicorn");
}

console.log("🚀 Starting backend server...");

const child = spawn(
  uvicornPath,
  ["app.main:app", "--reload", "--port", "8000"],
  {
    cwd: backendDir,
    stdio: "inherit",
    shell: true, // Use shell for cross-platform compatibility
  }
);

child.on("error", (error) => {
  console.error("❌ Failed to start backend:", error);
  console.error("💡 Make sure you ran: npm run setup");
  process.exit(1);
});

child.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ Backend exited with code ${code}`);
  }
  process.exit(code || 0);
});
