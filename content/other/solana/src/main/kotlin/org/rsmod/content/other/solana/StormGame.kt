package org.rsmod.content.other.solana

import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.util.concurrent.ConcurrentHashMap
import org.rsmod.api.invtx.invAdd
import org.rsmod.api.player.hit.queueHit
import org.rsmod.api.player.output.ChatType
import org.rsmod.api.player.output.mes
import org.rsmod.api.repo.loc.LocRepository
import org.rsmod.game.entity.Player
import org.rsmod.game.entity.PlayerList
import org.rsmod.game.hit.HitType
import org.rsmod.game.loc.BoundLocInfo
import org.rsmod.game.loc.LocAngle
import org.rsmod.game.loc.LocShape
import org.rsmod.game.queue.WorldQueueList
import org.rsmod.map.CoordGrid

// Safe zones per phase — each shrinks toward the ditch so spectators in Edgeville
// (z ≈ 3493) can watch the final fights just north of the crossing (z ≈ 3523).
private val ZONE_FULL  = StormZone(3050, 3140, 3523, 3600, damage = 2)
private val ZONE_60PCT = StormZone(3063, 3127, 3530, 3590, damage = 4)
private val ZONE_30PCT = StormZone(3076, 3114, 3538, 3578, damage = 8)
private val ZONE_FINAL = StormZone(3087, 3103, 3523, 3539, damage = 8)

internal val STORM_PHASES = listOf(ZONE_FULL, ZONE_60PCT, ZONE_30PCT, ZONE_FINAL)
internal const val STORM_PHASE_TICKS = 250  // ~2.5 min per phase at 0.6 s/tick
internal const val STORM_MIN_PLAYERS = 1

// Drop-in point inside the full safe zone, in the wilderness north of the ditch.
internal val STORM_SPAWN = CoordGrid(3095, 3550)

internal val STORM_CRATE_COORDS = listOf(
    CoordGrid(3065, 3540), CoordGrid(3085, 3555), CoordGrid(3100, 3565),
    CoordGrid(3120, 3545), CoordGrid(3060, 3575), CoordGrid(3095, 3580),
    CoordGrid(3130, 3560), CoordGrid(3075, 3528), CoordGrid(3110, 3528),
    CoordGrid(3050, 3560),
)

data class StormZone(
    val minX: Int, val maxX: Int, val minZ: Int, val maxZ: Int, val damage: Int,
) {
    operator fun contains(c: CoordGrid) = c.x in minX..maxX && c.z in minZ..maxZ
    override fun toString() = "x[$minX–$maxX] z[$minZ–$maxZ]"
}

@Singleton
class StormGame @Inject constructor(
    private val playerList: PlayerList,
    private val worldQueues: WorldQueueList,
    private val locRepo: LocRepository,
) {
    var isRunning = false
        private set

    private val activePlayers = ConcurrentHashMap.newKeySet<String>()
    private val lobby = ConcurrentHashMap.newKeySet<String>()
    private var phase = 0
    private var phaseTick = 0

    val currentZone: StormZone?
        get() = if (phase in 1..STORM_PHASES.size) STORM_PHASES[phase - 1] else null

    fun isPlayerActive(username: String) = username in activePlayers

    /** Returns a user-facing error string, or null on success. */
    fun joinLobby(username: String): String? {
        if (isRunning) return "A game is already in progress. Wait for the next round."
        if (username in lobby) return "You are already in the lobby."
        lobby.add(username)
        return null
    }

    fun startIfReady() {
        if (isRunning || lobby.size < STORM_MIN_PLAYERS) return
        isRunning = true
        phase = 1
        phaseTick = 0
        activePlayers.clear()
        activePlayers.addAll(lobby)
        lobby.clear()

        broadcast("=== SURVIVE THE STORM === ${activePlayers.size} player(s) entering the wilderness!")
        broadcast("Loot the supply crates. The storm shrinks every ${STORM_PHASE_TICKS} ticks. Last one standing wins!")

        spawnCrates()
        scheduleGameTick()
    }

    fun onPlayerRespawned(username: String) {
        if (!isPlayerActive(username)) return
        activePlayers.remove(username)
        val remaining = activePlayers.size
        broadcast("$username has been eliminated! ($remaining player${if (remaining == 1) "" else "s"} remaining)")
        if (remaining <= 1) endGame()
    }

    fun lootCrate(player: Player, loc: BoundLocInfo) {
        if (!isRunning) return
        locRepo.del(loc, Int.MAX_VALUE)
        locRepo.add(
            coords = loc.coords,
            type = storm_locs.br_loot_chest_open,
            duration = Int.MAX_VALUE,
            angle = loc.angle,
            shape = loc.shape,
        )
        player.invAdd(player.inv, pvp_objs.shark, count = 5)
        player.invAdd(player.inv, pvp_objs.karambwan, count = 3)
        player.invAdd(player.inv, pvp_objs.prayer_potion4, count = 2)
        player.invAdd(player.inv, pvp_objs.super_restore4, count = 1)
    }

    private fun scheduleGameTick() {
        worldQueues.add(remainingCycles = 1) {
            if (isRunning) {
                processTick()
                if (isRunning) scheduleGameTick()
            }
        }
    }

    private fun processTick() {
        phaseTick++
        val zone = currentZone ?: return

        // Countdown warnings before each shrink
        when (STORM_PHASE_TICKS - phaseTick) {
            30 -> broadcast("The storm shrinks in 30 seconds!")
            10 -> broadcast("The storm shrinks in 10 seconds!")
        }

        // Phase transition
        if (phaseTick >= STORM_PHASE_TICKS) {
            phaseTick = 0
            if (phase < STORM_PHASES.size) {
                phase++
                broadcast("=== STORM CLOSING === New safe zone: ${currentZone!!}")
            } else {
                endGame()
                return
            }
        }

        // Storm damage outside safe zone
        val activeZone = currentZone ?: return
        for (player in playerList) {
            if (player.username !in activePlayers) continue
            if (player.coords !in activeZone) {
                player.mes("You are caught in the storm!", ChatType.Engine)
                player.queueHit(delay = 0, type = HitType.Typeless, damage = activeZone.damage)
            }
        }
    }

    private fun endGame() {
        isRunning = false
        val winner = activePlayers.firstOrNull()
        if (winner != null) {
            broadcast("=== WINNER! === $winner survives the storm! Congratulations!")
        } else {
            broadcast("=== GAME OVER === The storm claims everyone!")
        }
        activePlayers.clear()
        phase = 0
        despawnCrates()
    }

    private fun spawnCrates() {
        for (coords in STORM_CRATE_COORDS) {
            locRepo.add(
                coords = coords,
                type = storm_locs.br_loot_chest_closed,
                duration = Int.MAX_VALUE,
                angle = LocAngle.West,
                shape = LocShape.CentrepieceStraight,
            )
        }
    }

    private fun despawnCrates() {
        for (coords in STORM_CRATE_COORDS) {
            locRepo.findExact(coords, storm_locs.br_loot_chest_closed)
                ?.let { locRepo.del(it, Int.MAX_VALUE) }
            locRepo.findExact(coords, storm_locs.br_loot_chest_open)
                ?.let { locRepo.del(it, Int.MAX_VALUE) }
        }
    }

    fun broadcast(message: String) {
        for (player in playerList) {
            player.mes(message, ChatType.Broadcast)
        }
    }
}
