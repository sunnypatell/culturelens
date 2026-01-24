'use client'

import { useConversation } from '@elevenlabs/react'
import { useState, useCallback } from 'react'

// Public agent ID — exposed to browser via NEXT_PUBLIC_ prefix.
// For public agents, no signed URL is needed — connects directly.
// Docs: https://elevenlabs.io/docs/agents-platform/libraries/react
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

export function VoiceAgent() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [error, setError] = useState<string | null>(null)

  const conversation = useConversation({
    onConnect: () => setStatus('connected'),
    onDisconnect: () => setStatus('idle'),
    onError: (e) => {
      setError(typeof e === 'string' ? e : (e as Error)?.message ?? 'Unknown error')
      setStatus('idle')
    },
  })

  const connect = useCallback(async () => {
    setError(null)
    setStatus('connecting')

    try {
      // Public agent — connect directly with agentId (no backend call needed)
      // connectionType: 'websocket' for WebSocket, 'webrtc' for WebRTC
      // Docs: https://elevenlabs.io/docs/agents-platform/libraries/react#startSession
      if (AGENT_ID) {
        await conversation.startSession({
          agentId: AGENT_ID,
          connectionType: 'websocket',
        })
        return
      }

      // Fallback: private agent — get signed URL from backend
      // Requires ELEVENLABS_API_KEY with "Agents Write" permission
      const res = await fetch('/api/elevenlabs/signed-url')
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error || `API returned ${res.status}`)
      }

      const data = await res.json()
      if (!data?.signed_url) {
        throw new Error('No signed_url returned from server')
      }

      await conversation.startSession({ signedUrl: data.signed_url })
    } catch (e) {
      setStatus('idle')
      setError(e instanceof Error ? e.message : 'Failed to connect')
    }
  }, [conversation])

  const disconnect = useCallback(async () => {
    setError(null)
    await conversation.endSession()
  }, [conversation])

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center flex-wrap">
        <button
          className="border px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={connect}
          disabled={status !== 'idle'}
        >
          {status === 'connecting' ? 'Connecting…' : 'Connect to Agent'}
        </button>

        <button
          className="border px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={disconnect}
          disabled={status !== 'connected'}
        >
          Disconnect
        </button>

        <span className="text-sm opacity-70">
          {status === 'connected' && '● Connected'}
          {status === 'connecting' && '○ Connecting...'}
          {status === 'idle' && '○ Not connected'}
        </span>
      </div>

      {status === 'connected' && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Agent is listening — speak naturally
          {conversation.isSpeaking && (
            <span className="ml-2 text-primary font-medium">Agent is speaking...</span>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {status === 'idle' && (
        <p className="text-xs text-muted-foreground">
          The browser will ask for microphone permission when you connect.
        </p>
      )}
    </div>
  )
}
