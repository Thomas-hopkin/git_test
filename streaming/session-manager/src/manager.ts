import { randomUUID } from 'crypto'
import { config } from './config'
import { createRoom, deleteRoom } from './neko'

// Core orchestration: a warm pool of containers, a hard capacity cap with a
// fair FIFO queue, heartbeat liveness, and automatic teardown of dead sessions.

export interface Session {
  id: string
  roomId: string
  url: string
  token: string
  createdAt: number
  lastHeartbeat: number
}

interface QueueEntry {
  token: string
  enqueuedAt: number
  lastSeen: number
}

interface PoolRoom {
  roomId: string
  url: string
}

export type RequestResult =
  | { status: 'ready'; session: { id: string; url: string } }
  | { status: 'queued'; position: number; waiting: number }
  | { status: 'error'; error: string }

export class SessionManager {
  private sessions = new Map<string, Session>() // sessionId -> Session
  private byToken = new Map<string, string>() // player token -> sessionId
  private queue: QueueEntry[] = []
  private pool: PoolRoom[] = []
  private refilling = false

  constructor() {
    setInterval(
      () => this.reap().catch(err => console.error('reaper error:', err)),
      config.timeouts.reaperIntervalMs,
    )
    this.refillPool().catch(err => console.error('initial pool warm error:', err))
  }

  private activeCount(): number {
    return this.sessions.size
  }

  /**
   * The single entry point a player polls. Returns a ready session if one can
   * be given right now (they're at the front of the queue and there's a free
   * slot), otherwise their place in line.
   */
  async requestSession(token: string): Promise<RequestResult> {
    try {
      // Already holding a live session? Refresh its heartbeat and return it.
      // This is also what makes reconnection work: same token => same session.
      const existingId = this.byToken.get(token)
      if (existingId) {
        const s = this.sessions.get(existingId)
        if (s) {
          s.lastHeartbeat = Date.now()
          return { status: 'ready', session: { id: s.id, url: s.url } }
        }
        this.byToken.delete(token)
      }

      // Register/refresh this player's presence in the queue.
      this.touchQueue(token)

      // Only the player at the front of the queue may claim a free slot. This
      // keeps allocation fair and prevents a later arrival from jumping ahead.
      if (this.activeCount() < config.limits.maxSessions && this.isFront(token)) {
        const session = await this.allocate(token)
        this.dequeue(token)
        this.refillPool().catch(() => {})
        return { status: 'ready', session: { id: session.id, url: session.url } }
      }

      return { status: 'queued', position: this.position(token), waiting: this.queue.length }
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : String(err) }
    }
  }

  heartbeat(sessionId: string): boolean {
    const s = this.sessions.get(sessionId)
    if (!s) return false
    s.lastHeartbeat = Date.now()
    return true
  }

  async release(sessionId: string): Promise<void> {
    const s = this.sessions.get(sessionId)
    if (!s) return
    this.sessions.delete(sessionId)
    this.byToken.delete(s.token)
    await deleteRoom(s.roomId).catch(err => console.error('release deleteRoom error:', err))
    this.refillPool().catch(() => {})
  }

  // ─── Queue helpers ──────────────────────────────────────────────────────────

  private isFront(token: string): boolean {
    return this.queue.length === 0 || this.queue[0].token === token
  }

  private position(token: string): number {
    const i = this.queue.findIndex(e => e.token === token)
    return i < 0 ? 0 : i + 1
  }

  private touchQueue(token: string): void {
    const e = this.queue.find(e => e.token === token)
    if (e) {
      e.lastSeen = Date.now()
      return
    }
    this.queue.push({ token, enqueuedAt: Date.now(), lastSeen: Date.now() })
  }

  private dequeue(token: string): void {
    this.queue = this.queue.filter(e => e.token !== token)
  }

  // ─── Allocation & pool ──────────────────────────────────────────────────────

  private async allocate(token: string): Promise<Session> {
    // Prefer a pre-warmed container for an instant start; create on demand if
    // the pool is empty.
    let room = this.pool.shift()
    if (!room) {
      const created = await createRoom(`session-${Date.now()}`)
      room = { roomId: created.id, url: created.url }
    }
    const session: Session = {
      id: randomUUID(),
      roomId: room.roomId,
      url: room.url,
      token,
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
    }
    this.sessions.set(session.id, session)
    this.byToken.set(token, session.id)
    console.log(`allocated session ${session.id} (active=${this.activeCount()}/${config.limits.maxSessions})`)
    return session
  }

  private async refillPool(): Promise<void> {
    if (this.refilling) return
    this.refilling = true
    try {
      // Keep POOL_SIZE spares warm, but never let active + pool exceed the cap.
      const headroom = config.limits.maxSessions - this.activeCount() - this.pool.length
      const target = Math.max(0, Math.min(config.limits.poolSize, headroom))
      for (let i = 0; i < target; i++) {
        const created = await createRoom(`pool-${Date.now()}-${i}`)
        this.pool.push({ roomId: created.id, url: created.url })
      }
    } finally {
      this.refilling = false
    }
  }

  // ─── Reaper ─────────────────────────────────────────────────────────────────

  private async reap(): Promise<void> {
    const now = Date.now()

    for (const s of [...this.sessions.values()]) {
      const idle = now - s.lastHeartbeat
      const age = now - s.createdAt
      if (idle > config.timeouts.heartbeatMs || age > config.timeouts.maxLifetimeMs) {
        const reason = idle > config.timeouts.heartbeatMs ? 'no heartbeat' : 'max lifetime'
        console.log(`reaping session ${s.id} (${reason})`)
        await this.release(s.id)
      }
    }

    // Forget players whose browsers stopped polling — frees their queue slot.
    this.queue = this.queue.filter(e => now - e.lastSeen < config.timeouts.queueStaleMs)
  }

  stats() {
    return {
      active: this.activeCount(),
      max: config.limits.maxSessions,
      pooled: this.pool.length,
      queued: this.queue.length,
    }
  }
}
