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
GAME_HOST=127.0.0.1       # game server is on same machine
GAME_PORT=43594
NEKO_ADMIN_PASSWORD=choose_a_strong_password
```

Save: Ctrl+X, then Y, then Enter.

### 7c. Build the streaming Docker image

```bash
cd /home/runepvp
docker build -t runepvp-client ./streaming
```

This builds the container that will run the game client. Takes 2–3 minutes.

### 7d. Start neko-rooms

```bash
cd /home/runepvp/streaming
docker compose up -d
docker compose logs -f
# Should show: "neko-rooms started"
```

`-d` means "run in background". To check on it later: `docker compose ps`

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
| `NEKO_ROOMS_URL` | `http://YOUR_VPS_IP:3000` |
| `NEKO_IMAGE` | `runepvp-client:latest` |
| `NEKO_ADMIN_PASSWORD` | the password you set in Step 7b |

Replace `YOUR_VPS_IP` with your actual IP.

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
