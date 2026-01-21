import Animation from '../../libs/pxlr-core/core/animation.js';
import GameObject from '../models/game-object.js';
import Sprite from '../../libs/pxlr-core/core/sprite.js';

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

const frames = shades.map(function (shade) {
    return new Sprite([
        [ shade, shade ]
    ]);
});

export default class MuzzleFlash extends GameObject {
    constructor(parent, gunPosition) {
        super(parent);

        this.gunPosition = gunPosition;
        this.sprite = new Animation({
            frames: frames,
            millisPerFrame: 25
        });
    }

    update(dtime) {
        super.update(dtime);

        if (this.sprite.finished) {
            this.destroy();
        }
    }

    renderToFrame(frame) {
        this.sprite.renderToFrame(frame,
            Math.floor(this.parent.position.x + this.gunPosition.x),
            Math.floor(this.parent.position.y + this.gunPosition.y-1),
            (this.parent.index || 0) + 1);
    }
}
