import ArrowShip from '../sprites/arrow-ship.js';
import Bullet from '../components/bullet.js';
import EventedInput from '../models/evented-input.js';
import GameObject from '../models/game-object.js';
import Sprite from '../rendering/core/sprite.js';
import TextDisplay from '../components/text-display.js';
import { earthSprite, moonSprite } from '../sprites/planets.js';
import type { GameForLevelSelect, HubDestination } from '../types/levels.js';
import type { Position } from '../types/rendering';

const TITLE_X = 64;
const TITLE_Y = 4;

const EARTH_POSITION: Position = { x: 30, y: 44 };
const MOON_POSITION: Position = { x: 138, y: 26 };

const EARTH_LABEL: Position = { x: 34, y: 78 };
const MOON_LABEL: Position = { x: 137, y: 48 };
const SHOP_LABEL: Position = { x: 58, y: 112 };
const HANGAR_LABEL: Position = { x: 112, y: 112 };

/** Selector sits this far left of the label it points at. */
const SELECTOR_GAP = 12;

const ORBIT_FROM: Position = { x: 64, y: 52 };
const ORBIT_TO: Position = { x: 132, y: 34 };
const ORBIT_CONTROL: Position = { x: 100, y: 20 };
const ORBIT_COLOR = '#4b5a86';

interface SelectTarget {
    destination: HubDestination;
    message: string;
    labelPosition: Position;
    label?: TextDisplay;
}

/**
 * Run hub. A small Earth/Luna system map: each body launches its level set, and
 * a facility row underneath opens the shop or the hangar. Returned to between
 * every set, so it is the place a future progression system will gate things.
 */
export default class LevelSelect extends GameObject {
    isShop = true;
    index = 1;
    disabledColor = '#777';

    game: GameForLevelSelect;
    player: GameForLevelSelect['player'];
    input: EventedInput;

    /** Read by `LevelManager` once `checkIfLevelComplete()` goes true. */
    destination: HubDestination = 'standard';

    titleText!: TextDisplay;
    selectorShip!: GameObject;
    rows: SelectTarget[][] = [];
    rowIndex = 0;
    columnIndex = 0;
    timeSinceSelected = 0;
    selecting = false;
    isDone = false;

    constructor(parent: GameObject | null | undefined, game: GameForLevelSelect) {
        super(parent);

        this.game = game;
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

    reset(): void {
        super.reset();

        this.input.reset();
        this.isDone = false;
        this.selecting = false;
        this.rowIndex = 0;
        this.columnIndex = 0;
        this.rows = [];

        this.createTitle();
        this.createOrbitTrack();
        this.createBodies();
        this.createTargets();
        this.createSelectorShip();
        this.refreshTargets();
        this.updateSelectorPosition();

        this.addChild(this.input as unknown as GameObject);
    }

    start(): void {
        this.input.reset();
        this.isDone = false;
        this.selecting = false;

        if (!this.isEnabled(this.activeTarget())) {
            this.moveTo(0, 0);
        }

        this.refreshTargets();
        this.updateSelectorPosition();
    }

    checkIfLevelComplete(): boolean {
        return this.isDone;
    }

    update(dtime: number): void {
        super.update(dtime);

        this.timeSinceSelected += dtime;
        if (this.selecting && this.timeSinceSelected > 595) {
            this.propagateSelection();
        }
    }

    private createTitle(): void {
        this.titleText = new TextDisplay(this, {
            font: 'arcade-small',
            message: 'Select Destination',
            position: { x: TITLE_X, y: TITLE_Y },
            color: this.game.interfaceColor
        });
        this.addChild(this.titleText);
    }

    private createBodies(): void {
        const earth = new GameObject();
        earth.sprite = earthSprite();
        earth.position = { ...EARTH_POSITION };
        earth.index = 2;
        this.addChild(earth);

        const moon = new GameObject();
        moon.sprite = moonSprite();
        moon.position = { ...MOON_POSITION };
        moon.index = 2;
        this.addChild(moon);
    }

    private createOrbitTrack(): void {
        const track = new GameObject();
        const arc = dottedArc(ORBIT_FROM, ORBIT_CONTROL, ORBIT_TO, ORBIT_COLOR);
        track.sprite = arc.sprite;
        track.position = arc.position;
        track.index = 1;
        this.addChild(track);
    }

    private createTargets(): void {
        this.rows = [
            [
                { destination: 'standard', message: 'Earth', labelPosition: EARTH_LABEL },
                { destination: 'slim', message: 'Luna', labelPosition: MOON_LABEL }
            ],
            [
                { destination: 'shop', message: 'Shop', labelPosition: SHOP_LABEL },
                { destination: 'hangar', message: 'Hangar', labelPosition: HANGAR_LABEL }
            ]
        ];

        this.eachTarget((target) => {
            target.label = new TextDisplay(this, {
                font: 'arcade-small',
                message: target.message,
                position: { ...target.labelPosition },
                color: this.game.interfaceColor,
                isPhysicalEntity: true
            });
            this.addChild(target.label);
        });
    }

    private createSelectorShip(): void {
        this.selectorShip = new GameObject();
        this.selectorShip.sprite = ArrowShip();
        this.selectorShip.position = { x: 0, y: 0 };
        this.addChild(this.selectorShip);
    }

    private eachTarget(handler: (target: SelectTarget) => void): void {
        this.rows.forEach((row) => row.forEach(handler));
    }

    private activeTarget(): SelectTarget {
        return this.rows[this.rowIndex][this.columnIndex];
    }

    /** Hangar follows the same Hangar Bay gate the hangar screen itself uses. */
    private isEnabled(target: SelectTarget): boolean {
        if (target.destination === 'hangar') {
            return this.player.technologies.hangarBay;
        }
        return true;
    }

    private refreshTargets(): void {
        this.eachTarget((target) => {
            target.label!.updateColor(
                this.isEnabled(target) ? this.game.interfaceColor : this.disabledColor
            );
        });
    }

    private updateSelectorPosition(): void {
        const { x, y } = this.activeTarget().labelPosition;
        this.selectorShip.position!.x = x - SELECTOR_GAP;
        this.selectorShip.position!.y = y - 1;
    }

    private moveTo(rowIndex: number, columnIndex: number): void {
        const row = this.rows[rowIndex];
        if (!row) {
            return;
        }

        this.rowIndex = rowIndex;
        this.columnIndex = Math.min(columnIndex, row.length - 1);
        this.refreshTargets();
        this.updateSelectorPosition();
    }

    onUp(): void {
        if (!this.selecting && this.rowIndex > 0) {
            this.moveTo(this.rowIndex - 1, this.columnIndex);
        }
    }

    onDown(): void {
        if (!this.selecting && this.rowIndex < this.rows.length - 1) {
            this.moveTo(this.rowIndex + 1, this.columnIndex);
        }
    }

    onLeft(): void {
        if (!this.selecting && this.columnIndex > 0) {
            this.moveTo(this.rowIndex, this.columnIndex - 1);
        }
    }

    onRight(): void {
        if (!this.selecting && this.columnIndex < this.rows[this.rowIndex].length - 1) {
            this.moveTo(this.rowIndex, this.columnIndex + 1);
        }
    }

    onSelect(): void {
        if (this.selecting || !this.isEnabled(this.activeTarget())) {
            return;
        }

        this.selecting = true;
        this.timeSinceSelected = 0;

        const x1 = this.selectorShip.position!.x + this.selectorShip.sprite.width;
        const y =
            this.selectorShip.position!.y +
            Math.floor(this.selectorShip.sprite.height / 2);

        this.addChild(new Bullet(this, {
            team: 2,
            position: { x: x1, y: y },
            velocity: { x: 50, y: 0 }
        }));
    }

    private propagateSelection(): void {
        this.destination = this.activeTarget().destination;
        this.selecting = false;
        this.isDone = true;
    }
}

/**
 * Dotted quadratic-bezier arc, used for the Earth-Luna transfer track. Returns
 * a sprite cropped to the arc's bounding box plus the position to draw it at.
 */
function dottedArc(
    from: Position,
    control: Position,
    to: Position,
    color: string
): { sprite: Sprite; position: Position } {
    const samples = 400;
    const dotSpacing = 5;
    const points: Position[] = [];

    // Walked by arc length rather than by t: uniform t bunches dots up where
    // the curve flattens out and strings them apart where it is steep.
    let distanceSinceDot = dotSpacing;
    let previousX = from.x;
    let previousY = from.y;

    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const inverse = 1 - t;
        const x = inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x;
        const y = inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y;

        distanceSinceDot += Math.hypot(x - previousX, y - previousY);
        previousX = x;
        previousY = y;

        if (distanceSinceDot >= dotSpacing) {
            distanceSinceDot = 0;
            points.push({ x: Math.round(x), y: Math.round(y) });
        }
    }

    const minX = Math.min(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const width = Math.max(...points.map((point) => point.x)) - minX + 1;
    const height = Math.max(...points.map((point) => point.y)) - minY + 1;

    const pixels: (string | null)[][] = [];
    for (let x = 0; x < width; x++) {
        pixels[x] = [];
        for (let y = 0; y < height; y++) {
            pixels[x][y] = null;
        }
    }
    points.forEach((point) => {
        pixels[point.x - minX][point.y - minY] = color;
    });

    return { sprite: new Sprite(pixels), position: { x: minX, y: minY } };
}
