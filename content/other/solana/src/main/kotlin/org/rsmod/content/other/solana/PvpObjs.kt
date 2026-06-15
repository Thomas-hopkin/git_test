package org.rsmod.content.other.solana

import org.rsmod.api.type.refs.obj.ObjReferences

typealias pvp_objs = PvpObjs

object PvpObjs : ObjReferences() {
    // Consumables
    val shark = find("shark")
    val karambwan = find("tbwt_cooked_karambwan")
    val super_combat_potion4 = find("4dose2combat")
    val ranging_potion4 = find("4doserangerspotion")
    val super_restore4 = find("4dose2restore")
    val prayer_potion4 = find("4doseprayerrestore")

    // Fighter extras
    val dragon_dagger_p = find("dragon_dagger_p++")
    val berserker_ring_i = find("nzone_berzerker_ring")
    val fighter_torso = find("barbassault_penance_fighter_torso")
    val fire_cape = find("tzhaar_cape_fire")
    val rune_defender = find("dragon_sq_shield")
    val helm_of_neitiznot = find("fris_kingly_helm")
    val barrows_gloves = find("hundred_gauntlets_level_10")

    // Archer
    val toxic_blowpipe = find("toxic_blowpipe")
    val archers_ring_i = find("nzone_ranger_ring")
    val black_dhide_vamb = find("black_dragon_vambraces")
    val rangers_boots = find("boots_ranger")
    val ava_assembler = find("avas_assembler")
    val necklace_of_anguish = find("zenyte_necklace_enchanted")

    // Wizard
    val ahrims_hood = find("barrows_ahrim_head_100")
    val ahrims_robeskirt = find("barrows_ahrim_legs_100")
    val trident_of_the_swamp = find("kodai_wand")
    val occult_necklace = find("occult_necklace")
    val tormented_bracelet = find("zenyte_bracelet_enchanted")
    val eternal_boots = find("eternal_boots")
    val seers_ring_i = find("nzone_seer_ring")
}
