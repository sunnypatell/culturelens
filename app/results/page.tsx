"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, FileText, Brain, Users, Download } from "lucide-react";
import Link from "next/link";
import { AnalysisLoader } from "@/components/ui/analysis-loader";
import { useAuth } from "@/components/auth/auth-provider";
import { generateAnalysisPDF } from "@/lib/pdf-export";

interface AnalysisInsights {
  summary: string;
  keyPoints: string[];
  culturalObservations: string[];
  communicationPatterns: string[];
  recommendations: string[];
}

interface AnalysisResult {
  sessionId: string;
  timestamp: number;
  transcript: string;
  mediatorInputs: string[];
  insights?: AnalysisInsights;
  status: "pending" | "processing" | "complete" | "error";
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const { getIdToken, user } = useAuth();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState(1);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    if (!user) {
      // Wait for auth to be ready
      return;
    }

    fetchAnalysis(sessionId);
  }, [sessionId, user]);

  const fetchAnalysis = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("[Results] Fetching analysis for session:", id);

      const token = await getIdToken();
      if (!token) {
        throw new Error("Not authenticated. Please sign in.");
      }

      // Step 1: Check if analysis already exists
      setAnalysisStep(1);
      let response = await fetch(`/api/sessions/${id}/analyze`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let data = await response.json();

      // Step 2: If no analysis exists, trigger the analysis pipeline
      if (!response.ok && data.error?.code === "BAD_REQUEST") {
        console.log("[Results] No existing analysis, triggering pipeline...");
        setAnalysisStep(2);

        const triggerResponse = await fetch(`/api/sessions/${id}/analyze`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!triggerResponse.ok) {
          const triggerData = await triggerResponse.json();
          throw new Error(
            triggerData.error?.message || "Failed to trigger analysis"
          );
        }

        data = await triggerResponse.json();
      } else if (!response.ok) {
        throw new Error(data.error?.message || "Failed to load analysis");
      }

      // Step 3: Parse the analysis data
      setAnalysisStep(3);
      const analysisData = data.data;
      console.log("[Results] Analysis data received:", analysisData);

      // Step 4: Transform to UI format
      setAnalysisStep(4);

      // Extract transcript from segments
      const transcript =
        analysisData.segments
          ?.map(
            (seg: { speaker: string; text: string }) =>
              `[${seg.speaker}] ${seg.text}`
          )
          .join("\n\n") || "No transcript available";

      // Extract insights from the debrief and insights array
      const insights: AnalysisInsights = {
        summary: "",
        keyPoints: [],
        culturalObservations: [],
        communicationPatterns: [],
        recommendations: [],
      };

      // Parse debrief text to extract structured insights
      if (analysisData.debrief?.text) {
        const debriefText = analysisData.debrief.text;

        // Extract summary (first paragraph before "Key Discussion Points")
        const summaryMatch = debriefText.match(
          /^([\s\S]*?)(?=\n\nKey Discussion Points:|$)/
        );
        if (summaryMatch) {
          insights.summary = summaryMatch[1].trim();
        }

        // Extract key points
        const keyPointsMatch = debriefText.match(
          /Key Discussion Points:\n([\s\S]*?)(?=\n\nCultural Communication Insights:|$)/
        );
        if (keyPointsMatch) {
          insights.keyPoints = keyPointsMatch[1]
            .split("\n")
            .filter((line: string) => line.trim().startsWith("•"))
            .map((line: string) => line.replace(/^•\s*/, "").trim());
        }

        // Extract cultural observations
        const culturalMatch = debriefText.match(
          /Cultural Communication Insights:\n([\s\S]*?)(?=\n\nCommunication Patterns Identified:|$)/
        );
        if (culturalMatch) {
          insights.culturalObservations = culturalMatch[1]
            .split("\n")
            .filter((line: string) => line.trim().startsWith("•"))
            .map((line: string) => line.replace(/^•\s*/, "").trim());
        }

        // Extract communication patterns
        const patternsMatch = debriefText.match(
          /Communication Patterns Identified:\n([\s\S]*?)(?=\n\nRecommendations for Future Conversations:|$)/
        );
        if (patternsMatch) {
          insights.communicationPatterns = patternsMatch[1]
            .split("\n")
            .filter((line: string) => line.trim().startsWith("•"))
            .map((line: string) => line.replace(/^•\s*/, "").trim());
        }

        // Extract recommendations
        const recommendationsMatch = debriefText.match(
          /Recommendations for Future Conversations:\n([\s\S]*?)(?=\n\nParticipation Metrics:|$)/
        );
        if (recommendationsMatch) {
          insights.recommendations = recommendationsMatch[1]
            .split("\n")
            .filter((line: string) => line.trim().startsWith("•"))
            .map((line: string) => line.replace(/^•\s*/, "").trim());
        }
      }

      // Also pull from insights array if available
      if (analysisData.insights && Array.isArray(analysisData.insights)) {
        analysisData.insights.forEach(
          (insight: { category: string; summary: string }) => {
            if (insight.category === "culturalLens") {
              insights.culturalObservations.push(insight.summary);
            } else if (insight.category === "turnTaking") {
              insights.communicationPatterns.push(insight.summary);
            }
          }
        );

        // Deduplicate
        insights.culturalObservations = [
          ...new Set(insights.culturalObservations),
        ];
        insights.communicationPatterns = [
          ...new Set(insights.communicationPatterns),
        ];
      }

      // Extract mediator inputs from insights
      const mediatorInputs =
        analysisData.insights?.map((i: { summary: string }) => i.summary) || [];

      // Step 5: Set final analysis
      setAnalysisStep(5);
      setAnalysis({
        sessionId: id,
        timestamp: Date.now(),
        transcript,
        mediatorInputs,
        insights:
          insights.summary ||
          insights.keyPoints.length > 0 ||
          insights.culturalObservations.length > 0
            ? insights
            : undefined,
        status: "complete",
      });

      setLoading(false);
    } catch (err) {
      console.error("[Results] Analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to load analysis");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
        <AnalysisLoader
          currentStep={analysisStep}
          totalSteps={5}
          showSteps={true}
          className="w-full max-w-xl"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-destructive">Error</h2>
            <p className="text-muted-foreground">{error}</p>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => analysis && generateAnalysisPDF(analysis)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
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
              {analysis.insights.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {analysis.insights.summary}
                  </p>
                </div>
              )}

              {/* Key Points */}
              {analysis.insights.keyPoints.length > 0 && (
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
              )}

              {/* Cultural Observations */}
              {analysis.insights.culturalObservations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Cultural Observations
                  </h3>
                  <ul className="space-y-2">
                    {analysis.insights.culturalObservations.map(
                      (obs, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span className="text-muted-foreground">{obs}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Communication Patterns */}
              {analysis.insights.communicationPatterns.length > 0 && (
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
              )}

              {/* Recommendations */}
              {analysis.insights.recommendations.length > 0 && (
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
              )}
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
        {analysis.mediatorInputs.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              AI Mediator Observations
            </h2>
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
        )}
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
