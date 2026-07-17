import ArrowShip from '../sprites/arrow-ship.js';
import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import type { GameForShop } from '../types/levels.js';
import {
    nextUpgradeCost,
    shopTabs,
    upgradesForTab,
    type ShopTabId,
    type ShopUpgradeDef,
    type ShopUpgradeId
} from '../balance/shop.js';

const LIST_BASE_Y = 49;
const LIST_ROW_STRIDE = 15;
const LIST_LABEL_X = 90;
const LIST_COST_X = 60;
const LEAVE_LABEL_X = 60;

interface ShopRow {
    kind: 'upgrade' | 'leave';
    upgrade?: ShopUpgradeDef;
    description?: TextDisplay;
    costText?: TextDisplay;
    /** Next purchase cost, or null when maxed / N/A. */
    cost: number | null;
}

export default class Shop extends GameObject {
    isShop = true;
    index = 1;
    disabledColor = '#777';

    game: GameForShop;
    bank: GameForShop['bank'];
    player: GameForShop['player'];
    input: EventedInput;

    titleText!: TextDisplay;
    tabDisplays: TextDisplay[] = [];
    activeTabIndex = 0;
    rows: ShopRow[] = [];
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
            onLeft: this.onLeft.bind(this),
            onRight: this.onRight.bind(this),
            onSelect: this.onSelect.bind(this)
        });

        this.reset();
    }

    get activeTab(): ShopTabId {
        return shopTabs[this.activeTabIndex].id;
    }

    reset(): void {
        super.reset();

        this.input.reset();
        this.isDoneShopping = false;
        this.selectedMenuItem = 0;
        this.activeTabIndex = 0;
        this.rows = [];
        this.tabDisplays = [];

        this.createSelectorShip();
        this.createChrome();
        this.rebuildRows();


        this.addChild(this.input as unknown as GameObject);
    }

    start(): void {
        this.input.reset();
        this.isDoneShopping = false;
        this.refreshRows();
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

    private createChrome(): void {
        this.titleText = new TextDisplay(this, {
            font: 'arcade',
            message: shopTabs[this.activeTabIndex].label,
            position: { x: 50, y: 8 },
            color: this.game.interfaceColor
        });
        this.addChild(this.titleText);

        this.tabDisplays = shopTabs.map((tab, index) => {
            const display = new TextDisplay(this, {
                font: 'arcade-small',
                message: tab.label,
                position: { x: 30 + index * 90, y: 28 },
                color: this.game.interfaceColor
            });
            this.addChild(display);
            return display;
        });
        this.refreshTabHeaders();
    }

    private refreshTabHeaders(): void {
        this.titleText.changeMessage(shopTabs[this.activeTabIndex].label);
        this.tabDisplays.forEach((display, index) => {
            display.updateColor(
                index === this.activeTabIndex
                    ? this.game.interfaceColor
                    : this.disabledColor
            );
        });
    }

    private clearRows(): void {
        this.rows.forEach((row) => {
            if (row.description) {
                this.removeChild(row.description);
            }
            if (row.costText) {
                this.removeChild(row.costText);
            }
        });
        this.rows = [];
    }

    private rebuildRows(): void {
        this.clearRows();

        const upgrades = upgradesForTab(this.activeTab);
        this.rows = [
            ...upgrades.map((upgrade) => ({
                kind: 'upgrade' as const,
                upgrade,
                cost: null as number | null
            })),
            { kind: 'leave', cost: null }
        ];

        this.rows.forEach((row, index) => {
            const y = LIST_BASE_Y + index * LIST_ROW_STRIDE;
            const labelX = row.kind === 'leave' ? LEAVE_LABEL_X : LIST_LABEL_X;

            row.description = new TextDisplay(this, {
                font: 'arcade-small',
                message: ' ',
                position: { x: labelX, y },
                color: this.game.interfaceColor,
                isPhysicalEntity: true
            });
            this.addChild(row.description);

            if (row.kind === 'upgrade') {
                row.costText = new TextDisplay(this, {
                    font: 'arcade-small',
                    message: '',
                    position: { x: LIST_COST_X, y },
                    color: this.game.interfaceColor,
                    isPhysicalEntity: true
                });
                this.addChild(row.costText);
            }
        });

        if (this.selectedMenuItem >= this.rows.length) {
            this.selectedMenuItem = Math.max(0, this.rows.length - 1);
        }

        this.refreshRows();
        this.updateSelectorPosition();
    }

    private ownedRank(upgrade: ShopUpgradeDef): number {
        const player = this.player;
        switch (upgrade.id) {
            case 'health': return player.lifeUpgrades;
            case 'rate': return player.rateUpgrades;
            case 'damage': return player.damageUpgrades;
            case 'armor': return player.armorUpgrades;
            case 'guns': return player.gunTier;
            case 'combo': return player.comboUpgrades;
        }
    }

    private rowLabel(upgrade: ShopUpgradeDef, owned: number, maxed: boolean): string {
        if (upgrade.id === 'guns') {
            return maxed ? 'Guns maxed' : (upgrade.labelsByRank?.[owned] ?? upgrade.label);
        }
        if (upgrade.id === 'combo') {
            if (maxed) return 'Combo maxed';
            if (owned === 0) return 'Unlock Combo';
            return upgrade.label;
        }
        return upgrade.label;
    }

    private refreshRows(): void {
        this.rows.forEach((row) => {
            if (row.kind === 'leave') {
                row.description!.changeMessage('Leave Shop');
                row.description!.updateColor(this.game.interfaceColor);
                return;
            }

            const upgrade = row.upgrade!;
            const owned = this.ownedRank(upgrade);
            const cost = nextUpgradeCost(upgrade, owned);
            row.cost = cost;
            const maxed = cost === null;

            row.description!.changeMessage(this.rowLabel(upgrade, owned, maxed));
            row.description!.updateColor(this.game.interfaceColor);

            if (row.costText) {
                row.costText.changeMessage(maxed ? '--' : '$' + cost);
                row.costText.updateColor(
                    maxed || cost! > this.bank.value
                        ? this.disabledColor
                        : this.game.interfaceColor
                );
            }
        });
    }

    private createSelectorShip(): void {
        this.selectorShip = new GameObject();
        this.selectorShip.sprite = ArrowShip();
        this.selectorShip.position = { x: 40, y: 0 };
        this.addChild(this.selectorShip);

        this.updateSelectorPosition();
    }

    private updateSelectorPosition(): void {
        this.selectorShip.position!.y = LIST_BASE_Y + this.selectedMenuItem * LIST_ROW_STRIDE;
    }

    private setActiveTab(index: number): void {
        if (index < 0 || index >= shopTabs.length || index === this.activeTabIndex) {
            return;
        }
        this.activeTabIndex = index;
        this.selectedMenuItem = 0;
        this.refreshTabHeaders();
        this.rebuildRows();
    }

    onUp(): void {
        if (!this.selecting && this.selectedMenuItem > 0) {
            this.selectedMenuItem--;
            this.updateSelectorPosition();
        }
    }

    onDown(): void {
        if (!this.selecting && this.selectedMenuItem < this.rows.length - 1) {
            this.selectedMenuItem++;
            this.updateSelectorPosition();
        }
    }

    onLeft(): void {
        if (!this.selecting) {
            this.setActiveTab(this.activeTabIndex - 1);
        }
    }

    onRight(): void {
        if (!this.selecting) {
            this.setActiveTab(this.activeTabIndex + 1);
        }
    }

    onSelect(): void {
        if (this.selecting) {
            return;
        }

        const row = this.rows[this.selectedMenuItem];
        if (!row) {
            return;
        }

        if (row.kind === 'leave') {
            this.startPurchaseAnimation();
            return;
        }

        const cost = row.cost;
        if (cost !== null && this.bank.value >= cost) {
            this.bank.removeMoney(cost);
            this.game.recordDollarsSpent(cost);
            this.startPurchaseAnimation();
        }
    }

    private startPurchaseAnimation(): void {
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

    private applyUpgrade(id: ShopUpgradeId): void {
        switch (id) {
            case 'health':
                this.player.lifeUpgrades++;
                this.player.maxLife = (this.player.maxLife || 0) + 1;
                this.player.life = (this.player.life || 0) + 1;
                break;
            case 'rate':
                this.player.rateUpgrades++;
                this.player.FIRE_RATE = Math.ceil(this.player.FIRE_RATE * 0.9);
                break;
            case 'damage':
                this.player.damageUpgrades++;
                break;
            case 'armor':
                this.player.armorUpgrades++;
                this.player.armor++;
                break;
            case 'guns':
                this.player.upgradeGunTier();
                break;
            case 'combo':
                this.player.extendCombo();
                this.game.comboGauge.syncFromPlayer();
                break;
        }
    }

    propagateSelection(): void {
        const row = this.rows[this.selectedMenuItem];
        if (!row) {
            this.selecting = false;
            return;
        }

        if (row.kind === 'leave') {
            this.isDoneShopping = true;
        } else if (row.upgrade) {
            this.applyUpgrade(row.upgrade.id);
        }

        this.refreshRows();
        this.selecting = false;
    }
}
