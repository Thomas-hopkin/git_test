import * as fs from 'fs';
import * as path from 'path';

interface PlayerStats {
    kills: number;
    deaths: number;
    wallet: string | null;
}

interface StoreData {
    players: Record<string, PlayerStats>;
}

const DATA_FILE = path.resolve(__dirname, '../../../data/pvp_stats.json');

let _store: StoreData = { players: {} };

function load(): void {
    try {
        if (fs.existsSync(DATA_FILE)) {
            _store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as StoreData;
        }
    } catch {
        _store = { players: {} };
    }
}

function save(): void {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(_store, null, 2));
}

function ensurePlayer(name: string): PlayerStats {
    const key = name.toLowerCase();
    if (!_store.players[key]) {
        _store.players[key] = { kills: 0, deaths: 0, wallet: null };
    }
    return _store.players[key];
}

load();

export function recordKill(killer: string, victim: string): void {
    ensurePlayer(killer).kills++;
    ensurePlayer(victim).deaths++;
    save();
}

export function setWallet(player: string, wallet: string): void {
    ensurePlayer(player).wallet = wallet;
    save();
}

export function getPlayer(name: string): PlayerStats | null {
    return _store.players[name.toLowerCase()] ?? null;
}

export function getLeaderboard(): Array<PlayerStats & { name: string }> {
    return Object.entries(_store.players)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
}
