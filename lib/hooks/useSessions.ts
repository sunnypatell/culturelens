/**
 * useSessions hook
 * fetches all sessions for the current user
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { AnalysisResult } from "@/lib/types";

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  consent: {
    personA: boolean;
    personB: boolean;
    timestamp: string;
  };
  settings: {
    title?: string;
    sessionType?: string;
    participantCount?: number;
    culturalContextTags?: string[];
    sensitivityLevel?: number;
    analysisMethod?: string;
    storageMode: "ephemeral" | "transcriptOnly";
    voiceId: string;
  };
  status: "recording" | "uploading" | "processing" | "ready" | "failed";
  audioUrl?: string;
  audioPath?: string;
  analysisResult?: AnalysisResult;
  analyzedAt?: string;
  duration?: number;
  isFavorite?: boolean;
}

interface UseSessionsResult {
  sessions: Session[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * fetches all sessions for the authenticated user
 */
export function useSessions(): UseSessionsResult {
  const { getIdToken, user } = useAuth();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      setSessions(null);
      setLoading(false);
      setError("not authenticated");
      return;
    }

    async function fetchSessions() {
      try {
        setLoading(true);
        setError(null);

        const token = await getIdToken();
        if (!token) {
          throw new Error("not authenticated");
        }

        const response = await fetch("/api/sessions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message ||
              `failed to fetch sessions: ${response.status}`
          );
        }

        const result: { data: Session[]; meta?: { total: number } } =
          await response.json();

        console.log(`[useSessions] Fetched ${result.data.length} sessions`);
        setSessions(result.data);
      } catch (err) {
        console.error("[useSessions] Error fetching sessions:", err);
        setError(
          err instanceof Error ? err.message : "failed to load sessions"
        );
        setSessions(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [getIdToken, user, refetchTrigger]);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { sessions, loading, error, refetch };
}
