import ArrowShip from '../sprites/arrow-ship.js';
import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import PlayerControlledShip from '../ships/player-controlled-ship.js';
import { playerShipDefs, type PlayerShipId } from '../balance/player-ships.js';
import type { GameForHangar } from '../types/levels.js';

const LIST_BASE_Y = 45;
const LIST_ROW_STRIDE = 18;
const SHIP_ROW_X = 70;

interface HangarRow {
    shipId: PlayerShipId;
    icon: GameObject;
}

/**
 * Pre-run ship picker. Shop-style list of unlocked hulls; one selection ends the level.
 * Auto-completes when only the starter is unlocked.
 */
export default class Hangar extends GameObject {
    isShop = true;
    index = 1;

    game: GameForHangar;
    player: GameForHangar['player'];
    input: EventedInput;

    titleText!: TextDisplay;
    rows: HangarRow[] = [];
    selectorShip!: GameObject;
    selectedMenuItem = 0;
    timeSinceSelected = 0;
    selecting = false;
    isDone = false;
    private interactive = false;

    constructor(parent: GameObject | null | undefined, game: GameForHangar) {
        super(parent);

        this.game = game;
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
        this.isDone = false;
        this.selecting = false;
        this.interactive = false;
        this.selectedMenuItem = 0;
        this.rows = [];

        this.createTitle();
        this.createSelectorShip();
        this.addChild(this.input as unknown as GameObject);
    }

    start(): void {
        this.input.reset();
        this.isDone = false;
        this.selecting = false;
        this.clearRows();

        const unlocked = this.unlockedShipIds();
        if (unlocked.length <= 1) {
            this.interactive = false;
            this.hideChrome();
            this.isDone = true;
            return;
        }

        this.interactive = true;
        this.showChrome();
        this.buildRows(unlocked);
        this.selectedMenuItem = Math.max(
            0,
            unlocked.indexOf(this.player.activeShipId)
        );
        this.updateSelectorPosition();
    }

    checkIfLevelComplete(): boolean {
        return this.isDone;
    }

    update(dtime: number): void {
        super.update(dtime);

        if (!this.interactive) {
            return;
        }

        this.timeSinceSelected += dtime;
        if (this.selecting && this.timeSinceSelected > 595) {
            this.propagateSelection();
        }
    }

    private unlockedShipIds(): PlayerShipId[] {
        return playerShipDefs
            .filter((def) => this.player.isShipUnlocked(def.id))
            .map((def) => def.id);
    }

    private createTitle(): void {
        this.titleText = new TextDisplay(this, {
            font: 'arcade',
            message: 'Hangar',
            position: { x: 70, y: 10 },
            color: this.game.interfaceColor
        });
        this.addChild(this.titleText);
    }

    private createSelectorShip(): void {
        this.selectorShip = new GameObject();
        this.selectorShip.sprite = ArrowShip();
        this.selectorShip.position = { x: 40, y: LIST_BASE_Y };
        this.addChild(this.selectorShip);
    }

    private hideChrome(): void {
        if (this.titleText.position) {
            this.titleText.position.y = -100;
        }
        if (this.selectorShip.position) {
            this.selectorShip.position.y = -100;
        }
    }

    private showChrome(): void {
        if (this.titleText.position) {
            this.titleText.position.y = 10;
        }
    }

    private clearRows(): void {
        this.rows.forEach((row) => this.removeChild(row.icon));
        this.rows = [];
    }

    private buildRows(shipIds: PlayerShipId[]): void {
        this.rows = shipIds.map((shipId, index) => {
            const icon = new GameObject();
            icon.sprite = PlayerControlledShip.spriteForShipId(shipId);
            icon.position = {
                x: SHIP_ROW_X,
                y: LIST_BASE_Y + index * LIST_ROW_STRIDE
            };
            icon.index = 2;
            this.addChild(icon);
            return { shipId, icon };
        });
    }

    private updateSelectorPosition(): void {
        this.selectorShip.position!.y = LIST_BASE_Y + this.selectedMenuItem * LIST_ROW_STRIDE;
    }

    onUp(): void {
        if (!this.interactive || this.selecting || this.selectedMenuItem <= 0) {
            return;
        }
        this.selectedMenuItem--;
        this.updateSelectorPosition();
    }

    onDown(): void {
        if (
            !this.interactive ||
            this.selecting ||
            this.selectedMenuItem >= this.rows.length - 1
        ) {
            return;
        }
        this.selectedMenuItem++;
        this.updateSelectorPosition();
    }

    onSelect(): void {
        if (!this.interactive || this.selecting || this.rows.length === 0) {
            return;
        }

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

    private propagateSelection(): void {
        const row = this.rows[this.selectedMenuItem];
        if (row) {
            this.player.selectShipForRun(row.shipId);
            this.game.comboGauge.syncFromPlayer();
        }

        this.selecting = false;
        this.isDone = true;
    }
}
