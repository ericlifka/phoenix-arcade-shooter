import GameObject from '../models/game-object.js';
import MuzzleFlash from '../components/muzzle-flash.js';
import playerShipSprite from '../sprites/player-ship.js';
import playerShipSpriteWingGuns from '../sprites/player-ship-wing-guns.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import { InputState } from '../types/game';
import { Position } from '../types/rendering';

type SizedGameParent = GameObject & { width: number; height: number };

export default class PlayerControlledShip extends GameObject {
    type = 'player';
    isPhysicalEntity = true;
    index = 5;

    explosion!: () => unknown;
    sprite!: any;
    position!: Position;
    velocity!: { x: number; y: number };
    damageUpgrades = 0;
    lifeUpgrades = 0;
    rateUpgrades = 0;
    armorUpgrades = 0;
    armor = 0;
    wingGunsUnlocked = false;
    SPEED = 50;
    BULLET_SPEED = 100;
    FIRE_RATE = 500;
    preventInputControl = true;
    exploding = false;
    team = 0;
    damage = 5;
    timeSinceFired = 0;
    firing?: boolean;

    constructor(parent?: GameObject | null) {
        super(parent);
        this.reset();
    }

    reset(): void {
        super.reset();

        this.sprite = playerShipSprite().rotateRight();
        this.explosion = shipExplosion;

        this.position = { x: -100, y: -100 };
        this.velocity = { x: 0, y: 0 };

        this.life = 20;
        this.maxLife = 20;
        this.damageUpgrades = 0;
        this.lifeUpgrades = 0;
        this.rateUpgrades = 0;
        this.armorUpgrades = 0;
        this.armor = 0;
        this.wingGunsUnlocked = false;
        this.SPEED = 50;
        this.BULLET_SPEED = 100;
        this.FIRE_RATE = 500;

        this.preventInputControl = true;
        this.exploding = false;
        this.team = 0;
        this.damage = 5;
        this.timeSinceFired = 0;
    }

    refillHealth(): void {
        this.life = this.maxLife;
    }

    addWingGuns(): void {
        this.wingGunsUnlocked = true;
        this.sprite = playerShipSpriteWingGuns().rotateRight();
    }

    processInput(input: InputState): void {
        super.processInput(input);
        if (this.preventInputControl || this.exploding || this.destroyed) {
            // ship in a state where input isn't appropriate
            return;
        }

        this.velocity.x = input.movementVector.x * this.SPEED;
        this.velocity.y = input.movementVector.y * this.SPEED;

        this.firing = input.fire;
    }

    update(dtime: number): void {
        super.update(dtime);

        this.timeSinceFired += dtime;
        if (this.firing && this.timeSinceFired > this.FIRE_RATE) {
            this.timeSinceFired = 0;

            this.fire();
        }
    }

    hideOffscreen(): void {
        this.preventInputControl = true;
        this.position.x = -100;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    checkBoundaries(): void {
        if (this.preventInputControl) {
            // don't check screen boundaries when an external script is controlling the player
            return;
        }

        if (this.position.x < 0) {
            this.position.x = 0;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
        }
        const parent = this.parent as SizedGameParent | null | undefined;
        if (parent && this.sprite) {
            if (this.position.x + this.sprite.width > parent.width) {
                this.position.x = parent.width - this.sprite.width;
            }
            if (this.position.y + this.sprite.height > parent.height) {
                this.position.y = parent.height - this.sprite.height;
            }
        }
    }

    fire(): void {
        this.sprite.meta.guns.forEach(
            function (this: PlayerControlledShip, gun: Position, index: number) {
                this.triggerEvent('spawnBullet', {
                    team: this.team,
                    damage: this.damageUpgrades + 1,
                    velocity: {
                        x: this.wingGunsUnlocked ? (index - 1) * 10 : 0,
                        y: -this.BULLET_SPEED
                    },
                    position: {
                        x: this.position.x + gun.x,
                        y: this.position.y + gun.y
                    }
                });

                this.addChild(new MuzzleFlash(this, gun));
            }.bind(this)
        );
    }

    applyDamage(damage: number, sourceEntity?: GameObject): void {
        if (damage <= 0) {
            super.applyDamage(damage, sourceEntity);
            return;
        }

        this.triggerEvent('playerHit');

        const effectiveDamage = Math.max(1, damage - this.armor);
        super.applyDamage(effectiveDamage, sourceEntity);
    }
}
