import 'dotenv/config'

function num(name: string, def: number): number {
  const v = process.env[name]
  return v !== undefined && v !== '' ? Number(v) : def
}

export const config = {
  port: num('PORT', 5000),
  neko: {
    url: process.env.NEKO_ROOMS_URL ?? 'http://localhost:3000',
    auth: process.env.NEKO_ROOMS_AUTH ?? '',
    image: process.env.NEKO_IMAGE ?? 'runepvp-client:latest',
  },
  game: {
    host: process.env.GAME_HOST ?? '127.0.0.1',
    port: process.env.GAME_PORT ?? '43594',
  },
  limits: {
    maxSessions: num('MAX_SESSIONS', 4),
    poolSize: num('POOL_SIZE', 1),
  },
  timeouts: {
    heartbeatMs: num('HEARTBEAT_TIMEOUT_MS', 60_000),
    maxLifetimeMs: num('SESSION_MAX_LIFETIME_MS', 2 * 60 * 60_000),
    queueStaleMs: num('QUEUE_STALE_MS', 15_000),
    reaperIntervalMs: num('REAPER_INTERVAL_MS', 10_000),
  },
}
