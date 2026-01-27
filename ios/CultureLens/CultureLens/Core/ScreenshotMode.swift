//
//  ScreenshotMode.swift
//  CultureLens
//
//  Screenshot mode support for automated UI testing and screenshot generation.
//  When the app is launched with SCREENSHOT_MODE argument, it bypasses
//  Firebase auth and populates mock data for all screens.
//

import Foundation

enum ScreenshotMode {
    static var isActive: Bool {
        ProcessInfo.processInfo.arguments.contains("SCREENSHOT_MODE")
    }
}

// MARK: - Mock Data for Screenshots
enum MockData {
    static let userId = "screenshot-user-001"

    static let sessions: [Session] = [
        Session(
            id: "sess-001",
            userId: userId,
            createdAt: ISO8601DateFormatter().string(from: Date()),
            consent: Consent(personA: true, personB: true, timestamp: ISO8601DateFormatter().string(from: Date())),
            settings: SessionSettings(
                title: "Cross-Cultural Negotiation",
                sessionType: "meeting",
                participantCount: 2,
                storageMode: .transcriptOnly,
                voiceId: "alloy",
                analysisMethod: nil,
                analysisDepth: .deep,
                culturalContextTags: ["east-asian", "western"],
                sensitivityLevel: nil
            ),
            status: .ready,
            duration: 847000,
            isFavorite: true
        ),
        Session(
            id: "sess-002",
            userId: userId,
            createdAt: ISO8601DateFormatter().string(from: Calendar.current.date(byAdding: .hour, value: -3, to: Date()) ?? Date()),
            consent: Consent(personA: true, personB: true, timestamp: ISO8601DateFormatter().string(from: Date())),
            settings: SessionSettings(
                title: "Research Team Standup",
                sessionType: "meeting",
                participantCount: 3,
                storageMode: .transcriptOnly,
                voiceId: "alloy",
                analysisMethod: nil,
                analysisDepth: .standard,
                culturalContextTags: ["south-asian", "western"],
                sensitivityLevel: nil
            ),
            status: .ready,
            duration: 423000,
            isFavorite: false
        ),
        Session(
            id: "sess-003",
            userId: userId,
            createdAt: ISO8601DateFormatter().string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date()) ?? Date()),
            consent: Consent(personA: true, personB: true, timestamp: ISO8601DateFormatter().string(from: Date())),
            settings: SessionSettings(
                title: "Weekend Catch-Up Call",
                sessionType: "conversation",
                participantCount: 2,
                storageMode: .ephemeral,
                voiceId: "alloy",
                analysisMethod: nil,
                analysisDepth: .quick,
                culturalContextTags: ["middle-eastern", "western"],
                sensitivityLevel: nil
            ),
            status: .ready,
            duration: 612000,
            isFavorite: false
        ),
        Session(
            id: "sess-004",
            userId: userId,
            createdAt: ISO8601DateFormatter().string(from: Calendar.current.date(byAdding: .day, value: -2, to: Date()) ?? Date()),
            consent: Consent(personA: true, personB: true, timestamp: ISO8601DateFormatter().string(from: Date())),
            settings: SessionSettings(
                title: "Quarterly Planning Review",
                sessionType: "meeting",
                participantCount: 4,
                storageMode: .transcriptOnly,
                voiceId: "alloy",
                analysisMethod: nil,
                analysisDepth: .deep,
                culturalContextTags: ["east-asian", "south-asian", "western"],
                sensitivityLevel: nil
            ),
            status: .ready,
            duration: 1530000,
            isFavorite: true
        )
    ]

    static let stats = SessionsViewModel.SessionStats(
        totalSessions: 12,
        thisMonth: 4,
        totalInsights: 47,
        totalDurationMs: 3_412_000
    )
}
