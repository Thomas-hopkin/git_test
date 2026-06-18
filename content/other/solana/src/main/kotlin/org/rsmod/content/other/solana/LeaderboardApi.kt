package org.rsmod.content.other.solana

import com.fasterxml.jackson.databind.ObjectMapper
import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import jakarta.inject.Inject
import jakarta.inject.Singleton
import java.net.InetSocketAddress
import java.util.concurrent.Executors

private const val API_PORT = 8080

@Singleton
class LeaderboardApi @Inject constructor(private val store: KillStatsStore) {
    private val mapper = ObjectMapper()

    fun start() {
        val server = HttpServer.create(InetSocketAddress(API_PORT), 0)
        server.executor = Executors.newFixedThreadPool(2)

        server.createContext("/api/leaderboard") { exchange ->
            if (exchange.requestMethod == "GET") {
                val data = store.topByKills(100)
                respond(exchange, 200, mapper.writeValueAsString(data))
            } else {
                respond(exchange, 405, """{"error":"Method Not Allowed"}""")
            }
        }

        server.createContext("/api/player") { exchange ->
            if (exchange.requestMethod == "GET") {
                val username = exchange.requestURI.path.removePrefix("/api/player/")
                val stats = store.get(username)
                if (stats != null) {
                    respond(exchange, 200, mapper.writeValueAsString(stats))
                } else {
                    respond(exchange, 404, """{"error":"Player not found"}""")
                }
            } else {
                respond(exchange, 405, """{"error":"Method Not Allowed"}""")
            }
        }

        server.start()
    }

    private fun respond(exchange: HttpExchange, status: Int, body: String) {
        val bytes = body.toByteArray(Charsets.UTF_8)
        exchange.responseHeaders.add("Content-Type", "application/json")
        exchange.responseHeaders.add("Access-Control-Allow-Origin", "*")
        exchange.sendResponseHeaders(status, bytes.size.toLong())
        exchange.responseBody.use { it.write(bytes) }
    }
}
