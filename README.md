<div align="center">

<img src="public/favicon.svg" width="120" height="120" alt="CultureLens Logo" />

# CultureLens

**Consent-Based Conversation Analytics with Cultural Awareness**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Swift](https://img.shields.io/badge/Swift-5.9-F05138?style=flat-square&logo=swift&logoColor=white)](ios/)
[![iOS](https://img.shields.io/badge/iOS-16.0+-000000?style=flat-square&logo=apple&logoColor=white)](ios/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.11-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Lint](https://img.shields.io/github/actions/workflow/status/sunnypatell/culturelens/frontend-lint.yml?branch=main&style=flat-square&label=lint&logo=eslint)](https://github.com/sunnypatell/culturelens/actions/workflows/frontend-lint.yml)
[![Tests](https://img.shields.io/github/actions/workflow/status/sunnypatell/culturelens/frontend-test.yml?branch=main&style=flat-square&label=tests&logo=vitest)](https://github.com/sunnypatell/culturelens/actions/workflows/frontend-test.yml)
[![Validate](https://img.shields.io/github/actions/workflow/status/sunnypatell/culturelens/validate.yml?branch=main&style=flat-square&label=validate)](https://github.com/sunnypatell/culturelens/actions/workflows/validate.yml)
[![License](https://img.shields.io/badge/License-Source_Available-blue?style=flat-square)](LICENSE)

_Real-Time Conversational AI • Cultural Communication Analysis • Privacy-First Architecture_

[Live Demo](https://culturelens.vercel.app) • [Docs](/docs) • [API Reference](/docs/api) • [Quick Start](#-quick-start)

</div>

---

## 🎬 Demo

> full walkthrough of the web app and native iOS app running side-by-side

https://github.com/user-attachments/assets/c55d6efe-05c0-49cf-82ff-e8a41719c4f0

---

## 📖 Overview

CultureLens is a **production-grade conversation analytics platform** that provides real-time, culturally-aware insights into communication patterns. Built during **MLH HackHive 2026**, it combines cutting-edge voice AI with sophisticated analysis pipelines to deliver neutral, non-judgmental feedback on conversational dynamics.

### Key Capabilities

- **🎙️ Real-Time Voice Interaction** - ElevenLabs conversational AI with multi-voice support
- **📊 Communication Metrics** - Turn-taking balance, interruption patterns, topic transitions
- **🌍 Cultural Context Analysis** - Directness, formality, and communication style insights
- **🔒 Privacy-First Design** - Dual consent requirement, ephemeral/transcript-only storage modes
- **⚡ Edge-Optimized Pipeline** - Vercel Edge + Firebase Admin SDK for sub-100ms auth verification
- **🎨 Enterprise-Grade UI** - 30+ Radix primitives, Tailwind CSS 4, responsive design system

---

## 🏗️ Architecture

### Technology Stack

<table>
<tr>
<td width="50%" valign="top">

**Frontend Architecture**

- **Framework:** Next.js 16 (App Router, React Server Components)
- **Runtime:** React 19 with concurrent features
- **Language:** TypeScript 5 (strict mode, path aliases)
- **Styling:** Tailwind CSS 4 + CSS Variables theming
- **Components:** shadcn/ui (30+ Radix primitives)
- **State:** React hooks + Firebase real-time subscriptions
- **Validation:** Zod schemas (runtime + compile-time safety)
- **Voice:** ElevenLabs React SDK (`@elevenlabs/react`)

</td>
<td width="50%" valign="top">

**Backend Architecture**

- **Framework:** FastAPI (async/await, Pydantic v2)
- **Runtime:** Python 3.11+ (type hints, dataclasses)
- **Database:** Firebase Firestore (NoSQL, real-time)
- **Storage:** Firebase Storage (signed URLs, resumable uploads)
- **Auth:** Firebase Admin SDK (server-side verification)
- **Testing:** Pytest + asyncio fixtures
- **Linting:** Ruff (100x faster than Pylint)
- **API Docs:** OpenAPI/Swagger (auto-generated)

</td>
</tr>
<tr>
<td colspan="2" valign="top">

**iOS Native App** ([📱 Full Documentation](ios/README.md))

- **Language:** Swift 5.9 (async/await, actors, property wrappers)
- **Framework:** SwiftUI (MVVM architecture, Combine)
- **Platform:** iOS 16+ / iPadOS 16+ / Apple Silicon Macs
- **Auth:** Firebase Auth SDK + Google Sign-In
- **Storage:** Firebase Firestore + Firebase Storage
- **Voice AI:** ElevenLabs WebSocket integration
- **Testing:** XCTest (unit + UI tests), code coverage
- **CI/CD:** GitHub Actions, XcodeGen, Fastlane
- **Quality:** SwiftLint, accessibility (VoiceOver), localization

</td>
</tr>
</table>

### Component Architecture

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
│   │       ├── route.ts         # get/update/delete session
│   │       ├── analyze/         # trigger Gemini AI analysis pipeline
│   │       ├── favorite/        # toggle favorite status
│   │       └── upload/          # resumable audio upload
│   ├── user/                    # user management endpoints
│   │   ├── profile/             # update display name, org, photo
│   │   ├── export/              # GDPR-compliant data export
│   │   ├── delete/              # cascade account deletion
│   │   └── sync-profile/        # firebase auth → firestore sync
│   ├── auth/                    # authentication endpoints
│   │   ├── user/                # GET current user info
│   │   └── admin/roles/         # POST set user roles (admin only)
│   ├── audio/[id]/              # audio file retrieval
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
│   ├── footer.tsx               # app metadata
│   ├── user-menu.tsx            # dropdown menu with sign-out
│   └── terms-of-service-modal.tsx # consent modal for legal compliance
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
├── firebase.ts                  # client SDK initialization
├── firebase-admin.ts            # admin SDK singleton
├── firebase-server-utils.ts     # admin SDK firestore helpers
├── firebase-utils.ts            # client-side firestore helpers
├── auth-client.ts               # client-side auth methods
├── auth-server.ts               # server-side auth verification
├── gemini-analysis.ts           # Google Gemini AI transcript analysis
├── rate-limiter.ts              # API rate limiting
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

### System Architecture

```mermaid
graph TB
    subgraph Client["client layer"]
        WEB["Next.js 16 web app<br/>React 19 + Tailwind CSS 4"]
        IOS["iOS app<br/>SwiftUI + MVVM"]
    end

    subgraph Edge["edge / API layer"]
        API["Next.js API routes<br/>23 endpoints"]
        MW["middleware<br/>auth + rate limiting"]
    end

    subgraph Services["external services"]
        FB_AUTH["Firebase Auth<br/>5 auth methods"]
        FB_DB["Firestore<br/>6 collections"]
        FB_STORE["Firebase Storage<br/>audio files"]
        GEMINI["Google Gemini 2.5 Flash<br/>transcript analysis"]
        ELEVEN["ElevenLabs<br/>voice agent + TTS"]
    end

    subgraph Backend["python backend"]
        FAST["FastAPI<br/>health + sessions"]
    end

    WEB --> MW --> API
    IOS --> API
    API --> FB_AUTH
    API --> FB_DB
    API --> FB_STORE
    API --> GEMINI
    API --> ELEVEN
    WEB --> ELEVEN
    IOS --> ELEVEN
    WEB --> FAST
```

### Data Flow

```mermaid
sequenceDiagram
    participant U as user
    participant W as web / iOS
    participant A as API routes
    participant F as firestore
    participant E as elevenlabs
    participant G as gemini AI

    U->>W: start session
    W->>A: POST /api/sessions
    A->>F: create session doc
    A-->>W: session ID

    U->>W: record conversation
    W->>E: websocket audio stream
    E-->>W: agent responses
    W->>A: POST /api/transcripts
    A->>F: store transcript

    U->>W: request analysis
    W->>A: POST /api/sessions/:id/analyze
    A->>F: fetch transcript
    A->>G: analyze with cultural prompt
    G-->>A: insights + metrics
    A->>F: store analysis result
    A-->>W: analysis data

    U->>W: view insights
    W->>A: GET /api/sessions/:id/analyze
    A->>F: fetch analysis
    A-->>W: formatted insights
```

### Authentication Flow

```mermaid
flowchart LR
    A[user] --> B{auth method}
    B --> C[email/password]
    B --> D[google OAuth]
    B --> E[phone SMS]
    B --> F[email link]

    C --> G[Firebase Auth]
    D --> G
    E --> G
    F --> G

    G --> H[ID token]
    H --> I[API routes<br/>Bearer token]
    I --> J[verifyIdToken]
    J --> K[Firestore<br/>userId scoped]
```

### Security Architecture

- **authentication:** Firebase Auth with JWT verification on every API call
- **authorization:** Firebase Admin SDK with per-user data isolation
- **API security:** all endpoints require `Authorization: Bearer <token>` header
- **ownership verification:** `session.userId` checked on every mutation
- **rate limiting:** ElevenLabs TTS limited to 10 req/min per user
- **firestore rules:** authenticated users can only access their own data
- **CORS:** configured for vercel.app + localhost origins
- **env separation:** client/server secrets properly scoped via `NEXT_PUBLIC_` prefix

---

## 🚀 Quick Start

### Prerequisites

| Tool        | Version | Purpose          |
| ----------- | ------- | ---------------- |
| **Node.js** | 18+     | Frontend runtime |
| **Python**  | 3.11+   | Backend runtime  |
| **npm**     | 9+      | Package manager  |
| **Git**     | 2+      | Version control  |

### One-Command Setup

```bash
git clone https://github.com/sunnypatell/culturelens.git
cd culturelens
npm run setup
```

**what this does:**

- ✅ installs 74 npm packages (next.js, react, radix-ui, etc.)
- ✅ creates python virtual environment
- ✅ installs 15 python packages (fastapi, uvicorn, pytest, etc.)
- ✅ Validates Python installation
- ✅ Checks for .env files

### Environment Configuration

**1. Copy environment templates:**

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

**2. Configure frontend (.env):**

```env
# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# ElevenLabs (public agent, no server needed)
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID

# Firebase Admin SDK (server-side)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----\n"
```

**3. Configure backend (backend/.env):**

```env
ELEVENLABS_API_KEY=sk_your_api_key_here
```

### Run Development Servers

**🔥 Recommended: Single command (works on all platforms)**

```bash
npm run dev:all
```

This starts both servers concurrently:

- **Frontend:** http://localhost:3000 (cyan logs)
- **Backend:** http://localhost:8000/docs (magenta logs)

**Alternative: Separate terminals**

```bash
# terminal 1 - frontend
npm run dev

# terminal 2 - backend
npm run dev:backend
```

**Cross-Platform Compatibility:**

- ✅ **Windows:** Uses `shell: true` for .cmd/.exe handling
- ✅ **Mac/Linux:** Direct binary execution for better performance
- ✅ **Python Detection:** Auto-detects `python3` vs `python` command
- ✅ **Path Spaces:** Properly quoted paths throughout

### Build for Production

```bash
npm run build
npm run start
```

---

## 🎯 Features

### 🎙️ Voice Interaction

- **Multi-Voice Support:** 4 pre-configured voices (Rachel, Drew, Clyde, Elli)
- **Real-Time Streaming:** ElevenLabs conversational AI SDK
- **Agent Customization:** System prompt tuning for cultural awareness
- **Transcript Capture:** Automatic conversation logging to Firestore

### 📊 Analysis Pipeline

- **Turn-Taking Metrics:** Speaking time distribution, balance analysis
- **Interruption Detection:** Overlap events, competitive vs. collaborative patterns
- **Silence Tracking:** Pause analysis, conversational flow
- **Cultural Lens:** Directness, formality, communication style insights
- **Key Moments:** Timestamp-indexed highlights with evidence quotes

### 🎨 User Interface

- **Responsive Design:** Mobile-first, tablet, desktop layouts
- **Dark Mode:** System preference detection + manual toggle
- **Accessibility:** WCAG 2.1 AA compliant, keyboard navigation
- **Animations:** Framer-motion-inspired transitions
- **Real-Time Updates:** Firestore listeners for live data sync

### 🔐 Authentication

- **5 Auth Methods:** Email/password, Google OAuth, phone (SMS), passwordless email, password reset
- **Account Linking:** Automatic merging of multiple sign-in methods
- **Session Management:** Persistent auth state, auto-refresh tokens
- **Profile Sync:** Firebase Auth ↔ Firestore bidirectional sync

### ⚙️ Settings & Data

- **User Preferences:** Notifications, auto-save, analysis depth
- **Data Retention:** Configurable (30/90/365 days, manual only)
- **GDPR Compliance:** Full data export (JSON), cascade account deletion
- **Favorite Sessions:** Star important conversations for quick access

---

## 🧪 Testing & Quality

### Continuous Integration

GitHub Actions runs **10 workflows** on every pull request and push:

| workflow               | tool           | what it checks                                                                                                             |
| ---------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **frontend test**      | vitest         | 71 unit tests across 8 files (API client, errors, rate limiter, PDF export, format, logger, error boundary, client logger) |
| **frontend build**     | next build     | verifies production build compiles without errors                                                                          |
| **frontend lint**      | ESLint         | TypeScript code quality rules                                                                                              |
| **frontend typecheck** | tsc --noEmit   | strict type checking                                                                                                       |
| **frontend format**    | Prettier       | consistent code formatting                                                                                                 |
| **backend lint**       | Ruff           | Python linting (100x faster than Pylint)                                                                                   |
| **backend format**     | Ruff Format    | Python formatting                                                                                                          |
| **backend test**       | Pytest         | FastAPI endpoint tests                                                                                                     |
| **iOS lint**           | SwiftLint      | Swift code style                                                                                                           |
| **iOS build & test**   | Xcode + XCTest | 45 unit tests + simulator build                                                                                            |

### local testing

```bash
# frontend unit tests
npm test                     # run all vitest tests
npm run test:watch           # watch mode
npm run test:coverage        # coverage report

# frontend quality
npm run lint:frontend        # eslint
npm run typecheck            # typescript strict mode
npm run format:check         # prettier

# backend
npm run test:backend         # pytest suite
npm run lint:backend         # ruff check

# iOS (requires Xcode)
cd ios/CultureLens && xcodegen generate
xcodebuild test -project CultureLens.xcodeproj -scheme CultureLens \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -only-testing:CultureLensTests CODE_SIGNING_ALLOWED=NO
```

### test coverage

| layer        | framework                | tests | coverage areas                                                                              |
| ------------ | ------------------------ | ----- | ------------------------------------------------------------------------------------------- |
| **frontend** | vitest + testing-library | 71    | API client, errors, rate limiter, PDF export, format, logger, error boundary, client logger |
| **backend**  | pytest                   | 5     | health checks, session CRUD                                                                 |
| **iOS**      | XCTest                   | 45    | models, enums, codable conformance, UI layout                                               |

### code quality

- **TypeScript strict mode** enabled with path aliases
- **Zod schemas** for runtime + compile-time validation on all API routes
- **structured logging** via pino (JSON in production, pretty in dev)
- **health endpoint** at `/api/health` monitors firebase, gemini, elevenlabs status

---

## 📦 Dependencies

### Production Dependencies (74 packages)

**React Ecosystem:**

- `next@16.1.4` - React framework with App Router
- `react@19.2.3` - UI library with concurrent features
- `react-dom@19.2.3` - DOM renderer

**UI Components (30 Radix primitives):**

- `@radix-ui/react-dialog` - accessible modals
- `@radix-ui/react-dropdown-menu` - context menus
- `@radix-ui/react-slider` - range inputs
- `@radix-ui/react-switch` - toggles
- `@radix-ui/react-tabs` - tab navigation
- `@radix-ui/react-toast` - notifications
- _[24 more radix components]_

**Firebase:**

- `firebase@12.8.0` - Client SDK (Auth, Firestore, Storage)
- `firebase-admin@13.6.0` - Server SDK (bypasses security rules)

**Utilities:**

- `zod@3.25.76` - Runtime schema validation
- `class-variance-authority@0.7.1` - Variant styling
- `clsx@2.1.1` + `tailwind-merge@3.3.1` - Class merging
- `lucide-react@0.454.0` - Icon library (1000+ icons)
- `sonner@1.7.4` - Toast notifications
- `date-fns@4.1.0` - Date manipulation

**Voice AI:**

- `@elevenlabs/react@0.13.0` - Conversational AI hooks
- `@elevenlabs/elevenlabs-js@2.32.0` - API client

**Charts:**

- `recharts@2.15.4` - Analytics visualization

### Development Dependencies (12 packages)

- `typescript@5` - Type checking
- `eslint@9.39.2` - Linting
- `prettier@3.8.1` - Formatting
- `tailwindcss@4.1.9` - CSS framework
- `concurrently@9.2.1` - Parallel script execution

---

## 🐳 Docker

run the entire stack in containers:

```bash
# build and start all services
docker compose up --build

# services:
#   frontend -> http://localhost:3000
#   backend  -> http://localhost:8000
```

the frontend uses a multi-stage build (deps -> build -> runner) with Next.js standalone output for minimal image size. environment variables are passed through from your `.env` file.

```bash
# build just the frontend
docker build -t culturelens .

# build just the backend
docker build -t culturelens-backend ./backend
```

---

## 🌐 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment variables to set:**

- All `NEXT_PUBLIC_*` variables from .env
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Backend (Local Development)

For hackathon demonstration, the backend runs locally. Use:

```bash
npm run dev:all  # Runs both frontend and backend concurrently
```

The Python backend serves at http://localhost:8000 with auto-generated API docs at `/docs`.

### Firebase

**Firestore rules:**

```bash
firebase deploy --only firestore:rules
```

**Firestore indexes:**

```bash
firebase deploy --only firestore:indexes
```

**Storage rules:**

```bash
firebase deploy --only storage
```

---

## 📚 Documentation

| document                                                                   | description                                              |
| -------------------------------------------------------------------------- | -------------------------------------------------------- |
| **[CONTRIBUTING.md](CONTRIBUTING.md)**                                     | setup, branch conventions, PR process, code style        |
| **[ios/README.md](ios/README.md)**                                         | iOS app architecture, setup, and deployment              |
| **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)**                                 | Firebase project configuration guide                     |
| **[AGENT_PROMPT.md](AGENT_PROMPT.md)**                                     | ElevenLabs voice agent system prompt                     |
| **[docs/ELEVENLABS_SETUP.md](docs/ELEVENLABS_SETUP.md)**                   | ElevenLabs integration walkthrough                       |
| **[docs/VOICE_SELECTION.md](docs/VOICE_SELECTION.md)**                     | voice selection and customization guide                  |
| **[docs/VOICE_SETTINGS_CHEATSHEET.md](docs/VOICE_SETTINGS_CHEATSHEET.md)** | quick reference for voice settings                       |
| **[docs/api.md](docs/api.md)**                                             | comprehensive Next.js API route reference (23 endpoints) |

### API reference

- **health check:** `GET /api/health` -- returns service status for firebase, gemini, elevenlabs
- **FastAPI docs:** `http://localhost:8000/docs` -- auto-generated OpenAPI/Swagger UI
- **all 16 Next.js API routes** documented in the [component architecture](#component-architecture) section above

---

## 👥 Team

| Contributor        | GitHub                                             | Role                     |
| ------------------ | -------------------------------------------------- | ------------------------ |
| **Sunny Patel**    | [@sunnypatell](https://github.com/sunnypatell)     | Full-Stack, Architecture |
| **Daniyal Lilani** | [@daniyallilani](https://github.com/daniyallilani) | Backend, AI/ML           |

---

## 📄 License

[Source Available License](LICENSE) © 2026 Sunny Patel

You may use and distribute this software, but modifications require permission. See [LICENSE](LICENSE) for full terms.

---

<div align="center">

**[↑ Back to Top](#culturelens)**

Made with ❤️ at Ontario Tech University

</div>
