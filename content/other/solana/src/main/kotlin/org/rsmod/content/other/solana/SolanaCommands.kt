package org.rsmod.content.other.solana

import org.rsmod.api.config.refs.modlevels
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onCommand
import org.rsmod.game.cheat.Cheat
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class SolanaCommands : PluginScript() {
    override fun ScriptContext.startup() {
        onCommand("help") {
            modLevel = modlevels.player
            desc = "Show all available commands"
            cheat { helpCommand(this) }
        }
    }
}

private fun helpCommand(cheat: Cheat) = with(cheat) {
    player.mes("=== RUNE PvP Commands ===")
    player.mes("-- Loadout --")
    player.mes("::fighter  Melee pure (obsidian + granite maul)")
    player.mes("::archer   Ranged pure (void + twisted bow)")
    player.mes("::wizard   Mage pure (void + volatile staff)")
    player.mes("-- Switches (add to inventory) --")
    player.mes("::spec gmaul      Add granite maul (50% spec)")
    player.mes("::spec voidwaker  Add voidwaker (50% spec)")
    player.mes("::switch barrage  Add kodai wand + runes (ice barrage)")
    player.mes("::switch range    Add ACB + dragonstone bolts")
    player.mes("-- Battle Royale --")
    player.mes("::join  Join Survive the Storm")
}
