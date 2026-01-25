"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";

interface DashboardHomeProps {
  onNavigate: (
    view: "home" | "record" | "library" | "insights" | "settings"
  ) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const recentSessions = [
    {
      id: 1,
      title: "Team Strategy Meeting",
      date: "2 hours ago",
      duration: "24:31",
      participants: 3,
      insights: 12,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Client Onboarding Call",
      date: "Yesterday",
      duration: "18:45",
      participants: 2,
      insights: 8,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      title: "Design Review Session",
      date: "2 days ago",
      duration: "32:18",
      participants: 4,
      insights: 15,
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: 4,
      title: "Weekly Check-in",
      date: "3 days ago",
      duration: "15:22",
      participants: 2,
      insights: 6,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const stats = [
    { label: "Total Sessions", value: "24", change: "+12%", trend: "up" },
    { label: "Hours Analyzed", value: "8.5", change: "+23%", trend: "up" },
    { label: "Insights Generated", value: "142", change: "+18%", trend: "up" },
    {
      label: "Avg. Session Length",
      value: "21m",
      change: "-5%",
      trend: "down",
    },
  ];

  const quickActions = [
    {
      icon: MicIcon,
      label: "Start Recording",
      description: "Begin a new conversation session",
      action: () => onNavigate("record"),
      gradient: "from-primary to-accent",
      hoverEffect: "hover:scale-105 hover:shadow-2xl hover:shadow-primary/20",
    },
    {
      icon: LibraryIcon,
      label: "Browse Library",
      description: "Access your recorded sessions",
      action: () => onNavigate("library"),
      gradient: "from-purple-500 to-pink-500",
      hoverEffect:
        "hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20",
    },
    {
      icon: ChartIcon,
      label: "View Insights",
      description: "Analyze communication patterns",
      action: () => onNavigate("insights"),
      gradient: "from-orange-500 to-red-500",
      hoverEffect:
        "hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Hero Section */}
        <div
          className={cn(
            "space-y-6",
            mounted && "animate-in fade-in slide-in-from-bottom-8 duration-700"
          )}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm font-medium"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                All Systems Operational
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Your conversation analytics dashboard. Track patterns, gain
              insights, and improve communication with cultural awareness.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
          )}
        >
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="p-6 hover-lift relative overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 space-y-2">
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <Badge
                    variant={stat.trend === "up" ? "default" : "secondary"}
                    className="mb-1.5"
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-3 gap-6",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
          )}
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.action}
                className={cn(
                  "group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-500",
                  action.hoverEffect
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient background */}
                <div
                  className={cn(
                    "absolute inset-0 bg-linear-to-br opacity-100 group-hover:opacity-90 transition-opacity",
                    action.gradient
                  )}
                />

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                      {action.label}
                    </h3>
                    <p className="text-white/80">{action.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 group-hover:gap-3 transition-all">
                    <span className="text-sm font-medium">Get Started</span>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent Sessions */}
        <div
          className={cn(
            "space-y-6",
            mounted &&
              "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Recent Sessions
              </h2>
              <p className="text-muted-foreground mt-1">
                Your latest conversation recordings
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("library")}>
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentSessions.map((session) => (
              <Card
                key={session.id}
                className="group relative overflow-hidden hover-lift cursor-pointer"
                onMouseEnter={() => setHoveredCard(session.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onNavigate("insights")}
              >
                {/* Gradient header */}
                <div
                  className={cn(
                    "h-32 bg-linear-to-br relative",
                    session.gradient
                  )}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                  {hoveredCard === session.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        View Analysis
                      </Button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {session.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {session.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{session.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <svg
                        className="w-4 h-4"
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
                      <span>{session.participants} people</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span>{session.insights} insights</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
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

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
