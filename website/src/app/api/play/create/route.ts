import { NextResponse } from 'next/server'

const NEKO_ROOMS_URL = process.env.NEKO_ROOMS_URL ?? 'http://localhost:3000'
const NEKO_IMAGE = process.env.NEKO_IMAGE ?? 'runepvp-client:latest'
const NEKO_ADMIN_PASSWORD = process.env.NEKO_ADMIN_PASSWORD ?? 'admin'

export async function POST() {
  try {
    const res = await fetch(`${NEKO_ROOMS_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `session-${Date.now()}`,
        neko_image: NEKO_IMAGE,
        max_connections: 1,
        password: 'play',
        admin_password: NEKO_ADMIN_PASSWORD,
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
