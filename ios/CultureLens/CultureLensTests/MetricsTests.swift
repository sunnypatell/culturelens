//
//  MetricsTests.swift
//  CultureLensTests
//
//  Unit tests for Metrics and analysis models
//

import XCTest
@testable import CultureLens

final class MetricsTests: XCTestCase {

    // MARK: - Speaker Values Tests

    func testSpeakerValuesCreation() {
        let values = SpeakerValues(A: 100, B: 200)

        XCTAssertEqual(values.A, 100)
        XCTAssertEqual(values.B, 200)
    }

    // MARK: - Metrics Computed Properties Tests

    func testMetricsTotalDuration() {
        let metrics = createMockMetrics()

        XCTAssertEqual(metrics.totalDurationMs, 180000) // 120000 + 60000
    }

    func testMetricsSpeakerPercentages() {
        let metrics = createMockMetrics()

        // A: 120000 / 180000 = 66.67%
        // B: 60000 / 180000 = 33.33%
        XCTAssertEqual(metrics.speakerAPercentage, 66.66666666666667, accuracy: 0.01)
        XCTAssertEqual(metrics.speakerBPercentage, 33.33333333333333, accuracy: 0.01)
    }

    func testMetricsSpeakerPercentagesWithZeroDuration() {
        let metrics = Metrics(
            talkTimeMs: SpeakerValues(A: 0, B: 0),
            turnCount: SpeakerValues(A: 0, B: 0),
            avgTurnLengthMs: SpeakerValues(A: 0, B: 0),
            interruptionCount: SpeakerValues(A: 0, B: 0),
            overlapEvents: [],
            silenceEvents: [],
            escalation: []
        )

        // Should default to 50/50 when no talk time
        XCTAssertEqual(metrics.speakerAPercentage, 50)
        XCTAssertEqual(metrics.speakerBPercentage, 50)
    }

    func testMetricsTotalTurns() {
        let metrics = createMockMetrics()

        XCTAssertEqual(metrics.totalTurns, 25) // 15 + 10
    }

    func testMetricsTotalInterruptions() {
        let metrics = createMockMetrics()

        XCTAssertEqual(metrics.totalInterruptions, 7) // 5 + 2
    }

    // MARK: - Segment Tests

    func testSegmentDuration() {
        let segment = Segment(
            startMs: 1000,
            endMs: 5000,
            speaker: .A,
            text: "Hello there"
        )

        XCTAssertEqual(segment.duration, 4000)
    }

    func testSegmentFormattedTime() {
        let segment = Segment(
            startMs: 65000, // 1:05
            endMs: 70000,
            speaker: .A,
            text: "Test"
        )

        XCTAssertEqual(segment.formattedTime, "1:05")
    }

    func testSegmentIdentifiable() {
        let segment1 = Segment(startMs: 1000, endMs: 2000, speaker: .A, text: "Text 1")
        let segment2 = Segment(startMs: 1000, endMs: 2000, speaker: .A, text: "Text 2")

        XCTAssertEqual(segment1.id, segment2.id)
    }

    // MARK: - Speaker Tests

    func testSpeakerDisplayNames() {
        XCTAssertEqual(Speaker.A.displayName, "Person A")
        XCTAssertEqual(Speaker.B.displayName, "Person B")
        XCTAssertEqual(Speaker.unknown.displayName, "Unknown")
    }

    func testSpeakerColors() {
        XCTAssertEqual(Speaker.A.color, "primary")
        XCTAssertEqual(Speaker.B.color, "accent")
        XCTAssertEqual(Speaker.unknown.color, "gray")
    }

    // MARK: - Overlap Event Tests

    func testOverlapEventFormattedTime() {
        let event = OverlapEvent(
            atMs: 90000, // 1:30
            by: .A,
            snippet: "But I—"
        )

        XCTAssertEqual(event.formattedTime, "1:30")
    }

    // MARK: - Silence Event Tests

    func testSilenceEventDuration() {
        let event = SilenceEvent(
            startMs: 10000,
            endMs: 15000,
            afterSpeaker: .A
        )

        XCTAssertEqual(event.duration, 5000)
    }

    func testSilenceEventFormattedDuration() {
        let event = SilenceEvent(
            startMs: 10000,
            endMs: 15000,
            afterSpeaker: .A
        )

        XCTAssertEqual(event.formattedDuration, "5s")
    }

    // MARK: - Escalation Event Tests

    func testEscalationEventFormattedTime() {
        let event = EscalationEvent(atMs: 120000, score: 0.8) // 2:00

        XCTAssertEqual(event.formattedTime, "2:00")
    }

    func testEscalationIntensityLow() {
        let event = EscalationEvent(atMs: 1000, score: 0.2)

        XCTAssertEqual(event.intensity, .low)
        XCTAssertEqual(event.intensity.color, "green")
    }

    func testEscalationIntensityMedium() {
        let event = EscalationEvent(atMs: 1000, score: 0.4)

        XCTAssertEqual(event.intensity, .medium)
        XCTAssertEqual(event.intensity.color, "yellow")
    }

    func testEscalationIntensityHigh() {
        let event = EscalationEvent(atMs: 1000, score: 0.7)

        XCTAssertEqual(event.intensity, .high)
        XCTAssertEqual(event.intensity.color, "red")
    }

    // MARK: - Codable Tests

    func testMetricsEncodingDecoding() throws {
        let metrics = createMockMetrics()

        let encoder = JSONEncoder()
        let data = try encoder.encode(metrics)

        let decoder = JSONDecoder()
        let decodedMetrics = try decoder.decode(Metrics.self, from: data)

        XCTAssertEqual(metrics.talkTimeMs.A, decodedMetrics.talkTimeMs.A)
        XCTAssertEqual(metrics.turnCount.B, decodedMetrics.turnCount.B)
    }

    // MARK: - Helper Methods

    private func createMockMetrics() -> Metrics {
        Metrics(
            talkTimeMs: SpeakerValues(A: 120000, B: 60000),
            turnCount: SpeakerValues(A: 15, B: 10),
            avgTurnLengthMs: SpeakerValues(A: 8000, B: 6000),
            interruptionCount: SpeakerValues(A: 5, B: 2),
            overlapEvents: [
                OverlapEvent(atMs: 30000, by: .A, snippet: "Sorry—")
            ],
            silenceEvents: [
                SilenceEvent(startMs: 60000, endMs: 63000, afterSpeaker: .B)
            ],
            escalation: [
                EscalationEvent(atMs: 90000, score: 0.5)
            ]
        )
    }
}
