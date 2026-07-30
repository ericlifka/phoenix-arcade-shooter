import ArrowShip from '../sprites/arrow-ship.js';
import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import padScoreDisplay from '../helpers/pad-score-display.js';
import RunStats from '../models/run-stats.js';
import TextDisplay from '../components/text-display.js';
import type Bank from '../components/bank.js';
import type PlayerControlledShip from '../ships/player-controlled-ship.js';
import {
    deathShopUpgrades,
    nextUpgradeCost,
    type ShopUpgradeDef,
    type ShopUpgradeId
} from '../balance';

interface GameOverParent extends GameObject {
    finishGame(): void;
    recordDollarsSpent(amount: number): void;
    bank: Bank;
    player: PlayerControlledShip;
    interfaceColor: string;
    width: number;
    height: number;
}

const STAT_LABELS = ['Score', 'Kills'];
const STAT_LINE_Y = [40, 52];
const STAT_LABEL_X = 40;
const STAT_VALUE_RIGHT = 160;

const LIST_BASE_Y = 85;
const LIST_ROW_STRIDE = 15;
const LIST_LABEL_X = 70;
const LIST_COST_X = 40;
const CONTINUE_LABEL_X = 40;
const DISABLED_COLOR = '#777';

interface DeathShopRow {
    kind: 'upgrade' | 'continue';
    upgrade?: ShopUpgradeDef;
    description?: TextDisplay;
    costText?: TextDisplay;
    cost: number | null;
}

export default class GameOverScreen extends GameObject {
    result!: TextDisplay;
    header!: TextDisplay;
    statLabels: TextDisplay[] = [];
    statValues: TextDisplay[] = [];
    rows: DeathShopRow[] = [];
    selectorShip!: GameObject;
    inputEvents!: EventedInput;
    width!: number;
    height!: number;

    private themeColor = '#fff';
    private mode: 'win' | 'loss' = 'loss';
    private selectedMenuItem = 0;
    private selecting = false;
    private timeSinceSelected = 0;

    constructor(parent?: GameObject | null) {
        super(parent);
        this.reset();
    }

    private get game(): GameOverParent {
        return this.parent as GameOverParent;
    }

    reset(): void {
        super.reset();

        this.width = this.game.width;
        this.height = this.game.height;
        this.mode = 'loss';
        this.themeColor = '#fff';
        this.selectedMenuItem = 0;
        this.selecting = false;
        this.timeSinceSelected = 0;
        this.rows = [];
        this.statLabels = [];
        this.statValues = [];

        this.result = new TextDisplay(this, {
            font: 'arcade',
            message: 'GAME OVER',
            position: { x: 67, y: 14 }
        });
        this.addChild(this.result);

        this.header = new TextDisplay(this, {
            font: 'arcade-small',
            message: '',
            position: { x: 75, y: 132 }
        });
        this.addChild(this.header);

        STAT_LINE_Y.forEach((y, index) => {
            const label = new TextDisplay(this, {
                font: 'arcade-small',
                message: STAT_LABELS[index],
                position: { x: STAT_LABEL_X, y }
            });
            const value = new TextDisplay(this, {
                font: 'arcade-small',
                message: '',
                position: { x: STAT_VALUE_RIGHT, y }
            });
            this.statLabels.push(label);
            this.statValues.push(value);
            this.addChild(label);
            this.addChild(value);
        });

        this.selectorShip = new GameObject();
        this.selectorShip.sprite = ArrowShip();
        this.selectorShip.position = { x: 20, y: 0 };
        this.addChild(this.selectorShip);

        this.inputEvents = new EventedInput({
            onStart: this.onStart.bind(this),
            onUp: this.onUp.bind(this),
            onDown: this.onDown.bind(this),
            onSelect: this.onSelect.bind(this)
        });
        this.addChild(this.inputEvents as unknown as GameObject);
        this.inputEvents.reset();

        this.buildShopRows();
        this.applyModeChrome();
    }

    private buildShopRows(): void {
        this.rows.forEach((row) => {
            if (row.description) {
                this.removeChild(row.description);
            }
            if (row.costText) {
                this.removeChild(row.costText);
            }
        });
        this.rows = [];

        deathShopUpgrades.forEach((upgrade, index) => {
            const y = LIST_BASE_Y + index * LIST_ROW_STRIDE;
            const description = new TextDisplay(this, {
                font: 'arcade-small',
                message: upgrade.label,
                position: { x: LIST_LABEL_X, y },
                color: this.game.interfaceColor,
                isPhysicalEntity: true
            });
            const costText = new TextDisplay(this, {
                font: 'arcade-small',
                message: '',
                position: { x: LIST_COST_X, y },
                color: this.game.interfaceColor,
                isPhysicalEntity: true
            });
            this.addChild(description);
            this.addChild(costText);
            this.rows.push({
                kind: 'upgrade',
                upgrade,
                description,
                costText,
                cost: null
            });
        });

        const continueY = LIST_BASE_Y + deathShopUpgrades.length * LIST_ROW_STRIDE;
        const continueLabel = new TextDisplay(this, {
            font: 'arcade-small',
            message: 'Continue',
            position: { x: CONTINUE_LABEL_X, y: continueY },
            color: this.game.interfaceColor,
            isPhysicalEntity: true
        });
        this.addChild(continueLabel);
        this.rows.push({
            kind: 'continue',
            description: continueLabel,
            cost: null
        });

        this.refreshShopRows();
        this.updateSelectorPosition();
    }

    private refreshShopRows(): void {
        const player = this.game.player;
        const bank = this.game.bank;

        this.rows.forEach((row) => {
            if (row.kind === 'continue') {
                row.description!.changeMessage('Continue');
                row.description!.updateColor(this.game.interfaceColor);
                return;
            }

            const upgrade = row.upgrade!;
            const owned = this.ownedRank(upgrade.id);
            const cost = nextUpgradeCost(upgrade, owned);
            row.cost = cost;

            const unaffordable = cost === null || bank.value < cost;
            const color = unaffordable ? DISABLED_COLOR : this.game.interfaceColor;

            row.description!.changeMessage(upgrade.label);
            row.description!.updateColor(color);

            if (row.costText) {
                row.costText.changeMessage(cost === null ? '' : '$' + cost);
                row.costText.updateColor(color);
            }
        });
    }

    private ownedRank(id: ShopUpgradeId): number {
        const player = this.game.player;
        switch (id) {
            case 'deathHealth':
                return player.deathHealthPurchases;
            case 'deathShield':
                return player.deathShieldPurchases;
            default:
                return 0;
        }
    }

    private applyModeChrome(): void {
        if (this.mode === 'win') {
            this.header.changeMessage('< hit enter >');
            this.header.position = { x: 75, y: 132 };
            this.removeChild(this.selectorShip);
            this.rows.forEach((row) => {
                if (row.description) {
                    this.removeChild(row.description);
                }
                if (row.costText) {
                    this.removeChild(row.costText);
                }
            });
        } else {
            this.header.changeMessage('');
            if (!this.children.includes(this.selectorShip)) {
                this.addChild(this.selectorShip);
            }
            this.rows.forEach((row) => {
                if (row.description && !this.children.includes(row.description)) {
                    this.addChild(row.description);
                }
                if (row.costText && !this.children.includes(row.costText)) {
                    this.addChild(row.costText);
                }
            });
            this.refreshShopRows();
            this.updateSelectorPosition();
        }
        this.applyThemeColor();
    }

    update(dtime: number): void {
        super.update(dtime);

        if (this.mode !== 'loss') {
            return;
        }

        this.timeSinceSelected += dtime;
        if (this.selecting && this.timeSinceSelected > 595) {
            this.propagateSelection();
        }
    }

    private updateSelectorPosition(): void {
        if (this.mode !== 'loss' || !this.selectorShip.position) {
            return;
        }
        this.selectorShip.position.y = LIST_BASE_Y + this.selectedMenuItem * LIST_ROW_STRIDE;
    }

    onUp(): void {
        if (this.mode !== 'loss' || this.selecting) {
            return;
        }
        if (this.selectedMenuItem > 0) {
            this.selectedMenuItem--;
            this.updateSelectorPosition();
        }
    }

    onDown(): void {
        if (this.mode !== 'loss' || this.selecting) {
            return;
        }
        if (this.selectedMenuItem < this.rows.length - 1) {
            this.selectedMenuItem++;
            this.updateSelectorPosition();
        }
    }

    onSelect(): void {
        if (this.mode !== 'loss' || this.selecting) {
            return;
        }

        const row = this.rows[this.selectedMenuItem];
        if (!row) {
            return;
        }

        if (row.kind === 'continue') {
            this.startPurchaseAnimation();
            return;
        }

        const cost = row.cost;
        if (cost !== null && this.game.bank.value >= cost) {
            this.game.bank.removeMoney(cost);
            this.game.recordDollarsSpent(cost);
            this.startPurchaseAnimation();
        }
    }

    /** Win path: Enter / Start finishes immediately. */
    onStart(): void {
        if (this.mode === 'win' && !this.selecting) {
            this.game.finishGame();
        }
    }

    private startPurchaseAnimation(): void {
        this.selecting = true;
        this.timeSinceSelected = 0;

        const x1 = this.selectorShip.position!.x + this.selectorShip.sprite.width;
        const y =
            this.selectorShip.position!.y +
            Math.floor(this.selectorShip.sprite.height / 2);

        this.addChild(new Bullet(this, {
            team: 2,
            position: { x: x1, y },
            velocity: { x: 50, y: 0 }
        }));
    }

    private propagateSelection(): void {
        const row = this.rows[this.selectedMenuItem];
        this.selecting = false;

        if (!row) {
            return;
        }

        if (row.kind === 'continue') {
            this.game.finishGame();
            return;
        }

        this.applyUpgrade(row.upgrade!.id);
        this.refreshShopRows();
    }

    private applyUpgrade(id: ShopUpgradeId): void {
        switch (id) {
            case 'deathHealth':
                this.game.player.purchaseDeathHealth();
                break;
            case 'deathShield':
                this.game.player.purchaseDeathShield();
                break;
        }
    }

    setResult(result: string): void {
        if (result === 'win') {
            this.mode = 'win';
            this.themeColor = 'green';
            this.result.changeMessage('YOU WIN!');
        } else {
            this.mode = 'loss';
            this.themeColor = 'red';
            this.result.changeMessage('GAME OVER');
            this.selectedMenuItem = 0;
            this.selecting = false;
        }

        this.applyModeChrome();
    }

    setRunStats(stats: RunStats): void {
        this.setRightAlignedValue(
            this.statValues[0],
            padScoreDisplay(stats.pointsEarned),
            STAT_LINE_Y[0]
        );
        this.setRightAlignedValue(
            this.statValues[1],
            String(stats.enemiesDestroyed),
            STAT_LINE_Y[1]
        );
        this.applyThemeColor();
        if (this.mode === 'loss') {
            this.refreshShopRows();
        }
    }

    private setRightAlignedValue(display: TextDisplay, text: string, y: number): void {
        display.position = { x: STAT_VALUE_RIGHT, y };
        display.changeMessage(text);

        const width = display.width;
        if (width !== undefined && display.position) {
            display.position.x = STAT_VALUE_RIGHT - width;
            display.changeMessage(text);
        }
    }

    private applyThemeColor(): void {
        this.result.updateColor(this.themeColor);
        this.header.updateColor(this.themeColor);
        this.statLabels.forEach((line) => line.updateColor(this.themeColor));
        this.statValues.forEach((line) => line.updateColor(this.themeColor));
    }
}
