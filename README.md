<div align="center">

<img src="public/favicon.svg" width="120" height="120" alt="CultureLens Logo" />

# CultureLens

**consent-based conversation analytics with cultural awareness**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.11-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

_real-time conversational ai • cultural communication analysis • privacy-first architecture_

[Live Demo](https://culturelens.vercel.app) • [Documentation](#-architecture) • [Quick Start](#-quick-start)

</div>

---

## 📖 overview

CultureLens is a **production-grade conversation analytics platform** that provides real-time, culturally-aware insights into communication patterns. Built during **MLH HackHive 2026**, it combines cutting-edge voice AI with sophisticated analysis pipelines to deliver neutral, non-judgmental feedback on conversational dynamics.

### key capabilities

- **🎙️ Real-Time Voice Interaction** - ElevenLabs conversational AI with multi-voice support
- **📊 Communication Metrics** - Turn-taking balance, interruption patterns, topic transitions
- **🌍 Cultural Context Analysis** - Directness, formality, and communication style insights
- **🔒 Privacy-First Design** - Dual consent requirement, ephemeral/transcript-only storage modes
- **⚡ Edge-Optimized Pipeline** - Vercel Edge + Firebase Admin SDK for sub-100ms auth verification
- **🎨 Enterprise-Grade UI** - 30+ Radix primitives, Tailwind CSS 4, responsive design system

---

## 🏗️ architecture

### technology stack

<table>
<tr>
<td width="50%" valign="top">

**frontend architecture**

- **framework:** Next.js 16 (App Router, React Server Components)
- **runtime:** React 19 with concurrent features
- **language:** TypeScript 5 (strict mode, path aliases)
- **styling:** Tailwind CSS 4 + CSS Variables theming
- **components:** shadcn/ui (30+ Radix primitives)
- **state:** React hooks + Firebase real-time subscriptions
- **validation:** Zod schemas (runtime + compile-time safety)
- **voice:** ElevenLabs React SDK (`@elevenlabs/react`)

</td>
<td width="50%" valign="top">

**backend architecture**

- **framework:** FastAPI (async/await, Pydantic v2)
- **runtime:** Python 3.11+ (type hints, dataclasses)
- **database:** Firebase Firestore (NoSQL, real-time)
- **storage:** Firebase Storage (signed URLs, resumable uploads)
- **auth:** Firebase Admin SDK (server-side verification)
- **testing:** Pytest + asyncio fixtures
- **linting:** Ruff (100x faster than Pylint)
- **api docs:** OpenAPI/Swagger (auto-generated)

</td>
</tr>
</table>

### component architecture

```
app/
├── (routes)/
│   ├── page.tsx                 # multi-view dashboard (home/record/library/insights/settings)
│   ├── results/                 # analysis results with async data fetching
│   ├── onboarding/              # multi-step profile completion
│   └── auth/                    # authentication flows (5 methods)
│       ├── login/               # email/password + google oauth + phone
│       ├── signup/              # account creation with dual consent
│       ├── phone/               # SMS verification with recaptcha
│       ├── verify-email/        # passwordless email link auth
│       └── reset-password/      # secure password reset flow
│
├── api/                         # next.js api routes (edge functions)
│   ├── sessions/                # session CRUD with firebase admin SDK
│   │   ├── route.ts             # create session (POST), list sessions (GET)
│   │   └── [id]/
│   │       ├── route.ts         # get/delete session
│   │       ├── analyze/         # trigger analysis pipeline
│   │       ├── favorite/        # toggle favorite status
│   │       └── upload/          # resumable audio upload
│   ├── user/                    # user management endpoints
│   │   ├── profile/             # update display name, org, photo
│   │   ├── export/              # GDPR-compliant data export
│   │   ├── delete/              # cascade account deletion
│   │   └── sync-profile/        # firebase auth → firestore sync
│   ├── settings/                # user preferences persistence
│   ├── elevenlabs/              # voice agent integration
│   │   ├── signed-url/          # generate signed URLs for private agents
│   │   └── tts/                 # text-to-speech synthesis
│   └── transcripts/             # conversation transcript storage
│
components/
├── dashboard/                   # feature modules (lazy-loaded)
│   ├── dashboard-home.tsx       # metrics overview + recent sessions
│   ├── recording-studio.tsx     # session config + voice agent
│   ├── analysis-library.tsx     # session browser with filters
│   ├── insights-view.tsx        # detailed analysis visualization
│   ├── settings-view.tsx        # user preferences + account mgmt
│   ├── sidebar.tsx              # navigation with active state
│   └── footer.tsx               # app metadata
│
├── audio/
│   └── advanced-waveform.tsx    # real-time audio visualization
│
├── auth/
│   ├── auth-provider.tsx        # firebase auth context + hooks
│   ├── login.tsx                # multi-method auth form
│   ├── signup.tsx               # account creation flow
│   ├── phone-login.tsx          # SMS verification
│   ├── verify-email.tsx         # passwordless auth
│   └── onboarding.tsx           # profile setup wizard
│
├── ui/                          # shadcn/ui primitives (30+ components)
│   ├── button.tsx               # radix slot-based button
│   ├── dialog.tsx               # accessible modal system
│   ├── card.tsx                 # content container
│   ├── input.tsx                # form input with validation
│   ├── badge.tsx                # status indicators
│   ├── slider.tsx               # range input
│   ├── switch.tsx               # toggle control
│   ├── radio-group.tsx          # single selection
│   └── [27 more components]     # full design system
│
└── voice-agent.tsx              # elevenlabs conversational ai integration

lib/
├── firebase/
│   ├── firebase.ts              # client SDK initialization
│   ├── firebase-server-utils.ts # admin SDK firestore helpers
│   └── auth-server.ts           # server-side auth verification
│
├── hooks/                       # custom react hooks
│   ├── useSessions.ts           # real-time session subscription
│   ├── useSessionInsights.ts    # analysis data fetching + transform
│   ├── useUserStats.ts          # aggregated user metrics
│   └── useInsightsTrends.ts     # time-series analytics
│
├── api/
│   ├── api.ts                   # error handling + response formatting
│   └── schemas.ts               # zod validation schemas
│
├── types.ts                     # shared typescript definitions
├── firestore-constants.ts       # collection names, field paths
└── account-linking.ts           # multi-provider auth linking

backend/
├── app/
│   ├── main.py                  # fastapi app + CORS + middleware
│   ├── api/
│   │   ├── health.py            # liveness + readiness probes
│   │   └── sessions.py          # session endpoints
│   ├── models/
│   │   └── session.py           # pydantic schemas
│   └── core/
│       └── config.py            # environment config
│
├── tests/
│   └── test_health.py           # pytest test suite
│
├── requirements.txt             # production dependencies
├── requirements-dev.txt         # development tools
└── pyproject.toml               # ruff + pytest config
```

### data flow architecture

**session lifecycle:**

```
1. User initiates session
   ├─> POST /api/sessions (creates firestore document)
   └─> Returns session ID

2. Voice agent records conversation
   ├─> ElevenLabs SDK handles audio streaming
   ├─> Transcript saved to /api/transcripts
   └─> Session status: recording → processing

3. Analysis pipeline triggered
   ├─> POST /api/sessions/[id]/analyze
   ├─> Fetches transcript from firestore
   ├─> Computes metrics (turn-taking, interruptions)
   ├─> Generates insights (cultural patterns)
   └─> Updates session.analysisResult

4. User views insights
   ├─> useSessionInsights hook fetches data
   ├─> Transforms API response to UI format
   └─> Real-time updates via firestore listeners
```

### security architecture

- **authentication:** Firebase Auth with JWT verification
- **authorization:** Firebase Admin SDK with per-user data filtering
- **api security:** all endpoints require `Authorization: Bearer <token>` header
- **ownership verification:** session.userId checked on every mutation
- **rate limiting:** ElevenLabs TTS limited to 10 req/min per user
- **firestore rules:** authenticated users can only access own data
- **cors:** configured for vercel.app + localhost origins
- **env separation:** client/server secrets properly scoped

---

## 🚀 quick start

### prerequisites

| tool        | version | purpose          |
| ----------- | ------- | ---------------- |
| **node.js** | 18+     | frontend runtime |
| **python**  | 3.11+   | backend runtime  |
| **npm**     | 9+      | package manager  |
| **git**     | 2+      | version control  |

### one-command setup

```bash
git clone https://github.com/sunnypatell/culturelens.git
cd culturelens
npm run setup
```

**what this does:**

- ✅ installs 74 npm packages (next.js, react, radix-ui, etc.)
- ✅ creates python virtual environment
- ✅ installs 15 python packages (fastapi, uvicorn, pytest, etc.)
- ✅ validates python installation
- ✅ checks for .env files

### environment configuration

**1. copy environment templates:**

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

**2. configure frontend (.env):**

```env
# backend api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# elevenlabs (public agent, no server needed)
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here

# firebase client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID

# firebase admin SDK (server-side)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----\n"
```

**3. configure backend (backend/.env):**

```env
ELEVENLABS_API_KEY=sk_your_api_key_here
```

### run development servers

**🔥 recommended: single command (works on all platforms)**

```bash
npm run dev:all
```

this starts both servers concurrently:

- **frontend:** http://localhost:3000 (cyan logs)
- **backend:** http://localhost:8000/docs (magenta logs)

**alternative: separate terminals**

```bash
# terminal 1 - frontend
npm run dev

# terminal 2 - backend
npm run dev:backend
```

**cross-platform compatibility:**

- ✅ **windows:** uses `shell: true` for .cmd/.exe handling
- ✅ **mac/linux:** direct binary execution for better performance
- ✅ **python detection:** auto-detects `python3` vs `python` command
- ✅ **path spaces:** properly quoted paths throughout

### build for production

```bash
npm run build
npm run start
```

---

## 🎯 features

### 🎙️ voice interaction

- **multi-voice support:** 4 pre-configured voices (Rachel, Drew, Clyde, Elli)
- **real-time streaming:** ElevenLabs conversational AI SDK
- **agent customization:** system prompt tuning for cultural awareness
- **transcript capture:** automatic conversation logging to firestore

### 📊 analysis pipeline

- **turn-taking metrics:** speaking time distribution, balance analysis
- **interruption detection:** overlap events, competitive vs. collaborative patterns
- **silence tracking:** pause analysis, conversational flow
- **cultural lens:** directness, formality, communication style insights
- **key moments:** timestamp-indexed highlights with evidence quotes

### 🎨 user interface

- **responsive design:** mobile-first, tablet, desktop layouts
- **dark mode:** system preference detection + manual toggle
- **accessibility:** WCAG 2.1 AA compliant, keyboard navigation
- **animations:** framer-motion-inspired transitions
- **real-time updates:** firestore listeners for live data sync

### 🔐 authentication

- **5 auth methods:** email/password, Google OAuth, phone (SMS), passwordless email, password reset
- **account linking:** automatic merging of multiple sign-in methods
- **session management:** persistent auth state, auto-refresh tokens
- **profile sync:** firebase auth ↔ firestore bidirectional sync

### ⚙️ settings & data

- **user preferences:** notifications, auto-save, analysis depth
- **data retention:** configurable (30/90/365 days, manual only)
- **GDPR compliance:** full data export (JSON), cascade account deletion
- **favorite sessions:** star important conversations for quick access

---

## 🧪 testing & quality

### continuous integration

github actions runs on every pull request:

| check                  | tool         | runtime |
| ---------------------- | ------------ | ------- |
| **frontend lint**      | eslint       | ~10s    |
| **frontend typecheck** | typescript   | ~15s    |
| **frontend format**    | prettier     | ~5s     |
| **backend lint**       | ruff         | ~3s     |
| **backend format**     | ruff format  | ~2s     |
| **backend test**       | pytest       | ~5s     |
| **firebase deploy**    | firebase CLI | ~20s    |

### local testing

```bash
# frontend
npm run lint:frontend        # eslint check
npm run typecheck            # typescript compiler
npm run format:check         # prettier validation

# backend
npm run lint:backend         # ruff check
npm run format:backend       # ruff format
npm run test:backend         # pytest suite
```

### code quality metrics

- **typescript strict mode:** enabled
- **eslint rules:** 50+ rules enforced
- **prettier config:** consistent formatting
- **test coverage:** backend endpoints covered
- **type safety:** zod runtime validation + typescript compile-time checks

---

## 📦 dependencies

### production dependencies (74 packages)

**react ecosystem:**

- `next@16.1.4` - react framework with app router
- `react@19.2.3` - ui library with concurrent features
- `react-dom@19.2.3` - dom renderer

**ui components (30 radix primitives):**

- `@radix-ui/react-dialog` - accessible modals
- `@radix-ui/react-dropdown-menu` - context menus
- `@radix-ui/react-slider` - range inputs
- `@radix-ui/react-switch` - toggles
- `@radix-ui/react-tabs` - tab navigation
- `@radix-ui/react-toast` - notifications
- _[24 more radix components]_

**firebase:**

- `firebase@12.8.0` - client SDK (auth, firestore, storage)
- `firebase-admin@13.6.0` - server SDK (bypasses security rules)

**utilities:**

- `zod@3.25.76` - runtime schema validation
- `class-variance-authority@0.7.1` - variant styling
- `clsx@2.1.1` + `tailwind-merge@3.3.1` - class merging
- `lucide-react@0.454.0` - icon library (1000+ icons)
- `sonner@1.7.4` - toast notifications
- `date-fns@4.1.0` - date manipulation

**voice ai:**

- `@elevenlabs/react@0.13.0` - conversational ai hooks
- `@elevenlabs/elevenlabs-js@2.32.0` - api client

**charts:**

- `recharts@2.15.4` - analytics visualization

### development dependencies (12 packages)

- `typescript@5` - type checking
- `eslint@9.39.2` - linting
- `prettier@3.8.1` - formatting
- `tailwindcss@4.1.9` - css framework
- `concurrently@9.2.1` - parallel script execution

---

## 🌐 deployment

### frontend (vercel)

```bash
# install vercel CLI
npm i -g vercel

# deploy
vercel --prod
```

**environment variables to set:**

- all `NEXT_PUBLIC_*` variables from .env
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### backend (railway/render)

**railway:**

```bash
railway login
railway link
railway up
```

**render:**

1. connect github repo
2. set build command: `pip install -r requirements.txt`
3. set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### firebase

**firestore rules:**

```bash
firebase deploy --only firestore:rules
```

**firestore indexes:**

```bash
firebase deploy --only firestore:indexes
```

**storage rules:**

```bash
firebase deploy --only storage
```

---

## 📚 documentation

- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - firebase configuration guide
- **[AGENT_PROMPT.md](AGENT_PROMPT.md)** - voice agent system prompt
- **[docs/ELEVENLABS_SETUP.md](docs/ELEVENLABS_SETUP.md)** - elevenlabs integration
- **[docs/VOICE_SELECTION.md](docs/VOICE_SELECTION.md)** - voice selection guide
- **[docs/VOICE_SETTINGS_CHEATSHEET.md](docs/VOICE_SETTINGS_CHEATSHEET.md)** - quick reference

---

## 👥 team

built at **MLH HackHive 2026** by:

| contributor             | github                                             | role                     |
| ----------------------- | -------------------------------------------------- | ------------------------ |
| **sunny patel**         | [@sunnypatell](https://github.com/sunnypatell)     | full-stack, architecture |
| **daniyal lilani**      | [@daniyallilani](https://github.com/daniyallilani) | backend, ai/ml           |
| **aryan kashefi-aazam** | [@aryan-ka](https://github.com/aryan-ka)           | frontend, ui/ux          |

---

## 📄 license

[MIT](LICENSE) © 2026 CultureLens Team

---

<div align="center">

**[↑ back to top](#culturelens)**

made with ❤️ at ontario tech university

</div>
