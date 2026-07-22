import GameObject from '../models/game-object.js';
import { bombs } from '../balance/bombs.js';
import bombSprite from '../sprites/bomb.js';
import bombExplosion from '../sprites/animations/bomb-explosion.js';
import { BombOptions } from '../types/game';

/**
 * Player bomb projectile — accelerates upward; detonates on enemy contact or command.
 */
export default class Bomb extends GameObject {
    type = 'bomb';
    isPhysicalEntity = true;
    index = 5;
    team: number;
    exploding = false;

    constructor(parent: GameObject, options?: BombOptions) {
        super(parent);

        const opts = options || {};
        this.team = opts.team ?? 0;
        this.position = opts.position
            ? { x: opts.position.x, y: opts.position.y }
            : { x: 0, y: 0 };
        this.velocity = opts.velocity
            ? { x: opts.velocity.x, y: opts.velocity.y }
            : { x: 0, y: -bombs.initialSpeed };
        this.acceleration = opts.acceleration
            ? { x: opts.acceleration.x, y: opts.acceleration.y }
            : { x: 0, y: -bombs.acceleration };
        this.damage = 0;
        this.sprite = bombSprite();
        this.explosion = bombExplosion;
    }

    get blastCenter(): { x: number; y: number } {
        return {
            x: (this.position?.x || 0) + (this.sprite?.width || 0) / 2,
            y: (this.position?.y || 0) + (this.sprite?.height || 0) / 2
        };
    }

    checkBoundaries(): void {
        if (!this.position || this.exploding) {
            return;
        }

        // Quiet cull once the full blast circle would be above the screen.
        if (this.position.y + bombs.blastRadius < 0) {
            this.triggerEvent('bombCleared', this);
            this.destroy();
        }
    }

    detonate(): void {
        if (this.exploding || this.destroyed) {
            return;
        }

        this.exploding = true;
        this.isPhysicalEntity = false;

        const center = this.blastCenter;
        this.triggerEvent('applyBombBlast', {
            center,
            radius: bombs.blastRadius,
            damage: bombs.damage,
            source: this
        });

        if (this.position && this.sprite) {
            // Center the wide explosion on the bomb.
            this.position.x = center.x - 20;
            this.position.y = center.y - 20;
        }

        this.sprite = bombExplosion();
        if (this.velocity) {
            this.velocity.x = 0;
            this.velocity.y = 0;
        }
        if (this.acceleration) {
            this.acceleration.x = 0;
            this.acceleration.y = 0;
        }

        this.triggerEvent('bombCleared', this);
    }

    applyDamage(): void {
        // Bombs ignore ordinary damage; contact/manual detonation only.
    }
}
