package org.rsmod.content.other.solana

import org.rsmod.api.death.PlayerKilledEvent
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onEvent
import org.rsmod.game.entity.Player
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class PvpDrops : PluginScript() {
    override fun ScriptContext.startup() {
        onEvent<PlayerKilledEvent> { pvpKill(killer, victim) }
    }
}

private fun pvpKill(killer: Player, victim: Player) {
    val reward = pvpReward(victim.combatLevel)
    killer.mes("You defeated ${victim.username} (+$reward RUNE)!")
    creditRune(killer, reward)
}

private fun pvpReward(victimCombatLevel: Int): Int = when {
    victimCombatLevel >= 110 -> 150
    victimCombatLevel >= 85 -> 75
    victimCombatLevel >= 60 -> 40
    else -> 20
}
