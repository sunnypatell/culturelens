# contributing to CultureLens

thanks for your interest in contributing. this guide covers setup, conventions, and the PR process.

---

## getting started

### prerequisites

| tool | version | check |
| --- | --- | --- |
| Node.js | 18+ | `node --version` |
| Python | 3.11+ | `python3 --version` |
| npm | 9+ | `npm --version` |
| Git | 2+ | `git --version` |

**optional (for iOS development):**

| tool | version |
| --- | --- |
| Xcode | 15+ |
| XcodeGen | latest (`brew install xcodegen`) |
| SwiftLint | latest (`brew install swiftlint`) |

### setup

```bash
git clone https://github.com/sunnypatell/culturelens.git
cd culturelens
npm run setup        # installs npm + python deps
cp .env.example .env # configure your env vars
npm run dev:all      # start frontend + backend
```

### project structure

```
culturelens/
├── app/              # Next.js pages + API routes
├── components/       # React components (dashboard, auth, ui)
├── lib/              # shared utilities, hooks, types, firebase
├── backend/          # FastAPI Python backend
├── ios/              # native iOS app (SwiftUI + MVVM)
├── tests/            # vitest frontend unit tests
├── .github/          # CI workflows, PR/issue templates
├── docs/             # additional documentation
└── scripts/          # setup and utility scripts
```

---

## development workflow

### branch naming

```
feat/short-description     # new feature
fix/short-description      # bug fix
docs/short-description     # documentation
refactor/short-description # code restructuring
test/short-description     # adding tests
chore/short-description    # maintenance
```

### commit messages

we use [conventional commits](https://www.conventionalcommits.org/):

```
type(scope): description

- bullet point explaining change
- another point if needed
```

**types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

**rules:**
- lowercase everything (except code references)
- imperative mood ("added", "removed", not "add", "remove")
- use `!` for breaking changes: `feat!:` or `feat(api)!:`
- include commit SHAs when referencing previous commits

**examples:**
```
feat(api): added session comparison endpoint

- compares two sessions by ID
- returns diff of metrics, insights, and communication patterns

fix(ios): resolved cross-platform data sync by unwrapping API response envelope

- APIClient.request<T> now decodes APIResponse<T> envelope

ref: https://firebase.google.com/docs/reference/swift/firebaseauth/api/reference/Classes/User
```

### pull request process

1. create a branch from `main`
2. make your changes with conventional commits
3. ensure all checks pass locally:
   ```bash
   npm test              # frontend unit tests
   npm run typecheck     # typescript
   npm run lint:frontend # eslint
   npm run format:check  # prettier
   ```
4. push and open a PR using the [PR template](.github/pull_request_template.md)
5. wait for CI to pass (10 workflows)
6. request review

---

## code style

### TypeScript / React

- **strict mode** enabled -- no `any`, no implicit returns
- **path aliases** -- use `@/` for project root (e.g., `@/lib/logger`)
- **component structure**: function components with hooks, no class components
- **naming**: `camelCase` for variables/functions, `PascalCase` for components/types
- **imports**: prefer named exports, group by external -> internal
- **validation**: use Zod schemas for all API request bodies

### Python

- **ruff** for linting and formatting (configured in `pyproject.toml`)
- **type hints** on all function signatures
- **pydantic v2** for request/response models
- **async/await** for all I/O operations

### Swift

- **SwiftLint** rules in `ios/CultureLens/.swiftlint.yml`
- **MVVM** architecture -- views are thin, logic in ViewModels
- **async/await** -- no completion handlers
- **actors** for thread safety (e.g., `APIClient` is an actor)

---

## testing

### frontend (vitest)

```bash
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

tests live in `tests/` mirroring the source structure:
```
tests/
└── lib/
    ├── api-client.test.ts    # API client mock tests
    ├── api-errors.test.ts    # error class tests
    └── rate-limiter.test.ts  # rate limiting tests
```

### backend (pytest)

```bash
npm run test:backend
# or directly:
cd backend && python -m pytest -v
```

### iOS (XCTest)

```bash
cd ios/CultureLens
xcodegen generate
xcodebuild test -project CultureLens.xcodeproj -scheme CultureLens \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -only-testing:CultureLensTests CODE_SIGNING_ALLOWED=NO
```

---

## architecture decisions

### why Next.js API routes instead of a separate backend?

the FastAPI backend exists for heavy compute (audio processing), but most CRUD operations go through Next.js API routes. this means:
- single deployment (Vercel handles everything)
- shared TypeScript types between frontend and API
- edge function performance for auth verification
- no CORS issues for same-origin requests

### why Firestore instead of PostgreSQL?

- **free tier**: Firebase Spark plan covers our usage (50k reads/day, 20k writes/day)
- **real-time**: Firestore listeners enable live session updates without polling
- **serverless**: no database to manage, auto-scales
- **security rules**: declarative per-document access control

### why ElevenLabs WebSocket instead of REST?

- **streaming**: real-time audio in/out without buffering entire responses
- **latency**: sub-200ms response time for voice interactions
- **bidirectional**: simultaneous listening and speaking

---

## need help?

- open an [issue](https://github.com/sunnypatell/culturelens/issues) for bugs or feature requests
- check existing [discussions](https://github.com/sunnypatell/culturelens/discussions) for Q&A
- read the [documentation](README.md#-documentation) for guides
