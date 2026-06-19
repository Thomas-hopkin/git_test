import Link from 'next/link'

// The LostCity game server hosts both the browser client and the WebSocket
// connection at the same URL. We just send the player there.
const GAME_CLIENT_URL = process.env.NEXT_PUBLIC_GAME_CLIENT_URL ?? ''

export default function PlayPage() {
  if (!GAME_CLIENT_URL) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-400 text-lg font-semibold">Game server not configured</p>
        <p className="text-zinc-400 text-sm max-w-sm">
          Set <code className="bg-zinc-800 px-1 rounded">NEXT_PUBLIC_GAME_CLIENT_URL</code> in your
          Vercel environment variables to the address of your VPS
          (e.g. <code className="bg-zinc-800 px-1 rounded">http://5.161.12.34</code>).
        </p>
        <Link href="/" className="text-amber-400 hover:text-amber-300 underline text-sm">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl">⚔️</span>
        <h1 className="text-3xl font-bold text-amber-400">Ready to fight?</h1>
        <p className="text-zinc-400 max-w-sm">
          The game opens in your browser — no download required. Your progress and
          kills are tracked automatically.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <a
          href={GAME_CLIENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-amber-500/20"
        >
          Launch Game
        </a>
        <p className="text-zinc-600 text-xs">Opens in a new tab</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-sm w-full text-left">
        <h2 className="text-zinc-300 font-semibold text-sm mb-3">In-game commands</h2>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex gap-3">
            <code className="text-amber-400 w-24 shrink-0">::stats</code>
            <span className="text-zinc-400">Your kills and deaths</span>
          </div>
          <div className="flex gap-3">
            <code className="text-amber-400 w-24 shrink-0">::top</code>
            <span className="text-zinc-400">Top 5 leaderboard</span>
          </div>
          <div className="flex gap-3">
            <code className="text-amber-400 w-24 shrink-0">::wallet</code>
            <span className="text-zinc-400">Register for SOL prize payouts</span>
          </div>
        </div>
      </div>

      <Link href="/leaderboard" className="text-amber-400 hover:text-amber-300 underline text-sm">
        View leaderboard
      </Link>
    </div>
  )
}
