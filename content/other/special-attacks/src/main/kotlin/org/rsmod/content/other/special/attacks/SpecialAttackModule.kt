package org.rsmod.content.other.special.attacks

import org.rsmod.api.specials.SpecialAttackMap
import org.rsmod.content.other.special.attacks.boost.StatBoostSpecialAttacks
import org.rsmod.content.other.special.attacks.melee.ArmadylGodswordSpecialAttack
import org.rsmod.content.other.special.attacks.melee.DragonClawsSpecialAttack
import org.rsmod.content.other.special.attacks.melee.DragonDaggerSpecialAttack
import org.rsmod.content.other.special.attacks.melee.DragonLongswordSpecialAttack
import org.rsmod.content.other.special.attacks.melee.GraniteMaulSpecialAttack
import org.rsmod.content.other.special.attacks.melee.VoidwakerSpecialAttack
import org.rsmod.content.other.special.attacks.ranged.DarkBowSpecialAttack
import org.rsmod.plugin.module.PluginModule

class SpecialAttackModule : PluginModule() {
    override fun bind() {
        addSetBinding<SpecialAttackMap>(StatBoostSpecialAttacks::class.java)
        addSetBinding<SpecialAttackMap>(DarkBowSpecialAttack::class.java)
        addSetBinding<SpecialAttackMap>(DragonLongswordSpecialAttack::class.java)
        addSetBinding<SpecialAttackMap>(GraniteMaulSpecialAttack::class.java)
        addSetBinding<SpecialAttackMap>(DragonDaggerSpecialAttack::class.java)
        addSetBinding<SpecialAttackMap>(DragonClawsSpecialAttack::class.java)
        addSetBinding<SpecialAttackMap>(ArmadylGodswordSpecialAttack::class.java)
        addSetBinding<SpecialAttackMap>(VoidwakerSpecialAttack::class.java)
    }
}
