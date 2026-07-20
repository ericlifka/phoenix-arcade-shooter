/**
 * Shop upgrade definitions — costs, ranks, permanence, and tab placement.
 * Unlockable player ships live here too (each ship is its own shop tab).
 */

import type { PlayerShipId } from './player-ships.js';
import { playerShipDefs } from './player-ships.js';

export type ShopTabId = 'run' | PlayerShipId;

export type ShopUpgradeId = 'health' | 'rate' | 'damage' | 'armor' | 'combo' | 'unlock';

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
    /** Default list label when not using labelsByRank. */
    label: string;
    /** Max owned ranks; null = uncapped. */
    maxRanks: number | null;
    cost: CostFormula;
}

/** Matches combo gauge segment cap. */
export const MAX_COMBO_UPGRADES = 10;

export const COMBO_UPGRADE_COSTS = [
    25, 50, 100, 200, 400, 1000, 2000, 3500, 6000, 10000
] as const;

export const shopTabs: ReadonlyArray<ShopTabDef> = [
    { id: 'run', kind: 'text', label: 'Current Run' },
    ...playerShipDefs.map((ship) => ({
        id: ship.id as ShopTabId,
        kind: 'ship' as const,
        shipId: ship.id
    }))
];

export const shopUpgrades: ReadonlyArray<ShopUpgradeDef> = [
    {
        id: 'health',
        tab: 'run',
        permanent: false,
        label: '+1 Ship Health',
        maxRanks: null,
        cost: { kind: 'linear', base: 5, perRank: 5 }
    },
    {
        id: 'rate',
        tab: 'run',
        permanent: false,
        label: '10% faster Firing Rate',
        maxRanks: null,
        cost: { kind: 'linear', base: 50, perRank: 50 }
    },
    {
        id: 'damage',
        tab: 'run',
        permanent: false,
        label: '+1 Bullet Damage',
        maxRanks: null,
        cost: { kind: 'linear', base: 100, perRank: 100 }
    },
    {
        id: 'armor',
        tab: 'run',
        permanent: false,
        label: '+1 Armor',
        maxRanks: null,
        cost: { kind: 'linear', base: 75, perRank: 75 }
    },
    {
        id: 'combo',
        tab: 'starter',
        permanent: true,
        label: 'Extend Combo',
        maxRanks: MAX_COMBO_UPGRADES,
        cost: { kind: 'schedule', costs: [...COMBO_UPGRADE_COSTS] }
    },
    ...playerShipDefs
        .filter((ship) => ship.unlockCost !== null)
        .map((ship) => ({
            id: 'unlock' as const,
            tab: ship.id as ShopTabId,
            permanent: true,
            label: 'Unlock',
            maxRanks: 1,
            cost: { kind: 'fixed' as const, amount: ship.unlockCost as number }
        }))
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

/**
 * Rows for a tab. Locked ships only show Unlock; unlocked premium ships
 * have no permanent upgrades yet (combo stays on starter).
 */
export function upgradesForTab(
    tab: ShopTabId,
    isShipUnlocked: (shipId: PlayerShipId) => boolean
): ShopUpgradeDef[] {
    if (tab === 'run') {
        return shopUpgrades.filter((upgrade) => upgrade.tab === 'run');
    }

    const shipId = tab as PlayerShipId;
    const unlocked = isShipUnlocked(shipId);

    if (!unlocked) {
        return shopUpgrades.filter(
            (upgrade) => upgrade.tab === tab && upgrade.id === 'unlock'
        );
    }

    return shopUpgrades.filter(
        (upgrade) => upgrade.tab === tab && upgrade.id !== 'unlock'
    );
}
