"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";

interface AnalysisLibraryProps {
  onViewInsights: () => void;
}

export function AnalysisLibrary({ onViewInsights }: AnalysisLibraryProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "recent" | "favorites">(
    "all"
  );
  const [hoveredSession, setHoveredSession] = useState<number | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();

      if (response.ok && data.data) {
        const gradients = [
          "from-blue-500 via-blue-600 to-cyan-500",
          "from-purple-500 via-purple-600 to-pink-500",
          "from-orange-500 via-orange-600 to-red-500",
          "from-green-500 via-green-600 to-emerald-500",
          "from-teal-500 via-teal-600 to-cyan-500",
          "from-indigo-500 via-indigo-600 to-purple-500",
          "from-pink-500 via-pink-600 to-rose-500",
          "from-amber-500 via-amber-600 to-yellow-500",
        ];

        const transformedSessions = data.data.map(
          (session: any, index: number) => {
            const duration = session.settings?.durationMs
              ? `${Math.floor(session.settings.durationMs / 60000)}:${String(Math.floor((session.settings.durationMs % 60000) / 1000)).padStart(2, "0")}`
              : "0:00";
            const insights = session.analysisResult?.insights?.length || 0;
            const participants = session.settings?.participantCount || 2;
            const createdDate = new Date(session.createdAt);
            const now = new Date();
            const diffMs = now.getTime() - createdDate.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);

            let timeAgo = "";
            if (diffHours < 1) timeAgo = "just now";
            else if (diffHours < 24) timeAgo = `${diffHours} hours ago`;
            else if (diffDays === 1) timeAgo = "yesterday";
            else if (diffDays < 7) timeAgo = `${diffDays} days ago`;
            else
              timeAgo = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;

            return {
              id: session.id,
              title: `Session ${data.data.length - index}`,
              date: createdDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              timeAgo,
              duration,
              participants,
              insights,
              type: session.settings?.culturalContext?.[0] || "Personal",
              gradient: gradients[index % gradients.length],
              isFavorite: false,
            };
          }
        );

        setSessions(transformedSessions);
      }
    } catch (error) {
      console.error("failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

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
              value: "5",
              icon: CalendarIcon,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Total Hours",
              value: "12.5",
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
          {sessions.map((session, index) => (
            <Card
              key={session.id}
              className="group relative overflow-hidden hover-lift cursor-pointer transition-all duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
              onMouseEnter={() => setHoveredSession(session.id)}
              onMouseLeave={() => setHoveredSession(null)}
              onClick={onViewInsights}
            >
              {/* Gradient Header */}
              <div className="relative h-40 overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-0 bg-linear-to-br transition-transform duration-500 group-hover:scale-110",
                    session.gradient
                  )}
                />

                {/* Favorite button */}
                <button
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle favorite
                  }}
                >
                  <svg
                    className={cn(
                      "w-4 h-4",
                      session.isFavorite ? "fill-white" : "fill-none"
                    )}
                    viewBox="0 0 24 24"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>

                {/* Hover overlay */}
                {hoveredSession === session.id && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <Button size="sm" variant="secondary">
                      View Analysis
                    </Button>
                  </div>
                )}

                {/* Duration badge */}
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    {session.duration}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {session.timeAgo}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {session.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <svg
                      className="w-3 h-3 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {session.participants}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs text-primary border-primary"
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    {session.insights} insights
                  </Badge>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-xs h-8"
                  >
                    <svg
                      className="w-3.5 h-3.5 mr-1.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Play Audio
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state for when no sessions match filter */}
        {sessions.length === 0 && (
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
            <Button>Start Recording</Button>
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
