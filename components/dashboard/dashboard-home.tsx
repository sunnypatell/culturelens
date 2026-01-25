"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";
import { useAuth } from "@/components/auth/auth-provider";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { GlassCard, GradientCard } from "@/components/ui/glass-card";
import { BackendStatus } from "@/components/backend-status";
import {
  Mic,
  Library,
  LineChart,
  Clock,
  Users,
  Sparkles,
  TrendingUp,
  ArrowRight,
  MicIcon,
} from "lucide-react";

interface DashboardHomeProps {
  onNavigate: (
    view: "home" | "record" | "library" | "insights" | "settings"
  ) => void;
  onViewInsights?: (sessionId: string) => void;
}

export function DashboardHome({
  onNavigate,
  onViewInsights,
}: DashboardHomeProps) {
  const { getIdToken } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [stats, setStats] = useState([
    {
      label: "Total Sessions",
      value: "0",
      icon: Library,
      gradient: ["#6366f1", "#8b5cf6"],
    },
    {
      label: "Hours Analyzed",
      value: "0",
      icon: Clock,
      gradient: ["#8b5cf6", "#d946ef"],
    },
    {
      label: "Insights Generated",
      value: "0",
      icon: Sparkles,
      gradient: ["#d946ef", "#f43f5e"],
    },
    {
      label: "Avg. Session Length",
      value: "0m",
      icon: TrendingUp,
      gradient: ["#f43f5e", "#fb923c"],
    },
  ]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchSessions();
  }, [getIdToken]);

  const fetchSessions = async () => {
    try {
      const token = await getIdToken();
      if (!token) {
        console.error("no auth token available");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.data) {
        const sessions = data.data.slice(0, 4);
        const gradients = [
          ["#6366f1", "#8b5cf6"],
          ["#8b5cf6", "#d946ef"],
          ["#f43f5e", "#fb923c"],
          ["#10b981", "#06b6d4"],
        ];

        const transformedSessions = sessions.map(
          (session: any, index: number) => {
            const duration = session.settings?.durationMs
              ? `${Math.floor(session.settings.durationMs / 60000)}:${String(Math.floor((session.settings.durationMs % 60000) / 1000)).padStart(2, "0")}`
              : "0:00";
            const insights = session.analysisResult?.insights?.length || 0;
            const participants = session.settings?.participantCount || 2;

            let createdDate: Date;
            if (session.createdAt?._seconds) {
              createdDate = new Date(session.createdAt._seconds * 1000);
            } else if (session.createdAt) {
              createdDate = new Date(session.createdAt);
            } else {
              createdDate = new Date();
            }

            if (isNaN(createdDate.getTime())) {
              createdDate = new Date();
            }

            const now = new Date();
            const diffMs = now.getTime() - createdDate.getTime();
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffHours / 24);

            let dateStr = "";
            if (diffHours < 1) dateStr = "just now";
            else if (diffHours < 24) dateStr = `${diffHours}h ago`;
            else if (diffDays === 1) dateStr = "yesterday";
            else dateStr = `${diffDays}d ago`;

            return {
              id: session.id,
              title:
                session.settings?.title || `Session ${sessions.length - index}`,
              date: dateStr,
              duration,
              participants,
              insights,
              gradient: gradients[index % gradients.length],
            };
          }
        );

        setRecentSessions(transformedSessions);

        const totalSessions = data.meta?.total || 0;
        const totalMs = sessions.reduce(
          (sum: number, s: any) => sum + (s.settings?.durationMs || 0),
          0
        );
        const totalHours = (totalMs / (1000 * 60 * 60)).toFixed(1);
        const totalInsights = sessions.reduce(
          (sum: number, s: any) =>
            sum + (s.analysisResult?.insights?.length || 0),
          0
        );
        const avgDuration =
          totalSessions > 0
            ? Math.floor(totalMs / totalSessions / 1000 / 60)
            : 0;

        setStats([
          {
            label: "Total Sessions",
            value: String(totalSessions),
            icon: Library,
            gradient: ["#6366f1", "#8b5cf6"],
          },
          {
            label: "Hours Analyzed",
            value: totalHours,
            icon: Clock,
            gradient: ["#8b5cf6", "#d946ef"],
          },
          {
            label: "Insights Generated",
            value: String(totalInsights),
            icon: Sparkles,
            gradient: ["#d946ef", "#f43f5e"],
          },
          {
            label: "Avg. Session Length",
            value: `${avgDuration}m`,
            icon: TrendingUp,
            gradient: ["#f43f5e", "#fb923c"],
          },
        ]);
      }
    } catch (error) {
      console.error("failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: MicIcon,
      label: "Start Mediation",
      description: "Capture a live conflict or sensitive conversation",
      action: () => onNavigate("record"),
      gradient: ["#6366f1", "#8b5cf6"],
    },
    {
      icon: Library,
      label: "Browse Library",
      description: "Review Past Cases",
      action: () => onNavigate("library"),
      gradient: ["#8b5cf6", "#d946ef"],
    },
    {
      icon: LineChart,
      label: "Team Insights",
      description: "Analyze communication patterns",
      action: () => onNavigate("insights"),
      gradient: ["#f43f5e", "#fb923c"],
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/5 pointer-events-none" />

      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 p-8 space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <BackendStatus />
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              Resolve workplace friction faster.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Spot patterns in tough conversations, guide teams back to
              alignment, and document action plans—privately and neutrally.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid with Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <GradientCard
                  gradientFrom={stat.gradient[0]}
                  gradientTo={stat.gradient[1]}
                  className="group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-background/50 to-background/30">
                        <Icon className="w-5 h-5" />
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </motion.div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </GradientCard>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions with 3D Cards */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                >
                  <CardContainer>
                    <CardBody className="w-full h-full">
                      <div
                        onClick={action.action}
                        className="cursor-pointer rounded-2xl p-8 bg-gradient-to-br from-background/95 to-background/80 border border-white/10 hover:border-white/20 transition-all group"
                        style={{
                          background: `linear-gradient(135deg, ${action.gradient[0]}15, ${action.gradient[1]}15)`,
                        }}
                      >
                        <CardItem translateZ={50} className="space-y-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${action.gradient[0]}, ${action.gradient[1]})`,
                            }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </CardItem>

                        <CardItem translateZ={60} className="space-y-2 mt-6">
                          <h3 className="text-2xl font-bold">{action.label}</h3>
                          <p className="text-muted-foreground">
                            {action.description}
                          </p>
                        </CardItem>

                        <CardItem translateZ={40} className="mt-6">
                          <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                            <span>Get Started</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </CardItem>
                      </div>
                    </CardBody>
                  </CardContainer>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Sessions with Modern Cards */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Recent Cases</h2>
              <p className="text-muted-foreground mt-1">
                Latest mediated conversations and outcomes
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate("library")}>
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              >
                <GradientCard
                  gradientFrom={session.gradient[0]}
                  gradientTo={session.gradient[1]}
                  onClick={() => onViewInsights?.(session.id)}
                  className="h-full"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">{session.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {session.date}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs">Duration</span>
                        </div>
                        <p className="font-medium">{session.duration}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span className="text-xs">People</span>
                        </div>
                        <p className="font-medium">{session.participants}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-primary">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="text-xs">Insights</span>
                        </div>
                        <p className="font-medium text-primary">
                          {session.insights}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full group"
                    >
                      <span>View Analysis</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </div>

          {recentSessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Library className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your first conversation recording to see insights here
              </p>
              <Button onClick={() => onNavigate("record")}>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
