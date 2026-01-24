'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { AdvancedWaveform } from '@/components/audio/advanced-waveform'
import { cn } from '@/lib/utils'

type RecordingState = 'setup' | 'consent' | 'recording' | 'paused' | 'processing'

export function RecordingStudio() {
  const [state, setState] = useState<RecordingState>('setup')
  const [duration, setDuration] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>(Array(60).fill(0))
  const [mounted, setMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  // Consent settings
  const [bothConsent, setBothConsent] = useState(false)
  const [recordConsent, setRecordConsent] = useState(false)
  const [analysisMethod, setAnalysisMethod] = useState('standard')
  const [culturalContext, setCulturalContext] = useState<string[]>([])
  const [sensitivityLevel, setSensitivityLevel] = useState([70])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (state === 'recording') {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
        setWaveformData(prev => {
          const newData = [...prev.slice(1), Math.random() * 100]
          return newData
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = () => {
    setDuration(0)
    setState('recording')
  }

  const pauseRecording = () => {
    setState('paused')
  }

  const resumeRecording = () => {
    setState('recording')
  }

  const stopRecording = () => {
    setState('processing')
    setTimeout(() => {
      setState('setup')
      setDuration(0)
    }, 2000)
  }

  const toggleCulturalContext = (context: string) => {
    setCulturalContext(prev =>
      prev.includes(context) ? prev.filter(c => c !== context) : [...prev, context]
    )
  }

  if (state === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className={cn('space-y-2', mounted && 'animate-in fade-in slide-in-from-bottom-4 duration-700')}>
            <h1 className="text-4xl font-bold text-foreground">Recording Studio</h1>
            <p className="text-lg text-muted-foreground">Set up your session before recording</p>
          </div>

          {/* Session Info */}
          <Card className={cn('p-8', mounted && 'animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100')}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Session Information</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="session-title" className="text-base font-medium">Session Title</Label>
                <input
                  id="session-title"
                  type="text"
                  placeholder="e.g., Team Meeting, Client Call, Brainstorming Session"
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="participants" className="text-base font-medium">Number of Participants</Label>
                  <select
                    id="participants"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>2 people</option>
                    <option>3 people</option>
                    <option>4 people</option>
                    <option>5+ people</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-type" className="text-base font-medium">Session Type</Label>
                  <select
                    id="session-type"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Professional Meeting</option>
                    <option>Personal Conversation</option>
                    <option>Educational Discussion</option>
                    <option>Collaborative Work</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy & Consent */}
          <Card className={cn('p-8', mounted && 'animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200')}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Privacy & Consent</h2>
                <p className="text-sm text-muted-foreground">Both participants must provide explicit consent</p>
              </div>
              <Badge variant={bothConsent && recordConsent ? 'default' : 'secondary'}>
                {bothConsent && recordConsent ? 'Ready' : 'Pending'}
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="space-y-1">
                  <Label htmlFor="both-consent" className="text-base font-medium">All Participants Have Consented</Label>
                  <p className="text-sm text-muted-foreground">Everyone in this conversation has agreed to be recorded</p>
                </div>
                <Switch id="both-consent" checked={bothConsent} onCheckedChange={setBothConsent} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="space-y-1">
                  <Label htmlFor="record-consent" className="text-base font-medium">Consent to Record & Analyze</Label>
                  <p className="text-sm text-muted-foreground">I consent to audio recording and AI-powered analysis</p>
                </div>
                <Switch id="record-consent" checked={recordConsent} onCheckedChange={setRecordConsent} />
              </div>
            </div>
          </Card>

          {/* Analysis Settings */}
          <Card className={cn('p-8', mounted && 'animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300')}>
            <h2 className="text-2xl font-bold text-foreground mb-6">Analysis Configuration</h2>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-medium">Analysis Depth</Label>
                <RadioGroup value={analysisMethod} onValueChange={setAnalysisMethod}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={cn(
                      'flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      analysisMethod === 'quick' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}>
                      <RadioGroupItem value="quick" id="quick" />
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Quick Scan</div>
                        <div className="text-sm text-muted-foreground">Basic patterns and key moments</div>
                      </div>
                    </label>
                    <label className={cn(
                      'flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      analysisMethod === 'standard' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}>
                      <RadioGroupItem value="standard" id="standard" />
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Standard</div>
                        <div className="text-sm text-muted-foreground">Comprehensive communication analysis</div>
                      </div>
                    </label>
                    <label className={cn(
                      'flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      analysisMethod === 'deep' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}>
                      <RadioGroupItem value="deep" id="deep" />
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">Deep Dive</div>
                        <div className="text-sm text-muted-foreground">Detailed patterns with cultural context</div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Cultural Context (Optional)</Label>
                <p className="text-sm text-muted-foreground">Help the AI understand relevant cultural communication norms</p>
                <div className="flex flex-wrap gap-2">
                  {['Direct Communication', 'Indirect Communication', 'High Context', 'Low Context', 'Formal', 'Casual', 'Collaborative', 'Hierarchical'].map(context => (
                    <Badge
                      key={context}
                      variant={culturalContext.includes(context) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => toggleCulturalContext(context)}
                    >
                      {context}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Cultural Sensitivity Level</Label>
                  <span className="text-sm font-medium text-primary">{sensitivityLevel[0]}%</span>
                </div>
                <Slider
                  value={sensitivityLevel}
                  onValueChange={setSensitivityLevel}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Higher sensitivity applies more cultural awareness to pattern detection</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className={cn('flex items-center justify-between', mounted && 'animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400')}>
            <Button variant="outline" size="lg">Cancel</Button>
            <Button
              size="lg"
              disabled={!bothConsent || !recordConsent}
              onClick={() => setState('consent')}
              className="px-8"
            >
              Continue to Recording
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'consent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full p-12 space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Ready to Begin</h1>
            <p className="text-lg text-muted-foreground">
              Before we start recording, please ensure all participants are ready and aware that the session is about to begin.
            </p>
          </div>

          <div className="space-y-4 p-6 rounded-lg bg-secondary/50">
            <h3 className="font-semibold text-foreground">Quick Reminder:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>All participants have provided explicit consent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Audio will be recorded and analyzed for communication patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>You can pause or stop the recording at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>All data is processed with cultural sensitivity and respect</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setState('setup')}>
              Back to Setup
            </Button>
            <Button className="flex-1" onClick={startRecording}>
              Start Recording
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (state === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-8">
        <Card className="max-w-md w-full p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-10 h-10 text-primary animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Processing Recording</h2>
            <p className="text-muted-foreground">Preparing your audio for analysis...</p>
          </div>
        </Card>
      </div>
    )
  }

  // Recording or Paused State
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Live Recording</h1>
            <p className="text-muted-foreground">Team Meeting Discussion</p>
          </div>
          <Badge variant={state === 'recording' ? 'default' : 'secondary'} className="text-base px-4 py-2">
            {state === 'recording' ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                Recording
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                Paused
              </span>
            )}
          </Badge>
        </div>

        {/* Main Recording Card */}
        <Card className="p-12">
          <div className="space-y-12">
            {/* Timer */}
            <div className="text-center space-y-4">
              <div className="text-7xl font-bold text-foreground tabular-nums tracking-tight">
                {formatTime(duration)}
              </div>
              <p className="text-muted-foreground">Duration</p>
            </div>

            {/* Waveform Visualization */}
            <AdvancedWaveform
              isRecording={state === 'recording'}
              isPaused={state === 'paused'}
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              {state === 'recording' ? (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={pauseRecording}
                    className="w-32 bg-transparent"
                  >
                    Pause
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopRecording}
                    className="w-32"
                  >
                    Stop
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={resumeRecording}
                    className="w-32"
                  >
                    Resume
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopRecording}
                    className="w-32"
                  >
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-2xl font-bold text-foreground">2</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Speaking Turns</p>
              <p className="text-2xl font-bold text-foreground">{Math.floor(duration / 5)}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Avg Turn Length</p>
              <p className="text-2xl font-bold text-foreground">12s</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-foreground">48/52</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
