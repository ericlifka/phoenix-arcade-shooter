import GameObject from '../models/game-object.js';
import bulletSprite from '../sprites/bullet.js';
import smallExplosion from '../sprites/animations/small-explosion.js';
import { BulletOptions } from '../types/game';
import { Position } from '../types/rendering';

/**
 * Bullet projectile entity for player and enemy shots
 */
export default class Bullet extends GameObject {
    type = "bullet";
    isPhysicalEntity = true;
    index = 5;
    team: number;
    value?: number;

    constructor(parent: GameObject, options?: BulletOptions) {
        super(parent);

        const opts = options || {};
        this.team = opts.team || 0;
        this.position = opts.position || { x: 0, y: 0 };
        this.velocity = opts.velocity || { x: 0, y: 0 };
        this.acceleration = opts.acceleration || { x: 0, y: 0 };
        this.damage = opts.damage || 1;
        this.life = opts.life || 0;
        this.maxLife = opts.maxLife || 1;

        this.sprite = bulletSprite();
        this.explosion = smallExplosion;

        this.updateBulletDirection();
        this.updateColor();

        this.reset();
    }

    checkBoundaries(): void {
        if (this.position && this.parent) {
            const parentWidth = (this.parent as any).width;
            const parentHeight = (this.parent as any).height;

            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x > parentWidth
                || this.position.y > parentHeight) {

                this.destroy();
            }
        }
    }

    private updateBulletDirection(): void {
        if (this.velocity && this.sprite) {
            if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y)) {
                this.sprite.rotateRight();
            }
        }
    }

    private updateColor(): void {
        if (this.sprite) {
            switch (this.team) {
                case 0: this.sprite.applyColor("#B1D8AD"); break;
                case 1: this.sprite.applyColor("#F7BEBE"); break;
                default: break;
            }
        }
    }

    applyDamage(damage: number, sourceEntity?: GameObject): void {
        super.applyDamage(damage, sourceEntity);

        if (this.position && this.sprite) {
            this.position.x -= Math.floor(this.sprite.width / 2);
            this.position.y -= Math.floor(this.sprite.height / 2);
        }
    }
}
