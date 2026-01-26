//
//  AnalysisResult.swift
//  CultureLens
//
//  Analysis result models matching lib/types.ts
//

import Foundation

// MARK: - Analysis Result
struct AnalysisResult: Codable, Equatable {
    // Note: sessionId instead of full Session to avoid circular reference
    // When embedded in Session.analysisResult, access session from parent
    let sessionId: String?
    let segments: [Segment]
    let metrics: Metrics
    let insights: [Insight]
    let debrief: Debrief

    // Custom coding keys to handle API response with full session object
    enum CodingKeys: String, CodingKey {
        case session
        case sessionId
        case segments
        case metrics
        case insights
        case debrief
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        segments = try container.decode([Segment].self, forKey: .segments)
        metrics = try container.decode(Metrics.self, forKey: .metrics)
        insights = try container.decode([Insight].self, forKey: .insights)
        debrief = try container.decode(Debrief.self, forKey: .debrief)

        // Handle both sessionId string and full session object from API
        if let id = try? container.decode(String.self, forKey: .sessionId) {
            sessionId = id
        } else if let sessionContainer = try? container.nestedContainer(keyedBy: SessionIdKey.self, forKey: .session) {
            sessionId = try? sessionContainer.decode(String.self, forKey: .id)
        } else {
            sessionId = nil
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encodeIfPresent(sessionId, forKey: .sessionId)
        try container.encode(segments, forKey: .segments)
        try container.encode(metrics, forKey: .metrics)
        try container.encode(insights, forKey: .insights)
        try container.encode(debrief, forKey: .debrief)
    }

    private enum SessionIdKey: String, CodingKey {
        case id
    }

    // Memberwise initializer for creating in code
    init(sessionId: String?, segments: [Segment], metrics: Metrics, insights: [Insight], debrief: Debrief) {
        self.sessionId = sessionId
        self.segments = segments
        self.metrics = metrics
        self.insights = insights
        self.debrief = debrief
    }
}

// MARK: - Segment
struct Segment: Codable, Identifiable, Equatable {
    var id: String { "\(startMs)-\(endMs)-\(speaker.rawValue)" }

    let startMs: Int
    let endMs: Int
    let speaker: Speaker
    let text: String
    var confidence: Double?

    var duration: Int {
        endMs - startMs
    }

    var formattedTime: String {
        let totalSeconds = startMs / 1000
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Speaker
enum Speaker: String, Codable, CaseIterable {
    case A
    case B
    case unknown

    var displayName: String {
        switch self {
        case .A:
            return "Person A"
        case .B:
            return "Person B"
        case .unknown:
            return "Unknown"
        }
    }

    var color: String {
        switch self {
        case .A:
            return "primary"
        case .B:
            return "accent"
        case .unknown:
            return "gray"
        }
    }
}

// MARK: - Metrics
struct Metrics: Codable, Equatable {
    let talkTimeMs: SpeakerValues
    let turnCount: SpeakerValues
    let avgTurnLengthMs: SpeakerValues
    let interruptionCount: SpeakerValues
    let overlapEvents: [OverlapEvent]
    let silenceEvents: [SilenceEvent]
    let escalation: [EscalationEvent]

    // Computed properties for UI
    var totalDurationMs: Int {
        talkTimeMs.A + talkTimeMs.B
    }

    var speakerAPercentage: Double {
        guard totalDurationMs > 0 else { return 50 }
        return Double(talkTimeMs.A) / Double(totalDurationMs) * 100
    }

    var speakerBPercentage: Double {
        guard totalDurationMs > 0 else { return 50 }
        return Double(talkTimeMs.B) / Double(totalDurationMs) * 100
    }

    var totalTurns: Int {
        turnCount.A + turnCount.B
    }

    var totalInterruptions: Int {
        interruptionCount.A + interruptionCount.B
    }
}

// MARK: - Speaker Values
struct SpeakerValues: Codable, Equatable {
    let A: Int
    let B: Int
}

// MARK: - Overlap Event
struct OverlapEvent: Codable, Identifiable, Equatable {
    var id: String { "\(atMs)-\(by.rawValue)" }

    let atMs: Int
    let by: Speaker
    let snippet: String

    var formattedTime: String {
        let totalSeconds = atMs / 1000
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Silence Event
struct SilenceEvent: Codable, Identifiable, Equatable {
    var id: String { "\(startMs)-\(endMs)" }

    let startMs: Int
    let endMs: Int
    let afterSpeaker: Speaker

    var duration: Int {
        endMs - startMs
    }

    var formattedDuration: String {
        let seconds = duration / 1000
        return "\(seconds)s"
    }
}

// MARK: - Escalation Event
struct EscalationEvent: Codable, Identifiable, Equatable {
    var id: String { "\(atMs)-\(score)" }

    let atMs: Int
    let score: Double

    var formattedTime: String {
        let totalSeconds = atMs / 1000
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return String(format: "%d:%02d", minutes, seconds)
    }

    var intensity: EscalationIntensity {
        switch score {
        case 0..<0.3:
            return .low
        case 0.3..<0.6:
            return .medium
        default:
            return .high
        }
    }
}

enum EscalationIntensity: String {
    case low
    case medium
    case high

    var color: String {
        switch self {
        case .low:
            return "green"
        case .medium:
            return "yellow"
        case .high:
            return "red"
        }
    }
}
