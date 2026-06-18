import 'dotenv/config'
import express from 'express'
import cron from 'node-cron'
import fs from 'fs'
import path from 'path'
import { loadConfig, saveConfig, Config } from './config'
import { runCycle, CycleResult } from './cycle'

const HISTORY_PATH = path.join(__dirname, '..', 'history.json')

function loadHistory(): CycleResult[] {
  try { return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8')) } catch { return [] }
}

function appendHistory(result: CycleResult) {
  const history = loadHistory()
  history.push(result)
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history.slice(-200), null, 2))
}

// Scheduler
let cronJob: cron.ScheduledTask | null = null
let running = false

function startScheduler(config: Config) {
  cronJob?.stop()
  const mins = Math.max(1, config.schedule.intervalMinutes)
  // node-cron doesn't support arbitrary minute intervals via */N for N>59
  // so we use a 1-minute tick and track elapsed time ourselves
  let ticksSinceLast = 0
  cronJob = cron.schedule('* * * * *', async () => {
    ticksSinceLast++
    if (ticksSinceLast < mins) return
    ticksSinceLast = 0
    if (running) return
    running = true
    const cfg = loadConfig()
    console.log(`[${new Date().toISOString()}] Running scheduled cycle...`)
    const result = await runCycle(cfg)
    appendHistory(result)
    if (result.error) {
      console.error(`Cycle error: ${result.error}`)
    } else {
      console.log(`Cycle done — burned ${result.tokensBurned.toLocaleString()} tokens, paid ${result.prizesSol.toFixed(4)} SOL in prizes`)
    }
    running = false
  })
}

// Dashboard
const app = express()
app.use(express.json())

app.get('/', (_req, res) => {
  res.send(buildDashboard(loadConfig(), loadHistory()))
})

app.post('/config', (req, res) => {
  const { buybackBurnPercent, prizesPercent, topN, intervalMinutes, minSolToProcess } = req.body
  const burn = Number(buybackBurnPercent)
  const prizes = Number(prizesPercent)
  if (Math.round(burn + prizes) !== 100) {
    res.status(400).json({ error: 'Percentages must add up to 100' })
    return
  }
  const config = loadConfig()
  config.allocation.buybackBurnPercent = burn
  config.allocation.prizesPercent = prizes
  config.prizes.topN = Number(topN)
  config.schedule.intervalMinutes = Number(intervalMinutes)
  config.schedule.minSolToProcess = Number(minSolToProcess)
  saveConfig(config)
  startScheduler(config)
  res.json({ ok: true })
})

app.post('/run-now', async (_req, res) => {
  if (running) { res.status(409).json({ error: 'Already running' }); return }
  running = true
  const config = loadConfig()
  console.log(`[${new Date().toISOString()}] Manual cycle triggered`)
  const result = await runCycle(config)
  appendHistory(result)
  running = false
  res.json(result)
})

const config = loadConfig()
startScheduler(config)
app.listen(config.dashboard.port, () => {
  console.log(`Tokenomics dashboard: http://localhost:${config.dashboard.port}`)
  console.log(`Cycle runs every ${config.schedule.intervalMinutes} minutes`)
})

// ─── Dashboard HTML ──────────────────────────────────────────────────────────

function buildDashboard(config: Config, history: CycleResult[]): string {
  const recent = history.slice(-20).reverse()
  const totalBurned = history.reduce((s, r) => s + r.tokensBurned, 0)
  const totalPrizes = history.reduce((s, r) => s + r.prizesSol, 0)

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RUNE PvP — Tokenomics</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }
    body { font-family: system-ui, -apple-system, sans-serif; background: #09090b; color: #e4e4e7; min-height: 100vh; padding: 24px 16px }
    h1 { color: #f59e0b; font-size: 1.4rem; font-weight: 800; margin-bottom: 6px }
    .subtitle { color: #71717a; font-size: .85rem; margin-bottom: 24px }
    h2 { font-size: .75rem; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 14px }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 16px }
    .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px }
    .stat { background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 16px }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: #f59e0b }
    .stat-label { font-size: .75rem; color: #71717a; margin-top: 2px }
    label { display: block; font-size: .8rem; color: #a1a1aa; margin-bottom: 4px; margin-top: 14px }
    label:first-of-type { margin-top: 0 }
    input[type=number] { width: 100%; background: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 9px 12px; color: #fff; font-size: .95rem }
    input:focus { outline: 2px solid #f59e0b; border-color: transparent }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: .875rem; cursor: pointer; border: none; transition: opacity .15s }
    .btn:hover { opacity: .85 }
    .btn-primary { background: #f59e0b; color: #000 }
    .btn-secondary { background: #27272a; color: #e4e4e7 }
    .btn-row { display: flex; gap: 10px; margin-top: 18px }
    #status { margin-top: 10px; font-size: .85rem; min-height: 20px; color: #a1a1aa }
    .hint { font-size: .75rem; color: #52525b; margin-top: 4px }
    table { width: 100%; border-collapse: collapse; font-size: .8rem }
    thead th { text-align: left; color: #52525b; font-weight: 600; padding: 0 8px 8px; border-bottom: 1px solid #27272a }
    tbody td { padding: 8px; border-bottom: 1px solid #1c1c1f; color: #d4d4d8; vertical-align: top }
    tbody tr:last-child td { border-bottom: none }
    .ok { color: #4ade80 }
    .err { color: #f87171 }
    .mono { font-family: monospace; font-size: .75rem }
    @media (min-width: 640px) { body { max-width: 700px; margin: 0 auto } }
  </style>
</head>
<body>
  <h1>RUNE PvP — Tokenomics</h1>
  <p class="subtitle">Fees → Buyback & Burn + Prize Payouts</p>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${totalBurned.toLocaleString()}</div>
      <div class="stat-label">Total tokens burned</div>
    </div>
    <div class="stat">
      <div class="stat-value">${totalPrizes.toFixed(3)}</div>
      <div class="stat-label">Total SOL paid in prizes</div>
    </div>
  </div>

  <div class="card">
    <h2>Allocation</h2>
    <form id="configForm">
      <div class="row">
        <div>
          <label>Buyback & Burn %</label>
          <input name="buybackBurnPercent" type="number" min="0" max="100" step="1" value="${config.allocation.buybackBurnPercent}" id="burnInput">
        </div>
        <div>
          <label>Prize Payouts %</label>
          <input name="prizesPercent" type="number" min="0" max="100" step="1" value="${config.allocation.prizesPercent}" id="prizeInput">
        </div>
      </div>
      <p class="hint">Must add up to 100. Example: 100/0 = all burns. 50/50 = split.</p>

      <div class="row">
        <div>
          <label>Top N prize winners</label>
          <input name="topN" type="number" min="1" max="100" value="${config.prizes.topN}">
        </div>
        <div>
          <label>Run every (minutes)</label>
          <input name="intervalMinutes" type="number" min="5" value="${config.schedule.intervalMinutes}">
        </div>
      </div>

      <label>Min SOL to process per cycle</label>
      <input name="minSolToProcess" type="number" step="0.01" min="0.01" value="${config.schedule.minSolToProcess}">
      <p class="hint">Skips the cycle if your wallet has less than this. Avoids wasting gas on tiny amounts.</p>

      <div class="btn-row">
        <button type="submit" class="btn btn-primary">Save Settings</button>
        <button type="button" class="btn btn-secondary" id="runNow">Run Now</button>
      </div>
      <p id="status"></p>
    </form>
  </div>

  <div class="card">
    <h2>Recent Cycles</h2>
    ${recent.length === 0 ? '<p style="color:#52525b;font-size:.85rem">No cycles run yet. Click "Run Now" to test.</p>' : `
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>SOL in</th>
          <th>Burned</th>
          <th>Prizes</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${recent.map(r => `
        <tr>
          <td class="mono">${new Date(r.timestamp).toLocaleString()}</td>
          <td>${r.solProcessed.toFixed(4)}</td>
          <td>${r.tokensBurned.toLocaleString()}</td>
          <td>${r.prizesSol.toFixed(4)} SOL${r.prizesAwarded.length > 0 ? ` (${r.prizesAwarded.length} players)` : ''}</td>
          <td class="${r.error ? 'err' : 'ok'}">${r.error ? '✗ ' + r.error : '✓'}</td>
        </tr>`).join('')}
      </tbody>
    </table>`}
  </div>

  <script>
    const form = document.getElementById('configForm')
    const status = document.getElementById('status')
    const burnInput = document.getElementById('burnInput')
    const prizeInput = document.getElementById('prizeInput')

    // Auto-sync the two inputs to always sum to 100
    burnInput.addEventListener('input', () => { prizeInput.value = 100 - Number(burnInput.value) })
    prizeInput.addEventListener('input', () => { burnInput.value = 100 - Number(prizeInput.value) })

    form.addEventListener('submit', async e => {
      e.preventDefault()
      status.textContent = 'Saving...'
      const data = Object.fromEntries(new FormData(e.target))
      const res = await fetch('/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const j = await res.json()
      status.textContent = j.error ? '✗ ' + j.error : '✓ Saved!'
    })

    document.getElementById('runNow').addEventListener('click', async () => {
      status.textContent = 'Running cycle...'
      const res = await fetch('/run-now', { method: 'POST' })
      const j = await res.json()
      if (j.error) {
        status.textContent = '✗ ' + j.error
      } else {
        status.textContent = '✓ Done — ' + j.tokensBurned.toLocaleString() + ' tokens burned, ' + Number(j.prizesSol).toFixed(4) + ' SOL in prizes'
        setTimeout(() => location.reload(), 1500)
      }
    })
  </script>
</body>
</html>`
}
