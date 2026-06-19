'use client'

import { useEffect, useRef, useState } from 'react'

type Phase = 'connecting' | 'queued' | 'ready' | 'error'

// A stable per-browser token so a reload reconnects to the SAME session
// instead of spinning up a new container.
function getToken(): string {
  const KEY = 'runepvp-play-token'
  let t = localStorage.getItem(KEY)
  if (!t) {
    t = crypto.randomUUID()
    localStorage.setItem(KEY, t)
  }
  return t
}

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>('connecting')
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [queuePos, setQueuePos] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const sessionIdRef = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const token = getToken()
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch('/api/play/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (cancelled) return

        if (data.status === 'ready') {
          sessionIdRef.current = data.session.id
          setStreamUrl(data.session.url)
          setPhase('ready')
          startHeartbeat(data.session.id)
        } else if (data.status === 'queued') {
          setQueuePos(data.position)
          setPhase('queued')
          pollRef.current = setTimeout(poll, 3000) // keep polling for a slot
        } else {
          setError(data.error ?? 'Could not start a session')
          setPhase('error')
        }
      } catch {
        if (cancelled) return
        setError('Could not reach the streaming service')
        setPhase('error')
      }
    }

    function startHeartbeat(id: string) {
      heartbeatRef.current = setInterval(() => {
        fetch('/api/play/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
          keepalive: true,
        }).catch(() => {})
      }, 20000)
    }

    poll()

    // Best-effort teardown when the tab closes so the slot frees immediately.
    const onUnload = () => {
      const id = sessionIdRef.current
      if (id) {
        navigator.sendBeacon?.(
          '/api/play/end',
          new Blob([JSON.stringify({ id })], { type: 'application/json' }),
        )
      }
    }
    window.addEventListener('beforeunload', onUnload)

    return () => {
      cancelled = true
      window.removeEventListener('beforeunload', onUnload)
      if (pollRef.current) clearTimeout(pollRef.current)
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
    }
  }, [])

  function endSession() {
    const id = sessionIdRef.current
    if (id) {
      fetch('/api/play/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {})
    }
    window.location.href = '/'
  }

  if (phase === 'connecting' || phase === 'queued') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        {phase === 'connecting' ? (
          <>
            <p className="text-amber-400 text-lg font-semibold">Launching your session…</p>
            <p className="text-zinc-500 text-sm">Connecting to a game client. Usually instant.</p>
          </>
        ) : (
          <>
            <p className="text-amber-400 text-lg font-semibold">
              All slots are full — you&apos;re #{queuePos} in line
            </p>
            <p className="text-zinc-500 text-sm">
              Your session will start automatically as soon as one frees up. Keep this tab open.
            </p>
          </>
        )}
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-400 text-lg font-semibold">Session failed to start</p>
        <p className="text-zinc-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          Try again
        </button>
        <a href="/" className="text-amber-400 hover:text-amber-300 underline text-sm">
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
          <span className="hidden sm:inline">Click inside the game to capture mouse &amp; keyboard</span>
          <a href="/leaderboard" className="text-amber-400 hover:text-amber-300">Leaderboard</a>
          <button onClick={endSession} className="hover:text-zinc-300">Exit</button>
        </div>
      </div>
      <iframe
        src={streamUrl!}
        className="flex-1 w-full border-0"
        allow="autoplay; clipboard-read; clipboard-write; fullscreen"
        title="RUNE PvP Game Client"
      />
    </div>
  )
}
