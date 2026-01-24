# Firebase Setup Guide

This guide will help you set up Firebase for the CultureLens application.

## Prerequisites

1. A Google account
2. Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "culturelens")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - Email/Password
   - Google (optional, but recommended)

### Firestore Database
1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (you can change this later for production)
4. Select a location for your database
5. Click "Done"

### Storage
1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" (you can change this later for production)
4. Click "Done"

## Step 3: Get Firebase Configuration

1. In your Firebase project, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the "</>" icon to add a web app
4. Enter an app nickname (e.g., "CultureLens Web")
5. **Important**: Do NOT check "Also set up Firebase Hosting"
6. Click "Register app"
7. Copy the configuration object from the "Add Firebase SDK" section

## Step 4: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder Firebase values with your actual configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
```

## Step 5: Test the Connection

1. Start your development server: `npm run dev`
2. Check the browser console for any Firebase connection errors
3. The app should now be able to connect to Firebase services

## Firebase Services Available

### Authentication (`auth`)
- User sign up/sign in with email/password
- Google authentication
- User profile management

### Firestore Database (`db`)
- Store user sessions
- Save analysis results
- Store user preferences
- Real-time data synchronization

### Storage (`storage`)
- Upload audio recordings
- Store generated transcripts
- Save analysis files

## Usage Examples

### Authentication
```typescript
import { signIn, signUp, logout, useAuth } from '@/lib/firebase-utils';

// In a component
const { user, loading } = useAuth();

const handleSignIn = async () => {
  try {
    await signIn(email, password);
  } catch (error) {
    console.error('Sign in failed:', error);
  }
};
```

### Firestore
```typescript
import { createDocument, useCollection } from '@/lib/firebase-utils';

// Create a session
const sessionId = await createDocument('sessions', {
  title: 'Team Meeting',
  participants: 3,
  userId: user.uid,
});

// Get real-time sessions
const { data: sessions, loading } = useCollection('sessions',
  [whereEqual('userId', user.uid)]
);
```

### Storage
```typescript
import { uploadFile } from '@/lib/firebase-utils';

// Upload an audio file
const { downloadURL, path } = await uploadFile(audioFile, `audio/${sessionId}/recording.wav`);
```

## Security Rules

For production, make sure to set up proper security rules for Firestore and Storage:

### Firestore Rules Example
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### Storage Rules Example
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Next Steps

1. Implement user authentication in your app
2. Set up data models for sessions and analysis results
3. Configure proper security rules for production
4. Consider implementing offline support with Firebase's offline capabilities

For more information, check the [Firebase Documentation](https://firebase.google.com/docs).