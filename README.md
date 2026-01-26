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
[![CI](https://img.shields.io/github/actions/workflow/status/sunnypatell/culturelens/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/sunnypatell/culturelens/actions)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

_Real-Time Conversational AI • Cultural Communication Analysis • Privacy-First Architecture_

[Live Demo](https://culturelens.vercel.app) • [Documentation](#-architecture) • [Quick Start](#-quick-start)

</div>

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

### Data Flow Architecture

**Session Lifecycle:**

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

### Security Architecture

- **Authentication:** Firebase Auth with JWT verification
- **Authorization:** Firebase Admin SDK with per-user data filtering
- **API Security:** All endpoints require `Authorization: Bearer <token>` header
- **Ownership Verification:** session.userId checked on every mutation
- **Rate Limiting:** ElevenLabs TTS limited to 10 req/min per user
- **Firestore Rules:** Authenticated users can only access own data
- **CORS:** Configured for vercel.app + localhost origins
- **Env Separation:** Client/server secrets properly scoped

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

GitHub Actions runs on every pull request:

| Check                  | Tool         | Runtime |
| ---------------------- | ------------ | ------- |
| **Frontend Lint**      | ESLint       | ~10s    |
| **Frontend Typecheck** | TypeScript   | ~15s    |
| **Frontend Format**    | Prettier     | ~5s     |
| **Backend Lint**       | Ruff         | ~3s     |
| **Backend Format**     | Ruff Format  | ~2s     |
| **Backend Test**       | Pytest       | ~5s     |
| **iOS Lint**           | SwiftLint    | ~5s     |
| **iOS Build & Test**   | Xcode 16     | ~2m     |
| **Firebase Deploy**    | Firebase CLI | ~20s    |

### Local Testing

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

### Code Quality Metrics

- **TypeScript Strict Mode:** Enabled
- **ESLint Rules:** 50+ rules enforced
- **Prettier Config:** Consistent formatting
- **Test Coverage:** Backend endpoints covered
- **Type Safety:** Zod runtime validation + TypeScript compile-time checks

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

- **[ios/README.md](ios/README.md)** - iOS app architecture, setup, and deployment
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Firebase configuration guide
- **[AGENT_PROMPT.md](AGENT_PROMPT.md)** - Voice agent system prompt
- **[docs/ELEVENLABS_SETUP.md](docs/ELEVENLABS_SETUP.md)** - ElevenLabs integration
- **[docs/VOICE_SELECTION.md](docs/VOICE_SELECTION.md)** - Voice selection guide
- **[docs/VOICE_SETTINGS_CHEATSHEET.md](docs/VOICE_SETTINGS_CHEATSHEET.md)** - Quick reference

---

## 👥 Team

Built at **MLH HackHive 2026** by:

| Contributor             | GitHub                                             | Role                       |
| ----------------------- | -------------------------------------------------- | -------------------------- |
| **Sunny Patel**         | [@sunnypatell](https://github.com/sunnypatell)     | Full-Stack, Architecture   |
| **Daniyal Lilani**      | [@daniyallilani](https://github.com/daniyallilani) | Backend, AI/ML             |
| **Aryan Kashefi-Aazam** | [@aryan-ka](https://github.com/aryan-ka)           | Frontend, UI/UX            |
| **Paul Joseph**         | [@pauljoseph](https://github.com/paulj-04)         | Frontend, UI/UX, Marketing |

---

## 📄 License

[MIT](LICENSE) © 2026 CultureLens Team

---

<div align="center">

**[↑ Back to Top](#culturelens)**

Made with ❤️ at Ontario Tech University

</div>
