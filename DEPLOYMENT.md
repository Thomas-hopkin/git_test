# RUNE PvP — Full Deployment Guide

This guide takes you from zero to a live server. Follow each section in order.

---

## What you'll end up with

```
VPS (your rented server in the cloud)
├── 2004Scape game server — serves browser client on port 80
│                         — WebSocket game connection on port 80
├── Leaderboard API       — website reads from port 8080
└── Tokenomics tool       — auto buyback/burn + prize payouts on port 4000

Vercel (free website hosting)
└── runepvp.com (or whatever domain you choose)
    ├── /             landing page
    ├── /leaderboard  live kill table
    ├── /play         "Launch Game" button → opens game client
    ├── /tokenomics   live burn/prize stats
    └── /player/:name player profiles
```

---

## Part 1 — Get a VPS

You need a Linux server in the cloud. Recommended providers:

- **Hetzner** (cheapest, European): https://www.hetzner.com/cloud
  - Pick **CX22** (2 vCPU / 4GB RAM / €4/mo) — enough for 50+ concurrent players
- **DigitalOcean** (beginner-friendly): https://www.digitalocean.com
  - Pick the **$12/mo Droplet** (2 vCPU / 2GB RAM)

When creating the server:
1. Choose **Ubuntu 22.04 LTS** as the operating system
2. Choose the region closest to your players (London for EU, New York for US)
3. Add your **SSH key** (or choose password auth if you don't know what SSH keys are — fine for now)
4. Note down your server's **public IP address** (looks like `5.161.xx.xx`)

---

## Part 2 — Connect to your VPS

On your computer, open a terminal (Mac: Terminal app, Windows: PowerShell or Windows Terminal).

```bash
ssh root@YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with the IP from Part 1. Type `yes` when asked about the fingerprint.

You're now inside your server.

---

## Part 3 — Install the required software

Run these commands one at a time on your VPS. Each one may take a minute.

### Update the system
```bash
apt update && apt upgrade -y
```

### Install Git and curl
```bash
apt install -y git curl unzip
```

### Install Bun (JavaScript runtime — used by the 2004Scape game server)
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
# Should print: 1.x.x
```

### Install Node.js 20 (used by the tokenomics tool)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
# Should print: v20.x.x
```

---

## Part 4 — Download the game server code

```bash
cd /home
git clone https://github.com/Thomas-hopkin/git_test.git runepvp
cd runepvp
git checkout claude/tech-launch-yia7n0
```

This downloads all the code to `/home/runepvp/`.

---

## Part 5 — Build and run the game server

The game server is **2004Scape** (LostCity engine) — a TypeScript OSRS server with a
native browser client. Players open a URL in their browser and play instantly, no
download needed.

### 5a. Run the setup script

```bash
cd /home/runepvp
bash game/setup.sh
```

This will:
1. Clone the 2004Scape Engine-TS, Content, and Client-TS repositories (takes 2–4 minutes)
2. Copy the RUNE PvP custom scripts on top (kill tracking, granite maul spec, commands)
3. Install dependencies and build everything

You'll see progress output. When it finishes you'll see `=== Done! ===`.

### 5b. Wire up the leaderboard server (one-time manual step)

The setup script copies all the custom TypeScript files into the cloned engine, but you
need to add two import lines to the engine's startup file so it actually uses them.

```bash
nano /home/runepvp/game/server/src/app.ts
```

Add these two lines near the top of the file, with the other imports:
```typescript
import { startLeaderboardServer } from './game/pvp/LeaderboardServer';
import { registerPvpOps }        from './engine/script/handlers/PvpOps';
```

Then, a little further down — after the script engine is initialised (look for where other
handlers are registered) — add:
```typescript
startLeaderboardServer();
registerPvpOps(addHandler);   // replace "addHandler" with the engine's actual registration function
```

> **Tip:** run `grep -n "addHandler\|registerHandler\|ScriptOpcode" /home/runepvp/game/server/src/app.ts`
> to find the right place and the right function name in the version you cloned.

Save and exit: **Ctrl+X**, **Y**, **Enter**.

### 5c. Start the server

```bash
cd /home/runepvp/game/server
bun start
```

You'll see log output. When the server is ready you'll see something like:
```
[server] Listening on :80
[leaderboard] HTTP API listening on :8080
```

**To run it in the background:**

```bash
cd /home/runepvp/game/server
nohup bun start > /home/runepvp/game.log 2>&1 &
echo $! > /home/runepvp/game.pid
```

To check: `tail -20 /home/runepvp/game.log`
To stop: `kill $(cat /home/runepvp/game.pid)`

---

## Part 6 — Open firewall ports

Your VPS blocks all ports by default. Open the ones the game needs:

```bash
ufw allow 22        # SSH (keep this or you'll lock yourself out!)
ufw allow 80        # Game client (players open this in their browser)
ufw allow 8080      # Leaderboard API (website reads kill counts from here)
ufw allow 4000      # Tokenomics dashboard
ufw enable
ufw status
```

---

## Part 7 — Verify the browser client works

Open a browser on any device and go to:
```
http://YOUR_VPS_IP
```

You should see the 2004Scape login screen. Create an account and log in — you'll spawn
at Edgeville with a full PvP kit (rune gear + granite maul).

If it doesn't load, check:
```bash
tail -30 /home/runepvp/game.log
# Look for errors or "Listening on :80"
```

> The client is a WebAssembly app served directly by the game server.
> No Docker, no streaming, no plugins — it works in any modern browser.

---

## Part 8 — Deploy the website to Vercel

### 8a. Create a Vercel account

Go to https://vercel.com and sign up with your GitHub account.

### 8b. Import the project

1. In Vercel dashboard, click **Add New → Project**
2. Select your **git_test** repository from the list
3. On the configuration page:
   - **Root Directory**: type `website` (important — don't leave it blank)
   - **Framework Preset**: Next.js (auto-detected)
   - Leave everything else as default
4. **Before clicking Deploy**, add environment variables (next step)

### 8c. Add environment variables in Vercel

Still on the configuration page, scroll to **Environment Variables** and add:

| Name | Value |
|------|-------|
| `GAME_API_URL` | `http://YOUR_VPS_IP:8080` |
| `NEXT_PUBLIC_GAME_CLIENT_URL` | `http://YOUR_VPS_IP` |
| `TOKENOMICS_URL` | `http://YOUR_VPS_IP:4000` |

Replace `YOUR_VPS_IP` with your actual IP.
- `GAME_API_URL` — server-side, used to fetch leaderboard data
- `NEXT_PUBLIC_GAME_CLIENT_URL` — browser-side, the URL the "Launch Game" button links to
- `TOKENOMICS_URL` — server-side, powers the /tokenomics stats page

5. Click **Deploy**

Vercel will build and deploy the site. Takes about 1 minute. You'll get a URL like `git-test-abc123.vercel.app`.

### 8d. (Optional) Add a custom domain

In your Vercel project settings → Domains, add `runepvp.com` or whatever domain you own. Vercel walks you through DNS configuration.

---

## Part 9 — Test everything

1. **Game client**: open `http://YOUR_VPS_IP` in a browser — you should see the 2004Scape login screen
2. **Leaderboard API**: open `http://YOUR_VPS_IP:8080/api/leaderboard` — should return `{"leaderboard":[]}`
3. **Website**: open your Vercel URL — the landing page loads
4. **Play Now**: click "Play Now" on the website → "Launch Game" → the game opens in a new tab
5. **In-game commands**: log in and type `::stats`, `::top`, `::wallet test` — all should respond

---

## Part 10 — Keeping things running after reboots

```bash
cat > /etc/systemd/system/runepvp.service << 'EOF'
[Unit]
Description=RUNE PvP Game Server (2004Scape)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/runepvp/game/server
ExecStart=/root/.bun/bin/bun start
Restart=on-failure
RestartSec=10
StandardOutput=append:/home/runepvp/game.log
StandardError=append:/home/runepvp/game.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable runepvp
systemctl start runepvp
systemctl status runepvp
```

Check it's running: `journalctl -u runepvp -n 30`

---

## Troubleshooting

**Browser shows blank page or can't connect on port 80**
- Check the server is running: `systemctl status runepvp`
- Check the log: `tail -50 /home/runepvp/game.log`
- Make sure port 80 is open: `ufw status`

**Leaderboard shows 0 kills after playing**
- The PvpOps TypeScript handler may not be registered yet (see Part 5b)
- Verify: `curl http://localhost:8080/api/leaderboard` — if it returns 404, the
  leaderboard server didn't start

**::stats / ::top / ::wallet commands do nothing in-game**
- The RuneScript files weren't compiled — run `cd game/server && bun run pack` again
- Then restart the server

**Content script compile errors**
- A RuneScript syntax error in one of the custom `.rs2` files
- Check the pack output for the exact line number, then fix in `game/content/`

---

## Updating the server

When code changes are pushed to the branch:

```bash
cd /home/runepvp
git pull origin claude/tech-launch-yia7n0

# Re-run setup to copy updated custom files
bash game/setup.sh

# Restart
systemctl restart runepvp
```

The website on Vercel updates automatically when you push to GitHub.

---

## Part 11 — Set up the tokenomics tool

### What this does

Every time someone buys or sells your token on pump.fun, pump.fun sends a small fee (in SOL) to your creator wallet. This tool runs in the background on your VPS and automatically:

1. Detects SOL that has accumulated in your wallet from fees
2. Splits it according to your chosen percentages
3. **Buyback & burn**: swaps the SOL for your own token on the open market, then destroys those tokens forever (reducing supply, which pushes the price up)
4. **Prize payouts**: sends SOL directly to the Solana wallets of your top players

You control the split from a web dashboard at `http://YOUR_VPS_IP:4000`. No code changes needed — just type in numbers and click Save.

---

### 11a. How pump.fun creator fees work

When you launch a token on pump.fun you can set a **creator fee** (up to 1%) on every trade. This fee goes to whichever Solana wallet you connected to pump.fun when you created the token. That is the wallet you need to use here.

**To confirm which wallet receives your fees:**
1. Go to your token's page on pump.fun
2. Look for "Creator" — it shows the wallet address
3. That address must match the wallet whose private key you'll set up below

> If you haven't launched your token yet, do that first on pump.fun, then come back here.

---

### 11b. Install the tool's dependencies

```bash
cd /home/runepvp/tokenomics
npm install
```

This downloads the Solana libraries the tool needs. Takes about 30 seconds.

---

### 11d. Get your wallet private key

The tool needs to sign transactions on your behalf (to execute swaps and send prizes). It does this using your wallet's private key.

> ⚠️ **Your private key controls your wallet completely. Anyone who has it can take all your funds. Never share it. Never commit it to GitHub. The `.gitignore` file already prevents `.env` from being uploaded — do not override this.**

**To export from Phantom (mobile):**
1. Open Phantom → tap your wallet name at the top
2. Tap the settings icon (⚙) next to your wallet
3. Tap **Show Secret Recovery Phrase** — no, wait — tap **Export Private Key** instead
4. Enter your Phantom password
5. You'll see a long string of random letters and numbers — that's your private key
6. Copy it

**To export from Phantom (browser extension):**
1. Open Phantom → click the hamburger menu (☰)
2. Settings → Security & Privacy → Export Private Key
3. Enter your password → copy the key

---

### 11e. Create the secret config file

Back in your VPS terminal:

```bash
cd /home/runepvp/tokenomics
cp .env.example .env
nano .env
```

The file looks like this:
```
WALLET_PRIVATE_KEY=your_base58_private_key_here
```

Delete `your_base58_private_key_here` and paste your private key in its place. The line should look like:
```
WALLET_PRIVATE_KEY=5Kd3NBUAdUnhyzenEwVLy8pBKwEFjS8BcuJQFPPQe1xGnBxLKTNxxxxxxxxxx
```

Save and exit: press **Ctrl+X**, then **Y**, then **Enter**.

---

### 11f. Find your token mint address

The mint address is pump.fun's unique identifier for your token — it's the address people use to trade it.

**To find it:**
1. Go to your token's page on pump.fun
2. Look at the URL — it will be something like:
   `https://pump.fun/coin/ABCDEFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. The long string after `/coin/` is your mint address
4. Copy it

Alternatively, in your Phantom wallet, tap on your token → tap the address shown under the token name.

---

### 11g. Configure the tool

```bash
cd /home/runepvp/tokenomics
nano config.json
```

The file looks like this:

```json
{
  "allocation": {
    "buybackBurnPercent": 100,
    "prizesPercent": 0
  },
  "prizes": {
    "topN": 10,
    "distribution": "weighted",
    "weightedShares": [30, 20, 15, 10, 8, 5, 4, 3, 3, 2]
  },
  "schedule": {
    "intervalMinutes": 60,
    "minSolToProcess": 0.05
  },
  "solana": {
    "rpcUrl": "https://api.mainnet-beta.solana.com",
    "tokenMint": "REPLACE_WITH_YOUR_TOKEN_MINT_ADDRESS"
  },
  "gameApi": {
    "url": "http://localhost:8080"
  },
  "dashboard": {
    "port": 4000
  }
}
```

Make two changes:

1. Replace `REPLACE_WITH_YOUR_TOKEN_MINT_ADDRESS` with the mint address you copied in step 11f
2. The `gameApi.url` should already say `http://localhost:8080` — leave it as is (the game server runs on the same machine)

Save and exit: **Ctrl+X**, **Y**, **Enter**.

**What the other settings mean:**
- `buybackBurnPercent: 100` — right now 100% of fees go to buybacks. Change this in the dashboard later.
- `intervalMinutes: 60` — runs once per hour
- `minSolToProcess: 0.05` — won't run if less than 0.05 SOL has accumulated (avoids wasting gas on tiny amounts)
- `weightedShares` — how prizes are split between top players. The defaults give #1 place 30% of the prize pool, #2 gets 20%, etc. You can change these numbers.

---

### 11h. Open the dashboard port

```bash
ufw allow 4000
ufw status
# Should show port 4000 in the list
```

---

### 11i. Test it manually first

Before running it on a schedule, test that everything is wired up correctly:

```bash
cd /home/runepvp/tokenomics
npm start
```

You'll see:
```
Tokenomics dashboard: http://localhost:4000
Cycle runs every 60 minutes
```

Open `http://YOUR_VPS_IP:4000` in your browser. You'll see the dashboard.

Click **Run Now**. One of two things will happen:

- **"Only X SOL available (min: 0.05)"** — the tool is working correctly, you just don't have enough fees yet. That's fine.
- **"✓ Done"** — it ran successfully and either burned tokens or sent prizes (or both).
- **An error message** — see the Troubleshooting section below.

Press **Ctrl+C** to stop it.

---

### 11j. Run it permanently in the background

```bash
# Start it (runs in background, keeps going when you close the terminal)
nohup npm --prefix /home/runepvp/tokenomics start > /home/runepvp/tokenomics/tokenomics.log 2>&1 &
echo $! > /home/runepvp/tokenomics/tokenomics.pid

# Verify it started
tail -5 /home/runepvp/tokenomics/tokenomics.log
# Should show: "Tokenomics dashboard: http://localhost:4000"
```

To check on it later:
```bash
tail -20 /home/runepvp/tokenomics/tokenomics.log
```

To stop it:
```bash
kill $(cat /home/runepvp/tokenomics/tokenomics.pid)
```

**To make it auto-start after a reboot:**

```bash
cat > /etc/systemd/system/runepvp-tokenomics.service << 'EOF'
[Unit]
Description=RUNE PvP Tokenomics
After=network.target runepvp.service

[Service]
Type=simple
User=root
WorkingDirectory=/home/runepvp/tokenomics
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=append:/home/runepvp/tokenomics/tokenomics.log
StandardError=append:/home/runepvp/tokenomics/tokenomics.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable runepvp-tokenomics
systemctl start runepvp-tokenomics
systemctl status runepvp-tokenomics
```

---

### 11k. Using the dashboard

Open `http://YOUR_VPS_IP:4000` any time to change the settings.

**Allocation:**
- **Buyback & Burn %** and **Prize Payouts %** always add up to 100 — change one and the other adjusts automatically
- Recommended starting point: **100% burn / 0% prizes** until the token has real volume
- Switch to **50% burn / 50% prizes** once you have 10+ active players per day

**Top N prize winners:**
- How many players share the prize pool each cycle
- Default is 10 — top 10 players by kill count split the prize SOL

**Run every (minutes):**
- How often the cycle fires automatically
- 60 minutes is a good default — short enough to feel live, long enough for fees to accumulate

**Min SOL to process:**
- The cycle silently skips if your wallet balance is below this number
- Keeps the tool from wasting transaction fees on tiny amounts

**Run Now button:**
- Triggers a cycle immediately regardless of the schedule
- Useful for testing or for manually running a payout after a tournament

**History table:**
- Shows every cycle that has run — when it ran, how much SOL was processed, how many tokens were burned, how much SOL went to prizes, and whether it succeeded

---

### 11l. How prize payouts work end-to-end

1. A player types `::wallet ABC...XYZ` in-game to register their Solana wallet address
2. Their kills are tracked automatically in the leaderboard
3. When the tokenomics cycle runs, it fetches the leaderboard from the game server
4. It filters to only players who have registered a wallet **and** have at least 1 kill
5. It sends SOL directly to those wallets — the player receives it in their Phantom automatically
6. Players can verify their payout at solscan.io by searching their wallet address

Players don't need to claim anything — prizes land in their wallet automatically.

---

### Troubleshooting

**"WALLET_PRIVATE_KEY not set in .env"**
- The `.env` file is missing or in the wrong folder
- Run `ls -la /home/runepvp/tokenomics/` and check `.env` exists
- If not: `cp /home/runepvp/tokenomics/.env.example /home/runepvp/tokenomics/.env` and fill it in again

**"Jupiter quote failed" or "Jupiter swap failed"**
- Jupiter couldn't find a trading route for your token
- This usually means your token hasn't graduated from pump.fun's bonding curve yet (not enough volume)
- Or the token mint address in `config.json` is wrong — double-check it

**"Could not fetch leaderboard from game server"**
- The game server isn't running, or `gameApi.url` in `config.json` is wrong
- Test manually: `curl http://localhost:8080/api/leaderboard` — should return `[]` or a list of players

**"Only X SOL available"**
- Not an error — just means not enough fee SOL has accumulated yet
- Lower `minSolToProcess` in the dashboard if you want it to run on smaller amounts (not recommended below 0.01 due to transaction fees)

**Dashboard won't load at `http://YOUR_VPS_IP:4000`**
- Check the tool is running: `tail -5 /home/runepvp/tokenomics/tokenomics.log`
- Check port 4000 is open: `ufw status`
