# CultureLens iOS App

Native iOS app for CultureLens built with SwiftUI, Firebase, and ElevenLabs.

## Requirements

- Xcode 15.0+
- iOS 16.0+
- macOS Sonoma (for development)
- Apple ID (free tier works for development/testing)
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (recommended)

## Quick Start (Recommended)

### 1. Install XcodeGen

```bash
brew install xcodegen
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your existing CultureLens project
3. Click **Add app** → iOS
4. Bundle ID: `com.culturelens.app`
5. Download `GoogleService-Info.plist`
6. Copy to `ios/CultureLens/CultureLens/Resources/GoogleService-Info.plist`

### 3. Generate Xcode Project

```bash
cd ios/CultureLens
xcodegen generate
```

This uses `project.yml` to create a properly configured `.xcodeproj` with all dependencies.

### 4. Open and Run

```bash
open CultureLens.xcodeproj
```

Then press `Cmd + R` to build and run on simulator.

---

## Manual Setup (Alternative)

If you prefer not to use XcodeGen:

### 1. Create Project in Xcode

1. Open Xcode → File → New → Project
2. Choose "App" under iOS
3. Product Name: `CultureLens`
4. Bundle Identifier: `com.culturelens.app`
5. Interface: SwiftUI
6. Language: Swift
7. Save in `ios/CultureLens` directory

### 2. Add Existing Files

1. Right-click project → Add Files to "CultureLens"
2. Navigate to `ios/CultureLens/CultureLens`
3. Select all folders (Core, Models, Services, ViewModels, Views, Extensions)
4. Enable "Copy items if needed" and "Create groups"

### 3. Add Swift Packages

File → Add Package Dependencies:

```
https://github.com/firebase/firebase-ios-sdk.git (10.0.0+)
  → FirebaseAuth, FirebaseFirestore, FirebaseStorage

https://github.com/google/GoogleSignIn-iOS.git (7.0.0+)
  → GoogleSignIn, GoogleSignInSwift
```

### 4. Configure Google Sign-In URL Scheme

1. Find `REVERSED_CLIENT_ID` in `GoogleService-Info.plist`
2. Project Settings → Targets → Info → URL Types
3. Add URL Type with the reversed client ID value

---

## Architecture

```
ios/CultureLens/
├── project.yml                    # XcodeGen project spec
├── Package.swift                  # SPM manifest (alternative)
└── CultureLens/
    ├── CultureLensApp.swift       # App entry point
    ├── Info.plist                 # App configuration
    ├── Core/                      # Configuration, AppState
    ├── Models/                    # Session, AnalysisResult, User, etc.
    ├── Services/                  # APIClient, AuthService, VoiceAgent
    ├── ViewModels/                # AuthViewModel, SessionsViewModel
    ├── Views/
    │   ├── Auth/                  # Login, signup, forgot password
    │   ├── Dashboard/             # Home, Library, Settings
    │   ├── Recording/             # VoiceAgent, Orb visualization
    │   └── Insights/              # Analysis display
    ├── Extensions/                # Color+Theme, View+Extensions
    └── Resources/
        ├── Assets.xcassets/       # App icons, colors
        └── GoogleService-Info.plist
```

## Features

- **Firebase Authentication**: Email/password + Google Sign-In
- **Voice Agent**: Real-time conversation with ElevenLabs AI (WebSocket)
- **Animated Orb**: Dynamic visual feedback during voice interaction
- **Session Management**: Create, view, favorite, delete sessions
- **AI Analysis**: Gemini-powered cultural insights
- **Dark Mode**: System-aware theming

## API Integration

The iOS app connects to the same backend as the web app:
- Base URL: `https://culturelens.vercel.app/api`
- Authentication: Firebase JWT tokens
- All data syncs with web in real-time via shared Firestore

## Development Notes

### Free Development (No Apple Developer Program)

You can develop and test completely free:
- ✅ Run on simulator (unlimited)
- ✅ Run on your own device (up to 3 devices)
- ✅ Use all features including Firebase
- ❌ TestFlight distribution
- ❌ App Store publishing

For physical device:
1. Xcode → Settings → Accounts → Add Apple ID
2. Select your team in Target → Signing & Capabilities
3. Trust developer certificate on device: Settings → General → VPN & Device Management

### Portfolio Showcase

Since you can't publish to App Store, showcase via:
1. **Screen recordings** - Simulator or device demos
2. **GitHub repository** - Clean code with documentation
3. **Demo videos** - Side-by-side with web app
4. **Architecture diagrams** - Show MVVM, services layer

## Troubleshooting

### XcodeGen Issues

```bash
# Regenerate project
xcodegen generate --use-cache

# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Build Errors

1. Clean build folder: `Cmd + Shift + K`
2. Reset package caches: File → Packages → Reset Package Caches
3. Verify `GoogleService-Info.plist` location

### Firebase Connection Issues

- Ensure Bundle ID matches Firebase config exactly
- Check `REVERSED_CLIENT_ID` is in URL Types
- Verify Firebase project has iOS app registered

### Voice Agent Not Connecting

- Check microphone permissions in iOS Settings
- Verify backend is accessible: `curl https://culturelens.vercel.app/api/elevenlabs/signed-url`
- Check console for WebSocket errors
