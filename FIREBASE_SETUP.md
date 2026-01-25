# Firebase Setup Guide

this document explains how firebase is configured for the culturelens project.

## project information

- **project ID:** culturelens-2dd38
- **project console:** https://console.firebase.google.com/project/culturelens-2dd38/overview
- **firebase CLI version:** 15.3.1

## services enabled

### 1. firestore database

- **purpose:** stores sessions, transcripts, and audio files
- **collections:**
  - `sessions` - conversation sessions with dual consent
  - `transcripts` - conversation transcripts
  - `audioFiles` - base64-encoded audio files (free tier workaround for storage)
- **rules:** defined in `firestore.rules`
- **indexes:** defined in `firestore.indexes.json`

### 2. audio storage (firestore workaround)

- **purpose:** stores audio files (TTS generated, session recordings)
- **implementation:** firestore-based storage using base64 encoding (free tier workaround)
- **collection:** `audioFiles`
- **why not firebase storage?** firebase storage requires paid plan (blaze)
- **storage method:**
  - audio files converted to base64 and stored in firestore documents
  - max size: ~900KB per file (firestore 1MB doc limit with base64 overhead)
  - auto-expiration: 7 days by default
  - served via `/api/audio/[id]` endpoint
- **rules:** defined in `firestore.rules` (audioFiles collection)

### 3. firebase authentication

- **status:** not yet enabled
- **future:** will be used for user authentication and authorization

## security rules

### firestore rules (`firestore.rules`)

currently allows full server-side access for API routes. once authentication is implemented, rules will be updated to:

- require authentication for all operations (except audioFiles public read)
- verify dual consent for session creation
- restrict updates/deletes to resource owners
- audioFiles: public read for playback, authenticated write for creation

## environment variables

all firebase configuration is stored in environment variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD2aLhMKPQs4dlKCMLkMUTXg1GqPYnEbak
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=culturelens-2dd38.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=culturelens-2dd38
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=culturelens-2dd38.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=407570374043
NEXT_PUBLIC_FIREBASE_APP_ID=1:407570374043:web:bb41d2c78e0097f2c3553e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-JKXLH1QJTC
```

see `.env.example` for setup instructions.

## firebase admin SDK

the admin SDK provides server-side access to firebase with full administrative privileges.

### what is it?

- **service account credentials** for backend/server operations
- **bypasses security rules** - has full access to all firebase services
- **file:** `firebase-adminsdk-key.json` (NOT committed to git)

### client SDK vs admin SDK

| feature     | client SDK                | admin SDK            |
| ----------- | ------------------------- | -------------------- |
| runs in     | browser/frontend          | node.js backend/API  |
| permissions | limited by security rules | full admin access    |
| use case    | user-facing operations    | backend operations   |
| file        | environment variables     | service account JSON |

### get admin SDK credentials

1. go to [service accounts](https://console.firebase.google.com/project/culturelens-2dd38/settings/serviceaccounts/adminsdk)
2. click **"generate new private key"**
3. save as `firebase-adminsdk-key.json`
4. file is already in `.gitignore`

### usage

```bash
# authenticate with admin SDK
export GOOGLE_APPLICATION_CREDENTIALS="${PWD}/firebase-adminsdk-key.json"

# now all firebase CLI commands use admin auth
firebase deploy
```

## automated deployment (github actions)

rules and indexes are **automatically deployed** when pushed to `main` branch.

### setup github secret

see [.github/FIREBASE_DEPLOY_SETUP.md](.github/FIREBASE_DEPLOY_SETUP.md) for complete setup instructions.

**quick setup:**

1. copy contents of `firebase-adminsdk-key.json`
2. go to github repo → settings → secrets → actions
3. create secret named `FIREBASE_SERVICE_ACCOUNT`
4. paste the JSON content

### what gets auto-deployed

when you push changes to these files:

- `firestore.rules` → deployed automatically
- `firestore.indexes.json` → deployed automatically
- `storage.rules` → deployed automatically
- `firebase.json` → triggers deployment

**workflow file:** `.github/workflows/firebase-deploy.yml`

## firebase CLI commands

### deploy rules

```bash
# deploy firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# deploy everything
firebase deploy
```

### view project info

```bash
firebase projects:list
firebase use culturelens-2dd38
```

### test rules locally (emulators)

```bash
firebase init emulators
firebase emulators:start
```

### access firestore

```bash
firebase firestore:delete --all-collections  # delete all data (use with caution!)
```

## testing the connection

after setting up environment variables, test the firebase connection:

```typescript
// test in browser console or create a test script
import { db, storage } from "@/lib/firebase";
console.log("firebase initialized:", { db, storage });
```

or test via API route:

```bash
curl http://localhost:3000/api/sessions
```

## next steps

1. ✅ firebase project linked
2. ✅ environment variables configured
3. ✅ firestore rules deployed
4. ✅ firestore indexes deployed
5. ✅ firestore-based audio storage implemented (free tier workaround)
6. ⏳ implement firebase authentication
7. ⏳ update security rules for auth
8. ⏳ set up firebase emulators for local development
9. ⏳ implement audio cleanup job for expired files

## troubleshooting

### "permission denied" errors

check that security rules are properly deployed:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### connection timeouts

verify environment variables are set correctly in `.env` file

### missing indexes

firestore will automatically create simple single-field indexes. composite indexes are defined in `firestore.indexes.json`.

### "audio file too large" error

audio files are stored in firestore with a ~900KB limit (firestore 1MB document limit with base64 overhead). if you encounter this error, the audio file exceeds the limit and must be shortened or compressed.
