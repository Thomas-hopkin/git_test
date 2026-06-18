package org.rsmod.content.other.solana

import jakarta.inject.Inject
import org.rsmod.api.death.PlayerKilledEvent
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onEvent
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class PvpDrops @Inject constructor(private val store: KillStatsStore) : PluginScript() {
    override fun ScriptContext.startup() {
        onEvent<PlayerKilledEvent> {
            store.recordKill(killer.username, victim.username)
            killer.mes("You defeated ${victim.username}! (${store.get(killer.username)?.kills ?: 1} kills)")
        }
    }
}
