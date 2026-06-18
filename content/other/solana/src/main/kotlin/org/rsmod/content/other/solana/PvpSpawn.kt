package org.rsmod.content.other.solana

import jakarta.inject.Inject
import java.util.concurrent.ConcurrentHashMap
import org.rsmod.api.combat.commons.magic.Spellbook
import org.rsmod.api.config.refs.objs
import org.rsmod.api.config.refs.stats
import org.rsmod.api.config.refs.varbits
import org.rsmod.api.config.refs.varps
import org.rsmod.api.death.PlayerRespawnedEvent
import org.rsmod.api.invtx.invAdd
import org.rsmod.api.invtx.invClear
import org.rsmod.api.player.output.mes
import org.rsmod.api.player.vars.enumVarBit
import org.rsmod.api.player.vars.intVarp
import org.rsmod.api.script.onCommand
import org.rsmod.api.script.onPlayerLogin
import org.rsmod.api.script.onProtectedEvent
import org.rsmod.game.entity.Player
import org.rsmod.game.inv.InvObj
import org.rsmod.game.type.obj.Wearpos
import org.rsmod.map.CoordGrid
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

// Grand Exchange centre — wilderness ditch is ~33 tiles north
private val SPAWN = CoordGrid(3165, 3487)

private enum class LoadoutClass { FIGHTER, ARCHER, WIZARD }

private val playerClass = ConcurrentHashMap<String, LoadoutClass>()

private var Player.specialEnergy by intVarp(varps.sa_energy)
private var Player.spellbook by enumVarBit<Spellbook>(varbits.spellbook)

class PvpSpawn @Inject constructor(private val stormGame: StormGame) : PluginScript() {
    override fun ScriptContext.startup() {
        onPlayerLogin {
            val cls = playerClass.getOrPut(player.username) { LoadoutClass.FIGHTER }
            equipLoadout(player, cls)
            player.mes("=== RUNE PvP === Grand Exchange base — wilderness is just north!")
            player.mes("Pure builds (1 def). Type ::help for all commands.")
        }

        onProtectedEvent<PlayerRespawnedEvent>(PlayerRespawnedEvent.ID) {
            stormGame.onPlayerRespawned(player.username)
            val cls = playerClass.getOrDefault(player.username, LoadoutClass.FIGHTER)
            equipLoadout(player, cls)
            telejump(SPAWN)
        }

        onCommand("fighter") {
            desc = "Switch to Fighter loadout (strength pure)"
            cheat {
                playerClass[player.username] = LoadoutClass.FIGHTER
                equipLoadout(player, LoadoutClass.FIGHTER)
                player.mes("Strength pure equipped. Granite maul + Voidwaker spec.")
            }
        }

        onCommand("archer") {
            desc = "Switch to Archer loadout (ranged pure)"
            cheat {
                playerClass[player.username] = LoadoutClass.ARCHER
                equipLoadout(player, LoadoutClass.ARCHER)
                player.mes("Ranged pure equipped. Twisted bow + ACB switch in inventory.")
            }
        }

        onCommand("wizard") {
            desc = "Switch to Wizard loadout (mage pure)"
            cheat {
                playerClass[player.username] = LoadoutClass.WIZARD
                equipLoadout(player, LoadoutClass.WIZARD)
                player.mes("Mage pure equipped. Volatile nightmare staff.")
            }
        }

        onCommand("spec") {
            desc = "Add a spec weapon: gmaul | voidwaker | dds | claws | ags"
            cheat {
                when (args.firstOrNull()?.lowercase()) {
                    "gmaul" -> {
                        player.invAdd(player.inv, pvp_objs.granite_maul)
                        player.mes("Granite maul added. 50% spec.")
                    }
                    "voidwaker" -> {
                        player.invAdd(player.inv, pvp_objs.voidwaker)
                        player.mes("Voidwaker added. 50% spec.")
                    }
                    "dds" -> {
                        player.invAdd(player.inv, pvp_objs.dragon_dagger_pp)
                        player.mes("Dragon dagger (p++) added. 25% spec, two rapid stabs.")
                    }
                    "claws" -> {
                        player.invAdd(player.inv, pvp_objs.dragon_claws)
                        player.mes("Dragon claws added. 50% spec, four-hit slash combo.")
                    }
                    "ags" -> {
                        player.invAdd(player.inv, pvp_objs.armadyl_godsword)
                        player.mes("AGS added. 50% spec, high slash damage.")
                    }
                    else -> player.mes("Usage: ::spec gmaul | voidwaker | dds | claws | ags")
                }
            }
        }

        onCommand("switch") {
            desc = "Add a style switch to inventory: barrage | range"
            cheat {
                when (args.firstOrNull()?.lowercase()) {
                    "barrage" -> {
                        player.invAdd(player.inv, pvp_objs.kodai_wand)
                        player.invAdd(player.inv, pvp_objs.death_rune, count = 300)
                        player.invAdd(player.inv, objs.blood_rune, count = 150)
                        player.invAdd(player.inv, objs.water_rune, count = 600)
                        player.mes("Ice barrage kit added. Kodai + runes for 50 casts.")
                    }
                    "range" -> {
                        player.invAdd(player.inv, pvp_objs.armadyl_crossbow)
                        player.invAdd(player.inv, pvp_objs.dragon_bolts_dragonstone, count = 100)
                        player.mes("Range switch added. ACB + dragonstone bolts.")
                    }
                    else -> player.mes("Usage: ::switch barrage | ::switch range")
                }
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
    player.rebuildAppearance()
}

private fun setMaxStats(player: Player) {
    val offensiveStats = listOf(
        stats.attack, stats.strength, stats.ranged, stats.magic,
        stats.hitpoints, stats.prayer,
    )
    for (stat in offensiveStats) {
        player.statMap.setBaseLevel(stat, 99.toByte())
        player.statMap.setCurrentLevel(stat, 99.toByte())
    }
    player.statMap.setBaseLevel(stats.defence, 1.toByte())
    player.statMap.setCurrentLevel(stats.defence, 1.toByte())
    player.specialEnergy = 1000
}

private fun equipFighter(player: Player) {
    player.spellbook = Spellbook.Standard
    player.worn[Wearpos.Hat.slot] = InvObj(objs.obsidian_helmet)
    player.worn[Wearpos.Back.slot] = InvObj(pvp_objs.fire_cape)
    player.worn[Wearpos.Front.slot] = InvObj(objs.berserker_necklace)
    player.worn[Wearpos.RightHand.slot] = InvObj(pvp_objs.granite_maul)
    player.worn[Wearpos.Torso.slot] = InvObj(objs.obsidian_platebody)
    player.worn[Wearpos.Legs.slot] = InvObj(objs.obsidian_platelegs)
    player.worn[Wearpos.Hands.slot] = InvObj(pvp_objs.barrows_gloves)
    player.worn[Wearpos.Feet.slot] = InvObj(objs.dragon_boots)
    player.worn[Wearpos.Ring.slot] = InvObj(pvp_objs.berserker_ring_i)

    player.invAdd(player.inv, pvp_objs.voidwaker)
    player.invAdd(player.inv, pvp_objs.super_combat_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.prayer_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.shark, count = 6)
    player.invAdd(player.inv, pvp_objs.karambwan, count = 3)
}

private fun equipArcher(player: Player) {
    player.spellbook = Spellbook.Standard
    player.worn[Wearpos.Hat.slot] = InvObj(objs.void_ranger_helm)
    player.worn[Wearpos.Back.slot] = InvObj(pvp_objs.ava_assembler)
    player.worn[Wearpos.Front.slot] = InvObj(pvp_objs.necklace_of_anguish)
    player.worn[Wearpos.RightHand.slot] = InvObj(objs.twisted_bow)
    player.worn[Wearpos.Torso.slot] = InvObj(objs.elite_void_top)
    player.worn[Wearpos.Legs.slot] = InvObj(objs.elite_void_robe)
    player.worn[Wearpos.Hands.slot] = InvObj(objs.void_gloves)
    player.worn[Wearpos.Feet.slot] = InvObj(pvp_objs.rangers_boots)
    player.worn[Wearpos.Ring.slot] = InvObj(pvp_objs.archers_ring_i)
    player.worn[Wearpos.Quiver.slot] = InvObj(objs.dragon_arrow, count = 500)

    player.invAdd(player.inv, pvp_objs.armadyl_crossbow)
    player.invAdd(player.inv, pvp_objs.dragon_bolts_dragonstone, count = 100)
    player.invAdd(player.inv, pvp_objs.ranging_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.prayer_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.shark, count = 6)
    player.invAdd(player.inv, pvp_objs.karambwan, count = 3)
}

private fun equipWizard(player: Player) {
    player.spellbook = Spellbook.Ancients
    player.worn[Wearpos.Hat.slot] = InvObj(objs.void_mage_helm)
    player.worn[Wearpos.Back.slot] = InvObj(objs.infernal_cape)
    player.worn[Wearpos.Front.slot] = InvObj(pvp_objs.occult_necklace)
    player.worn[Wearpos.RightHand.slot] = InvObj(pvp_objs.volatile_staff)
    player.worn[Wearpos.Torso.slot] = InvObj(objs.elite_void_top)
    player.worn[Wearpos.Legs.slot] = InvObj(objs.elite_void_robe)
    player.worn[Wearpos.Hands.slot] = InvObj(pvp_objs.tormented_bracelet)
    player.worn[Wearpos.Feet.slot] = InvObj(pvp_objs.eternal_boots)
    player.worn[Wearpos.Ring.slot] = InvObj(pvp_objs.seers_ring_i)

    player.invAdd(player.inv, pvp_objs.super_restore4, count = 4)
    player.invAdd(player.inv, pvp_objs.prayer_potion4, count = 2)
    player.invAdd(player.inv, pvp_objs.shark, count = 6)
    player.invAdd(player.inv, pvp_objs.karambwan, count = 3)
}
