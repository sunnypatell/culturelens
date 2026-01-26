<div align="center">

<img src="../public/favicon.svg" width="80" height="80" alt="CultureLens Logo" />

# CultureLens iOS

**Native iOS Companion for Conversation Analytics**

[![Swift](https://img.shields.io/badge/Swift-5.9-F05138?style=flat-square&logo=swift&logoColor=white)](https://swift.org)
[![iOS](https://img.shields.io/badge/iOS-16.0+-000000?style=flat-square&logo=apple&logoColor=white)](https://developer.apple.com/ios/)
[![SwiftUI](https://img.shields.io/badge/SwiftUI-4.0-007AFF?style=flat-square&logo=swift&logoColor=white)](https://developer.apple.com/xcode/swiftui/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0+-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![SwiftLint](https://img.shields.io/badge/SwiftLint-Enabled-00C853?style=flat-square)](https://github.com/realm/SwiftLint)
[![XcodeGen](https://img.shields.io/badge/XcodeGen-Powered-5856D6?style=flat-square)](https://github.com/yonaskolb/XcodeGen)

_SwiftUI + Firebase + ElevenLabs Voice AI_

[Main Project](../README.md) | [Quick Start](#-quick-start) | [Architecture](#-architecture)

</div>

---

## Overview

Native iOS companion app for CultureLens, built with SwiftUI following Apple's Human Interface Guidelines. Shares the same Firebase backend as the web app for seamless cross-platform sync.

### Key Features

| Feature | Description |
|---------|-------------|
| **Firebase Auth** | Email/password + Google Sign-In (shared credentials with web) |
| **Voice Agent** | Real-time AI conversation via ElevenLabs WebSocket |
| **Animated Orb** | Dynamic visualization responding to conversation state |
| **Session Sync** | Same data on iOS and web via shared Firestore |
| **AI Analysis** | Gemini-powered cultural communication insights |
| **Dark Mode** | System-aware theming with custom accent colors |
| **iPad Support** | Universal app with split view + slide over |
| **Accessibility** | Full VoiceOver support + Dynamic Type |

---

## Quick Start

### Prerequisites

| Tool | Version | Installation |
|------|---------|--------------|
| macOS | Sonoma+ | Required |
| Xcode | 15.0+ | App Store |
| Homebrew | Latest | [brew.sh](https://brew.sh) |

### 1. Install Dependencies

```bash
# xcodegen generates Xcode project from YAML
brew install xcodegen

# swiftlint for code style (optional)
brew install swiftlint

# fastlane for automation (optional)
brew install fastlane
```

### 2. Generate Xcode Project

```bash
cd ios/CultureLens
xcodegen generate
```

Creates `CultureLens.xcodeproj` from `project.yml` with all dependencies configured.

### 3. Open and Run

```bash
open CultureLens.xcodeproj
```

Press **Cmd + R** to build and run. Xcode fetches Firebase and GoogleSignIn packages automatically.

---

## Architecture

```
CultureLens/
├── Core/
│   ├── Configuration.swift     # Environment + API constants
│   └── AppState.swift          # Global state management
│
├── Models/
│   ├── Session.swift           # Session data (matches web)
│   ├── AnalysisResult.swift    # AI analysis results
│   ├── Insight.swift           # Cultural insights
│   └── User.swift              # User profile
│
├── Services/
│   ├── APIClient.swift         # HTTP client (actor, async/await)
│   ├── AuthService.swift       # Firebase Auth wrapper
│   ├── VoiceAgentService.swift # ElevenLabs WebSocket + AVFoundation
│   ├── KeychainService.swift   # Secure credential storage
│   ├── NetworkMonitor.swift    # Connectivity monitoring
│   └── CrashReportingService.swift # Firebase Crashlytics
│
├── ViewModels/
│   ├── AuthViewModel.swift     # Authentication state
│   └── SessionsViewModel.swift # Sessions CRUD + real-time
│
├── Views/
│   ├── Auth/                   # Login, SignUp, ForgotPassword
│   ├── Dashboard/              # Home, Library, Settings, TabView
│   ├── Recording/              # VoiceAgent, Orb visualization
│   └── Insights/               # Analysis display
│
├── Extensions/
│   ├── Color+Theme.swift       # App color palette
│   ├── View+Extensions.swift   # SwiftUI modifiers
│   ├── Accessibility+.swift    # VoiceOver helpers
│   └── String+Localization.swift # i18n support
│
└── Resources/
    ├── Assets.xcassets/        # App icons, colors
    ├── en.lproj/               # English localization
    └── GoogleService-Info.plist
```

---

## Tech Stack

<table>
<tr>
<td width="50%" valign="top">

**App Layer**

| Technology | Purpose |
|------------|---------|
| SwiftUI | Declarative UI |
| MVVM | Architecture pattern |
| Combine | Reactive bindings |
| async/await | Concurrency |
| Actors | Thread safety |

</td>
<td width="50%" valign="top">

**Infrastructure**

| Technology | Purpose |
|------------|---------|
| Firebase Auth | Authentication |
| Firestore | Real-time database |
| Crashlytics | Crash reporting |
| XcodeGen | Project generation |
| Fastlane | Build automation |

</td>
</tr>
</table>

---

## API Integration

Connects to the same backend as the web app:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sessions` | GET | List user sessions |
| `/api/sessions` | POST | Create new session |
| `/api/sessions/:id` | GET | Session details |
| `/api/sessions/:id/analyze` | POST | Trigger AI analysis |
| `/api/sessions/:id/favorite` | PATCH | Toggle favorite |
| `/api/elevenlabs/signed-url` | GET | WebSocket auth URL |

All requests include Firebase JWT: `Authorization: Bearer <token>`

---

## Development

### Running Locally

```bash
# lint swift code
cd ios/CultureLens && swiftlint lint

# or with fastlane
fastlane lint
```

### Building

```bash
fastlane build      # debug build
fastlane ci         # full pipeline (lint + build)
fastlane clean      # clean derived data
```

### Fastlane Lanes

| Lane | Description |
|------|-------------|
| `lint` | Run SwiftLint |
| `build` | Debug build |
| `ci` | Full CI pipeline |
| `clean` | Clean build artifacts |
| `bump_build` | Increment build number |
| `bump_version` | Increment version |

### Regenerating Project

After modifying `project.yml`:

```bash
xcodegen generate
```

---

## Testing

### Unit Tests

```bash
# run from xcode
Cmd + U

# or command line
xcodebuild test -scheme CultureLens -destination 'platform=iOS Simulator,name=iPhone 16 Pro'
```

### Test Coverage

Tests cover:
- Session model encoding/decoding
- Insight category mappings
- Metrics calculations
- Date formatting

---

## Free Development

No Apple Developer Program ($99/year) required for development:

| Feature | Free | Developer Program |
|---------|------|-------------------|
| Simulator | Unlimited | Unlimited |
| Physical device | 3 devices | Unlimited |
| Firebase | Full access | Full access |
| TestFlight | No | Yes |
| App Store | No | Yes |

### Testing on Device

1. Xcode > Settings > Accounts > Add Apple ID (free)
2. Select team in Target > Signing & Capabilities
3. On device: Settings > General > VPN & Device Management > Trust

---

## Firebase Setup

The `GoogleService-Info.plist` connects to the same Firebase project as the web app.

**Google Sign-In URL Scheme** (configured in `project.yml`):

```yaml
CFBundleURLTypes:
  - CFBundleURLSchemes:
      - com.googleusercontent.apps.407570374043-xxx
```

---

## Troubleshooting

### Build Errors

1. **Clean build**: Cmd + Shift + K
2. **Reset packages**: File > Packages > Reset Package Caches
3. **Regenerate**: `xcodegen generate`

### Firebase Issues

- Verify `GoogleService-Info.plist` exists in `Resources/`
- Bundle ID must be: `com.culturelens.app`
- URL scheme configured for Google Sign-In

### Voice Agent

1. Check microphone permission in iOS Settings
2. Verify backend: `curl https://culturelens.vercel.app/api/elevenlabs/signed-url`
3. Check Xcode console for WebSocket errors

---

## Portfolio Notes

Since App Store requires Developer Program:

- **Screen recordings**: Demo on simulator or device
- **GitHub repo**: Clean code + comprehensive docs
- **Architecture diagrams**: MVVM, services layer, data flow
- **Side-by-side demos**: iOS + web app comparison

---

## Contributing

See [CONTRIBUTING.md](../.github/CONTRIBUTING.md)

**iOS Guidelines:**
- SwiftLint must pass
- Add `#Preview` to all views
- Include accessibility labels
- Use `///` doc comments
- Conventional commits: `feat(ios):`, `fix(ios):`

---

<div align="center">

**[Back to Main Project](../README.md)**

</div>
