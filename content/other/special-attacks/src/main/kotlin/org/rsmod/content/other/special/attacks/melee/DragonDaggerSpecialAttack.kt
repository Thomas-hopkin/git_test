package org.rsmod.content.other.special.attacks.melee

import org.rsmod.api.combat.commons.CombatAttack
import org.rsmod.api.combat.commons.types.MeleeAttackType
import org.rsmod.api.config.refs.objs
import org.rsmod.api.player.protect.ProtectedAccess
import org.rsmod.api.specials.SpecialAttackManager
import org.rsmod.api.specials.SpecialAttackMap
import org.rsmod.api.specials.SpecialAttackRepository
import org.rsmod.api.specials.combat.MeleeSpecialAttack
import org.rsmod.content.other.special.attacks.configs.special_seqs
import org.rsmod.game.entity.Npc
import org.rsmod.game.entity.PathingEntity
import org.rsmod.game.entity.Player

class DragonDaggerSpecialAttack : SpecialAttackMap {
    override fun SpecialAttackRepository.register(manager: SpecialAttackManager) {
        val spec = DragonDagger(manager)
        registerMelee(objs.dragon_dagger, spec)
        registerMelee(objs.dragon_dagger_pp, spec)
    }

    private class DragonDagger(private val manager: SpecialAttackManager) : MeleeSpecialAttack {
        override suspend fun ProtectedAccess.attack(
            target: Npc,
            attack: CombatAttack.Melee,
        ): Boolean {
            puncture(target, attack)
            return true
        }

        override suspend fun ProtectedAccess.attack(
            target: Player,
            attack: CombatAttack.Melee,
        ): Boolean {
            puncture(target, attack)
            return true
        }

        private fun ProtectedAccess.puncture(target: PathingEntity, attack: CombatAttack.Melee) {
            anim(special_seqs.dds_spec)
            val d1 =
                manager.rollMeleeDamage(
                    source = this,
                    target = target,
                    attack = attack,
                    accuracyMultiplier = 1.15,
                    maxHitMultiplier = 1.15,
                    blockType = MeleeAttackType.Stab,
                )
            val d2 =
                manager.rollMeleeDamage(
                    source = this,
                    target = target,
                    attack = attack,
                    accuracyMultiplier = 1.15,
                    maxHitMultiplier = 1.15,
                    blockType = MeleeAttackType.Stab,
                )
            manager.giveCombatXp(this, target, attack, d1 + d2)
            manager.queueMeleeHit(this, target, d1, delay = 1)
            manager.queueMeleeHit(this, target, d2, delay = 2)
            manager.continueCombat(this, target)
        }
    }
}
