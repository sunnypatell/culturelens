# firebase setup (shared project)

culturelens uses a **shared firebase project** for all team members and contributors.

## important notes

⚠️ **do NOT create your own firebase project**

- this project uses a single shared firebase instance
- all team members connect to the same project: `culturelens-2dd38`
- creating your own project will break integration with the team

## for contributors

### required environment variables

all firebase credentials are provided in the `.env.example` file. contact the project maintainer for the actual values.

copy `.env.example` to `.env` and fill in the provided values:

```bash
cp .env.example .env
```

### what you need

1. **client SDK config** (public, safe to share)
   - these are the `NEXT_PUBLIC_FIREBASE_*` variables
   - used for client-side firebase operations
   - limited by security rules

2. **admin SDK credentials** (private, contact maintainer)
   - `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`
   - used for server-side operations with elevated privileges
   - required for authentication, user management, and admin APIs

### services enabled

- ✅ firebase authentication (email, phone, google oauth)
- ✅ firestore database (sessions, users, data)
- ✅ firebase storage (audio files, uploads)
- ✅ firebase analytics

## for project maintainers

### firebase console access

- **project console:** https://console.firebase.google.com/project/culturelens-2dd38
- **project ID:** culturelens-2dd38

### admin SDK management

the admin SDK credentials are stored in `.env` as environment variables:

- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

**never commit these to git** - they're already in `.gitignore`

### adding new team members

when adding a new team member:

1. share the complete `.env` file with all credentials (via secure channel)
2. they should **not** generate their own admin SDK key
3. everyone uses the same shared credentials

### firebase CLI commands

```bash
# view project info
firebase projects:list
firebase use culturelens-2dd38

# deploy security rules (requires authentication)
firebase deploy --only firestore:rules,firestore:indexes

# test rules locally with emulators
firebase emulators:start
```

### security rules deployment

security rules are **automatically deployed** via github actions when changes are pushed to `main` branch.

see [.github/FIREBASE_DEPLOY_SETUP.md](.github/FIREBASE_DEPLOY_SETUP.md) for details.

## troubleshooting

### "permission denied" errors

check that:

1. your `.env` file has the correct firebase credentials
2. security rules are properly deployed
3. you're authenticated if the operation requires it

### "firebase not initialized" error

ensure `AuthProvider` wraps your app in `app/layout.tsx`

### "invalid token" errors

verify authorization header format: `Bearer <token>`

## documentation

- firebase auth implementation: [AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md)
- firebase deploy setup: [.github/FIREBASE_DEPLOY_SETUP.md](.github/FIREBASE_DEPLOY_SETUP.md)
- firebase documentation: https://firebase.google.com/docs
