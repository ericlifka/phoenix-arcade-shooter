import GameObject from '../models/game-object.js';
import MuzzleFlash from '../components/muzzle-flash.js';
import playerShipSprite from '../sprites/player-ship.js';
import playerShipDoubleGuns from '../sprites/player-ship-double-guns.js';
import playerShipSpriteWingGuns from '../sprites/player-ship-wing-guns.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import type { PlayerShipId } from '../balance/player-ships.js';
import {
    createStarterHangar,
    defaultActiveShipId,
    MAX_COMBO_UPGRADES,
    type PlayerShipHangar,
    type PlayerShipProfile
} from './player-ship-profile.js';
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

    /** All unlockable ships and their permanent upgrades. */
    shipHangar!: PlayerShipHangar;
    /** Ship used for the current run (picker comes later; defaults to starter). */
    activeShipId!: PlayerShipId;

    /** Run-only upgrade ranks (cleared on resetForNewRun). */
    damageUpgrades = 0;
    lifeUpgrades = 0;
    rateUpgrades = 0;
    armorUpgrades = 0;

    armor = 0;
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

    get shipProfile(): PlayerShipProfile {
        return this.shipHangar[this.activeShipId];
    }

    get comboSegments(): number {
        return this.shipProfile.comboSegments;
    }

    set comboSegments(value: number) {
        this.shipProfile.comboSegments = value;
    }

    get comboUpgrades(): number {
        return this.shipProfile.comboUpgrades;
    }

    set comboUpgrades(value: number) {
        this.shipProfile.comboUpgrades = value;
    }

    isShipUnlocked(shipId: PlayerShipId): boolean {
        return this.shipHangar[shipId].unlocked;
    }

    unlockShip(shipId: PlayerShipId): void {
        this.shipHangar[shipId].unlocked = true;
    }

    profileFor(shipId: PlayerShipId): PlayerShipProfile {
        return this.shipHangar[shipId];
    }

    reset(): void {
        super.reset();

        this.shipHangar = createStarterHangar();
        this.activeShipId = defaultActiveShipId();
        this.damageUpgrades = 0;
        this.lifeUpgrades = 0;
        this.rateUpgrades = 0;
        this.armorUpgrades = 0;

        this.resetForNewRun();
    }

    resetForNewRun(): void {
        super.reset();

        this.damageUpgrades = 0;
        this.lifeUpgrades = 0;
        this.rateUpgrades = 0;
        this.armorUpgrades = 0;
        this.activeShipId = defaultActiveShipId();

        this.explosion = shipExplosion;
        this.position = { x: -100, y: -100 };
        this.velocity = { x: 0, y: 0 };
        this.SPEED = 50;
        this.BULLET_SPEED = 100;
        this.preventInputControl = true;
        this.exploding = false;
        this.team = 0;
        this.damage = 5;
        this.timeSinceFired = 0;

        this.applyPersistentUpgrades();
    }

    applyPersistentUpgrades(): void {
        this.maxLife = 20 + this.lifeUpgrades;
        this.life = this.maxLife;
        this.armor = this.armorUpgrades;
        this.FIRE_RATE = Math.ceil(500 * Math.pow(0.9, this.rateUpgrades));
        this.applyActiveShipSprite();
    }

    refillHealth(): void {
        this.life = this.maxLife;
    }

    extendCombo(shipId: PlayerShipId = this.activeShipId): void {
        const profile = this.shipHangar[shipId];
        if (profile.comboSegments >= MAX_COMBO_UPGRADES) {
            return;
        }

        profile.comboSegments++;
        profile.comboUpgrades++;
    }

    applyActiveShipSprite(): void {
        switch (this.activeShipId) {
            case 'starter':
                this.sprite = playerShipSprite().rotateRight();
                break;
            case 'double':
                this.sprite = playerShipDoubleGuns().rotateRight();
                break;
            case 'triple':
            case 'radial':
                this.sprite = playerShipSpriteWingGuns().rotateRight();
                break;
        }
    }

    /** Factory helpers for shop tab icons (same facing as in combat). */
    static spriteForShipId(shipId: PlayerShipId): any {
        switch (shipId) {
            case 'starter':
                return playerShipSprite().rotateRight();
            case 'double':
                return playerShipDoubleGuns().rotateRight();
            case 'triple':
            case 'radial':
                return playerShipSpriteWingGuns().rotateRight();
        }
    }

    private bulletSpreadX(gunIndex: number, gunCount: number): number {
        if (this.activeShipId === 'radial' && gunCount === 3) {
            return (gunIndex - 1) * 10;
        }

        return 0;
    }

    processInput(input: InputState): void {
        super.processInput(input);
        if (this.preventInputControl || this.exploding || this.destroyed) {
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
        const guns = this.sprite.meta.guns;

        guns.forEach(
            function (this: PlayerControlledShip, gun: Position, index: number) {
                this.triggerEvent('spawnBullet', {
                    team: this.team,
                    damage: this.damageUpgrades + 1,
                    velocity: {
                        x: this.bulletSpreadX(index, guns.length),
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
