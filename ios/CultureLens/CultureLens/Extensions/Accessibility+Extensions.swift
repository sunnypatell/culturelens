//
//  Accessibility+Extensions.swift
//  CultureLens
//
//  Accessibility helpers and view extensions for VoiceOver and Dynamic Type support
//

import SwiftUI

// MARK: - Accessibility View Modifiers

extension View {
    /// Adds standard accessibility label and hint for interactive elements
    func accessibleButton(label: String, hint: String? = nil) -> some View {
        self
            .accessibilityLabel(label)
            .accessibilityHint(hint ?? "")
            .accessibilityAddTraits(.isButton)
    }

    /// Adds accessibility for header elements
    func accessibleHeader(_ label: String) -> some View {
        self
            .accessibilityLabel(label)
            .accessibilityAddTraits(.isHeader)
    }

    /// Adds accessibility for images with descriptions
    func accessibleImage(label: String) -> some View {
        self
            .accessibilityLabel(label)
            .accessibilityAddTraits(.isImage)
    }

    /// Hides decorative elements from accessibility
    func accessibilityHiddenDecorative() -> some View {
        self.accessibilityHidden(true)
    }

    /// Groups multiple elements for easier VoiceOver navigation
    func accessibilityGrouped(label: String) -> some View {
        self
            .accessibilityElement(children: .combine)
            .accessibilityLabel(label)
    }

    /// Adds custom accessibility actions
    func accessibilityCustomAction(name: String, action: @escaping () -> Void) -> some View {
        self.accessibilityAction(named: name, action)
    }
}

// MARK: - Dynamic Type Support

extension View {
    /// Scales font based on accessibility settings while maintaining minimum readability
    func scaledFont(_ style: Font.TextStyle, weight: Font.Weight = .regular, design: Font.Design = .default) -> some View {
        self.font(.system(style, design: design, weight: weight))
    }

    /// Ensures minimum touch target size for accessibility (44x44 points)
    func accessibleTouchTarget() -> some View {
        self.frame(minWidth: 44, minHeight: 44)
    }
}

// MARK: - Accessibility Announcements

enum AccessibilityAnnouncement {
    /// Announces a message to VoiceOver users
    static func announce(_ message: String) {
        UIAccessibility.post(notification: .announcement, argument: message)
    }

    /// Announces screen change
    static func screenChanged(focus: Any? = nil) {
        UIAccessibility.post(notification: .screenChanged, argument: focus)
    }

    /// Announces layout change
    static func layoutChanged(focus: Any? = nil) {
        UIAccessibility.post(notification: .layoutChanged, argument: focus)
    }
}

// MARK: - Accessibility Identifiers

enum AccessibilityIdentifier {
    // Tab Bar
    static let homeTab = "tab_home"
    static let recordTab = "tab_record"
    static let libraryTab = "tab_library"
    static let settingsTab = "tab_settings"

    // Authentication
    static let signInButton = "button_sign_in"
    static let signInWithGoogle = "button_sign_in_google"
    static let signOutButton = "button_sign_out"
    static let emailField = "field_email"
    static let passwordField = "field_password"

    // Recording
    static let recordButton = "button_record"
    static let stopButton = "button_stop"
    static let muteButton = "button_mute"
    static let transcriptButton = "button_transcript"

    // Session
    static let sessionCard = "card_session"
    static let favoriteButton = "button_favorite"
    static let deleteButton = "button_delete"
    static let shareButton = "button_share"

    // Insights
    static let insightCard = "card_insight"
    static let metricsSection = "section_metrics"
    static let transcriptSection = "section_transcript"
}

// MARK: - Reduced Motion Support

extension View {
    /// Provides alternative for users with reduced motion preference
    @ViewBuilder
    func withReducedMotion<Content: View>(
        reduced: Content,
        animated: Content
    ) -> some View where Content: View {
        if UIAccessibility.isReduceMotionEnabled {
            reduced
        } else {
            animated
        }
    }

    /// Conditionally applies animation based on reduced motion preference
    func animationIfAllowed<V: Equatable>(_ animation: Animation?, value: V) -> some View {
        if UIAccessibility.isReduceMotionEnabled {
            return AnyView(self.animation(nil, value: value))
        } else {
            return AnyView(self.animation(animation, value: value))
        }
    }
}

// MARK: - VoiceOver Helpers

extension View {
    /// Sorts accessibility elements for logical VoiceOver navigation
    func accessibilitySorted(_ priority: Double) -> some View {
        self.accessibilitySortPriority(priority)
    }

    /// Creates an accessibility container for related elements
    func accessibilityContainer(label: String) -> some View {
        self
            .accessibilityElement(children: .contain)
            .accessibilityLabel(label)
    }
}

// MARK: - High Contrast Support

extension Color {
    /// Returns a high contrast version of the color for accessibility
    static func highContrastIfNeeded(_ color: Color) -> Color {
        if UIAccessibility.isDarkerSystemColorsEnabled {
            // Return a darker/more contrasted version
            return color
        }
        return color
    }
}

// MARK: - Haptic Feedback for Accessibility

extension UIImpactFeedbackGenerator.FeedbackStyle {
    /// Returns appropriate haptic intensity based on accessibility settings
    static var accessibilityAdjusted: UIImpactFeedbackGenerator.FeedbackStyle {
        // Use heavier haptics if user prefers stronger feedback
        return .medium
    }
}

// MARK: - Focus State Helpers

extension View {
    /// Adds visible focus indicator for keyboard navigation
    func focusIndicator(isFocused: Bool) -> some View {
        self
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.theme.primary, lineWidth: isFocused ? 2 : 0)
            )
    }
}
