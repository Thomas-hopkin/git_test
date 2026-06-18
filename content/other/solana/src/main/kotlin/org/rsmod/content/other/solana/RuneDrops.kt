package org.rsmod.content.other.solana

import jakarta.inject.Inject
import org.rsmod.api.config.refs.queues
import org.rsmod.api.death.NpcDeath
import org.rsmod.api.npc.access.StandardNpcAccess
import org.rsmod.api.script.onNpcQueue
import org.rsmod.game.entity.PlayerList
import org.rsmod.game.type.npc.NpcType
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

private val BOSS_TYPES = setOf(
    boss_npcs.sarachnis,
    boss_npcs.giant_mole,
    boss_npcs.barrows_ahrim,
    boss_npcs.barrows_dharok,
    boss_npcs.barrows_guthan,
    boss_npcs.barrows_karil,
    boss_npcs.barrows_torag,
    boss_npcs.barrows_verac,
    boss_npcs.kalphite_queen,
    boss_npcs.vorkath,
    boss_npcs.chaos_elemental,
    boss_npcs.corp_beast,
)

class RuneDrops @Inject constructor(
    private val death: NpcDeath,
    private val players: PlayerList,
) : PluginScript() {
    override fun ScriptContext.startup() {
        for (npcType in BOSS_TYPES) {
            onNpcQueue(npcType, queues.death) { bossKilled() }
        }
    }

    private suspend fun StandardNpcAccess.bossKilled() {
        death.deathWithDrops(this)
    }
}
