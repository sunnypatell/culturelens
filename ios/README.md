# CultureLens iOS

[![Swift](https://img.shields.io/badge/Swift-5.9-orange.svg)](https://swift.org)
[![iOS](https://img.shields.io/badge/iOS-16.0+-blue.svg)](https://developer.apple.com/ios/)
[![SwiftUI](https://img.shields.io/badge/SwiftUI-4.0-purple.svg)](https://developer.apple.com/xcode/swiftui/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0+-yellow.svg)](https://firebase.google.com)
[![SwiftLint](https://img.shields.io/badge/SwiftLint-Enabled-green.svg)](https://github.com/realm/SwiftLint)
[![XcodeGen](https://img.shields.io/badge/XcodeGen-Powered-blue.svg)](https://github.com/yonaskolb/XcodeGen)

Native iOS companion app for CultureLens, built with SwiftUI following Apple's Human Interface Guidelines.

## Features

- **Firebase Authentication** — Email/password + Google Sign-In (shared with web app)
- **Voice Agent** — Real-time AI conversation via ElevenLabs WebSocket
- **Animated Orb** — Dynamic visualization responding to conversation state
- **Session Management** — Create, view, favorite, and delete sessions
- **AI Analysis** — Gemini-powered cultural insights
- **Cross-Platform Sync** — Same data on iOS and web via shared Firestore
- **Dark Mode** — System-aware theming with custom accent colors
- **Haptic Feedback** — Native iOS haptics for enhanced UX
- **Skeleton Loading** — Polished loading states with shimmer effects

---

## Quick Start

### Prerequisites

- macOS Sonoma or later
- Xcode 15.0+
- [Homebrew](https://brew.sh)

### 1. Install Dependencies

```bash
# Install XcodeGen (generates Xcode project from YAML)
brew install xcodegen

# Install SwiftLint (optional, for linting)
brew install swiftlint

# Install Fastlane (optional, for automation)
brew install fastlane
```

### 2. Generate Xcode Project

```bash
cd ios/CultureLens
xcodegen generate
```

This creates `CultureLens.xcodeproj` from `project.yml` with all dependencies configured.

### 3. Open and Run

```bash
open CultureLens.xcodeproj
```

Press `Cmd + R` to build and run on the simulator.

> **Note:** Xcode will automatically fetch Firebase and GoogleSignIn packages via Swift Package Manager on first build.

---

## Architecture

```
ios/CultureLens/
├── project.yml                 # XcodeGen project specification
├── Package.swift               # Swift Package Manager manifest
├── Gemfile                     # Ruby dependencies (Fastlane)
├── .swiftlint.yml              # SwiftLint configuration
├── fastlane/
│   ├── Fastfile                # Automation lanes
│   ├── Appfile                 # App configuration
│   └── Pluginfile              # Fastlane plugins
└── CultureLens/
    ├── CultureLensApp.swift    # App entry point + Firebase init
    ├── Info.plist              # App configuration
    │
    ├── Core/
    │   ├── Configuration.swift # Environment & API constants
    │   └── AppState.swift      # Global app state management
    │
    ├── Models/
    │   ├── Session.swift       # Session data model
    │   ├── AnalysisResult.swift# AI analysis results
    │   ├── Insight.swift       # Cultural insights
    │   ├── User.swift          # User profile
    │   └── APITypes.swift      # Request/response types
    │
    ├── Services/
    │   ├── APIClient.swift     # HTTP networking (actor, async/await)
    │   ├── AuthService.swift   # Firebase Auth wrapper
    │   ├── VoiceAgentService.swift  # ElevenLabs WebSocket + AVFoundation
    │   ├── KeychainService.swift    # Secure credential storage
    │   └── NetworkMonitor.swift     # Connectivity monitoring
    │
    ├── ViewModels/
    │   ├── AuthViewModel.swift      # Authentication state
    │   └── SessionsViewModel.swift  # Sessions list + CRUD
    │
    ├── Views/
    │   ├── Auth/               # Login, SignUp, ForgotPassword
    │   ├── Dashboard/          # Home, Library, Settings, TabView
    │   ├── Recording/          # VoiceAgent, Orb visualization
    │   └── Insights/           # Analysis display
    │
    ├── Extensions/
    │   ├── Color+Theme.swift       # App color palette
    │   ├── View+Extensions.swift   # SwiftUI modifiers
    │   └── Shimmer+Loading.swift   # Loading animations
    │
    └── Resources/
        ├── Assets.xcassets/        # App icons, accent colors
        └── GoogleService-Info.plist # Firebase configuration
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI** | SwiftUI | Declarative UI framework |
| **Architecture** | MVVM | Clean separation of concerns |
| **Networking** | URLSession + async/await | Native HTTP client |
| **Auth** | Firebase iOS SDK | Authentication |
| **Database** | Firestore | Real-time data sync |
| **Voice AI** | WebSocket + AVFoundation | ElevenLabs integration |
| **Storage** | Keychain Services | Secure credential storage |
| **Linting** | SwiftLint | Code style enforcement |
| **CI/CD** | Fastlane + GitHub Actions | Build automation |
| **Project Gen** | XcodeGen | Reproducible Xcode projects |

---

## API Integration

The iOS app connects to the same backend as the web app:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sessions` | GET | List user sessions |
| `/api/sessions` | POST | Create new session |
| `/api/sessions/:id` | GET | Get session details |
| `/api/sessions/:id/analyze` | POST | Trigger AI analysis |
| `/api/sessions/:id/favorite` | PATCH | Toggle favorite |
| `/api/elevenlabs/signed-url` | GET | Get WebSocket auth URL |
| `/api/auth/user` | GET | Get current user |
| `/api/settings` | GET/PUT | User settings |

All requests include Firebase JWT in `Authorization: Bearer <token>` header.

---

## Development

### Running SwiftLint

```bash
cd ios/CultureLens
swiftlint lint
```

Or with Fastlane:

```bash
fastlane lint
```

### Building

```bash
# Debug build
fastlane build

# Full CI pipeline (lint + build)
fastlane ci

# Clean build artifacts
fastlane clean
```

### Regenerating Xcode Project

After modifying `project.yml`:

```bash
xcodegen generate
```

### Fastlane Lanes

| Lane | Description |
|------|-------------|
| `fastlane lint` | Run SwiftLint |
| `fastlane build` | Debug build |
| `fastlane ci` | Full CI pipeline |
| `fastlane clean` | Clean derived data |
| `fastlane setup` | Setup dev environment |
| `fastlane bump_build` | Increment build number |
| `fastlane bump_version` | Increment version |

---

## Firebase Configuration

The `GoogleService-Info.plist` is pre-configured and connects to the same Firebase project as the web app. Users can sign in with the same credentials on both platforms.

### Google Sign-In URL Scheme

Configured in `project.yml`:

```yaml
CFBundleURLTypes:
  - CFBundleURLSchemes:
      - com.googleusercontent.apps.407570374043-lmu50155qnjh0k3k94hq1vericp6ubtf
```

---

## Free Development (No Apple Developer Program)

You can develop and test without the $99/year Apple Developer Program:

| Feature | Free Tier | Developer Program |
|---------|-----------|-------------------|
| Simulator testing | ✅ Unlimited | ✅ Unlimited |
| Physical device | ✅ Up to 3 devices | ✅ Unlimited |
| Firebase features | ✅ Full access | ✅ Full access |
| TestFlight | ❌ | ✅ |
| App Store | ❌ | ✅ |

### Testing on Physical Device

1. Xcode → Settings → Accounts → Add Apple ID (free account works)
2. Select your team in Target → Signing & Capabilities
3. On device: Settings → General → VPN & Device Management → Trust

---

## Design Decisions

### Why XcodeGen?

- **Reproducible builds** — Project generated from version-controlled YAML
- **No merge conflicts** — `.xcodeproj` is gitignored
- **Easy updates** — Just edit `project.yml` and regenerate

### Why MVVM?

- **SwiftUI native** — Works with `@Published`, `@StateObject`, `@EnvironmentObject`
- **Testable** — ViewModels can be unit tested without UI
- **Industry standard** — Familiar to iOS developers

### Why Actor-based Services?

```swift
actor APIClient {
    // Thread-safe by design - no manual locking
}
```

- **Concurrency safe** — Swift concurrency handles thread safety
- **Modern Swift** — Leverages Swift 5.5+ structured concurrency

---

## Troubleshooting

### XcodeGen Issues

```bash
# Regenerate project
xcodegen generate

# Clear Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Build Errors

1. Clean build folder: `Cmd + Shift + K`
2. Reset package caches: File → Packages → Reset Package Caches
3. Regenerate project: `xcodegen generate`

### Firebase Issues

- Verify `GoogleService-Info.plist` is in `CultureLens/Resources/`
- Check Bundle ID matches: `com.culturelens.app`
- Ensure URL scheme is configured for Google Sign-In

### Voice Agent Not Connecting

1. Check microphone permissions in iOS Settings
2. Verify backend: `curl https://culturelens.vercel.app/api/elevenlabs/signed-url`
3. Check Xcode console for WebSocket errors

---

## Portfolio Showcase

Since you can't publish to App Store without Developer Program:

1. **Screen recordings** — Record demos on simulator or device
2. **GitHub repository** — Clean code with comprehensive documentation
3. **Demo videos** — Side-by-side comparison with web app
4. **Architecture diagrams** — Show MVVM, services layer, data flow

---

## Contributing

See [CONTRIBUTING.md](../.github/CONTRIBUTING.md) for guidelines.

### iOS-Specific Guidelines

1. **SwiftLint** — All code must pass linting
2. **Previews** — Add `#Preview` to all views
3. **Accessibility** — Include accessibility labels
4. **Documentation** — Use `///` doc comments for public APIs
5. **Conventional Commits** — Use `feat(ios):`, `fix(ios):`, etc.

---

## License

MIT License — see [LICENSE](../LICENSE) for details.
