//
//  VoiceAgentService.swift
//  CultureLens
//
//  ElevenLabs Conversational AI integration via WebSocket + AVFoundation audio
//

import Foundation
import AVFoundation
import Combine

// MARK: - Voice Agent Service
@MainActor
final class VoiceAgentService: NSObject, ObservableObject {
    // MARK: - Published Properties
    @Published var connectionState: ConnectionState = .disconnected
    @Published var agentState: AgentState = .idle
    @Published var transcript: [TranscriptMessage] = []
    @Published var errorMessage: String?
    @Published var isMuted: Bool = false

    // MARK: - Types
    enum ConnectionState: Equatable {
        case disconnected
        case connecting
        case connected
        case error(String)

        var isConnected: Bool {
            if case .connected = self { return true }
            return false
        }
    }

    enum AgentState: String {
        case idle
        case listening
        case speaking

        var displayName: String {
            switch self {
            case .idle: return "Idle"
            case .listening: return "Listening"
            case .speaking: return "Speaking"
            }
        }
    }

    struct TranscriptMessage: Identifiable, Equatable {
        let id = UUID()
        let source: Speaker
        let message: String
        let timestamp: Date

        enum Speaker: String {
            case user = "A"
            case agent = "B"

            var displayName: String {
                switch self {
                case .user: return "You"
                case .agent: return "Agent"
                }
            }
        }
    }

    // MARK: - Private Properties
    private var webSocketTask: URLSessionWebSocketTask?
    private var audioEngine: AVAudioEngine?
    private var audioPlayer: AVAudioPlayer?
    private let audioSession = AVAudioSession.sharedInstance()

    private var sessionId: String?
    private var conversationId: String?

    // Audio format for streaming
    private let sampleRate: Double = 16000
    private let channels: AVAudioChannelCount = 1

    // MARK: - Initialization
    override init() {
        super.init()
    }

    // MARK: - Connection Management
    func connect(sessionId: String) async throws {
        self.sessionId = sessionId
        connectionState = .connecting

        do {
            // Request microphone permission
            let granted = await requestMicrophonePermission()
            guard granted else {
                throw VoiceAgentError.microphonePermissionDenied
            }

            // Get signed URL from backend
            let signedURLResponse = try await APIClient.shared.getSignedURL()

            // Setup audio session
            try setupAudioSession()

            // Connect WebSocket
            try await connectWebSocket(url: URL(string: signedURLResponse.signedUrl)!)

            connectionState = .connected
            agentState = .listening

            print("[VoiceAgent] Connected successfully")

        } catch {
            connectionState = .error(error.localizedDescription)
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func disconnect() async {
        print("[VoiceAgent] Disconnecting...")

        // Stop audio
        stopAudioCapture()

        // Close WebSocket
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil

        // Save transcript
        if let sessionId = sessionId, !transcript.isEmpty {
            await saveTranscript(sessionId: sessionId)
        }

        connectionState = .disconnected
        agentState = .idle
        conversationId = nil

        print("[VoiceAgent] Disconnected")
    }

    // MARK: - Microphone Permission
    private func requestMicrophonePermission() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioApplication.requestRecordPermission { granted in
                continuation.resume(returning: granted)
            }
        }
    }

    // MARK: - Audio Session Setup
    private func setupAudioSession() throws {
        try audioSession.setCategory(.playAndRecord, mode: .voiceChat, options: [
            .defaultToSpeaker,
            .allowBluetooth,
            .mixWithOthers
        ])
        try audioSession.setActive(true)
    }

    // MARK: - WebSocket Connection
    private func connectWebSocket(url: URL) async throws {
        var request = URLRequest(url: url)
        request.timeoutInterval = Configuration.webSocketTimeout

        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: request)
        webSocketTask?.resume()

        // Start receiving messages
        Task {
            await receiveMessages()
        }

        // Start audio capture
        try startAudioCapture()
    }

    // MARK: - WebSocket Message Handling
    private func receiveMessages() async {
        guard let webSocketTask = webSocketTask else { return }

        do {
            while webSocketTask.state == .running {
                let message = try await webSocketTask.receive()

                switch message {
                case .string(let text):
                    handleTextMessage(text)
                case .data(let data):
                    handleAudioData(data)
                @unknown default:
                    break
                }
            }
        } catch {
            if connectionState.isConnected {
                print("[VoiceAgent] WebSocket error: \(error)")
                await MainActor.run {
                    connectionState = .error(error.localizedDescription)
                }
            }
        }
    }

    private func handleTextMessage(_ text: String) {
        guard let data = text.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let type = json["type"] as? String else {
            return
        }

        print("[VoiceAgent] Received message type: \(type)")

        switch type {
        case "conversation_initiation_metadata":
            if let conversationId = json["conversation_id"] as? String {
                self.conversationId = conversationId
                print("[VoiceAgent] Conversation ID: \(conversationId)")
            }

        case "agent_response":
            if let content = json["content"] as? String {
                let message = TranscriptMessage(
                    source: .agent,
                    message: content,
                    timestamp: Date()
                )
                transcript.append(message)
                print("[VoiceAgent] Agent: \(content)")
            }

        case "user_transcript":
            if let content = json["content"] as? String {
                let message = TranscriptMessage(
                    source: .user,
                    message: content,
                    timestamp: Date()
                )
                transcript.append(message)
                print("[VoiceAgent] User: \(content)")
            }

        case "audio":
            // Audio data handling is done in handleAudioData
            break

        case "interruption":
            agentState = .listening

        case "agent_start_speaking":
            agentState = .speaking

        case "agent_stop_speaking":
            agentState = .listening

        case "error":
            if let message = json["message"] as? String {
                errorMessage = message
                print("[VoiceAgent] Error: \(message)")
            }

        case "ping":
            sendPong()

        default:
            print("[VoiceAgent] Unknown message type: \(type)")
        }
    }

    private func handleAudioData(_ data: Data) {
        // Play agent audio response
        playAudio(data: data)
    }

    // MARK: - Audio Capture
    private func startAudioCapture() throws {
        audioEngine = AVAudioEngine()
        guard let audioEngine = audioEngine else { return }

        let inputNode = audioEngine.inputNode
        let recordingFormat = AVAudioFormat(
            commonFormat: .pcmFormatInt16,
            sampleRate: sampleRate,
            channels: channels,
            interleaved: true
        )!

        inputNode.installTap(onBus: 0, bufferSize: AVAudioFrameCount(Configuration.audioBufferSize), format: recordingFormat) { [weak self] buffer, _ in
            guard let self = self, !self.isMuted else { return }
            self.sendAudioBuffer(buffer)
        }

        audioEngine.prepare()
        try audioEngine.start()

        print("[VoiceAgent] Audio capture started")
    }

    private func stopAudioCapture() {
        audioEngine?.inputNode.removeTap(onBus: 0)
        audioEngine?.stop()
        audioEngine = nil
        print("[VoiceAgent] Audio capture stopped")
    }

    private func sendAudioBuffer(_ buffer: AVAudioPCMBuffer) {
        guard let channelData = buffer.int16ChannelData else { return }

        let frameLength = Int(buffer.frameLength)
        let data = Data(bytes: channelData[0], count: frameLength * 2)

        // Send as base64 encoded audio
        let base64Audio = data.base64EncodedString()
        let message = """
        {"type": "audio", "audio": "\(base64Audio)"}
        """

        webSocketTask?.send(.string(message)) { error in
            if let error = error {
                print("[VoiceAgent] Failed to send audio: \(error)")
            }
        }
    }

    // MARK: - Audio Playback
    private func playAudio(data: Data) {
        // Decode base64 audio if needed
        guard let audioData = Data(base64Encoded: data) ?? data as Data? else { return }

        do {
            audioPlayer = try AVAudioPlayer(data: audioData)
            audioPlayer?.prepareToPlay()
            audioPlayer?.play()
        } catch {
            print("[VoiceAgent] Failed to play audio: \(error)")
        }
    }

    // MARK: - WebSocket Helpers
    private func sendPong() {
        let message = """
        {"type": "pong"}
        """
        webSocketTask?.send(.string(message)) { _ in }
    }

    // MARK: - Mute Control
    func toggleMute() {
        isMuted.toggle()
        print("[VoiceAgent] Muted: \(isMuted)")
    }

    // MARK: - Transcript
    func getTranscriptText() -> String {
        transcript.map { message in
            "[\(message.timestamp.ISO8601Format())] \(message.source.rawValue): \(message.message)"
        }.joined(separator: "\n\n")
    }

    private func saveTranscript(sessionId: String) async {
        guard !transcript.isEmpty else { return }

        let transcriptText = getTranscriptText()
        let segments = transcript.enumerated().map { index, message in
            Segment(
                startMs: index * 1000,
                endMs: (index + 1) * 1000,
                speaker: message.source == .user ? .A : .B,
                text: message.message,
                confidence: 0.9
            )
        }

        do {
            try await APIClient.shared.saveTranscript(
                sessionId: sessionId,
                transcript: transcriptText,
                segments: segments
            )
            print("[VoiceAgent] Transcript saved")
        } catch {
            print("[VoiceAgent] Failed to save transcript: \(error)")
        }
    }

    func clearTranscript() {
        transcript.removeAll()
    }
}

// MARK: - Voice Agent Error
enum VoiceAgentError: LocalizedError {
    case microphonePermissionDenied
    case connectionFailed
    case audioSetupFailed
    case webSocketError(String)

    var errorDescription: String? {
        switch self {
        case .microphonePermissionDenied:
            return "Microphone permission is required for voice conversations"
        case .connectionFailed:
            return "Failed to connect to voice agent"
        case .audioSetupFailed:
            return "Failed to setup audio"
        case .webSocketError(let message):
            return "WebSocket error: \(message)"
        }
    }
}
