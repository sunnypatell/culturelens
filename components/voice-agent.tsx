'use client'

import { useConversation } from '@elevenlabs/react'
import { useState } from 'react'

export function VoiceAgent() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')
  const [error, setError] = useState<string | null>(null)

  const conversation = useConversation({
    onConnect: () => setStatus('connected'),
    onDisconnect: () => setStatus('idle'),
    onError: (e) => setError(typeof e === 'string' ? e : (e as Error)?.message ?? 'Unknown error'),
  })

  async function connect() {
    setError(null)
    setStatus('connecting')

    const res = await fetch('/api/elevenlabs/signed-url')
    const data = await res.json()

    if (!data?.signed_url) {
      setStatus('idle')
      setError('No signed_url returned')
      return
    }

    await conversation.startSession({
      signedUrl: data.signed_url,
    } as Parameters<typeof conversation.startSession>[0])
  }

  async function disconnect() {
    setError(null)
    await conversation.endSession()
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <button
          className="border px-3 py-2 rounded"
          onClick={connect}
          disabled={status !== 'idle'}
        >
          {status === 'connecting' ? 'Connecting…' : 'Connect'}
        </button>

        <button
          className="border px-3 py-2 rounded"
          onClick={disconnect}
          disabled={status !== 'connected'}
        >
          Disconnect
        </button>

        <span className="text-sm opacity-70">Status: {status}</span>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="text-xs opacity-70">
        The browser will ask for microphone permission the first time.
      </div>
    </div>
  )
}
