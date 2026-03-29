import GameObject from '../models/game-object.js';
import TextDisplay from './text-display.js';
import { BankOptions } from '../types/game';
import { Position } from '../types/rendering';

/**
 * Bank component that displays and manages the player's money
 */
export default class Bank extends GameObject {
    index = 1;
    private anchorPoint: Position;
    private color: string;
    private valueDisplay: TextDisplay;
    value: number = 0;
    width?: number;

    constructor(parent: GameObject, options?: BankOptions) {
        super(parent);

        const opts = options || {};
        this.anchorPoint = opts.position || { x: 0, y: 0 };
        this.position = { x: 0, y: this.anchorPoint.y };
        this.color = opts.color || "#ffffff";

        this.valueDisplay = new TextDisplay(this, {
            font: "arcade-small",
            color: this.color,
            index: 1,
            position: { x: this.position.x, y: this.position.y }
        });

        this.reset();
    }

    reset(): void {
        super.reset();

        this.addChild(this.valueDisplay);
        this.value = 0;
        this.updateDisplay();
    }

    addMoney(value: number): void {
        this.value += value;
        this.updateDisplay();
    }

    removeMoney(amount: number): void {
        this.value -= amount;
        this.updateDisplay();
    }

    private updateDisplay(): void {
        this.valueDisplay.changeMessage("$" + this.value + ".0");
        const width = this.valueDisplay.width;
        if (width && this.position && this.valueDisplay.position) {
            this.position.x = this.valueDisplay.position.x = this.anchorPoint.x - width;
        }
    }
}
