/**
 * Unlockable player ships — each becomes its own shop tab.
 * Per-ship caps drive permanent upgrade max ranks in the shop.
 */

export type PlayerShipId = 'starter' | 'double' | 'triple' | 'radial';

export interface PlayerShipDef {
    id: PlayerShipId;
    /** null = unlocked by default. */
    unlockCost: number | null;
    maxHealth: number;
    maxArmor: number;
    maxBombCapacity: number;
    maxShipSpeed: number;
    maxFireSpeed: number;
    maxDamage: number;
    maxCombo: number;
}

/**
 * Unlock prices match the old gun-tier shop costs:
 * Double $500, Triple $1000, Radial $1500.
 *
 * Caps: maxHealth / maxArmor / maxShipSpeed / maxFireSpeed / maxDamage / maxCombo
 * (bomb capacity is 3 on every ship).
 */
export const playerShipDefs: ReadonlyArray<PlayerShipDef> = [
    {
        id: 'starter',
        unlockCost: null,
        maxHealth: 3,
        maxArmor: 2,
        maxBombCapacity: 3,
        maxShipSpeed: 5,
        maxFireSpeed: 5,
        maxDamage: 3,
        maxCombo: 4
    },
    {
        id: 'double',
        unlockCost: 500,
        maxHealth: 4,
        maxArmor: 3,
        maxBombCapacity: 3,
        maxShipSpeed: 4,
        maxFireSpeed: 4,
        maxDamage: 4,
        maxCombo: 6
    },
    {
        id: 'triple',
        unlockCost: 1000,
        maxHealth: 5,
        maxArmor: 5,
        maxBombCapacity: 3,
        maxShipSpeed: 3,
        maxFireSpeed: 3,
        maxDamage: 5,
        maxCombo: 8
    },
    {
        id: 'radial',
        unlockCost: 1500,
        maxHealth: 6,
        maxArmor: 8,
        maxBombCapacity: 3,
        maxShipSpeed: 2,
        maxFireSpeed: 2,
        maxDamage: 6,
        maxCombo: 10
    }
];

export const DEFAULT_PLAYER_SHIP_ID: PlayerShipId = 'starter';

export function playerShipDef(id: PlayerShipId): PlayerShipDef {
    const def = playerShipDefs.find((ship) => ship.id === id);
    if (!def) {
        throw new Error(`Unknown player ship id: ${id}`);
    }
    return def;
}
