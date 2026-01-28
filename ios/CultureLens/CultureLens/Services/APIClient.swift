//
//  APIClient.swift
//  CultureLens
//
//  HTTP networking layer with async/await
//

import Foundation

// MARK: - API Client
actor APIClient {
    // MARK: - Singleton
    static let shared = APIClient()

    // MARK: - Properties
    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    // Token provider closure - set by AuthService
    private var tokenProvider: (() async -> String?)?

    // Method to set token provider from external actors
    func setTokenProvider(_ provider: @escaping () async -> String?) {
        self.tokenProvider = provider
    }

    // MARK: - Initialization
    private init() {
        self.baseURL = Configuration.apiBaseURL

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = Configuration.apiTimeout
        config.timeoutIntervalForResource = Configuration.apiTimeout * 2
        config.waitsForConnectivity = true
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase

        self.encoder = JSONEncoder()
        self.encoder.keyEncodingStrategy = .convertToSnakeCase
    }

    // MARK: - Generic Request
    func request<T: Decodable>(
        endpoint: String,
        method: HTTPMethod = .get,
        body: (any Encodable)? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        let url = baseURL.appendingPathComponent(endpoint)
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        // Add auth header if required
        if requiresAuth {
            guard let token = await tokenProvider?() else {
                throw APIError.unauthorized
            }
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        // Encode body if present
        if let body = body {
            request.httpBody = try encoder.encode(body)
        }

        // Log request in debug
        #if DEBUG
        print("[API] \(method.rawValue) \(url.absoluteString)")
        #endif

        // Perform request
        let (data, response) = try await session.data(for: request)

        // Handle response
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.unknown
        }

        #if DEBUG
        print("[API] Response: \(httpResponse.statusCode)")
        #endif

        switch httpResponse.statusCode {
        case 200...299:
            // unwrap { success, data } response envelope (lib/api/responses.ts)
            let envelope = try decoder.decode(APIResponse<T>.self, from: data)
            guard let result = envelope.data else {
                throw APIError.noData
            }
            return result
        case 401:
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        case 429:
            throw APIError.rateLimited
        case 400...499:
            // parse backend ApiErrorResponse envelope (lib/api/responses.ts)
            let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data)
            throw APIError.serverError(httpResponse.statusCode, errorResponse?.error?.message)
        case 500...599:
            let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data)
            throw APIError.serverError(httpResponse.statusCode, errorResponse?.error?.message)
        default:
            throw APIError.unknown
        }
    }

    // MARK: - Void Request (for DELETE, etc.)
    func requestVoid(
        endpoint: String,
        method: HTTPMethod = .get,
        body: (any Encodable)? = nil,
        requiresAuth: Bool = true
    ) async throws {
        let url = baseURL.appendingPathComponent(endpoint)
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if requiresAuth {
            guard let token = await tokenProvider?() else {
                throw APIError.unauthorized
            }
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try encoder.encode(body)
        }

        #if DEBUG
        print("[API] \(method.rawValue) \(url.absoluteString)")
        #endif

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.unknown
        }

        #if DEBUG
        print("[API] Response: \(httpResponse.statusCode)")
        #endif

        switch httpResponse.statusCode {
        case 200...299:
            return // success, no data to unwrap
        case 401:
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        case 429:
            throw APIError.rateLimited
        case 400...499:
            let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data)
            throw APIError.serverError(httpResponse.statusCode, errorResponse?.error?.message)
        case 500...599:
            let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data)
            throw APIError.serverError(httpResponse.statusCode, errorResponse?.error?.message)
        default:
            throw APIError.unknown
        }
    }
}

// MARK: - Session Endpoints
extension APIClient {
    func getSessions() async throws -> [Session] {
        try await request(endpoint: "sessions")
    }

    func getSession(id: String) async throws -> Session {
        try await request(endpoint: "sessions/\(id)")
    }

    func createSession(consent: Consent, settings: SessionSettings) async throws -> Session {
        let body = CreateSessionRequest(
            consent: ConsentRequest(
                personA: consent.personA,
                personB: consent.personB,
                timestamp: consent.timestamp
            ),
            settings: SessionSettingsRequest(
                title: settings.title,
                sessionType: settings.sessionType,
                participantCount: settings.participantCount,
                storageMode: settings.storageMode.rawValue,
                voiceId: settings.voiceId,
                analysisMethod: settings.analysisMethod,
                analysisDepth: settings.analysisDepth?.rawValue,
                culturalContextTags: settings.culturalContextTags,
                sensitivityLevel: settings.sensitivityLevel
            )
        )
        return try await request(endpoint: "sessions", method: .post, body: body)
    }

    func updateSession(id: String, update: UpdateSessionRequest) async throws -> Session {
        try await request(endpoint: "sessions/\(id)", method: .patch, body: update)
    }

    func deleteSession(id: String) async throws {
        try await requestVoid(endpoint: "sessions/\(id)", method: .delete)
    }

    func toggleFavorite(id: String) async throws -> Session {
        try await request(endpoint: "sessions/\(id)/favorite", method: .patch)
    }

    func analyzeSession(id: String) async throws -> AnalysisResult {
        try await request(endpoint: "sessions/\(id)/analyze", method: .post)
    }

    func getAnalysis(id: String) async throws -> AnalysisResult {
        try await request(endpoint: "sessions/\(id)/analyze")
    }
}

// MARK: - Transcript Endpoints
extension APIClient {
    func saveTranscript(
        sessionId: String,
        transcript: String,
        segments: [Segment]
    ) async throws {
        let body = TranscriptRequest(
            sessionId: sessionId,
            transcript: transcript,
            timestamp: ISO8601DateFormatter().string(from: Date()),
            segments: segments.map { segment in
                SegmentRequest(
                    startMs: segment.startMs,
                    endMs: segment.endMs,
                    speaker: segment.speaker.rawValue,
                    text: segment.text,
                    confidence: segment.confidence
                )
            }
        )
        try await requestVoid(endpoint: "transcripts", method: .post, body: body)
    }
}

// MARK: - User Endpoints
extension APIClient {
    func getCurrentUser() async throws -> User {
        try await request(endpoint: "auth/user")
    }

    func updateProfile(update: ProfileUpdateRequest) async throws {
        try await requestVoid(endpoint: "user/profile", method: .patch, body: update)
    }

    func updateSettings(settings: SettingsUpdateRequest) async throws {
        try await requestVoid(endpoint: "settings", method: .put, body: settings)
    }

    func getSettings() async throws -> UserSettings {
        try await request(endpoint: "settings")
    }

    func exportData() async throws -> Data {
        let url = baseURL.appendingPathComponent("user/export")
        var request = URLRequest(url: url)
        request.httpMethod = HTTPMethod.post.rawValue

        if let token = await tokenProvider?() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (data, _) = try await session.data(for: request)
        return data
    }

    func deleteAccount() async throws {
        try await requestVoid(endpoint: "user/delete", method: .delete)
    }
}

// MARK: - ElevenLabs Endpoints
extension APIClient {
    func getSignedURL() async throws -> SignedURLResponse {
        try await request(endpoint: "elevenlabs/signed-url")
    }
}
