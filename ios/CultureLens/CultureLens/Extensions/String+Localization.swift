//
//  String+Localization.swift
//  CultureLens
//
//  String extensions for localization support
//

import Foundation

extension String {
    /// Returns localized string using the key
    var localized: String {
        NSLocalizedString(self, comment: "")
    }

    /// Returns localized string with format arguments
    func localized(with arguments: CVarArg...) -> String {
        String(format: self.localized, arguments: arguments)
    }

    /// Returns localized string with plural support
    func localizedPlural(count: Int) -> String {
        String.localizedStringWithFormat(self.localized, count)
    }
}

// MARK: - Localization Keys

enum L10n {
    // MARK: - Common
    enum Common {
        static let cancel = "common.cancel".localized
        static let done = "common.done".localized
        static let save = "common.save".localized
        static let delete = "common.delete".localized
        static let edit = "common.edit".localized
        static let share = "common.share".localized
        static let loading = "common.loading".localized
        static let error = "common.error".localized
        static let success = "common.success".localized
        static let retry = "common.retry".localized
        static let ok = "common.ok".localized
    }

    // MARK: - Tabs
    enum Tabs {
        static let home = "tabs.home".localized
        static let record = "tabs.record".localized
        static let library = "tabs.library".localized
        static let settings = "tabs.settings".localized
    }

    // MARK: - Auth
    enum Auth {
        static let signIn = "auth.signIn".localized
        static let signUp = "auth.signUp".localized
        static let signOut = "auth.signOut".localized
        static let signInWithGoogle = "auth.signInWithGoogle".localized
        static let email = "auth.email".localized
        static let password = "auth.password".localized
        static let forgotPassword = "auth.forgotPassword".localized
        static let createAccount = "auth.createAccount".localized
        static let welcomeBack = "auth.welcomeBack".localized
        static let getStarted = "auth.getStarted".localized

        static func welcome(name: String) -> String {
            "home.welcome".localized(with: name)
        }
    }

    // MARK: - Recording
    enum Record {
        static let title = "record.title".localized
        static let startSession = "record.startSession".localized
        static let endSession = "record.endSession".localized
        static let consent = "record.consent".localized
        static let ready = "record.ready".localized
        static let listening = "record.listening".localized
        static let speaking = "record.speaking".localized
        static let tapToSpeak = "record.tapToSpeak".localized
        static let speakNaturally = "record.speakNaturally".localized
        static let pleaseWait = "record.pleaseWait".localized
        static let connected = "record.connected".localized
        static let connecting = "record.connecting".localized
        static let disconnected = "record.disconnected".localized
    }

    // MARK: - Library
    enum Library {
        static let title = "library.title".localized
        static let all = "library.all".localized
        static let favorites = "library.favorites".localized
        static let search = "library.search".localized
        static let noResults = "library.noResults".localized
        static let empty = "library.empty".localized
    }

    // MARK: - Insights
    enum Insights {
        static let title = "insights.title".localized
        static let overview = "insights.overview".localized
        static let patterns = "insights.patterns".localized
        static let transcript = "insights.transcript".localized
        static let metrics = "insights.metrics".localized
        static let summary = "insights.summary".localized
        static let keyInsights = "insights.keyInsights".localized
        static let noAnalysis = "insights.noAnalysis".localized
        static let showMore = "insights.showMore".localized
        static let showLess = "insights.showLess".localized
    }

    // MARK: - Settings
    enum Settings {
        static let title = "settings.title".localized
        static let account = "settings.account".localized
        static let profile = "settings.profile".localized
        static let notifications = "settings.notifications".localized
        static let appearance = "settings.appearance".localized
        static let theme = "settings.theme".localized
        static let system = "settings.system".localized
        static let light = "settings.light".localized
        static let dark = "settings.dark".localized
        static let about = "settings.about".localized
        static let version = "settings.version".localized
        static let deleteAccount = "settings.deleteAccount".localized
    }

    // MARK: - Errors
    enum Error {
        static let network = "error.network".localized
        static let auth = "error.auth".localized
        static let invalidCredentials = "error.invalidCredentials".localized
        static let emailInUse = "error.emailInUse".localized
        static let weakPassword = "error.weakPassword".localized
        static let tokenExpired = "error.tokenExpired".localized
        static let microphonePermission = "error.microphonePermission".localized
        static let sessionFailed = "error.sessionFailed".localized
        static let analysisFailed = "error.analysisFailed".localized
    }
}
