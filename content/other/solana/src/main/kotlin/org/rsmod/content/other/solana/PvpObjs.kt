package org.rsmod.content.other.solana

import org.rsmod.api.type.refs.obj.ObjReferences

typealias pvp_objs = PvpObjs

object PvpObjs : ObjReferences() {
    // Consumables
    val shark = find("shark")
    val karambwan = find("cooked_karambwan")
    val super_combat_potion4 = find("super_combat_potion4")
    val ranging_potion4 = find("ranging_potion4")
    val super_restore4 = find("super_restore4")
    val prayer_potion4 = find("prayer_potion4")

    // Fighter extras
    val dragon_dagger_p = find("dragon_daggerp++")
    val berserker_ring_i = find("berserker_ring_i")
    val fighter_torso = find("fighter_torso")
    val fire_cape = find("fire_cape")
    val rune_defender = find("rune_defender")
    val helm_of_neitiznot = find("helm_of_neitiznot")
    val barrows_gloves = find("barrows_gloves")

    // Archer
    val toxic_blowpipe = find("toxic_blowpipe")
    val archers_ring_i = find("archers_ring_i")
    val black_dhide_vamb = find("black_dhide_vamb")
    val rangers_boots = find("ranger_boots")
    val ava_assembler = find("avas_assembler")
    val necklace_of_anguish = find("necklace_of_anguish")

    // Wizard
    val ahrims_hood = find("ahrims_hood0")
    val ahrims_robeskirt = find("ahrims_robeskirt0")
    val trident_of_the_swamp = find("trident_of_the_swamp_full")
    val occult_necklace = find("occult_necklace")
    val tormented_bracelet = find("tormented_bracelet")
    val eternal_boots = find("eternal_boots")
    val seers_ring_i = find("seers_ring_i")
}
