package org.rsmod.content.other.solana

import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onPlayerLogin
import org.rsmod.game.entity.Player
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

private val http = OkHttpClient()
private val json = ObjectMapper()
private val JSON = "application/json".toMediaType()
private val BRIDGE_URL = System.getenv("BRIDGE_URL") ?: "http://localhost:4567"
private val BRIDGE_KEY = System.getenv("BRIDGE_API_KEY") ?: "changeme"

class DailyLogin : PluginScript() {
    override fun ScriptContext.startup() {
        onPlayerLogin { checkDailyClaim(player) }
    }
}

private fun checkDailyClaim(player: Player) {
    val body = json.writeValueAsString(mapOf("username" to player.username))
        .toRequestBody(JSON)
    val request = Request.Builder()
        .url("$BRIDGE_URL/daily-claim")
        .header("x-api-key", BRIDGE_KEY)
        .post(body)
        .build()

    Thread {
        try {
            http.newCall(request).execute().use { res ->
                val result = json.readValue(res.body?.string() ?: "{}", Map::class.java)
                if (result["claimed"] == true) {
                    val amount = result["amount"]
                    player.mes("Welcome back! Daily bonus: +$amount RUNE tokens.")
                    player.mes("Use ::withdraw to send RUNE to your Solana wallet.")
                }
            }
        } catch (_: Exception) {
            // Bridge offline — skip silently, player doesn't lose claim
        }
    }.start()
}
