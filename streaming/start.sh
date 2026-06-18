#!/bin/bash
# Wait for Xvfb display to be ready
sleep 2

# Launch OSRS client
# GAME_HOST / GAME_PORT are injected by docker-compose from the host environment
exec java \
  -Djava.awt.headless=false \
  -Drunelite.host="${GAME_HOST:-127.0.0.1}" \
  -Drunelite.port="${GAME_PORT:-43594}" \
  -jar /app/client.jar \
  --clientargs="--server=${GAME_HOST:-127.0.0.1}" \
  2>&1
