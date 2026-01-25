/**
 * useInsightsTrends hook
 * aggregates session data by month for trend visualization
 */

import { useMemo } from "react";
import { useSessions } from "./useSessions";

export interface TrendData {
  month: string;
  sessions: number;
  insights: number;
  avgDuration: number;
}

interface UseInsightsTrendsResult {
  trends: TrendData[];
  loading: boolean;
  error: string | null;
}

/**
 * calculates monthly trends from session data
 */
export function useInsightsTrends(): UseInsightsTrendsResult {
  const { sessions, loading, error } = useSessions();

  const trends = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return [];
    }

    // group sessions by month
    const byMonth = sessions.reduce(
      (acc, session) => {
        const date = new Date(session.createdAt);
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        const key = `${month} ${year}`;

        if (!acc[key]) {
          acc[key] = {
            month,
            year,
            sessionCount: 0,
            totalInsights: 0,
            totalDuration: 0,
            sessionsWithDuration: 0,
          };
        }

        acc[key].sessionCount++;

        // count insights if analysis is ready
        if (session.analysisResult?.insights) {
          acc[key].totalInsights += session.analysisResult.insights.length;
        }

        // aggregate duration
        if (session.duration) {
          acc[key].totalDuration += session.duration;
          acc[key].sessionsWithDuration++;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          month: string;
          year: number;
          sessionCount: number;
          totalInsights: number;
          totalDuration: number;
          sessionsWithDuration: number;
        }
      >
    );

    // convert to array and calculate averages
    const trendsArray: TrendData[] = Object.entries(byMonth)
      .map(([_, data]) => ({
        month: data.month,
        sessions: data.sessionCount,
        insights: data.totalInsights,
        avgDuration:
          data.sessionsWithDuration > 0
            ? Math.round(
                data.totalDuration / data.sessionsWithDuration / 60000
              ) // convert to minutes
            : 0,
      }))
      .sort((a, b) => {
        // sort by month chronologically
        const monthOrder = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });

    // return last 4 months
    return trendsArray.slice(-4);
  }, [sessions]);

  return {
    trends,
    loading,
    error,
  };
}
