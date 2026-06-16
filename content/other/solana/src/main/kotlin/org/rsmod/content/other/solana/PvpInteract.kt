package org.rsmod.content.other.solana

import org.rsmod.api.config.refs.objs
import org.rsmod.api.config.refs.stats
import org.rsmod.api.player.stat.statBoost
import org.rsmod.api.player.stat.statHeal
import org.rsmod.api.player.stat.statRestore
import org.rsmod.api.player.worn.HeldEquipResult
import org.rsmod.api.script.onOpHeld1
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class PvpInteract : PluginScript() {
    override fun ScriptContext.startup() {
        // Food
        onOpHeld1(pvp_objs.shark) {
            player.statHeal(stats.hitpoints, 20, 0)
            invDel(it.inventory, pvp_objs.shark, 1, it.slot)
            mes("You eat the shark.")
        }
        onOpHeld1(pvp_objs.karambwan) {
            player.statHeal(stats.hitpoints, 18, 0)
            invDel(it.inventory, pvp_objs.karambwan, 1, it.slot)
            mes("You eat the karambwan.")
        }

        // Potions
        onOpHeld1(pvp_objs.prayer_potion4) {
            player.statHeal(stats.prayer, 7, 25)
            invDel(it.inventory, pvp_objs.prayer_potion4, 1, it.slot)
            mes("You drink some of your prayer potion.")
        }
        onOpHeld1(pvp_objs.super_combat_potion4) {
            player.statBoost(stats.attack, 5, 15)
            player.statBoost(stats.strength, 5, 15)
            player.statBoost(stats.defence, 5, 15)
            invDel(it.inventory, pvp_objs.super_combat_potion4, 1, it.slot)
            mes("You drink some of your super combat potion.")
        }
        onOpHeld1(pvp_objs.ranging_potion4) {
            player.statBoost(stats.ranged, 4, 10)
            invDel(it.inventory, pvp_objs.ranging_potion4, 1, it.slot)
            mes("You drink some of your ranging potion.")
        }
        onOpHeld1(pvp_objs.super_restore4) {
            player.statHeal(stats.prayer, 8, 25)
            player.statRestore(stats.attack)
            player.statRestore(stats.strength)
            player.statRestore(stats.ranged)
            player.statRestore(stats.magic)
            invDel(it.inventory, pvp_objs.super_restore4, 1, it.slot)
            mes("You drink some of your super restore potion.")
        }

        // Equipment — PvpObjEditor sets iop1="Wield"/"Wear" so left-click equips instantly
        for (item in listOf(
            pvp_objs.granite_maul, pvp_objs.voidwaker, pvp_objs.volatile_staff,
            pvp_objs.armadyl_crossbow, pvp_objs.dragon_bolts_dragonstone,
            pvp_objs.fire_cape, pvp_objs.barrows_gloves, pvp_objs.ava_assembler,
            pvp_objs.necklace_of_anguish, pvp_objs.occult_necklace,
            pvp_objs.tormented_bracelet, pvp_objs.eternal_boots,
            pvp_objs.berserker_ring_i, pvp_objs.archers_ring_i,
            pvp_objs.rangers_boots, pvp_objs.seers_ring_i,
        )) {
            onOpHeld1(item) {
                val result = invEquip(it.slot, it.inventory)
                if (result is HeldEquipResult.Fail) {
                    result.messages.forEach { msg -> mes(msg) }
                }
            }
        }
        for (item in listOf(
            objs.twisted_bow, objs.abyssal_whip, objs.dragon_arrow,
            objs.obsidian_helmet, objs.obsidian_platebody, objs.obsidian_platelegs,
            objs.berserker_necklace, objs.dragon_boots, objs.void_ranger_helm,
            objs.elite_void_top, objs.elite_void_robe, objs.void_gloves,
            objs.void_mage_helm, objs.infernal_cape, objs.amulet_of_fury,
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
