package org.rsmod.content.other.solana

import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.rsmod.api.config.refs.modlevels
import org.rsmod.api.player.output.mes
import org.rsmod.api.script.onCommand
import org.rsmod.game.cheat.Cheat
import org.rsmod.plugin.scripts.PluginScript
import org.rsmod.plugin.scripts.ScriptContext

private val http = OkHttpClient()
private val json = ObjectMapper()
private val JSON = "application/json".toMediaType()

private val BRIDGE_URL = System.getenv("BRIDGE_URL") ?: "http://localhost:4567"
private val BRIDGE_KEY = System.getenv("BRIDGE_API_KEY") ?: "changeme"

private fun get(path: String): Map<*, *>? {
    val req = Request.Builder()
        .url("$BRIDGE_URL$path")
        .header("x-api-key", BRIDGE_KEY)
        .get()
        .build()
    return try {
        http.newCall(req).execute().use { res ->
            json.readValue(res.body?.string() ?: "{}", Map::class.java)
        }
    } catch (_: Exception) { null }
}

private fun post(path: String, body: Map<String, Any>): Map<*, *>? {
    val req = Request.Builder()
        .url("$BRIDGE_URL$path")
        .header("x-api-key", BRIDGE_KEY)
        .post(json.writeValueAsString(body).toRequestBody(JSON))
        .build()
    return try {
        http.newCall(req).execute().use { res ->
            json.readValue(res.body?.string() ?: "{}", Map::class.java)
        }
    } catch (_: Exception) { null }
}

class SolanaCommands : PluginScript() {
    override fun ScriptContext.startup() {
        onCommand("wallet") {
            modLevel = modlevels.player
            desc = "Link your Solana wallet or check status"
            cheat { walletCommand(this) }
        }
        onCommand("withdraw") {
            modLevel = modlevels.player
            desc = "Withdraw RUNE tokens to your Solana wallet"
            cheat { withdrawCommand(this) }
        }
        onCommand("deposit") {
            modLevel = modlevels.player
            desc = "Get info on depositing RUNE tokens"
            cheat { depositCommand(this) }
        }
        onCommand("balance") {
            modLevel = modlevels.player
            desc = "Check your RUNE token balance"
            cheat { balanceCommand(this) }
        }
    }
}

private fun walletCommand(cheat: Cheat) = with(cheat) {
    val address = args.firstOrNull()
    if (address == null) {
        val row = get("/wallet/${player.username}")
        if (row == null || row["error"] != null) {
            player.mes("No wallet linked. Use: ::wallet <your-solana-address>")
        } else {
            player.mes("Linked wallet: ${row["address"]}")
        }
        return
    }
    val result = post("/wallet/link", mapOf("username" to player.username, "address" to address))
    if (result == null || result["error"] != null) {
        player.mes("Failed to link wallet: ${result?.get("error") ?: "Bridge offline"}")
    } else {
        player.mes("Wallet linked: $address")
        player.mes("You can now ::withdraw RUNE tokens to your Solana wallet.")
    }
}

private fun withdrawCommand(cheat: Cheat) = with(cheat) {
    val amountStr = args.firstOrNull()
    val amount = amountStr?.toLongOrNull()
    if (amount == null || amount <= 0) {
        player.mes("Usage: ::withdraw <amount>  (e.g. ::withdraw 1000)")
        return
    }
    player.mes("Sending $amount RUNE to your wallet...")
    val result = post("/withdraw", mapOf("username" to player.username, "amount" to amount))
    if (result == null) {
        player.mes("Bridge offline. Try again shortly.")
        return
    }
    val error = result["error"] as? String
    if (error != null) {
        player.mes("Withdraw failed: $error")
    } else {
        val sig = result["signature"] as? String ?: "unknown"
        val remaining = result["remaining"]
        player.mes("Sent! Tx: ${sig.take(16)}...")
        player.mes("Remaining balance: $remaining RUNE")
    }
}

private fun depositCommand(cheat: Cheat) = with(cheat) {
    player.mes("To deposit RUNE tokens:")
    player.mes("1. Link your wallet: ::wallet <address>")
    player.mes("2. Send tokens to the server wallet on Solana")
    player.mes("3. Your in-game balance updates within ~30 seconds")
    player.mes("Check server wallet at: discord.gg/your-server")
}

private fun balanceCommand(cheat: Cheat) = with(cheat) {
    val result = get("/balance/${player.username}")
    if (result == null) {
        player.mes("Bridge offline. Try again shortly.")
        return
    }
    val amount = result["amount"]
    player.mes("Your RUNE balance: $amount tokens")
    player.mes("Use ::withdraw <amount> to send to your Solana wallet")
}
