/**
 * useUserStats hook
 * calculates aggregated statistics from user's sessions
 */

import { useMemo } from "react";
import { useSessions } from "./useSessions";

export interface UserStats {
  sessionsThisMonth: number;
  totalInsights: number;
  totalSessions: number;
  totalHours: number;
  sessionsThisWeek: number;
  avgSessionDuration: number;
  readySessions: number;
  processingSessions: number;
}

interface UseUserStatsResult {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
}

/**
 * calculates user statistics from sessions
 */
export function useUserStats(): UseUserStatsResult {
  const { sessions, loading, error } = useSessions();

  const stats = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return null;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let sessionsThisMonth = 0;
    let sessionsThisWeek = 0;
    let totalInsights = 0;
    let totalDuration = 0;
    let sessionsWithDuration = 0;
    let readySessions = 0;
    let processingSessions = 0;

    sessions.forEach((session) => {
      const sessionDate = new Date(session.createdAt);

      // count sessions this month
      if (
        sessionDate.getMonth() === currentMonth &&
        sessionDate.getFullYear() === currentYear
      ) {
        sessionsThisMonth++;
      }

      // count sessions this week
      if (sessionDate > weekAgo) {
        sessionsThisWeek++;
      }

      // count insights
      if (session.analysisResult?.insights) {
        totalInsights += session.analysisResult.insights.length;
      }

      // aggregate duration
      if (session.duration) {
        totalDuration += session.duration;
        sessionsWithDuration++;
      }

      // count by status
      if (session.status === "ready") {
        readySessions++;
      } else if (
        session.status === "processing" ||
        session.status === "uploading"
      ) {
        processingSessions++;
      }
    });

    // calculate total hours
    const totalHours = totalDuration / (1000 * 60 * 60);

    // calculate average session duration in minutes
    const avgSessionDuration =
      sessionsWithDuration > 0
        ? totalDuration / sessionsWithDuration / (1000 * 60)
        : 0;

    return {
      sessionsThisMonth,
      totalInsights,
      totalSessions: sessions.length,
      totalHours,
      sessionsThisWeek,
      avgSessionDuration,
      readySessions,
      processingSessions,
    };
  }, [sessions]);

  return {
    stats,
    loading,
    error,
  };
}
