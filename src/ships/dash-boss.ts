import GameObject from '../models/game-object.js';
import MuzzleFlash from '../components/muzzle-flash.js';
import shipSprite from '../sprites/dash-boss.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import { dashBoss } from '../balance/enemies.js';
import { Position } from '../types/rendering';
import type { DashPhase } from './dash-ship.js';

/**
 * Larger dash combatant — same phase model as DashShip, multi-gun loadout.
 */
export default class DashBoss extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = dashBoss.bulletSpeed;
    team = 1;
    index = 5;

    difficultyMultiplier!: number;
    explosion!: () => unknown;
    sprite!: any;
    guns!: Position[];
    position!: Position;
    velocity!: { x: number; y: number };
    phase: DashPhase = 'idle';

    constructor(parent: GameObject | null | undefined, difficultyMultiplier: number) {
        super(parent);
        this.difficultyMultiplier = difficultyMultiplier;
        this.reset();
    }

    reset(): void {
        super.reset();

        this.sprite = shipSprite();
        this.explosion = shipExplosion;
        this.guns = this.sprite.meta.guns as Position[];
        this.phase = 'idle';

        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };

        this.damage = dashBoss.contactDamage(this.difficultyMultiplier);
        this.life = dashBoss.life(this.difficultyMultiplier);
        this.maxLife = this.life;
    }

    fire(gunIndex = 0): void {
        const gun = this.guns[gunIndex];
        if (!gun) return;

        const position = {
            x: this.position.x + gun.x,
            y: this.position.y + gun.y
        };
        const velocity = { x: 0, y: this.BULLET_SPEED };

        this.triggerEvent('spawnBullet', {
            team: this.team,
            position,
            velocity,
            damage: dashBoss.bulletDamage(this.difficultyMultiplier)
        });
        this.addChild(new MuzzleFlash(this, gun));
    }

    /** One 90° CCW turn, recentered so the telegraph spin stays visually locked. */
    spinQuarterLeft(): void {
        const sw = this.sprite.width;
        const sh = this.sprite.height;
        const cx = this.position.x + sw / 2;
        const cy = this.position.y + sh / 2;

        this.guns = this.guns.map((g) => ({ x: g.y, y: sw - 1 - g.x }));
        this.sprite.meta.guns = this.guns;
        this.sprite.rotateLeft();

        this.position.x = cx - this.sprite.width / 2;
        this.position.y = cy - this.sprite.height / 2;
    }

    /** One 90° CW turn, recentered so the telegraph spin stays visually locked. */
    spinQuarterRight(): void {
        const sw = this.sprite.width;
        const sh = this.sprite.height;
        const cx = this.position.x + sw / 2;
        const cy = this.position.y + sh / 2;

        this.guns = this.guns.map((g) => ({ x: sh - 1 - g.y, y: g.x }));
        this.sprite.meta.guns = this.guns;
        this.sprite.rotateRight();

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
