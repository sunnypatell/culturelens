//
//  Color+Theme.swift
//  CultureLens
//
//  Design system colors matching the web app's Tailwind theme
//

import SwiftUI

extension Color {
    // MARK: - Theme Namespace
    static let theme = ThemeColors()

    struct ThemeColors {
        // Primary colors (matching Tailwind indigo)
        let primary = Color(hex: "#6366f1")
        let primaryLight = Color(hex: "#818cf8")
        let primaryDark = Color(hex: "#4f46e5")

        // Accent colors (matching Tailwind violet)
        let accent = Color(hex: "#8b5cf6")
        let accentLight = Color(hex: "#a78bfa")
        let accentDark = Color(hex: "#7c3aed")

        // Semantic colors
        let success = Color(hex: "#22c55e")
        let warning = Color(hex: "#f59e0b")
        let error = Color(hex: "#ef4444")
        let info = Color(hex: "#3b82f6")

        // Webapp gradient palette
        let rose = Color(hex: "#f43f5e")
        let orange = Color(hex: "#fb923c")
        let emerald = Color(hex: "#10b981")
        let cyan = Color(hex: "#06b6d4")
        let teal = Color(hex: "#14b8a6")
        let pink = Color(hex: "#ec4899")
        let amber = Color(hex: "#f59e0b")
        let magenta = Color(hex: "#d946ef")

        // Background colors
        let background = Color(uiColor: .systemBackground)
        let secondaryBackground = Color(uiColor: .secondarySystemBackground)
        let tertiaryBackground = Color(uiColor: .tertiarySystemBackground)

        // Text colors
        let text = Color(uiColor: .label)
        let secondaryText = Color(uiColor: .secondaryLabel)
        let tertiaryText = Color(uiColor: .tertiaryLabel)

        // Border colors
        let border = Color(uiColor: .separator)
        let divider = Color(uiColor: .opaqueSeparator)

        // Card colors
        let cardBackground = Color(uiColor: .secondarySystemBackground)
        let cardBorder = Color(uiColor: .separator).opacity(0.5)

        // Orb visualization colors
        let orbPrimary = Color(hex: "#6366f1")
        let orbSecondary = Color(hex: "#8b5cf6")
        let orbGlow = Color(hex: "#6366f1").opacity(0.4)
    }
}

// MARK: - Hex Color Initializer
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)

        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Gradient Presets
extension LinearGradient {
    static let primaryGradient = LinearGradient(
        colors: [Color.theme.primary, Color.theme.accent],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let accentGradient = LinearGradient(
        colors: [Color.theme.accent, Color.theme.primary],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let successGradient = LinearGradient(
        colors: [Color.theme.success, Color.theme.success.opacity(0.8)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let errorGradient = LinearGradient(
        colors: [Color.theme.error, Color.theme.error.opacity(0.8)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let orbGradient = LinearGradient(
        colors: [Color.theme.orbPrimary, Color.theme.orbSecondary],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    // Webapp gradient cards
    static let indigoPurple = LinearGradient(
        colors: [Color(hex: "#6366f1"), Color(hex: "#8b5cf6")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let purpleMagenta = LinearGradient(
        colors: [Color(hex: "#8b5cf6"), Color(hex: "#d946ef")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let roseOrange = LinearGradient(
        colors: [Color(hex: "#f43f5e"), Color(hex: "#fb923c")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let emeraldCyan = LinearGradient(
        colors: [Color(hex: "#10b981"), Color(hex: "#06b6d4")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let pinkRose = LinearGradient(
        colors: [Color(hex: "#ec4899"), Color(hex: "#f43f5e")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let tealCyan = LinearGradient(
        colors: [Color(hex: "#14b8a6"), Color(hex: "#06b6d4")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}
