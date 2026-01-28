"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { RecordingStudio } from "@/components/dashboard/recording-studio";
import { AnalysisLibrary } from "@/components/dashboard/analysis-library";
import { InsightsView } from "@/components/dashboard/insights-view";
import { SettingsView } from "@/components/dashboard/settings-view";
import { Loader2 } from "lucide-react";
import { CommandPalette } from "@/components/command-palette";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<
    "home" | "record" | "library" | "insights" | "settings"
  >("home");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        {activeView === "home" && (
          <DashboardHome
            onNavigate={setActiveView}
            onViewInsights={(sessionId) => {
              setSelectedSessionId(sessionId);
              setActiveView("insights");
            }}
          />
        )}
        {activeView === "record" && (
          <RecordingStudio
            onNavigate={setActiveView}
            onViewInsights={(sessionId) => {
              setSelectedSessionId(sessionId);
              setActiveView("insights");
            }}
          />
        )}
        {activeView === "library" && (
          <AnalysisLibrary
            onViewInsights={(sessionId) => {
              setSelectedSessionId(sessionId);
              setActiveView("insights");
            }}
            onNavigate={setActiveView}
          />
        )}
        {activeView === "insights" && (
          <InsightsView
            sessionId={selectedSessionId}
            onNavigate={(view) => {
              if (view === "library") {
                setSelectedSessionId(null);
              }
              setActiveView(view as typeof activeView);
            }}
          />
        )}
        {activeView === "settings" && <SettingsView />}
      </main>
      <CommandPalette onNavigate={setActiveView} />
    </div>
  );
}
