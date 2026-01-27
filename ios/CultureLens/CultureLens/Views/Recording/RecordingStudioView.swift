//
//  RecordingStudioView.swift
//  CultureLens
//
//  Voice recording studio with session setup and voice agent interaction
//

import SwiftUI

struct RecordingStudioView: View {
    @EnvironmentObject var sessionsViewModel: SessionsViewModel
    @EnvironmentObject var appState: AppState
    @StateObject private var voiceAgent = VoiceAgentService()

    @State private var currentStep: RecordingStep = .setup
    @State private var sessionSettings = SessionFormData()
    @State private var currentSession: Session?
    @State private var showingConsentSheet = false

    enum RecordingStep {
        case setup
        case consent
        case recording
        case processing
        case complete
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AnimatedBackground()

                VStack {
                    switch currentStep {
                    case .setup:
                        SessionSetupView(
                            settings: $sessionSettings,
                            onStartSession: {
                                showingConsentSheet = true
                            }
                        )

                    case .consent:
                        ConsentView(
                            onConsent: startRecording
                        )

                    case .recording:
                        VoiceAgentView(
                            voiceAgent: voiceAgent,
                            onEndSession: endSession
                        )

                    case .processing:
                        ProcessingView()

                    case .complete:
                        if let session = currentSession {
                            SessionCompleteView(
                                session: session,
                                onViewInsights: viewInsights,
                                onNewSession: resetSession
                            )
                        }
                    }
                }
            }
            .navigationTitle(navigationTitle)
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showingConsentSheet) {
                ConsentSheet(
                    onAgree: {
                        showingConsentSheet = false
                        currentStep = .recording
                        startRecording()
                    },
                    onCancel: {
                        showingConsentSheet = false
                    }
                )
            }
            .alert("Error", isPresented: .constant(voiceAgent.errorMessage != nil)) {
                Button("OK") {
                    voiceAgent.errorMessage = nil
                }
            } message: {
                Text(voiceAgent.errorMessage ?? "")
            }
        }
    }

    private var navigationTitle: String {
        switch currentStep {
        case .setup: return "New Session"
        case .consent: return "Consent"
        case .recording: return "Recording"
        case .processing: return "Processing"
        case .complete: return "Complete"
        }
    }

    private func startRecording() {
        Task {
            do {
                let settings = SessionSettings(
                    title: sessionSettings.title.isEmpty ? nil : sessionSettings.title,
                    sessionType: sessionSettings.sessionType.rawValue,
                    participantCount: sessionSettings.participantCount,
                    storageMode: sessionSettings.storageMode,
                    voiceId: Configuration.elevenLabsAgentId,
                    analysisMethod: nil,
                    analysisDepth: sessionSettings.analysisDepth,
                    culturalContextTags: sessionSettings.culturalContextTags,
                    sensitivityLevel: sessionSettings.sensitivityLevel
                )

                let session = try await sessionsViewModel.createSession(settings: settings)
                currentSession = session

                try await voiceAgent.connect(sessionId: session.id)

                appState.triggerHaptic(.success)

            } catch {
                appState.showError(error)
                currentStep = .setup
            }
        }
    }

    private func endSession() {
        Task {
            currentStep = .processing

            await voiceAgent.disconnect()

            if let session = currentSession {
                if let result = await sessionsViewModel.analyzeSession(session) {
                    currentSession?.analysisResult = result
                    currentSession?.status = .ready
                }
            }

            currentStep = .complete
            appState.triggerHaptic(.success)
        }
    }

    private func viewInsights() {
        if currentSession != nil {
            appState.selectedTab = .library
        }
    }

    private func resetSession() {
        currentStep = .setup
        sessionSettings = SessionFormData()
        currentSession = nil
        voiceAgent.clearTranscript()
    }
}

// MARK: - Session Form Data
struct SessionFormData {
    var title: String = ""
    var sessionType: SessionType = .conversation
    var participantCount: Int = 2
    var storageMode: StorageMode = .transcriptOnly
    var analysisDepth: AnalysisDepth = .standard
    var culturalContextTags: [String] = []
    var sensitivityLevel: Int = 50
}

// MARK: - Session Setup View
struct SessionSetupView: View {
    @Binding var settings: SessionFormData
    let onStartSession: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header with gradient icon
                VStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(Color.theme.primary.opacity(0.1))
                            .frame(width: 90, height: 90)

                        Image(systemName: "mic.circle.fill")
                            .font(.system(size: 52))
                            .foregroundStyle(LinearGradient.primaryGradient)
                    }

                    Text("Start a New Session")
                        .font(.title2.bold())

                    Text("Configure your conversation settings")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 16)

                // Form card
                VStack(spacing: 20) {
                    // Title
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Session Title (Optional)")
                            .font(.subheadline.bold())

                        TextField("e.g., Team Meeting", text: $settings.title)
                            .textFieldStyle(.plain)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 12)
                            .background {
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color(.systemGray6))
                            }
                            .overlay {
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color(.separator).opacity(0.3), lineWidth: 1)
                            }
                    }

                    // Session Type
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Session Type")
                            .font(.subheadline.bold())

                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 10) {
                            ForEach(SessionType.allCases, id: \.self) { type in
                                SessionTypeButton(
                                    type: type,
                                    isSelected: settings.sessionType == type
                                ) {
                                    settings.sessionType = type
                                }
                            }
                        }
                    }

                    // Analysis Depth
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Analysis Depth")
                            .font(.subheadline.bold())

                        ForEach(AnalysisDepth.allCases, id: \.self) { depth in
                            AnalysisDepthOption(
                                depth: depth,
                                isSelected: settings.analysisDepth == depth
                            ) {
                                settings.analysisDepth = depth
                            }
                        }
                    }

                    // Cultural Context Tags
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Cultural Context (Optional)")
                            .font(.subheadline.bold())

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(CulturalContextTag.allCases, id: \.self) { tag in
                                    ContextTagChip(
                                        tag: tag,
                                        isSelected: settings.culturalContextTags.contains(tag.rawValue)
                                    ) {
                                        if settings.culturalContextTags.contains(tag.rawValue) {
                                            settings.culturalContextTags.removeAll { $0 == tag.rawValue }
                                        } else {
                                            settings.culturalContextTags.append(tag.rawValue)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Storage Mode
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Storage Mode")
                            .font(.subheadline.bold())

                        Picker("Storage Mode", selection: $settings.storageMode) {
                            ForEach(StorageMode.allCases, id: \.self) { mode in
                                Text(mode.displayName).tag(mode)
                            }
                        }
                        .pickerStyle(.segmented)
                    }
                }
                .padding(18)
                .background {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(.ultraThinMaterial)
                        .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
                }

                // Start button
                Button(action: onStartSession) {
                    HStack(spacing: 8) {
                        Image(systemName: "play.fill")
                        Text("Start Session")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(LinearGradient.primaryGradient)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(color: Color.theme.primary.opacity(0.3), radius: 8, y: 4)
                }
            }
            .padding()
        }
    }
}

// MARK: - Session Type Button
struct SessionTypeButton: View {
    let type: SessionType
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: type.icon)
                    .font(.title2)

                Text(type.displayName)
                    .font(.caption.weight(.medium))
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background {
                if isSelected {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.theme.primary.opacity(0.12))
                } else {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color(.systemGray6))
                }
            }
            .foregroundColor(isSelected ? Color.theme.primary : .primary)
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? Color.theme.primary : .clear, lineWidth: 2)
            )
        }
    }
}

// MARK: - Analysis Depth Option
struct AnalysisDepthOption: View {
    let depth: AnalysisDepth
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(depth.displayName)
                        .font(.subheadline.bold())

                    Text(depth.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                ZStack {
                    Circle()
                        .stroke(isSelected ? Color.theme.primary : Color(.systemGray4), lineWidth: 2)
                        .frame(width: 22, height: 22)

                    if isSelected {
                        Circle()
                            .fill(LinearGradient.primaryGradient)
                            .frame(width: 14, height: 14)
                    }
                }
            }
            .padding(14)
            .background {
                RoundedRectangle(cornerRadius: 14)
                    .fill(isSelected ? Color.theme.primary.opacity(0.08) : Color(.systemGray6))
            }
            .overlay {
                if isSelected {
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.theme.primary.opacity(0.3), lineWidth: 1)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Context Tag Chip
struct ContextTagChip: View {
    let tag: CulturalContextTag
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: tag.icon)
                    .font(.caption.weight(.medium))

                Text(tag.displayName)
                    .font(.caption.weight(.medium))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background {
                if isSelected {
                    Capsule()
                        .fill(LinearGradient.primaryGradient)
                        .shadow(color: Color.theme.primary.opacity(0.2), radius: 3, y: 1)
                } else {
                    Capsule()
                        .fill(Color(.systemGray6))
                }
            }
            .foregroundColor(isSelected ? .white : .primary)
        }
    }
}

// MARK: - Consent Sheet
struct ConsentSheet: View {
    let onAgree: () -> Void
    let onCancel: () -> Void

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    ZStack {
                        Circle()
                            .fill(Color.theme.primary.opacity(0.1))
                            .frame(width: 80, height: 80)

                        Image(systemName: "hand.raised.fill")
                            .font(.system(size: 36))
                            .foregroundStyle(LinearGradient.primaryGradient)
                    }

                    VStack(spacing: 8) {
                        Text("Participant Consent")
                            .font(.title2.bold())

                        Text("Before starting, please confirm that all participants have consented to being recorded and analyzed.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }

                    VStack(alignment: .leading, spacing: 16) {
                        ConsentItem(
                            icon: "mic.fill",
                            text: "This conversation will be recorded"
                        )

                        ConsentItem(
                            icon: "brain",
                            text: "AI will analyze communication patterns"
                        )

                        ConsentItem(
                            icon: "lock.fill",
                            text: "Data is encrypted and stored securely"
                        )

                        ConsentItem(
                            icon: "trash",
                            text: "You can delete your data at any time"
                        )
                    }
                    .padding(16)
                    .background {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(.ultraThinMaterial)
                    }

                    VStack(spacing: 12) {
                        Button(action: onAgree) {
                            Text("I Confirm All Participants Consent")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 14)
                                .background(LinearGradient.primaryGradient)
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 14))
                                .shadow(color: Color.theme.primary.opacity(0.3), radius: 8, y: 4)
                        }

                        Button(action: onCancel) {
                            Text("Cancel")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding()
            }
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium, .large])
    }
}

struct ConsentItem: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.theme.primary.opacity(0.1))
                    .frame(width: 32, height: 32)

                Image(systemName: icon)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(Color.theme.primary)
            }

            Text(text)
                .font(.subheadline)
        }
    }
}

// MARK: - Consent View (Standalone)
struct ConsentView: View {
    let onConsent: () -> Void

    var body: some View {
        ConsentSheet(onAgree: onConsent, onCancel: {})
    }
}

// MARK: - Processing View
struct ProcessingView: View {
    @State private var progress: Double = 0

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            ZStack {
                Circle()
                    .stroke(Color(.systemGray5), lineWidth: 6)
                    .frame(width: 120, height: 120)

                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        LinearGradient.primaryGradient,
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(-90))

                Image(systemName: "brain")
                    .font(.system(size: 40))
                    .foregroundStyle(LinearGradient.primaryGradient)
            }

            VStack(spacing: 8) {
                Text("Analyzing Conversation")
                    .font(.title2.bold())

                Text("Our AI is processing your conversation to generate insights...")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            Spacer()
        }
        .padding()
        .onAppear {
            withAnimation(.linear(duration: 3).repeatForever(autoreverses: false)) {
                progress = 1
            }
        }
    }
}

// MARK: - Session Complete View
struct SessionCompleteView: View {
    let session: Session
    let onViewInsights: () -> Void
    let onNewSession: () -> Void

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Color.theme.success.opacity(0.15))
                        .frame(width: 100, height: 100)

                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(LinearGradient.emeraldCyan)
                }

                Text("Session Complete!")
                    .font(.title.bold())

                Text("Your conversation has been analyzed and insights are ready.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            // Stats
            if let result = session.analysisResult {
                HStack(spacing: 12) {
                    StatBadge(
                        value: "\(result.insights.count)",
                        label: "Insights",
                        gradient: .indigoPurple
                    )

                    StatBadge(
                        value: "\(result.segments.count)",
                        label: "Segments",
                        gradient: .purpleMagenta
                    )

                    StatBadge(
                        value: session.formattedDuration,
                        label: "Duration",
                        gradient: .emeraldCyan
                    )
                }
            }

            Spacer()

            VStack(spacing: 12) {
                Button(action: onViewInsights) {
                    HStack(spacing: 8) {
                        Image(systemName: "lightbulb.fill")
                        Text("View Insights")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(LinearGradient.primaryGradient)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .shadow(color: Color.theme.primary.opacity(0.3), radius: 8, y: 4)
                }

                Button(action: onNewSession) {
                    Text("Start New Session")
                        .fontWeight(.medium)
                        .foregroundColor(Color.theme.primary)
                }
            }
        }
        .padding()
    }
}

struct StatBadge: View {
    let value: String
    let label: String
    var gradient: LinearGradient = .primaryGradient

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3.bold())
                .foregroundColor(.white)

            Text(label)
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background {
            RoundedRectangle(cornerRadius: 14)
                .fill(gradient)
                .shadow(color: .black.opacity(0.1), radius: 4, y: 2)
        }
    }
}

#Preview {
    RecordingStudioView()
        .environmentObject(SessionsViewModel())
        .environmentObject(AppState())
}
