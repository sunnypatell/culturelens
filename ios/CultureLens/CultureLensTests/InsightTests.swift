//
//  InsightTests.swift
//  CultureLensTests
//
//  Unit tests for Insight models
//

import XCTest
import SwiftUI
@testable import CultureLens

final class InsightTests: XCTestCase {

    // MARK: - Insight Category Tests

    func testInsightCategoryDisplayNames() {
        XCTAssertEqual(InsightCategory.turnTaking.displayName, "Turn Taking")
        XCTAssertEqual(InsightCategory.emotion.displayName, "Emotional Patterns")
        XCTAssertEqual(InsightCategory.directness.displayName, "Communication Style")
        XCTAssertEqual(InsightCategory.repair.displayName, "Repair Attempts")
        XCTAssertEqual(InsightCategory.assumptions.displayName, "Assumptions")
        XCTAssertEqual(InsightCategory.culturalLens.displayName, "Cultural Lens")
    }

    func testInsightCategoryIcons() {
        XCTAssertEqual(InsightCategory.turnTaking.icon, "arrow.triangle.2.circlepath")
        XCTAssertEqual(InsightCategory.emotion.icon, "heart.text.square")
        XCTAssertEqual(InsightCategory.directness.icon, "arrow.right.circle")
        XCTAssertEqual(InsightCategory.repair.icon, "bandage")
        XCTAssertEqual(InsightCategory.assumptions.icon, "lightbulb")
        XCTAssertEqual(InsightCategory.culturalLens.icon, "globe")
    }

    func testInsightCategoryColors() {
        XCTAssertEqual(InsightCategory.turnTaking.color, Color.blue)
        XCTAssertEqual(InsightCategory.emotion.color, Color.pink)
        XCTAssertEqual(InsightCategory.directness.color, Color.orange)
        XCTAssertEqual(InsightCategory.repair.color, Color.green)
        XCTAssertEqual(InsightCategory.assumptions.color, Color.yellow)
        XCTAssertEqual(InsightCategory.culturalLens.color, Color.purple)
    }

    // MARK: - Confidence Level Tests

    func testConfidenceLevelDisplayNames() {
        XCTAssertEqual(ConfidenceLevel.low.displayName, "Low Confidence")
        XCTAssertEqual(ConfidenceLevel.medium.displayName, "Medium Confidence")
        XCTAssertEqual(ConfidenceLevel.high.displayName, "High Confidence")
    }

    func testConfidenceLevelBarCounts() {
        XCTAssertEqual(ConfidenceLevel.low.barCount, 1)
        XCTAssertEqual(ConfidenceLevel.medium.barCount, 2)
        XCTAssertEqual(ConfidenceLevel.high.barCount, 3)
    }

    func testConfidenceLevelColors() {
        XCTAssertEqual(ConfidenceLevel.low.color, Color.orange)
        XCTAssertEqual(ConfidenceLevel.medium.color, Color.blue)
        XCTAssertEqual(ConfidenceLevel.high.color, Color.green)
    }

    // MARK: - Evidence Tests

    func testEvidenceFormattedTimeRange() {
        let evidence = Evidence(startMs: 60000, endMs: 90000, quote: "Test quote")

        XCTAssertEqual(evidence.formattedTimeRange, "1:00 - 1:30")
    }

    func testEvidenceIdentifiable() {
        let evidence1 = Evidence(startMs: 1000, endMs: 2000, quote: "Quote 1")
        let evidence2 = Evidence(startMs: 1000, endMs: 2000, quote: "Quote 2")

        // Same time range should have same ID
        XCTAssertEqual(evidence1.id, evidence2.id)
    }

    // MARK: - Debrief Tests

    func testDebriefFormattedDuration() {
        let debrief = Debrief(
            text: "Summary text",
            audioUrl: "https://example.com/audio.mp3",
            durationMs: 185000, // 3:05
            sections: []
        )

        XCTAssertEqual(debrief.formattedDuration, "3:05")
    }

    // MARK: - Cultural Context Tag Tests

    func testCulturalContextTagDisplayNames() {
        XCTAssertEqual(CulturalContextTag.intergenerational.displayName, "Intergenerational")
        XCTAssertEqual(CulturalContextTag.crossCultural.displayName, "Cross-Cultural")
        XCTAssertEqual(CulturalContextTag.workplace.displayName, "Workplace")
        XCTAssertEqual(CulturalContextTag.family.displayName, "Family")
    }

    func testCulturalContextTagIcons() {
        XCTAssertEqual(CulturalContextTag.intergenerational.icon, "figure.2.and.child.holdinghands")
        XCTAssertEqual(CulturalContextTag.crossCultural.icon, "globe.americas")
        XCTAssertEqual(CulturalContextTag.workplace.icon, "building.2")
        XCTAssertEqual(CulturalContextTag.family.icon, "house")
    }

    // MARK: - Insight Creation Tests

    func testInsightCreation() {
        let insight = createMockInsight()

        XCTAssertEqual(insight.id, "insight-1")
        XCTAssertEqual(insight.category, .turnTaking)
        XCTAssertEqual(insight.title, "Frequent Interruptions")
        XCTAssertEqual(insight.confidence, .high)
    }

    // MARK: - Codable Tests

    func testInsightEncodingDecoding() throws {
        let insight = createMockInsight()

        let encoder = JSONEncoder()
        let data = try encoder.encode(insight)

        let decoder = JSONDecoder()
        let decodedInsight = try decoder.decode(Insight.self, from: data)

        XCTAssertEqual(insight.id, decodedInsight.id)
        XCTAssertEqual(insight.category, decodedInsight.category)
        XCTAssertEqual(insight.confidence, decodedInsight.confidence)
    }

    // MARK: - Helper Methods

    private func createMockInsight() -> Insight {
        Insight(
            id: "insight-1",
            category: .turnTaking,
            title: "Frequent Interruptions",
            summary: "Person A interrupted Person B multiple times during the conversation.",
            hypothesis: nil,
            confidence: .high,
            evidence: [
                Evidence(startMs: 30000, endMs: 35000, quote: "Wait, let me finish—")
            ],
            whyThisWasFlagged: "Multiple overlapping speech segments detected.",
            safetyNote: nil
        )
    }
}
