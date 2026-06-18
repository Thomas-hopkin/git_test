import Link from 'next/link'

export const revalidate = 30

type KillStats = {
  username: string
  kills: number
  deaths: number
  wallet: string | null
  kd: string
}

async function getLeaderboard(): Promise<KillStats[]> {
  try {
    const res = await fetch(`${process.env.GAME_API_URL ?? 'http://localhost:8080'}/api/leaderboard`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

const RANK_STYLES: Record<number, { row: string; rank: string; label: string }> = {
  1: {
    row: 'bg-amber-500/10 border-l-2 border-l-amber-400',
    rank: 'text-amber-400 font-black text-lg',
    label: '🥇',
  },
  2: {
    row: 'bg-zinc-400/5 border-l-2 border-l-zinc-400',
    rank: 'text-zinc-300 font-black text-lg',
    label: '🥈',
  },
  3: {
    row: 'bg-amber-700/10 border-l-2 border-l-amber-700',
    rank: 'text-amber-600 font-black text-lg',
    label: '🥉',
  },
}

export default async function LeaderboardPage() {
  const players = await getLeaderboard()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-amber-500 text-xs font-semibold tracking-[0.3em] uppercase mb-2">
          Hall of Fame
        </p>
        <h1 className="text-4xl font-black text-zinc-100">
          Leaderboard
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          Updated every 30 seconds &mdash; ranked by total kills
        </p>
      </div>

      {players.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="text-left px-4 py-3 text-zinc-500 font-medium w-16">Rank</th>
                <th className="text-left px-4 py-3 text-zinc-500 font-medium">Player</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Kills</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">Deaths</th>
                <th className="text-right px-4 py-3 text-zinc-500 font-medium">K/D</th>
                <th className="text-center px-4 py-3 text-zinc-500 font-medium">Wallet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {players.map((player, idx) => {
                const rank = idx + 1
                const style = RANK_STYLES[rank]
                return (
                  <tr
                    key={player.username}
                    className={`transition-colors hover:bg-zinc-800/40 ${style?.row ?? ''}`}
                  >
                    <td className="px-4 py-3">
                      {style ? (
                        <span className={style.rank}>{style.label}</span>
                      ) : (
                        <span className="text-zinc-500">#{rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/player/${encodeURIComponent(player.username)}`}
                        className="font-semibold text-zinc-100 hover:text-amber-400 transition-colors"
                      >
                        {player.username}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-200">
                      {player.kills.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-400">
                      {player.deaths.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <KDRatio kd={player.kd} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {player.wallet ? (
                        <span className="text-green-400 font-bold" title={player.wallet}>
                          ✓
                        </span>
                      ) : (
                        <span className="text-zinc-700">✗</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function KDRatio({ kd }: { kd: string }) {
  const val = parseFloat(kd)
  if (val >= 2) return <span className="text-green-400">{kd}</span>
  if (val >= 1) return <span className="text-amber-400">{kd}</span>
  return <span className="text-red-400">{kd}</span>
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 py-20 text-center">
      <div className="text-4xl mb-4">⚔️</div>
      <p className="text-zinc-400 font-semibold text-lg mb-1">No data yet</p>
      <p className="text-zinc-600 text-sm">
        Be the first to get a kill and claim the top spot.
      </p>
    </div>
  )
}
