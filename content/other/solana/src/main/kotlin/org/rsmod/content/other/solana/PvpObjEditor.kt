package org.rsmod.content.other.solana

import org.rsmod.api.config.refs.objs
import org.rsmod.api.type.editors.obj.ObjEditor

internal object PvpObjEditor : ObjEditor() {
    init {
        // Food
        edit(pvp_objs.shark) { iop1 = "Eat"; iop5 = "Examine" }
        edit(pvp_objs.karambwan) { iop1 = "Eat"; iop5 = "Examine" }

        // Potions
        edit(pvp_objs.prayer_potion4) { iop1 = "Drink"; iop5 = "Examine" }
        edit(pvp_objs.super_combat_potion4) { iop1 = "Drink"; iop5 = "Examine" }
        edit(pvp_objs.ranging_potion4) { iop1 = "Drink"; iop5 = "Examine" }
        edit(pvp_objs.super_restore4) { iop1 = "Drink"; iop5 = "Examine" }

        // Weapons from pvp_objs — iop1 so left-click wields immediately
        edit(pvp_objs.granite_maul) { iop1 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.voidwaker) { iop1 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.volatile_staff) { iop1 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.armadyl_crossbow) { iop1 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.dragon_bolts_dragonstone) { iop1 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.kodai_wand) { iop1 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.trail_ancient_staff) { iop1 = "Wield"; iop5 = "Examine" }

        // Wearables from pvp_objs — iop1 so left-click wears immediately
        edit(pvp_objs.fire_cape) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.barrows_gloves) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.ava_assembler) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.necklace_of_anguish) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.occult_necklace) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.tormented_bracelet) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.eternal_boots) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.berserker_ring_i) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.archers_ring_i) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.rangers_boots) { iop1 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.seers_ring_i) { iop1 = "Wear"; iop5 = "Examine" }

        // Weapons from objs — iop1 so left-click wields immediately
        edit(objs.twisted_bow) { iop1 = "Wield"; iop5 = "Examine" }
        edit(objs.abyssal_whip) { iop1 = "Wield"; iop5 = "Examine" }
        edit(objs.dragon_arrow) { iop1 = "Wield"; iop5 = "Examine" }

        // Wearables from objs — iop1 so left-click wears immediately
        edit(objs.obsidian_helmet) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.obsidian_platebody) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.obsidian_platelegs) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.berserker_necklace) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.dragon_boots) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.void_ranger_helm) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.elite_void_top) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.elite_void_robe) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.void_gloves) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.void_mage_helm) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.infernal_cape) { iop1 = "Wear"; iop5 = "Examine" }
        edit(objs.amulet_of_fury) { iop1 = "Wear"; iop5 = "Examine" }
    }
}
