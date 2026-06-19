#!/usr/bin/env bash
# RUNE PvP — LostCity game server setup
# Run once: bash game/setup.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GAME_DIR="$SCRIPT_DIR"

# Revision branch to use (LostCityRS branches are plain numbers)
REVISION="254"

echo "=== RUNE PvP — Game Server Setup (rev${REVISION}) ==="
echo ""

# ── 1. Clone Engine-TS ──────────────────────────────────────────────────────
if [ ! -d "$GAME_DIR/server/.git" ]; then
    echo "[1/5] Cloning Engine-TS..."
    git clone --depth=1 --branch "$REVISION" \
        https://github.com/LostCityRS/Engine-TS \
        "$GAME_DIR/server"
else
    echo "[1/5] server/ already cloned — skipping."
fi

# ── 2. Clone Content ─────────────────────────────────────────────────────────
# Engine-TS expects Content to be cloned alongside it (same parent dir),
# or symlinked as server/data. We clone it as server/data.
if [ ! -d "$GAME_DIR/server/data/.git" ]; then
    echo "[2/5] Cloning Content..."
    git clone --depth=1 --branch "$REVISION" \
        https://github.com/LostCityRS/Content \
        "$GAME_DIR/server/data"
else
    echo "[2/5] server/data/ already cloned — skipping."
fi

# ── 3. Clone Client-TS ───────────────────────────────────────────────────────
if [ ! -d "$GAME_DIR/client/.git" ]; then
    echo "[3/5] Cloning Client-TS..."
    git clone --depth=1 --branch "$REVISION" \
        https://github.com/LostCityRS/Client-TS \
        "$GAME_DIR/client"
else
    echo "[3/5] client/ already cloned — skipping."
fi

# ── 4. Overlay custom RUNE PvP files ─────────────────────────────────────────
echo "[4/5] Overlaying RUNE PvP custom files..."

# TypeScript engine additions
PVPDIR="$GAME_DIR/server/src/game/pvp"
mkdir -p "$PVPDIR"
cp "$GAME_DIR/engine/KillStatsStore.ts"    "$PVPDIR/"
cp "$GAME_DIR/engine/LeaderboardServer.ts" "$PVPDIR/"

HANDLER_DIR="$GAME_DIR/server/src/engine/script/handlers"
mkdir -p "$HANDLER_DIR"
cp "$GAME_DIR/engine/handlers/PvpOps.ts"   "$HANDLER_DIR/"

# RuneScript content — find the correct scripts directory
# Try common locations used by LostCityRS
for SCRIPTS_DIR in \
    "$GAME_DIR/server/data/src/scripts" \
    "$GAME_DIR/server/data/scripts" \
    "$GAME_DIR/server/src/scripts"; do
    if [ -d "$SCRIPTS_DIR" ]; then
        echo "    Placing .rs2 files in $SCRIPTS_DIR"
        cp "$GAME_DIR/content/pvp_commands.rs2"      "$SCRIPTS_DIR/"
        cp "$GAME_DIR/content/pvp_kills.rs2"         "$SCRIPTS_DIR/"
        cp "$GAME_DIR/content/pvp_spawn.rs2"         "$SCRIPTS_DIR/"
        cp "$GAME_DIR/content/granite_maul_spec.rs2" "$SCRIPTS_DIR/"
        break
    fi
done

# Item definitions — find the correct obj directory
for OBJ_DIR in \
    "$GAME_DIR/server/data/src/obj" \
    "$GAME_DIR/server/data/obj"; do
    if [ -d "$OBJ_DIR" ]; then
        echo "    Placing .obj files in $OBJ_DIR"
        cp "$GAME_DIR/content/items/granite_maul.obj" "$OBJ_DIR/"
        break
    fi
done

echo "    Files copied."

# ── 5. Install deps and build ────────────────────────────────────────────────
echo "[5/5] Installing and building..."

cd "$GAME_DIR/server"
bun install

# Pack compiles RuneScript → binary; build compiles TypeScript
if bun run pack 2>/dev/null; then
    echo "    pack OK"
else
    echo "    (no pack script — skipping)"
fi

if bun run build 2>/dev/null; then
    echo "    build OK"
else
    echo "    (no build script — skipping)"
fi

echo ""
echo "=== Done! ==="
echo ""
echo "Next: cd game/server && bun start"
echo "Then open http://localhost in your browser."
