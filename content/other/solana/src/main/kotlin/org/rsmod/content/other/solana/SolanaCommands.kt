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
    player.mes("::wizard   Mage pure (void + volatile staff, Ancients spellbook)")
    player.mes("-- Spec weapons (add to inventory) --")
    player.mes("::spec gmaul     Granite maul (50% spec, fast combo)")
    player.mes("::spec voidwaker Voidwaker (50% spec, high damage)")
    player.mes("::spec dds       Dragon dagger p++ (25% spec, double stab)")
    player.mes("::spec claws     Dragon claws (50% spec, 4-hit slash)")
    player.mes("::spec ags       Armadyl godsword (50% spec, massive slash)")
    player.mes("-- Stats & prizes --")
    player.mes("::stats            Your kills / deaths / K/D")
    player.mes("::stats <player>   Another player's stats")
    player.mes("::top              Top 10 players by kills")
    player.mes("::wallet <addr>    Register Solana wallet for SOL prizes")
}
