import GameObject from '../models/game-object.js';
import MuzzleFlash from '../components/muzzle-flash.js';
import shipSprite from '../sprites/arrow-ship.js';
import daggerSprite from '../sprites/dagger-ship.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import { Position } from '../types/rendering';

export default class ArrowShip extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = 100;
    team = 1;
    index = 5;

    difficultyMultiplier!: number;
    alternateShip!: boolean;
    explosion!: () => unknown;
    sprite!: any;
    gun!: Position;
    position!: Position;
    velocity!: { x: number; y: number };

    constructor(parent: GameObject | null | undefined, difficultyMultiplier: number, alternateShip: boolean) {
        super(parent);
        this.difficultyMultiplier = difficultyMultiplier;
        this.alternateShip = alternateShip;
        this.reset();
    }

    reset(): void {
        super.reset();

        if (this.alternateShip) {
            this.sprite = daggerSprite().rotateLeft();
        } else {
            this.sprite = shipSprite().rotateRight();
        }

        this.explosion = shipExplosion;
        this.gun = this.sprite.meta.guns[0];

        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };

        this.damage = 4 + this.difficultyMultiplier;
        this.maxLife = this.difficultyMultiplier;
        this.life = this.difficultyMultiplier;
    }

    fire(): void {
        const position = {
            x: this.position.x + this.gun.x,
            y: this.position.y + this.gun.y
        };
        const velocity = { x: 0, y: this.BULLET_SPEED };

        this.triggerEvent('spawnBullet', {
            team: this.team,
            position: position,
            velocity: velocity,
            damage: 4 + this.difficultyMultiplier
        });
        this.addChild(new MuzzleFlash(this, this.gun));
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
