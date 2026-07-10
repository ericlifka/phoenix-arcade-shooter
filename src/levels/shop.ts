import ArrowShip from '../sprites/arrow-ship.js';
import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import { Position } from '../types/rendering';
import type { GameForShop } from '../types/levels.js';
import { MAX_GUN_TIER } from '../ships/player-controlled-ship.js';
import { MAX_COMBO_SEGMENTS } from '../components/combo-gauge.js';

const GUN_UPGRADE_NAMES = ['Double Guns', 'Triple Guns', 'Radial Guns'];
const GUN_UPGRADE_BASE_COST = 500;
const COMBO_UPGRADE_COSTS = [
    25, 50, 100, 200, 400, 1000, 2000, 3500, 6000, 10000
];

interface ShopMenuLine {
    message: string;
    position: Position;
    description?: TextDisplay;
    costText?: TextDisplay;
    cost?: number;
}

export default class Shop extends GameObject {
    isShop = true;
    index = 1;
    headerDef = { message: 'Ship Upgrades', position: { x: 50, y: 10 } };
    menuItems: {
        health: ShopMenuLine;
        rate: ShopMenuLine;
        damage: ShopMenuLine;
        guns: ShopMenuLine;
        armor: ShopMenuLine;
        combo: ShopMenuLine;
        leave: ShopMenuLine;
    } = {
            health: { message: '+1 Ship Health', position: { x: 90, y: 50 } },
            rate: { message: '10% faster Firing Rate', position: { x: 90, y: 65 } },
            damage: { message: '+1 Bullet Damage', position: { x: 90, y: 80 } },
            armor: { message: '+1 Armor', position: { x: 90, y: 95 } },
            guns: { message: 'Double Guns', position: { x: 90, y: 110 } },
            combo: { message: 'Extend Combo', position: { x: 90, y: 125 } },
            leave: { message: 'Leave Shop', position: { x: 60, y: 140 } }
        };
    menuSelectorPositions = [49, 64, 79, 94, 109, 124, 139];
    disabledColor = '#777';

    game: GameForShop;
    bank: GameForShop['bank'];
    player: GameForShop['player'];
    input: EventedInput;
    titleText!: TextDisplay;
    selectorShip!: GameObject;
    selectedMenuItem!: number;
    timeSinceSelected!: number;
    selecting?: boolean;
    isDoneShopping!: boolean;

    constructor(parent: GameObject | null | undefined, game: GameForShop) {
        super(parent);

        this.game = game;
        this.bank = game.bank;
        this.player = game.player;

        this.input = new EventedInput({
            onUp: this.onUp.bind(this),
            onDown: this.onDown.bind(this),
            onSelect: this.onSelect.bind(this)
        });

        this.reset();
    }

    reset(): void {
        super.reset();

        this.input.reset();
        this.isDoneShopping = false;
        this.selectedMenuItem = 0;
        this.createMenuText();
        this.setCosts();
        this.createSelectorShip();

        this.addChild(this.input as unknown as GameObject);
    }

    start(): void {
        this.input.reset();
        this.isDoneShopping = false;
        this.setCosts();
    }

    checkIfLevelComplete(): boolean {
        return this.isDoneShopping;
    }

    update(dtime: number): void {
        super.update(dtime);

        this.timeSinceSelected += dtime;
        if (this.selecting && this.timeSinceSelected > 595) {
            this.propagateSelection();
        }
    }

    createMenuText(): void {
        this.titleText = new TextDisplay(this, {
            font: 'arcade',
            message: this.headerDef.message,
            position: this.headerDef.position,
            color: this.game.interfaceColor
        });
        this.addChild(this.titleText);

        Object.keys(this.menuItems).forEach(function (this: Shop, key: string) {
            const item = this.menuItems[key as keyof Shop['menuItems']];

            item.description = new TextDisplay(this, {
                font: 'arcade-small',
                message: item.message,
                position: item.position,
                color: this.game.interfaceColor,
                isPhysicalEntity: true
            });
            this.addChild(item.description);

            item.costText = new TextDisplay(this, {
                font: 'arcade-small',
                message: '',
                position: { x: item.position.x - 30, y: item.position.y },
                color: this.game.interfaceColor,
                isPhysicalEntity: true
            });
            this.addChild(item.costText);
        }.bind(this));
    }

    setCosts(): void {
        const items = this.menuItems;
        const player = this.player;
        const bank = this.bank;

        items.health.cost = 5 + player.lifeUpgrades * 5;
        items.rate.cost = 50 + player.rateUpgrades * 50;
        items.damage.cost = 100 + player.damageUpgrades * 100;
        items.guns.cost = player.gunTier >= MAX_GUN_TIER
            ? -1
            : (player.gunTier + 1) * GUN_UPGRADE_BASE_COST;
        items.armor.cost = 75 + player.armorUpgrades * 75;
        items.combo.cost = player.comboSegments >= MAX_COMBO_SEGMENTS
            ? -1
            : COMBO_UPGRADE_COSTS[player.comboUpgrades];

        items.damage.costText!.changeMessage('$' + items.damage.cost);
        items.health.costText!.changeMessage('$' + items.health.cost);
        items.rate.costText!.changeMessage('$' + items.rate.cost);
        items.guns.costText!.changeMessage(
            player.gunTier >= MAX_GUN_TIER ? '--' : '$' + items.guns.cost
        );
        items.guns.description!.changeMessage(
            player.gunTier >= MAX_GUN_TIER
                ? 'Guns maxed'
                : GUN_UPGRADE_NAMES[player.gunTier]
        );
        items.armor.costText!.changeMessage('$' + items.armor.cost);
        items.combo.costText!.changeMessage(
            player.comboSegments >= MAX_COMBO_SEGMENTS ? '--' : '$' + items.combo.cost
        );
        items.combo.description!.changeMessage(
            player.comboSegments >= MAX_COMBO_SEGMENTS
                ? 'Combo maxed'
                : player.comboSegments === 0
                    ? 'Unlock Combo'
                    : items.combo.message
        );
        items.leave.description!.changeMessage(items.leave.message);

        items.health.costText!.updateColor(items.health.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
        items.rate.costText!.updateColor(items.rate.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
        items.damage.costText!.updateColor(items.damage.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
        items.guns.costText!.updateColor(
            items.guns.cost > bank.value || player.gunTier >= MAX_GUN_TIER
                ? this.disabledColor
                : this.game.interfaceColor
        );
        items.armor.costText!.updateColor(items.armor.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
        items.combo.costText!.updateColor(
            items.combo.cost > bank.value || player.comboSegments >= MAX_COMBO_SEGMENTS
                ? this.disabledColor
                : this.game.interfaceColor
        );
    }

    createSelectorShip(): void {
        this.selectorShip = new GameObject();
        this.selectorShip.sprite = ArrowShip();
        this.selectorShip.position = { x: 40, y: 0 };
        this.addChild(this.selectorShip);

        this.updateSelectorPosition();
    }

    updateSelectorPosition(): void {
        this.selectorShip.position!.y = this.menuSelectorPositions[this.selectedMenuItem];
    }

    onUp(): void {
        if (!this.selecting && this.selectedMenuItem > 0) {
            this.selectedMenuItem--;
            this.updateSelectorPosition();
        }
    }

    onDown(): void {
        if (!this.selecting && this.selectedMenuItem < this.menuSelectorPositions.length - 1) {
            this.selectedMenuItem++;
            this.updateSelectorPosition();
        }
    }

    onSelect(): void {
        if (!this.selecting) {
            let selection: ShopMenuLine | undefined;
            switch (this.selectedMenuItem) {
                case 0: selection = this.menuItems.health; break;
                case 1: selection = this.menuItems.rate; break;
                case 2: selection = this.menuItems.damage; break;
                case 3: selection = this.menuItems.armor; break;
                case 4: selection = this.menuItems.guns; break;
                case 5: selection = this.menuItems.combo; break;
                case 6: this.startGame(); return;
                default: return;
            }

            if (this.bank.value >= selection.cost! && selection.cost !== -1) {
                this.bank.removeMoney(selection.cost!);
                this.startGame();
            }
        }
    }

    startGame(): void {
        this.selecting = true;
        this.timeSinceSelected = 0;

        const x1 = this.selectorShip.position!.x + this.selectorShip.sprite.width;
        const y = this.selectorShip.position!.y + Math.floor(this.selectorShip.sprite.height / 2);

        this.addChild(new Bullet(this, {
            team: 2,
            position: { x: x1, y: y },
            velocity: { x: 50, y: 0 }
        }));
    }

    propagateSelection(): void {
        switch (this.selectedMenuItem) {
            case 0:
                this.player.lifeUpgrades++;
                this.player.maxLife++;
                this.player.life++;
                break;

            case 1: // rate
                this.player.rateUpgrades++;
                this.player.FIRE_RATE = Math.ceil(this.player.FIRE_RATE * 0.9);
                break;

            case 2: // damage
                this.player.damageUpgrades++;
                break;

            case 3: // armor
                this.player.armorUpgrades++;
                this.player.armor++;
                break;

            case 4: // guns
                this.player.upgradeGunTier();
                break;

            case 5: // combo
                this.player.extendCombo();
                this.game.comboGauge.syncFromPlayer();
                break;

            case 6: // done shopping
                this.isDoneShopping = true;
                break;
        }

        this.setCosts();
        this.selecting = false;
    }
}
