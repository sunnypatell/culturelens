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

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<
    "home" | "record" | "library" | "insights" | "settings"
  >("home");

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
        {activeView === "home" && <DashboardHome onNavigate={setActiveView} />}
        {activeView === "record" && <RecordingStudio />}
        {activeView === "library" && (
          <AnalysisLibrary onViewInsights={() => setActiveView("insights")} />
        )}
        {activeView === "insights" && <InsightsView />}
        {activeView === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
