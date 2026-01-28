# 📡 culturelens API reference

comprehensive documentation for all Next.js API routes.

> **💡 interactive explorer**: visit [`/api/docs`](/api/docs) for a full interactive API reference powered by [Scalar](https://scalar.com) with try-it-out functionality, code samples, and OpenAPI 3.1 spec.

---

## 📖 overview

### base URL

```
production: https://culturelens.vercel.app/api
development: http://localhost:3000/api
```

### authentication

all endpoints (except `/api/health`) require a Firebase ID token passed as a bearer token:

```
Authorization: Bearer <firebase-id-token>
```

tokens are verified server-side using Firebase Admin SDK's `verifyIdToken()`. each request extracts the `uid` from the decoded token to scope data access.

### rate limiting

| endpoint                   | limit       | window              |
| -------------------------- | ----------- | ------------------- |
| `POST /api/elevenlabs/tts` | 10 requests | 60 seconds per user |
| all other endpoints        | no limit    | —                   |

### response envelope

all responses follow a standard envelope format.

**success response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "optional human-readable message",
  "meta": { "total": 5 }
}
```

**error response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "human-readable description",
    "details": "optional technical details",
    "hint": "optional suggestion for resolution"
  }
}
```

### error codes

| code                     | status | description                           |
| ------------------------ | ------ | ------------------------------------- |
| `BAD_REQUEST`            | 400    | invalid request data                  |
| `VALIDATION_ERROR`       | 400    | request body failed schema validation |
| `UNAUTHORIZED`           | 401    | missing or invalid auth token         |
| `INVALID_TOKEN`          | 401    | expired or malformed token            |
| `FORBIDDEN`              | 403    | insufficient permissions              |
| `NOT_FOUND`              | 404    | requested resource does not exist     |
| `CONFLICT`               | 409    | resource conflict                     |
| `INTERNAL_ERROR`         | 500    | unexpected server error               |
| `DATABASE_ERROR`         | 503    | firestore operation failed            |
| `EXTERNAL_SERVICE_ERROR` | 503    | third-party service unavailable       |
| `SERVICE_UNAVAILABLE`    | 503    | service temporarily unavailable       |

---

## 📋 sessions

### `POST /api/sessions`

creates a new conversation session with dual consent and configuration settings.

**auth:** required

**request body:**

| field                          | type                              | required | description                         |
| ------------------------------ | --------------------------------- | -------- | ----------------------------------- |
| `consent.personA`              | `boolean`                         | yes      | participant A consent               |
| `consent.personB`              | `boolean`                         | yes      | participant B consent               |
| `consent.timestamp`            | `string (ISO 8601)`               | no       | consent timestamp (defaults to now) |
| `settings.storageMode`         | `"ephemeral" \| "transcriptOnly"` | yes      | data retention mode                 |
| `settings.voiceId`             | `string`                          | yes      | elevenlabs voice ID                 |
| `settings.title`               | `string`                          | no       | session title                       |
| `settings.sessionType`         | `string`                          | no       | session type label                  |
| `settings.participantCount`    | `number`                          | no       | number of participants              |
| `settings.analysisMethod`      | `"quick" \| "standard" \| "deep"` | no       | analysis depth                      |
| `settings.analysisDepth`       | `"quick" \| "standard" \| "deep"` | no       | analysis depth (alias)              |
| `settings.culturalContextTags` | `string[]`                        | no       | cultural context tags               |
| `settings.sensitivityLevel`    | `number (0-5)`                    | no       | sensitivity level                   |

**validation:** both `consent.personA` and `consent.personB` must be `true`.

**example request:**

```bash
curl -X POST /api/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "consent": { "personA": true, "personB": true },
    "settings": { "storageMode": "transcriptOnly", "voiceId": "21m00Tcm4TlvDq8ikWAM" }
  }'
```

**example response** `201`:

```json
{
  "success": true,
  "data": {
    "id": "sess_1706000000000_abc123",
    "userId": "firebase-uid",
    "createdAt": "2026-01-28T12:00:00.000Z",
    "consent": {
      "personA": true,
      "personB": true,
      "timestamp": "2026-01-28T12:00:00.000Z"
    },
    "settings": {
      "storageMode": "transcriptOnly",
      "voiceId": "21m00Tcm4TlvDq8ikWAM"
    },
    "status": "recording",
    "isFavorite": false
  },
  "message": "session created successfully"
}
```

**errors:** `400` (consent validation), `401`, `503` (database)

---

### `GET /api/sessions`

retrieves all sessions for the authenticated user, ordered by creation date (most recent first).

**auth:** required

**example response** `200`:

```json
{
  "success": true,
  "data": [ { "id": "sess_...", "status": "ready", ... } ],
  "meta": { "total": 5 }
}
```

**errors:** `401`, `503` (database)

---

### `GET /api/sessions/:id`

retrieves a single session by ID. verifies ownership.

**auth:** required

**path params:** `id` — session ID

**example response** `200`:

```json
{
  "success": true,
  "data": { "id": "sess_...", "userId": "...", "status": "ready", ... }
}
```

**errors:** `401`, `403` (not owner), `404`, `503`

---

### `PATCH /api/sessions/:id`

updates session metadata. verifies ownership.

**auth:** required

**path params:** `id` — session ID

**request body:**

| field       | type                                                                | required | description      |
| ----------- | ------------------------------------------------------------------- | -------- | ---------------- |
| `status`    | `"recording" \| "uploading" \| "processing" \| "ready" \| "failed"` | no       | session status   |
| `duration`  | `number`                                                            | no       | session duration |
| `audioUrl`  | `string`                                                            | no       | audio file URL   |
| `audioPath` | `string`                                                            | no       | storage path     |

**example response** `200`:

```json
{
  "success": true,
  "data": { "message": "session updated successfully" }
}
```

**errors:** `400` (validation), `401`, `403`, `404`, `503`

---

### `DELETE /api/sessions/:id`

deletes a session and its associated data. verifies ownership.

**auth:** required

**path params:** `id` — session ID

**example response** `200`:

```json
{
  "success": true,
  "data": { "message": "session deleted successfully" }
}
```

**errors:** `401`, `403`, `404`, `503`

---

### `PATCH /api/sessions/:id/favorite`

toggles the favorite status of a session. verifies ownership.

**auth:** required

**path params:** `id` — session ID

**example response** `200`:

```json
{
  "success": true,
  "data": { "isFavorite": true },
  "message": "added to favorites"
}
```

**errors:** `401`, `403`, `404`, `503`

---

## 🔬 analysis

### `POST /api/sessions/:id/analyze`

triggers the full analysis pipeline for a session. fetches the session's transcript, parses it into segments, computes conversation metrics (talk time, turn count, interruptions), then runs Google Gemini 2.5 Flash for cultural communication analysis. stores results in firestore.

if the session already has analysis results (status `"ready"`), returns the existing results without re-running.

**auth:** required

**path params:** `id` — session ID

**example response** `200`:

```json
{
  "success": true,
  "data": {
    "session": { ... },
    "segments": [
      { "startMs": 0, "endMs": 3000, "speaker": "A", "text": "...", "confidence": 0.9 }
    ],
    "metrics": {
      "talkTimeMs": { "A": 15000, "B": 12000 },
      "turnCount": { "A": 5, "B": 4 },
      "avgTurnLengthMs": { "A": 3000, "B": 3000 },
      "interruptionCount": { "A": 1, "B": 0 },
      "overlapEvents": [],
      "silenceEvents": [],
      "escalation": []
    },
    "insights": [
      {
        "id": "cultural-0",
        "category": "culturalLens",
        "title": "cultural observation 1",
        "summary": "...",
        "confidence": "high",
        "evidence": [],
        "whyThisWasFlagged": "identified by Gemini AI cultural communication analysis"
      }
    ],
    "debrief": {
      "text": "...",
      "audioUrl": "",
      "durationMs": 0,
      "sections": []
    }
  },
  "message": "analysis completed successfully"
}
```

**errors:** `401`, `403`, `404`, `503` (database or gemini)

---

### `GET /api/sessions/:id/analyze`

retrieves existing analysis results for a session. returns `400` if analysis is not yet complete.

**auth:** required

**path params:** `id` — session ID

**errors:** `400` (not complete), `401`, `403`, `404`, `503`

---

## 🎵 audio

### `POST /api/sessions/:id/upload`

uploads an audio file for a session. accepts `multipart/form-data`. session must be in `"recording"` status. uploads the file to Firebase Storage and updates the session.

**auth:** required

**path params:** `id` — session ID

**request body:** `multipart/form-data`

| field   | type   | required | description           |
| ------- | ------ | -------- | --------------------- |
| `audio` | `File` | yes      | audio file (max 50MB) |

**allowed MIME types:** `audio/mpeg`, `audio/mp3`, `audio/wav`, `audio/webm`, `audio/ogg`, `audio/m4a`, `audio/mp4`

**example response** `200`:

```json
{
  "success": true,
  "data": {
    "sessionId": "sess_...",
    "audioUrl": "https://firebasestorage.googleapis.com/..."
  },
  "message": "audio uploaded successfully"
}
```

**errors:** `400` (no file, invalid type, too large, wrong status), `401`, `403`, `404`, `503`

---

### `GET /api/audio/:id`

serves an audio file stored in firestore as base64. returns raw audio bytes with appropriate `Content-Type` header. verifies ownership.

**auth:** required

**path params:** `id` — audio document ID

**response:** raw audio binary with headers:

- `Content-Type`: audio MIME type
- `Content-Length`: file size in bytes
- `Cache-Control`: `public, max-age=86400`
- `Accept-Ranges`: `bytes`

**errors:** `400` (missing ID), `401`, `403`, `404`, `500`

---

## 🎙️ elevenlabs

### `POST /api/elevenlabs/tts`

converts text to speech using the ElevenLabs API. stores the generated audio in firestore (base64) and returns a URL to serve it.

**auth:** required
**rate limit:** 10 requests per 60 seconds per user

**request body:**

| field     | type                    | required | description                                                       |
| --------- | ----------------------- | -------- | ----------------------------------------------------------------- |
| `text`    | `string (1-5000 chars)` | yes      | text to synthesize                                                |
| `voiceId` | `string`                | no       | elevenlabs voice ID (defaults to `21m00Tcm4TlvDq8ikWAM` / rachel) |

**example request:**

```bash
curl -X POST /api/elevenlabs/tts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "text": "hello, this is a test debrief.", "voiceId": "21m00Tcm4TlvDq8ikWAM" }'
```

**example response** `200`:

```json
{
  "success": true,
  "data": {
    "audioUrl": "/api/audio/abc123",
    "durationMs": 4800,
    "wordCount": 6
  },
  "message": "audio generated successfully"
}
```

**errors:** `400` (validation), `401`, `503` (rate limit, elevenlabs API, database)

---

### `GET /api/elevenlabs/signed-url`

generates a signed URL for connecting to a private ElevenLabs conversational AI agent via WebSocket. requires `ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` environment variables.

**auth:** required

**example response** `200`:

```json
{
  "success": true,
  "data": {
    "signed_url": "wss://api.elevenlabs.io/..."
  }
}
```

**errors:** `401` (missing permissions), `503` (configuration, elevenlabs API)

---

## 👤 user

### `PATCH /api/user/profile`

updates user profile fields in firestore.

**auth:** required

**request body:**

| field          | type             | required | description       |
| -------------- | ---------------- | -------- | ----------------- |
| `displayName`  | `string (min 1)` | no       | display name      |
| `organization` | `string`         | no       | organization name |
| `photoURL`     | `string (URL)`   | no       | profile photo URL |

**example response** `200`:

```json
{
  "success": true,
  "data": { "message": "profile updated" }
}
```

**errors:** `400` (validation), `401`, `503`

---

### `POST /api/user/sync-profile`

syncs user profile from Firebase Auth to Firestore. creates the profile document if it does not exist, otherwise updates it.

**auth:** required

**request body:**

| field             | type       | required | description               |
| ----------------- | ---------- | -------- | ------------------------- |
| `email`           | `string`   | no       | email address             |
| `displayName`     | `string`   | no       | display name              |
| `phoneNumber`     | `string`   | no       | phone number              |
| `photoURL`        | `string`   | no       | photo URL                 |
| `emailVerified`   | `boolean`  | no       | email verification status |
| `linkedProviders` | `string[]` | no       | linked auth providers     |

**example response** `200`:

```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "uid": "firebase-uid",
    "email": "user@example.com",
    "displayName": "sunny"
  },
  "message": "profile synced"
}
```

**errors:** `401`, `503`

---

### `GET /api/user/sync-profile`

retrieves the user's profile document from firestore. returns `null` data if profile does not exist.

**auth:** required

**example response** `200`:

```json
{
  "success": true,
  "data": { "uid": "...", "email": "...", "displayName": "...", ... }
}
```

**errors:** `401`, `503`

---

### `POST /api/user/export`

exports all user data as a downloadable JSON file (GDPR-compliant). includes profile and all sessions.

**auth:** required

**response:** `application/json` file download with `Content-Disposition` header.

```json
{
  "profile": { ... },
  "sessions": [ ... ],
  "exportedAt": "2026-01-28T12:00:00.000Z",
  "version": "1.0.0"
}
```

**errors:** `401`, `500`

---

### `DELETE /api/user/delete`

permanently deletes the user account and all associated data: sessions, profile document, and Firebase Auth account.

**auth:** required

**example response** `200`:

```json
{
  "success": true,
  "data": { "message": "account deleted" }
}
```

**errors:** `401`, `503`

---

## 🔑 auth

### `GET /api/auth/user`

retrieves the authenticated user's full profile from Firebase Auth, including custom claims.

**auth:** required

**example response** `200`:

```json
{
  "success": true,
  "data": {
    "uid": "firebase-uid",
    "email": "user@example.com",
    "displayName": "sunny",
    "photoURL": null,
    "emailVerified": true,
    "phoneNumber": null,
    "claims": { "role": "user", "plan": "free" },
    "createdAt": "2026-01-25T00:00:00.000Z",
    "lastSignInTime": "2026-01-28T12:00:00.000Z"
  }
}
```

**errors:** `401`

---

### `POST /api/auth/admin/roles`

sets custom claims (role and plan) on a user. **admin only** — the calling user must have the `admin` role.

**auth:** required (admin)

**request body:**

| field  | type                               | required | description                |
| ------ | ---------------------------------- | -------- | -------------------------- |
| `uid`  | `string`                           | yes      | target user's Firebase UID |
| `role` | `"admin" \| "user" \| "moderator"` | yes      | role to assign             |
| `plan` | `"free" \| "pro" \| "enterprise"`  | no       | plan to assign             |

**example request:**

```bash
curl -X POST /api/auth/admin/roles \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{ "uid": "target-user-uid", "role": "moderator" }'
```

**example response** `200`:

```json
{
  "success": true,
  "data": {
    "uid": "target-user-uid",
    "claims": { "role": "moderator" }
  },
  "message": "user role updated successfully"
}
```

**errors:** `401`, `403` (not admin)

---

## ⚙️ settings

### `GET /api/settings`

retrieves the authenticated user's settings from their firestore profile document.

**auth:** required

**example response** `200`:

```json
{
  "success": true,
  "data": {
    "notifications": true,
    "autoSave": true,
    "culturalAnalysis": true,
    "theme": "system",
    "sensitivityLevel": 3
  }
}
```

**errors:** `401`, `503`

---

### `PUT /api/settings`

updates user settings. creates the user document if it does not exist.

**auth:** required

**request body:**

| field              | type                            | required | description                        |
| ------------------ | ------------------------------- | -------- | ---------------------------------- |
| `notifications`    | `boolean`                       | no       | enable notifications               |
| `autoSave`         | `boolean`                       | no       | auto-save sessions                 |
| `culturalAnalysis` | `boolean`                       | no       | enable cultural analysis           |
| `dataRetention`    | `string`                        | no       | retention period (e.g. `"30days"`) |
| `sensitivityLevel` | `number (1-5)`                  | no       | analysis sensitivity               |
| `theme`            | `"light" \| "dark" \| "system"` | no       | UI theme                           |
| `focusAreas`       | `string[]`                      | no       | analysis focus areas               |

**example response** `200`:

```json
{
  "success": true,
  "data": { "message": "settings saved" }
}
```

**errors:** `400` (validation), `401`, `503`

---

## 📝 transcripts

### `POST /api/transcripts`

saves a conversation transcript linked to a session.

**auth:** required

**request body:**

| field        | type                | required | description                            |
| ------------ | ------------------- | -------- | -------------------------------------- |
| `sessionId`  | `string`            | yes      | session to attach transcript to        |
| `transcript` | `string`            | yes      | full transcript text                   |
| `timestamp`  | `string (ISO 8601)` | no       | transcript timestamp (defaults to now) |
| `segments`   | `array`             | no       | parsed transcript segments             |

**example response** `201`:

```json
{
  "success": true,
  "data": {
    "transcriptId": "firestore-doc-id",
    "sessionId": "sess_..."
  },
  "message": "transcript saved successfully"
}
```

**errors:** `400` (validation), `401`, `503` (database)

---

## 💚 health

### `GET /api/health`

returns the health status of the API and its dependent services. **no authentication required.**

**auth:** not required

**example response** `200`:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T12:00:00.000Z",
  "version": "1.1.1",
  "uptime": 3600,
  "services": {
    "api": { "status": "healthy", "latencyMs": 0 },
    "firebase": { "status": "healthy", "latencyMs": 2 },
    "gemini": { "status": "healthy", "latencyMs": 1 },
    "elevenlabs": { "status": "healthy", "latencyMs": 1 }
  },
  "environment": "production"
}
```

**status codes:** `200` (all healthy), `503` (one or more services degraded/down)

**service statuses:** `"healthy"`, `"degraded"`, `"down"`

**cache:** `no-cache, no-store, must-revalidate`

---

## 📊 endpoint summary

| method   | path                         | auth  | description              |
| -------- | ---------------------------- | ----- | ------------------------ |
| `POST`   | `/api/sessions`              | yes   | create session           |
| `GET`    | `/api/sessions`              | yes   | list user sessions       |
| `GET`    | `/api/sessions/:id`          | yes   | get session              |
| `PATCH`  | `/api/sessions/:id`          | yes   | update session           |
| `DELETE` | `/api/sessions/:id`          | yes   | delete session           |
| `PATCH`  | `/api/sessions/:id/favorite` | yes   | toggle favorite          |
| `POST`   | `/api/sessions/:id/analyze`  | yes   | run analysis             |
| `GET`    | `/api/sessions/:id/analyze`  | yes   | get analysis results     |
| `POST`   | `/api/sessions/:id/upload`   | yes   | upload audio             |
| `GET`    | `/api/audio/:id`             | yes   | serve audio file         |
| `POST`   | `/api/elevenlabs/tts`        | yes   | text-to-speech           |
| `GET`    | `/api/elevenlabs/signed-url` | yes   | get signed WebSocket URL |
| `PATCH`  | `/api/user/profile`          | yes   | update profile           |
| `POST`   | `/api/user/sync-profile`     | yes   | sync profile from auth   |
| `GET`    | `/api/user/sync-profile`     | yes   | get profile              |
| `POST`   | `/api/user/export`           | yes   | export user data         |
| `DELETE` | `/api/user/delete`           | yes   | delete account           |
| `GET`    | `/api/auth/user`             | yes   | get current user         |
| `POST`   | `/api/auth/admin/roles`      | admin | set user roles           |
| `GET`    | `/api/settings`              | yes   | get settings             |
| `PUT`    | `/api/settings`              | yes   | update settings          |
| `POST`   | `/api/transcripts`           | yes   | save transcript          |
| `GET`    | `/api/health`                | no    | health check             |
