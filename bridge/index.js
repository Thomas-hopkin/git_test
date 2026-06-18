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

const DAILY_RUNE = 10;

// Award daily login RUNE — called on player login
app.post('/daily-claim', auth, (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Missing username' });
  const result = db.dailyClaim(username, DAILY_RUNE);
  res.json(result);
});

const RSA_MODULUS = process.env.RSA_MODULUS || 'bd7bc24d6bbcf0de2525fc75678fc47e89d1173919ff5cda37ff99dca5f7054804cc90c6166e23021f10d2da939f60432675ca46edf44a8dee0c6d59ddd747405f40280ea21b63eb5bd3d5227e9bd3fe4753fcd4f1dffdf98667c556868d086e8c07103649d31497ea219bec171918374f2915ddf0958341b6ef7fdb00453183';
const GAME_PORT = process.env.GAME_PORT || 43594;
const SERVER_HOST = process.env.SERVER_HOST || '127.0.0.1';
const GAME_REVISION = process.env.GAME_REVISION || 233;

// RSProx proxy target config — import this YAML file into RSProx
app.get('/proxy-targets.yaml', (req, res) => {
  res.type('text/plain').send(
    `config:\n` +
    `  - name: RSMod PvP\n` +
    `    jav_config_url: http://${SERVER_HOST}:${PORT}/jav_config.ws\n` +
    `    modulus: ${RSA_MODULUS}\n` +
    `    revision: 233\n` +
    `    game_server_port: ${GAME_PORT}\n`
  );
});

// OSRS client configuration served to RSProx
app.get('/jav_config.ws', (req, res) => {
  res.type('text/plain').send(
    `title=RSMod PvP\n` +
    `param=25=${GAME_REVISION}\n` +
    `param=17=http://${SERVER_HOST}:${PORT}/worldlist.ws\n` +
    `advertised=0\n` +
    `codebase=http://${SERVER_HOST}/\n` +
    `cachedir=.jagex_cache_32\n` +
    `storebase=0\n` +
    `objecttag=0\n` +
    `disableworld=0\n` +
    `viewerversion=100\n` +
    `win_sub_version=1\n` +
    `mac_sub_version=2\n` +
    `otherSub_version=2\n` +
    `lang=0\n` +
    `free_to_play_codebase=\n` +
    `lowdetail=0\n` +
    `modewhere=1\n` +
    `modeWhat=0\n` +
    `search_rsa_exponent=10001\n` +
    `search_rsa_modulus=${RSA_MODULUS}\n` +
    `initial_class=client.class\n` +
    `initial_jar=jagexappletviewer.jar\n` +
    `browserControl=0\n` +
    `window_preferredwidth=800\n` +
    `window_preferredheight=600\n` +
    `advert_height=0\n` +
    `unsafe=0\n` +
    `cookieid=\n` +
    `world=1,0,${SERVER_HOST},${GAME_PORT},RSMod PvP\n`
  );
});

// OSRS binary world list — RSProx downloads this from param=17 in jav_config.ws
// Format: [payloadSize:4][worldCount:2]([id:2][props:4][host:str0][activity:str0][loc:1][pop:2])*
// Strings are NUL-terminated (0x00). All ints big-endian.
app.get('/worldlist.ws', (req, res) => {
  const hostStr = Buffer.from(SERVER_HOST + '\0', 'latin1');
  const activityStr = Buffer.from('RSMod PvP\0', 'latin1');

  const perWorldSize = 2 + 4 + hostStr.length + activityStr.length + 1 + 2;
  const payloadSize = 2 + perWorldSize; // world count + one world
  const buf = Buffer.alloc(4 + payloadSize);
  let off = 0;

  buf.writeUInt32BE(payloadSize, off); off += 4;
  buf.writeUInt16BE(1, off); off += 2;           // 1 world
  buf.writeUInt16BE(1, off); off += 2;           // world id = 1
  buf.writeUInt32BE(0, off); off += 4;           // properties (free, no flags)
  hostStr.copy(buf, off); off += hostStr.length;
  activityStr.copy(buf, off); off += activityStr.length;
  buf.writeUInt8(0, off); off += 1;              // location
  buf.writeInt16BE(1, off); off += 2;            // population

  res.type('application/octet-stream').send(buf);
});

app.listen(PORT, () => {
  console.log(`Solana bridge running on port ${PORT}`);
  console.log(`Token mint: ${process.env.TOKEN_MINT_ADDRESS || '(not set — configure TOKEN_MINT_ADDRESS)'}`);
});
