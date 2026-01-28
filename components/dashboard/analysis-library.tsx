"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatRelativeDate,
  formatDuration,
  parseCreatedAt,
} from "@/lib/format";
import { SESSION_GRADIENTS } from "@/lib/constants";
import { Footer } from "./footer";
import { useUserStats } from "@/lib/hooks/useUserStats";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import { clientLogger } from "@/lib/client-logger";
import { GradientCard } from "@/components/ui/glass-card";
import {
  Clock,
  Users,
  Sparkles,
  Star,
  ArrowRight,
  Loader2,
  FileText,
} from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

// API response session shape (may contain Firestore timestamps)
interface ApiSession {
  id: string;
  settings?: {
    title?: string;
    durationMs?: number;
    participantCount?: number;
    sessionType?: string;
    culturalContext?: string[];
  };
  analysisResult?: {
    insights?: unknown[];
  };
  createdAt?: string | { _seconds: number };
  isFavorite?: boolean;
}

interface TransformedSession {
  id: string;
  title: string;
  date: string;
  timeAgo: string;
  duration: string;
  participants: number;
  insights: number;
  type: string;
  gradientColors: string[];
  isFavorite: boolean;
}

interface AnalysisLibraryProps {
  onViewInsights: (sessionId: string) => void;
  onNavigate?: (
    view: "home" | "record" | "library" | "insights" | "settings"
  ) => void;
}

export function AnalysisLibrary({
  onViewInsights,
  onNavigate,
}: AnalysisLibraryProps) {
  const { getIdToken } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "recent" | "favorites">(
    "all"
  );
  const [hoveredSession, setHoveredSession] = useState<number | null>(null);
  const [sessions, setSessions] = useState<TransformedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { stats } = useUserStats();

  useEffect(() => {
    setMounted(true);
    fetchSessions();
  }, [getIdToken]);

  const handleToggleFavorite = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      const token = await getIdToken();
      if (!token) {
        toast.error("not authenticated");
        return;
      }

      const response = await fetch(`/api/sessions/${sessionId}/favorite`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("failed to update favorite");
      }

      const data = await response.json();

      // update local state
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, isFavorite: data.data.isFavorite } : s
        )
      );

      toast.success(
        data.data.isFavorite ? "added to favorites" : "removed from favorites"
      );
    } catch {
      toast.error("failed to update favorite");
    }
  };

  const handlePlayAudio = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("audio playback coming soon");
    // TODO: implement audio playback with session audio URL
  };

  const handleMoreOptions = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info("more options coming soon");
    // TODO: implement dropdown menu with delete, export, share options
  };

  const fetchSessions = async () => {
    try {
      const token = await getIdToken();
      if (!token) {
        clientLogger.error("no auth token available");
        return;
      }

      const response = await fetch("/api/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.data) {
        const transformedSessions = data.data.map(
          (session: ApiSession, index: number) => {
            const duration = session.settings?.durationMs
              ? formatDuration(session.settings.durationMs)
              : "0:00";
            const insights = session.analysisResult?.insights?.length || 0;
            const participants = session.settings?.participantCount || 2;
            const createdDate = parseCreatedAt(session.createdAt);
            const timeAgo = formatRelativeDate(createdDate);

            return {
              id: session.id,
              title:
                session.settings?.title ||
                `Session ${data.data.length - index}`,
              date: createdDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              timeAgo,
              duration,
              participants,
              insights,
              type:
                session.settings?.sessionType ||
                session.settings?.culturalContext?.[0] ||
                "Personal",
              gradientColors:
                SESSION_GRADIENTS[index % SESSION_GRADIENTS.length],
              isFavorite: session.isFavorite || false,
            };
          }
        );

        setSessions(transformedSessions);
      }
    } catch (error) {
      clientLogger.error("failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  // filter and search sessions
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // apply filter type
    if (filterType === "recent") {
      // show sessions from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekAgo;
      });
    } else if (filterType === "favorites") {
      filtered = filtered.filter((session) => session.isFavorite);
    }

    // apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (session) =>
          session.title.toLowerCase().includes(query) ||
          session.type.toLowerCase().includes(query) ||
          session.participants.toString().includes(query)
      );
    }

    return filtered;
  }, [sessions, filterType, searchQuery]);

  // show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center relative overflow-hidden">
        {/* animated floating orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex items-center gap-3"
          >
            <FileText className="w-14 h-14 text-primary" />
            <Loader2 className="w-14 h-14 animate-spin text-primary absolute -right-4 -top-4 opacity-60" />
          </motion.div>

          <TextGenerateEffect
            words="loading your conversation archive"
            className="text-center text-foreground"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex gap-2"
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-primary"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-primary"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-40 left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div
          className={cn(
            "space-y-6",
            mounted && "animate-in fade-in slide-in-from-bottom-8 duration-700"
          )}
        >
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-foreground tracking-tight">
              Analysis Library
            </h1>
            <p className="text-xl text-muted-foreground">
              Browse and manage your recorded conversations
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <Input
                placeholder="Search sessions by title, participants, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className="h-12"
              >
                All Sessions
              </Button>
              <Button
                variant={filterType === "recent" ? "default" : "outline"}
                onClick={() => setFilterType("recent")}
                className="h-12"
              >
                Recent
              </Button>
              <Button
                variant={filterType === "favorites" ? "default" : "outline"}
                onClick={() => setFilterType("favorites")}
                className="h-12"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Favorites
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-4 gap-4",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
          )}
        >
          {[
            {
              label: "Total Sessions",
              value: sessions.length.toString(),
              icon: LibraryIcon,
              color: "from-blue-500 to-cyan-500",
            },
            {
              label: "This Week",
              value: (stats?.sessionsThisWeek || 0).toString(),
              icon: CalendarIcon,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Total Hours",
              value: (stats?.totalHours || 0).toFixed(1),
              icon: ClockIcon,
              color: "from-orange-500 to-red-500",
            },
            {
              label: "Favorites",
              value: sessions.filter((s) => s.isFavorite).length.toString(),
              icon: StarIcon,
              color: "from-green-500 to-emerald-500",
            },
          ].map((stat, index) => (
            <Card
              key={stat.label}
              className="p-6 hover-lift relative overflow-hidden group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-linear-to-br opacity-5 group-hover:opacity-10 transition-opacity",
                  stat.color
                )}
              />
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl bg-linear-to-br flex items-center justify-center",
                    stat.color
                  )}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Sessions Grid */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
          )}
        >
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <GradientCard
                gradientFrom={session.gradientColors?.[0] || "#6366f1"}
                gradientTo={session.gradientColors?.[1] || "#8b5cf6"}
                onClick={() => onViewInsights(session.id)}
                className="h-full relative group"
              >
                {/* Favorite button */}
                <button
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
                  onClick={(e) => handleToggleFavorite(session.id, e)}
                >
                  <Star
                    className={cn(
                      "w-4 h-4",
                      session.isFavorite
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    )}
                  />
                </button>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold line-clamp-2">
                      {session.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {session.timeAgo}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">Time</span>
                      </div>
                      <p className="font-medium">{session.duration}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">People</span>
                      </div>
                      <p className="font-medium">{session.participants}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-primary">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-xs">Insights</span>
                      </div>
                      <p className="font-medium text-primary">
                        {session.insights || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {session.type}
                    </Badge>
                    {session.isFavorite && (
                      <Badge
                        variant="outline"
                        className="text-xs border-yellow-500 text-yellow-600"
                      >
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Favorite
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full group/btn"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </GradientCard>
            </motion.div>
          ))}
        </div>

        {/* Empty state for when no sessions match filter */}
        {filteredSessions.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No sessions found
            </h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or start a new recording
            </p>
            <Button onClick={() => onNavigate?.("record")}>
              Start Recording
            </Button>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
