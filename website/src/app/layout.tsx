import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RUNE PvP — Pure PKing. Real SOL Prizes.',
  description:
    'The premier OSRS-style PvP private server with real SOL cryptocurrency prizes. Pure builds, grand exchange, and competitive PKing.',
  keywords: ['OSRS', 'private server', 'PvP', 'PKing', 'SOL', 'Solana', 'runescape'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        <nav className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-lg tracking-widest text-amber-400 hover:text-amber-300 transition-colors">
              RUNE<span className="text-zinc-100"> PvP</span>
            </a>
            <div className="flex items-center gap-6 text-sm">
              <a href="/leaderboard" className="text-zinc-400 hover:text-amber-400 transition-colors">
                Leaderboard
              </a>
              <a href="/tokenomics" className="text-zinc-400 hover:text-amber-400 transition-colors">
                Tokenomics
              </a>
              <a
                href="/play"
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-4 py-1.5 rounded transition-colors text-sm"
              >
                Play Now
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-zinc-800 mt-24 py-8 text-center text-zinc-600 text-sm">
          <p>RUNE PvP &copy; {new Date().getFullYear()} — Not affiliated with Jagex Ltd.</p>
        </footer>
      </body>
    </html>
  )
}
