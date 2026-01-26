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
                // Background
                Color.theme.background
                    .ignoresSafeArea()

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
                // Create session in backend
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

                // Connect to voice agent
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

            // Trigger analysis
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
        if let session = currentSession {
            appState.selectedTab = .library
            // Navigation will be handled by the library view
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
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "mic.circle.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(LinearGradient.primaryGradient)

                    Text("Start a New Session")
                        .font(.title2.bold())

                    Text("Configure your conversation settings")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 20)

                // Form
                VStack(spacing: 20) {
                    // Title
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Session Title (Optional)")
                            .font(.subheadline.bold())

                        TextField("e.g., Team Meeting", text: $settings.title)
                            .textFieldStyle(.plain)
                            .padding()
                            .background(Color(.systemGray6))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    // Session Type
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Session Type")
                            .font(.subheadline.bold())

                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 12) {
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
                .padding()
                .background(Color.theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 16))

                // Start button
                Button(action: onStartSession) {
                    HStack {
                        Image(systemName: "play.fill")
                        Text("Start Session")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.theme.primary)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
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
                    .font(.caption)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isSelected ? Color.theme.primary.opacity(0.15) : Color(.systemGray6))
            .foregroundColor(isSelected ? Color.theme.primary : .primary)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
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

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? Color.theme.primary : .secondary)
            }
            .padding()
            .background(isSelected ? Color.theme.primary.opacity(0.1) : Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 12))
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
                    .font(.caption)

                Text(tag.displayName)
                    .font(.caption)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? Color.theme.primary : Color(.systemGray6))
            .foregroundColor(isSelected ? .white : .primary)
            .clipShape(Capsule())
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
                    Image(systemName: "hand.raised.fill")
                        .font(.system(size: 48))
                        .foregroundColor(Color.theme.primary)

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
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 16))

                    VStack(spacing: 12) {
                        Button(action: onAgree) {
                            Text("I Confirm All Participants Consent")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.theme.primary)
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
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
            Image(systemName: icon)
                .foregroundColor(Color.theme.primary)
                .frame(width: 24)

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
                    .stroke(Color(.systemGray5), lineWidth: 8)
                    .frame(width: 120, height: 120)

                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        LinearGradient.primaryGradient,
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
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
                        .fill(Color.theme.success.opacity(0.2))
                        .frame(width: 100, height: 100)

                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 48))
                        .foregroundColor(Color.theme.success)
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
                HStack(spacing: 24) {
                    StatBadge(
                        value: "\(result.insights.count)",
                        label: "Insights"
                    )

                    StatBadge(
                        value: "\(result.segments.count)",
                        label: "Segments"
                    )

                    StatBadge(
                        value: session.formattedDuration,
                        label: "Duration"
                    )
                }
            }

            Spacer()

            VStack(spacing: 12) {
                Button(action: onViewInsights) {
                    HStack {
                        Image(systemName: "lightbulb.fill")
                        Text("View Insights")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.theme.primary)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Button(action: onNewSession) {
                    Text("Start New Session")
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

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold())

            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    RecordingStudioView()
        .environmentObject(SessionsViewModel())
        .environmentObject(AppState())
}
