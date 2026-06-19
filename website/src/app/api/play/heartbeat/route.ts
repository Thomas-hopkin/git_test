import { NextResponse } from 'next/server'

const SESSION_MANAGER_URL = process.env.SESSION_MANAGER_URL ?? 'http://localhost:5000'

// Keeps a session alive. The browser calls this every ~20s while playing.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = String(body?.id ?? '').trim()
    if (!id) return NextResponse.json({ ok: false }, { status: 400 })

    const res = await fetch(`${SESSION_MANAGER_URL}/session/${id}/heartbeat`, {
      method: 'POST',
      cache: 'no-store',
    })
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : res.status })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}
