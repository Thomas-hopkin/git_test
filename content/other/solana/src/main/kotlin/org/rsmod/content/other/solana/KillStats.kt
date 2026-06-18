package org.rsmod.content.other.solana

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty

data class KillStats
@JsonCreator
constructor(
    @param:JsonProperty("username") val username: String,
    @param:JsonProperty("kills") var kills: Int = 0,
    @param:JsonProperty("deaths") var deaths: Int = 0,
    @param:JsonProperty("wallet") var wallet: String? = null,
) {
    val kd: String
        get() = if (deaths == 0) "$kills.00" else "%.2f".format(kills.toDouble() / deaths)
}
