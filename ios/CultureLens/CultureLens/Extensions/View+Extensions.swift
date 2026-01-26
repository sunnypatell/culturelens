//
//  View+Extensions.swift
//  CultureLens
//
//  SwiftUI View extensions for common modifiers
//

import SwiftUI

// MARK: - Card Style Modifier
extension View {
    func cardStyle() -> some View {
        self
            .padding()
            .background(Color.theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    func glassCard() -> some View {
        self
            .padding()
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Loading Overlay
extension View {
    func loadingOverlay(isLoading: Bool) -> some View {
        self.overlay {
            if isLoading {
                ZStack {
                    Color.black.opacity(0.3)
                        .ignoresSafeArea()

                    ProgressView()
                        .scaleEffect(1.5)
                        .tint(.white)
                }
            }
        }
    }
}

// MARK: - Conditional Modifier
extension View {
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}

// MARK: - Shake Animation
extension View {
    func shake(trigger: Bool) -> some View {
        self.modifier(ShakeModifier(trigger: trigger))
    }
}

struct ShakeModifier: ViewModifier {
    let trigger: Bool
    @State private var shakeOffset: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .offset(x: shakeOffset)
            .onChange(of: trigger) { _, _ in
                withAnimation(.default.repeatCount(3).speed(6)) {
                    shakeOffset = 10
                }
                withAnimation(.default.delay(0.3)) {
                    shakeOffset = 0
                }
            }
    }
}

// MARK: - Hide Keyboard
extension View {
    func hideKeyboardOnTap() -> some View {
        self.onTapGesture {
            UIApplication.shared.sendAction(
                #selector(UIResponder.resignFirstResponder),
                to: nil,
                from: nil,
                for: nil
            )
        }
    }
}

// MARK: - Navigation Bar Style
extension View {
    func primaryNavigationBar() -> some View {
        self
            .toolbarBackground(Color.theme.primary, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

// MARK: - Rounded Border
extension View {
    func roundedBorder(_ color: Color, cornerRadius: CGFloat = 12, lineWidth: CGFloat = 1) -> some View {
        self
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(color, lineWidth: lineWidth)
            )
    }
}

// MARK: - Haptic Feedback
extension View {
    func onTapWithHaptic(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium, action: @escaping () -> Void) -> some View {
        self.onTapGesture {
            let generator = UIImpactFeedbackGenerator(style: style)
            generator.impactOccurred()
            action()
        }
    }
}

// MARK: - Async Button Style
struct AsyncButtonStyle: ButtonStyle {
    let isLoading: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(isLoading ? 0 : 1)
            .overlay {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                }
            }
            .opacity(configuration.isPressed ? 0.7 : 1)
    }
}

extension ButtonStyle where Self == AsyncButtonStyle {
    static func async(isLoading: Bool) -> AsyncButtonStyle {
        AsyncButtonStyle(isLoading: isLoading)
    }
}

// MARK: - Placeholder Modifier
extension View {
    func placeholder<Content: View>(
        when shouldShow: Bool,
        alignment: Alignment = .leading,
        @ViewBuilder placeholder: () -> Content
    ) -> some View {
        ZStack(alignment: alignment) {
            placeholder().opacity(shouldShow ? 1 : 0)
            self
        }
    }
}

// MARK: - Safe Area Inset
extension View {
    func safeAreaInsetBottom(_ height: CGFloat) -> some View {
        self.safeAreaInset(edge: .bottom) {
            Color.clear.frame(height: height)
        }
    }
}
