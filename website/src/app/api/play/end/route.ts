import { NextResponse } from 'next/server'

const SESSION_MANAGER_URL = process.env.SESSION_MANAGER_URL ?? 'http://localhost:5000'

// Tears down a session when the player leaves. Best-effort — the manager will
// also reap it automatically once heartbeats stop.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = String(body?.id ?? '').trim()
    if (!id) return NextResponse.json({ ok: false }, { status: 400 })

    await fetch(`${SESSION_MANAGER_URL}/session/${id}`, {
      method: 'DELETE',
      cache: 'no-store',
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
