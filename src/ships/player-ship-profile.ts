import {
    DEFAULT_PLAYER_SHIP_ID,
    playerShipDefs,
    type PlayerShipId
} from '../balance/player-ships.js';
import { MAX_COMBO_UPGRADES } from '../balance/shop.js';

/**
 * Persistent modifiers for a single unlockable player ship.
 */
export interface PlayerShipProfile {
    id: PlayerShipId;
    unlocked: boolean;
    comboSegments: number;
    comboUpgrades: number;
}

export type PlayerShipHangar = Record<PlayerShipId, PlayerShipProfile>;

export function createShipProfile(id: PlayerShipId, unlocked: boolean): PlayerShipProfile {
    return {
        id,
        unlocked,
        comboSegments: 0,
        comboUpgrades: 0
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

export { MAX_COMBO_UPGRADES };
