'use client'

import { useEffect, useState } from 'react'

export default function PlayPage() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/play/create', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          setStreamUrl(data.url)
          setStatus('ready')
        } else {
          setError(data.error ?? 'Unknown error')
          setStatus('error')
        }
      })
      .catch(() => {
        setError('Could not connect to streaming service')
        setStatus('error')
      })
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-amber-400 text-lg font-semibold">Launching your session…</p>
        <p className="text-zinc-500 text-sm">Spinning up a game client. Usually takes 5–10 seconds.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg font-semibold">Session failed to start</p>
        <p className="text-zinc-400 text-sm">{error}</p>
        <a href="/" className="mt-4 text-amber-400 hover:text-amber-300 underline text-sm">
          Back to home
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-amber-400 font-bold tracking-wide text-sm">RUNE PvP</span>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span>Click inside the game window to capture mouse & keyboard</span>
          <a href="/leaderboard" className="text-amber-400 hover:text-amber-300">Leaderboard</a>
          <a href="/" className="hover:text-zinc-300">Exit</a>
        </div>
      </div>
      <iframe
        src={streamUrl!}
        className="flex-1 w-full border-0"
        allow="autoplay; clipboard-read; clipboard-write"
        title="RUNE PvP Game Client"
      />
    </div>
  )
}
