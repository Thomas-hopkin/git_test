package org.rsmod.content.other.solana

import org.rsmod.api.config.refs.objs
import org.rsmod.api.config.refs.stats
import org.rsmod.api.player.output.mes
import org.rsmod.api.player.worn.HeldEquipResult
import org.rsmod.api.script.onOpHeld1
import org.rsmod.game.entity.Player
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class PvpInteract : PluginScript() {
    override fun ScriptContext.startup() {
        // Food
        onOpHeld1(pvp_objs.shark) {
            eat(player, 20)
            invDel(it.inventory, pvp_objs.shark, 1, it.slot)
            mes("You eat the shark.")
        }
        onOpHeld1(pvp_objs.karambwan) {
            eat(player, 18)
            invDel(it.inventory, pvp_objs.karambwan, 1, it.slot)
            mes("You eat the karambwan.")
        }

        // Potions
        onOpHeld1(pvp_objs.prayer_potion4) {
            restorePrayer(player, 71)
            invDel(it.inventory, pvp_objs.prayer_potion4, 1, it.slot)
            mes("You drink some of your prayer potion.")
        }
        onOpHeld1(pvp_objs.super_combat_potion4) {
            boostStat(player, stats.attack, 19)
            boostStat(player, stats.strength, 19)
            boostStat(player, stats.defence, 19)
            invDel(it.inventory, pvp_objs.super_combat_potion4, 1, it.slot)
            mes("You drink some of your super combat potion.")
        }
        onOpHeld1(pvp_objs.ranging_potion4) {
            boostStat(player, stats.ranged, 13)
            invDel(it.inventory, pvp_objs.ranging_potion4, 1, it.slot)
            mes("You drink some of your ranging potion.")
        }
        onOpHeld1(pvp_objs.super_restore4) {
            restorePrayer(player, 32)
            restoreStat(player, stats.attack)
            restoreStat(player, stats.strength)
            restoreStat(player, stats.ranged)
            restoreStat(player, stats.magic)
            invDel(it.inventory, pvp_objs.super_restore4, 1, it.slot)
            mes("You drink some of your super restore potion.")
        }

        // Equipment — clicking "Use" (op1) equips the item
        for (item in listOf(
            // pvp_objs equipment
            pvp_objs.granite_maul, pvp_objs.voidwaker, pvp_objs.volatile_staff,
            pvp_objs.armadyl_crossbow, pvp_objs.fire_cape, pvp_objs.barrows_gloves,
            pvp_objs.ava_assembler, pvp_objs.necklace_of_anguish, pvp_objs.occult_necklace,
            pvp_objs.tormented_bracelet, pvp_objs.eternal_boots, pvp_objs.berserker_ring_i,
            pvp_objs.archers_ring_i, pvp_objs.rangers_boots, pvp_objs.seers_ring_i,
        )) {
            onOpHeld1(item) {
                val result = invEquip(it.slot, it.inventory)
                if (result is HeldEquipResult.Fail) {
                    result.messages.forEach { msg -> mes(msg) }
                }
            }
        }
        for (item in listOf(
            // objs (BaseObjs) equipment
            objs.obsidian_helmet, objs.obsidian_platebody, objs.obsidian_platelegs,
            objs.berserker_necklace, objs.dragon_boots, objs.void_ranger_helm,
            objs.twisted_bow, objs.elite_void_top, objs.elite_void_robe, objs.void_gloves,
            objs.void_mage_helm, objs.infernal_cape, objs.amulet_of_fury, objs.abyssal_whip,
        )) {
            onOpHeld1(item) {
                val result = invEquip(it.slot, it.inventory)
                if (result is HeldEquipResult.Fail) {
                    result.messages.forEach { msg -> mes(msg) }
                }
            }
        }
    }
}

private fun eat(player: Player, amount: Int) {
    val base = player.statMap.getBaseLevel(stats.hitpoints).toInt()
    val current = player.statMap.getCurrentLevel(stats.hitpoints).toInt()
    val newHp = minOf(current + amount, base)
    player.statMap.setCurrentLevel(stats.hitpoints, newHp.toByte())
}

private fun restorePrayer(player: Player, amount: Int) {
    val base = player.statMap.getBaseLevel(stats.prayer).toInt()
    val current = player.statMap.getCurrentLevel(stats.prayer).toInt()
    val newPrayer = minOf(current + amount, base)
    player.statMap.setCurrentLevel(stats.prayer, newPrayer.toByte())
}

private fun boostStat(player: Player, stat: org.rsmod.game.type.stat.StatType, amount: Int) {
    val base = player.statMap.getBaseLevel(stat).toInt()
    val current = player.statMap.getCurrentLevel(stat).toInt()
    val boosted = minOf(current + amount, base + amount)
    player.statMap.setCurrentLevel(stat, boosted.toByte())
}

private fun restoreStat(player: Player, stat: org.rsmod.game.type.stat.StatType) {
    val base = player.statMap.getBaseLevel(stat).toInt()
    val current = player.statMap.getCurrentLevel(stat).toInt()
    val restored = minOf(maxOf(current, base), 99)
    player.statMap.setCurrentLevel(stat, restored.toByte())
}
