//
//  AuthService.swift
//  CultureLens
//
//  Firebase Authentication wrapper
//

import Foundation
import FirebaseAuth
import GoogleSignIn
import FirebaseCore

// MARK: - Auth Service
@MainActor
final class AuthService: ObservableObject {
    // MARK: - Singleton
    static let shared = AuthService()

    // MARK: - Published Properties
    @Published private(set) var currentUser: FirebaseAuth.User?
    @Published private(set) var isAuthenticated: Bool = false
    @Published private(set) var isLoading: Bool = true

    // MARK: - Private Properties
    private var authStateHandle: AuthStateDidChangeListenerHandle?
    private let keychain = KeychainService.shared

    // MARK: - Initialization
    private init() {
        setupAuthStateListener()
        setupAPIClientTokenProvider()
    }

    deinit {
        if let handle = authStateHandle {
            Auth.auth().removeStateDidChangeListener(handle)
        }
    }

    // MARK: - Auth State Listener
    private func setupAuthStateListener() {
        authStateHandle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                self?.currentUser = user
                self?.isAuthenticated = user != nil
                self?.isLoading = false

                if let user = user {
                    try? self?.keychain.save(user.uid, forKey: .userId)
                    print("[Auth] User signed in: \(user.uid)")
                } else {
                    try? self?.keychain.clearAll()
                    print("[Auth] User signed out")
                }
            }
        }
    }

    // MARK: - API Client Token Provider
    private func setupAPIClientTokenProvider() {
        Task {
            await APIClient.shared.tokenProvider = { [weak self] in
                await self?.getIdToken()
            }
        }
    }

    // MARK: - Get ID Token
    func getIdToken() async -> String? {
        guard let user = currentUser else { return nil }

        do {
            let token = try await user.getIDToken()
            return token
        } catch {
            print("[Auth] Failed to get ID token: \(error)")
            return nil
        }
    }

    // MARK: - Sign In with Email
    func signIn(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            let result = try await Auth.auth().signIn(withEmail: email, password: password)
            currentUser = result.user
            isAuthenticated = true
        } catch let error as NSError {
            throw mapFirebaseError(error)
        }
    }

    // MARK: - Create Account
    func createAccount(email: String, password: String, displayName: String?) async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            let result = try await Auth.auth().createUser(withEmail: email, password: password)

            // Update display name if provided
            if let displayName = displayName {
                let changeRequest = result.user.createProfileChangeRequest()
                changeRequest.displayName = displayName
                try await changeRequest.commitChanges()
            }

            currentUser = result.user
            isAuthenticated = true
        } catch let error as NSError {
            throw mapFirebaseError(error)
        }
    }

    // MARK: - Sign In with Google
    func signInWithGoogle(presenting viewController: UIViewController) async throws {
        isLoading = true
        defer { isLoading = false }

        guard let clientID = FirebaseApp.app()?.options.clientID else {
            throw AuthError.unknown("Missing Firebase client ID")
        }

        let config = GIDConfiguration(clientID: clientID)
        GIDSignIn.sharedInstance.configuration = config

        do {
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: viewController)

            guard let idToken = result.user.idToken?.tokenString else {
                throw AuthError.unknown("Missing Google ID token")
            }

            let credential = GoogleAuthProvider.credential(
                withIDToken: idToken,
                accessToken: result.user.accessToken.tokenString
            )

            let authResult = try await Auth.auth().signIn(with: credential)
            currentUser = authResult.user
            isAuthenticated = true
        } catch let error as NSError {
            throw mapFirebaseError(error)
        }
    }

    // MARK: - Send Password Reset
    func sendPasswordReset(email: String) async throws {
        do {
            try await Auth.auth().sendPasswordReset(withEmail: email)
        } catch let error as NSError {
            throw mapFirebaseError(error)
        }
    }

    // MARK: - Sign Out
    func signOut() throws {
        do {
            try Auth.auth().signOut()
            try GIDSignIn.sharedInstance.signOut()
            try keychain.clearAll()
            currentUser = nil
            isAuthenticated = false
        } catch {
            throw AuthError.unknown(error.localizedDescription)
        }
    }

    // MARK: - Delete Account
    func deleteAccount() async throws {
        guard let user = currentUser else {
            throw AuthError.unknown("No user signed in")
        }

        do {
            // Delete from backend first
            try await APIClient.shared.deleteAccount()

            // Then delete from Firebase
            try await user.delete()
            try keychain.clearAll()
            currentUser = nil
            isAuthenticated = false
        } catch let error as NSError {
            throw mapFirebaseError(error)
        }
    }

    // MARK: - Update Profile
    func updateProfile(displayName: String?, photoURL: URL?) async throws {
        guard let user = currentUser else {
            throw AuthError.unknown("No user signed in")
        }

        let changeRequest = user.createProfileChangeRequest()

        if let displayName = displayName {
            changeRequest.displayName = displayName
        }

        if let photoURL = photoURL {
            changeRequest.photoURL = photoURL
        }

        try await changeRequest.commitChanges()

        // Sync to backend
        try await APIClient.shared.updateProfile(update: ProfileUpdateRequest(
            displayName: displayName,
            photoURL: photoURL?.absoluteString
        ))
    }

    // MARK: - Error Mapping
    private func mapFirebaseError(_ error: NSError) -> AuthError {
        let code = AuthErrorCode(rawValue: error.code)

        switch code {
        case .wrongPassword, .invalidEmail, .userNotFound:
            return .invalidCredentials
        case .emailAlreadyInUse:
            return .emailAlreadyInUse
        case .weakPassword:
            return .weakPassword
        case .networkError:
            return .networkError
        case .userTokenExpired:
            return .tokenExpired
        default:
            return .unknown(error.localizedDescription)
        }
    }
}

// MARK: - User Properties Extension
extension AuthService {
    var userId: String? {
        currentUser?.uid
    }

    var userEmail: String? {
        currentUser?.email
    }

    var userDisplayName: String? {
        currentUser?.displayName
    }

    var userPhotoURL: URL? {
        currentUser?.photoURL
    }

    func toUser() -> User? {
        guard let firebaseUser = currentUser else { return nil }

        return User(
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL?.absoluteString,
            organization: nil,
            createdAt: firebaseUser.metadata.creationDate?.ISO8601Format(),
            lastLoginAt: firebaseUser.metadata.lastSignInDate?.ISO8601Format(),
            settings: nil
        )
    }
}
