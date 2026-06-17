package org.rsmod.content.other.solana

import jakarta.inject.Inject
import org.rsmod.api.player.output.mes
import org.rsmod.api.repo.npc.NpcRepository
import org.rsmod.api.script.onCommand
import org.rsmod.game.entity.Npc
import org.rsmod.game.entity.npc.NpcMode
import org.rsmod.game.type.npc.NpcTypeList
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class CombatDummy @Inject constructor(
    private val npcRepo: NpcRepository,
    private val npcTypes: NpcTypeList,
) : PluginScript() {
    override fun ScriptContext.startup() {
        onCommand("dummy") {
            desc = "Spawn a combat dummy to fight (chaos_elemental or corp_beast)"
            cheat {
                val name = args.firstOrNull()?.lowercase() ?: "chaos"
                val symName = when (name) {
                    "corp", "corpbeast" -> "corp_beast"
                    else -> "chaoselemental"
                }
                val type = npcTypes.values.firstOrNull { it.internalName == symName }
                if (type == null) {
                    player.mes("Could not find NPC: $symName")
                    return@cheat
                }
                val npc = Npc(type, player.coords)
                npc.mode = NpcMode.Wander
                npcRepo.add(npc, duration = Int.MAX_VALUE)
                player.mes("Spawned ${type.internalName} — fight!")
            }
        }
    }
}
