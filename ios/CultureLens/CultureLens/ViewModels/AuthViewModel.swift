//
//  AuthViewModel.swift
//  CultureLens
//
//  Authentication view model for managing auth state and user actions
//

import SwiftUI
import Combine

@MainActor
final class AuthViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var authState: AuthState = .loading
    @Published var user: User?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var showError: Bool = false

    // Form fields
    @Published var email: String = ""
    @Published var password: String = ""
    @Published var confirmPassword: String = ""
    @Published var displayName: String = ""

    // MARK: - Private Properties
    private lazy var authService = AuthService.shared
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization
    init() {
        if ScreenshotMode.isActive {
            setupScreenshotMode()
        } else {
            setupBindings()
        }
    }

    // MARK: - Screenshot Mode
    private func setupScreenshotMode() {
        authState = .authenticated
        user = User(
            id: MockData.userId,
            email: "demo@culturelens.app",
            displayName: "Demo User"
        )
    }

    // MARK: - Bindings
    private func setupBindings() {
        authService.$isAuthenticated
            .combineLatest(authService.$isLoading)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isAuthenticated, isLoading in
                if isLoading {
                    self?.authState = .loading
                } else if isAuthenticated {
                    self?.authState = .authenticated
                    self?.user = self?.authService.toUser()
                } else {
                    self?.authState = .unauthenticated
                    self?.user = nil
                }
            }
            .store(in: &cancellables)
    }

    // MARK: - Validation
    var isEmailValid: Bool {
        let emailRegex = #"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
        return email.range(of: emailRegex, options: .regularExpression) != nil
    }

    var isPasswordValid: Bool {
        password.count >= 8
    }

    var doPasswordsMatch: Bool {
        password == confirmPassword
    }

    var canSignIn: Bool {
        isEmailValid && !password.isEmpty
    }

    var canCreateAccount: Bool {
        isEmailValid && isPasswordValid && doPasswordsMatch && !displayName.isEmpty
    }

    // MARK: - Sign In
    func signIn() async {
        guard canSignIn else {
            showError(message: "Please enter a valid email and password")
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            try await authService.signIn(email: email, password: password)
            clearForm()
        } catch let error as AuthError {
            showError(message: error.localizedDescription)
        } catch {
            showError(message: error.localizedDescription)
        }

        isLoading = false
    }

    // MARK: - Create Account
    func createAccount() async {
        guard canCreateAccount else {
            if !isEmailValid {
                showError(message: "Please enter a valid email address")
            } else if !isPasswordValid {
                showError(message: "Password must be at least 8 characters")
            } else if !doPasswordsMatch {
                showError(message: "Passwords do not match")
            } else if displayName.isEmpty {
                showError(message: "Please enter your name")
            }
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            try await authService.createAccount(
                email: email,
                password: password,
                displayName: displayName
            )
            clearForm()
        } catch let error as AuthError {
            showError(message: error.localizedDescription)
        } catch {
            showError(message: error.localizedDescription)
        }

        isLoading = false
    }

    // MARK: - Sign In with Google
    func signInWithGoogle() async {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            showError(message: "Unable to present Google Sign-In")
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            try await authService.signInWithGoogle(presenting: rootViewController)
            clearForm()
        } catch let error as AuthError {
            showError(message: error.localizedDescription)
        } catch {
            showError(message: error.localizedDescription)
        }

        isLoading = false
    }

    // MARK: - Sign Out
    func signOut() {
        do {
            try authService.signOut()
            clearForm()
        } catch {
            showError(message: error.localizedDescription)
        }
    }

    // MARK: - Send Password Reset
    func sendPasswordReset() async {
        guard isEmailValid else {
            showError(message: "Please enter a valid email address")
            return
        }

        isLoading = true

        do {
            try await authService.sendPasswordReset(email: email)
            showError(message: "Password reset email sent. Check your inbox.")
        } catch {
            showError(message: error.localizedDescription)
        }

        isLoading = false
    }

    // MARK: - Delete Account
    func deleteAccount() async {
        isLoading = true

        do {
            try await authService.deleteAccount()
            clearForm()
        } catch {
            showError(message: error.localizedDescription)
        }

        isLoading = false
    }

    // MARK: - Update Profile
    func updateProfile(displayName: String?, photoURL: URL?) async {
        isLoading = true

        do {
            try await authService.updateProfile(displayName: displayName, photoURL: photoURL)
            user = authService.toUser()
        } catch {
            showError(message: error.localizedDescription)
        }

        isLoading = false
    }

    // MARK: - Helpers
    private func clearForm() {
        email = ""
        password = ""
        confirmPassword = ""
        displayName = ""
    }

    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}
