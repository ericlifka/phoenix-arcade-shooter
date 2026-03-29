import type Bank from '../components/bank.js';
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
    interfaceColor: string;
}
