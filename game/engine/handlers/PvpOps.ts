// Custom RuneScript opcode handlers for PvP kill tracking.
//
// Registration: in Engine-TS src/engine/script/ScriptRunner.ts (or wherever
// handlers are registered), import this file and call registerPvpOps().
//
// Opcodes exposed to .rs2 scripts:
//   pvp_recordkill(string killer, string victim)
//   pvp_getkills(string player) -> int
//   pvp_getdeaths(string player) -> int
//   pvp_setwallet(string player, string address)

import { recordKill, getPlayer, setWallet, getLeaderboard } from '../KillStatsStore';

// ScriptState type — adjust import path to match actual Engine-TS source
// import type { ScriptState } from '../../ScriptState';

// Handler signature used by 2004Scape Engine-TS (adjust to match actual signature)
type OpcodeHandler = (state: any) => void;

function pvp_recordkill(state: any): void {
    const victim: string = state.popString();
    const killer: string = state.popString();
    if (killer && victim && killer !== victim) {
        recordKill(killer, victim);
    }
}

function pvp_getkills(state: any): void {
    const name: string = state.popString();
    const stats = getPlayer(name);
    state.pushInt(stats?.kills ?? 0);
}

function pvp_getdeaths(state: any): void {
    const name: string = state.popString();
    const stats = getPlayer(name);
    state.pushInt(stats?.deaths ?? 0);
}

function pvp_setwallet(state: any): void {
    const address: string = state.popString();
    const name: string = state.popString();
    if (name && address) {
        setWallet(name, address);
    }
}

function pvp_showtop(state: any): void {
    const top = getLeaderboard().slice(0, 5);
    if (top.length === 0) {
        state.player.messageGame('No kills recorded yet. Be the first!');
        return;
    }
    state.player.messageGame('=== Top Killers ===');
    top.forEach((p, i) => {
        state.player.messageGame(`${i + 1}. ${p.name} — ${p.kills} kills`);
    });
}

// Call this during server startup, after the script engine is initialised.
// The exact registration API depends on the Engine-TS version — look for
// ScriptOpcode enum and the addHandler / registerOpcode call pattern.
export function registerPvpOps(addHandler: (name: string, fn: OpcodeHandler) => void): void {
    addHandler('pvp_recordkill', pvp_recordkill);
    addHandler('pvp_getkills', pvp_getkills);
    addHandler('pvp_getdeaths', pvp_getdeaths);
    addHandler('pvp_setwallet', pvp_setwallet);
    addHandler('pvp_showtop', pvp_showtop);
    console.log('[pvp] Custom opcodes registered');
}
