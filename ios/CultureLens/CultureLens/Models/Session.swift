//
//  Session.swift
//  CultureLens
//
//  Session data model matching lib/types.ts
//

import Foundation

// MARK: - Session
struct Session: Codable, Identifiable, Equatable {
    let id: String
    let userId: String
    let createdAt: String
    let consent: Consent
    let settings: SessionSettings
    var status: SessionStatus
    var audioUrl: String?
    var audioPath: String?
    var analysisResult: AnalysisResult?
    var analyzedAt: String?
    var duration: Int?
    var isFavorite: Bool?

    // Computed properties for UI
    var createdDate: Date? {
        ISO8601DateFormatter().date(from: createdAt)
    }

    var formattedDate: String {
        guard let date = createdDate else { return createdAt }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }

    var formattedDuration: String {
        guard let duration = duration else { return "—" }
        let minutes = duration / 60000
        let seconds = (duration % 60000) / 1000
        return String(format: "%d:%02d", minutes, seconds)
    }

    var displayTitle: String {
        settings.title ?? "Untitled Session"
    }
}

// MARK: - Consent
struct Consent: Codable, Equatable {
    let personA: Bool
    let personB: Bool
    let timestamp: String
}

// MARK: - Session Settings
struct SessionSettings: Codable, Equatable {
    var title: String?
    var sessionType: String?
    var participantCount: Int?
    var storageMode: StorageMode
    var voiceId: String
    var analysisMethod: String?
    var analysisDepth: AnalysisDepth?
    var culturalContextTags: [String]?
    var sensitivityLevel: Int?
}

// MARK: - Storage Mode
enum StorageMode: String, Codable, CaseIterable {
    case ephemeral
    case transcriptOnly

    var displayName: String {
        switch self {
        case .ephemeral:
            return "Ephemeral (Deletes after 24h)"
        case .transcriptOnly:
            return "Transcript Only (No Audio)"
        }
    }
}

// MARK: - Analysis Depth
enum AnalysisDepth: String, Codable, CaseIterable {
    case quick
    case standard
    case deep

    var displayName: String {
        switch self {
        case .quick:
            return "Quick Analysis"
        case .standard:
            return "Standard Analysis"
        case .deep:
            return "Deep Analysis"
        }
    }

    var description: String {
        switch self {
        case .quick:
            return "Fast overview of key patterns"
        case .standard:
            return "Balanced analysis with cultural insights"
        case .deep:
            return "Comprehensive analysis with detailed recommendations"
        }
    }
}

// MARK: - Session Status
enum SessionStatus: String, Codable, CaseIterable {
    case recording
    case uploading
    case processing
    case ready
    case failed

    var displayName: String {
        switch self {
        case .recording:
            return "Recording"
        case .uploading:
            return "Uploading"
        case .processing:
            return "Processing"
        case .ready:
            return "Ready"
        case .failed:
            return "Failed"
        }
    }

    var icon: String {
        switch self {
        case .recording:
            return "mic.circle.fill"
        case .uploading:
            return "arrow.up.circle.fill"
        case .processing:
            return "gearshape.circle.fill"
        case .ready:
            return "checkmark.circle.fill"
        case .failed:
            return "xmark.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .recording:
            return "red"
        case .uploading:
            return "orange"
        case .processing:
            return "blue"
        case .ready:
            return "green"
        case .failed:
            return "red"
        }
    }
}

// MARK: - Session Type Options
enum SessionType: String, Codable, CaseIterable {
    case conversation = "conversation"
    case interview = "interview"
    case meeting = "meeting"
    case coaching = "coaching"
    case mediation = "mediation"
    case other = "other"

    var displayName: String {
        switch self {
        case .conversation:
            return "Casual Conversation"
        case .interview:
            return "Interview"
        case .meeting:
            return "Meeting"
        case .coaching:
            return "Coaching Session"
        case .mediation:
            return "Mediation"
        case .other:
            return "Other"
        }
    }

    var icon: String {
        switch self {
        case .conversation:
            return "bubble.left.and.bubble.right"
        case .interview:
            return "person.2.wave.2"
        case .meeting:
            return "person.3"
        case .coaching:
            return "figure.mind.and.body"
        case .mediation:
            return "scale.3d"
        case .other:
            return "ellipsis.circle"
        }
    }
}
