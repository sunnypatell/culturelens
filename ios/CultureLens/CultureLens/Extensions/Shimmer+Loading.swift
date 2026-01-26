//
//  Shimmer+Loading.swift
//  CultureLens
//
//  Shimmer effect and skeleton loading views for polished UI
//

import SwiftUI

// MARK: - Shimmer Effect Modifier
struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    let animation: Animation
    let gradient: Gradient
    let bandSize: CGFloat

    init(
        animation: Animation = Animation.linear(duration: 1.5).repeatForever(autoreverses: false),
        gradient: Gradient = Gradient(colors: [
            .clear,
            Color.white.opacity(0.5),
            .clear,
        ]),
        bandSize: CGFloat = 0.3
    ) {
        self.animation = animation
        self.gradient = gradient
        self.bandSize = bandSize
    }

    func body(content: Content) -> some View {
        content
            .overlay(
                GeometryReader { geometry in
                    let width = geometry.size.width
                    let movementDistance = width + width * bandSize

                    LinearGradient(
                        gradient: gradient,
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: width * bandSize)
                    .offset(x: -width * bandSize + phase * movementDistance)
                    .animation(animation, value: phase)
                }
                .mask(content)
            )
            .onAppear {
                phase = 1
            }
    }
}

extension View {
    /// Applies a shimmer effect to the view
    func shimmer(
        animation: Animation = Animation.linear(duration: 1.5).repeatForever(autoreverses: false),
        gradient: Gradient = Gradient(colors: [.clear, Color.white.opacity(0.5), .clear]),
        bandSize: CGFloat = 0.3
    ) -> some View {
        modifier(ShimmerModifier(animation: animation, gradient: gradient, bandSize: bandSize))
    }

    /// Applies a subtle shimmer for loading states
    func loadingShimmer() -> some View {
        shimmer(
            gradient: Gradient(colors: [
                .clear,
                Color.theme.primary.opacity(0.3),
                .clear,
            ])
        )
    }
}

// MARK: - Skeleton Loading Views
struct SkeletonView: View {
    var body: some View {
        Rectangle()
            .fill(Color(.systemGray5))
            .loadingShimmer()
    }
}

struct SkeletonText: View {
    let width: CGFloat?
    let height: CGFloat

    init(width: CGFloat? = nil, height: CGFloat = 16) {
        self.width = width
        self.height = height
    }

    var body: some View {
        SkeletonView()
            .frame(width: width, height: height)
            .clipShape(RoundedRectangle(cornerRadius: height / 4))
    }
}

struct SkeletonCircle: View {
    let size: CGFloat

    var body: some View {
        SkeletonView()
            .frame(width: size, height: size)
            .clipShape(Circle())
    }
}

// MARK: - Session Card Skeleton
struct SessionCardSkeleton: View {
    var body: some View {
        HStack(spacing: 16) {
            SkeletonCircle(size: 48)

            VStack(alignment: .leading, spacing: 8) {
                SkeletonText(width: 180, height: 18)
                HStack(spacing: 8) {
                    SkeletonText(width: 80, height: 12)
                    SkeletonText(width: 60, height: 12)
                }
            }

            Spacer()

            SkeletonCircle(size: 24)
        }
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Stats Skeleton
struct StatsSkeleton: View {
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible()),
        ], spacing: 16) {
            ForEach(0..<4, id: \.self) { _ in
                VStack(alignment: .leading, spacing: 12) {
                    SkeletonCircle(size: 32)

                    VStack(alignment: .leading, spacing: 4) {
                        SkeletonText(width: 60, height: 24)
                        SkeletonText(width: 80, height: 12)
                    }
                }
                .padding()
                .background(Color.theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        }
    }
}

// MARK: - Insight Card Skeleton
struct InsightCardSkeleton: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                SkeletonCircle(size: 24)
                SkeletonText(width: 150, height: 20)
                Spacer()
                SkeletonText(width: 60, height: 20)
            }

            SkeletonText(height: 14)
            SkeletonText(width: 280, height: 14)

            HStack(spacing: 8) {
                SkeletonText(width: 80, height: 12)
                SkeletonText(width: 100, height: 12)
            }
        }
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Loading Sessions View
struct LoadingSessionsView: View {
    var body: some View {
        VStack(spacing: 16) {
            ForEach(0..<5, id: \.self) { _ in
                SessionCardSkeleton()
            }
        }
    }
}

// MARK: - Loading Insights View
struct LoadingInsightsView: View {
    var body: some View {
        VStack(spacing: 20) {
            // Header skeleton
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    SkeletonText(width: 200, height: 28)
                    HStack(spacing: 12) {
                        SkeletonText(width: 100, height: 14)
                        SkeletonText(width: 80, height: 14)
                    }
                }
                Spacer()
                SkeletonText(width: 80, height: 32)
            }
            .padding()
            .background(Color.theme.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))

            // Tab picker skeleton
            HStack(spacing: 8) {
                ForEach(0..<4, id: \.self) { _ in
                    SkeletonText(width: 80, height: 36)
                }
            }

            // Insight cards skeleton
            ForEach(0..<3, id: \.self) { _ in
                InsightCardSkeleton()
            }
        }
    }
}

// MARK: - Pulse Animation
struct PulseEffect: ViewModifier {
    @State private var isPulsing = false

    let minScale: CGFloat
    let maxScale: CGFloat
    let duration: Double

    init(minScale: CGFloat = 0.95, maxScale: CGFloat = 1.05, duration: Double = 1.0) {
        self.minScale = minScale
        self.maxScale = maxScale
        self.duration = duration
    }

    func body(content: Content) -> some View {
        content
            .scaleEffect(isPulsing ? maxScale : minScale)
            .animation(
                .easeInOut(duration: duration).repeatForever(autoreverses: true),
                value: isPulsing
            )
            .onAppear {
                isPulsing = true
            }
    }
}

extension View {
    func pulse(minScale: CGFloat = 0.95, maxScale: CGFloat = 1.05, duration: Double = 1.0) -> some View {
        modifier(PulseEffect(minScale: minScale, maxScale: maxScale, duration: duration))
    }
}

// MARK: - Gradient Border
struct GradientBorder: ViewModifier {
    let gradient: LinearGradient
    let width: CGFloat
    let cornerRadius: CGFloat

    func body(content: Content) -> some View {
        content
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(gradient, lineWidth: width)
            )
    }
}

extension View {
    func gradientBorder(
        colors: [Color] = [Color.theme.primary, Color.theme.accent],
        width: CGFloat = 2,
        cornerRadius: CGFloat = 16
    ) -> some View {
        modifier(GradientBorder(
            gradient: LinearGradient(
                colors: colors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            ),
            width: width,
            cornerRadius: cornerRadius
        ))
    }
}

// MARK: - Floating Animation
struct FloatingAnimation: ViewModifier {
    @State private var isFloating = false

    let yOffset: CGFloat
    let duration: Double

    func body(content: Content) -> some View {
        content
            .offset(y: isFloating ? -yOffset : yOffset)
            .animation(
                .easeInOut(duration: duration).repeatForever(autoreverses: true),
                value: isFloating
            )
            .onAppear {
                isFloating = true
            }
    }
}

extension View {
    func floating(yOffset: CGFloat = 10, duration: Double = 2.0) -> some View {
        modifier(FloatingAnimation(yOffset: yOffset, duration: duration))
    }
}

// MARK: - Preview
#Preview {
    ScrollView {
        VStack(spacing: 24) {
            Text("Shimmer Effect")
                .font(.headline)

            SessionCardSkeleton()

            Text("Stats Skeleton")
                .font(.headline)

            StatsSkeleton()

            Text("Insight Skeleton")
                .font(.headline)

            InsightCardSkeleton()
        }
        .padding()
    }
}
