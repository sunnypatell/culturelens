# CultureLens

> A consent-based conversation mirror that analyzes communication patterns with cultural awareness, delivering neutral audio insights without judgment.

Built at [MLH HackHive 2026](https://mlh.io) | Ontario Tech University

## Tech Stack

- **Frontend:** Next.js 16 / React 19 / TypeScript (scaffolded with [v0.dev](https://v0.dev))
- **UI:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Voice:** ElevenLabs Conversational AI
- **Backend:** Next.js API Routes
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/sunnypatell/culturelens.git
cd culturelens
npm install
cp .env.example .env.local
```

Fill in your `.env.local` with the API keys (ask Sunny for the values).

#### ElevenLabs Setup

The voice agent supports two connection modes:

- **Public agent** (default): Set `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` — the client connects directly, no signed URL needed.
- **Private agent**: Set `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID` — the backend generates a signed URL. API key must have **Agents Write** (`convai_write`) permission.

Docs: [ElevenLabs React SDK](https://elevenlabs.io/docs/agents-platform/libraries/react) | [Agent Authentication](https://elevenlabs.io/docs/conversational-ai/customization/authentication)

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

## Project Structure

```
app/
├── page.tsx                          # Main dashboard (5-view router)
├── layout.tsx                        # Root layout + metadata
└── api/
    ├── elevenlabs/
    │   ├── signed-url/route.ts       # Signed URL for private agents
    │   └── tts/route.ts              # Text-to-speech for debrief audio (TODO)
    └── sessions/
        ├── route.ts                  # Session CRUD (TODO)
        └── [id]/
            ├── upload/route.ts       # Audio upload (TODO)
            └── analyze/route.ts      # Analysis pipeline (TODO)

components/
├── dashboard/                        # Dashboard views (home, record, library, insights, settings)
├── audio/                            # Waveform visualization
├── ui/                               # Reusable UI primitives (shadcn)
└── voice-agent.tsx                   # ElevenLabs voice agent (public + signed URL modes)

lib/
├── types.ts                          # Shared TypeScript types (Session, Segment, Metrics, Insight, Debrief)
├── audio-recorder.ts                 # MediaRecorder wrapper (TODO)
├── transcription.ts                  # Audio → transcript segments (TODO)
├── metrics.ts                        # Deterministic communication metrics (TODO)
├── linguistic-markers.ts             # Regex pattern extraction (TODO)
├── cultural-lens.ts                  # LLM cultural hypothesis engine (TODO)
├── debrief-generator.ts              # Debrief script + TTS (TODO)
└── utils.ts                          # Utility functions
```

## Team

| Name | GitHub | Role |
|------|--------|------|
| Sunny Patel | [@sunnypatell](https://github.com/sunnypatell) | TBD |
| Daniyal Lilani | [@DaniyalLilani](https://github.com/daniyallilani) | TBD |
| Aryan Kashefi-Aazam | [@Aryan-KA](https://github.com/Aryan-KA) | TBD |
| TBD | | |

## License

[MIT](LICENSE)
