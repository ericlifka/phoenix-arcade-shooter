import GameObject from '../models/game-object.js';
import FlyingSaucer from '../ships/flying-saucer.js';

export default class LevelGroup02 extends GameObject {
    constructor(parent, game, difficultyMultiplier, shipCount, levelName) {
        super(parent);

        if (shipCount === "boss") {
            shipCount = 1;
            this.boss = true;
        }

        this.game = game;
        this.levelName = levelName;
        this.rowCount = shipCount;
    }

    start() {

    }

    checkIfLevelComplete() {

    }
}
