import type Bank from '../components/bank.js';
import type ComboGauge from '../components/combo-gauge.js';
import type PlayerControlledShip from '../ships/player-controlled-ship.js';

/** Passed into `LevelManager` (Phoenix game instance). */
export interface GameForLevels {
    width: number;
    height: number;
    player: PlayerControlledShip;
    clearBullets(): void;
}

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
