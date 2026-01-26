//
//  SessionTests.swift
//  CultureLensTests
//
//  Unit tests for Session model
//

import XCTest
@testable import CultureLens

final class SessionTests: XCTestCase {

    // MARK: - Session Creation Tests

    func testSessionCreation() {
        let session = createMockSession()

        XCTAssertEqual(session.id, "test-session-1")
        XCTAssertEqual(session.userId, "user-1")
        XCTAssertEqual(session.status, .ready)
        XCTAssertEqual(session.displayTitle, "Test Session")
    }

    func testSessionWithoutTitle() {
        var session = createMockSession()
        session = Session(
            id: session.id,
            userId: session.userId,
            createdAt: session.createdAt,
            consent: session.consent,
            settings: SessionSettings(
                title: nil,
                storageMode: .transcriptOnly,
                voiceId: "voice-1"
            ),
            status: .ready
        )

        XCTAssertEqual(session.displayTitle, "Untitled Session")
    }

    // MARK: - Session Status Tests

    func testSessionStatusDisplayNames() {
        XCTAssertEqual(SessionStatus.recording.displayName, "Recording")
        XCTAssertEqual(SessionStatus.uploading.displayName, "Uploading")
        XCTAssertEqual(SessionStatus.processing.displayName, "Processing")
        XCTAssertEqual(SessionStatus.ready.displayName, "Ready")
        XCTAssertEqual(SessionStatus.failed.displayName, "Failed")
    }

    func testSessionStatusIcons() {
        XCTAssertEqual(SessionStatus.recording.icon, "mic.circle.fill")
        XCTAssertEqual(SessionStatus.ready.icon, "checkmark.circle.fill")
        XCTAssertEqual(SessionStatus.failed.icon, "xmark.circle.fill")
    }

    // MARK: - Duration Formatting Tests

    func testDurationFormattingMinutesAndSeconds() {
        var session = createMockSession()
        session.duration = 125000 // 2 minutes 5 seconds

        XCTAssertEqual(session.formattedDuration, "2:05")
    }

    func testDurationFormattingNoDuration() {
        let session = createMockSession()
        XCTAssertEqual(session.formattedDuration, "—")
    }

    func testDurationFormattingZero() {
        var session = createMockSession()
        session.duration = 0

        XCTAssertEqual(session.formattedDuration, "0:00")
    }

    // MARK: - Date Formatting Tests

    func testCreatedDateParsing() {
        let session = createMockSession()

        XCTAssertNotNil(session.createdDate)
    }

    // MARK: - Storage Mode Tests

    func testStorageModeDisplayNames() {
        XCTAssertEqual(StorageMode.ephemeral.displayName, "Ephemeral (Deletes after 24h)")
        XCTAssertEqual(StorageMode.transcriptOnly.displayName, "Transcript Only (No Audio)")
    }

    // MARK: - Analysis Depth Tests

    func testAnalysisDepthValues() {
        XCTAssertEqual(AnalysisDepth.quick.displayName, "Quick Analysis")
        XCTAssertEqual(AnalysisDepth.standard.displayName, "Standard Analysis")
        XCTAssertEqual(AnalysisDepth.deep.displayName, "Deep Analysis")
    }

    // MARK: - Hashable Conformance Tests

    func testSessionHashable() {
        let session1 = createMockSession()
        let session2 = createMockSession()

        // Same ID should hash the same
        XCTAssertEqual(session1.hashValue, session2.hashValue)

        var set = Set<Session>()
        set.insert(session1)
        set.insert(session2)

        // Should only have one since same ID
        XCTAssertEqual(set.count, 1)
    }

    // MARK: - Equatable Tests

    func testSessionEquatable() {
        let session1 = createMockSession()
        let session2 = createMockSession()

        XCTAssertEqual(session1, session2)
    }

    // MARK: - Codable Tests

    func testSessionEncodingDecoding() throws {
        let session = createMockSession()

        let encoder = JSONEncoder()
        let data = try encoder.encode(session)

        let decoder = JSONDecoder()
        let decodedSession = try decoder.decode(Session.self, from: data)

        XCTAssertEqual(session.id, decodedSession.id)
        XCTAssertEqual(session.userId, decodedSession.userId)
        XCTAssertEqual(session.status, decodedSession.status)
    }

    // MARK: - Helper Methods

    private func createMockSession() -> Session {
        Session(
            id: "test-session-1",
            userId: "user-1",
            createdAt: ISO8601DateFormatter().string(from: Date()),
            consent: Consent(
                personA: true,
                personB: true,
                timestamp: ISO8601DateFormatter().string(from: Date())
            ),
            settings: SessionSettings(
                title: "Test Session",
                storageMode: .transcriptOnly,
                voiceId: "voice-1"
            ),
            status: .ready
        )
    }
}
