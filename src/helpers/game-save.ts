import {
    createShipProfile,
    type PlayerShipHangar,
    type PlayerShipProfile
} from '../ships/player-ship-profile.js';
import { playerShipDefs, type PlayerShipId } from '../balance/player-ships.js';

export const SAVE_VERSION = 1 as const;
export const SAVE_STORAGE_KEY = 'phoenix-arcade-shooter-save-v1';

export interface SaveData {
    version: typeof SAVE_VERSION;
    runsCompleted: number;
    shipHangar: PlayerShipHangar;
}

export interface SaveHost {
    runsCompleted: number;
    player: {
        shipHangar: PlayerShipHangar;
    };
}

const RANK_KEYS: (keyof PlayerShipProfile)[] = [
    'comboSegments',
    'comboUpgrades',
    'maxHealthRanks',
    'armorRanks',
    'bombCapacityRanks',
    'shipSpeedRanks',
    'fireSpeedRanks',
    'damageRanks'
];

function isPlayerShipId(id: string): id is PlayerShipId {
    return playerShipDefs.some((def) => def.id === id);
}

function isNonNegativeInt(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function cloneProfile(profile: PlayerShipProfile): PlayerShipProfile {
    return {
        id: profile.id,
        unlocked: profile.unlocked,
        comboSegments: profile.comboSegments,
        comboUpgrades: profile.comboUpgrades,
        maxHealthRanks: profile.maxHealthRanks,
        armorRanks: profile.armorRanks,
        bombCapacityRanks: profile.bombCapacityRanks,
        shipSpeedRanks: profile.shipSpeedRanks,
        fireSpeedRanks: profile.fireSpeedRanks,
        damageRanks: profile.damageRanks
    };
}

export function cloneHangar(hangar: PlayerShipHangar): PlayerShipHangar {
    const clone = {} as PlayerShipHangar;
    for (const def of playerShipDefs) {
        const profile = hangar[def.id];
        clone[def.id] = profile
            ? cloneProfile(profile)
            : createShipProfile(def.id, def.unlockCost === null);
    }
    return clone;
}

/**
 * Merge saved hangar with current ship defs so new hulls appear as locked defaults.
 */
export function mergeHangarWithDefs(saved: PlayerShipHangar): PlayerShipHangar {
    return cloneHangar(saved);
}

function validateProfile(id: PlayerShipId, raw: unknown): PlayerShipProfile | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const profile = raw as Record<string, unknown>;
    if (typeof profile.unlocked !== 'boolean') {
        return null;
    }

    for (const key of RANK_KEYS) {
        // Old saves omit damageRanks — treat as 0 so existing meta still loads.
        if (key === 'damageRanks' && profile[key] === undefined) {
            continue;
        }
        if (!isNonNegativeInt(profile[key])) {
            return null;
        }
    }

    return {
        id,
        unlocked: profile.unlocked,
        comboSegments: profile.comboSegments as number,
        comboUpgrades: profile.comboUpgrades as number,
        maxHealthRanks: profile.maxHealthRanks as number,
        armorRanks: profile.armorRanks as number,
        bombCapacityRanks: profile.bombCapacityRanks as number,
        shipSpeedRanks: profile.shipSpeedRanks as number,
        fireSpeedRanks: profile.fireSpeedRanks as number,
        damageRanks: isNonNegativeInt(profile.damageRanks) ? profile.damageRanks : 0
    };
}

function validateSave(raw: unknown): SaveData | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const data = raw as Record<string, unknown>;
    if (data.version !== SAVE_VERSION) {
        return null;
    }
    if (!isNonNegativeInt(data.runsCompleted)) {
        return null;
    }
    if (!data.shipHangar || typeof data.shipHangar !== 'object') {
        return null;
    }

    const hangarRaw = data.shipHangar as Record<string, unknown>;
    const hangar = {} as PlayerShipHangar;

    for (const def of playerShipDefs) {
        const validated = hangarRaw[def.id]
            ? validateProfile(def.id, hangarRaw[def.id])
            : null;

        hangar[def.id] = validated || createShipProfile(def.id, def.unlockCost === null);

        // Known id present but corrupt → treat whole save as bad
        if (hangarRaw[def.id] && !validated) {
            return null;
        }
    }

    // Reject unknown ship ids with corrupt data; ignore extras that validate as objects
    for (const key of Object.keys(hangarRaw)) {
        if (!isPlayerShipId(key)) {
            continue;
        }
    }

    return {
        version: SAVE_VERSION,
        runsCompleted: data.runsCompleted,
        shipHangar: hangar
    };
}

export function loadSave(): SaveData | null {
    try {
        const raw = localStorage.getItem(SAVE_STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return validateSave(JSON.parse(raw));
    } catch {
        return null;
    }
}

export function writeSave(data: SaveData): void {
    try {
        localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
    } catch {
        // Quota / private mode — ignore; game still runs
    }
}

export function clearSave(): void {
    try {
        localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch {
        // ignore
    }
}

export function hangarHasMetaProgress(hangar: PlayerShipHangar): boolean {
    for (const def of playerShipDefs) {
        const profile = hangar[def.id];
        if (!profile) {
            continue;
        }
        if (def.unlockCost !== null && profile.unlocked) {
            return true;
        }
        if (
            profile.maxHealthRanks > 0 ||
            profile.armorRanks > 0 ||
            profile.bombCapacityRanks > 0 ||
            profile.shipSpeedRanks > 0 ||
            profile.fireSpeedRanks > 0 ||
            profile.damageRanks > 0 ||
            profile.comboSegments > 0 ||
            profile.comboUpgrades > 0
        ) {
            return true;
        }
    }
    return false;
}

export function captureSave(host: SaveHost): SaveData {
    return {
        version: SAVE_VERSION,
        runsCompleted: host.runsCompleted,
        shipHangar: cloneHangar(host.player.shipHangar)
    };
}

export function applySave(host: SaveHost, data: SaveData): void {
    host.runsCompleted = data.runsCompleted;
    host.player.shipHangar = mergeHangarWithDefs(data.shipHangar);
}
