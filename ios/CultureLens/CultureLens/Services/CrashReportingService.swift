//
//  CrashReportingService.swift
//  CultureLens
//
//  Firebase Crashlytics integration for crash reporting and analytics
//

import Foundation
import FirebaseCrashlytics

// MARK: - Crash Reporting Service

final class CrashReportingService {
    // MARK: - Singleton
    static let shared = CrashReportingService()

    private let crashlytics = Crashlytics.crashlytics()

    private init() {
        #if DEBUG
        // Disable crash reporting in debug builds
        crashlytics.setCrashlyticsCollectionEnabled(false)
        #else
        crashlytics.setCrashlyticsCollectionEnabled(true)
        #endif
    }

    // MARK: - User Identification

    /// Sets the user ID for crash reports
    func setUser(id: String?) {
        if let id = id {
            crashlytics.setUserID(id)
            log("User ID set: \(id.prefix(8))...")
        } else {
            crashlytics.setUserID("")
            log("User ID cleared")
        }
    }

    // MARK: - Custom Keys

    /// Sets a custom key-value pair for crash reports
    func setCustomValue(_ value: Any, forKey key: String) {
        crashlytics.setCustomValue(value, forKey: key)
    }

    /// Sets multiple custom key-value pairs
    func setCustomValues(_ values: [String: Any]) {
        for (key, value) in values {
            crashlytics.setCustomValue(value, forKey: key)
        }
    }

    // MARK: - Logging

    /// Logs a message to Crashlytics
    func log(_ message: String) {
        crashlytics.log(message)
        #if DEBUG
        print("[Crashlytics] \(message)")
        #endif
    }

    /// Logs an event with optional parameters
    func logEvent(_ name: String, parameters: [String: Any]? = nil) {
        var logMessage = "Event: \(name)"
        if let params = parameters {
            logMessage += " - \(params)"
        }
        log(logMessage)
    }

    // MARK: - Error Recording

    /// Records a non-fatal error
    func recordError(_ error: Error, userInfo: [String: Any]? = nil) {
        let nsError: NSError
        if let error = error as NSError? {
            nsError = error
        } else {
            nsError = NSError(
                domain: String(describing: type(of: error)),
                code: -1,
                userInfo: userInfo
            )
        }

        crashlytics.record(error: nsError)

        #if DEBUG
        print("[Crashlytics] Recorded error: \(error.localizedDescription)")
        #endif
    }

    /// Records an error with custom keys
    func recordError(
        _ error: Error,
        file: String = #file,
        function: String = #function,
        line: Int = #line
    ) {
        setCustomValue(file, forKey: "error_file")
        setCustomValue(function, forKey: "error_function")
        setCustomValue(line, forKey: "error_line")

        recordError(error)
    }

    // MARK: - Breadcrumbs

    /// Adds a breadcrumb for debugging
    func addBreadcrumb(_ breadcrumb: String) {
        log("Breadcrumb: \(breadcrumb)")
    }

    // MARK: - Screen Tracking

    /// Tracks screen views
    func trackScreen(_ screenName: String) {
        setCustomValue(screenName, forKey: "current_screen")
        log("Screen: \(screenName)")
    }

    // MARK: - Session Tracking

    /// Tracks session-related events
    func trackSessionEvent(_ event: SessionEvent) {
        switch event {
        case .started(let sessionId):
            setCustomValue(sessionId, forKey: "active_session_id")
            log("Session started: \(sessionId)")

        case .ended(let sessionId, let duration):
            log("Session ended: \(sessionId), duration: \(duration)ms")
            setCustomValue("", forKey: "active_session_id")

        case .recordingStarted:
            log("Recording started")

        case .recordingStopped:
            log("Recording stopped")

        case .analysisFailed(let sessionId, let error):
            setCustomValue(sessionId, forKey: "failed_session_id")
            recordError(error)
        }
    }

    // MARK: - Auth Tracking

    /// Tracks authentication events
    func trackAuthEvent(_ event: AuthEvent) {
        switch event {
        case .signedIn(let method):
            log("User signed in via \(method)")

        case .signedOut:
            log("User signed out")
            setUser(id: nil)

        case .signInFailed(let method, let error):
            log("Sign in failed via \(method): \(error.localizedDescription)")
            recordError(error)

        case .accountCreated:
            log("New account created")

        case .accountDeleted:
            log("Account deleted")
        }
    }

    // MARK: - API Tracking

    /// Tracks API request errors
    func trackAPIError(endpoint: String, statusCode: Int?, error: Error?) {
        setCustomValue(endpoint, forKey: "api_endpoint")
        if let statusCode = statusCode {
            setCustomValue(statusCode, forKey: "api_status_code")
        }

        if let error = error {
            recordError(error)
        }

        log("API Error: \(endpoint) - Status: \(statusCode ?? -1)")
    }
}

// MARK: - Event Types

extension CrashReportingService {
    enum SessionEvent {
        case started(sessionId: String)
        case ended(sessionId: String, duration: Int)
        case recordingStarted
        case recordingStopped
        case analysisFailed(sessionId: String, error: Error)
    }

    enum AuthEvent {
        case signedIn(method: String)
        case signedOut
        case signInFailed(method: String, error: Error)
        case accountCreated
        case accountDeleted
    }
}

// MARK: - Global Convenience Functions

/// Logs a message to Crashlytics
func crashLog(_ message: String) {
    CrashReportingService.shared.log(message)
}

/// Records an error to Crashlytics
func crashRecord(_ error: Error, file: String = #file, function: String = #function, line: Int = #line) {
    CrashReportingService.shared.recordError(error, file: file, function: function, line: line)
}
