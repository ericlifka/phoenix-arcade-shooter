/**
 * Shop upgrade definitions — costs, ranks, permanence, and tab placement.
 */

export type ShopTabId = 'run' | 'ship';

export type ShopUpgradeId = 'health' | 'rate' | 'damage' | 'armor' | 'guns' | 'combo';

export type CostFormula =
    | { kind: 'linear'; base: number; perRank: number }
    | { kind: 'tierLinear'; base: number }
    | { kind: 'schedule'; costs: number[] };

export interface ShopTabDef {
    id: ShopTabId;
    label: string;
}

export interface ShopUpgradeDef {
    id: ShopUpgradeId;
    tab: ShopTabId;
    permanent: boolean;
    /** Default list label when not using labelsByRank. */
    label: string;
    /** Label for the next purchase at each owned rank (guns). */
    labelsByRank?: string[];
    /** Max owned ranks; null = uncapped. */
    maxRanks: number | null;
    cost: CostFormula;
}

/** Matches historical gun tier cap (Double / Triple / Radial). */
export const MAX_GUN_TIER = 3;

/** Matches combo gauge segment cap. */
export const MAX_COMBO_UPGRADES = 10;

export const GUN_UPGRADE_NAMES = ['Double Guns', 'Triple Guns', 'Radial Guns'] as const;

export const COMBO_UPGRADE_COSTS = [
    25, 50, 100, 200, 400, 1000, 2000, 3500, 6000, 10000
] as const;

export const shopTabs: ReadonlyArray<ShopTabDef> = [
    { id: 'run', label: 'Current Run' },
    { id: 'ship', label: 'Player Ship' }
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
        id: 'guns',
        tab: 'ship',
        permanent: true,
        label: 'Gun Upgrade',
        labelsByRank: [...GUN_UPGRADE_NAMES],
        maxRanks: MAX_GUN_TIER,
        cost: { kind: 'tierLinear', base: 500 }
    },
    {
        id: 'combo',
        tab: 'ship',
        permanent: true,
        label: 'Extend Combo',
        maxRanks: MAX_COMBO_UPGRADES,
        cost: { kind: 'schedule', costs: [...COMBO_UPGRADE_COSTS] }
    }
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
    }
}

export function upgradesForTab(tab: ShopTabId): ShopUpgradeDef[] {
    return shopUpgrades.filter((upgrade) => upgrade.tab === tab);
}
