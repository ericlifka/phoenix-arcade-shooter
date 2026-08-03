import type Bank from '../components/bank.js';
import type ComboGauge from '../components/combo-gauge.js';
import type PlayerControlledShip from '../ships/player-controlled-ship.js';

/** Bodies of the solar system that host level sets. */
export type BodyKey =
    'sol' | 'mercury' | 'venus' | 'earth' | 'luna' | 'mars' |
    'jupiter' | 'saturn' | 'uranus' | 'neptune';

/** Everything the level select map can send the player to. */
export type HubDestination = BodyKey | 'shop' | 'hangar';

/**
 * Per-level-set completion counts persisted in the save file. Keyed by
 * BodyKey ('earth' = Earth, 'luna' = Luna, etc.). Partial on purpose: a
 * missing key means the set has never been completed (read as 0), so new
 * bodies can be tracked without touching old saves.
 */
export type LevelCompletions = Partial<Record<BodyKey, number>>;

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
    levelCompletions: LevelCompletions;
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
    recordLevelSetCompletion(set: BodyKey): void;
}
