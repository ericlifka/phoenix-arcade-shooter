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
    maxEnergyShield: number;
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
        maxArmor: 4,
        maxBombCapacity: 4,
        maxShipSpeed: 10,
        maxFireSpeed: 10,
        maxDamage: 4,
        maxEnergyShield: 5
    },
    {
        // Archetype: Mid-range, medium speed, medium damage, medium bomb capacity.
        id: 'double',
        unlockCost: 500,
        maxHealth: 12,
        maxArmor: 6,
        maxBombCapacity: 6,
        maxShipSpeed: 6,
        maxFireSpeed: 6,
        maxDamage: 6,
        maxEnergyShield: 7
    },
    {
        // Archetype: Tank, slow speed, high damage, large bomb capacity.
        id: 'triple',
        unlockCost: 1000,
        maxHealth: 16,
        maxArmor: 8,
        maxBombCapacity: 8,
        maxShipSpeed: 2,
        maxFireSpeed: 2,
        maxDamage: 12,
        maxEnergyShield: 2
    },
    {
        // Archetype: Spread, slow speed, medium damage, medium bomb capacity.
        id: 'radial',
        unlockCost: 1500,
        maxHealth: 6,
        maxArmor: 2,
        maxBombCapacity: 2,
        maxShipSpeed: 4,
        maxFireSpeed: 4,
        maxDamage: 2,
        maxEnergyShield: 3
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
