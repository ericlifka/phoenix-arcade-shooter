import GameObject from '../models/game-object.js';
import TextDisplay from './text-display.js';

export default class Bank extends GameObject {
    index = 1;

    constructor(parent, options) {
        super(parent);
        
        options = options || {};
        this.anchorPoint = options.position; // this text expands from the right, so the position has to be dynamic
        this.position = { x: 0, y: this.anchorPoint.y };
        this.color = options.color || "#ffffff";

        this.valueDisplay = new TextDisplay(this, {
            font: "arcade-small",
            color: this.color,
            index: 1,
            position: { x: this.position.x, y: this.position.y }
        });
        
        this.reset();
    }

    reset() {
        super.reset();

        this.addChild(this.valueDisplay);
        this.value = 0;
        this.updateDisplay();
    }

    addMoney(value) {
        this.value += value;
        this.updateDisplay();
    }

    removeMoney(amount) {
        this.value -= amount;
        this.updateDisplay();
    }

    updateDisplay() {
        this.valueDisplay.changeMessage("$" + this.value + ".0");
        const width = this.valueDisplay.width;
        this.position.x = this.valueDisplay.position.x = this.anchorPoint.x - width;
    }
}
