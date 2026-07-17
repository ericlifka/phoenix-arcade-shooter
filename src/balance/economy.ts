import type { Position } from '../types/rendering';

/** Base value of a single money pickup (combo multiplies at collection). */
export const MONEY_DROP_VALUE = 5;

/** Fall speed for money pickups (pixels / second). */
export const MONEY_DROP_FALL_SPEED = 50;

/**
 * How many ships get money: floor(ships / divisor).
 * After dm > 4, roughly 1/3 of the wave drops; otherwise about 1/4.
 */
export function moneyDropDivisor(difficultyMultiplier: number): number {
    return difficultyMultiplier > 5 ? 3 : 4;
}

export function moneyDropCount(shipCount: number, difficultyMultiplier: number): number {
    return Math.floor(shipCount / moneyDropDivisor(difficultyMultiplier));
}

/** Relative offsets for the standard boss triple-money drop. */
export const BOSS_MONEY_OFFSETS: Position[] = [
    { x: 0, y: 0 },
    { x: 7, y: 0 },
    { x: 4, y: 8 }
];

export function bossMoneyPositions(origin: Position): Position[] {
    return BOSS_MONEY_OFFSETS.map((offset) => ({
        x: origin.x + offset.x,
        y: origin.y + offset.y
    }));
}
