package org.rsmod.content.other.solana

import org.rsmod.api.type.refs.npc.NpcReferences

typealias boss_npcs = BossNpcs

object BossNpcs : NpcReferences() {
    // Tier 1 — 25 RUNE
    val sarachnis = find("sarachnis")
    val giant_mole = find("mole_giant")
    val barrows_ahrim = find("barrows_ahrim")
    val barrows_dharok = find("barrows_dharok")
    val barrows_guthan = find("barrows_guthan")
    val barrows_karil = find("barrows_karil")
    val barrows_torag = find("barrows_torag")
    val barrows_verac = find("barrows_verac")

    // Tier 2 — 75 RUNE
    val kalphite_queen = find("kalphite_queen")
    val vorkath = find("vorkath")
    val chaos_elemental = find("chaos_elemental")

    // Tier 3 — 200 RUNE
    val corp_beast = find("corp_beast")
}
