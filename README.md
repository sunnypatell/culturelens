# CultureLens

> A consent-based conversation mirror that analyzes communication patterns with cultural awareness, delivering neutral audio insights without judgment.

Built at [MLH HackHive 2026](https://mlh.io) | Ontario Tech University

## Tech Stack

- **Frontend:** Next.js 16 / React 19 / TypeScript (scaffolded with [v0.dev](https://v0.dev))
- **UI:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Voice:** ElevenLabs Conversational AI
- **Backend:** Python FastAPI
- **Deployment:** Vercel (frontend) + Railway/Render (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm

### Setup

#### 1. Clone Repository

```bash
git clone https://github.com/sunnypatell/culturelens.git
cd culturelens
```

#### 2. Frontend Setup

```bash
npm install
cp .env.example .env
```

Fill in your `.env` with the API keys (ask Sunny for the values):

```bash
# backend api url
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# elevenlabs credentials
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_public_agent_id
```

#### 3. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env
```

Fill in `backend/.env` with your API keys:

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key
OPENAI_API_KEY=your_openai_api_key
```

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

**Option 1: Single Command (Recommended)**

```bash
npm run dev:all
```

This runs both frontend and backend concurrently in a single terminal.

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

**Option 2: Separate Terminals**

**Terminal 1 - Frontend:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Terminal 2 - Backend:**

```bash
npm run dev:backend
# Or manually:
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Backend API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

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
