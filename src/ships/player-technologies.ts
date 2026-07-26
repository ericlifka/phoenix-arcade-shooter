/**
 * Permanent technology unlocks — shared across all ships, saved with meta.
 */

export interface PlayerTechnologies {
    /** Combo meter segments purchased (0 = locked / absent). */
    comboRanks: number;
    bombFabricator: boolean;
    energyShieldGenerator: boolean;
    hangarBay: boolean;
    armorRiveter: boolean;
    fuelMixingTank: boolean;
    focalLenseGrinder: boolean;
    thermalCooling: boolean;
}

export function createStarterTechnologies(): PlayerTechnologies {
    return {
        comboRanks: 0,
        bombFabricator: false,
        energyShieldGenerator: false,
        hangarBay: false,
        armorRiveter: false,
        fuelMixingTank: false,
        focalLenseGrinder: false,
        thermalCooling: false
    };
}

export function cloneTechnologies(tech: PlayerTechnologies): PlayerTechnologies {
    return {
        comboRanks: tech.comboRanks,
        bombFabricator: tech.bombFabricator,
        energyShieldGenerator: tech.energyShieldGenerator,
        hangarBay: tech.hangarBay,
        armorRiveter: tech.armorRiveter,
        fuelMixingTank: tech.fuelMixingTank,
        focalLenseGrinder: tech.focalLenseGrinder,
        thermalCooling: tech.thermalCooling
    };
}

export function technologiesHaveProgress(tech: PlayerTechnologies): boolean {
    return (
        tech.comboRanks > 0 ||
        tech.bombFabricator ||
        tech.energyShieldGenerator ||
        tech.hangarBay ||
        tech.armorRiveter ||
        tech.fuelMixingTank ||
        tech.focalLenseGrinder ||
        tech.thermalCooling
    );
}
