import { NextResponse } from 'next/server'

const NEKO_ROOMS_URL = process.env.NEKO_ROOMS_URL ?? 'http://localhost:3000'
const NEKO_IMAGE = process.env.NEKO_IMAGE ?? 'runepvp-client:latest'
const NEKO_ADMIN_PASSWORD = process.env.NEKO_ADMIN_PASSWORD ?? 'admin'
// GAME_HOST must be reachable from inside the Docker container on the VPS.
// Use the VPS public IP (same value as the IP in GAME_API_URL), not 127.0.0.1.
const GAME_HOST = process.env.GAME_HOST ?? '127.0.0.1'
const GAME_PORT = process.env.GAME_PORT ?? '43594'

export async function POST() {
  try {
    const res = await fetch(`${NEKO_ROOMS_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `session-${Date.now()}`,
        neko_image: NEKO_IMAGE,
        max_connections: 1,
        user_pass: 'play',
        admin_pass: NEKO_ADMIN_PASSWORD,
        envs: [
          `GAME_HOST=${GAME_HOST}`,
          `GAME_PORT=${GAME_PORT}`,
        ],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('neko-rooms error:', text)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 502 })
    }

    const room = await res.json()
    // room.url is the WebRTC stream URL, e.g. http://vps-ip:52001/
    return NextResponse.json({ url: room.url, id: room.id })
  } catch (err) {
    console.error('neko-rooms unreachable:', err)
    return NextResponse.json({ error: 'Streaming service unavailable' }, { status: 503 })
  }
}
