import { NextResponse } from 'next/server'

export const revalidate = 30

export async function GET() {
  const gameApiUrl = process.env.GAME_API_URL ?? 'http://localhost:8080'

  try {
    const res = await fetch(`${gameApiUrl}/api/leaderboard`, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Upstream error', status: res.status },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error('[api/leaderboard] fetch error:', err)
    return NextResponse.json({ error: 'Game server unreachable' }, { status: 503 })
  }
}
