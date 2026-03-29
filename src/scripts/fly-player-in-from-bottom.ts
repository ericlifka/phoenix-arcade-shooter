import GameObject from '../models/game-object.js';
import type { GameForLevels } from '../types/levels.js';

export default class FlyPlayerInFromBottom extends GameObject {
    game: GameForLevels;
    player: GameForLevels['player'];

    constructor(parent: GameObject | null | undefined, game: GameForLevels) {
        super(parent);

        this.game = game;
        this.player = game.player;

        this.reset();
    }

    start(): this {
        this.player.preventInputControl = true;

        const position = this.player.position;
        const velocity = this.player.velocity;

        position.x = Math.floor(this.game.width / 2 - this.player.sprite.width / 2);
        position.y = this.game.height + 30;
        velocity.x = 0;
        velocity.y = -this.player.SPEED / 5;

        return this;
    }

    update(dtime: number): void {
        super.update(dtime);

        if (this.player.position.y < this.game.height - this.player.sprite.height - 2) {
            this.player.preventInputControl = false;
            this.destroy();
        }
    }
}
