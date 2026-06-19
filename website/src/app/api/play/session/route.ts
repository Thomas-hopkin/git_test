import { NextResponse } from 'next/server'

const SESSION_MANAGER_URL = process.env.SESSION_MANAGER_URL ?? 'http://localhost:5000'

// Proxies the browser's session request/poll to the session manager on the VPS.
// Keeps the manager URL server-side and avoids exposing it to the client.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const token = String(body?.token ?? '').trim()
    if (!token) {
      return NextResponse.json({ status: 'error', error: 'token required' }, { status: 400 })
    }

    const res = await fetch(`${SESSION_MANAGER_URL}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { status: 'error', error: 'Streaming service unavailable' },
      { status: 503 },
    )
  }
}
