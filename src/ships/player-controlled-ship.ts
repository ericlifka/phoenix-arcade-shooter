import GameObject from '../models/game-object.js';
import MuzzleFlash from '../components/muzzle-flash.js';
import playerShipSprite from '../sprites/player-ship.js';
import playerShipDoubleGuns from '../sprites/player-ship-double-guns.js';
import playerShipSpriteWingGuns from '../sprites/player-ship-wing-guns.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import { applySilhouetteOutline } from '../sprites/energy-shield.js';
import { playerShipDef, type PlayerShipId } from '../balance/player-ships.js';
import {
    createStarterHangar,
    defaultActiveShipId,
    type PlayerShipHangar,
    type PlayerShipProfile
} from './player-ship-profile.js';
import { InputState } from '../types/game';
import { Position } from '../types/rendering';

type SizedGameParent = GameObject & { width: number; height: number };

const BASE_MAX_LIFE = 20;
const BASE_SPEED = 50;
const BASE_FIRE_RATE = 500;

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

    /** Run-only counters (cleared on resetForNewRun). */
    lifeUpgrades = 0;
    fullHealPurchases = 0;
    energyShield = 0;
    bombs = 0;

    armor = 0;
    SPEED = BASE_SPEED;
    BULLET_SPEED = 100;
    FIRE_RATE = BASE_FIRE_RATE;
    preventInputControl = true;
    exploding = false;
    team = 0;
    damage = 5;
    timeSinceFired = 0;
    firing?: boolean;
    private shieldOutlineApplied = false;

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

    selectShipForRun(shipId: PlayerShipId): void {
        if (!this.isShipUnlocked(shipId)) {
            return;
        }
        this.activeShipId = shipId;
        this.applyPersistentUpgrades();
    }

    profileFor(shipId: PlayerShipId): PlayerShipProfile {
        return this.shipHangar[shipId];
    }

    reset(): void {
        super.reset();

        this.shipHangar = createStarterHangar();
        this.activeShipId = defaultActiveShipId();
        this.shieldOutlineApplied = false;
        this.clearRunCounters();

        this.resetForNewRun();
    }

    resetForNewRun(): void {
        super.reset();

        this.clearRunCounters();
        this.activeShipId = defaultActiveShipId();
        this.shieldOutlineApplied = false;

        this.explosion = shipExplosion;
        this.position = { x: -100, y: -100 };
        this.velocity = { x: 0, y: 0 };
        this.BULLET_SPEED = 100;
        this.preventInputControl = true;
        this.exploding = false;
        this.team = 0;
        this.damage = 5;
        this.timeSinceFired = 0;

        this.applyPersistentUpgrades();
    }

    private clearRunCounters(): void {
        this.lifeUpgrades = 0;
        this.fullHealPurchases = 0;
        this.energyShield = 0;
        this.bombs = 0;
    }

    applyPersistentUpgrades(): void {
        const profile = this.shipProfile;
        this.maxLife = BASE_MAX_LIFE + profile.maxHealthRanks * 5 + this.lifeUpgrades;
        this.life = this.maxLife;
        this.armor = profile.armorRanks;
        this.SPEED = Math.round(BASE_SPEED * Math.pow(1.1, profile.shipSpeedRanks));
        this.FIRE_RATE = Math.ceil(BASE_FIRE_RATE * Math.pow(0.9, profile.fireSpeedRanks));
        this.refreshShieldVisual();
    }

    /** Recompute stats from profile + run life without forcing a full heal. */
    syncStatsFromUpgrades(opts?: { healBy?: number }): void {
        const profile = this.shipProfile;
        const previousMax = this.maxLife || BASE_MAX_LIFE;
        this.maxLife = BASE_MAX_LIFE + profile.maxHealthRanks * 5 + this.lifeUpgrades;
        this.armor = profile.armorRanks;
        this.SPEED = Math.round(BASE_SPEED * Math.pow(1.1, profile.shipSpeedRanks));
        this.FIRE_RATE = Math.ceil(BASE_FIRE_RATE * Math.pow(0.9, profile.fireSpeedRanks));

        if (opts?.healBy !== undefined) {
            this.life = Math.min(
                this.maxLife,
                (this.life || 0) + opts.healBy
            );
        } else if ((this.life || 0) > this.maxLife) {
            this.life = this.maxLife;
        } else if (this.maxLife > previousMax && this.life === previousMax) {
            this.life = this.maxLife;
        }
    }

    refillHealth(): void {
        this.life = this.maxLife;
    }

    purchaseFullHeal(): void {
        this.fullHealPurchases++;
        this.refillHealth();
    }

    purchaseRunHealth(): void {
        this.lifeUpgrades++;
        this.maxLife = (this.maxLife || BASE_MAX_LIFE) + 1;
        this.life = (this.life || 0) + 1;
    }

    purchaseEnergyShield(): void {
        this.energyShield++;
        this.refreshShieldVisual();
    }

    purchaseBomb(): void {
        this.bombs++;
    }

    purchaseMaxHealth(shipId: PlayerShipId): void {
        const profile = this.shipHangar[shipId];
        const cap = playerShipDef(shipId).maxHealth;
        if (profile.maxHealthRanks >= cap) return;
        profile.maxHealthRanks++;
        if (shipId === this.activeShipId) {
            this.syncStatsFromUpgrades({ healBy: 5 });
        }
    }

    purchaseArmor(shipId: PlayerShipId): void {
        const profile = this.shipHangar[shipId];
        const cap = playerShipDef(shipId).maxArmor;
        if (profile.armorRanks >= cap) return;
        profile.armorRanks++;
        if (shipId === this.activeShipId) {
            this.syncStatsFromUpgrades();
        }
    }

    purchaseBombCapacity(shipId: PlayerShipId): void {
        const profile = this.shipHangar[shipId];
        const cap = playerShipDef(shipId).maxBombCapacity;
        if (profile.bombCapacityRanks >= cap) return;
        profile.bombCapacityRanks++;
    }

    purchaseShipSpeed(shipId: PlayerShipId): void {
        const profile = this.shipHangar[shipId];
        const cap = playerShipDef(shipId).maxShipSpeed;
        if (profile.shipSpeedRanks >= cap) return;
        profile.shipSpeedRanks++;
        if (shipId === this.activeShipId) {
            this.syncStatsFromUpgrades();
        }
    }

    purchaseFireSpeed(shipId: PlayerShipId): void {
        const profile = this.shipHangar[shipId];
        const cap = playerShipDef(shipId).maxFireSpeed;
        if (profile.fireSpeedRanks >= cap) return;
        profile.fireSpeedRanks++;
        if (shipId === this.activeShipId) {
            this.syncStatsFromUpgrades();
        }
    }

    purchaseCombo(shipId: PlayerShipId): void {
        const profile = this.shipHangar[shipId];
        const cap = playerShipDef(shipId).maxCombo;
        if (profile.comboSegments >= cap) return;
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

    /**
     * Rebuild the combat sprite from the active hull, then apply/remove
     * the energy-shield silhouette outline as needed.
     */
    refreshShieldVisual(): void {
        if (this.exploding) {
            return;
        }

        if (this.shieldOutlineApplied && this.position) {
            this.position.x += 1;
            this.position.y += 1;
            this.shieldOutlineApplied = false;
        }

        this.applyActiveShipSprite();

        if (this.energyShield > 0 && this.sprite && this.position) {
            this.sprite = applySilhouetteOutline(this.sprite);
            this.position.x -= 1;
            this.position.y -= 1;
            this.shieldOutlineApplied = true;
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
                    damage: 1,
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

        if (this.energyShield > 0) {
            this.energyShield--;
            this.refreshShieldVisual();
            return;
        }

        this.triggerEvent('playerHit');

        const effectiveDamage = Math.max(1, damage - this.armor);
        super.applyDamage(effectiveDamage, sourceEntity);
    }
}
