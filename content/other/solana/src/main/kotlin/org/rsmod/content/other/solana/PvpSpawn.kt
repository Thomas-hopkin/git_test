package org.rsmod.content.other.solana

import java.util.concurrent.ConcurrentHashMap
import org.rsmod.api.config.refs.objs
import org.rsmod.api.config.refs.stats
import org.rsmod.api.death.PlayerRespawnedEvent
import org.rsmod.api.invtx.invAdd
import org.rsmod.api.invtx.invClear
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onCommand
import org.rsmod.api.script.onPlayerLogin
import org.rsmod.api.script.onProtectedEvent
import org.rsmod.game.entity.Player
import org.rsmod.game.inv.InvObj
import org.rsmod.game.type.obj.Wearpos
import org.rsmod.map.CoordGrid
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

// Just outside the wilderness ditch, Edgeville
private val SPAWN = CoordGrid(3094, 3493)

private enum class LoadoutClass { FIGHTER, ARCHER, WIZARD }

private val playerClass = ConcurrentHashMap<String, LoadoutClass>()

class PvpSpawn : PluginScript() {
    override fun ScriptContext.startup() {
        onPlayerLogin {
            val cls = playerClass.getOrPut(player.username) { LoadoutClass.FIGHTER }
            equipLoadout(player, cls)
            player.mes("=== RUNE PvP === Kill players to earn RUNE tokens on Solana!")
            player.mes("Choose your class: ::fighter  ::archer  ::wizard")
        }

        onProtectedEvent<PlayerRespawnedEvent>(PlayerRespawnedEvent.ID) {
            val cls = playerClass.getOrDefault(player.username, LoadoutClass.FIGHTER)
            equipLoadout(player, cls)
            telejump(SPAWN)
        }

        onCommand("fighter") {
            desc = "Switch to Fighter loadout (melee)"
            cheat {
                playerClass[player.username] = LoadoutClass.FIGHTER
                equipLoadout(player, LoadoutClass.FIGHTER)
                player.mes("Fighter equipped. Beats Wizards, loses to Archers.")
            }
        }

        onCommand("archer") {
            desc = "Switch to Archer loadout (ranged)"
            cheat {
                playerClass[player.username] = LoadoutClass.ARCHER
                equipLoadout(player, LoadoutClass.ARCHER)
                player.mes("Archer equipped. Beats Fighters, loses to Wizards.")
            }
        }

        onCommand("wizard") {
            desc = "Switch to Wizard loadout (magic)"
            cheat {
                playerClass[player.username] = LoadoutClass.WIZARD
                equipLoadout(player, LoadoutClass.WIZARD)
                player.mes("Wizard equipped. Beats Archers, loses to Fighters.")
            }
        }
    }
}

private fun equipLoadout(player: Player, cls: LoadoutClass) {
    player.invClear(player.inv)
    for (i in player.worn.indices) player.worn[i] = null
    setMaxStats(player)
    when (cls) {
        LoadoutClass.FIGHTER -> equipFighter(player)
        LoadoutClass.ARCHER -> equipArcher(player)
        LoadoutClass.WIZARD -> equipWizard(player)
    }
}

private fun setMaxStats(player: Player) {
    val combatStats = listOf(
        stats.attack, stats.strength, stats.defence,
        stats.hitpoints, stats.ranged, stats.magic, stats.prayer,
    )
    for (stat in combatStats) {
        player.statMap.setBaseLevel(stat, 99.toByte())
        player.statMap.setCurrentLevel(stat, 99.toByte())
    }
}

private fun equipFighter(player: Player) {
    player.worn[Wearpos.Hat.slot] = InvObj(pvp_objs.helm_of_neitiznot)
    player.worn[Wearpos.Back.slot] = InvObj(pvp_objs.fire_cape)
    player.worn[Wearpos.Front.slot] = InvObj(objs.amulet_of_fury)
    player.worn[Wearpos.RightHand.slot] = InvObj(objs.abyssal_whip)
    player.worn[Wearpos.Torso.slot] = InvObj(objs.bandos_chestplate)
    player.worn[Wearpos.LeftHand.slot] = InvObj(pvp_objs.rune_defender)
    player.worn[Wearpos.Legs.slot] = InvObj(objs.bandos_tassets)
    player.worn[Wearpos.Hands.slot] = InvObj(pvp_objs.barrows_gloves)
    player.worn[Wearpos.Feet.slot] = InvObj(objs.dragon_boots)
    player.worn[Wearpos.Ring.slot] = InvObj(pvp_objs.berserker_ring_i)

    player.invAdd(player.inv, pvp_objs.dragon_dagger_p)
    player.invAdd(player.inv, pvp_objs.super_combat_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.prayer_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.shark, count = 10)
    player.invAdd(player.inv, pvp_objs.karambwan, count = 5)
}

private fun equipArcher(player: Player) {
    player.worn[Wearpos.Hat.slot] = InvObj(pvp_objs.helm_of_neitiznot)
    player.worn[Wearpos.Back.slot] = InvObj(pvp_objs.ava_assembler)
    player.worn[Wearpos.Front.slot] = InvObj(pvp_objs.necklace_of_anguish)
    player.worn[Wearpos.RightHand.slot] = InvObj(pvp_objs.toxic_blowpipe)
    player.worn[Wearpos.Torso.slot] = InvObj(objs.black_dhide_body)
    player.worn[Wearpos.Legs.slot] = InvObj(objs.black_dhide_chaps)
    player.worn[Wearpos.Hands.slot] = InvObj(pvp_objs.black_dhide_vamb)
    player.worn[Wearpos.Feet.slot] = InvObj(pvp_objs.rangers_boots)
    player.worn[Wearpos.Ring.slot] = InvObj(pvp_objs.archers_ring_i)

    player.invAdd(player.inv, pvp_objs.ranging_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.prayer_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.shark, count = 10)
    player.invAdd(player.inv, pvp_objs.karambwan, count = 5)
}

private fun equipWizard(player: Player) {
    player.worn[Wearpos.Hat.slot] = InvObj(pvp_objs.ahrims_hood)
    player.worn[Wearpos.Front.slot] = InvObj(pvp_objs.occult_necklace)
    player.worn[Wearpos.RightHand.slot] = InvObj(pvp_objs.trident_of_the_swamp)
    player.worn[Wearpos.Torso.slot] = InvObj(objs.ahrims_robetop_100)
    player.worn[Wearpos.Legs.slot] = InvObj(pvp_objs.ahrims_robeskirt)
    player.worn[Wearpos.Hands.slot] = InvObj(pvp_objs.tormented_bracelet)
    player.worn[Wearpos.Feet.slot] = InvObj(pvp_objs.eternal_boots)
    player.worn[Wearpos.Ring.slot] = InvObj(pvp_objs.seers_ring_i)

    player.invAdd(player.inv, pvp_objs.super_restore4, count = 4)
    player.invAdd(player.inv, pvp_objs.prayer_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.shark, count = 10)
    player.invAdd(player.inv, pvp_objs.karambwan, count = 5)
}
