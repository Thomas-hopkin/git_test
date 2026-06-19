import express from 'express'
import { config } from './config'
import { SessionManager } from './manager'

const manager = new SessionManager()
const app = express()
app.use(express.json())

// CORS — the website (on Vercel) calls these endpoints from its API routes.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

// Request (or poll for) a session. Body: { token }.
app.post('/session', async (req, res) => {
  const token = String(req.body?.token ?? '').trim()
  if (!token) {
    res.status(400).json({ status: 'error', error: 'token required' })
    return
  }
  const result = await manager.requestSession(token)
  res.status(result.status === 'error' ? 502 : 200).json(result)
})

// Keep a session alive. The browser calls this every ~20s.
app.post('/session/:id/heartbeat', (req, res) => {
  const ok = manager.heartbeat(req.params.id)
  res.status(ok ? 200 : 404).json({ ok })
})

// Voluntarily end a session (browser tab closed / "Exit" clicked).
app.delete('/session/:id', async (req, res) => {
  await manager.release(req.params.id)
  res.json({ ok: true })
})

app.get('/stats', (_req, res) => res.json(manager.stats()))
app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(config.port, () => {
  console.log(`Session manager listening on :${config.port}`)
  console.log(`Capacity: ${config.limits.maxSessions} sessions, pool size ${config.limits.poolSize}`)
})
