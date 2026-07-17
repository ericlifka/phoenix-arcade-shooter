import { MAX_COMBO_UPGRADES, MAX_GUN_TIER } from '../balance/shop.js';

/**
 * Persistent modifiers for a single unlockable player ship.
 * Ship selection UI comes later; for now only the starter profile is used.
 */
export interface PlayerShipProfile {
    id: string;
    gunTier: number;
    comboSegments: number;
    comboUpgrades: number;
}

export function createStarterShipProfile(): PlayerShipProfile {
    return {
        id: 'starter',
        gunTier: 0,
        comboSegments: 0,
        comboUpgrades: 0
    };
}

export function cloneShipProfile(profile: PlayerShipProfile): PlayerShipProfile {
    return {
        id: profile.id,
        gunTier: profile.gunTier,
        comboSegments: profile.comboSegments,
        comboUpgrades: profile.comboUpgrades
    };
}

/** Re-export caps used by profile mutations. */
export { MAX_COMBO_UPGRADES, MAX_GUN_TIER };
