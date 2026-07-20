/**
 * Unlockable player ships — each becomes its own shop tab.
 * Gun layouts that used to be starter upgrades are separate hulls.
 */

export type PlayerShipId = 'starter' | 'double' | 'triple' | 'radial';

export interface PlayerShipDef {
    id: PlayerShipId;
    /** null = unlocked by default. */
    unlockCost: number | null;
}

/**
 * Unlock prices match the old gun-tier shop costs:
 * Double $500, Triple $1000, Radial $1500.
 */
export const playerShipDefs: ReadonlyArray<PlayerShipDef> = [
    { id: 'starter', unlockCost: null },
    { id: 'double', unlockCost: 500 },
    { id: 'triple', unlockCost: 1000 },
    { id: 'radial', unlockCost: 1500 }
];

export const DEFAULT_PLAYER_SHIP_ID: PlayerShipId = 'starter';

export function playerShipDef(id: PlayerShipId): PlayerShipDef {
    const def = playerShipDefs.find((ship) => ship.id === id);
    if (!def) {
        throw new Error(`Unknown player ship id: ${id}`);
    }
    return def;
}
