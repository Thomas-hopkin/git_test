import { randomBytes } from 'crypto'
import { config } from './config'

// Thin client for the neko-rooms REST API (creates/destroys streaming containers).

export interface NekoRoom {
  id: string
  url: string
}

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.neko.auth) h['Authorization'] = config.neko.auth
  return h
}

export async function createRoom(name: string): Promise<NekoRoom> {
  const res = await fetch(`${config.neko.url}/api/rooms`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name,
      neko_image: config.neko.image,
      max_connections: 1,
      user_pass: 'play',
      admin_pass: randomBytes(12).toString('hex'),
      envs: [`GAME_HOST=${config.game.host}`, `GAME_PORT=${config.game.port}`],
    }),
  })
  if (!res.ok) {
    throw new Error(`neko createRoom failed: ${res.status} ${await res.text()}`)
  }
  const room = (await res.json()) as { id: string; url: string }
  return { id: room.id, url: room.url }
}

export async function deleteRoom(id: string): Promise<void> {
  const res = await fetch(`${config.neko.url}/api/rooms/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  // A 404 means it's already gone — that's the state we wanted anyway.
  if (!res.ok && res.status !== 404) {
    throw new Error(`neko deleteRoom failed: ${res.status} ${await res.text()}`)
  }
}
