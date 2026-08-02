import type Bank from '../components/bank.js';
import type ComboGauge from '../components/combo-gauge.js';
import type PlayerControlledShip from '../ships/player-controlled-ship.js';

/** A discrete set of levels themed around one enemy ship type. */
export type LevelGroupKey = 'standard' | 'slim' | 'dash';

/** Everything the level select map can send the player to. */
export type HubDestination = LevelGroupKey | 'shop' | 'hangar';

/** Subset used by the shop screen. */
export interface GameForShop {
    bank: Bank;
    player: PlayerControlledShip;
    comboGauge: ComboGauge;
    interfaceColor: string;
    recordDollarsSpent(amount: number): void;
}

/** Subset used by the hangar ship-select screen. */
export interface GameForHangar {
    player: PlayerControlledShip;
    comboGauge: ComboGauge;
    interfaceColor: string;
}

/** Subset used by the level select map. */
export interface GameForLevelSelect {
    player: PlayerControlledShip;
    interfaceColor: string;
}

/**
 * Passed into `LevelManager` (Phoenix game instance). The manager hands its own
 * game reference straight to the shop, hangar, and level select screens, so it
 * has to cover everything those need too.
 */
export interface GameForLevels extends GameForShop, GameForHangar, GameForLevelSelect {
    width: number;
    height: number;
    clearBullets(): void;
    hideRunHud(): void;
    showRunHud(): void;
}
