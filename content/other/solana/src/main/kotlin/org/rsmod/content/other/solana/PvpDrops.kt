package org.rsmod.content.other.solana

import org.rsmod.api.death.PlayerKilledEvent
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onEvent
import org.rsmod.game.entity.Player
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class PvpDrops : PluginScript() {
    override fun ScriptContext.startup() {
        onEvent<PlayerKilledEvent> { killer.mes("You defeated ${victim.username}!") }
    }
}
