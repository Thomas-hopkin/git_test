# neko base provides: Xvfb, PulseAudio, WebRTC server, supervisord
FROM ghcr.io/m1k1o/neko/base:latest

# Java runtime for the OSRS client
RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless \
    libxi6 libxrender1 libxtst6 \
    && rm -rf /var/lib/apt/lists/*

# Your OSRS client jar — place it at streaming/client/client.jar before building
# This is whatever client you use locally to connect to RSMod (RuneLite jar, etc.)
COPY client/client.jar /app/client.jar

# supervisord program that neko loads automatically from this directory
COPY supervisord.ini /etc/neko/supervisord/osrs.ini
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
