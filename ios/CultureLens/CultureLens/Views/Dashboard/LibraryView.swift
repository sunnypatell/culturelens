//
//  LibraryView.swift
//  CultureLens
//
//  Session library with search, filters, and session management
//

import SwiftUI

struct LibraryView: View {
    @EnvironmentObject var sessionsViewModel: SessionsViewModel
    @State private var showingDeleteAlert = false
    @State private var sessionToDelete: Session?

    var body: some View {
        NavigationStack {
            ZStack {
                AnimatedBackground()

                VStack(spacing: 0) {
                    // Search and filters
                    VStack(spacing: 12) {
                        // Search bar
                        HStack(spacing: 10) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(Color.theme.primary.opacity(0.6))

                            TextField("Search sessions...", text: $sessionsViewModel.searchText)
                                .textFieldStyle(.plain)

                            if !sessionsViewModel.searchText.isEmpty {
                                Button {
                                    sessionsViewModel.searchText = ""
                                } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background {
                            RoundedRectangle(cornerRadius: 14)
                                .fill(.ultraThinMaterial)
                                .shadow(color: .black.opacity(0.04), radius: 4, y: 2)
                        }
                        .overlay {
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color(.separator).opacity(0.3), lineWidth: 1)
                        }

                        // Filter chips
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(SessionsViewModel.SessionFilter.allCases, id: \.self) { filter in
                                    FilterChip(
                                        title: filter.rawValue,
                                        icon: filter.icon,
                                        isSelected: sessionsViewModel.selectedFilter == filter
                                    ) {
                                        withAnimation(.spring(response: 0.3)) {
                                            sessionsViewModel.selectedFilter = filter
                                        }
                                    }
                                }

                                Divider()
                                    .frame(height: 24)

                                // Sort menu
                                Menu {
                                    ForEach(SessionsViewModel.SortOrder.allCases, id: \.self) { order in
                                        Button {
                                            sessionsViewModel.sortOrder = order
                                        } label: {
                                            HStack {
                                                Text(order.rawValue)
                                                if sessionsViewModel.sortOrder == order {
                                                    Image(systemName: "checkmark")
                                                }
                                            }
                                        }
                                    }
                                } label: {
                                    HStack(spacing: 4) {
                                        Image(systemName: "arrow.up.arrow.down")
                                        Text("Sort")
                                    }
                                    .font(.subheadline.weight(.medium))
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 8)
                                    .background {
                                        Capsule()
                                            .fill(.ultraThinMaterial)
                                    }
                                    .overlay {
                                        Capsule()
                                            .stroke(Color(.separator).opacity(0.3), lineWidth: 1)
                                    }
                                }
                            }
                        }
                    }
                    .padding()

                    // Sessions list
                    if sessionsViewModel.isLoading {
                        ScrollView {
                            LoadingSessionsView()
                                .padding()
                        }
                    } else if sessionsViewModel.filteredSessions.isEmpty {
                        Spacer()
                        emptyStateView
                        Spacer()
                    } else {
                        sessionsList
                    }
                }
            }
            .navigationTitle("Library")
            .refreshable {
                await sessionsViewModel.refreshSessions()
            }
            .alert("Delete Session", isPresented: $showingDeleteAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    if let session = sessionToDelete {
                        Task {
                            await sessionsViewModel.deleteSession(session)
                        }
                    }
                }
            } message: {
                Text("Are you sure you want to delete this session? This action cannot be undone.")
            }
        }
    }

    private var sessionsList: some View {
        ScrollView {
            LazyVStack(spacing: 10) {
                ForEach(sessionsViewModel.filteredSessions) { session in
                    NavigationLink(value: session) {
                        SessionListItem(session: session)
                            .contextMenu {
                                Button {
                                    Task {
                                        await sessionsViewModel.toggleFavorite(session)
                                    }
                                } label: {
                                    Label(
                                        session.isFavorite == true ? "Remove from Favorites" : "Add to Favorites",
                                        systemImage: session.isFavorite == true ? "star.slash" : "star"
                                    )
                                }

                                if session.status == .ready {
                                    Button {
                                        // Share functionality
                                    } label: {
                                        Label("Share", systemImage: "square.and.arrow.up")
                                    }
                                }

                                Divider()

                                Button(role: .destructive) {
                                    sessionToDelete = session
                                    showingDeleteAlert = true
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
            .padding(.bottom)
        }
        .navigationDestination(for: Session.self) { session in
            InsightsView(session: session)
                .environmentObject(sessionsViewModel)
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.theme.primary.opacity(0.1))
                    .frame(width: 80, height: 80)

                Image(systemName: sessionsViewModel.selectedFilter == .favorites ? "star.slash" : "doc.text.magnifyingglass")
                    .font(.system(size: 32))
                    .foregroundStyle(LinearGradient.primaryGradient)
            }

            VStack(spacing: 4) {
                Text(emptyStateTitle)
                    .font(.headline)

                Text(emptyStateMessage)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(32)
    }

    private var emptyStateTitle: String {
        if !sessionsViewModel.searchText.isEmpty {
            return "No results found"
        }
        switch sessionsViewModel.selectedFilter {
        case .favorites:
            return "No favorites yet"
        case .ready:
            return "No completed sessions"
        case .processing:
            return "No sessions processing"
        default:
            return "No sessions yet"
        }
    }

    private var emptyStateMessage: String {
        if !sessionsViewModel.searchText.isEmpty {
            return "Try adjusting your search or filters"
        }
        switch sessionsViewModel.selectedFilter {
        case .favorites:
            return "Star sessions to add them to your favorites"
        default:
            return "Start a new recording to begin"
        }
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.caption.weight(.medium))

                Text(title)
                    .font(.subheadline.weight(.medium))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background {
                if isSelected {
                    Capsule()
                        .fill(LinearGradient.primaryGradient)
                        .shadow(color: Color.theme.primary.opacity(0.3), radius: 4, y: 2)
                } else {
                    Capsule()
                        .fill(.ultraThinMaterial)
                }
            }
            .overlay {
                if !isSelected {
                    Capsule()
                        .stroke(Color(.separator).opacity(0.3), lineWidth: 1)
                }
            }
            .foregroundColor(isSelected ? .white : .primary)
        }
    }
}

// MARK: - Session List Item
struct SessionListItem: View {
    let session: Session

    var body: some View {
        HStack(spacing: 14) {
            // Status icon with gradient
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(statusGradient)
                    .frame(width: 52, height: 52)

                Image(systemName: session.status.icon)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    Text(session.displayTitle)
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)

                    if session.isFavorite == true {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundColor(.yellow)
                    }
                }

                HStack(spacing: 10) {
                    Label(session.formattedDate, systemImage: "calendar")

                    if session.duration != nil {
                        Label(session.formattedDuration, systemImage: "clock")
                    }

                    if let type = session.settings.sessionType {
                        Label(type.capitalized, systemImage: "tag")
                    }
                }
                .font(.caption)
                .foregroundColor(.secondary)

                if let insights = session.analysisResult?.insights, !insights.isEmpty {
                    Text("\(insights.count) insights")
                        .font(.caption2.weight(.semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(LinearGradient.primaryGradient)
                        .clipShape(Capsule())
                }
            }

            Spacer()

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
        case .recording: return .roseOrange
        case .uploading: return LinearGradient(colors: [Color.theme.warning, Color.theme.orange], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .processing: return .indigoPurple
        case .ready: return .emeraldCyan
        case .failed: return .errorGradient
        }
    }
}

#Preview {
    LibraryView()
        .environmentObject(SessionsViewModel())
}
