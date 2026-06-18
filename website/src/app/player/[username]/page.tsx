import Link from 'next/link'

type KillStats = {
  username: string
  kills: number
  deaths: number
  wallet: string | null
  kd: string
}

type LeaderboardEntry = KillStats & { rank: number }

async function getPlayer(username: string): Promise<KillStats | null> {
  try {
    const res = await fetch(
      `${process.env.GAME_API_URL ?? 'http://localhost:8080'}/api/player/${encodeURIComponent(username)}`,
      { next: { revalidate: 30 } }
    )
    if (res.status === 404) return null
    if (!res.ok) throw new Error('fetch failed')
    return res.json()
  } catch {
    return null
  }
}

async function getPlayerRank(username: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${process.env.GAME_API_URL ?? 'http://localhost:8080'}/api/leaderboard`,
      { next: { revalidate: 30 } }
    )
    if (!res.ok) return null
    const lb: KillStats[] = await res.json()
    const idx = lb.findIndex((p) => p.username.toLowerCase() === username.toLowerCase())
    return idx === -1 ? null : idx + 1
  } catch {
    return null
  }
}

function truncateWallet(wallet: string): string {
  if (wallet.length <= 12) return wallet
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
}

export default async function PlayerPage({
  params,
}: {
  params: { username: string }
}) {
  const username = decodeURIComponent(params.username)
  const [player, rank] = await Promise.all([
    getPlayer(username),
    getPlayerRank(username),
  ])

  if (!player) {
    return <PlayerNotFound username={username} />
  }

  const kdVal = parseFloat(player.kd)
  const kdColor =
    kdVal >= 2 ? 'text-green-400' : kdVal >= 1 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 text-sm transition-colors mb-8"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leaderboard
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shrink-0">
          ⚔️
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-100">{player.username}</h1>
          {rank && (
            <p className="text-amber-500 text-sm font-semibold mt-0.5">
              #{rank} on the leaderboard
            </p>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Kills" value={player.kills.toLocaleString()} accent />
        <StatCard label="Deaths" value={player.deaths.toLocaleString()} />
        <StatCard label="K/D Ratio" value={player.kd} colorClass={kdColor} />
        <StatCard label="Rank" value={rank ? `#${rank}` : '—'} />
      </div>

      {/* Wallet */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
          SOL Wallet
        </p>
        {player.wallet ? (
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <code className="font-mono text-zinc-300 text-sm bg-zinc-800 px-3 py-1.5 rounded-lg">
              {truncateWallet(player.wallet)}
            </code>
            <span className="text-zinc-600 text-xs">Registered</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-zinc-600 text-lg">✗</span>
            <span className="text-zinc-600 text-sm">No wallet registered — prizes cannot be paid out</span>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = false,
  colorClass,
}: {
  label: string
  value: string
  accent?: boolean
  colorClass?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
      <p className={`text-2xl font-black ${colorClass ?? (accent ? 'text-amber-400' : 'text-zinc-100')}`}>
        {value}
      </p>
      <p className="text-zinc-500 text-xs mt-1">{label}</p>
    </div>
  )
}

function PlayerNotFound({ username }: { username: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/leaderboard"
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 text-sm transition-colors mb-8"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Leaderboard
      </Link>
      <div className="text-center py-20 border border-zinc-800 rounded-xl bg-zinc-900/40">
        <div className="text-4xl mb-4">💀</div>
        <h1 className="text-xl font-bold text-zinc-300 mb-2">Player not found</h1>
        <p className="text-zinc-600 text-sm">
          <span className="text-zinc-500 font-mono">{username}</span> doesn&apos;t exist or hasn&apos;t logged in yet.
        </p>
      </div>
    </div>
  )
}
