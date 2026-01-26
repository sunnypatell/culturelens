//
//  Insight.swift
//  CultureLens
//
//  Insight and Debrief models matching lib/types.ts
//

import Foundation
import SwiftUI

// MARK: - Insight
struct Insight: Codable, Identifiable, Equatable {
    let id: String
    let category: InsightCategory
    let title: String
    let summary: String
    var hypothesis: String?
    let confidence: ConfidenceLevel
    let evidence: [Evidence]
    let whyThisWasFlagged: String
    var safetyNote: String?
}

// MARK: - Insight Category
enum InsightCategory: String, Codable, CaseIterable {
    case turnTaking
    case emotion
    case directness
    case repair
    case assumptions
    case culturalLens

    var displayName: String {
        switch self {
        case .turnTaking:
            return "Turn Taking"
        case .emotion:
            return "Emotional Patterns"
        case .directness:
            return "Communication Style"
        case .repair:
            return "Repair Attempts"
        case .assumptions:
            return "Assumptions"
        case .culturalLens:
            return "Cultural Lens"
        }
    }

    var icon: String {
        switch self {
        case .turnTaking:
            return "arrow.triangle.2.circlepath"
        case .emotion:
            return "heart.text.square"
        case .directness:
            return "arrow.right.circle"
        case .repair:
            return "bandage"
        case .assumptions:
            return "lightbulb"
        case .culturalLens:
            return "globe"
        }
    }

    var color: Color {
        switch self {
        case .turnTaking:
            return .blue
        case .emotion:
            return .pink
        case .directness:
            return .orange
        case .repair:
            return .green
        case .assumptions:
            return .yellow
        case .culturalLens:
            return .purple
        }
    }
}

// MARK: - Confidence Level
enum ConfidenceLevel: String, Codable, CaseIterable {
    case low
    case medium
    case high

    var displayName: String {
        switch self {
        case .low:
            return "Low Confidence"
        case .medium:
            return "Medium Confidence"
        case .high:
            return "High Confidence"
        }
    }

    var icon: String {
        switch self {
        case .low:
            return "chart.bar.fill"
        case .medium:
            return "chart.bar.fill"
        case .high:
            return "chart.bar.fill"
        }
    }

    var color: Color {
        switch self {
        case .low:
            return .orange
        case .medium:
            return .blue
        case .high:
            return .green
        }
    }

    var barCount: Int {
        switch self {
        case .low:
            return 1
        case .medium:
            return 2
        case .high:
            return 3
        }
    }
}

// MARK: - Evidence
struct Evidence: Codable, Identifiable, Equatable {
    var id: String { "\(startMs)-\(endMs)" }

    let startMs: Int
    let endMs: Int
    let quote: String

    var formattedTimeRange: String {
        let startSeconds = startMs / 1000
        let endSeconds = endMs / 1000
        let startMin = startSeconds / 60
        let startSec = startSeconds % 60
        let endMin = endSeconds / 60
        let endSec = endSeconds % 60
        return String(format: "%d:%02d - %d:%02d", startMin, startSec, endMin, endSec)
    }
}

// MARK: - Debrief
struct Debrief: Codable, Equatable {
    let text: String
    let audioUrl: String
    let durationMs: Int
    let sections: [DebriefSection]

    var formattedDuration: String {
        let totalSeconds = durationMs / 1000
        let minutes = totalSeconds / 60
        let seconds = totalSeconds % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

// MARK: - Debrief Section
struct DebriefSection: Codable, Identifiable, Equatable {
    var id: String { "\(startChar)-\(endChar)" }

    let title: String
    let startChar: Int
    let endChar: Int
}

// MARK: - Cultural Context Tags
enum CulturalContextTag: String, Codable, CaseIterable {
    case intergenerational = "intergenerational"
    case crossCultural = "cross-cultural"
    case workplace = "workplace"
    case family = "family"
    case romantic = "romantic"
    case professional = "professional"
    case academic = "academic"
    case healthcare = "healthcare"

    var displayName: String {
        switch self {
        case .intergenerational:
            return "Intergenerational"
        case .crossCultural:
            return "Cross-Cultural"
        case .workplace:
            return "Workplace"
        case .family:
            return "Family"
        case .romantic:
            return "Romantic"
        case .professional:
            return "Professional"
        case .academic:
            return "Academic"
        case .healthcare:
            return "Healthcare"
        }
    }

    var icon: String {
        switch self {
        case .intergenerational:
            return "figure.2.and.child.holdinghands"
        case .crossCultural:
            return "globe.americas"
        case .workplace:
            return "building.2"
        case .family:
            return "house"
        case .romantic:
            return "heart"
        case .professional:
            return "briefcase"
        case .academic:
            return "graduationcap"
        case .healthcare:
            return "cross.case"
        }
    }
}
