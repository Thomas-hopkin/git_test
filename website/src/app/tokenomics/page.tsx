import Link from 'next/link'

type TokenomicsData = {
  allocation: { buybackBurnPercent: number; prizesPercent: number }
  prizes: { topN: number; distribution: string }
  schedule: { intervalMinutes: number }
  stats: {
    totalTokensBurned: number
    totalPrizeSol: number
    totalBuybackSol: number
    cyclesRun: number
    lastRun: string | null
  }
}

async function getTokenomics(): Promise<TokenomicsData | null> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/tokenomics`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function TokenomicsPage() {
  const data = await getTokenomics()

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-12">
        <p className="text-amber-500 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
          100% On-Chain & Automatic
        </p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-zinc-100 mb-4">
          Tokenomics
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl">
          Every trade of the RUNE PvP token generates creator fees in SOL.
          Those fees flow automatically — no middleman, no manual payouts.
        </p>
      </div>

      {/* Live stats */}
      {data ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <StatCard
            value={data.stats.totalTokensBurned.toLocaleString()}
            label="Tokens burned"
            highlight
          />
          <StatCard
            value={`${data.stats.totalPrizeSol.toFixed(3)} SOL`}
            label="Paid in prizes"
          />
          <StatCard
            value={`${data.allocation.buybackBurnPercent}%`}
            label="Goes to burn"
          />
          <StatCard
            value={`${data.allocation.prizesPercent}%`}
            label="Goes to prizes"
          />
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 px-6 py-5 mb-12 text-zinc-500 text-sm">
          Live stats unavailable — game server not running yet.
        </div>
      )}

      {/* How it works */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-zinc-100 mb-6">How it works</h2>
        <div className="space-y-4">
          <Step
            number="1"
            title="Trade generates fees"
            description="Every buy or sell of the RUNE PvP token on pump.fun generates a small creator fee in SOL, which flows into the fee wallet automatically."
          />
          <Step
            number="2"
            title="Fees are split"
            description={
              data
                ? `The accumulated SOL is split: ${data.allocation.buybackBurnPercent}% goes to buyback & burn, ${data.allocation.prizesPercent}% goes to player prizes. This runs automatically every ${data.schedule.intervalMinutes} minutes.`
                : "The accumulated SOL is split between buyback & burn and player prizes on a configurable schedule."
            }
          />
          <Step
            number="3"
            title="Buyback & burn"
            description="The buyback portion swaps SOL for RUNE PvP tokens on the open market via Jupiter. Those tokens are then permanently destroyed — reducing total supply and increasing scarcity."
          />
          <Step
            number="4"
            title="Prize payouts"
            description={
              data
                ? `The prize portion is split between the top ${data.prizes.topN} players by kill count. Payouts land directly in their Solana wallets — no claiming required.`
                : "The prize portion is split between the top players by kill count and sent directly to their Solana wallets."
            }
          />
        </div>
      </div>

      {/* Prize distribution */}
      <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-6 mb-12">
        <h2 className="text-lg font-bold text-zinc-100 mb-2">Prize distribution</h2>
        <p className="text-zinc-400 text-sm mb-5">
          Prizes are weighted — top players earn more. The split below shows how each hourly prize
          pool is divided among the top{' '}
          {data ? data.prizes.topN : 10} players.
        </p>
        <div className="space-y-2">
          {[
            { place: '1st', pct: 30 },
            { place: '2nd', pct: 20 },
            { place: '3rd', pct: 15 },
            { place: '4th', pct: 10 },
            { place: '5th', pct: 8 },
            { place: '6th', pct: 5 },
            { place: '7th–10th', pct: 3 },
          ].map(({ place, pct }) => (
            <div key={place} className="flex items-center gap-3">
              <span className="text-zinc-500 text-sm w-16 shrink-0">{place}</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-amber-400 h-2 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-amber-400 font-semibold text-sm w-10 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Adjustable */}
      <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-6 mb-12">
        <h2 className="text-lg font-bold text-zinc-100 mb-2">Allocation is adjustable</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          The burn/prize split is not fixed. It can be adjusted at any time based on what the
          community needs. Early on, 100% of fees may go to buybacks to build deflationary
          pressure. As the player base grows, the allocation shifts toward prizes to reward active
          players. Every change is visible in the stats above — nothing is hidden.
        </p>
      </div>

      {/* How to earn prizes */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-zinc-100 mb-4">How to earn prizes</h2>
        <ol className="space-y-3 text-zinc-400 text-sm">
          <li className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">1.</span>
            <span>Log in to the game server and start PKing. Every kill counts toward your rank.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">2.</span>
            <span>
              Register your Solana wallet address in-game by typing{' '}
              <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">
                ::wallet YOUR_WALLET_ADDRESS
              </code>
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-400 font-bold shrink-0">3.</span>
            <span>
              Stay in the top {data ? data.prizes.topN : 10} on the{' '}
              <Link href="/leaderboard" className="text-amber-400 hover:text-amber-300 underline">
                leaderboard
              </Link>
              . Prizes land in your wallet automatically each cycle.
            </span>
          </li>
        </ol>
      </div>

      <div className="flex gap-4">
        <Link
          href="/play"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          Play Now
        </Link>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 border border-zinc-700 hover:border-amber-500 text-zinc-300 hover:text-amber-400 font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          View Leaderboard
        </Link>
      </div>

      {data?.stats.lastRun && (
        <p className="text-zinc-600 text-xs mt-8">
          Last cycle: {new Date(data.stats.lastRun).toLocaleString()}
        </p>
      )}
    </div>
  )
}

function StatCard({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-amber-500/40 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/40'}`}>
      <p className={`text-xl font-black ${highlight ? 'text-amber-400' : 'text-zinc-100'}`}>{value}</p>
      <p className="text-zinc-500 text-xs mt-1">{label}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
        {number}
      </div>
      <div className="pt-1">
        <p className="font-semibold text-zinc-100 mb-1">{title}</p>
        <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
