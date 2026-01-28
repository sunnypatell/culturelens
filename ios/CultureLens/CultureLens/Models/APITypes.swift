//
//  APITypes.swift
//  CultureLens
//
//  API request and response types
//

import Foundation

// MARK: - API Response Wrapper
// matches backend ApiSuccessResponse envelope from lib/api/responses.ts
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let message: String?
}

// MARK: - API Error Response
// matches backend ApiErrorResponse envelope from lib/api/responses.ts
struct APIErrorResponse: Decodable {
    let success: Bool
    let error: APIErrorDetail?
}

struct APIErrorDetail: Decodable {
    let code: String?
    let message: String?
    let details: String?
    let hint: String?
}

// MARK: - Paginated Response
struct PaginatedResponse<T: Decodable>: Decodable {
    let items: [T]
    let total: Int
    let page: Int
    let pageSize: Int
    let hasMore: Bool
}

// MARK: - Create Session Request
struct CreateSessionRequest: Encodable {
    let consent: ConsentRequest
    let settings: SessionSettingsRequest
}

struct ConsentRequest: Encodable {
    let personA: Bool
    let personB: Bool
    let timestamp: String
}

struct SessionSettingsRequest: Encodable {
    let title: String?
    let sessionType: String?
    let participantCount: Int?
    let storageMode: String
    let voiceId: String
    let analysisMethod: String?
    let analysisDepth: String?
    let culturalContextTags: [String]?
    let sensitivityLevel: Int?
}

// MARK: - Update Session Request
struct UpdateSessionRequest: Encodable {
    var status: String?
    var isFavorite: Bool?
    var audioUrl: String?
    var duration: Int?
}

// MARK: - Transcript Request
struct TranscriptRequest: Encodable {
    let sessionId: String
    let transcript: String
    let timestamp: String
    let segments: [SegmentRequest]
}

struct SegmentRequest: Encodable {
    let startMs: Int
    let endMs: Int
    let speaker: String
    let text: String
    let confidence: Double?
}

// MARK: - Signed URL Response
struct SignedURLResponse: Decodable {
    let signedUrl: String
    let agentId: String?
    let expiresAt: String?

    enum CodingKeys: String, CodingKey {
        case signedUrl = "signed_url"
        case agentId = "agent_id"
        case expiresAt = "expires_at"
    }
}

// MARK: - User Profile Update Request
struct ProfileUpdateRequest: Encodable {
    var displayName: String?
    var organization: String?
    var photoURL: String?
}

// MARK: - Settings Update Request
struct SettingsUpdateRequest: Encodable {
    var notificationsEnabled: Bool?
    var autoSaveEnabled: Bool?
    var analysisDepth: String?
    var defaultStorageMode: String?
    var culturalContextTags: [String]?
    var sensitivityLevel: Int?
    var theme: String?
}

// MARK: - API Error
enum APIError: LocalizedError {
    case invalidURL
    case noData
    case decodingError(Error)
    case networkError(Error)
    case serverError(Int, String?)
    case unauthorized
    case forbidden
    case notFound
    case rateLimited
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError(let error):
            return "Failed to decode response: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .serverError(let code, let message):
            return message ?? "Server error (code: \(code))"
        case .unauthorized:
            return "Please sign in to continue"
        case .forbidden:
            return "You don't have permission to access this resource"
        case .notFound:
            return "Resource not found"
        case .rateLimited:
            return "Too many requests. Please try again later"
        case .unknown:
            return "An unknown error occurred"
        }
    }

    var isAuthError: Bool {
        switch self {
        case .unauthorized:
            return true
        default:
            return false
        }
    }
}

// MARK: - HTTP Method
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}
