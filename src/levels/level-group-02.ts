import GameObject from '../models/game-object.js';
import type { GameForLevels } from '../types/levels.js';

export default class LevelGroup02 extends GameObject {
    boss?: boolean;
    game: GameForLevels;
    levelName?: string;
    rowCount: number;

    constructor(
        parent: GameObject | null | undefined,
        game: GameForLevels,
        _difficultyMultiplier: number,
        shipCount: number | 'boss',
        levelName?: string
    ) {
        super(parent);

        if (shipCount === 'boss') {
            shipCount = 1;
            this.boss = true;
        }

        this.game = game;
        this.levelName = levelName;
        this.rowCount = shipCount;

        this.reset();
    }

    start(): void {

    }

    checkIfLevelComplete(): boolean {
        return false;
    }
}
