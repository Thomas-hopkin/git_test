package org.rsmod.api.death

import org.rsmod.api.player.protect.ProtectedAccess
import org.rsmod.events.SuspendEvent

public class PlayerRespawnedEvent : SuspendEvent<ProtectedAccess> {
    override val id: Long = ID

    public companion object {
        public const val ID: Long = 1_000_000L
    }
}
