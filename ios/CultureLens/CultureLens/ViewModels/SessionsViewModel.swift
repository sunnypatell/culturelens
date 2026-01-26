//
//  SessionsViewModel.swift
//  CultureLens
//
//  View model for managing sessions list and CRUD operations
//

import SwiftUI
import Combine

@MainActor
final class SessionsViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var sessions: [Session] = []
    @Published var filteredSessions: [Session] = []
    @Published var isLoading: Bool = false
    @Published var isRefreshing: Bool = false
    @Published var errorMessage: String?
    @Published var showError: Bool = false

    // Filters
    @Published var searchText: String = ""
    @Published var selectedFilter: SessionFilter = .all
    @Published var sortOrder: SortOrder = .newest

    // Stats
    @Published var stats: SessionStats = SessionStats()

    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Types
    enum SessionFilter: String, CaseIterable {
        case all = "All"
        case favorites = "Favorites"
        case ready = "Completed"
        case processing = "Processing"

        var icon: String {
            switch self {
            case .all: return "square.grid.2x2"
            case .favorites: return "star.fill"
            case .ready: return "checkmark.circle.fill"
            case .processing: return "clock.fill"
            }
        }
    }

    enum SortOrder: String, CaseIterable {
        case newest = "Newest First"
        case oldest = "Oldest First"
        case duration = "Duration"
        case title = "Title"
    }

    struct SessionStats {
        var totalSessions: Int = 0
        var thisMonth: Int = 0
        var totalInsights: Int = 0
        var totalDurationMs: Int = 0

        var formattedTotalDuration: String {
            let hours = totalDurationMs / 3600000
            let minutes = (totalDurationMs % 3600000) / 60000
            if hours > 0 {
                return "\(hours)h \(minutes)m"
            }
            return "\(minutes)m"
        }
    }

    // MARK: - Initialization
    init() {
        setupBindings()
    }

    // MARK: - Bindings
    private func setupBindings() {
        // Combine search, filter, and sort to update filtered sessions
        Publishers.CombineLatest4(
            $sessions,
            $searchText.debounce(for: .milliseconds(300), scheduler: DispatchQueue.main),
            $selectedFilter,
            $sortOrder
        )
        .sink { [weak self] sessions, search, filter, sort in
            self?.applyFilters(sessions: sessions, search: search, filter: filter, sort: sort)
        }
        .store(in: &cancellables)

        // Update stats when sessions change
        $sessions
            .sink { [weak self] sessions in
                self?.calculateStats(sessions: sessions)
            }
            .store(in: &cancellables)
    }

    // MARK: - Filtering
    private func applyFilters(
        sessions: [Session],
        search: String,
        filter: SessionFilter,
        sort: SortOrder
    ) {
        var result = sessions

        // Apply status filter
        switch filter {
        case .all:
            break
        case .favorites:
            result = result.filter { $0.isFavorite == true }
        case .ready:
            result = result.filter { $0.status == .ready }
        case .processing:
            result = result.filter { $0.status == .processing || $0.status == .recording }
        }

        // Apply search
        if !search.isEmpty {
            let lowercasedSearch = search.lowercased()
            result = result.filter { session in
                session.displayTitle.lowercased().contains(lowercasedSearch) ||
                (session.settings.sessionType?.lowercased().contains(lowercasedSearch) ?? false)
            }
        }

        // Apply sort
        result = result.sorted { a, b in
            switch sort {
            case .newest:
                return (a.createdDate ?? .distantPast) > (b.createdDate ?? .distantPast)
            case .oldest:
                return (a.createdDate ?? .distantPast) < (b.createdDate ?? .distantPast)
            case .duration:
                return (a.duration ?? 0) > (b.duration ?? 0)
            case .title:
                return a.displayTitle < b.displayTitle
            }
        }

        filteredSessions = result
    }

    // MARK: - Stats Calculation
    private func calculateStats(sessions: [Session]) {
        let now = Date()
        let calendar = Calendar.current
        let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!

        let thisMonthSessions = sessions.filter { session in
            guard let date = session.createdDate else { return false }
            return date >= startOfMonth
        }

        let totalInsights = sessions.compactMap { $0.analysisResult?.insights.count }.reduce(0, +)
        let totalDuration = sessions.compactMap { $0.duration }.reduce(0, +)

        stats = SessionStats(
            totalSessions: sessions.count,
            thisMonth: thisMonthSessions.count,
            totalInsights: totalInsights,
            totalDurationMs: totalDuration
        )
    }

    // MARK: - API Methods
    func loadSessions() async {
        isLoading = true
        errorMessage = nil

        do {
            sessions = try await APIClient.shared.getSessions()
        } catch let error as APIError {
            showError(message: error.localizedDescription)
        } catch {
            showError(message: error.localizedDescription)
        }

        isLoading = false
    }

    func refreshSessions() async {
        isRefreshing = true
        await loadSessions()
        isRefreshing = false
    }

    func createSession(settings: SessionSettings) async throws -> Session {
        let consent = Consent(
            personA: true,
            personB: true,
            timestamp: ISO8601DateFormatter().string(from: Date())
        )

        let session = try await APIClient.shared.createSession(consent: consent, settings: settings)
        sessions.insert(session, at: 0)
        return session
    }

    func deleteSession(_ session: Session) async {
        do {
            try await APIClient.shared.deleteSession(id: session.id)
            sessions.removeAll { $0.id == session.id }
        } catch {
            showError(message: error.localizedDescription)
        }
    }

    func toggleFavorite(_ session: Session) async {
        do {
            let updated = try await APIClient.shared.toggleFavorite(id: session.id)
            if let index = sessions.firstIndex(where: { $0.id == session.id }) {
                sessions[index] = updated
            }
        } catch {
            showError(message: error.localizedDescription)
        }
    }

    func getSession(id: String) async -> Session? {
        do {
            return try await APIClient.shared.getSession(id: id)
        } catch {
            showError(message: error.localizedDescription)
            return nil
        }
    }

    func analyzeSession(_ session: Session) async -> AnalysisResult? {
        do {
            let result = try await APIClient.shared.analyzeSession(id: session.id)
            if let index = sessions.firstIndex(where: { $0.id == session.id }) {
                sessions[index].analysisResult = result
                sessions[index].status = .ready
            }
            return result
        } catch {
            showError(message: error.localizedDescription)
            return nil
        }
    }

    // MARK: - Helpers
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}
