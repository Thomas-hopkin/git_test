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

    // Fighter pure
    val granite_maul = find("granite_maul")
    val voidwaker = find("voidwaker")
    val dragon_dagger_pp = find("dragon_dagger_p++")
    val dragon_claws = find("dragon_claws")
    val armadyl_godsword = find("ags")
    val fire_cape = find("tzhaar_cape_fire")
    val berserker_ring_i = find("nzone_berzerker_ring")
    val barrows_gloves = find("hundred_gauntlets_level_10")

    // Ranger pure
    val armadyl_crossbow = find("acb")
    val dragon_bolts_dragonstone = find("dragon_bolts_enchanted_dragonstone")
    val archers_ring_i = find("nzone_ranger_ring")
    val rangers_boots = find("boots_ranger")
    val ava_assembler = find("avas_assembler")
    val necklace_of_anguish = find("zenyte_necklace_enchanted")

    // Mage pure
    val volatile_staff = find("nightmare_staff_volatile")
    val occult_necklace = find("occult_necklace")
    val tormented_bracelet = find("zenyte_bracelet_enchanted")
    val eternal_boots = find("eternal_boots")
    val seers_ring_i = find("nzone_seer_ring")

    // Ice barrage switch
    val kodai_wand = find("kodai_wand")
    val trail_ancient_staff = find("trail_ancient_staff")
    val death_rune = find("deathrune")
}
