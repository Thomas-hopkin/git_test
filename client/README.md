# RSMod PvP — Player Client

A standalone launcher that connects the official **rev-233** OSRS gamepack directly to your
RSMod server. No proxy (RSProx) required. This is the client you distribute to players.

## How it works

1. Loads a frozen rev-233 OSRS gamepack (`osrs-233.jar`).
2. Rewrites the gamepack's hard-coded Jagex RSA modulus to **your server's** modulus
   (`GamepackPatcher`), so the login handshake is encrypted for your server.
3. Feeds the client the full rev-233 applet parameters (with your world list URL), so it
   doesn't crash during `client.init`.
4. Opens the client window. The game **cache downloads from your server over JS5** on first
   connect — nothing else ships with the client.

Because rev 233 is a frozen artifact (Jagex stopped publishing clean Java gamepacks after
rev 235), this client never auto-updates and stays compatible with the rev-233 server.

## One-time setup

1. **Get the gamepack.** Download `osrs-233.jar` from
   [runetech/osrs-gamepacks](https://github.com/runetech/osrs-gamepacks/tree/master/gamepacks)
   (path: `gamepacks/osrs-233.jar`). Save it somewhere, e.g. `C:\rsmod\client\osrs-233.jar`.

2. **Check the server modulus.** `Launcher.RSA_MODULUS` must equal the modulus your RSMod
   server uses (the one exported during install, also in `bridge/index.js`). They already match.

## Run

Start the **game server** (`gradlew run`, port 43594) and the **bridge** (`node index.js`,
port 4567), then from the repo root:

```sh
gradlew -p client run
```

This looks for `osrs-233.jar` in the `client/` directory by default. To use a jar elsewhere,
pass an absolute path: `gradlew -p client run --args="C:/path/to/osrs-233.jar"`.

> On Windows, Gradle must run on JDK 17+ even though the client itself uses JDK 11. If you
> see "Gradle requires JVM 17 or later", point this shell at your JDK 21 first:
> ```
> for /d %i in ("C:\Program Files\Eclipse Adoptium\jdk-21*") do @set "JAVA_HOME=%i"
> ```

## Connecting

The client points at `127.0.0.1` for local testing. RSMod has `requireRegistration=false` and
`ignorePasswords=true`, so log in with any username on the classic login screen.

To host for other players later, edit the connection constants at the top of
`Launcher.java` (`WORLDLIST_URL`, `CODEBASE`) and the world host in the bridge's
`/worldlist.ws` endpoint to your public IP, then package the launcher + `osrs-233.jar` as a
single download.
