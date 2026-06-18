package org.rsmod.api.death

import org.rsmod.events.UnboundEvent
import org.rsmod.game.entity.Player

public data class PlayerKilledEvent(
    public val victim: Player,
    public val killer: Player,
) : UnboundEvent
