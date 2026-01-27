//
//  MainTabView.swift
//  CultureLens
//
//  Main tab navigation for authenticated users
//

import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var sessionsViewModel = SessionsViewModel()

    var body: some View {
        TabView(selection: $appState.selectedTab) {
            HomeView()
                .environmentObject(sessionsViewModel)
                .tabItem {
                    Label(AppState.Tab.home.rawValue, systemImage: AppState.Tab.home.icon)
                }
                .tag(AppState.Tab.home)

            RecordingStudioView()
                .environmentObject(sessionsViewModel)
                .tabItem {
                    Label(AppState.Tab.record.rawValue, systemImage: AppState.Tab.record.icon)
                }
                .tag(AppState.Tab.record)

            LibraryView()
                .environmentObject(sessionsViewModel)
                .tabItem {
                    Label(AppState.Tab.library.rawValue, systemImage: AppState.Tab.library.icon)
                }
                .tag(AppState.Tab.library)

            SettingsView()
                .tabItem {
                    Label(AppState.Tab.settings.rawValue, systemImage: AppState.Tab.settings.icon)
                }
                .tag(AppState.Tab.settings)
        }
        .tint(Color.theme.primary)
        .task {
            await sessionsViewModel.loadSessions()
        }
    }
}

// MARK: - Animated Background
struct AnimatedBackground: View {
    @State private var animate = false

    var body: some View {
        ZStack {
            Color.theme.background
                .ignoresSafeArea()

            // Floating orbs like the webapp
            Circle()
                .fill(Color.theme.primary.opacity(0.08))
                .frame(width: 300, height: 300)
                .blur(radius: 60)
                .offset(
                    x: animate ? 50 : -50,
                    y: animate ? -30 : 30
                )

            Circle()
                .fill(Color.theme.accent.opacity(0.06))
                .frame(width: 250, height: 250)
                .blur(radius: 50)
                .offset(
                    x: animate ? -40 : 60,
                    y: animate ? 60 : -20
                )

            Circle()
                .fill(Color.theme.cyan.opacity(0.05))
                .frame(width: 200, height: 200)
                .blur(radius: 40)
                .offset(
                    x: animate ? 30 : -60,
                    y: animate ? -50 : 50
                )
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 8).repeatForever(autoreverses: true)) {
                animate = true
            }
        }
    }
}

// MARK: - Home View
struct HomeView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var sessionsViewModel: SessionsViewModel
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            ZStack {
                AnimatedBackground()

                ScrollView {
                    VStack(spacing: 20) {
                        welcomeHeader
                        statsSection
                        quickActionsSection
                        recentSessionsSection
                    }
                    .padding()
                }
            }
            .navigationTitle("Home")
            .refreshable {
                await sessionsViewModel.refreshSessions()
            }
        }
    }

    private var welcomeHeader: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Welcome back,")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Text(authViewModel.user?.displayName ?? "User")
                    .font(.title2.bold())
            }

            Spacer()

            if let photoURL = authViewModel.user?.photoURL,
               let url = URL(string: photoURL) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    userInitialsView
                }
                .frame(width: 52, height: 52)
                .clipShape(Circle())
            } else {
                userInitialsView
            }
        }
        .padding(16)
        .background {
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
                .shadow(color: Color.theme.primary.opacity(0.08), radius: 12, y: 4)
        }
    }

    private var userInitialsView: some View {
        ZStack {
            Circle()
                .fill(LinearGradient.primaryGradient)

            Text(authViewModel.user?.initials ?? "U")
                .font(.headline.bold())
                .foregroundColor(.white)
        }
        .frame(width: 52, height: 52)
        .shadow(color: Color.theme.primary.opacity(0.3), radius: 8, y: 2)
    }

    private var statsSection: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            GradientStatCard(
                title: "This Month",
                value: "\(sessionsViewModel.stats.thisMonth)",
                icon: "calendar",
                gradient: .indigoPurple
            )

            GradientStatCard(
                title: "Total Sessions",
                value: "\(sessionsViewModel.stats.totalSessions)",
                icon: "waveform.circle",
                gradient: .purpleMagenta
            )

            GradientStatCard(
                title: "Insights",
                value: "\(sessionsViewModel.stats.totalInsights)",
                icon: "lightbulb",
                gradient: .roseOrange
            )

            GradientStatCard(
                title: "Time Recorded",
                value: sessionsViewModel.stats.formattedTotalDuration,
                icon: "clock",
                gradient: .emeraldCyan
            )
        }
    }

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Actions")
                .font(.headline)

            HStack(spacing: 12) {
                GradientActionButton(
                    title: "New Session",
                    icon: "plus.circle.fill",
                    gradient: .indigoPurple
                ) {
                    appState.selectedTab = .record
                }

                GradientActionButton(
                    title: "View Library",
                    icon: "books.vertical.fill",
                    gradient: .purpleMagenta
                ) {
                    appState.selectedTab = .library
                }
            }
        }
    }

    private var recentSessionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent Sessions")
                    .font(.headline)

                Spacer()

                Button("See All") {
                    appState.selectedTab = .library
                }
                .font(.subheadline.weight(.medium))
                .foregroundColor(Color.theme.primary)
            }

            if sessionsViewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, minHeight: 100)
            } else if sessionsViewModel.sessions.isEmpty {
                EmptySessionsView()
            } else {
                ForEach(sessionsViewModel.sessions.prefix(3)) { session in
                    NavigationLink(value: session) {
                        SessionCardView(session: session)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .navigationDestination(for: Session.self) { session in
            InsightsView(session: session)
                .environmentObject(sessionsViewModel)
        }
    }
}

// MARK: - Gradient Stat Card
struct GradientStatCard: View {
    let title: String
    let value: String
    let icon: String
    let gradient: LinearGradient

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                ZStack {
                    Circle()
                        .fill(.white.opacity(0.2))
                        .frame(width: 36, height: 36)

                    Image(systemName: icon)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                }

                Spacer()
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.title.bold())
                    .foregroundColor(.white)

                Text(title)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
            }
        }
        .padding(16)
        .background {
            RoundedRectangle(cornerRadius: 20)
                .fill(gradient)
                .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
        }
    }
}

// MARK: - Gradient Action Button
struct GradientActionButton: View {
    let title: String
    let icon: String
    let gradient: LinearGradient
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(.white)

                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background {
                RoundedRectangle(cornerRadius: 20)
                    .fill(gradient)
                    .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
            }
        }
    }
}

// MARK: - Stat Card (legacy, kept for compatibility)
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        GradientStatCard(
            title: title,
            value: value,
            icon: icon,
            gradient: LinearGradient(colors: [color, color.opacity(0.7)], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
    }
}

// MARK: - Quick Action Button (legacy, kept for compatibility)
struct QuickActionButton: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        GradientActionButton(
            title: title,
            icon: icon,
            gradient: LinearGradient(colors: [color, color.opacity(0.7)], startPoint: .topLeading, endPoint: .bottomTrailing),
            action: action
        )
    }
}

// MARK: - Empty Sessions View
struct EmptySessionsView: View {
    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.theme.primary.opacity(0.1))
                    .frame(width: 80, height: 80)

                Image(systemName: "waveform.circle")
                    .font(.system(size: 36))
                    .foregroundStyle(LinearGradient.primaryGradient)
            }

            VStack(spacing: 4) {
                Text("No sessions yet")
                    .font(.headline)

                Text("Start a new recording to begin")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(32)
        .background {
            RoundedRectangle(cornerRadius: 20)
                .fill(.ultraThinMaterial)
        }
    }
}

// MARK: - Session Card View
struct SessionCardView: View {
    let session: Session
    @EnvironmentObject var sessionsViewModel: SessionsViewModel

    var body: some View {
        HStack(spacing: 14) {
            // Status indicator
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(statusGradient)
                    .frame(width: 48, height: 48)

                Image(systemName: session.status.icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(session.displayTitle)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)

                HStack(spacing: 8) {
                    Text(session.formattedDate)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if session.duration != nil {
                        Text("·")
                            .foregroundColor(.secondary)

                        Text(session.formattedDuration)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                if session.status != .ready {
                    Text(session.status.displayName)
                        .font(.caption2.weight(.medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(statusGradient)
                        .clipShape(Capsule())
                }
            }

            Spacer()

            Button {
                Task {
                    await sessionsViewModel.toggleFavorite(session)
                }
            } label: {
                Image(systemName: session.isFavorite == true ? "star.fill" : "star")
                    .foregroundColor(session.isFavorite == true ? .yellow : .secondary)
                    .font(.system(size: 16))
            }

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundColor(.tertiaryLabel)
        }
        .padding(14)
        .background {
            RoundedRectangle(cornerRadius: 18)
                .fill(.ultraThinMaterial)
                .shadow(color: .black.opacity(0.04), radius: 8, y: 2)
        }
    }

    private var statusGradient: LinearGradient {
        switch session.status {
        case .recording:
            return .roseOrange
        case .uploading:
            return LinearGradient(colors: [Color.theme.warning, Color.theme.orange], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .processing:
            return .indigoPurple
        case .ready:
            return .emeraldCyan
        case .failed:
            return .errorGradient
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
        .environmentObject(AppState())
}
