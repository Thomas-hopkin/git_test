import { Connection } from '@solana/web3.js'
import { Config } from './config'
import { getKeypair, getBalance, buyAndBurn, sendPrizes } from './solana'

export interface PrizeEntry {
  username: string
  wallet: string
  amount: number
}

export interface CycleResult {
  timestamp: string
  solAvailable: number
  solProcessed: number
  buybackSol: number
  prizesSol: number
  tokensBurned: number
  prizesAwarded: PrizeEntry[]
  txids: string[]
  error?: string
}

const SOL_RESERVE = 0.05 // always keep this much for transaction fees

export async function runCycle(config: Config): Promise<CycleResult> {
  const result: CycleResult = {
    timestamp: new Date().toISOString(),
    solAvailable: 0,
    solProcessed: 0,
    buybackSol: 0,
    prizesSol: 0,
    tokensBurned: 0,
    prizesAwarded: [],
    txids: [],
  }

  try {
    const connection = new Connection(config.solana.rpcUrl, 'confirmed')
    const keypair = getKeypair()

    const balance = await getBalance(connection, keypair.publicKey)
    const available = Math.max(0, balance - SOL_RESERVE)
    result.solAvailable = available

    if (available < config.schedule.minSolToProcess) {
      result.error = `Only ${available.toFixed(4)} SOL available (min: ${config.schedule.minSolToProcess})`
      return result
    }

    result.solProcessed = available
    result.buybackSol = available * (config.allocation.buybackBurnPercent / 100)
    result.prizesSol = available * (config.allocation.prizesPercent / 100)

    // Buyback and burn
    if (result.buybackSol >= 0.001) {
      const { tokensBurned, txid } = await buyAndBurn(
        connection, keypair, config.solana.tokenMint, result.buybackSol,
      )
      result.tokensBurned = tokensBurned
      result.txids.push(txid)
    }

    // Prize payouts
    if (result.prizesSol >= 0.001) {
      const leaderboardRes = await fetch(`${config.gameApi.url}/api/leaderboard`)
      if (!leaderboardRes.ok) throw new Error('Could not fetch leaderboard from game server')
      const players: Array<{ username: string; kills: number; wallet?: string }> = await leaderboardRes.json()

      const eligible = players
        .filter(p => p.wallet && p.kills > 0)
        .slice(0, config.prizes.topN)

      if (eligible.length > 0) {
        const rawShares =
          config.prizes.distribution === 'weighted'
            ? config.prizes.weightedShares.slice(0, eligible.length)
            : eligible.map(() => 1)

        const totalShares = rawShares.reduce((a, b) => a + b, 0)

        const payments: PrizeEntry[] = eligible.map((p, i) => ({
          username: p.username,
          wallet: p.wallet!,
          amount: result.prizesSol * (rawShares[i] / totalShares),
        }))

        const txids = await sendPrizes(connection, keypair, payments)
        result.prizesAwarded = payments
        result.txids.push(...txids)
      }
    }
  } catch (err: unknown) {
    result.error = err instanceof Error ? err.message : String(err)
  }

  return result
}
