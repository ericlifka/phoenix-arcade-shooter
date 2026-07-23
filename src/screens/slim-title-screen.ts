import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import ArrowShip from '../sprites/arrow-ship.js';
import { Position } from '../types/rendering';

const SELECTOR_LEFT_X = 65;
const SELECTOR_RIGHT_X = 125;
const START_Y = 80;
const RESET_Y = 95;

interface SlimTitleParent extends GameObject {
    startNewGame(): void;
    resetMetaProgress(): void;
}

interface MenuItem {
    id: 'start' | 'reset';
    message: string;
    position: Position;
    label?: TextDisplay;
}

export default class SlimTitleScreen extends GameObject {
    selectedMenuItem = 0;
    timeSinceSelected = 0;
    selecting = false;
    resetConfirmPending = false;
    selectorShip!: GameObject;
    selectorRight!: GameObject;
    menuItems: MenuItem[] = [];

    constructor(parent?: GameObject | null) {
        super(parent);
        this.reset(0, false);
    }

    reset(runsCompleted = 0, showResetSave = false): void {
        super.reset();

        this.selectedMenuItem = 0;
        this.timeSinceSelected = 0;
        this.selecting = false;
        this.resetConfirmPending = false;
        this.menuItems = [];

        this.addChrome(runsCompleted);
        this.buildMenu(showResetSave);
        this.createShipSelectors();
        this.updateSelectorPosition();

        this.addChild(new EventedInput({
            onUp: this.onUp.bind(this),
            onDown: this.onDown.bind(this),
            onSelect: this.onSelect.bind(this)
        }) as unknown as GameObject);
    }

    private addChrome(runsCompleted: number): void {
        this.addChild(new TextDisplay(this, {
            font: 'phoenix',
            message: 'PHOENIX',
            position: { x: 54, y: 30 },
            preserveSpriteColors: true
        }));

        if (runsCompleted > 0) {
            this.addChild(new TextDisplay(this, {
                font: 'arcade-small',
                message: 'Runs completed: ' + runsCompleted,
                position: { x: 125, y: 140 }
            }));
        }

        this.addChild(new TextDisplay(this, {
            font: 'arcade-small',
            message: 'WASD - move ship',
            position: { x: 5, y: 120 }
        }));
        this.addChild(new TextDisplay(this, {
            font: 'arcade-small',
            message: 'SPACE - fire gun',
            position: { x: 5, y: 130 }
        }));
        this.addChild(new TextDisplay(this, {
            font: 'arcade-small',
            message: 'ENTER - pause',
            position: { x: 5, y: 140 }
        }));
    }

    private buildMenu(showResetSave: boolean): void {
        this.menuItems = [
            { id: 'start', message: 'Start', position: { x: 90, y: START_Y } }
        ];

        if (showResetSave) {
            this.menuItems.push({
                id: 'reset',
                message: 'Reset Save',
                position: { x: 80, y: RESET_Y }
            });
        }

        this.menuItems.forEach((item) => {
            item.label = new TextDisplay(this, {
                font: 'arcade-small',
                message: item.message,
                position: { ...item.position },
                isPhysicalEntity: true
            });
            this.addChild(item.label);
        });
    }

    createShipSelectors(): void {
        this.selectorShip = new GameObject();
        this.selectorRight = new GameObject();

        this.selectorShip.sprite = ArrowShip();
        this.selectorRight.sprite = ArrowShip().invertX();

        this.selectorShip.position = { x: SELECTOR_LEFT_X, y: START_Y };
        this.selectorRight.position = { x: SELECTOR_RIGHT_X, y: START_Y };

        this.addChild(this.selectorShip);
        this.addChild(this.selectorRight);
    }

    private updateSelectorPosition(): void {
        const item = this.menuItems[this.selectedMenuItem];
        if (!item) {
            return;
        }
        this.selectorShip.position!.x = SELECTOR_LEFT_X;
        this.selectorRight.position!.x = SELECTOR_RIGHT_X;
        this.selectorShip.position!.y = item.position.y;
        this.selectorRight.position!.y = item.position.y;
    }

    private clearResetConfirm(): void {
        if (!this.resetConfirmPending) {
            return;
        }
        this.resetConfirmPending = false;
        const resetItem = this.menuItems.find((item) => item.id === 'reset');
        if (resetItem?.label) {
            resetItem.message = 'Reset Save';
            resetItem.label.changeMessage('Reset Save');
        }
    }

    update(dtime: number): void {
        super.update(dtime);

        this.timeSinceSelected += dtime;
        if (this.selecting && this.timeSinceSelected > 595) {
            this.propagateSelection();
        }
    }

    onUp(): void {
        if (this.selecting || this.selectedMenuItem <= 0) {
            return;
        }
        this.selectedMenuItem--;
        this.clearResetConfirm();
        this.updateSelectorPosition();
    }

    onDown(): void {
        if (
            this.selecting ||
            this.selectedMenuItem >= this.menuItems.length - 1
        ) {
            return;
        }
        this.selectedMenuItem++;
        this.clearResetConfirm();
        this.updateSelectorPosition();
    }

    onSelect(): void {
        if (this.selecting) {
            return;
        }

        const item = this.menuItems[this.selectedMenuItem];
        if (!item) {
            return;
        }

        if (item.id === 'reset') {
            if (!this.resetConfirmPending) {
                this.resetConfirmPending = true;
                item.message = 'Confirm?';
                item.label?.changeMessage(' Confirm?');
                return;
            }
        }

        this.startSelectionAnimation();
    }

    private startSelectionAnimation(): void {
        this.selecting = true;
        this.timeSinceSelected = 0;

        const x1 = this.selectorShip.position!.x + this.selectorShip.sprite.width;
        const x2 = this.selectorRight.position!.x;
        const y =
            this.selectorShip.position!.y +
            Math.floor(this.selectorShip.sprite.height / 2);

        this.addChild(new Bullet(this, {
            team: 2,
            position: { x: x1, y: y },
            velocity: { x: 50, y: 0 }
        }));
        this.addChild(new Bullet(this, {
            team: 3,
            position: { x: x2, y: y },
            velocity: { x: -50, y: 0 }
        }));
    }

    private propagateSelection(): void {
        const item = this.menuItems[this.selectedMenuItem];
        const parent = this.parent as SlimTitleParent;

        if (item?.id === 'reset') {
            this.selecting = false;
            parent.resetMetaProgress();
            return;
        }

        parent.startNewGame();
        this.destroy();
    }
}
