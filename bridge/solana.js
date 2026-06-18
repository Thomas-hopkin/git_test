const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');
const {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');

// Configure these in .env or directly here
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const TOKEN_MINT = process.env.TOKEN_MINT_ADDRESS; // Your SPL token mint address
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY; // Base58 private key of server wallet

const connection = new Connection(RPC_URL, 'confirmed');

function getServerKeypair() {
  if (!SERVER_PRIVATE_KEY) throw new Error('SERVER_PRIVATE_KEY not set');
  const bs58 = require('bs58');
  return Keypair.fromSecretKey(bs58.decode(SERVER_PRIVATE_KEY));
}

async function sendTokens(toAddress, amount) {
  if (!TOKEN_MINT) throw new Error('TOKEN_MINT_ADDRESS not set');

  const serverKeypair = getServerKeypair();
  const mintPubkey = new PublicKey(TOKEN_MINT);
  const toPubkey = new PublicKey(toAddress);

  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    serverKeypair,
    mintPubkey,
    serverKeypair.publicKey
  );

  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    serverKeypair,
    mintPubkey,
    toPubkey
  );

  const tx = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      serverKeypair.publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [serverKeypair]);
  return signature;
}

async function getServerTokenBalance() {
  if (!TOKEN_MINT || !SERVER_PRIVATE_KEY) return 0;
  const serverKeypair = getServerKeypair();
  const mintPubkey = new PublicKey(TOKEN_MINT);
  const accounts = await connection.getParsedTokenAccountsByOwner(serverKeypair.publicKey, { mint: mintPubkey });
  if (!accounts.value.length) return 0;
  return accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
}

module.exports = { sendTokens, getServerTokenBalance, connection };
