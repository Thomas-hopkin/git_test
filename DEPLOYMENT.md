# RUNE PvP — Full Deployment Guide

This guide takes you from zero to a live server. Follow each section in order.

---

## What you'll end up with

```
VPS (your rented server in the cloud)
├── RSMod game server — players connect on port 43594
├── Leaderboard API   — website reads from port 8080
└── neko-rooms        — each "Play Now" click gets a streaming session

Vercel (free website hosting)
└── runepvp.com (or whatever domain you choose)
    ├── /             landing page
    ├── /leaderboard  live kill table
    ├── /play         in-browser game client (WebRTC stream)
    └── /player/:name player profiles
```

---

## Part 1 — Get a VPS

You need a Linux server in the cloud. Recommended providers:

- **Hetzner** (cheapest, European): https://www.hetzner.com/cloud
  - Pick **CX32** (4 vCPU / 8GB RAM / €8/mo) — the streaming needs decent CPU
- **DigitalOcean** (beginner-friendly): https://www.digitalocean.com
  - Pick the **$24/mo Droplet** (2 vCPU / 4GB RAM)

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

### Install Java 17 (needed to run RSMod)
```bash
apt install -y openjdk-17-jdk
java -version
# Should print: openjdk version "17.x.x"
```

### Install Docker
```bash
curl -fsSL https://get.docker.com | sh
docker --version
# Should print: Docker version 24.x.x
```

### Install Docker Compose plugin
```bash
apt install -y docker-compose-plugin
docker compose version
# Should print: Docker Compose version v2.x.x
```

### Install Git
```bash
apt install -y git
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

```bash
cd /home/runepvp

# Build the server (takes 3–5 minutes first time)
./gradlew :server:app:run
```

The first run will:
1. Download all Gradle dependencies
2. Build the game
3. Start the server on port **43594**

You'll see log output. When you see something like `Server started` or players can connect, it's working.

**To run it in the background** (so it keeps running when you close your terminal):

```bash
# Stop it first (Ctrl+C), then:
nohup ./gradlew :server:app:run > /home/runepvp/server.log 2>&1 &
echo $! > /home/runepvp/server.pid
```

To check if it's running: `cat /home/runepvp/server.log | tail -20`
To stop it: `kill $(cat /home/runepvp/server.pid)`

---

## Part 6 — Open firewall ports

Your VPS blocks all ports by default. Open the ones the game needs:

```bash
ufw allow 22        # SSH (keep this or you'll lock yourself out!)
ufw allow 43594     # Game client connections
ufw allow 8080      # Leaderboard API (for the website)
ufw allow 5000      # Session manager (the website's "Play Now" talks to this)
ufw allow 3000      # neko-rooms streaming manager
ufw allow 52000:52100/udp  # WebRTC video streams
ufw allow 52000:52100/tcp
ufw enable
ufw status
```

---

## Part 7 — Set up the streaming (Play in Browser)

### 7a. Get your OSRS client jar

The streaming container needs the same client jar you use locally to connect to your server.
This is the `.jar` file for your OSRS client (RuneLite, or whichever client is configured to point at a custom server).

Copy it to the server. From your **local machine**:
```bash
scp /path/to/your/client.jar root@YOUR_VPS_IP:/home/runepvp/streaming/client/client.jar
```

If you don't have a jar yet, you need a RuneLite build configured for custom servers. The most common approach for RSMod is to use a modified launcher — ask in the RSMod Discord for the recommended client.

### 7b. Configure the streaming environment

```bash
cd /home/runepvp/streaming
cp .env.example .env
nano .env
```

Edit the file to look like this (replace the IP):
```
VPS_IP=5.161.xx.xx        # ← your actual VPS IP
GAME_HOST=5.161.xx.xx     # ← SAME IP. Containers can't reach the host via 127.0.0.1.
GAME_PORT=43594
NEKO_ADMIN_PASSWORD=choose_a_strong_password
MAX_SESSIONS=4            # max simultaneous players (tune to your VPS — see below)
POOL_SIZE=1               # spare containers kept warm for instant launches
```

> **`GAME_HOST` must be your VPS public IP, not `127.0.0.1`.** Each streaming session runs inside its own Docker container, and `127.0.0.1` inside a container points at the container itself, not your game server. Using the public IP makes it reach the host.

> **Capacity:** each session needs roughly 1.5 vCPU and 1.5GB RAM. On the recommended 4 vCPU / 8GB box, `MAX_SESSIONS=4` is a safe ceiling. When all slots are full, additional players see a "you're #N in line" queue and start automatically as slots free up — nothing crashes.

Save: Ctrl+X, then Y, then Enter.

### 7c. Build the streaming Docker image

```bash
cd /home/runepvp
docker build -t runepvp-client ./streaming
```

This builds the container that will run the game client. Takes 2–3 minutes.

### 7d. Start the streaming stack

```bash
cd /home/runepvp/streaming
docker compose up -d --build
docker compose ps
# Should show both 'neko-rooms' and 'session-manager' as running
```

`docker compose up -d` starts two services:
- **neko-rooms** — the WebRTC engine that runs one game container per session
- **session-manager** — the production layer in front of it: keeps containers pre-warmed, caps concurrent players at `MAX_SESSIONS`, queues overflow, sends a heartbeat-based keepalive, and tears down sessions the moment a player leaves. This is what the website's "Play Now" button actually talks to.

`--build` (re)builds the session-manager image from source. To check on it later: `docker compose ps` and `docker compose logs -f session-manager`.

Verify the session manager is healthy:
```bash
curl http://localhost:5000/stats
# Should return something like: {"active":0,"max":4,"pooled":1,"queued":0}
```

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
| `SESSION_MANAGER_URL` | `http://YOUR_VPS_IP:5000` |
| `TOKENOMICS_URL` | `http://YOUR_VPS_IP:4000` |

Replace `YOUR_VPS_IP` with your actual IP. `SESSION_MANAGER_URL` is what powers "Play Now" — it's the only streaming variable the website needs now, since the session manager handles everything else internally.

5. Click **Deploy**

Vercel will build and deploy the site. Takes about 1 minute. You'll get a URL like `git-test-abc123.vercel.app`.

### 8d. (Optional) Add a custom domain

In your Vercel project settings → Domains, add `runepvp.com` or whatever domain you own. Vercel walks you through DNS configuration.

---

## Part 9 — Test everything

1. **Game server**: open your OSRS client and connect to `YOUR_VPS_IP:43594` — you should log in
2. **Leaderboard API**: open `http://YOUR_VPS_IP:8080/api/leaderboard` in a browser — you should see `[]` (empty JSON array)
3. **Website**: open your Vercel URL — the landing page should load
4. **Play Now**: click "Play Now" on the website — it should spin up a session and show the game client in your browser after ~10 seconds

---

## Part 10 — Keeping things running after reboots

To make the game server start automatically:

```bash
cat > /etc/systemd/system/runepvp.service << 'EOF'
[Unit]
Description=RUNE PvP Game Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/runepvp
ExecStart=/home/runepvp/gradlew :server:app:run
Restart=on-failure
RestartSec=10
StandardOutput=append:/home/runepvp/server.log
StandardError=append:/home/runepvp/server.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable runepvp
systemctl start runepvp
systemctl status runepvp
```

neko-rooms already runs as a Docker container, which auto-restarts by default (`restart: unless-stopped` in the docker-compose file).

---

## Troubleshooting

**"Connection refused" on port 43594**
- Check the game server is running: `systemctl status runepvp`
- Check the log: `tail -50 /home/runepvp/server.log`

**Website shows "Streaming service unavailable"**
- Check neko-rooms: `cd /home/runepvp/streaming && docker compose ps`
- Check logs: `docker compose logs --tail=50`
- Make sure port 3000 is open: `ufw status`

**"Play Now" button spins forever**
- The `client.jar` might be missing: `ls -la /home/runepvp/streaming/client/`
- The Docker image might not have built: `docker images | grep runepvp`
- Rebuild: `docker build -t runepvp-client ./streaming`

**WebRTC stream connects but shows black screen**
- The client jar's startup flags may need adjusting in `streaming/start.sh`
- Check what flags your client uses to specify a server address

---

## Updating the server

When code changes are pushed to the branch:

```bash
cd /home/runepvp
git pull origin claude/tech-launch-yia7n0
./gradlew :server:app:run   # or restart the systemd service

# If streaming Dockerfile changed, rebuild:
docker build -t runepvp-client ./streaming
cd streaming && docker compose restart
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

### 11b. Install Node.js on your VPS

SSH into your VPS (see Part 2), then run:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
# Should print: v20.x.x
npm --version
# Should print: 10.x.x
```

---

### 11c. Install the tool's dependencies

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
