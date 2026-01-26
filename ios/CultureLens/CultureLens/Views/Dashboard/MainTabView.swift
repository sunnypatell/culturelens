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

// MARK: - Home View
struct HomeView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var sessionsViewModel: SessionsViewModel
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Welcome header
                    welcomeHeader

                    // Quick stats
                    statsSection

                    // Quick actions
                    quickActionsSection

                    // Recent sessions
                    recentSessionsSection
                }
                .padding()
            }
            .background(Color.theme.background)
            .navigationTitle("Home")
            .refreshable {
                await sessionsViewModel.refreshSessions()
            }
        }
    }

    private var welcomeHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Welcome back,")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Text(authViewModel.user?.displayName ?? "User")
                    .font(.title2.bold())
            }

            Spacer()

            // User avatar
            if let photoURL = authViewModel.user?.photoURL,
               let url = URL(string: photoURL) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    userInitialsView
                }
                .frame(width: 48, height: 48)
                .clipShape(Circle())
            } else {
                userInitialsView
            }
        }
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var userInitialsView: some View {
        ZStack {
            Circle()
                .fill(LinearGradient.primaryGradient)

            Text(authViewModel.user?.initials ?? "U")
                .font(.headline.bold())
                .foregroundColor(.white)
        }
        .frame(width: 48, height: 48)
    }

    private var statsSection: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 16) {
            StatCard(
                title: "This Month",
                value: "\(sessionsViewModel.stats.thisMonth)",
                icon: "calendar",
                color: .blue
            )

            StatCard(
                title: "Total Sessions",
                value: "\(sessionsViewModel.stats.totalSessions)",
                icon: "waveform.circle",
                color: .purple
            )

            StatCard(
                title: "Insights",
                value: "\(sessionsViewModel.stats.totalInsights)",
                icon: "lightbulb",
                color: .orange
            )

            StatCard(
                title: "Time Recorded",
                value: sessionsViewModel.stats.formattedTotalDuration,
                icon: "clock",
                color: .green
            )
        }
    }

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quick Actions")
                .font(.headline)

            HStack(spacing: 16) {
                QuickActionButton(
                    title: "New Session",
                    icon: "plus.circle.fill",
                    color: Color.theme.primary
                ) {
                    appState.selectedTab = .record
                }

                QuickActionButton(
                    title: "View Library",
                    icon: "books.vertical.fill",
                    color: Color.theme.accent
                ) {
                    appState.selectedTab = .library
                }
            }
        }
    }

    private var recentSessionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Recent Sessions")
                    .font(.headline)

                Spacer()

                Button("See All") {
                    appState.selectedTab = .library
                }
                .font(.subheadline)
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

// MARK: - Stat Card
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)

                Spacer()
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.title2.bold())

                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Quick Action Button
struct QuickActionButton: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.title)
                    .foregroundColor(.white)

                Text(title)
                    .font(.caption.bold())
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(color)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
}

// MARK: - Empty Sessions View
struct EmptySessionsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "waveform.circle")
                .font(.system(size: 48))
                .foregroundColor(.secondary)

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
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Session Card View
struct SessionCardView: View {
    let session: Session
    @EnvironmentObject var sessionsViewModel: SessionsViewModel

    var body: some View {
        HStack(spacing: 16) {
            // Status indicator
            ZStack {
                Circle()
                    .fill(statusColor.opacity(0.2))
                    .frame(width: 48, height: 48)

                Image(systemName: session.status.icon)
                    .foregroundColor(statusColor)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(session.displayTitle)
                    .font(.headline)
                    .lineLimit(1)

                HStack(spacing: 8) {
                    Text(session.formattedDate)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if let duration = session.duration {
                        Text("•")
                            .foregroundColor(.secondary)

                        Text(session.formattedDuration)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }

                if session.status != .ready {
                    Text(session.status.displayName)
                        .font(.caption2)
                        .foregroundColor(statusColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(statusColor.opacity(0.1))
                        .clipShape(Capsule())
                }
            }

            Spacer()

            // Favorite button
            Button {
                Task {
                    await sessionsViewModel.toggleFavorite(session)
                }
            } label: {
                Image(systemName: session.isFavorite == true ? "star.fill" : "star")
                    .foregroundColor(session.isFavorite == true ? .yellow : .secondary)
            }

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var statusColor: Color {
        switch session.status {
        case .recording:
            return .red
        case .uploading:
            return .orange
        case .processing:
            return .blue
        case .ready:
            return .green
        case .failed:
            return .red
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AuthViewModel())
        .environmentObject(AppState())
}
