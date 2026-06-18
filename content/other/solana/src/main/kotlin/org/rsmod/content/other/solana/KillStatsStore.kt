package org.rsmod.content.other.solana

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.io.File
import java.util.concurrent.ConcurrentHashMap

@Singleton
class KillStatsStore @Inject constructor() {
    private val stats = ConcurrentHashMap<String, KillStats>()
    private val file = File(".data/pvp-kills.json")
    private val mapper = ObjectMapper()

    init {
        load()
    }

    fun getOrCreate(username: String): KillStats =
        stats.getOrPut(username) { KillStats(username) }

    fun get(username: String): KillStats? = stats[username]

    fun topByKills(limit: Int = 10): List<KillStats> =
        stats.values.sortedByDescending { it.kills }.take(limit)

    fun recordKill(killerName: String, victimName: String) {
        getOrCreate(killerName).kills++
        getOrCreate(victimName).deaths++
        save()
    }

    fun setWallet(username: String, address: String) {
        getOrCreate(username).wallet = address
        save()
    }

    fun save() {
        try {
            file.parentFile?.mkdirs()
            mapper.writerWithDefaultPrettyPrinter()
                .writeValue(file, stats.values.toList())
        } catch (e: Exception) {
            // log silently — non-critical
        }
    }

    private fun load() {
        if (!file.exists()) return
        try {
            val list: List<KillStats> =
                mapper.readValue(file, object : TypeReference<List<KillStats>>() {})
            for (entry in list) stats[entry.username] = entry
        } catch (e: Exception) {
            // corrupt file — start fresh
        }
    }
}
