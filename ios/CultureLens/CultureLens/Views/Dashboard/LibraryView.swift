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
            VStack(spacing: 0) {
                // Search and filters
                VStack(spacing: 12) {
                    // Search bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.secondary)

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
                    .padding(12)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Filter chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(SessionsViewModel.SessionFilter.allCases, id: \.self) { filter in
                                FilterChip(
                                    title: filter.rawValue,
                                    icon: filter.icon,
                                    isSelected: sessionsViewModel.selectedFilter == filter
                                ) {
                                    withAnimation {
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
                                .font(.subheadline)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color(.systemGray6))
                                .clipShape(Capsule())
                            }
                        }
                    }
                }
                .padding()
                .background(Color.theme.background)

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
            .background(Color.theme.background)
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
            LazyVStack(spacing: 12) {
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
            .padding()
        }
        .navigationDestination(for: Session.self) { session in
            InsightsView(session: session)
                .environmentObject(sessionsViewModel)
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: sessionsViewModel.selectedFilter == .favorites ? "star.slash" : "doc.text.magnifyingglass")
                .font(.system(size: 48))
                .foregroundColor(.secondary)

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
                    .font(.caption)

                Text(title)
                    .font(.subheadline)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(isSelected ? Color.theme.primary : Color(.systemGray6))
            .foregroundColor(isSelected ? .white : .primary)
            .clipShape(Capsule())
        }
    }
}

// MARK: - Session List Item
struct SessionListItem: View {
    let session: Session

    var body: some View {
        HStack(spacing: 16) {
            // Status icon
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(statusColor.opacity(0.15))
                    .frame(width: 56, height: 56)

                Image(systemName: session.status.icon)
                    .font(.title2)
                    .foregroundColor(statusColor)
            }

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(session.displayTitle)
                        .font(.headline)
                        .lineLimit(1)

                    if session.isFavorite == true {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundColor(.yellow)
                    }
                }

                HStack(spacing: 12) {
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

                // Insights count if available
                if let insights = session.analysisResult?.insights, !insights.isEmpty {
                    Text("\(insights.count) insights")
                        .font(.caption2)
                        .foregroundColor(Color.theme.primary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.theme.primary.opacity(0.1))
                        .clipShape(Capsule())
                }
            }

            Spacer()

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
        case .recording: return .red
        case .uploading: return .orange
        case .processing: return .blue
        case .ready: return .green
        case .failed: return .red
        }
    }
}

#Preview {
    LibraryView()
        .environmentObject(SessionsViewModel())
}
