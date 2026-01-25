"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  MOCK_KEY_INSIGHTS,
  MOCK_TRANSCRIPT,
  getMockSessionTitle,
} from "../../lib/api/mockanalysis";

export default function MockResultsPage() {
  const router = useRouter();
  const title = getMockSessionTitle();

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-accent/5 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>
          <p className="text-lg text-muted-foreground">
            Insights are generated from the conversations transcript.
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="flex items-center gap-2">
                <Badge>Mock</Badge>
                <Badge variant="outline">3 Key Insights</Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              <Button onClick={() => router.push("/")}>Home</Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MOCK_KEY_INSIGHTS.map((insight) => (
            <Card key={insight.title} className="p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  {insight.title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {insight.summary}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Evidence
                </div>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  {insight.evidence.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Why it matters
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.whyItMatters}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Try next
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.suggestion}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Source Transcript
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Included so judges can see the insights are grounded in the
            conversation.
          </p>
          <pre className="whitespace-pre-wrap text-sm bg-background/60 border rounded-xl p-4 overflow-auto">
            {MOCK_TRANSCRIPT}
          </pre>
        </Card>
      </div>
    </div>
  );
}
