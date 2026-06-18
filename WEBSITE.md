# RUNE PvP — Website Setup Guide

This guide walks you through getting the website live on the internet.
The website is the Next.js app in the `website/` folder — it shows the
landing page, leaderboard, player profiles, and the "Play Now" browser
streaming page.

**You do NOT need to know how to code to follow this guide.**

---

## What you'll end up with

- A live website at something like `https://runepvp.vercel.app` (free)
- Or your own domain like `https://runepvp.com` if you have one
- The site pulls live data from your game server once that's running

---

## Prerequisites

Before you start you need:
1. A **GitHub account** — the code is already in GitHub (you're reading this there)
2. A **Vercel account** — free, takes 2 minutes to set up

That's it. You don't need Node.js, npm, or anything on your computer.

---

## Part 1 — Create a Vercel account

1. Go to **https://vercel.com**
2. Click **Sign Up**
3. Choose **Continue with GitHub** (this links Vercel directly to your GitHub repos — easiest option)
4. Authorise Vercel when GitHub asks

You're now on the Vercel dashboard.

---

## Part 2 — Import the project

1. On the Vercel dashboard, click **Add New…** → **Project**

2. You'll see a list of your GitHub repositories. Find **git_test** and click **Import**

   > If you don't see it, click "Adjust GitHub App Permissions" and make sure Vercel has access to that repo.

3. On the **Configure Project** page, you need to change one setting before anything else:
   - Find the **Root Directory** field
   - Click **Edit**
   - Type `website` and click the checkmark to confirm

   This tells Vercel the website code is inside the `website/` folder, not the root of the repo.

4. **Framework Preset** should auto-detect as **Next.js**. If it doesn't, select it manually.

5. **Do not click Deploy yet** — you need to add environment variables first (next step).

---

## Part 3 — Add environment variables

Still on the Configure Project page, scroll down to **Environment Variables**.

You need to add these four variables. Click **Add** for each one:

### Variable 1: Game server API
| Field | Value |
|-------|-------|
| Name | `GAME_API_URL` |
| Value | `http://YOUR_VPS_IP:8080` |

Replace `YOUR_VPS_IP` with the public IP of your VPS (e.g. `5.161.12.34`).

> **Don't have a VPS running yet?** You can skip this for now and add it later — the website will just show 0 kills and 0 SOL paid out until the game server is live.

### Variable 2: Streaming service URL
| Field | Value |
|-------|-------|
| Name | `NEKO_ROOMS_URL` |
| Value | `http://YOUR_VPS_IP:3000` |

### Variable 3: Streaming Docker image name
| Field | Value |
|-------|-------|
| Name | `NEKO_IMAGE` |
| Value | `runepvp-client:latest` |

> Leave this exactly as shown — it matches the Docker image name in the deployment guide.

### Variable 4: Streaming admin password
| Field | Value |
|-------|-------|
| Name | `NEKO_ADMIN_PASSWORD` |
| Value | `(the password you set in streaming/.env on your VPS)` |

### Variable 5: Game server address (for streaming containers)
| Field | Value |
|-------|-------|
| Name | `GAME_HOST` |
| Value | `YOUR_VPS_IP` |

This is the same IP as the others — the address the streaming container uses to connect to the game server.

---

## Part 4 — Deploy

Click **Deploy**.

Vercel will:
1. Pull the code from GitHub
2. Install dependencies (`npm install`)
3. Build the Next.js app
4. Deploy it

This takes about **60–90 seconds**.

When it's done you'll see a green "Congratulations!" screen with a URL like:
```
https://git-test-abc123.vercel.app
```

Click **Visit** to see your site live. The landing page will load even if the game server isn't running yet.

---

## Part 5 — (Optional) Add a custom domain

If you own a domain like `runepvp.com`, you can point it at Vercel for free.

1. In your Vercel project, click **Settings** → **Domains**
2. Type your domain name and click **Add**
3. Vercel will show you DNS records to add

To add DNS records:
- Log in to wherever you bought the domain (GoDaddy, Namecheap, Cloudflare, etc.)
- Go to the DNS settings for your domain
- Add the records Vercel shows you (usually a CNAME or A record)

DNS changes can take up to 24 hours to work, but usually it's under 5 minutes.

---

## Part 6 — Updating the website later

The website **automatically redeploys every time you push code to GitHub**. You don't need to do anything in Vercel.

If you need to change an environment variable (e.g., you got a new VPS IP):
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Edit the variable
3. Go to **Deployments** and click **Redeploy** on the latest deployment (or just push any change to GitHub)

---

## Part 7 — Running the website locally (optional)

You only need this if you want to test changes before pushing to GitHub.

### Install Node.js

Download Node.js from **https://nodejs.org** — get the **LTS** version. Run the installer.

Verify it worked: open Terminal (Mac) or PowerShell (Windows) and run:
```bash
node --version
# Should print: v20.x.x or similar
```

### Set up the website

```bash
# Navigate to the website folder
cd /path/to/git_test/website

# Install dependencies (only need to do this once)
npm install

# Create your local environment file
cp .env.local.example .env.local
```

Open `.env.local` in any text editor (Notepad works) and fill in your VPS IP:
```
GAME_API_URL=http://YOUR_VPS_IP:8080
NEKO_ROOMS_URL=http://YOUR_VPS_IP:3000
NEKO_IMAGE=runepvp-client:latest
NEKO_ADMIN_PASSWORD=your_password_here
GAME_HOST=YOUR_VPS_IP
GAME_PORT=43594
```

### Start the dev server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. The site will live-reload as you edit files.

Press `Ctrl+C` to stop.

---

## Troubleshooting

### "Framework could not be detected" in Vercel
- Make sure you set Root Directory to `website` before deploying

### Leaderboard shows "Failed to load" or is empty
- The game server isn't running yet, or the `GAME_API_URL` env var is wrong
- Check: can you open `http://YOUR_VPS_IP:8080/api/leaderboard` in a browser? If not, the game server isn't up

### "Play Now" shows "Streaming service unavailable"
- neko-rooms isn't running on your VPS yet — follow the streaming section of `DEPLOYMENT.md`
- Check port 3000 is open in your VPS firewall: `ufw status`

### The website URL has a random Vercel subdomain, not my domain
- That's fine — it's fully functional at the Vercel URL
- Follow Part 5 above to add a custom domain

### Vercel deploy fails with a build error
- Click the failed deployment to see logs
- Most common cause: a TypeScript type error. The logs will show the exact file and line
- Share the error message and we can fix it

---

## What the pages do

| URL | What it shows |
|-----|---------------|
| `/` | Landing page — hero, stats bar (live kills + SOL), feature cards |
| `/leaderboard` | Live kill rankings (refreshes every 30 seconds) |
| `/player/:name` | Individual player stats — kills, deaths, K/D, wallet |
| `/play` | Launches a WebRTC streaming session, embeds the game client |
