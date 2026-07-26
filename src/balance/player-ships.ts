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
        // Archetype: Speedy, low damage high frequency.
        id: 'starter',
        unlockCost: null,
        maxHealth: 8,
        maxArmor: 2,
        maxBombCapacity: 3,
        maxShipSpeed: 10,
        maxFireSpeed: 10,
        maxDamage: 3,
        maxCombo: 10
    },
    {
        // Archetype: Mid-range, medium speed, medium damage, medium bomb capacity.
        id: 'double',
        unlockCost: 500,
        maxHealth: 12,
        maxArmor: 5,
        maxBombCapacity: 3,
        maxShipSpeed: 5,
        maxFireSpeed: 5,
        maxDamage: 4,
        maxCombo: 10
    },
    {
        // Archetype: Tank, slow speed, high damage, large bomb capacity.
        id: 'triple',
        unlockCost: 1000,
        maxHealth: 16,
        maxArmor: 9,
        maxBombCapacity: 6,
        maxShipSpeed: 1,
        maxFireSpeed: 1,
        maxDamage: 10,
        maxCombo: 10
    },
    {
        // Archetype: Spread, slow speed, medium damage, medium bomb capacity.
        id: 'radial',
        unlockCost: 1500,
        maxHealth: 6,
        maxArmor: 2,
        maxBombCapacity: 2,
        maxShipSpeed: 3,
        maxFireSpeed: 3,
        maxDamage: 1,
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
