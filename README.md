# CultureLens

> A consent-based conversation mirror that analyzes communication patterns with cultural awareness, delivering neutral audio insights without judgment.

Built at [MLH HackHive 2026](https://mlh.io) | Ontario Tech University

## Tech Stack

- **Frontend:** Next.js 16 / React 19 / TypeScript (scaffolded with [v0.dev](https://v0.dev))
- **UI:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Voice:** ElevenLabs Conversational AI
- **Backend:** Python FastAPI
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Validation:** Zod (runtime type checking)
- **Deployment:** Vercel (frontend) + Railway/Render (backend) + Firebase (data)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm

### Setup

#### Quick Start (Recommended)

**One command to install everything (works on Mac, Linux, and Windows):**

```bash
git clone https://github.com/sunnypatell/culturelens.git
cd culturelens
npm run setup
```

This will:

- ✅ Install all frontend dependencies
- ✅ Create Python virtual environment
- ✅ Install all backend dependencies
- ✅ Check your Python installation
- ✅ Warn you if .env files are missing

**Then configure your environment variables:**

1. Copy `.env.example` to `.env` in the root directory
2. Copy `backend/.env.example` to `backend/.env`
3. Fill in your API keys

```bash
# Root .env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_public_agent_id

# Firebase (get from firebase console → project settings → your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# backend/.env
ELEVENLABS_API_KEY=your_elevenlabs_api_key
OPENAI_API_KEY=your_openai_api_key
```

**Firebase Setup:**

see [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed firebase configuration.

**quick firebase setup:**

1. download `firebase-adminsdk-key.json` from [firebase console](https://console.firebase.google.com/project/culturelens-2dd38/settings/serviceaccounts/adminsdk)
2. place in project root (already in .gitignore)
3. enable firebase storage: https://console.firebase.google.com/project/culturelens-2dd38/storage

#### Manual Setup (Alternative)

<details>
<summary>Click to expand manual setup instructions</summary>

**1. Clone Repository**

```bash
git clone https://github.com/sunnypatell/culturelens.git
cd culturelens
```

**2. Frontend Setup**

```bash
npm install
cp .env.example .env
```

Fill in your `.env` with the API keys.

**3. Backend Setup**

```bash
cd backend

# Create virtual environment
python3 -m venv venv  # Mac/Linux
python -m venv venv   # Windows

# Activate virtual environment
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows (CMD)
venv\Scripts\Activate.ps1     # Windows (PowerShell)

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Copy env file
cp .env.example .env
```

Fill in `backend/.env` with your API keys.

</details>

#### ElevenLabs Setup

The voice agent supports two connection modes:

- **Public agent** (default): Set `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` — the client connects directly, no signed URL needed.
- **Private agent**: Set `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID` — the backend generates a signed URL. API key must have **Agents Write** (`convai_write`) permission.

**Agent Configuration:**

- **Voice Selection**: Built-in! Select from 4 natural voices directly in the app (Rachel, Drew, Clyde, Elli)
- **Quick Start**: [`docs/VOICE_SETTINGS_CHEATSHEET.md`](docs/VOICE_SETTINGS_CHEATSHEET.md) - Copy-paste settings (1 min)
- **Voice Details**: [`docs/VOICE_SELECTION.md`](docs/VOICE_SELECTION.md) - How in-app voice selection works
- **System Prompt**: [`AGENT_PROMPT.md`](AGENT_PROMPT.md) - Conversation personality
- **Full Guide**: [`docs/ELEVENLABS_SETUP.md`](docs/ELEVENLABS_SETUP.md) - Detailed setup

Docs: [ElevenLabs React SDK](https://elevenlabs.io/docs/agents-platform/libraries/react) | [Agent Authentication](https://elevenlabs.io/docs/conversational-ai/customization/authentication)

### Run Development Servers

**🚀 Single Command (Recommended) - Works on all platforms:**

```bash
npm run dev:all
```

This runs both frontend and backend concurrently in a single terminal with color-coded logs:

- **Frontend** (cyan): [http://localhost:3000](http://localhost:3000)
- **Backend** (magenta): [http://localhost:8000/docs](http://localhost:8000/docs)

The backend logs include helpful emojis for easy tracking:

- 🚀 Startup
- ✅ Success
- ⚠️ Warnings
- ❌ Errors
- 💚 Health checks
- 📝 Session operations

**Alternative: Separate Terminals**

<details>
<summary>Click to expand separate terminal instructions</summary>

**Terminal 1 - Frontend:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Terminal 2 - Backend:**

```bash
npm run dev:backend
```

Backend API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

Both commands are cross-platform and work on Mac, Linux, and Windows.

</details>

### Linting & Formatting

**Frontend:**

```bash
npm run lint:frontend        # Run ESLint
npm run format:frontend      # Format with Prettier
npm run format:check         # Check formatting without changing files
npm run typecheck            # Run TypeScript compiler
```

**Backend:**

```bash
npm run lint:backend         # Run Ruff check
npm run format:backend       # Format with Ruff
npm run test:backend         # Run Pytest
# Or manually from backend/:
ruff check .                 # Lint
ruff check . --fix           # Auto-fix issues
ruff format .                # Format code
pytest -v                    # Run tests
```

**Note:** Linting will not block commits, but CI checks will run on pull requests. Make sure to fix issues before pushing.

### Build

```bash
npm run build
```

## Project Structure

```
culturelens/
├── app/                              # next.js frontend
│   ├── page.tsx                      # main dashboard (5-view router)
│   ├── layout.tsx                    # root layout + metadata
│   └── api/
│       ├── elevenlabs/
│       │   ├── signed-url/route.ts   # signed URL for private agents
│       │   └── tts/route.ts          # text-to-speech (stubbed)
│       └── sessions/                 # legacy routes (migrated to backend)
│
├── components/
│   ├── dashboard/                    # dashboard views (home, record, library, insights, settings)
│   ├── audio/                        # waveform visualization
│   ├── ui/                           # reusable UI primitives (shadcn)
│   ├── voice-agent.tsx               # elevenlabs voice agent
│   └── backend-status.tsx            # backend connection indicator
│
├── lib/
│   ├── types.ts                      # shared TypeScript types
│   ├── api-client.ts                 # backend API client
│   ├── audio-recorder.ts             # mediarecorder wrapper (TODO)
│   ├── transcription.ts              # audio → transcript (TODO)
│   ├── metrics.ts                    # communication metrics (TODO)
│   ├── linguistic-markers.ts         # pattern extraction (TODO)
│   ├── cultural-lens.ts              # LLM insights (TODO)
│   └── debrief-generator.ts          # debrief script + TTS (TODO)
│
└── backend/                          # python fastapi backend
    ├── app/
    │   ├── main.py                   # fastapi app entry point
    │   ├── api/
    │   │   ├── health.py             # health check endpoints
    │   │   └── sessions.py           # session CRUD
    │   ├── models/
    │   │   └── session.py            # pydantic schemas
    │   ├── services/                 # business logic (TODO)
    │   └── core/
    │       └── config.py             # settings & env vars
    ├── tests/
    │   └── test_health.py            # pytest tests
    ├── pyproject.toml                # python project config
    └── requirements.txt              # python dependencies
```

## CI/CD

GitHub Actions run on every pull request:

- ✅ **Frontend Lint** - ESLint check
- ✅ **Frontend Typecheck** - TypeScript compiler
- ✅ **Frontend Format** - Prettier check
- ✅ **Backend Lint** - Ruff check
- ✅ **Backend Format** - Ruff format check
- ✅ **Backend Test** - Pytest
- 🔥 **Firebase Deploy** - auto-deploys firestore/storage rules on push to main

**firebase auto-deployment:**
when you push changes to `firestore.rules`, `firestore.indexes.json`, or `storage.rules` on the `main` branch, github actions automatically deploys them to firebase.

setup: add `FIREBASE_SERVICE_ACCOUNT` secret to github repo settings.
see [.github/FIREBASE_DEPLOY_SETUP.md](.github/FIREBASE_DEPLOY_SETUP.md) for details.

Each check runs separately so you can see which specific test failed.

## Team

| Name                | GitHub                                             | Role |
| ------------------- | -------------------------------------------------- | ---- |
| Sunny Patel         | [@sunnypatell](https://github.com/sunnypatell)     | TBD  |
| Daniyal Lilani      | [@DaniyalLilani](https://github.com/daniyallilani) | TBD  |
| Aryan Kashefi-Aazam | [@Aryan-KA](https://github.com/Aryan-KA)           | TBD  |
| TBD                 |                                                    |      |

## License

[MIT](LICENSE)
