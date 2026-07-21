import {
    DEFAULT_PLAYER_SHIP_ID,
    playerShipDefs,
    type PlayerShipId
} from '../balance/player-ships.js';

/**
 * Persistent modifiers for a single unlockable player ship.
 */
export interface PlayerShipProfile {
    id: PlayerShipId;
    unlocked: boolean;
    comboSegments: number;
    comboUpgrades: number;
    maxHealthRanks: number;
    armorRanks: number;
    bombCapacityRanks: number;
    shipSpeedRanks: number;
    fireSpeedRanks: number;
}

export type PlayerShipHangar = Record<PlayerShipId, PlayerShipProfile>;

export function createShipProfile(id: PlayerShipId, unlocked: boolean): PlayerShipProfile {
    return {
        id,
        unlocked,
        comboSegments: 0,
        comboUpgrades: 0,
        maxHealthRanks: 0,
        armorRanks: 0,
        bombCapacityRanks: 0,
        shipSpeedRanks: 0,
        fireSpeedRanks: 0
    };
}

export function createStarterHangar(): PlayerShipHangar {
    const hangar = {} as PlayerShipHangar;
    for (const def of playerShipDefs) {
        hangar[def.id] = createShipProfile(def.id, def.unlockCost === null);
    }
    return hangar;
}

export function defaultActiveShipId(): PlayerShipId {
    return DEFAULT_PLAYER_SHIP_ID;
}
