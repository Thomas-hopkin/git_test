package org.rsmod.content.other.special.attacks.melee

import org.rsmod.api.combat.commons.CombatAttack
import org.rsmod.api.combat.commons.types.MeleeAttackType
import org.rsmod.api.config.constants
import org.rsmod.api.config.refs.objs
import org.rsmod.api.player.protect.ProtectedAccess
import org.rsmod.api.specials.SpecialAttackManager
import org.rsmod.api.specials.SpecialAttackMap
import org.rsmod.api.specials.SpecialAttackRepository
import org.rsmod.api.specials.combat.MeleeSpecialAttack
import org.rsmod.content.other.special.attacks.configs.special_seqs
import org.rsmod.content.other.special.attacks.configs.special_spots
import org.rsmod.game.entity.Npc
import org.rsmod.game.entity.PathingEntity
import org.rsmod.game.entity.Player

class DragonClawsSpecialAttack : SpecialAttackMap {
    override fun SpecialAttackRepository.register(manager: SpecialAttackManager) {
        registerMelee(objs.dragon_claws, DragonClaws(manager))
    }

    private class DragonClaws(private val manager: SpecialAttackManager) : MeleeSpecialAttack {
        override suspend fun ProtectedAccess.attack(
            target: Npc,
            attack: CombatAttack.Melee,
        ): Boolean {
            talon(target, attack)
            return true
        }

        override suspend fun ProtectedAccess.attack(
            target: Player,
            attack: CombatAttack.Melee,
        ): Boolean {
            talon(target, attack)
            return true
        }

        private fun ProtectedAccess.talon(target: PathingEntity, attack: CombatAttack.Melee) {
            anim(special_seqs.dragon_claws_spec)
            spotanim(
                spot = special_spots.dragon_claws,
                slot = constants.spotanim_slot_combat,
                height = 96,
            )

            val accurate =
                manager.rollMeleeAccuracy(
                    source = this,
                    target = target,
                    attackType = MeleeAttackType.Slash,
                    attackStyle = attack.style,
                    blockType = MeleeAttackType.Slash,
                    multiplier = 1.0,
                )
            val maxHit =
                manager.rollMeleeMaxHit(
                    source = this,
                    target = target,
                    attackType = MeleeAttackType.Slash,
                    attackStyle = attack.style,
                    multiplier = 1.0,
                )

            val h1: Int
            val h2: Int
            val h3: Int
            val h4: Int
            if (accurate && maxHit > 0) {
                h1 = maxHit / 2
                h2 = h1 / 2
                h3 = h2 / 2
                h4 = (maxHit - h1 - h2 - h3).coerceAtLeast(1)
            } else {
                h1 = 0; h2 = 0; h3 = 0; h4 = 0
            }

            val total = h1 + h2 + h3 + h4
            manager.giveCombatXp(this, target, attack, total)
            manager.queueMeleeHit(this, target, h1, delay = 1)
            manager.queueMeleeHit(this, target, h2, delay = 2)
            manager.queueMeleeHit(this, target, h3, delay = 3)
            manager.queueMeleeHit(this, target, h4, delay = 4)
            manager.continueCombat(this, target)
        }
    }
}
