"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, FileText, Brain, Users } from "lucide-react";
import Link from "next/link";
import { AnalysisLoader } from "@/components/ui/analysis-loader";

interface AnalysisResult {
  sessionId: string;
  timestamp: number;
  transcript: string;
  mediatorInputs: string[];
  insights?: {
    summary: string;
    keyPoints: string[];
    culturalObservations: string[];
    communicationPatterns: string[];
    recommendations: string[];
  };
  status: "pending" | "processing" | "complete" | "error";
}

// Demo mock data for hackathon presentation
const DEMO_ANALYSIS: AnalysisResult = {
  sessionId: "demo-session",
  timestamp: Date.now(),
  transcript: `[Jordan] I feel like my ideas keep getting dismissed in meetings. It's frustrating because I put a lot of thought into my proposals.

[Alex] I hear you, Jordan. Can you give me a specific example of when this happened?

[Jordan] Last Tuesday, I suggested we pivot our marketing strategy to focus on Gen Z, and before I could even finish explaining, someone jumped in with a completely different idea.

[Alex] That sounds frustrating. How did that make you feel in the moment?

[Jordan] Honestly? Invisible. Like my contributions don't matter to the team.

[Alex] I appreciate you sharing that. From my perspective, I think the team values your input, but our meeting culture might need some adjustment. Would you be open to discussing this with the group?

[Jordan] I think that could help. I just want to feel heard.

[Alex] Absolutely. Let's work on creating more space for everyone to finish their thoughts. I'll bring this up in our next team sync.`,
  mediatorInputs: [
    "Acknowledged Jordan's frustration while maintaining neutrality",
    "Asked clarifying questions to understand the specific situation",
    "Validated emotions without taking sides",
    "Proposed collaborative solution focused on systemic change",
    "Redirected conversation toward constructive action",
  ],
  insights: {
    summary:
      "This conversation demonstrates a constructive conflict resolution dialogue between two colleagues. Jordan expressed feelings of being overlooked in team meetings, while Alex practiced active listening and empathetic responses. The exchange shows healthy communication patterns with opportunities for improved turn-taking awareness in the broader team context.",
    keyPoints: [
      "Jordan feels their contributions are being dismissed in team meetings",
      "A specific incident involving a marketing strategy proposal triggered these feelings",
      "Alex demonstrated active listening and validated Jordan's emotional experience",
      "Both parties agreed to address meeting culture at the team level",
      "The conversation ended with a concrete action plan for improvement",
    ],
    culturalObservations: [
      "Direct communication style: Both participants expressed thoughts openly and honestly",
      "Individualistic framing: Focus on personal feelings and individual recognition",
      "Low power distance: Comfortable peer-to-peer dialogue about workplace dynamics",
      "Task-oriented resolution: Quick pivot from emotional expression to actionable solutions",
    ],
    communicationPatterns: [
      "Turn-taking balance: 52% Jordan, 48% Alex - well-balanced dialogue",
      "Active listening indicators: Alex used reflective statements and clarifying questions",
      "Emotional validation: Feelings were acknowledged before problem-solving began",
      "Collaborative language: Use of 'we' and 'let's' in solution-finding phase",
    ],
    recommendations: [
      "Implement a 'no interruption' rule during idea presentations in team meetings",
      "Consider a round-robin format for brainstorming sessions to ensure equal airtime",
      "Schedule regular 1:1 check-ins to surface concerns before they escalate",
      "Practice the 'build on' technique: acknowledge previous ideas before introducing new ones",
    ],
  },
  status: "complete",
};

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For demo: show loading animation briefly, then display mock data
    // Backend integration is preserved in comments below for production use
    const timer = setTimeout(() => {
      setAnalysis({
        ...DEMO_ANALYSIS,
        sessionId: sessionId || "demo-session",
      });
      setLoading(false);
    }, 2500); // Show the cool loading animation for demo effect

    return () => clearTimeout(timer);

    /*
    // PRODUCTION CODE - Uncomment after hackathon demo
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }
    fetchAnalysis(sessionId);
    */
  }, [sessionId]);

  /*
  // PRODUCTION CODE - Full backend integration preserved
  const fetchAnalysis = async (id: string) => {
    try {
      setLoading(true);
      console.log("[Results] Fetching analysis for session:", id);

      const auth = (await import("@/lib/firebase")).auth;
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("not authenticated");
      }

      let response = await fetch(`/api/sessions/${id}/analyze`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let data = await response.json();

      if (!response.ok && data.error?.code === "BAD_REQUEST") {
        const triggerResponse = await fetch(`/api/sessions/${id}/analyze`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!triggerResponse.ok) {
          const triggerData = await triggerResponse.json();
          throw new Error(
            triggerData.error?.message || "failed to trigger analysis"
          );
        }

        data = await triggerResponse.json();
      } else if (!response.ok) {
        throw new Error(data.error?.message || "failed to load analysis");
      }

      const analysisData = data.data;

      setAnalysis({
        sessionId: id,
        timestamp: Date.now(),
        transcript:
          analysisData.segments
            ?.map(
              (seg: any) =>
                `[${seg.speaker}] ${seg.text}`
            )
            .join("\n\n") || "no transcript available",
        mediatorInputs: analysisData.insights?.map((i: any) => i.text) || [],
        insights: analysisData.debrief
          ? {
              summary: analysisData.debrief.text,
              keyPoints:
                analysisData.debrief.sections?.map((s: any) => s.title) || [],
              culturalObservations: [],
              communicationPatterns: Object.entries(
                analysisData.metrics?.talkTimeMs || {}
              ).map(
                ([speaker, ms]) =>
                  `${speaker}: ${((ms as number) / 1000).toFixed(1)}s speaking time`
              ),
              recommendations: [],
            }
          : undefined,
        status: "complete",
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to load analysis");
      setLoading(false);
    }
  };
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
        <AnalysisLoader
          currentStep={2}
          totalSteps={5}
          showSteps={true}
          className="w-full max-w-xl"
        />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-destructive">Error</h2>
            <p className="text-muted-foreground">Analysis not found</p>
          </div>
          <Link href="/" className="block">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Conversation Analysis</h1>
          </div>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Session Info */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Session Overview</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Session ID:</span>
                  <p className="font-mono">{analysis.sessionId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p>{new Date(analysis.timestamp).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Status:</span>
                  <p className="inline-flex items-center gap-2 ml-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        analysis.status === "complete"
                          ? "bg-green-500"
                          : analysis.status === "processing"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    {analysis.status.charAt(0).toUpperCase() +
                      analysis.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        {analysis.insights && (
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">AI-Generated Insights</h2>
                <p className="text-sm text-muted-foreground">
                  Powered by Google Gemini 2.5 Flash with cultural analysis
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {analysis.insights.summary}
                </p>
              </div>

              {/* Key Points */}
              <div>
                <h3 className="font-semibold mb-2">Key Points</h3>
                <ul className="space-y-2">
                  {analysis.insights.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cultural Observations */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Cultural Observations
                </h3>
                <ul className="space-y-2">
                  {analysis.insights.culturalObservations.map((obs, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="text-muted-foreground">{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Communication Patterns */}
              <div>
                <h3 className="font-semibold mb-2">Communication Patterns</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.insights.communicationPatterns.map(
                    (pattern, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{pattern}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <div className="space-y-2">
                  {analysis.insights.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-3 bg-primary/5 border border-primary/20 rounded-lg"
                    >
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Transcript */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Conversation Transcript
          </h2>
          <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
              {analysis.transcript}
            </pre>
          </div>
        </Card>

        {/* Mediator Inputs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Mediator Inputs</h2>
          <div className="space-y-2">
            {analysis.mediatorInputs.map((input, index) => (
              <div
                key={index}
                className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg"
              >
                <p className="text-sm text-muted-foreground">{input}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
