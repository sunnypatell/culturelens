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
git clone https://github.com/sunnypatell/hackhive-2026.git
cd hackhive-2026
npm install
cp .env.example .env.local
```

Fill in your `.env.local` with the API keys (ask Sunny for the values).

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
├── page.tsx                         # Main dashboard (5-view router)
├── layout.tsx                       # Root layout + metadata
└── api/elevenlabs/signed-url/       # ElevenLabs signed URL endpoint

components/
├── dashboard/                       # Dashboard views (home, record, library, insights, settings)
├── audio/                           # Waveform visualization
├── ui/                              # Reusable UI primitives (shadcn)
└── voice-agent.tsx                  # ElevenLabs voice agent integration

lib/
└── utils.ts                         # Utility functions
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
