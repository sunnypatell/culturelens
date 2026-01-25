# firebase authentication implementation

complete authentication system for culturelens with multiple signin methods and role-based access control.

## authentication methods implemented

### 1. email/password authentication

- traditional email and password signin
- password strength requirements (minimum 6 characters)
- email verification after signup
- password reset via email link

### 2. passwordless email link signin

- magic link sent to email
- no password required
- secure token-based authentication

### 3. phone authentication

- SMS verification code
- reCAPTCHA v2 integration for security
- supports international phone numbers

### 4. google sign-in

- OAuth2 integration with Google
- one-click signin
- automatic profile import

## project structure

```
lib/
├── auth-server.ts           # server-side admin SDK utilities
├── auth-client.ts           # client-side authentication functions
├── firebase-admin.ts        # firebase admin SDK initialization

components/auth/
├── auth-provider.tsx        # React context provider with hooks
├── login.tsx                # multi-method login component
├── signup.tsx               # user registration component
├── phone-login.tsx          # phone authentication with recaptcha
├── reset-password.tsx       # password reset flow
└── verify-email.tsx         # email verification handler

app/auth/
├── login/page.tsx           # /auth/login route
├── signup/page.tsx          # /auth/signup route
├── phone/page.tsx           # /auth/phone route
├── reset-password/page.tsx  # /auth/reset-password route
└── verify-email/page.tsx    # /auth/verify-email route

app/api/auth/
├── user/route.ts            # GET current user info
└── admin/roles/route.ts     # POST set user roles (admin only)

middleware.ts                # route protection middleware
```

## features

### user management

- create users with email/password
- update user profiles (display name, photo URL)
- delete users
- list all users (paginated)
- get user by UID, email, or phone number

### token management

- verify Firebase ID tokens
- generate custom tokens
- get ID token with claims
- automatic token refresh

### role-based access control (RBAC)

- three roles: admin, user, moderator
- three plans: free, pro, enterprise
- custom claims stored in JWT
- role checking functions: `hasRole()`, `hasPlan()`
- admin-only API routes for role management

### email services

- email verification links
- password reset links
- passwordless signin links
- automated email sending via Firebase

## usage

### client-side authentication

```typescript
import { useAuth } from '@/components/auth/auth-provider';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();

  // sign in with email/password
  await signIn('user@example.com', 'password');

  // sign in with Google
  await signInWithGoogle();

  // send magic link
  await sendEmailLink('user@example.com');

  // sign out
  await signOut();

  return <div>{user?.displayName}</div>;
}
```

### server-side authentication

```typescript
import { verifyIdToken, getUserByUid, hasRole } from "@/lib/auth-server";

// verify token from request
const authHeader = request.headers.get("authorization");
const token = authHeader.split("Bearer ")[1];
const decodedToken = await verifyIdToken(token);

// get full user data
const user = await getUserByUid(decodedToken.uid);

// check permissions
const isAdmin = await hasRole(decodedToken.uid, "admin");
```

### protected routes

routes protected by middleware:

- `/dashboard` - requires authentication
- `/results` - requires authentication
- `/settings` - requires authentication
- `/profile` - requires authentication

unauthenticated users are redirected to `/auth/login` with return URL.

### API authentication

API routes can verify tokens:

```typescript
import { apiHandler, AuthenticationError } from "@/lib/api";
import { verifyIdToken } from "@/lib/auth-server";

export async function GET(request: Request) {
  return apiHandler(async () => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AuthenticationError("missing authorization header");
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await verifyIdToken(token);

    // ... handle authenticated request
  });
}
```

## firestore security rules

rules enforce authentication:

```
// sessions: authenticated users only
- read: authenticated
- create: authenticated + dual consent required
- update/delete: owner or admin

// transcripts: authenticated users only
- read: authenticated
- create: authenticated
- update/delete: owner or admin

// audioFiles: public read, authenticated write
- read: public (for audio playback)
- write: authenticated
```

## firebase console setup

### required one-time actions

1. **enable authentication**:
   - go to https://console.firebase.google.com/project/culturelens-2dd38/authentication
   - click "get started"
   - enable sign-in methods:
     - ✅ email/password
     - ✅ email link (passwordless)
     - ✅ phone
     - ✅ google

2. **configure google oauth** (for google sign-in):
   - in authentication → sign-in method → google
   - add authorized domains
   - configure oauth consent screen

3. **set up recaptcha** (for phone auth):
   - authentication already handles this automatically
   - test with development reCAPTCHA in localhost

4. **service account permissions** (for github actions):
   - go to https://console.firebase.google.com/project/culturelens-2dd38/settings/iam
   - find service account: `firebase-adminsdk-fbsvc@culturelens-2dd38.iam.gserviceaccount.com`
   - add roles:
     - Firebase Admin
     - Service Usage Consumer

## environment variables

required in `.env`:

```bash
# firebase client SDK (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# firebase admin SDK (for server-side operations)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@culturelens-2dd38.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## testing authentication

1. **start development server**:

   ```bash
   npm run dev:all
   ```

2. **visit auth pages**:
   - http://localhost:3000/auth/login
   - http://localhost:3000/auth/signup
   - http://localhost:3000/auth/phone

3. **create test account**:
   - navigate to /auth/signup
   - fill in details
   - check email for verification link

4. **test protected routes**:
   - visit /dashboard without signin → redirects to login
   - sign in → can access dashboard

## next steps

- [x] basic authentication infrastructure
- [x] email/password signin
- [x] google signin
- [x] phone authentication
- [x] passwordless signin
- [x] role-based access control
- [x] protected routes
- [x] firestore security rules
- [ ] integrate auth into dashboard UI
- [ ] add profile management page
- [ ] implement email templates customization
- [ ] add multi-factor authentication (MFA)
- [ ] implement session management UI
- [ ] add user activity logging

## troubleshooting

### "firebase not initialized" error

check that `AuthProvider` wraps your app in `app/layout.tsx`

### "recaptcha not working" in production

add your production domain to authorized domains in firebase console

### "permission denied" on firestore

check that firestore rules are deployed:

```bash
firebase deploy --only firestore:rules
```

### "invalid token" errors

ensure authorization header format: `Bearer <token>`

### phone auth not working

- verify phone number includes country code (+1...)
- check recaptcha container exists in DOM
- ensure firebase phone auth is enabled in console

## security best practices

1. **never expose private keys** - already in `.gitignore`
2. **use HTTPS in production** - vercel handles this
3. **validate all inputs** - using Zod schemas
4. **rate limit auth endpoints** - consider implementing
5. **monitor failed login attempts** - firebase auth logs this
6. **regular security audits** - review firestore rules
7. **MFA for admins** - implement next

## support

for issues or questions:

- firebase documentation: https://firebase.google.com/docs/auth
- firebase console: https://console.firebase.google.com/project/culturelens-2dd38
- github issues: https://github.com/sunnypatell/culturelens/issues
