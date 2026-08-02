import {
    createShipProfile,
    type PlayerShipHangar,
    type PlayerShipProfile
} from '../ships/player-ship-profile.js';
import {
    cloneTechnologies,
    createStarterTechnologies,
    technologiesHaveProgress,
    type PlayerTechnologies
} from '../ships/player-technologies.js';
import { playerShipDefs, type PlayerShipId } from '../balance/player-ships.js';
import { MAX_COMBO_UPGRADES } from '../balance/shop.js';
import type { LevelCompletions } from '../types/levels.js';

export const SAVE_VERSION = 3 as const;
export const SAVE_STORAGE_KEY = 'phoenix-arcade-shooter-save-v3';

export interface SaveData {
    version: typeof SAVE_VERSION;
    runsCompleted: number;
    shipHangar: PlayerShipHangar;
    technologies: PlayerTechnologies;
    levelCompletions: LevelCompletions;
}

export interface SaveHost {
    runsCompleted: number;
    levelCompletions: LevelCompletions;
    player: {
        shipHangar: PlayerShipHangar;
        technologies: PlayerTechnologies;
    };
}

const RANK_KEYS: (keyof PlayerShipProfile)[] = [
    'maxHealthRanks',
    'armorRanks',
    'bombCapacityRanks',
    'shipSpeedRanks',
    'fireSpeedRanks',
    'damageRanks',
    'energyShieldRanks'
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
        maxHealthRanks: profile.maxHealthRanks,
        armorRanks: profile.armorRanks,
        bombCapacityRanks: profile.bombCapacityRanks,
        shipSpeedRanks: profile.shipSpeedRanks,
        fireSpeedRanks: profile.fireSpeedRanks,
        damageRanks: profile.damageRanks,
        energyShieldRanks: profile.energyShieldRanks
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
        if (!isNonNegativeInt(profile[key])) {
            return null;
        }
    }

    return {
        id,
        unlocked: profile.unlocked,
        maxHealthRanks: profile.maxHealthRanks as number,
        armorRanks: profile.armorRanks as number,
        bombCapacityRanks: profile.bombCapacityRanks as number,
        shipSpeedRanks: profile.shipSpeedRanks as number,
        fireSpeedRanks: profile.fireSpeedRanks as number,
        damageRanks: profile.damageRanks as number,
        energyShieldRanks: profile.energyShieldRanks as number
    };
}

function validateTechnologies(raw: unknown): PlayerTechnologies | null {
    if (!raw || typeof raw !== 'object') {
        return null;
    }

    const tech = raw as Record<string, unknown>;
    if (!isNonNegativeInt(tech.comboRanks) || tech.comboRanks > MAX_COMBO_UPGRADES) {
        return null;
    }

    const flags: (keyof PlayerTechnologies)[] = [
        'bombFabricator',
        'energyShieldGenerator',
        'hangarBay',
        'armorRiveter',
        'fuelMixingTank',
        'focalLenseGrinder',
        'thermalCooling'
    ];

    for (const key of flags) {
        if (typeof tech[key] !== 'boolean') {
            return null;
        }
    }

    return {
        comboRanks: tech.comboRanks,
        bombFabricator: tech.bombFabricator as boolean,
        energyShieldGenerator: tech.energyShieldGenerator as boolean,
        hangarBay: tech.hangarBay as boolean,
        armorRiveter: tech.armorRiveter as boolean,
        fuelMixingTank: tech.fuelMixingTank as boolean,
        focalLenseGrinder: tech.focalLenseGrinder as boolean,
        thermalCooling: tech.thermalCooling as boolean
    };
}

/**
 * Fresh completion record for a new save: every trackable level set at 0.
 * New planets/level sets get added here as they ship.
 */
export function createStarterLevelCompletions(): LevelCompletions {
    return {
        standard: 0, // Earth
        slim: 0 // Luna
    };
}

/**
 * Deliberately lenient — unlike the hangar/tech validators this never
 * rejects the save. A missing or malformed section yields starter zeroes;
 * individual entries that aren't non-negative integers fall back to 0.
 * Valid entries under unknown keys are kept so data written by a newer
 * build (e.g. a planet this version doesn't know) survives a load/save.
 */
function validateLevelCompletions(raw: unknown): LevelCompletions {
    const completions = createStarterLevelCompletions();

    if (!raw || typeof raw !== 'object') {
        return completions;
    }

    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
        // Stricter than isNonNegativeInt: completion counts must be whole
        // numbers, and bad values here fall back to 0 instead of rejecting.
        if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
            completions[key as keyof LevelCompletions] = value;
        }
    }

    return completions;
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

    const technologies = validateTechnologies(data.technologies);
    if (!technologies) {
        return null;
    }

    const levelCompletions = validateLevelCompletions(data.levelCompletions);

    const hangarRaw = data.shipHangar as Record<string, unknown>;
    const hangar = {} as PlayerShipHangar;

    for (const def of playerShipDefs) {
        const validated = hangarRaw[def.id]
            ? validateProfile(def.id, hangarRaw[def.id])
            : null;

        hangar[def.id] = validated || createShipProfile(def.id, def.unlockCost === null);

        if (hangarRaw[def.id] && !validated) {
            return null;
        }
    }

    for (const key of Object.keys(hangarRaw)) {
        if (!isPlayerShipId(key)) {
            continue;
        }
    }

    return {
        version: SAVE_VERSION,
        runsCompleted: data.runsCompleted,
        shipHangar: hangar,
        technologies,
        levelCompletions
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
        // Drop legacy keys so old progress does not linger.
        localStorage.removeItem('phoenix-arcade-shooter-save-v1');
        localStorage.removeItem('phoenix-arcade-shooter-save-v2');
    } catch {
        // ignore
    }
}

export function hangarHasMetaProgress(
    hangar: PlayerShipHangar,
    technologies?: PlayerTechnologies
): boolean {
    if (technologies && technologiesHaveProgress(technologies)) {
        return true;
    }

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
            profile.energyShieldRanks > 0
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
        shipHangar: cloneHangar(host.player.shipHangar),
        technologies: cloneTechnologies(host.player.technologies),
        levelCompletions: { ...host.levelCompletions }
    };
}

export function applySave(host: SaveHost, data: SaveData): void {
    host.runsCompleted = data.runsCompleted;
    host.player.shipHangar = mergeHangarWithDefs(data.shipHangar);
    host.player.technologies = cloneTechnologies(data.technologies);
    host.levelCompletions = { ...data.levelCompletions };
}

export { createStarterTechnologies };
