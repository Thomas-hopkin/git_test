import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, burn } from '@solana/spl-token'
import bs58 from 'bs58'

export function getKeypair(): Keypair {
  const raw = process.env.WALLET_PRIVATE_KEY
  if (!raw) throw new Error('WALLET_PRIVATE_KEY not set in .env')
  // Support both base58 string and JSON byte-array formats
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return Keypair.fromSecretKey(Uint8Array.from(arr))
  } catch {}
  return Keypair.fromSecretKey(bs58.decode(raw))
}

export async function getBalance(connection: Connection, pubkey: PublicKey): Promise<number> {
  return (await connection.getBalance(pubkey)) / LAMPORTS_PER_SOL
}

export async function buyAndBurn(
  connection: Connection,
  keypair: Keypair,
  tokenMint: string,
  solAmount: number,
): Promise<{ tokensBurned: number; txid: string }> {
  const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL)

  // 1. Get a swap quote from Jupiter (SOL → token)
  const quoteRes = await fetch(
    `https://quote-api.jup.ag/v6/quote` +
    `?inputMint=So11111111111111111111111111111111111111112` +
    `&outputMint=${tokenMint}` +
    `&amount=${lamports}` +
    `&slippageBps=500`,
  )
  if (!quoteRes.ok) throw new Error(`Jupiter quote failed: ${await quoteRes.text()}`)
  const quote = await quoteRes.json()

  // 2. Build the swap transaction
  const swapRes = await fetch('https://quote-api.jup.ag/v6/swap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey: keypair.publicKey.toString(),
      wrapAndUnwrapSol: true,
    }),
  })
  if (!swapRes.ok) throw new Error(`Jupiter swap failed: ${await swapRes.text()}`)
  const { swapTransaction } = await swapRes.json()

  // 3. Sign and send
  const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'))
  tx.sign([keypair])
  const txid = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false })
  await connection.confirmTransaction(txid, 'confirmed')

  // 4. Burn all received tokens
  const mintPubkey = new PublicKey(tokenMint)
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection, keypair, mintPubkey, keypair.publicKey,
  )
  const tokenBalance = Number(tokenAccount.amount)
  if (tokenBalance > 0) {
    await burn(connection, keypair, tokenAccount.address, mintPubkey, keypair, BigInt(tokenBalance))
  }

  return { tokensBurned: tokenBalance, txid }
}

export async function sendPrizes(
  connection: Connection,
  keypair: Keypair,
  prizes: Array<{ wallet: string; amount: number }>,
): Promise<string[]> {
  const txids: string[] = []
  for (const prize of prizes) {
    if (prize.amount < 0.001) continue
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(prize.wallet),
        lamports: Math.floor(prize.amount * LAMPORTS_PER_SOL),
      }),
    )
    const txid = await sendAndConfirmTransaction(connection, tx, [keypair])
    txids.push(txid)
  }
  return txids
}
