//
//  InsightsView.swift
//  CultureLens
//
//  Detailed insights view for a completed session analysis
//

import SwiftUI

struct InsightsView: View {
    let session: Session
    @EnvironmentObject var sessionsViewModel: SessionsViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var selectedTab: InsightTab = .overview
    @State private var isLoadingAnalysis = false
    @State private var showingShareSheet = false

    enum InsightTab: String, CaseIterable {
        case overview = "Overview"
        case patterns = "Patterns"
        case transcript = "Transcript"
        case metrics = "Metrics"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Session header
                sessionHeader

                // Tab picker
                tabPicker

                // Content based on selected tab
                switch selectedTab {
                case .overview:
                    overviewContent
                case .patterns:
                    patternsContent
                case .transcript:
                    transcriptContent
                case .metrics:
                    metricsContent
                }
            }
            .padding()
        }
        .background(Color.theme.background)
        .navigationTitle("Insights")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button {
                        Task {
                            await sessionsViewModel.toggleFavorite(session)
                        }
                    } label: {
                        Label(
                            session.isFavorite == true ? "Remove from Favorites" : "Add to Favorites",
                            systemImage: session.isFavorite == true ? "star.slash" : "star"
                        )
                    }

                    Button {
                        showingShareSheet = true
                    } label: {
                        Label("Share Report", systemImage: "square.and.arrow.up")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showingShareSheet) {
            if let result = session.analysisResult {
                ShareSheet(items: [generateReportText(result)])
            }
        }
    }

    // MARK: - Session Header
    private var sessionHeader: some View {
        VStack(spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(session.displayTitle)
                        .font(.title2.bold())

                    HStack(spacing: 12) {
                        Label(session.formattedDate, systemImage: "calendar")
                        Label(session.formattedDuration, systemImage: "clock")
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                }

                Spacer()

                // Status badge
                Text(session.status.displayName)
                    .font(.caption.bold())
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(statusColor)
                    .clipShape(Capsule())
            }

            // Quick stats
            if let result = session.analysisResult {
                HStack(spacing: 16) {
                    QuickStat(
                        value: "\(result.insights.count)",
                        label: "Insights",
                        icon: "lightbulb.fill",
                        color: .orange
                    )

                    QuickStat(
                        value: "\(result.segments.count)",
                        label: "Segments",
                        icon: "text.bubble.fill",
                        color: .blue
                    )

                    QuickStat(
                        value: "\(result.metrics.totalTurns)",
                        label: "Turns",
                        icon: "arrow.triangle.2.circlepath",
                        color: .purple
                    )
                }
            }
        }
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var statusColor: Color {
        switch session.status {
        case .ready: return .green
        case .processing: return .blue
        case .failed: return .red
        default: return .gray
        }
    }

    // MARK: - Tab Picker
    private var tabPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(InsightTab.allCases, id: \.self) { tab in
                    Button {
                        withAnimation {
                            selectedTab = tab
                        }
                    } label: {
                        Text(tab.rawValue)
                            .font(.subheadline.bold())
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(selectedTab == tab ? Color.theme.primary : Color(.systemGray6))
                            .foregroundColor(selectedTab == tab ? .white : .primary)
                            .clipShape(Capsule())
                    }
                }
            }
        }
    }

    // MARK: - Overview Content
    @ViewBuilder
    private var overviewContent: some View {
        if let result = session.analysisResult {
            VStack(spacing: 20) {
                // Debrief section
                VStack(alignment: .leading, spacing: 12) {
                    Label("Summary", systemImage: "doc.text")
                        .font(.headline)

                    Text(result.debrief.text)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .lineSpacing(4)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.theme.cardBackground)
                .clipShape(RoundedRectangle(cornerRadius: 16))

                // Top insights
                VStack(alignment: .leading, spacing: 12) {
                    Label("Key Insights", systemImage: "lightbulb.fill")
                        .font(.headline)

                    ForEach(result.insights.prefix(3)) { insight in
                        InsightCard(insight: insight)
                    }
                }
            }
        } else {
            noAnalysisView
        }
    }

    // MARK: - Patterns Content
    @ViewBuilder
    private var patternsContent: some View {
        if let result = session.analysisResult {
            VStack(spacing: 16) {
                ForEach(result.insights) { insight in
                    InsightCard(insight: insight, expanded: true)
                }
            }
        } else {
            noAnalysisView
        }
    }

    // MARK: - Transcript Content
    @ViewBuilder
    private var transcriptContent: some View {
        if let result = session.analysisResult {
            VStack(spacing: 12) {
                ForEach(result.segments) { segment in
                    SegmentRow(segment: segment)
                }
            }
        } else {
            noAnalysisView
        }
    }

    // MARK: - Metrics Content
    @ViewBuilder
    private var metricsContent: some View {
        if let result = session.analysisResult {
            VStack(spacing: 20) {
                // Talk time distribution
                MetricCard(title: "Talk Time Distribution") {
                    HStack(spacing: 16) {
                        SpeakerBar(
                            speaker: "Person A",
                            percentage: result.metrics.speakerAPercentage,
                            color: Color.theme.primary
                        )

                        SpeakerBar(
                            speaker: "Person B",
                            percentage: result.metrics.speakerBPercentage,
                            color: Color.theme.accent
                        )
                    }
                }

                // Turn statistics
                MetricCard(title: "Turn Statistics") {
                    HStack(spacing: 24) {
                        MetricItem(
                            label: "Total Turns",
                            value: "\(result.metrics.totalTurns)"
                        )

                        MetricItem(
                            label: "A's Turns",
                            value: "\(result.metrics.turnCount.A)"
                        )

                        MetricItem(
                            label: "B's Turns",
                            value: "\(result.metrics.turnCount.B)"
                        )
                    }
                }

                // Interruptions
                MetricCard(title: "Interruptions") {
                    HStack(spacing: 24) {
                        MetricItem(
                            label: "Total",
                            value: "\(result.metrics.totalInterruptions)"
                        )

                        MetricItem(
                            label: "By A",
                            value: "\(result.metrics.interruptionCount.A)"
                        )

                        MetricItem(
                            label: "By B",
                            value: "\(result.metrics.interruptionCount.B)"
                        )
                    }
                }

                // Silence events
                if !result.metrics.silenceEvents.isEmpty {
                    MetricCard(title: "Silence Moments") {
                        VStack(alignment: .leading, spacing: 8) {
                            ForEach(result.metrics.silenceEvents.prefix(5)) { silence in
                                HStack {
                                    Text("After \(silence.afterSpeaker.displayName)")
                                        .font(.caption)

                                    Spacer()

                                    Text(silence.formattedDuration)
                                        .font(.caption.bold())
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                }
            }
        } else {
            noAnalysisView
        }
    }

    private var noAnalysisView: some View {
        VStack(spacing: 16) {
            Image(systemName: "chart.bar.xaxis")
                .font(.system(size: 48))
                .foregroundColor(.secondary)

            Text("No Analysis Available")
                .font(.headline)

            if session.status == .processing {
                Text("Analysis is still processing...")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                ProgressView()
            } else {
                Text("This session doesn't have analysis results yet")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(32)
    }

    // MARK: - Report Generation
    private func generateReportText(_ result: AnalysisResult) -> String {
        var report = """
        # CultureLens Session Report

        **Session:** \(session.displayTitle)
        **Date:** \(session.formattedDate)
        **Duration:** \(session.formattedDuration)

        ## Summary
        \(result.debrief.text)

        ## Key Insights

        """

        for insight in result.insights {
            report += """

            ### \(insight.title)
            **Category:** \(insight.category.displayName)
            **Confidence:** \(insight.confidence.displayName)

            \(insight.summary)

            """
        }

        return report
    }
}

// MARK: - Supporting Views
struct QuickStat: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)

            Text(value)
                .font(.title3.bold())

            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct InsightCard: View {
    let insight: Insight
    var expanded: Bool = false

    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: insight.category.icon)
                    .foregroundColor(insight.category.color)

                Text(insight.title)
                    .font(.headline)

                Spacer()

                ConfidenceBadge(level: insight.confidence)
            }

            Text(insight.summary)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(expanded || isExpanded ? nil : 2)

            if expanded || isExpanded {
                // Evidence
                if !insight.evidence.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Evidence")
                            .font(.caption.bold())
                            .foregroundColor(.secondary)

                        ForEach(insight.evidence) { evidence in
                            HStack {
                                Rectangle()
                                    .fill(insight.category.color)
                                    .frame(width: 3)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(evidence.quote)
                                        .font(.caption)
                                        .italic()

                                    Text(evidence.formattedTimeRange)
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                    }
                }

                // Why flagged
                Text(insight.whyThisWasFlagged)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding()
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }

            if !expanded {
                Button {
                    withAnimation {
                        isExpanded.toggle()
                    }
                } label: {
                    Text(isExpanded ? "Show Less" : "Show More")
                        .font(.caption.bold())
                        .foregroundColor(Color.theme.primary)
                }
            }
        }
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct ConfidenceBadge: View {
    let level: ConfidenceLevel

    var body: some View {
        HStack(spacing: 2) {
            ForEach(0..<3) { index in
                Rectangle()
                    .fill(index < level.barCount ? level.color : Color(.systemGray4))
                    .frame(width: 4, height: 12 + CGFloat(index) * 2)
                    .clipShape(RoundedRectangle(cornerRadius: 1))
            }
        }
    }
}

struct SegmentRow: View {
    let segment: Segment

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(segment.formattedTime)
                .font(.caption.monospaced())
                .foregroundColor(.secondary)
                .frame(width: 48, alignment: .leading)

            VStack(alignment: .leading, spacing: 4) {
                Text(segment.speaker.displayName)
                    .font(.caption.bold())
                    .foregroundColor(segment.speaker == .A ? Color.theme.primary : Color.theme.accent)

                Text(segment.text)
                    .font(.body)
            }
        }
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct MetricCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.headline)

            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.theme.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct SpeakerBar: View {
    let speaker: String
    let percentage: Double
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Text(speaker)
                .font(.caption.bold())

            ZStack(alignment: .bottom) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color(.systemGray5))
                    .frame(width: 40, height: 100)

                RoundedRectangle(cornerRadius: 4)
                    .fill(color)
                    .frame(width: 40, height: CGFloat(percentage))
            }

            Text("\(Int(percentage))%")
                .font(.caption.bold())
                .foregroundColor(color)
        }
    }
}

struct MetricItem: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold())

            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Share Sheet
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

#Preview {
    NavigationStack {
        InsightsView(session: Session(
            id: "test",
            userId: "user",
            createdAt: ISO8601DateFormatter().string(from: Date()),
            consent: Consent(personA: true, personB: true, timestamp: ISO8601DateFormatter().string(from: Date())),
            settings: SessionSettings(
                title: "Test Session",
                storageMode: .transcriptOnly,
                voiceId: "test"
            ),
            status: .ready
        ))
        .environmentObject(SessionsViewModel())
    }
}
