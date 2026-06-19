#!/usr/bin/env bash
# RUNE PvP — LostCity/2004Scape game server setup
# Run once on your VPS: bash game/setup.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GAME_DIR="$SCRIPT_DIR"

# Revision to use. 274 is the most feature-complete stable tag.
REVISION="rev274"

echo "=== RUNE PvP — Game Server Setup (${REVISION}) ==="
echo ""

# ── 1. Clone Engine-TS ──────────────────────────────────────────────────────
if [ ! -d "$GAME_DIR/server/.git" ]; then
    echo "[1/5] Cloning Engine-TS..."
    git clone --depth=1 --branch "$REVISION" \
        https://github.com/2004scape/Engine-TS \
        "$GAME_DIR/server"
else
    echo "[1/5] server/ already cloned — skipping."
fi

# ── 2. Clone Content ─────────────────────────────────────────────────────────
# Content goes inside server/data — that's where Engine-TS expects to find
# the compiled scripts, item definitions, maps, etc.
if [ ! -d "$GAME_DIR/server/data/.git" ]; then
    echo "[2/5] Cloning Content..."
    git clone --depth=1 --branch "$REVISION" \
        https://github.com/2004scape/Content \
        "$GAME_DIR/server/data"
else
    echo "[2/5] server/data/ already cloned — skipping."
fi

# ── 3. Clone Client-TS ───────────────────────────────────────────────────────
if [ ! -d "$GAME_DIR/client/.git" ]; then
    echo "[3/5] Cloning Client-TS..."
    git clone --depth=1 --branch "$REVISION" \
        https://github.com/2004scape/Client-TS \
        "$GAME_DIR/client"
else
    echo "[3/5] client/ already cloned — skipping."
fi

# ── 4. Overlay custom files ──────────────────────────────────────────────────
echo "[4/5] Overlaying RUNE PvP custom files..."

# Custom TypeScript engine additions
PVPDIR="$GAME_DIR/server/src/game/pvp"
mkdir -p "$PVPDIR"
cp "$GAME_DIR/engine/KillStatsStore.ts"        "$PVPDIR/"
cp "$GAME_DIR/engine/LeaderboardServer.ts"     "$PVPDIR/"

HANDLER_DIR="$GAME_DIR/server/src/engine/script/handlers"
mkdir -p "$HANDLER_DIR"
cp "$GAME_DIR/engine/handlers/PvpOps.ts"       "$HANDLER_DIR/"

# Custom RuneScript content
SCRIPTS_DIR="$GAME_DIR/server/data/src/scripts"
mkdir -p "$SCRIPTS_DIR"
cp "$GAME_DIR/content/pvp_commands.rs2"        "$SCRIPTS_DIR/"
cp "$GAME_DIR/content/pvp_kills.rs2"           "$SCRIPTS_DIR/"
cp "$GAME_DIR/content/pvp_spawn.rs2"           "$SCRIPTS_DIR/"
cp "$GAME_DIR/content/granite_maul_spec.rs2"   "$SCRIPTS_DIR/"

# Item definition patch
OBJ_DIR="$GAME_DIR/server/data/src/obj"
mkdir -p "$OBJ_DIR"
cp "$GAME_DIR/content/items/granite_maul.obj"  "$OBJ_DIR/"

echo "    Files copied."
echo ""
echo "    *** MANUAL STEP REQUIRED (one-time) ***"
echo "    Open server/src/app.ts and add these two lines near the top"
echo "    (after the other imports and before the server starts):"
echo ""
echo "      import { startLeaderboardServer } from './game/pvp/LeaderboardServer';"
echo "      import { registerPvpOps }        from './engine/script/handlers/PvpOps';"
echo ""
echo "    Then call them once the script engine is ready:"
echo "      startLeaderboardServer();"
echo "      registerPvpOps(addHandler);  // pass the engine's addHandler function"
echo ""
echo "    Also add the custom opcode names to ScriptOpcode.ts (enum values):"
echo "      pvp_recordkill, pvp_getkills, pvp_getdeaths, pvp_setwallet, pvp_showtop"
echo ""

# ── 5. Install deps and build ────────────────────────────────────────────────
echo "[5/5] Installing and building..."

# Server
cd "$GAME_DIR/server"
bun install
bun run pack    # compiles .rs2 scripts to binary cache
bun run build   # TypeScript → JS (if needed)

# Client
cd "$GAME_DIR/client"
bun install
bun run build

echo ""
echo "=== Done! ==="
echo ""
echo "To start the game server:"
echo "  cd game/server && bun start"
echo ""
echo "The game server listens on port 80 (WebSocket + HTTP client)."
echo "The leaderboard API listens on port 8080."
echo ""
echo "Set GAME_API_URL=http://YOUR_VPS_IP:8080 in your Vercel env vars."
echo "Players open http://YOUR_VPS_IP to play in the browser."
