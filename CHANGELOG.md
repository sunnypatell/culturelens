# changelog

all notable changes to CultureLens are documented here.
format based on [keep a changelog](https://keepachangelog.com/en/1.1.0/), versioned with [semver](https://semver.org/).

---

## [0.2.0] - 2026-01-28

### added

- **testing**: vitest test suite with 71 tests across 8 files (api-client, api-errors, rate-limiter, pdf-export, format, logger, error-boundary, client-logger)
- **CI**: frontend-test.yml workflow running vitest + next build verification on PRs
- **logging**: structured pino logger (`lib/logger.ts`) with request correlation IDs, client-side logger (`lib/client-logger.ts`)
- **health check**: `/api/health` endpoint checking firebase, gemini, and elevenlabs status
- **docker**: multi-stage Dockerfile for Next.js, backend Dockerfile, docker-compose.yml
- **documentation**: mermaid architecture diagrams in README, comprehensive CONTRIBUTING.md, PR template, issue templates (bug report + feature request)
- **PDF export**: branded PDF report generation from analysis results using jspdf + autotable
- **command palette**: Cmd+K keyboard shortcut with cmdk library (navigation, theme toggle, sign out)
- **error boundaries**: `app/error.tsx`, `app/global-error.tsx`, reusable `ErrorBoundary` component wrapping dashboard panels
- **loading skeletons**: skeleton components for dashboard and library views, route-level `app/loading.tsx`
- **pre-commit hooks**: husky + lint-staged running eslint --fix and prettier on staged files
- **developer tooling**: `.editorconfig`, `.nvmrc`, convenience scripts (`npm run lint`, `format`, `validate`)

### changed

- **eslint**: strengthened config with `@typescript-eslint/no-explicit-any`, `react-hooks`, `jsx-a11y` rules, `no-console` error in server code
- **type safety**: eliminated 35+ explicit `any` types across codebase with proper TypeScript types
- **logging**: replaced 143+ `console.log` statements with structured pino logger in all server-side code
- **code quality**: deduplicated session fetching date formatting into `lib/format.ts`, gradient constants into `lib/constants.ts`
- **coverage thresholds**: raised from 40% to 55% lines/functions/statements, 45% branches

## [0.1.0] - 2025-12-01

### added

- **web app**: Next.js 16 + React 19 dashboard with real-time voice conversation analysis
- **AI analysis**: Google Gemini 2.5 Flash integration for cultural communication insights
- **voice agent**: ElevenLabs WebSocket integration for real-time voice interactions
- **authentication**: Firebase Auth with email/password, Google Sign-In, phone verification
- **database**: Firestore for sessions, transcripts, user profiles, and analysis results
- **iOS app**: native SwiftUI app with MVVM architecture, async/await, actor isolation
- **CI/CD**: 10 GitHub Actions workflows (frontend lint/format/typecheck, backend lint/format/test, iOS build/test/release)
- **session management**: create, record, analyze, favorite, delete sessions
- **analysis pipeline**: transcript parsing → metric computation → Gemini AI insights → debrief generation
- **PDF export**: export analysis results as branded PDF reports
- **settings**: theme toggle, notification preferences, account management
- **data export**: GDPR-compliant user data export
