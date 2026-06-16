package org.rsmod.content.other.solana

import org.rsmod.api.script.onOpLoc1
import org.rsmod.api.type.refs.loc.LocReferences
import org.rsmod.map.CoordGrid
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

// Wilderness boundary is between z=3519 and z=3520.
// Use z<=3521 as threshold so players who walked 1-2 tiles past the ditch
// (because there is no collision barrier) still get sent north correctly.
private val DITCH_SOUTH_BOUNDARY = 3521
private val JUMP_SOUTH_Z = 3515
private val JUMP_NORTH_Z = 3523

internal object ditch_locs : LocReferences() {
    val wilderness_ditch = find("ditch_wilderness_cover")
}

class WildernessDitch : PluginScript() {
    override fun ScriptContext.startup() {
        onOpLoc1(ditch_locs.wilderness_ditch) {
            val destZ = if (player.coords.z <= DITCH_SOUTH_BOUNDARY) JUMP_NORTH_Z else JUMP_SOUTH_Z
            telejump(CoordGrid(player.coords.x, destZ))
        }
    }
}
