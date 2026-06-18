import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: { username: string } }
) {
  const gameApiUrl = process.env.GAME_API_URL ?? 'http://localhost:8080'
  const { username } = params

  if (!username || username.trim() === '') {
    return NextResponse.json({ error: 'username is required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${gameApiUrl}/api/player/${encodeURIComponent(username)}`,
      {
        next: { revalidate: 30 },
        headers: { Accept: 'application/json' },
      }
    )

    if (res.status === 404) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

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
    console.error(`[api/player/${username}] fetch error:`, err)
    return NextResponse.json({ error: 'Game server unreachable' }, { status: 503 })
  }
}
