import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import TextDisplay from '../components/text-display.js';
import ArrowShip from '../sprites/arrow-ship.js';

interface SlimTitleParent extends GameObject {
    startNewGame(): void;
}

export default class SlimTitleScreen extends GameObject {
    selectedMenuItem!: number;
    timeSinceSelected!: number;
    selecting!: boolean;
    selectorShip!: GameObject;
    selectorRight!: GameObject;

    constructor(parent?: GameObject | null) {
        super(parent);
        this.reset(0);
    }

    reset(runsCompleted = 0): void {
        super.reset();

        this.selectedMenuItem = 0;
        this.timeSinceSelected = 0;
        this.selecting = false;

        this.addDisplayText(runsCompleted);
        this.createShipSelectors();

        this.addChild(new EventedInput({
            onSelect: this.onSelect.bind(this)
        }) as unknown as GameObject);
    }

    addDisplayText(runsCompleted: number): void {
        this.addChild(new TextDisplay(this, {
            font: 'phoenix',
            message: 'PHOENIX',
            position: { x: 50, y: 30 }
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
            message: 'Start',
            position: { x: 90, y: 80 },
            isPhysicalEntity: true
        }));

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

    createShipSelectors(): void {
        this.selectorShip = new GameObject();
        this.selectorRight = new GameObject();

        this.selectorShip.sprite = ArrowShip();
        this.selectorRight.sprite = ArrowShip().invertX();

        this.selectorShip.position = { x: 70, y: 80 };
        this.selectorRight.position = { x: 120, y: 80 };

        this.addChild(this.selectorShip);
        this.addChild(this.selectorRight);
    }

    update(dtime: number): void {
        super.update(dtime);

        this.timeSinceSelected += dtime;
        if (this.selecting && this.timeSinceSelected > 595) {
            this.propagateSelection();
        }
    }

    onSelect(): void {
        if (!this.selecting) {
            this.startGame();
        }
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
        (this.parent as SlimTitleParent).startNewGame();
        this.destroy();
    }
}
