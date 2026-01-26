# CultureLens iOS App

Native iOS app for CultureLens built with SwiftUI, Firebase, and ElevenLabs.

## Requirements

- Xcode 15.0+
- iOS 16.0+
- macOS Sonoma (for development)
- Apple ID (free tier works for development/testing)

## Setup Instructions

### 1. Open in Xcode

```bash
cd ios/CultureLens
open -a Xcode .
```

Then in Xcode:
1. File → New → Project
2. Choose "App" under iOS
3. Product Name: `CultureLens`
4. Bundle Identifier: `com.culturelens.app`
5. Interface: SwiftUI
6. Save in the `ios/CultureLens` directory (merge with existing files)

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your existing CultureLens project
3. Click **Add app** → iOS
4. Bundle ID: `com.culturelens.app`
5. Download `GoogleService-Info.plist`
6. Copy to `ios/CultureLens/CultureLens/Resources/GoogleService-Info.plist`

### 3. Add Swift Packages (in Xcode)

1. File → Add Package Dependencies
2. Add these packages:
   - `https://github.com/firebase/firebase-ios-sdk.git` (10.0.0+)
     - Select: FirebaseAuth, FirebaseFirestore, FirebaseStorage
   - `https://github.com/google/GoogleSignIn-iOS.git` (7.0.0+)
     - Select: GoogleSignIn, GoogleSignInSwift

### 4. Configure Google Sign-In

1. In `GoogleService-Info.plist`, find `REVERSED_CLIENT_ID`
2. Go to Project Settings → Targets → Info → URL Types
3. Add new URL Type with the `REVERSED_CLIENT_ID` value

### 5. Run the App

1. Select a simulator or your device
2. Press `Cmd + R` to build and run
3. For physical device testing (free):
   - Xcode → Settings → Accounts → Add Apple ID
   - Select your team in Target → Signing & Capabilities

## Architecture

```
CultureLens/
├── Core/               # App configuration, constants
├── Models/             # Data models (Session, Insight, User, etc.)
├── Services/           # API, Auth, VoiceAgent services
├── ViewModels/         # MVVM view models
├── Views/
│   ├── Auth/          # Login, signup, onboarding
│   ├── Dashboard/     # Home, library, settings
│   ├── Recording/     # Voice agent, orb visualization
│   └── Insights/      # Analysis results display
└── Extensions/         # Swift helpers
```

## Features

- **Firebase Authentication**: Email/password + Google Sign-In
- **Voice Agent**: Real-time conversation with ElevenLabs AI
- **Animated Orb**: Visual feedback during voice interaction
- **Session Management**: Create, view, favorite, delete sessions
- **AI Analysis**: Gemini-powered cultural insights
- **Offline Support**: Session caching (coming soon)
- **Dark Mode**: System-aware theming

## API Integration

The iOS app connects to the same backend as the web app:
- Base URL: `https://culturelens.vercel.app/api`
- Authentication: Firebase JWT tokens
- All data syncs with web in real-time

## Development Notes

### Testing Without Apple Developer Program

You can develop and test completely free:
- ✅ Run on simulator (unlimited)
- ✅ Run on your own device (up to 3 devices)
- ✅ Use all features including Firebase
- ❌ TestFlight distribution
- ❌ App Store publishing

### Portfolio Showcase

Since you can't publish to App Store, showcase via:
1. Screen recordings (simulator or device)
2. GitHub repository with clear documentation
3. Demo videos on LinkedIn/portfolio
4. Side-by-side demo with web app

## Troubleshooting

### Build Errors

1. Clean build folder: `Cmd + Shift + K`
2. Reset package caches: File → Packages → Reset Package Caches
3. Verify `GoogleService-Info.plist` is in the correct location

### Firebase Issues

- Ensure Bundle ID matches Firebase config
- Check `REVERSED_CLIENT_ID` is in URL Types
- Verify API key restrictions in Google Cloud Console

### Voice Agent Not Connecting

- Check microphone permissions in Settings
- Verify `NSMicrophoneUsageDescription` in Info.plist
- Ensure backend is running and accessible
