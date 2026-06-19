import * as http from 'http';
import { getLeaderboard, getPlayer } from './KillStatsStore';

const PORT = parseInt(process.env.LEADERBOARD_PORT ?? '8080', 10);

function json(res: http.ServerResponse, status: number, body: unknown): void {
    const data = JSON.stringify(body);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': Buffer.byteLength(data),
    });
    res.end(data);
}

const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
        res.end();
        return;
    }

    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);

    if (url.pathname === '/api/leaderboard') {
        json(res, 200, { leaderboard: getLeaderboard() });
        return;
    }

    const playerMatch = url.pathname.match(/^\/api\/player\/(.+)$/);
    if (playerMatch) {
        const name = decodeURIComponent(playerMatch[1]);
        const stats = getPlayer(name);
        if (!stats) {
            json(res, 404, { error: 'Player not found' });
            return;
        }
        json(res, 200, { name, ...stats });
        return;
    }

    if (url.pathname === '/api/health') {
        json(res, 200, { ok: true });
        return;
    }

    json(res, 404, { error: 'Not found' });
});

export function startLeaderboardServer(): void {
    server.listen(PORT, () => {
        console.log(`[leaderboard] HTTP API listening on :${PORT}`);
    });
}
