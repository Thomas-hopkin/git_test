package org.rsmod.content.other.solana

import org.rsmod.api.script.onOpLoc1
import org.rsmod.api.type.refs.loc.LocReferences
import org.rsmod.map.CoordGrid
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

private val DITCH_Z = 3519
private val JUMP_SOUTH_Z = 3515  // land here when jumping south (leaving wild)
private val JUMP_NORTH_Z = 3523  // land here when jumping north (entering wild)

internal object ditch_locs : LocReferences() {
    val wilderness_ditch = find("ditch_wilderness_cover")
}

class WildernessDitch : PluginScript() {
    override fun ScriptContext.startup() {
        onOpLoc1(ditch_locs.wilderness_ditch) {
            val destZ = if (player.coords.z <= DITCH_Z) JUMP_NORTH_Z else JUMP_SOUTH_Z
            telejump(CoordGrid(player.coords.x, destZ))
        }
    }
}
