import Link from 'next/link'

type HomeStats = {
  killsToday: number
  solPaidOut: string
}

async function getHomeStats(): Promise<HomeStats> {
  try {
    const baseUrl = process.env.GAME_API_URL ?? 'http://localhost:8080'
    const res = await fetch(`${baseUrl}/api/stats`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('stats unavailable')
    return res.json()
  } catch {
    return { killsToday: 0, solPaidOut: '0.00' }
  }
}

export default async function HomePage() {
  const stats = await getHomeStats()

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero */}
      <section className="relative text-center py-28 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <p className="text-amber-500 text-xs font-semibold tracking-[0.3em] uppercase mb-4">
            OSRS-Style Private Server
          </p>
          <h1 className="text-glow text-6xl sm:text-8xl font-black tracking-tighter text-amber-400 mb-4">
            RUNE<span className="text-zinc-100"> PvP</span>
          </h1>
          <p className="text-zinc-400 text-xl sm:text-2xl mb-10 max-w-xl mx-auto">
            Pure PKing.{' '}
            <span className="text-amber-400 font-semibold">Real SOL Prizes.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/play"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-8 py-3.5 rounded-lg transition-colors text-base"
            >
              <DownloadIcon />
              Play Now
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-amber-500 text-zinc-300 hover:text-amber-400 font-semibold px-8 py-3.5 rounded-lg transition-colors text-base"
            >
              View Leaderboard
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border border-zinc-800 rounded-xl bg-zinc-900/60 px-6 py-5 grid grid-cols-2 divide-x divide-zinc-800 mb-20">
        <div className="text-center pr-6">
          <p className="text-3xl font-black text-amber-400">
            {stats.killsToday.toLocaleString()}
          </p>
          <p className="text-zinc-500 text-sm mt-1">Players killed today</p>
        </div>
        <div className="text-center pl-6">
          <p className="text-3xl font-black text-amber-400">
            {stats.solPaidOut} <span className="text-lg font-semibold">SOL</span>
          </p>
          <p className="text-zinc-500 text-sm mt-1">Paid out in prizes</p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid sm:grid-cols-3 gap-6 mb-24">
        <FeatureCard
          icon={<SwordIcon />}
          title="Pure Builds"
          description="Classic 1-def pures, zerkers, and void builds. Compete against players matched to your combat bracket."
        />
        <FeatureCard
          icon={<CoinIcon />}
          title="SOL Prizes"
          description="Every kill earns points. Top PKers cash out real Solana rewards sent directly to your registered wallet."
          highlight
        />
        <FeatureCard
          icon={<ShopIcon />}
          title="Grand Exchange Hub"
          description="Fight in the heart of the Grand Exchange. Spawn with full gear and jump straight into PvP — no grinding required."
        />
      </section>

      {/* CTA */}
      <section className="text-center border border-amber-500/20 bg-amber-500/5 rounded-2xl py-16 mb-8">
        <h2 className="text-3xl font-black text-zinc-100 mb-3">
          Ready to start PKing?
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          No download needed. Click Play Now and you're in the wilderness in seconds.
        </p>
        <Link
          href="/play"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-10 py-3.5 rounded-lg transition-colors"
        >
          <DownloadIcon />
          Play Now — Free
        </Link>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  highlight = false,
}: {
  icon: React.ReactNode
  title: string
  description: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-6 transition-colors ${
        highlight
          ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70'
          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
      }`}
    >
      <div
        className={`inline-flex p-2.5 rounded-lg mb-4 ${
          highlight ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-400'
        }`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-zinc-100 text-lg mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m-4-4l4 4 4-4" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function SwordIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7M5 5l7 7M5 19l7-7" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-2-2h4" />
    </svg>
  )
}

function ShopIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.5-6h15L21 9M3 9h18M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  )
}
