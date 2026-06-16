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

        // Weapons from pvp_objs
        edit(pvp_objs.granite_maul) { iop2 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.voidwaker) { iop2 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.volatile_staff) { iop2 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.armadyl_crossbow) { iop2 = "Wield"; iop5 = "Examine" }
        edit(pvp_objs.dragon_bolts_dragonstone) { iop2 = "Wield"; iop5 = "Examine" }

        // Wearables from pvp_objs
        edit(pvp_objs.fire_cape) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.barrows_gloves) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.ava_assembler) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.necklace_of_anguish) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.occult_necklace) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.tormented_bracelet) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.eternal_boots) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.berserker_ring_i) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.archers_ring_i) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.rangers_boots) { iop2 = "Wear"; iop5 = "Examine" }
        edit(pvp_objs.seers_ring_i) { iop2 = "Wear"; iop5 = "Examine" }

        // Weapons from objs
        edit(objs.twisted_bow) { iop2 = "Wield"; iop5 = "Examine" }
        edit(objs.abyssal_whip) { iop2 = "Wield"; iop5 = "Examine" }
        edit(objs.dragon_arrow) { iop2 = "Wield"; iop5 = "Examine" }

        // Wearables from objs
        edit(objs.obsidian_helmet) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.obsidian_platebody) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.obsidian_platelegs) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.berserker_necklace) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.dragon_boots) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.void_ranger_helm) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.elite_void_top) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.elite_void_robe) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.void_gloves) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.void_mage_helm) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.infernal_cape) { iop2 = "Wear"; iop5 = "Examine" }
        edit(objs.amulet_of_fury) { iop2 = "Wear"; iop5 = "Examine" }
    }
}
