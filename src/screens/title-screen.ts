import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import ArrowShip from '../sprites/arrow-ship.js';
import { Position } from '../types/rendering';

interface MenuItem {
    message: string;
    position: Position;
}

interface TitleScreenParent extends GameObject {
    startNewGame(): void;
    showControlsScreen(): void;
}

export default class TitleScreen extends GameObject {
    headerDef = { message: 'PHOENIX', position: { x: 50, y: 30 } };
    menuItems: MenuItem[] = [
        { message: 'New', position: { x: 90, y: 90 } },
        { message: 'Load', position: { x: 89, y: 105 } },
        { message: 'controls', position: { x: 84, y: 120 } }
    ];

    selectedMenuItem!: number;
    timeSinceSelected!: number;
    selecting!: boolean;
    selectorShip!: GameObject;
    selectorRight!: GameObject;

    constructor(parent?: GameObject | null) {
        super(parent);
        this.reset();
    }

    reset(): void {
        super.reset();

        this.selectedMenuItem = 0;
        this.timeSinceSelected = 0;
        this.selecting = false;

        this.addDisplayText();
        this.createShipSelectors();

        this.addChild(new EventedInput({
            onUp: this.onUp.bind(this),
            onDown: this.onDown.bind(this),
            onSelect: this.onSelect.bind(this)
        }) as unknown as GameObject);
    }

    addDisplayText(): void {
        this.addChild(new TextDisplay(this, {
            font: 'phoenix',
            message: this.headerDef.message,
            position: this.headerDef.position
        }));

        this.menuItems.forEach(function (this: TitleScreen, item: MenuItem) {
            this.addChild(new TextDisplay(this, {
                font: 'arcade-small',
                message: item.message,
                position: item.position,
                isPhysicalEntity: true
            }));
        }.bind(this));
    }

    createShipSelectors(): void {
        this.selectorShip = new GameObject();
        this.selectorRight = new GameObject();

        this.selectorShip.sprite = ArrowShip();
        this.selectorRight.sprite = ArrowShip().invertX();

        this.selectorShip.position = { x: 70, y: 0 };
        this.selectorRight.position = { x: 115, y: 0 };

        this.addChild(this.selectorShip);
        this.addChild(this.selectorRight);

        this.updateSelectorPosition();
    }

    update(dtime: number): void {
        super.update(dtime);

        this.timeSinceSelected += dtime;
        if (this.selecting && this.timeSinceSelected > 595) {
            this.propagateSelection();
        }
    }

    onUp(): void {
        if (this.selectedMenuItem > 0 && !this.selecting) {
            this.selectedMenuItem--;
            this.updateSelectorPosition();
        }
    }

    onDown(): void {
        if (this.selectedMenuItem < this.menuItems.length - 1 && !this.selecting) {
            this.selectedMenuItem++;
            this.updateSelectorPosition();
        }
    }

    onSelect(): void {
        if (!this.selecting) {
            this.startGame();
        }
    }

    updateSelectorPosition(): void {
        const selectedY = this.menuItems[this.selectedMenuItem].position.y;

        this.selectorShip.position!.y = selectedY;
        this.selectorRight.position!.y = selectedY;
    }

    startGame(): void {
        this.selecting = true;
        this.timeSinceSelected = 0;

        const x1 = this.selectorShip.position!.x + this.selectorShip.sprite.width;
        const x2 = this.selectorRight.position!.x;
        const y = this.selectorShip.position!.y + Math.floor(this.selectorShip.sprite.height / 2);

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

    propagateSelection(): void {
        this.destroy();
        const p = this.parent as TitleScreenParent;
        switch (this.selectedMenuItem) {
            case 0:
            case 1:
                p.startNewGame();
                break;
            case 2:
                p.showControlsScreen();
                break;
            default:
                console.error('Unsupported menu option');
        }

    }
}
