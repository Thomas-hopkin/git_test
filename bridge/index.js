const express = require('express');
const db = require('./db');
const { sendTokens } = require('./solana');

const app = express();
app.use(express.json());

const PORT = process.env.BRIDGE_PORT || 4567;
// Simple shared secret so only the game server can call these endpoints
const API_KEY = process.env.BRIDGE_API_KEY || 'changeme';

function auth(req, res, next) {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Link a player's Solana wallet address to their account
// Called when player types ::wallet link <address>
app.post('/wallet/link', auth, (req, res) => {
  const { username, address } = req.body;
  if (!username || !address) return res.status(400).json({ error: 'Missing username or address' });

  try {
    new (require('@solana/web3.js').PublicKey)(address);
  } catch {
    return res.status(400).json({ error: 'Invalid Solana address' });
  }

  db.linkWallet(username, address);
  res.json({ ok: true });
});

// Get linked wallet for a player
app.get('/wallet/:username', auth, (req, res) => {
  const row = db.getWallet(req.params.username);
  if (!row) return res.status(404).json({ error: 'No wallet linked' });
  res.json({ address: row.wallet_address });
});

// Get a player's in-game token balance
app.get('/balance/:username', auth, (req, res) => {
  const amount = db.getBalance(req.params.username);
  res.json({ amount });
});

// Credit tokens to a player's in-game account (used by deposit watcher)
app.post('/credit', auth, (req, res) => {
  const { username, amount } = req.body;
  if (!username || !amount || amount <= 0) return res.status(400).json({ error: 'Invalid params' });
  db.credit(username, Math.floor(amount));
  res.json({ ok: true, balance: db.getBalance(username) });
});

// Withdraw tokens from in-game account to player's Solana wallet
// Called when player types ::withdraw <amount>
app.post('/withdraw', auth, async (req, res) => {
  const { username, amount } = req.body;
  if (!username || !amount || amount <= 0) return res.status(400).json({ error: 'Invalid params' });

  const wallet = db.getWallet(username);
  if (!wallet) return res.status(400).json({ error: 'No wallet linked. Use ::wallet link <address> first.' });

  const deducted = db.debit(username, Math.floor(amount));
  if (!deducted) return res.status(400).json({ error: 'Insufficient balance' });

  try {
    const signature = await sendTokens(wallet.wallet_address, Math.floor(amount));
    db.logWithdrawal(username, Math.floor(amount), signature);
    res.json({ ok: true, signature, remaining: db.getBalance(username) });
  } catch (err) {
    // Refund on failure
    db.credit(username, Math.floor(amount));
    console.error('Withdraw failed:', err);
    res.status(500).json({ error: 'Transaction failed. Tokens refunded.' });
  }
});

app.listen(PORT, () => {
  console.log(`Solana bridge running on port ${PORT}`);
  console.log(`Token mint: ${process.env.TOKEN_MINT_ADDRESS || '(not set — configure TOKEN_MINT_ADDRESS)'}`);
});
