import ArrowShip from '../sprites/arrow-ship.js';
import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import UpgradeProgressOrbs from '../components/upgrade-progress-orbs.js';
import PlayerControlledShip from '../ships/player-controlled-ship.js';
import type { GameForShop } from '../types/levels.js';
import type { PlayerShipId } from '../balance/player-ships.js';
import {
    nextUpgradeCost,
    shopTabs,
    upgradesForTab,
    type ShopTabDef,
    type ShopTabId,
    type ShopUpgradeDef,
    type ShopUpgradeId
} from '../balance/shop.js';

const LIST_BASE_Y = 45;
const LIST_ROW_STRIDE = 15;
const LIST_LABEL_X = 70;
const LIST_COST_X = 40;
const LEAVE_LABEL_X = 40;
const PROGRESS_RIGHT_X = 182;
const TAB_Y = 22;
const SHIP_TAB_START_X = 100;
const SHIP_TAB_STRIDE = 22;

interface ShopRow {
    kind: 'upgrade' | 'leave';
    upgrade?: ShopUpgradeDef;
    description?: TextDisplay;
    costText?: TextDisplay;
    progressOrbs?: UpgradeProgressOrbs;
    cost: number | null;
}

interface TabChrome {
    def: ShopTabDef;
    label?: TextDisplay;
    shipIcon?: GameObject;
    leftBracket?: TextDisplay;
    rightBracket?: TextDisplay;
}

export default class Shop extends GameObject {
    isShop = true;
    index = 1;
    disabledColor = '#777';

    game: GameForShop;
    bank: GameForShop['bank'];
    player: GameForShop['player'];
    input: EventedInput;

    tabChrome: TabChrome[] = [];
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
        this.tabChrome = [];

        this.createSelectorShip();
        this.createTabChrome();
        this.rebuildRows();

        this.addChild(this.input as unknown as GameObject);
    }

    start(): void {
        this.input.reset();
        this.isDoneShopping = false;
        this.refreshTabChrome();
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

    private createTabChrome(): void {
        let shipTabIndex = 0;

        this.tabChrome = shopTabs.map((def) => {
            if (def.kind === 'text') {
                const label = new TextDisplay(this, {
                    font: 'arcade-small',
                    message: def.label || '',
                    position: { x: 8, y: TAB_Y },
                    color: this.game.interfaceColor
                });
                this.addChild(label);
                return { def, label };
            }

            const shipId = def.shipId!;
            const sprite = PlayerControlledShip.spriteForShipId(shipId);
            const x = SHIP_TAB_START_X + shipTabIndex * SHIP_TAB_STRIDE;
            shipTabIndex++;

            const shipIcon = new GameObject();
            shipIcon.sprite = sprite;
            shipIcon.position = { x, y: TAB_Y - 2 };
            shipIcon.index = 2;
            this.addChild(shipIcon);

            const leftBracket = new TextDisplay(this, {
                font: 'arcade-small',
                message: '[',
                position: { x: x - 5, y: TAB_Y },
                color: this.game.interfaceColor
            });
            const rightBracket = new TextDisplay(this, {
                font: 'arcade-small',
                message: ']',
                position: { x: x + sprite.width + 1, y: TAB_Y },
                color: this.game.interfaceColor
            });
            this.addChild(leftBracket);
            this.addChild(rightBracket);

            return { def, shipIcon, leftBracket, rightBracket };
        });

        this.refreshTabChrome();
    }

    private refreshTabChrome(): void {
        this.tabChrome.forEach((tab, index) => {
            const active = index === this.activeTabIndex;

            if (tab.def.kind === 'text' && tab.label) {
                const base = tab.def.label || '';
                tab.label.changeMessage(active ? `[${base}]` : base);
                tab.label.updateColor(
                    active ? this.game.interfaceColor : this.disabledColor
                );
                return;
            }

            const shipId = tab.def.shipId!;
            const unlocked = this.player.isShipUnlocked(shipId);
            if (tab.shipIcon) {
                tab.shipIcon.sprite = PlayerControlledShip.spriteForShipId(shipId);
                if (!unlocked) {
                    tab.shipIcon.sprite.applyColor(this.disabledColor);
                }
            }

            if (tab.leftBracket && tab.rightBracket) {
                tab.leftBracket.changeMessage(active ? '[' : ' ');
                tab.rightBracket.changeMessage(active ? ']' : ' ');
                tab.leftBracket.updateColor(this.game.interfaceColor);
                tab.rightBracket.updateColor(this.game.interfaceColor);
            }
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
            if (row.progressOrbs) {
                this.removeChild(row.progressOrbs);
            }
        });
        this.rows = [];
    }

    private showsProgressOrbs(upgrade: ShopUpgradeDef): boolean {
        return upgrade.maxRanks !== null && upgrade.id !== 'unlock';
    }

    private rebuildRows(): void {
        this.clearRows();

        const upgrades = upgradesForTab(this.activeTab, (shipId) =>
            this.player.isShipUnlocked(shipId)
        );
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

                if (row.upgrade && this.showsProgressOrbs(row.upgrade)) {
                    row.progressOrbs = new UpgradeProgressOrbs(this, PROGRESS_RIGHT_X, y);
                    this.addChild(row.progressOrbs);
                }
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
            case 'fullHeal': return player.fullHealPurchases;
            case 'health': return player.lifeUpgrades;
            case 'energyShield': return player.energyShield;
            case 'bomb': return player.bombs;
            case 'maxHealth':
                return player.profileFor(upgrade.tab as PlayerShipId).maxHealthRanks;
            case 'armor':
                return player.profileFor(upgrade.tab as PlayerShipId).armorRanks;
            case 'bombCapacity':
                return player.profileFor(upgrade.tab as PlayerShipId).bombCapacityRanks;
            case 'shipSpeed':
                return player.profileFor(upgrade.tab as PlayerShipId).shipSpeedRanks;
            case 'fireSpeed':
                return player.profileFor(upgrade.tab as PlayerShipId).fireSpeedRanks;
            case 'combo':
                return player.profileFor(upgrade.tab as PlayerShipId).comboUpgrades;
            case 'unlock': {
                const shipId = upgrade.tab as PlayerShipId;
                return player.isShipUnlocked(shipId) ? 1 : 0;
            }
        }
    }

    private rowLabel(upgrade: ShopUpgradeDef, owned: number, maxed: boolean): string {
        if (upgrade.id === 'combo') {
            if (maxed) return 'Combo maxed';
            if (owned === 0) return 'Unlock Combo';
            return upgrade.label;
        }
        if (upgrade.id === 'unlock') {
            return maxed ? 'Unlocked' : upgrade.label;
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
            const bombUnavailable =
                upgrade.id === 'bomb' && !this.player.canPurchaseBomb();
            const maxed = cost === null || bombUnavailable;

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

            if (row.progressOrbs && upgrade.maxRanks !== null) {
                row.progressOrbs.setProgress(owned, upgrade.maxRanks);
            }
        });
    }

    private createSelectorShip(): void {
        this.selectorShip = new GameObject();
        this.selectorShip.sprite = ArrowShip();
        this.selectorShip.position = { x: 20, y: 0 };
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
        this.refreshTabChrome();
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
        if (
            cost !== null &&
            this.bank.value >= cost &&
            !(row.upgrade?.id === 'bomb' && !this.player.canPurchaseBomb())
        ) {
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

    private applyUpgrade(id: ShopUpgradeId, tab: ShopTabId): void {
        const shipId = tab as PlayerShipId;

        switch (id) {
            case 'fullHeal':
                this.player.purchaseFullHeal();
                break;
            case 'health':
                this.player.purchaseRunHealth();
                break;
            case 'energyShield':
                this.player.purchaseEnergyShield();
                break;
            case 'bomb':
                this.player.purchaseBomb();
                break;
            case 'maxHealth':
                this.player.purchaseMaxHealth(shipId);
                break;
            case 'armor':
                this.player.purchaseArmor(shipId);
                break;
            case 'bombCapacity':
                this.player.purchaseBombCapacity(shipId);
                break;
            case 'shipSpeed':
                this.player.purchaseShipSpeed(shipId);
                break;
            case 'fireSpeed':
                this.player.purchaseFireSpeed(shipId);
                break;
            case 'combo':
                this.player.purchaseCombo(shipId);
                if (shipId === this.player.activeShipId) {
                    this.game.comboGauge.syncFromPlayer();
                }
                break;
            case 'unlock':
                this.player.unlockShip(shipId);
                this.refreshTabChrome();
                this.rebuildRows();
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
            this.applyUpgrade(row.upgrade.id, row.upgrade.tab);
        }

        this.refreshRows();
        this.selecting = false;
    }
}
