//
//  Configuration.swift
//  CultureLens
//
//  App configuration and environment management
//

import Foundation

enum Environment {
    case development
    case staging
    case production

    static var current: Environment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }
}

struct Configuration {
    // MARK: - API Configuration
    static var apiBaseURL: URL {
        switch Environment.current {
        case .development:
            return URL(string: "http://localhost:3000/api")!
        case .staging:
            return URL(string: "https://culturelens-staging.vercel.app/api")!
        case .production:
            return URL(string: "https://culturelens.vercel.app/api")!
        }
    }

    // MARK: - ElevenLabs Configuration
    /// Agent ID matching NEXT_PUBLIC_ELEVENLABS_AGENT_ID from web app
    static let elevenLabsAgentId = "agent_5401kfq4a552e61962kx44qcbcrn"

    static var elevenLabsWebSocketURL: URL {
        URL(string: "wss://api.elevenlabs.io/v1/convai/conversation")!
    }

    // MARK: - App Constants
    static let appName = "CultureLens"
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    static let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"

    // MARK: - Feature Flags
    static let enableHaptics = true
    static let enableOfflineMode = true
    static let maxSessionDuration: TimeInterval = 3600 // 1 hour

    // MARK: - Timeouts
    static let apiTimeout: TimeInterval = 30
    static let webSocketTimeout: TimeInterval = 60
    static let audioBufferSize: Int = 1024
}

// MARK: - Keychain Keys
enum KeychainKey: String {
    case authToken = "com.culturelens.authToken"
    case refreshToken = "com.culturelens.refreshToken"
    case userId = "com.culturelens.userId"
}

// MARK: - UserDefaults Keys
enum UserDefaultsKey: String {
    case hasCompletedOnboarding
    case preferredColorScheme
    case notificationsEnabled
    case autoSaveEnabled
    case lastSyncTimestamp
}
