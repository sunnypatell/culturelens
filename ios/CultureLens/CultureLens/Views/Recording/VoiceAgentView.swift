//
//  VoiceAgentView.swift
//  CultureLens
//
//  Voice agent interaction view with animated orb visualization
//

import SwiftUI

struct VoiceAgentView: View {
    @ObservedObject var voiceAgent: VoiceAgentService
    let onEndSession: () -> Void

    @State private var showingTranscript = false

    var body: some View {
        VStack(spacing: 0) {
            // Status bar
            statusBar
                .padding()

            Spacer()

            // Orb visualization
            OrbVisualization(agentState: voiceAgent.agentState)
                .frame(width: 280, height: 280)

            // State indicator
            stateIndicator
                .padding(.top, 24)

            Spacer()

            // Controls
            controlsSection
                .padding()
        }
        .sheet(isPresented: $showingTranscript) {
            TranscriptSheetView(transcript: voiceAgent.transcript)
        }
    }

    private var statusBar: some View {
        HStack {
            // Connection status
            HStack(spacing: 8) {
                Circle()
                    .fill(connectionColor)
                    .frame(width: 8, height: 8)

                Text(connectionText)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Transcript button
            Button {
                showingTranscript = true
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "doc.text")
                    Text("\(voiceAgent.transcript.count)")
                }
                .font(.caption)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(.systemGray6))
                .clipShape(Capsule())
            }
        }
    }

    private var connectionColor: Color {
        switch voiceAgent.connectionState {
        case .connected:
            return .green
        case .connecting:
            return .orange
        case .disconnected:
            return .gray
        case .error:
            return .red
        }
    }

    private var connectionText: String {
        switch voiceAgent.connectionState {
        case .connected:
            return "Connected"
        case .connecting:
            return "Connecting..."
        case .disconnected:
            return "Disconnected"
        case .error(let message):
            return "Error: \(message)"
        }
    }

    private var stateIndicator: some View {
        VStack(spacing: 8) {
            Text(stateText)
                .font(.headline)

            Text(stateDescription)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }

    private var stateText: String {
        switch voiceAgent.agentState {
        case .idle:
            return "Ready"
        case .listening:
            return "Listening..."
        case .speaking:
            return "Agent Speaking"
        }
    }

    private var stateDescription: String {
        switch voiceAgent.agentState {
        case .idle:
            return "Tap to start speaking"
        case .listening:
            return "Speak naturally, I'm listening"
        case .speaking:
            return "Please wait..."
        }
    }

    private var controlsSection: some View {
        VStack(spacing: 16) {
            // Main controls
            HStack(spacing: 32) {
                // Mute button
                Button {
                    voiceAgent.toggleMute()
                } label: {
                    ZStack {
                        Circle()
                            .fill(voiceAgent.isMuted ? Color.theme.error : Color(.systemGray6))
                            .frame(width: 56, height: 56)

                        Image(systemName: voiceAgent.isMuted ? "mic.slash.fill" : "mic.fill")
                            .font(.title2)
                            .foregroundColor(voiceAgent.isMuted ? .white : .primary)
                    }
                }

                // End session button
                Button(action: onEndSession) {
                    ZStack {
                        Circle()
                            .fill(Color.theme.error)
                            .frame(width: 72, height: 72)

                        Image(systemName: "stop.fill")
                            .font(.title)
                            .foregroundColor(.white)
                    }
                }

                // Placeholder for symmetry
                Circle()
                    .fill(.clear)
                    .frame(width: 56, height: 56)
            }

            Text("Tap stop when finished")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Orb Visualization
struct OrbVisualization: View {
    let agentState: VoiceAgentService.AgentState

    @State private var animationPhase: Double = 0
    @State private var pulseScale: CGFloat = 1.0
    @State private var glowOpacity: Double = 0.3

    var body: some View {
        ZStack {
            outerGlowLayers
            mainOrb
        }
        .onAppear {
            startAnimations()
        }
        .onChange(of: agentState) { newState in
            updateAnimations(for: newState)
        }
    }

    // MARK: - Outer Glow Layers
    private var outerGlowLayers: some View {
        ForEach(0..<3, id: \.self) { index in
            Circle()
                .fill(outerGlowGradient(index: index))
                .scaleEffect(pulseScale + CGFloat(index) * 0.1)
                .opacity(glowOpacity)
        }
    }

    private func outerGlowGradient(index: Int) -> RadialGradient {
        RadialGradient(
            colors: [
                Color.theme.orbPrimary.opacity(0.3 - Double(index) * 0.1),
                Color.theme.orbSecondary.opacity(0.1),
                .clear
            ],
            center: .center,
            startRadius: 80,
            endRadius: 160
        )
    }

    // MARK: - Main Orb
    private var mainOrb: some View {
        ZStack {
            baseGradientCircle
            innerGlowCircle
            speakingWaveEffect
            listeningIndicator
        }
        .shadow(color: Color.theme.orbPrimary.opacity(0.5), radius: 30)
    }

    private var baseGradientCircle: some View {
        Circle()
            .fill(
                LinearGradient(
                    colors: [Color.theme.orbPrimary, Color.theme.orbSecondary],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(width: 180, height: 180)
    }

    private var innerGlowCircle: some View {
        let centerX: CGFloat = 0.3 + sin(animationPhase) * 0.1
        let centerY: CGFloat = 0.3 + cos(animationPhase) * 0.1

        return Circle()
            .fill(
                RadialGradient(
                    colors: [
                        Color.white.opacity(0.4),
                        Color.white.opacity(0.1),
                        Color.clear
                    ],
                    center: UnitPoint(x: centerX, y: centerY),
                    startRadius: 0,
                    endRadius: 90
                )
            )
            .frame(width: 180, height: 180)
    }

    @ViewBuilder
    private var speakingWaveEffect: some View {
        if agentState == .speaking {
            ForEach(0..<3, id: \.self) { wave in
                speakingWave(index: wave)
            }
        }
    }

    private func speakingWave(index: Int) -> some View {
        let waveOpacity: Double = 0.3 - Double(index) * 0.1
        let waveScale: CGFloat = 1.0 + CGFloat(index) * 0.15 + CGFloat(sin(animationPhase + Double(index))) * 0.1

        return Circle()
            .stroke(Color.white.opacity(waveOpacity), lineWidth: 2)
            .frame(width: 180, height: 180)
            .scaleEffect(waveScale)
    }

    @ViewBuilder
    private var listeningIndicator: some View {
        if agentState == .listening {
            Circle()
                .stroke(Color.white.opacity(0.5), lineWidth: 3)
                .frame(width: 200, height: 200)
                .scaleEffect(pulseScale)
        }
    }

    // MARK: - Animations
    private func startAnimations() {
        withAnimation(.linear(duration: 8).repeatForever(autoreverses: false)) {
            animationPhase = .pi * 2
        }
        updateAnimations(for: agentState)
    }

    private func updateAnimations(for state: VoiceAgentService.AgentState) {
        switch state {
        case .idle:
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) {
                pulseScale = 1.05
                glowOpacity = 0.3
            }

        case .listening:
            withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                pulseScale = 1.1
                glowOpacity = 0.5
            }

        case .speaking:
            withAnimation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true)) {
                pulseScale = 1.15
                glowOpacity = 0.7
            }
        }
    }
}

// MARK: - Transcript Sheet View
struct TranscriptSheetView: View {
    let transcript: [VoiceAgentService.TranscriptMessage]
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if transcript.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "text.bubble")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)

                        Text("No messages yet")
                            .font(.headline)

                        Text("Start speaking to see the transcript")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(transcript) { message in
                                TranscriptBubble(message: message)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Transcript")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Transcript Bubble
struct TranscriptBubble: View {
    let message: VoiceAgentService.TranscriptMessage

    var body: some View {
        HStack {
            if message.source == .user {
                Spacer(minLength: 60)
            }

            VStack(alignment: message.source == .user ? .trailing : .leading, spacing: 4) {
                Text(message.source.displayName)
                    .font(.caption2)
                    .foregroundColor(.secondary)

                Text(message.message)
                    .font(.body)
                    .padding(12)
                    .background(
                        message.source == .user
                            ? Color.theme.primary
                            : Color(.systemGray6)
                    )
                    .foregroundColor(message.source == .user ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            if message.source == .agent {
                Spacer(minLength: 60)
            }
        }
    }
}

#Preview {
    VoiceAgentView(
        voiceAgent: VoiceAgentService(),
        onEndSession: {}
    )
}
