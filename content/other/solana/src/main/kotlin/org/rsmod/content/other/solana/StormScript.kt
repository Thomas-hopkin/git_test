package org.rsmod.content.other.solana

import jakarta.inject.Inject
import org.rsmod.api.player.protect.ProtectedAccessLauncher
import org.rsmod.api.script.onCommand
import org.rsmod.api.script.onOpLoc1
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class StormScript @Inject constructor(
    private val game: StormGame,
    private val protectedAccess: ProtectedAccessLauncher,
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
                player.mes("You've joined the battle royale! Teleporting you into the arena...")
                game.broadcast("${player.username} joined the lobby.")
                // Teleport into the arena from anywhere.
                protectedAccess.launch(player) { telejump(STORM_SPAWN) }
                game.startIfReady()
            }
        }

        onOpLoc1(storm_locs.br_loot_chest_closed) {
            game.lootCrate(player, it.loc)
            mes("You search the supply crate and find food and potions!")
        }
    }
}
