import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const base = process.env.TOKENOMICS_URL ?? 'http://localhost:4000'
    const res = await fetch(`${base}/public`, { next: { revalidate: 60 } })
    if (!res.ok) throw new Error('tokenomics unavailable')
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(null, { status: 503 })
  }
}
