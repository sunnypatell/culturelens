//
//  User.swift
//  CultureLens
//
//  User and authentication models
//

import Foundation

// MARK: - User
struct User: Codable, Identifiable, Equatable {
    let id: String
    let email: String?
    var displayName: String?
    var photoURL: String?
    var organization: String?
    var createdAt: String?
    var lastLoginAt: String?
    var settings: UserSettings?

    var initials: String {
        let name = displayName ?? email ?? "U"
        let components = name.split(separator: " ")
        if components.count >= 2 {
            return String(components[0].prefix(1) + components[1].prefix(1)).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }

    var formattedCreatedDate: String? {
        guard let createdAt = createdAt,
              let date = ISO8601DateFormatter().date(from: createdAt) else {
            return nil
        }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
}

// MARK: - User Settings
struct UserSettings: Codable, Equatable {
    var notificationsEnabled: Bool?
    var autoSaveEnabled: Bool?
    var analysisDepth: AnalysisDepth?
    var defaultStorageMode: StorageMode?
    var culturalContextTags: [String]?
    var sensitivityLevel: Int?
    var theme: String?

    static let `default` = UserSettings(
        notificationsEnabled: true,
        autoSaveEnabled: true,
        analysisDepth: .standard,
        defaultStorageMode: .transcriptOnly,
        culturalContextTags: [],
        sensitivityLevel: 50,
        theme: "system"
    )
}

// MARK: - Auth State
enum AuthState: Equatable {
    case loading
    case unauthenticated
    case authenticated
}

// MARK: - Auth Error
enum AuthError: LocalizedError {
    case invalidCredentials
    case emailAlreadyInUse
    case weakPassword
    case networkError
    case tokenExpired
    case unknown(String)

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password"
        case .emailAlreadyInUse:
            return "An account with this email already exists"
        case .weakPassword:
            return "Password must be at least 8 characters"
        case .networkError:
            return "Network error. Please check your connection"
        case .tokenExpired:
            return "Session expired. Please sign in again"
        case .unknown(let message):
            return message
        }
    }
}

// MARK: - Sign In Method
enum SignInMethod: String, CaseIterable {
    case email
    case google
    case apple

    var displayName: String {
        switch self {
        case .email:
            return "Email"
        case .google:
            return "Google"
        case .apple:
            return "Apple"
        }
    }

    var icon: String {
        switch self {
        case .email:
            return "envelope.fill"
        case .google:
            return "g.circle.fill"
        case .apple:
            return "apple.logo"
        }
    }
}
