import GameObject from '../models/game-object.js';
import shipSprite from '../sprites/arrow-boss.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import MuzzleFlash from '../components/muzzle-flash.js';

export default class ArrowBoss extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = 120;
    team = 1;
    index = 5;

    constructor(parent, difficultyMultiplier) {
        super(parent);
        this.difficultyMultiplier = difficultyMultiplier;
    }

    reset() {
        super.reset();

        this.sprite = shipSprite().rotateRight();
        this.explosion = shipExplosion;
        this.guns = this.sprite.meta.guns;

        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };

        this.damage = 50 * this.difficultyMultiplier;
        this.life = 20 * this.difficultyMultiplier;
        this.maxLife = 20 * this.difficultyMultiplier;
    }

    fire(gunIndex) {
        const gun = this.guns[ gunIndex ];

        const position = {
            x: this.position.x + gun.x,
            y: this.position.y + gun.y
        };
        const velocity = { x: 0, y: this.BULLET_SPEED };

        this.triggerEvent('spawnBullet', {
            team: this.team,
            position: position,
            velocity: velocity,
            damage: this.difficultyMultiplier
        });
        this.addChild(new MuzzleFlash(this, gun));
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
