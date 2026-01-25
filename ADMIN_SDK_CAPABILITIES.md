# firebase admin SDK capabilities

this document outlines what we can and cannot do with the firebase admin SDK for the culturelens project.

## what the admin SDK CAN do

### 1. ✅ authentication setup (programmatic)

we can enable and configure firebase authentication without the console:

- enable sign-in methods (email/password, google, etc.)
- create users programmatically
- manage user accounts (create, update, delete)
- generate custom tokens
- verify ID tokens
- set custom claims for role-based access

**implementation**: i can set up the full authentication flow in the app with the admin SDK.

### 2. ✅ firestore management

- create/read/update/delete documents (already using this)
- manage indexes programmatically
- deploy security rules via CLI
- query data with full admin privileges

**status**: already implemented and working

### 3. ✅ cloud functions

- deploy cloud functions for backend logic
- scheduled functions for cleanup (e.g., expired audio files)
- triggered functions (onCreate, onUpdate, etc.)

**use case**: we could create a scheduled function to delete expired audio files from firestore

### 4. ✅ security rules deployment

- deploy firestore rules via CLI
- deploy storage rules via CLI (if we had storage enabled)
- automated deployment via github actions

**status**: github action configured (needs secret fix)

### 5. ✅ service configuration

- configure firebase services programmatically
- manage app configurations
- set up remote config

## what the admin SDK CANNOT do

### 1. ❌ change project ID

**reason**: project IDs are immutable after creation. once set, they can never be changed.

**current**: `culturelens-2dd38`
**workaround**: none - this is permanent

### 2. ❌ change project display name

**reason**: requires firebase console access. not available via CLI or SDK.

**current**: "culturelens" (in console)
**workaround**: manual change in console only

### 3. ❌ change app display name

**reason**: requires firebase console access. not available via CLI or SDK.

**current**: "culturelens" (in console)
**workaround**: manual change in console only

### 4. ❌ set resource location

**reason**: must be set once in console before using certain services.

**current**: not set
**impact**: blocks some features like storage, cloud functions deployment
**workaround**: manual setting in console: https://console.firebase.google.com/project/culturelens-2dd38/settings/general

### 5. ❌ enable firebase storage on free tier

**reason**: firebase storage requires paid plan (blaze)

**workaround**: we're already using firestore-based audio storage (base64 encoding)

## what i can implement for you right now

### 1. firebase authentication (full implementation)

i can create a complete authentication system without you touching the console:

**files to create**:
- `lib/auth-server.ts` - admin SDK auth utilities
- `lib/auth-client.ts` - client-side auth hooks
- `app/api/auth/[...nextauth]/route.ts` - authentication API routes
- `middleware.ts` - route protection
- `components/auth/login.tsx` - login component
- `components/auth/signup.tsx` - signup component

**features**:
- email/password authentication
- google sign-in (requires oauth setup in console once)
- protected routes
- user session management
- role-based access control

**limitations**: enabling the authentication service itself requires one console click (authentication → get started)

### 2. scheduled cleanup function

i can create a cloud function to automatically delete expired audio files:

**files to create**:
- `functions/cleanup-audio.ts` - scheduled function
- runs daily, deletes expired audioFiles

**deployment**: requires setting resource location in console first

### 3. update security rules with auth

i can update firestore rules to require authentication:

**changes**:
- sessions: require auth + dual consent verification
- transcripts: require auth + owner verification
- audioFiles: public read, authenticated write

## recommendations

### immediate actions (i can do these now):

1. ✅ **implement firebase authentication** - full flow without console
2. ✅ **update firestore rules for auth** - integrate with auth system
3. ✅ **create auth UI components** - login, signup, profile management
4. ✅ **add route protection** - middleware for protected pages

### requires one-time console action:

1. ⏳ **enable authentication service** - click "get started" in console
2. ⏳ **set resource location** - required for cloud functions
3. ⏳ **cosmetic name changes** - display names (optional, cosmetic only)

### can ignore:

1. ❌ **project ID change** - impossible, current ID is fine
2. ❌ **firebase storage** - already using firestore workaround

## next steps

if you want me to implement firebase authentication, i can:

1. create all auth infrastructure files
2. integrate auth into existing API routes
3. update firestore rules to require authentication
4. create login/signup UI components
5. add route protection middleware
6. test the complete auth flow

**time estimate**: full implementation can be done in one session

**requirement**: you'll need to click "get started" on authentication in console once, then i can handle everything else programmatically

do you want me to proceed with firebase authentication implementation?
