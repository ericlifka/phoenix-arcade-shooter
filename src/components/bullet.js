import GameObject from '../models/game-object.js';
import bulletSprite from '../sprites/bullet.js';
import smallExplosion from '../sprites/animations/small-explosion.js';

export default class Bullet extends GameObject {
    type = "bullet";
    isPhysicalEntity = true;
    index = 5;

    constructor(parent, options) {
        super(parent);

        options = options || {};
        this.team = options.team || 0;
        this.position = options.position || { x: 0, y: 0 };
        this.velocity = options.velocity || { x: 0, y: 0 };
        this.acceleration = options.acceleration || { x: 0, y: 0 };
        this.damage = options.damage || 1;
        this.life = options.life || 0;
        this.maxLife = options.maxLife || 1;

        this.sprite = bulletSprite();
        this.explosion = smallExplosion;

        this.updateBulletDirection();
        this.updateColor();
    }

    checkBoundaries() {
        if (this.position.x < 0
            || this.position.y < 0
            || this.position.x > this.parent.width
            || this.position.y > this.parent.height) {

            this.destroy();
        }
    }

    updateBulletDirection() {
        if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y)) {
            this.sprite.rotateRight();
        }
    }

    updateColor() {
        switch (this.team) {
            case 0: this.sprite.applyColor("#B1D8AD"); break;
            case 1: this.sprite.applyColor("#F7BEBE"); break;
            default: break;
        }
    }

    applyDamage(damage) {
        super.applyDamage(damage);

        this.position.x -= Math.floor(this.sprite.width / 2);
        this.position.y -= Math.floor(this.sprite.height / 2);
    }
}
