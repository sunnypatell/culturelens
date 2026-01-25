// CultureLens — Shared TypeScript Types
// These types define the data contracts for the entire analysis pipeline.

export type Session = {
  id: string;
  userId: string;
  createdAt: string;
  consent: { personA: boolean; personB: boolean; timestamp: string };
  settings: {
    title?: string;
    sessionType?: string;
    participantCount?: number;
    storageMode: "ephemeral" | "transcriptOnly";
    voiceId: string;
    analysisMethod?: string;
    analysisDepth?: "quick" | "standard" | "deep";
    culturalContextTags?: string[];
    sensitivityLevel?: number;
  };
  status: "recording" | "uploading" | "processing" | "ready" | "failed";
  audioUrl?: string;
  audioPath?: string;
  analysisResult?: AnalysisResult;
  analyzedAt?: string;
  duration?: number;
  isFavorite?: boolean;
};

export type Segment = {
  startMs: number;
  endMs: number;
  speaker: "A" | "B" | "unknown";
  text: string;
  confidence?: number;
};

export type Metrics = {
  talkTimeMs: { A: number; B: number };
  turnCount: { A: number; B: number };
  avgTurnLengthMs: { A: number; B: number };
  interruptionCount: { A: number; B: number };
  overlapEvents: Array<{ atMs: number; by: "A" | "B"; snippet: string }>;
  silenceEvents: Array<{
    startMs: number;
    endMs: number;
    afterSpeaker: "A" | "B";
  }>;
  escalation: Array<{ atMs: number; score: number }>;
};

export type Insight = {
  id: string;
  category:
    | "turnTaking"
    | "emotion"
    | "directness"
    | "repair"
    | "assumptions"
    | "culturalLens";
  title: string;
  summary: string;
  hypothesis?: string;
  confidence: "low" | "medium" | "high";
  evidence: Array<{ startMs: number; endMs: number; quote: string }>;
  whyThisWasFlagged: string;
  safetyNote?: string;
};

export type Debrief = {
  text: string;
  audioUrl: string;
  durationMs: number;
  sections: Array<{ title: string; startChar: number; endChar: number }>;
};

export type AnalysisResult = {
  session: Session;
  segments: Segment[];
  metrics: Metrics;
  insights: Insight[];
  debrief: Debrief;
};
