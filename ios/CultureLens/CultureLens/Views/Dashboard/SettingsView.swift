//
//  SettingsView.swift
//  CultureLens
//
//  User settings and account management
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState

    @State private var showingSignOutAlert = false
    @State private var showingDeleteAccountAlert = false
    @State private var showingExportSheet = false
    @State private var isExporting = false

    var body: some View {
        NavigationStack {
            List {
                // Profile section
                Section {
                    profileRow
                } header: {
                    Text("Profile")
                }

                // Appearance section
                Section {
                    appearanceRow
                } header: {
                    Text("Appearance")
                }

                // Preferences section
                Section {
                    preferencesRows
                } header: {
                    Text("Preferences")
                }

                // Data section
                Section {
                    dataRows
                } header: {
                    Text("Data & Privacy")
                }

                // About section
                Section {
                    aboutRows
                } header: {
                    Text("About")
                }

                // Account section
                Section {
                    accountRows
                } header: {
                    Text("Account")
                }
            }
            .navigationTitle("Settings")
            .alert("Sign Out", isPresented: $showingSignOutAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Sign Out", role: .destructive) {
                    authViewModel.signOut()
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
            .alert("Delete Account", isPresented: $showingDeleteAccountAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    Task {
                        await authViewModel.deleteAccount()
                    }
                }
            } message: {
                Text("This will permanently delete your account and all associated data. This action cannot be undone.")
            }
        }
    }

    // MARK: - Profile Row
    private var profileRow: some View {
        HStack(spacing: 16) {
            // Avatar
            if let photoURL = authViewModel.user?.photoURL,
               let url = URL(string: photoURL) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    avatarPlaceholder
                }
                .frame(width: 60, height: 60)
                .clipShape(Circle())
            } else {
                avatarPlaceholder
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(authViewModel.user?.displayName ?? "User")
                    .font(.headline)

                Text(authViewModel.user?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                if let createdAt = authViewModel.user?.formattedCreatedDate {
                    Text("Member since \(createdAt)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 8)
    }

    private var avatarPlaceholder: some View {
        ZStack {
            Circle()
                .fill(LinearGradient.primaryGradient)

            Text(authViewModel.user?.initials ?? "U")
                .font(.title2.bold())
                .foregroundColor(.white)
        }
        .frame(width: 60, height: 60)
    }

    // MARK: - Appearance Row
    private var appearanceRow: some View {
        HStack {
            Label("Theme", systemImage: "paintbrush.fill")

            Spacer()

            Picker("Theme", selection: Binding(
                get: { appState.colorScheme },
                set: { appState.setColorScheme($0) }
            )) {
                Text("System").tag(nil as ColorScheme?)
                Text("Light").tag(ColorScheme.light as ColorScheme?)
                Text("Dark").tag(ColorScheme.dark as ColorScheme?)
            }
            .pickerStyle(.menu)
        }
    }

    // MARK: - Preferences Rows
    @ViewBuilder
    private var preferencesRows: some View {
        Toggle(isOn: $appState.notificationsEnabled) {
            Label("Notifications", systemImage: "bell.fill")
        }

        Toggle(isOn: $appState.autoSaveEnabled) {
            Label("Auto-save Sessions", systemImage: "arrow.down.doc.fill")
        }

        NavigationLink {
            DefaultSettingsView()
        } label: {
            Label("Default Session Settings", systemImage: "slider.horizontal.3")
        }
    }

    // MARK: - Data Rows
    @ViewBuilder
    private var dataRows: some View {
        Button {
            exportData()
        } label: {
            HStack {
                Label("Export My Data", systemImage: "square.and.arrow.up")

                Spacer()

                if isExporting {
                    ProgressView()
                }
            }
        }
        .disabled(isExporting)

        NavigationLink {
            PrivacyPolicyView()
        } label: {
            Label("Privacy Policy", systemImage: "hand.raised.fill")
        }

        NavigationLink {
            TermsOfServiceView()
        } label: {
            Label("Terms of Service", systemImage: "doc.text.fill")
        }
    }

    // MARK: - About Rows
    @ViewBuilder
    private var aboutRows: some View {
        HStack {
            Label("Version", systemImage: "info.circle.fill")

            Spacer()

            Text("\(Configuration.appVersion) (\(Configuration.buildNumber))")
                .foregroundColor(.secondary)
        }

        Link(destination: URL(string: "https://github.com/sunnypatell/culturelens")!) {
            HStack {
                Label("GitHub", systemImage: "link")

                Spacer()

                Image(systemName: "arrow.up.right.square")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }

        NavigationLink {
            AcknowledgmentsView()
        } label: {
            Label("Acknowledgments", systemImage: "heart.fill")
        }
    }

    // MARK: - Account Rows
    @ViewBuilder
    private var accountRows: some View {
        Button {
            showingSignOutAlert = true
        } label: {
            Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                .foregroundColor(Color.theme.primary)
        }

        Button {
            showingDeleteAccountAlert = true
        } label: {
            Label("Delete Account", systemImage: "trash.fill")
                .foregroundColor(.red)
        }
    }

    // MARK: - Export Data
    private func exportData() {
        isExporting = true

        Task {
            do {
                let data = try await APIClient.shared.exportData()

                // Create a temporary file and share it
                let tempURL = FileManager.default.temporaryDirectory
                    .appendingPathComponent("culturelens-export-\(Date().timeIntervalSince1970).json")

                try data.write(to: tempURL)

                await MainActor.run {
                    isExporting = false
                    shareFile(at: tempURL)
                }
            } catch {
                await MainActor.run {
                    isExporting = false
                    appState.showError(error)
                }
            }
        }
    }

    private func shareFile(at url: URL) {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            return
        }

        let activityVC = UIActivityViewController(activityItems: [url], applicationActivities: nil)
        rootViewController.present(activityVC, animated: true)
    }
}

// MARK: - Default Settings View
struct DefaultSettingsView: View {
    @AppStorage("defaultAnalysisDepth") private var defaultAnalysisDepth = "standard"
    @AppStorage("defaultStorageMode") private var defaultStorageMode = "transcriptOnly"
    @AppStorage("defaultSensitivityLevel") private var sensitivityLevel: Double = 50

    var body: some View {
        List {
            Section {
                Picker("Analysis Depth", selection: $defaultAnalysisDepth) {
                    Text("Quick").tag("quick")
                    Text("Standard").tag("standard")
                    Text("Deep").tag("deep")
                }
            } header: {
                Text("Analysis")
            }

            Section {
                Picker("Storage Mode", selection: $defaultStorageMode) {
                    Text("Transcript Only").tag("transcriptOnly")
                    Text("Ephemeral").tag("ephemeral")
                }
            } header: {
                Text("Storage")
            }

            Section {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Sensitivity Level")
                        Spacer()
                        Text("\(Int(sensitivityLevel))%")
                            .foregroundColor(.secondary)
                    }

                    Slider(value: $sensitivityLevel, in: 0...100, step: 10)
                }
            } header: {
                Text("Sensitivity")
            } footer: {
                Text("Higher sensitivity may flag more potential cultural patterns")
            }
        }
        .navigationTitle("Default Settings")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Privacy Policy View
struct PrivacyPolicyView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Privacy Policy")
                    .font(.title.bold())

                Text("Last updated: January 2025")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("""
                CultureLens is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.

                **Data Collection**
                We collect conversation transcripts and analysis results that you create within the app. Audio recordings are processed but not stored unless you explicitly choose to save them.

                **Data Usage**
                Your data is used solely to provide analysis and insights about your conversations. We do not sell or share your personal data with third parties.

                **Data Storage**
                All data is encrypted and stored securely using Firebase services. You can delete your data at any time through the app settings.

                **Your Rights**
                You have the right to access, export, and delete your personal data at any time.
                """)
                .font(.body)
                .lineSpacing(4)
            }
            .padding()
        }
        .navigationTitle("Privacy Policy")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Terms of Service View
struct TermsOfServiceView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Terms of Service")
                    .font(.title.bold())

                Text("Last updated: January 2025")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("""
                By using CultureLens, you agree to these terms of service.

                **Acceptable Use**
                CultureLens is designed to help improve cross-cultural communication. You agree to use the app ethically and legally, with the consent of all conversation participants.

                **Consent Requirement**
                You must obtain consent from all participants before recording or analyzing any conversation.

                **AI Analysis**
                The insights provided by CultureLens are AI-generated and should be used as guidance only. They are not professional advice.

                **Limitation of Liability**
                CultureLens is provided "as is" without warranty. We are not liable for any damages arising from your use of the app.
                """)
                .font(.body)
                .lineSpacing(4)
            }
            .padding()
        }
        .navigationTitle("Terms of Service")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Acknowledgments View
struct AcknowledgmentsView: View {
    var body: some View {
        List {
            Section {
                AcknowledgmentRow(name: "SwiftUI", description: "Apple's declarative UI framework")
                AcknowledgmentRow(name: "Firebase", description: "Authentication and database")
                AcknowledgmentRow(name: "ElevenLabs", description: "Conversational AI voice agent")
                AcknowledgmentRow(name: "Google Gemini", description: "AI analysis engine")
            } header: {
                Text("Technologies")
            }

            Section {
                Text("Built with love for the hackathon")
                    .foregroundColor(.secondary)
            } header: {
                Text("Credits")
            }
        }
        .navigationTitle("Acknowledgments")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AcknowledgmentRow: View {
    let name: String
    let description: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(name)
                .font(.headline)

            Text(description)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthViewModel())
        .environmentObject(AppState())
}
