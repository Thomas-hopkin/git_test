package org.rsmod.content.other.solana

import jakarta.inject.Inject
import org.rsmod.api.script.onCommand
import org.rsmod.api.script.onOpLoc1
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class StormScript @Inject constructor(
    private val game: StormGame,
) : PluginScript() {
    override fun ScriptContext.startup() {
        onCommand("join") {
            desc = "Join the Survive the Storm battle royale"
            cheat {
                val err = game.joinLobby(player.username)
                if (err != null) {
                    player.mes(err)
                    return@cheat
                }
                val waiting = if (game.isRunning) 0 else STORM_MIN_PLAYERS - 1
                player.mes("You've joined the battle royale lobby!")
                if (waiting > 0) {
                    player.mes("Waiting for $waiting more player(s). Head to the wilderness!")
                }
                game.broadcast("${player.username} joined the lobby.")
                game.startIfReady()
            }
        }

        onOpLoc1(storm_locs.br_loot_chest_closed) {
            game.lootCrate(player, it.loc)
            mes("You search the supply crate and find food and potions!")
        }
    }
}
