'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHome } from '@/components/dashboard/dashboard-home'
import { RecordingStudio } from '@/components/dashboard/recording-studio'
import { AnalysisLibrary } from '@/components/dashboard/analysis-library'
import { InsightsView } from '@/components/dashboard/insights-view'
import { SettingsView } from '@/components/dashboard/settings-view'

export default function Home() {
  const [activeView, setActiveView] = useState<'home' | 'record' | 'library' | 'insights' | 'settings'>('home')

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-auto">
        {activeView === 'home' && <DashboardHome onNavigate={setActiveView} />}
        {activeView === 'record' && <RecordingStudio />}
        {activeView === 'library' && <AnalysisLibrary onViewInsights={() => setActiveView('insights')} />}
        {activeView === 'insights' && <InsightsView />}
        {activeView === 'settings' && <SettingsView />}
      </main>
    </div>
  )
}
