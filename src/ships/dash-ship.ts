import GameObject from '../models/game-object.js';
import MuzzleFlash from '../components/muzzle-flash.js';
import { dashShipOrientations } from '../sprites/dash-ship.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import { dashScout } from '../balance/enemies.js';
import { Position } from '../types/rendering';

export type DashPhase = 'idle' | 'dash' | 'telegraph' | 'pause';

/**
 * Scout that dashes to random waypoints, spins to telegraph, then pauses to fire.
 * Movement phase is owned by DashAndPause; firing scripts read `phase`.
 */
export default class DashShip extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = dashScout.bulletSpeed;
    team = 1;
    index = 5;

    difficultyMultiplier!: number;
    explosion!: () => unknown;
    sprite!: any;
    gun!: Position;
    guns!: Position[];
    position!: Position;
    velocity!: { x: number; y: number };
    phase: DashPhase = 'idle';
    orientationIndex = 0;

    constructor(parent: GameObject | null | undefined, difficultyMultiplier: number) {
        super(parent);
        this.difficultyMultiplier = difficultyMultiplier;
        this.reset();
    }

    reset(): void {
        super.reset();

        this.orientationIndex = 0;
        const orientation = dashShipOrientations[0];
        this.sprite = orientation.sprite;
        this.guns = orientation.guns;
        this.gun = this.guns[0];
        this.explosion = shipExplosion;
        this.phase = 'idle';

        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };

        this.damage = dashScout.contactDamage(this.difficultyMultiplier);
        this.maxLife = dashScout.life(this.difficultyMultiplier);
        this.life = this.maxLife;
    }

    fire(gunIndex = 0): void {
        const gun = this.guns[gunIndex] || this.gun;
        const position = {
            x: this.position.x + gun.x,
            y: this.position.y + gun.y
        };
        const velocity = { x: 0, y: this.BULLET_SPEED };

        this.triggerEvent('spawnBullet', {
            team: this.team,
            position,
            velocity,
            damage: dashScout.bulletDamage(this.difficultyMultiplier)
        });
        this.addChild(new MuzzleFlash(this, gun));
    }

    /** One 90° CCW turn, recentered so the telegraph spin stays visually locked. */
    spinQuarterLeft(): void {
        this.applyOrientation((this.orientationIndex + 3) % 4);
    }

    /** One 90° CW turn, recentered so the telegraph spin stays visually locked. */
    spinQuarterRight(): void {
        this.applyOrientation((this.orientationIndex + 1) % 4);
    }

    private applyOrientation(index: number): void {
        const sw = this.sprite.width;
        const sh = this.sprite.height;
        const cx = this.position.x + sw / 2;
        const cy = this.position.y + sh / 2;

        this.orientationIndex = index;
        const orientation = dashShipOrientations[index];
        this.sprite = orientation.sprite;
        this.guns = orientation.guns;
        this.gun = this.guns[0];

        this.position.x = cx - this.sprite.width / 2;
        this.position.y = cy - this.sprite.height / 2;
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
