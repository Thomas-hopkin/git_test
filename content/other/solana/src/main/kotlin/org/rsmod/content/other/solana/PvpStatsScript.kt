package org.rsmod.content.other.solana

import jakarta.inject.Inject
import org.rsmod.api.config.refs.modlevels
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onCommand
import org.rsmod.api.script.onPlayerLogout
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

class PvpStatsScript @Inject constructor(
    private val store: KillStatsStore,
    private val api: LeaderboardApi,
) : PluginScript() {
    override fun ScriptContext.startup() {
        api.start()

        onPlayerLogout { store.save() }

        onCommand("stats") {
            modLevel = modlevels.player
            desc = "Show kill/death stats for yourself or another player"
            cheat {
                val target = args.firstOrNull() ?: player.username
                val s = store.get(target)
                if (s == null) {
                    player.mes("No stats found for $target.")
                } else {
                    player.mes("=== ${s.username} ===")
                    player.mes("Kills: ${s.kills}   Deaths: ${s.deaths}   K/D: ${s.kd}")
                    if (s.wallet != null) player.mes("SOL wallet: ${s.wallet}")
                }
            }
        }

        onCommand("top") {
            modLevel = modlevels.player
            desc = "Show the top 10 players by kills"
            cheat {
                val top = store.topByKills(10)
                if (top.isEmpty()) {
                    player.mes("No kills recorded yet — be the first!")
                    return@cheat
                }
                player.mes("=== Top Players ===")
                top.forEachIndexed { i, s ->
                    player.mes("${i + 1}. ${s.username}  ${s.kills}K / ${s.deaths}D  (${s.kd} K/D)")
                }
            }
        }

        onCommand("wallet") {
            modLevel = modlevels.player
            desc = "Register your Solana wallet address for prize payouts"
            cheat {
                val addr = args.firstOrNull()
                if (addr == null) {
                    player.mes("Usage: ::wallet <solana_address>")
                    player.mes("Example: ::wallet 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")
                    return@cheat
                }
                store.setWallet(player.username, addr)
                player.mes("Wallet registered: $addr")
                player.mes("SOL prizes will be sent here. Type ::stats to confirm.")
            }
        }
    }
}
