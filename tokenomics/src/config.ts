import fs from 'fs'
import path from 'path'

export interface Config {
  allocation: {
    buybackBurnPercent: number
    prizesPercent: number
  }
  prizes: {
    topN: number
    distribution: 'equal' | 'weighted'
    weightedShares: number[]
  }
  schedule: {
    intervalMinutes: number
    minSolToProcess: number
  }
  solana: {
    rpcUrl: string
    tokenMint: string
  }
  gameApi: {
    url: string
  }
  dashboard: {
    port: number
  }
}

const CONFIG_PATH = path.join(__dirname, '..', 'config.json')

export function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
}
