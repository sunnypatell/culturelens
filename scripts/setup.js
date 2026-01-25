#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const platform = os.platform();
const rootDir = path.join(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');

// Helper to run a command and wait for it to complete
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false, // Don't use shell to avoid path issues with spaces
      ...options,
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function setup() {
  try {
    console.log('🎉 Setting up CultureLens...\n');

    // Step 1: Install frontend dependencies
    console.log('📦 Installing frontend dependencies...');
    await runCommand('npm', ['install'], { cwd: rootDir });
    console.log('✅ Frontend dependencies installed!\n');

    // Step 2: Check if Python is available
    console.log('🐍 Checking Python installation...');
    const pythonCmd = platform === 'win32' ? 'python' : 'python3';
    try {
      await runCommand(pythonCmd, ['--version']);
    } catch (error) {
      console.error('❌ Python not found. Please install Python 3.11 or higher.');
      process.exit(1);
    }

    // Step 3: Create Python virtual environment if it doesn't exist
    const venvPath = path.join(backendDir, 'venv');
    if (!fs.existsSync(venvPath)) {
      console.log('🔧 Creating Python virtual environment...');
      await runCommand(pythonCmd, ['-m', 'venv', 'venv'], { cwd: backendDir });
      console.log('✅ Virtual environment created!\n');
    } else {
      console.log('✅ Virtual environment already exists\n');
    }

    // Step 4: Install Python dependencies
    console.log('📦 Installing Python dependencies...');

    if (platform === 'win32') {
      // Windows - use pip from venv directly
      const venvPip = path.join(backendDir, 'venv', 'Scripts', 'pip.exe');
      await runCommand(venvPip, ['install', '-r', 'requirements.txt'], { cwd: backendDir });
      await runCommand(venvPip, ['install', '-r', 'requirements-dev.txt'], { cwd: backendDir });
    } else {
      // Unix-based - use pip from venv directly
      const venvPip = path.join(backendDir, 'venv', 'bin', 'pip');
      await runCommand(venvPip, ['install', '-r', 'requirements.txt'], { cwd: backendDir });
      await runCommand(venvPip, ['install', '-r', 'requirements-dev.txt'], { cwd: backendDir });
    }
    console.log('✅ Python dependencies installed!\n');

    // Step 5: Check for .env files
    console.log('🔍 Checking environment files...');
    const rootEnv = path.join(rootDir, '.env');
    const backendEnv = path.join(backendDir, '.env');

    if (!fs.existsSync(rootEnv)) {
      console.log('⚠️  .env file not found in root. Please copy .env.example to .env and fill in your API keys.');
    } else {
      console.log('✅ Root .env file found');
    }

    if (!fs.existsSync(backendEnv)) {
      console.log('⚠️  .env file not found in backend/. Please copy backend/.env.example to backend/.env and fill in your API keys.');
    } else {
      console.log('✅ Backend .env file found');
    }

    console.log('\n✨ Setup complete! You can now run:');
    console.log('   npm run dev:all     (start frontend + backend)');
    console.log('   npm run dev         (start frontend only)');
    console.log('   npm run dev:backend (start backend only)\n');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setup();
