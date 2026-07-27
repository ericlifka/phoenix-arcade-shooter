/**
 * Shop upgrade definitions — costs, ranks, permanence, and tab placement.
 */

import type { PlayerShipId } from './player-ships.js';
import { playerShipDef, playerShipDefs } from './player-ships.js';
import type { PlayerTechnologies } from '../ships/player-technologies.js';

export type ShopTabId = 'run' | 'technology' | PlayerShipId;

export type ShopUpgradeId =
    | 'fullHeal'
    | 'rechargeShield'
    | 'health'
    | 'energyShield'
    | 'bomb'
    | 'maxHealth'
    | 'armor'
    | 'bombCapacity'
    | 'shipSpeed'
    | 'fireSpeed'
    | 'damage'
    | 'energyShieldCapacity'
    | 'combo'
    | 'bombFabricator'
    | 'shieldGenerator'
    | 'hangarBay'
    | 'armorRiveter'
    | 'fuelMixingTank'
    | 'focalLenseGrinder'
    | 'thermalCooling'
    | 'unlock'
    | 'deathHealth'
    | 'deathShield';

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
    /** Ship unlock rows only. */
    unlockShipId?: PlayerShipId;
}

/** Absolute combo segment cap; gauge uses this as its hard ceiling. */
export const MAX_COMBO_UPGRADES = 10;

export const COMBO_UPGRADE_COSTS = [
    25, 50, 100, 200, 400, 1000, 2000, 3500, 6000, 10000
] as const;

/** Base tabs always shown; ship tabs are appended when Hangar Bay is owned. */
export const baseShopTabs: ReadonlyArray<ShopTabDef> = [
    { id: 'run', kind: 'text', label: 'Supplies' },
    { id: 'technology', kind: 'text', label: 'Technology' }
];

/** @deprecated Prefer visibleShopTabs — kept for any static iteration. */
export const shopTabs: ReadonlyArray<ShopTabDef> = [
    ...baseShopTabs,
    ...playerShipDefs.map((ship) => ({
        id: ship.id as ShopTabId,
        kind: 'ship' as const,
        shipId: ship.id
    }))
];

export function visibleShopTabs(
    hangarBay: boolean,
    isShipUnlocked: (shipId: PlayerShipId) => boolean
): ShopTabDef[] {
    const tabs: ShopTabDef[] = [...baseShopTabs];
    if (!hangarBay) {
        return tabs;
    }
    for (const ship of playerShipDefs) {
        if (isShipUnlocked(ship.id)) {
            tabs.push({
                id: ship.id,
                kind: 'ship',
                shipId: ship.id
            });
        }
    }
    return tabs;
}

/** Temporary run-only upgrades. */
export const runShopUpgrades: ReadonlyArray<Omit<ShopUpgradeDef, 'tab'> & { tab: 'run' }> = [
    {
        id: 'fullHeal',
        tab: 'run',
        permanent: false,
        label: 'Repair Hull',
        maxRanks: null,
        cost: { kind: 'linear', base: 25, perRank: 25 }
    },
    {
        id: 'rechargeShield',
        tab: 'run',
        permanent: false,
        label: 'Recharge Shield',
        maxRanks: null,
        cost: { kind: 'linear', base: 25, perRank: 25 }
    },
    {
        id: 'health',
        tab: 'run',
        permanent: false,
        label: 'Reinforce Hull (+1 Health)',
        maxRanks: null,
        cost: { kind: 'linear', base: 5, perRank: 5 }
    },
    {
        id: 'energyShield',
        tab: 'run',
        permanent: false,
        label: 'Expand Shield (+1 shield)',
        maxRanks: null,
        cost: { kind: 'linear', base: 25, perRank: 25 }
    },
    {
        id: 'bomb',
        tab: 'run',
        permanent: false,
        label: '+1 Bomb',
        maxRanks: null,
        cost: { kind: 'linear', base: 15, perRank: 15 }
    }
];

/** Death-screen next-run buffs (not shown in the mid-run shop). */
export const deathShopUpgrades: ReadonlyArray<ShopUpgradeDef> = [
    {
        id: 'deathHealth',
        tab: 'run',
        permanent: false,
        label: '+10 Hull',
        maxRanks: null,
        cost: { kind: 'linear', base: 50, perRank: 25 }
    },
    {
        id: 'deathShield',
        tab: 'run',
        permanent: false,
        label: '+3 Energy Shield',
        maxRanks: null,
        cost: { kind: 'linear', base: 50, perRank: 25 }
    }
];

type ShipUpgradeTemplate = Omit<ShopUpgradeDef, 'tab' | 'maxRanks'> & {
    maxRanksForShip: (shipId: PlayerShipId) => number;
    /** Technology flag that must be true to show this row (omit = always). */
    requiresTech?: keyof PlayerTechnologies;
};

/** Permanent upgrades on ship tabs (combo removed — lives on Technology). */
export const shipShopUpgradeTemplates: ReadonlyArray<ShipUpgradeTemplate> = [
    {
        id: 'maxHealth',
        permanent: true,
        label: '+5 Hull',
        cost: { kind: 'linear', base: 100, perRank: 75 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxHealth
    },
    {
        id: 'armor',
        permanent: true,
        label: '+1 Armor',
        cost: { kind: 'linear', base: 150, perRank: 125 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxArmor,
        requiresTech: 'armorRiveter'
    },
    {
        id: 'bombCapacity',
        permanent: true,
        label: '+1 Bomb Capacity',
        cost: { kind: 'linear', base: 75, perRank: 75 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxBombCapacity,
        requiresTech: 'bombFabricator'
    },
    {
        id: 'energyShieldCapacity',
        permanent: true,
        label: '+1 Energy Shield',
        cost: { kind: 'linear', base: 100, perRank: 100 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxEnergyShield,
        requiresTech: 'energyShieldGenerator'
    },
    {
        id: 'shipSpeed',
        permanent: true,
        label: '+10% Ship Speed',
        cost: { kind: 'linear', base: 200, perRank: 25 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxShipSpeed,
        requiresTech: 'fuelMixingTank'
    },
    {
        id: 'fireSpeed',
        permanent: true,
        label: '+10% Fire Speed',
        cost: { kind: 'linear', base: 100, perRank: 50 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxFireSpeed,
        requiresTech: 'thermalCooling'
    },
    {
        id: 'damage',
        permanent: true,
        label: '+1 Damage',
        cost: { kind: 'linear', base: 100, perRank: 100 },
        maxRanksForShip: (shipId) => playerShipDef(shipId).maxDamage,
        requiresTech: 'focalLenseGrinder'
    }
];

/** Next locked ship in starter → double → triple → radial order, or null. */
export function nextShipToUnlock(
    isShipUnlocked: (shipId: PlayerShipId) => boolean
): (typeof playerShipDefs)[number] | null {
    for (const ship of playerShipDefs) {
        if (ship.unlockCost === null) {
            continue;
        }
        if (!isShipUnlocked(ship.id)) {
            return ship;
        }
    }
    return null;
}

export function technologyUpgradesFor(
    tech: PlayerTechnologies,
    isShipUnlocked: (shipId: PlayerShipId) => boolean
): ShopUpgradeDef[] {
    const rows: ShopUpgradeDef[] = [];

    if (tech.comboRanks < MAX_COMBO_UPGRADES) {
        rows.push({
            id: 'combo',
            tab: 'technology',
            permanent: true,
            label: tech.comboRanks === 0 ? 'Combo Meter' : 'Extend Combo',
            maxRanks: MAX_COMBO_UPGRADES,
            cost: { kind: 'schedule', costs: [...COMBO_UPGRADE_COSTS] }
        });
    }

    if (!tech.bombFabricator) {
        rows.push({
            id: 'bombFabricator',
            tab: 'technology',
            permanent: true,
            label: 'Bomb Fabricator',
            maxRanks: 1,
            cost: { kind: 'fixed', amount: 50 }
        });
    }

    if (!tech.energyShieldGenerator) {
        rows.push({
            id: 'shieldGenerator',
            tab: 'technology',
            permanent: true,
            label: 'Energy Shield Generator',
            maxRanks: 1,
            cost: { kind: 'fixed', amount: 75 }
        });
    }

    if (!tech.hangarBay) {
        rows.push({
            id: 'hangarBay',
            tab: 'technology',
            permanent: true,
            label: 'Hangar Bay',
            maxRanks: 1,
            cost: { kind: 'fixed', amount: 100 }
        });
    } else {
        if (!tech.armorRiveter) {
            rows.push({
                id: 'armorRiveter',
                tab: 'technology',
                permanent: true,
                label: 'Armor Riveter',
                maxRanks: 1,
                cost: { kind: 'fixed', amount: 150 }
            });
        }
        if (!tech.fuelMixingTank) {
            rows.push({
                id: 'fuelMixingTank',
                tab: 'technology',
                permanent: true,
                label: 'Fuel Mixing Tank',
                maxRanks: 1,
                cost: { kind: 'fixed', amount: 200 }
            });
        }
        if (!tech.focalLenseGrinder) {
            rows.push({
                id: 'focalLenseGrinder',
                tab: 'technology',
                permanent: true,
                label: 'Focal Lense Grinder',
                maxRanks: 1,
                cost: { kind: 'fixed', amount: 250 }
            });
        }
        if (!tech.thermalCooling) {
            rows.push({
                id: 'thermalCooling',
                tab: 'technology',
                permanent: true,
                label: 'Thermal Cooling',
                maxRanks: 1,
                cost: { kind: 'fixed', amount: 300 }
            });
        }

        const next = nextShipToUnlock(isShipUnlocked);
        if (next && next.unlockCost !== null) {
            rows.push({
                id: 'unlock',
                tab: 'technology',
                permanent: true,
                label: 'Purchase',
                maxRanks: 1,
                cost: { kind: 'fixed', amount: next.unlockCost },
                unlockShipId: next.id
            });
        }
    }

    return rows;
}

export function runUpgradesFor(tech: PlayerTechnologies): ShopUpgradeDef[] {
    return runShopUpgrades.filter((upgrade) => {
        if (upgrade.id === 'bomb') {
            return tech.bombFabricator;
        }
        if (upgrade.id === 'energyShield' || upgrade.id === 'rechargeShield') {
            return tech.energyShieldGenerator;
        }
        return true;
    });
}

function shipUpgradesFor(
    shipId: PlayerShipId,
    tech: PlayerTechnologies
): ShopUpgradeDef[] {
    return shipShopUpgradeTemplates
        .filter((template) => {
            if (!template.requiresTech) {
                return true;
            }
            return !!tech[template.requiresTech];
        })
        .map((template) => ({
            id: template.id,
            tab: shipId,
            permanent: template.permanent,
            label: template.label,
            cost: template.cost,
            maxRanks: template.maxRanksForShip(shipId)
        }));
}

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

export interface UpgradesForTabContext {
    technologies: PlayerTechnologies;
    isShipUnlocked: (shipId: PlayerShipId) => boolean;
}

/**
 * Rows for a tab. Technology and Supplies are filtered by unlock state;
 * ship tabs only appear when Hangar Bay is owned (caller controls tabs).
 */
export function upgradesForTab(
    tab: ShopTabId,
    context: UpgradesForTabContext
): ShopUpgradeDef[] {
    if (tab === 'run') {
        return runUpgradesFor(context.technologies);
    }

    if (tab === 'technology') {
        return technologyUpgradesFor(context.technologies, context.isShipUnlocked);
    }

    const shipId = tab as PlayerShipId;
    if (!context.isShipUnlocked(shipId)) {
        return [];
    }

    return shipUpgradesFor(shipId, context.technologies);
}
