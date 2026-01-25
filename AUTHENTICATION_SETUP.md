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

### 5. account linking

- link multiple auth methods to single account
- onboarding flow collects phone number for email signups
- signin with any linked method accesses same account

## project structure

```
lib/
├── firebase.ts              # firebase client SDK initialization
├── firebase-admin.ts        # firebase admin SDK initialization (server-side)
├── auth-client.ts           # client-side auth methods
└── auth-server.ts           # server-side auth methods (admin SDK)

components/auth/
├── auth-provider.tsx        # react context provider
├── login.tsx                # email/password + email link signin
├── signup.tsx               # email/password signup
├── phone-login.tsx          # phone signin with SMS
├── onboarding.tsx           # account linking flow
├── verify-email.tsx         # email verification
└── reset-password.tsx       # password reset

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
import { useAuth } from "@/components/auth/auth-provider";

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

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
- `/onboarding` - requires authentication

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

authentication is enforced via firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // sessions collection - only authenticated users
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## environment setup

### required environment variables

contact the project maintainer for the actual credential values. do NOT generate your own - use the shared team credentials.

```bash
# firebase client SDK (public, safe for client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=<contact maintainer>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=culturelens-2dd38.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=culturelens-2dd38
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=culturelens-2dd38.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<contact maintainer>
NEXT_PUBLIC_FIREBASE_APP_ID=<contact maintainer>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<contact maintainer>

# firebase admin SDK (server-side - private, contact maintainer)
FIREBASE_CLIENT_EMAIL=<contact maintainer>
FIREBASE_PRIVATE_KEY=<contact maintainer>
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

3. **test flows**:
   - sign up with email → verify email → onboard (optional phone)
   - sign in with phone → sms code
   - sign in with google → redirect flow
   - link phone to existing email account

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
3. **validate tokens server-side** - all API routes verify tokens
4. **rate limit auth endpoints** - consider implementing
5. **monitor failed login attempts** - firebase auth logs this
6. **regular security audits** - review firestore rules
7. **MFA for admins** - implement next

## support

for issues or questions:

- firebase documentation: https://firebase.google.com/docs/auth
- firebase console: https://console.firebase.google.com/project/culturelens-2dd38
- github issues: https://github.com/sunnypatell/culturelens/issues
