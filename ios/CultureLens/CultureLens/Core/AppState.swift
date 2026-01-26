//
//  AppState.swift
//  CultureLens
//
//  Global app state management
//

import SwiftUI
import Combine

@MainActor
final class AppState: ObservableObject {
    // MARK: - Published Properties
    @Published var colorScheme: ColorScheme? = nil
    @Published var isOnline: Bool = true
    @Published var showingError: Bool = false
    @Published var errorMessage: String = ""
    @Published var isLoading: Bool = false

    // MARK: - App Settings
    @AppStorage(UserDefaultsKey.hasCompletedOnboarding.rawValue)
    var hasCompletedOnboarding: Bool = false

    @AppStorage(UserDefaultsKey.notificationsEnabled.rawValue)
    var notificationsEnabled: Bool = true

    @AppStorage(UserDefaultsKey.autoSaveEnabled.rawValue)
    var autoSaveEnabled: Bool = true

    // MARK: - Navigation State
    @Published var selectedTab: Tab = .home
    @Published var navigationPath = NavigationPath()

    // MARK: - Private
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Tab Definition
    enum Tab: String, CaseIterable {
        case home = "Home"
        case record = "Record"
        case library = "Library"
        case settings = "Settings"

        var icon: String {
            switch self {
            case .home: return "house.fill"
            case .record: return "mic.circle.fill"
            case .library: return "books.vertical.fill"
            case .settings: return "gearshape.fill"
            }
        }
    }

    // MARK: - Initialization
    init() {
        loadColorSchemePreference()
        setupNetworkMonitoring()
    }

    // MARK: - Color Scheme
    private func loadColorSchemePreference() {
        let preference = UserDefaults.standard.string(forKey: UserDefaultsKey.preferredColorScheme.rawValue)
        switch preference {
        case "light":
            colorScheme = .light
        case "dark":
            colorScheme = .dark
        default:
            colorScheme = nil // System default
        }
    }

    func setColorScheme(_ scheme: ColorScheme?) {
        colorScheme = scheme
        if let scheme = scheme {
            UserDefaults.standard.set(scheme == .dark ? "dark" : "light", forKey: UserDefaultsKey.preferredColorScheme.rawValue)
        } else {
            UserDefaults.standard.removeObject(forKey: UserDefaultsKey.preferredColorScheme.rawValue)
        }
    }

    // MARK: - Network Monitoring
    private func setupNetworkMonitoring() {
        // Network monitoring would be implemented here with NWPathMonitor
        // For now, assume online
        isOnline = true
    }

    // MARK: - Error Handling
    func showError(_ message: String) {
        errorMessage = message
        showingError = true

        // Auto-dismiss after 3 seconds
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
            self?.showingError = false
        }
    }

    func showError(_ error: Error) {
        showError(error.localizedDescription)
    }

    // MARK: - Loading State
    func withLoading<T>(_ operation: () async throws -> T) async throws -> T {
        isLoading = true
        defer { isLoading = false }
        return try await operation()
    }

    // MARK: - Haptic Feedback
    func triggerHaptic(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        guard Configuration.enableHaptics else { return }
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(type)
    }

    func triggerImpact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        guard Configuration.enableHaptics else { return }
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }
}
