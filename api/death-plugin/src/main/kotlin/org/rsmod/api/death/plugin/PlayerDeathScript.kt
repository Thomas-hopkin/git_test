package org.rsmod.api.death.plugin

import jakarta.inject.Inject
import org.rsmod.api.config.refs.queues
import org.rsmod.api.death.PlayerDeath
import org.rsmod.api.death.PlayerKilledEvent
import org.rsmod.api.death.PlayerRespawnedEvent
import org.rsmod.api.script.onPlayerQueue
import org.rsmod.events.EventBus
import org.rsmod.game.entity.PlayerList
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

public class PlayerDeathScript @Inject constructor(
    private val death: PlayerDeath,
    private val players: PlayerList,
    private val eventBus: EventBus,
) : PluginScript() {
    override fun ScriptContext.startup() {
        onPlayerQueue(queues.death) {
            val killer = player.findHero(players)
            if (killer != null && killer != player) {
                eventBus.publish(PlayerKilledEvent(victim = player, killer = killer))
            }
            death.death(this)
            eventBus.publish(this, PlayerRespawnedEvent())
        }
    }
}
