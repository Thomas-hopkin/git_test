package org.rsmod.content.other.solana

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.inject.Inject
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.rsmod.api.config.refs.queues
import org.rsmod.api.death.NpcDeath
import org.rsmod.api.npc.access.StandardNpcAccess
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onNpcQueue
import org.rsmod.game.entity.Player
import org.rsmod.game.entity.PlayerList
import org.rsmod.game.type.npc.NpcType
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext
import java.io.IOException

private val http = OkHttpClient()
private val json = ObjectMapper()
private val JSON = "application/json".toMediaType()

private val BRIDGE_URL = System.getenv("BRIDGE_URL") ?: "http://localhost:4567"
private val BRIDGE_KEY = System.getenv("BRIDGE_API_KEY") ?: "changeme"

private val TIER1_BOSSES = setOf(
    boss_npcs.sarachnis,
    boss_npcs.giant_mole,
    boss_npcs.barrows_ahrim,
    boss_npcs.barrows_dharok,
    boss_npcs.barrows_guthan,
    boss_npcs.barrows_karil,
    boss_npcs.barrows_torag,
    boss_npcs.barrows_verac,
)

private val TIER2_BOSSES = setOf(
    boss_npcs.kalphite_queen,
    boss_npcs.vorkath,
    boss_npcs.chaos_elemental,
)

private val TIER3_BOSSES = setOf(
    boss_npcs.corp_beast,
)

private val RUNE_REWARDS: Map<NpcType, Int> =
    TIER1_BOSSES.associateWith { 25 } +
    TIER2_BOSSES.associateWith { 75 } +
    TIER3_BOSSES.associateWith { 200 }

class RuneDrops @Inject constructor(
    private val death: NpcDeath,
    private val players: PlayerList,
) : PluginScript() {
    override fun ScriptContext.startup() {
        for ((npcType, reward) in RUNE_REWARDS) {
            onNpcQueue(npcType, queues.death) { bossKilled(reward) }
        }
    }

    private suspend fun StandardNpcAccess.bossKilled(reward: Int) {
        death.deathWithDrops(this)
        val killer = findHero(players) ?: return
        creditRune(killer, reward)
    }
}

private fun creditRune(player: Player, amount: Int) {
    val body = json.writeValueAsString(
        mapOf("username" to player.username, "amount" to amount)
    ).toRequestBody(JSON)

    val request = Request.Builder()
        .url("$BRIDGE_URL/credit")
        .header("x-api-key", BRIDGE_KEY)
        .post(body)
        .build()

    http.newCall(request).enqueue(object : Callback {
        override fun onResponse(call: Call, response: Response) {
            response.close()
            // Message is sent on next tick from game thread — fire and forget is fine here
        }
        override fun onFailure(call: Call, e: IOException) {
            // Bridge offline — token credit is lost. Log it server-side.
            println("[RUNE] Failed to credit $amount RUNE to ${player.username}: ${e.message}")
        }
    })

    player.mes("You received $amount RUNE tokens!")
    player.mes("Balance: use ::balance to check, ::withdraw to cash out.")
}
