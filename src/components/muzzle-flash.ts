import Animation from '../rendering/core/animation.js';
import GameObject from '../models/game-object.js';
import Sprite from '../rendering/core/sprite.js';
import { Position } from '../types/rendering';

const shades = [
    "#ff0000",
    "#ff3300",
    "#ff6600",
    "#ff9933",
    "#ffcc00",
    "#ff9900",
    "#ffcc00",
    "#ffcc66",
    "#ffcc99"
];

const frames = shades.map((shade) => {
    return new Sprite([
        [shade, shade]
    ]);
});

/**
 * Visual effect for gun muzzle flash when firing
 */
export default class MuzzleFlash extends GameObject {
    private gunPosition: Position;

    constructor(parent: GameObject, gunPosition: Position) {
        super(parent);

        this.gunPosition = gunPosition;
        this.sprite = new Animation({
            frames: frames,
            millisPerFrame: 25
        });

        this.reset();
    }

    update(dtime: number): void {
        super.update(dtime);

        if (this.sprite && this.sprite.finished) {
            this.destroy();
        }
    }

    renderToFrame(frame: any): void {
        if (this.sprite && this.parent && this.parent.position) {
            this.sprite.renderToFrame(frame,
                Math.floor(this.parent.position.x + this.gunPosition.x),
                Math.floor(this.parent.position.y + this.gunPosition.y - 1),
                (this.parent.index || 0) + 1);
        }
    }
}
