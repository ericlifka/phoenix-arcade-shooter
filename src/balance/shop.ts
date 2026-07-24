/**
 * Shop upgrade definitions — costs, ranks, permanence, and tab placement.
 * Unlockable player ships live here too (each ship is its own shop tab).
 */

import type { PlayerShipId } from './player-ships.js';
import { playerShipDef, playerShipDefs } from './player-ships.js';

export type ShopTabId = 'run' | PlayerShipId;

export type ShopUpgradeId =
    | 'fullHeal'
    | 'health'
    | 'energyShield'
    | 'bomb'
    | 'maxHealth'
    | 'armor'
    | 'bombCapacity'
    | 'shipSpeed'
    | 'fireSpeed'
    | 'damage'
    | 'combo'
    | 'unlock';

export type CostFormula =
    | { kind: 'linear'; base: number; perRank: number }
    | { kind: 'tierLinear'; base: number }
    | { kind: 'schedule'; costs: number[] }
    | { kind: 'fixed'; amount: number };

export type ShopTabKind = 'text' | 'ship';

export interface ShopTabDef {
    id: ShopTabId;
    kind: ShopTabKind;
    /** Text tabs only. */
    label?: string;
    /** Ship tabs only. */
    shipId?: PlayerShipId;
}

export interface ShopUpgradeDef {
    id: ShopUpgradeId;
    tab: ShopTabId;
    permanent: boolean;
    label: string;
    /** Max owned ranks; null = uncapped. */
    maxRanks: number | null;
    cost: CostFormula;
}

/** Absolute combo segment cap (radial max); gauge uses this as its hard ceiling. */
export const MAX_COMBO_UPGRADES = 10;

export const COMBO_UPGRADE_COSTS = [
    25, 50, 100, 200, 400, 1000, 2000, 3500, 6000, 10000
] as const;

export const shopTabs: ReadonlyArray<ShopTabDef> = [
    { id: 'run', kind: 'text', label: 'Supplies' },
    ...playerShipDefs.map((ship) => ({
        id: ship.id as ShopTabId,
        kind: 'ship' as const,
        shipId: ship.id
    }))
];

/** Temporary run-only upgrades. */
export const runShopUpgrades: ReadonlyArray<Omit<ShopUpgradeDef, 'tab'> & { tab: 'run' }> = [
    {
        id: 'fullHeal',
        tab: 'run',
        permanent: false,
        label: 'Full Heal',
        maxRanks: null,
        cost: { kind: 'linear', base: 25, perRank: 10 }
    },
    {
        id: 'health',
        tab: 'run',
        permanent: false,
        label: '+1 Ship Health',
        maxRanks: null,
        cost: { kind: 'linear', base: 5, perRank: 5 }
    },
    {
        id: 'energyShield',
        tab: 'run',
        permanent: false,
        label: '+1 Energy Shield',
        maxRanks: null,
        cost: { kind: 'linear', base: 15, perRank: 10 }
    },
    {
        id: 'bomb',
        tab: 'run',
        permanent: false,
        label: '+1 Bomb',
        maxRanks: null,
        cost: { kind: 'linear', base: 25, perRank: 15 }
    }
];

type ShipUpgradeTemplate = Omit<ShopUpgradeDef, 'tab' | 'maxRanks'> & {
    /** Resolve max ranks from the ship def, or a fixed number. */
    maxRanksForShip: (shipId: PlayerShipId) => number;
};

/** Permanent upgrades shared across unlocked ship tabs. */
export const shipShopUpgradeTemplates: ReadonlyArray<ShipUpgradeTemplate> = [
    {
        id: 'maxHealth',
        permanent: true,
        label: '+5 Health',
        cost: { kind: 'linear', base: 100, perRank: 50 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxHealth
    },
    {
        id: 'armor',
        permanent: true,
        label: '+1 Armor',
        cost: { kind: 'linear', base: 75, perRank: 75 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxArmor
    },
    {
        id: 'bombCapacity',
        permanent: true,
        label: '+1 Bomb Capacity',
        cost: { kind: 'linear', base: 50, perRank: 100 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxBombCapacity
    },
    {
        id: 'shipSpeed',
        permanent: true,
        label: '+10% Ship Speed',
        cost: { kind: 'linear', base: 100, perRank: 100 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxShipSpeed
    },
    {
        id: 'fireSpeed',
        permanent: true,
        label: '10% Fire Speed',
        cost: { kind: 'linear', base: 100, perRank: 100 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxFireSpeed
    },
    {
        id: 'damage',
        permanent: true,
        label: '+1 Bullet Damage',
        cost: { kind: 'linear', base: 100, perRank: 100 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxDamage
    },
    {
        id: 'combo',
        permanent: true,
        label: 'Extend Combo',
        cost: { kind: 'schedule', costs: [...COMBO_UPGRADE_COSTS] },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxCombo
    }
];

export const shipUnlockUpgrades: ReadonlyArray<ShopUpgradeDef> = playerShipDefs
    .filter((ship) => ship.unlockCost !== null)
    .map((ship) => ({
        id: 'unlock' as const,
        tab: ship.id as ShopTabId,
        permanent: true,
        label: 'Unlock',
        maxRanks: 1,
        cost: { kind: 'fixed' as const, amount: ship.unlockCost as number }
    }));

/** Flat list for anything that still wants every concrete row. */
export const shopUpgrades: ReadonlyArray<ShopUpgradeDef> = [
    ...runShopUpgrades,
    ...shipUnlockUpgrades
];

/** Cost of the next rank, or null if maxed. */
export function nextUpgradeCost(def: ShopUpgradeDef, ownedRank: number): number | null {
    if (def.maxRanks !== null && ownedRank >= def.maxRanks) {
        return null;
    }

    switch (def.cost.kind) {
        case 'linear':
            return def.cost.base + ownedRank * def.cost.perRank;
        case 'tierLinear':
            return (ownedRank + 1) * def.cost.base;
        case 'schedule': {
            if (ownedRank >= def.cost.costs.length) {
                return null;
            }
            return def.cost.costs[ownedRank];
        }
        case 'fixed':
            return def.cost.amount;
    }
}

function shipUpgradesFor(shipId: PlayerShipId): ShopUpgradeDef[] {
    return shipShopUpgradeTemplates.map((template) => ({
        id: template.id,
        tab: shipId,
        permanent: template.permanent,
        label: template.label,
        cost: template.cost,
        maxRanks: template.maxRanksForShip(shipId)
    }));
}

/**
 * Rows for a tab. Locked ships only show Unlock; unlocked ships get
 * permanent upgrade templates with per-ship max ranks.
 */
export function upgradesForTab(
    tab: ShopTabId,
    isShipUnlocked: (shipId: PlayerShipId) => boolean
): ShopUpgradeDef[] {
    if (tab === 'run') {
        return [...runShopUpgrades];
    }

    const shipId = tab as PlayerShipId;
    const unlocked = isShipUnlocked(shipId);

    if (!unlocked) {
        return shipUnlockUpgrades.filter((upgrade) => upgrade.tab === tab);
    }

    return shipUpgradesFor(shipId);
}
