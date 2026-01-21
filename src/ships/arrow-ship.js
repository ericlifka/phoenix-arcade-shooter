import GameObject from '../models/game-object.js';
import MuzzleFlash from '../components/muzzle-flash.js';
import shipSprite from '../sprites/arrow-ship.js';
import daggerSprite from '../sprites/dagger-ship.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';

export default class ArrowShip extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = 100;
    team = 1;
    index = 5;

    constructor(parent, difficultyMultiplier, alternateShip) {
        super(parent);
        this.difficultyMultiplier = difficultyMultiplier;
        this.alternateShip = alternateShip;
        this.reset();
    }

    reset() {
        super.reset();

        if (this.alternateShip) {
            this.sprite = daggerSprite().rotateLeft();
        } else {
            this.sprite = shipSprite().rotateRight();
        }

        this.explosion = shipExplosion;
        this.gun = this.sprite.meta.guns[ 0 ];

        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };

        this.damage = 5 * this.difficultyMultiplier;
        this.maxLife = this.difficultyMultiplier;
        this.life = this.difficultyMultiplier;
    }

    fire() {
        const position = {
            x: this.position.x + this.gun.x,
            y: this.position.y + this.gun.y
        };
        const velocity = { x: 0, y: this.BULLET_SPEED };

        this.triggerEvent('spawnBullet', {
            team: this.team,
            position: position,
            velocity: velocity,
            damage: this.difficultyMultiplier
        });
        this.addChild(new MuzzleFlash(this, this.gun));
    }

    applyDamage(damage, sourceEntity) {
        this.triggerEvent('enemyHit');
        super.applyDamage(damage, sourceEntity);
    }

    destroy() {
        this.triggerEvent('enemyDestroyed', {
            shipValue: this.maxLife
        });

        super.destroy();
    }
}
