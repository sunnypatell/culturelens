"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Footer } from "./footer";

export function InsightsView() {
  const [mounted, setMounted] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const communicationPatterns = [
    {
      id: 1,
      title: "Turn-Taking Balance",
      confidence: "high",
      description:
        "Participant A dominated 68% of speaking time, while Participant B contributed 32%.",
      insight: "Consider creating more space for balanced participation",
      evidence: [
        "Participant A had 24 speaking turns averaging 42 seconds each",
        "Participant B had 18 speaking turns averaging 18 seconds each",
        "Longest uninterrupted speech was 2m 14s by Participant A",
      ],
      category: "Balance",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Question Patterns",
      confidence: "high",
      description:
        "High frequency of open-ended questions promoting collaborative discussion.",
      insight: "Strong facilitation style encouraging dialogue",
      evidence: [
        "12 open-ended questions asked throughout conversation",
        "Average response time of 3.2 seconds indicating thoughtful engagement",
        "Questions led to 45% longer responses on average",
      ],
      category: "Engagement",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      title: "Interruption Frequency",
      confidence: "medium",
      description:
        "Moderate interruption rate detected, primarily collaborative overlaps.",
      insight: "Interruptions appear supportive rather than competitive",
      evidence: [
        "8 interruptions total during 24-minute conversation",
        "6 were collaborative completions or affirmations",
        "2 were topic redirections",
      ],
      category: "Flow",
      color: "from-orange-500 to-red-500",
    },
    {
      id: 4,
      title: "Pace and Rhythm",
      confidence: "high",
      description:
        "Speaking pace averaged 145 words per minute with natural pauses.",
      insight: "Comfortable communication pace allowing for processing",
      evidence: [
        "Average speaking rate: 145 wpm (optimal range: 130-170 wpm)",
        "Natural pauses every 12-15 seconds",
        "Pace increased 15% when discussing familiar topics",
      ],
      category: "Tempo",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const culturalContext = [
    {
      id: 1,
      title: "Direct Communication Style",
      description:
        "Conversation shows preference for explicit, straightforward communication",
      examples: [
        '"I need to be clear about this..."',
        '"Let me state this directly..."',
        '"To put it simply..."',
      ],
      context:
        "Direct communication styles value clarity and explicit messaging. This is common in low-context cultures.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: 2,
      title: "Collaborative Decision-Making",
      description: "Multiple perspectives sought before reaching conclusions",
      examples: [
        '"What do you think about..."',
        '"I\'d like to hear your perspective..."',
        '"Let\'s consider both options..."',
      ],
      context:
        "Consensus-building approach where all voices are valued before decisions are made.",
      color: "from-teal-500 to-green-500",
    },
    {
      id: 3,
      title: "Professional Formality",
      description:
        "Balanced tone mixing professional respect with personal warmth",
      examples: [
        "Use of full names initially, then first names",
        "Formal greetings with casual conversation flow",
        "Professional terminology with accessible explanations",
      ],
      context:
        "Demonstrates flexibility in communication formality based on relationship and context.",
      color: "from-violet-500 to-purple-500",
    },
  ];

  const keyMoments = [
    {
      id: 1,
      timestamp: "03:24",
      title: "Decision Point",
      description: "Critical decision made regarding project timeline",
      type: "decision",
      participants: ["Participant A", "Participant B"],
    },
    {
      id: 2,
      timestamp: "08:45",
      title: "Shared Understanding",
      description: "Both participants aligned on core objectives",
      type: "alignment",
      participants: ["Participant A", "Participant B"],
    },
    {
      id: 3,
      timestamp: "15:12",
      title: "Clarification Request",
      description: "Important question resolved with detailed explanation",
      type: "clarification",
      participants: ["Participant B"],
    },
    {
      id: 4,
      timestamp: "19:38",
      title: "Action Items",
      description: "Next steps and responsibilities clearly defined",
      type: "action",
      participants: ["Participant A", "Participant B"],
    },
  ];

  const trends = [
    { month: "Oct", sessions: 12, insights: 45, avgDuration: 18 },
    { month: "Nov", sessions: 18, insights: 72, avgDuration: 21 },
    { month: "Dec", sessions: 24, insights: 96, avgDuration: 22 },
    { month: "Jan", sessions: 24, insights: 142, avgDuration: 21 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div
          className={cn(
            "space-y-4",
            mounted && "animate-in fade-in slide-in-from-bottom-8 duration-700"
          )}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to Library
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Team Strategy Meeting
              </h1>
              <p className="text-lg text-muted-foreground">
                Recorded 2 hours ago • 24:31 duration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="lg">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Report
              </Button>
              <Button size="lg" className="gap-2">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Play Audio
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="patterns" className="space-y-6">
          <TabsList
            className={cn(
              "grid w-full grid-cols-4 h-auto p-1",
              mounted &&
                "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
            )}
          >
            <TabsTrigger value="patterns" className="py-3 text-base">
              Communication Patterns
            </TabsTrigger>
            <TabsTrigger value="cultural" className="py-3 text-base">
              Cultural Context
            </TabsTrigger>
            <TabsTrigger value="moments" className="py-3 text-base">
              Key Moments
            </TabsTrigger>
            <TabsTrigger value="trends" className="py-3 text-base">
              Trends
            </TabsTrigger>
          </TabsList>

          {/* Communication Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {communicationPatterns.map((pattern, index) => (
                <Card
                  key={pattern.id}
                  className={cn(
                    "overflow-hidden hover-lift cursor-pointer transition-all duration-300",
                    expandedInsight === pattern.id && "ring-2 ring-primary",
                    mounted &&
                      "animate-in fade-in slide-in-from-bottom-4 duration-500"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() =>
                    setExpandedInsight(
                      expandedInsight === pattern.id ? null : pattern.id
                    )
                  }
                >
                  {/* Gradient accent bar */}
                  <div
                    className={cn("h-1.5 bg-gradient-to-r", pattern.color)}
                  />

                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-foreground">
                            {pattern.title}
                          </h3>
                          <Badge
                            variant={
                              pattern.confidence === "high"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {pattern.confidence} confidence
                          </Badge>
                          <Badge variant="outline">{pattern.category}</Badge>
                        </div>
                        <p className="text-lg text-muted-foreground">
                          {pattern.description}
                        </p>
                      </div>
                      <svg
                        className={cn(
                          "w-6 h-6 text-muted-foreground transition-transform duration-300",
                          expandedInsight === pattern.id && "rotate-180"
                        )}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>

                    {/* Insight */}
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-primary"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground mb-1">
                            Key Insight
                          </p>
                          <p className="text-muted-foreground">
                            {pattern.insight}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {expandedInsight === pattern.id && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="pt-4 border-t border-border">
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Evidence from Conversation
                          </h4>
                          <ul className="space-y-2">
                            {pattern.evidence.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-muted-foreground"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cultural Context Tab */}
          <TabsContent value="cultural" className="space-y-6">
            <Card
              className={cn(
                "p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900",
                mounted &&
                  "animate-in fade-in slide-in-from-bottom-4 duration-500"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-amber-600 dark:text-amber-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">
                    Cultural Context Analysis
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These observations are based on communication patterns
                    detected in your conversation. Cultural context is complex
                    and individual—use these insights as one perspective to
                    consider, not definitive judgments.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6">
              {culturalContext.map((context, index) => (
                <Card
                  key={context.id}
                  className={cn(
                    "overflow-hidden hover-lift transition-all duration-300",
                    mounted &&
                      "animate-in fade-in slide-in-from-bottom-4 duration-500"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={cn("h-1.5 bg-gradient-to-r", context.color)}
                  />

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {context.title}
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        {context.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                        Examples from Conversation
                      </h4>
                      <div className="space-y-2">
                        {context.examples.map((example, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-lg bg-secondary/50 border border-border"
                          >
                            <p className="text-muted-foreground italic">
                              {example}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">
                          Context:{" "}
                        </span>
                        {context.context}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Key Moments Tab */}
          <TabsContent value="moments" className="space-y-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary" />

              <div className="space-y-6">
                {keyMoments.map((moment, index) => (
                  <div
                    key={moment.id}
                    className={cn(
                      "relative pl-24",
                      mounted &&
                        "animate-in fade-in slide-in-from-left-8 duration-500"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Timestamp badge */}
                    <div className="absolute left-0 top-0 flex items-center gap-3">
                      <Badge className="text-base font-bold px-4 py-2">
                        {moment.timestamp}
                      </Badge>
                      <div className="w-6 h-6 rounded-full bg-primary ring-4 ring-primary/20" />
                    </div>

                    <Card className="hover-lift">
                      <div className="p-6 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <h3 className="text-xl font-bold text-foreground">
                              {moment.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {moment.description}
                            </p>
                          </div>
                          <Badge variant="outline">{moment.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <svg
                            className="w-4 h-4 text-muted-foreground"
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
                          <span className="text-muted-foreground">
                            {moment.participants.join(", ")}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Total Sessions",
                  value: "24",
                  change: "+12%",
                  icon: MicIcon,
                },
                {
                  label: "Total Insights",
                  value: "142",
                  change: "+18%",
                  icon: ChartIcon,
                },
                {
                  label: "Avg Duration",
                  value: "21m",
                  change: "-5%",
                  icon: ClockIcon,
                },
              ].map((stat, index) => (
                <Card
                  key={stat.label}
                  className={cn(
                    "p-6 hover-lift",
                    mounted &&
                      "animate-in fade-in slide-in-from-bottom-4 duration-500"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium">
                        {stat.label}
                      </p>
                      <div className="flex items-end gap-2">
                        <p className="text-3xl font-bold text-foreground">
                          {stat.value}
                        </p>
                        <Badge className="mb-1">{stat.change}</Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Trend Chart */}
            <Card
              className={cn(
                "p-8",
                mounted &&
                  "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
              )}
            >
              <h3 className="text-2xl font-bold text-foreground mb-8">
                30-Day Trend
              </h3>

              <div className="space-y-8">
                {/* Sessions Chart */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Sessions
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      24 this month
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {trends.map((month, i) => (
                      <div
                        key={month.month}
                        className="flex-1 flex flex-col items-center gap-2 group"
                      >
                        <div className="w-full relative">
                          <div
                            className="w-full bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500 hover:scale-105 cursor-pointer"
                            style={{
                              height: `${(month.sessions / 24) * 100}%`,
                              minHeight: "8px",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {month.month}
                        </span>
                        <span className="text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {month.sessions}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights Chart */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Insights
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      142 this month
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-32">
                    {trends.map((month, i) => (
                      <div
                        key={month.month}
                        className="flex-1 flex flex-col items-center gap-2 group"
                      >
                        <div className="w-full relative">
                          <div
                            className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-500 hover:scale-105 cursor-pointer"
                            style={{
                              height: `${(month.insights / 142) * 100}%`,
                              minHeight: "8px",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {month.month}
                        </span>
                        <span className="text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          {month.insights}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
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
