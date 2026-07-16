import GameObject from '../models/game-object.js';
import shipSprite from '../sprites/arrow-boss.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import MuzzleFlash from '../components/muzzle-flash.js';
import { arrowBoss } from '../balance/enemies.js';
import { Position } from '../types/rendering';

/** Standard arrow-ship footprint after rotateRight(); aligns boss path with enemy orbits. */
const ENEMY_ORBIT_SPRITE_WIDTH = 8;
const ENEMY_ORBIT_SPRITE_HEIGHT = 7;

export default class ArrowBoss extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = arrowBoss.bulletSpeed;
    team = 1;
    index = 5;

    difficultyMultiplier!: number;
    explosion!: () => unknown;
    sprite!: any;
    guns!: Position[];
    position!: Position;
    velocity!: { x: number; y: number };
    /**
     * Optional. When set (Group 03 orbits), MoveObjectToPoint / MoveObjectInCircle
     * shift path targets so the larger boss footprint tracks smaller enemy routes.
     * Leave unset for literal MoveObjectToPoint targets (e.g. Group 01 patrol).
     */
    orbitPathOffset?: Position;

    constructor(parent: GameObject | null | undefined, difficultyMultiplier: number) {
        super(parent);
        this.difficultyMultiplier = difficultyMultiplier;
        this.reset();
    }

    reset(): void {
        super.reset();

        this.sprite = shipSprite().rotateRight();
        this.explosion = shipExplosion;
        this.guns = this.sprite.meta.guns;
        this.orbitPathOffset = undefined;

        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };

        this.damage = arrowBoss.contactDamage(this.difficultyMultiplier);
        this.life = arrowBoss.life(this.difficultyMultiplier);
        this.maxLife = this.life;
    }

    /** Align this boss with standard enemy orbit footprint (Group 03). */
    enableOrbitPathAlignment(): void {
        this.orbitPathOffset = {
            x: Math.floor((ENEMY_ORBIT_SPRITE_WIDTH - this.sprite.width) / 2),
            y: Math.floor((ENEMY_ORBIT_SPRITE_HEIGHT - this.sprite.height) / 2)
        };
    }

    fire(gunIndex: number): void {
        const gun = this.guns[gunIndex];

        const position = {
            x: this.position.x + gun.x,
            y: this.position.y + gun.y
        };
        const velocity = { x: 0, y: this.BULLET_SPEED };

        this.triggerEvent('spawnBullet', {
            team: this.team,
            position: position,
            velocity: velocity,
            damage: arrowBoss.bulletDamage(this.difficultyMultiplier)
        });
        this.addChild(new MuzzleFlash(this, gun));
    }

    applyDamage(damage: number, sourceEntity?: GameObject): void {
        this.triggerEvent('enemyHit');
        super.applyDamage(damage, sourceEntity);
    }

    destroy(): void {
        this.triggerEvent('enemyDestroyed', {
            shipValue: this.maxLife
        });

        super.destroy();
    }
}
