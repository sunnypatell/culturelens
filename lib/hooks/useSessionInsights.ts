/**
 * useSessionInsights hook
 * fetches session analysis data from the API
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { AnalysisResult, Insight } from "@/lib/types";

interface CommunicationPattern {
  id: number;
  title: string;
  confidence: "low" | "medium" | "high";
  description: string;
  insight: string;
  evidence: string[];
  category: string;
  color: string;
}

interface CulturalContext {
  id: number;
  title: string;
  description: string;
  examples: string[];
  context: string;
  color: string;
}

interface KeyMoment {
  id: number;
  timestamp: string;
  title: string;
  description: string;
  type: string;
  participants: string[];
}

interface SessionMetadata {
  title: string;
  recordedAt: string;
  duration: string;
}

interface InsightsData {
  communicationPatterns: CommunicationPattern[];
  culturalContext: CulturalContext[];
  keyMoments: KeyMoment[];
  sessionMetadata: SessionMetadata;
  loading: boolean;
  error: string | null;
}

const COLOR_PALETTES = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-emerald-500",
  "from-indigo-500 to-blue-500",
  "from-teal-500 to-green-500",
  "from-violet-500 to-purple-500",
];

/**
 * transforms API insights into communication patterns for the UI
 */
function transformToCommunicationPatterns(
  insights: Insight[],
  metrics: AnalysisResult["metrics"]
): CommunicationPattern[] {
  const patterns: CommunicationPattern[] = [];

  // turn-taking balance from metrics
  const totalTalkTime = metrics.talkTimeMs.A + metrics.talkTimeMs.B;
  const percentA = Math.round((metrics.talkTimeMs.A / totalTalkTime) * 100);
  const percentB = Math.round((metrics.talkTimeMs.B / totalTalkTime) * 100);

  patterns.push({
    id: 1,
    title: "Turn-Taking Balance",
    confidence: "high",
    description: `Participant A spoke ${percentA}% of the time, while Participant B contributed ${percentB}%.`,
    insight:
      percentA > 60 || percentB > 60
        ? "Consider creating more space for balanced participation"
        : "Well-balanced conversation with both participants contributing equally",
    evidence: [
      `Participant A had ${metrics.turnCount.A} speaking turns averaging ${Math.round(metrics.avgTurnLengthMs.A / 1000)}s each`,
      `Participant B had ${metrics.turnCount.B} speaking turns averaging ${Math.round(metrics.avgTurnLengthMs.B / 1000)}s each`,
    ],
    category: "Balance",
    color: COLOR_PALETTES[0],
  });

  // interruption frequency from metrics
  const totalInterruptions =
    metrics.interruptionCount.A + metrics.interruptionCount.B;

  if (totalInterruptions > 0) {
    patterns.push({
      id: 2,
      title: "Interruption Frequency",
      confidence: "high",
      description: `${totalInterruptions} interruptions detected during the conversation.`,
      insight:
        totalInterruptions > 10
          ? "High interruption rate may indicate competitive communication"
          : "Moderate interruption rate, likely collaborative overlaps",
      evidence: [
        `${metrics.interruptionCount.A} interruptions by Participant A`,
        `${metrics.interruptionCount.B} interruptions by Participant B`,
        `${metrics.overlapEvents.length} overlap events detected`,
      ],
      category: "Flow",
      color: COLOR_PALETTES[2],
    });
  }

  // transform insights from API
  insights.forEach((insight, index) => {
    patterns.push({
      id: patterns.length + 1,
      title: insight.title,
      confidence: insight.confidence,
      description: insight.summary,
      insight: insight.hypothesis || insight.whyThisWasFlagged,
      evidence: insight.evidence.map((e) => e.quote),
      category:
        insight.category === "turnTaking"
          ? "Balance"
          : insight.category === "emotion"
            ? "Engagement"
            : "Analysis",
      color: COLOR_PALETTES[(index + 3) % COLOR_PALETTES.length],
    });
  });

  return patterns;
}

/**
 * transforms API insights into cultural context observations
 */
function transformToCulturalContext(insights: Insight[]): CulturalContext[] {
  const culturalInsights = insights.filter(
    (i) => i.category === "culturalLens" || i.category === "directness"
  );

  return culturalInsights.map((insight, index) => ({
    id: index + 1,
    title: insight.title,
    description: insight.summary,
    examples: insight.evidence.map((e) => `"${e.quote}"`),
    context: insight.whyThisWasFlagged,
    color: COLOR_PALETTES[index % COLOR_PALETTES.length],
  }));
}

/**
 * transforms segments with insights into key moments
 */
function transformToKeyMoments(
  insights: Insight[],
  _segments: AnalysisResult["segments"]
): KeyMoment[] {
  return insights
    .filter((i) => i.evidence.length > 0)
    .slice(0, 5) // top 5 moments
    .map((insight, index) => {
      const firstEvidence = insight.evidence[0];
      const timestampMs = firstEvidence.startMs;
      const minutes = Math.floor(timestampMs / 60000);
      const seconds = Math.floor((timestampMs % 60000) / 1000);
      const timestamp = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      return {
        id: index + 1,
        timestamp,
        title: insight.title,
        description: insight.summary,
        type: insight.category,
        participants: ["Participant A", "Participant B"], // TODO: determine from segments
      };
    });
}

/**
 * formats session metadata for display
 */
function formatSessionMetadata(session: any): SessionMetadata {
  const createdAt = new Date(session.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let recordedAt: string;
  if (diffDays > 0) {
    recordedAt = `Recorded ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0) {
    recordedAt = `Recorded ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else {
    recordedAt = "Recorded recently";
  }

  // calculate duration from session if available, otherwise placeholder
  const duration = session.duration
    ? `${Math.floor(session.duration / 60000)}:${((session.duration % 60000) / 1000).toFixed(0).padStart(2, "0")} duration`
    : "Duration unknown";

  return {
    title: session.settings?.title || session.title || "Untitled Session",
    recordedAt,
    duration,
  };
}

/**
 * hook to fetch and transform session insights
 */
export function useSessionInsights(sessionId: string | null): InsightsData {
  const { getIdToken } = useAuth();
  const [data, setData] = useState<InsightsData>({
    communicationPatterns: [],
    culturalContext: [],
    keyMoments: [],
    sessionMetadata: {
      title: "Loading...",
      recordedAt: "",
      duration: "",
    },
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!sessionId) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "No session ID provided",
      }));
      return;
    }

    async function fetchInsights() {
      try {
        const token = await getIdToken();
        if (!token) {
          throw new Error("Not authenticated");
        }

        // try to fetch existing analysis results
        let response = await fetch(`/api/sessions/${sessionId}/analyze`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let responseData = await response.json();

        // if analysis not complete, trigger it
        if (
          !response.ok &&
          responseData.error?.message?.includes("analysis not complete")
        ) {
          console.log(
            "[useSessionInsights] Analysis not ready, triggering analysis..."
          );

          // trigger analysis via POST
          const triggerResponse = await fetch(
            `/api/sessions/${sessionId}/analyze`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!triggerResponse.ok) {
            const triggerData = await triggerResponse.json();
            throw new Error(
              triggerData.error?.message || "Failed to trigger analysis"
            );
          }

          responseData = await triggerResponse.json();
        } else if (!response.ok) {
          throw new Error(
            responseData.error?.message ||
              `Failed to fetch insights: ${response.status}`
          );
        }

        const analysisResult = responseData.data as AnalysisResult;

        // transform data for UI
        const communicationPatterns = transformToCommunicationPatterns(
          analysisResult.insights,
          analysisResult.metrics
        );

        const culturalContext = transformToCulturalContext(
          analysisResult.insights
        );

        const keyMoments = transformToKeyMoments(
          analysisResult.insights,
          analysisResult.segments
        );

        const sessionMetadata = formatSessionMetadata(analysisResult.session);

        setData({
          communicationPatterns,
          culturalContext,
          keyMoments,
          sessionMetadata,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("[useSessionInsights] Error fetching insights:", error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to load insights",
        }));
      }
    }

    fetchInsights();
  }, [sessionId, getIdToken]);

  return data;
}
