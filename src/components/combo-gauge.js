import GameObject from '../models/game-object.js';
import { GreenToRed, colorAtPercent } from '../helpers/gradients.js';
import frameSprite from '../sprites/combo-gauge.js';
import padScoreDisplay from '../helpers/pad-score-display.js';
import Sprite from '../../libs/pxlr-core/core/sprite.js';
import TextDisplay from './text-display.js';

export default class ComboGauge extends GameObject {
    index = 1;

    constructor(parent, options) {
        super(parent);
        
        this.position = options.position;
        this.color = options.color || "#ffffff";
        this.sprite = frameSprite().applyColor(this.color);

        this.multiplierDisplay = new TextDisplay(this, {
            font: "arcade-small",
            color: this.color,
            index: 1,
            position: { x: this.position.x + 7, y: this.position.y + this.sprite.height - 5 }
        });
        this.scoreDisplay = new TextDisplay(this, {
            font: "arcade-small",
            color: this.color,
            index: 1,
            position: { x: this.position.x, y: this.position.y + this.sprite.height + 1 }
        });
    }

    reset() {
        super.reset();

        this.comboPoints = 0;
        this.pointTotal = 0;

        this.updateMultiplier();
        this.updateGaugeHeight();
        this.updateScore();

        this.addChild(this.multiplierDisplay);
        this.addChild(this.scoreDisplay);
    }

    renderToFrame(frame) {
        this.fillGaugeSprite.renderToFrame(frame, this.position.x + 1, this.position.y + 1, this.index - 1);

        super.renderToFrame(frame);
    }

    addPoints(points) {
        this.pointTotal += this.pointMultiplier * points;
        this.updateScore();
    }

    getScore() {
        return this.pointTotal;
    }

    bumpCombo() {
        this.comboPoints++;
        this.updateMultiplier();
        this.updateGaugeHeight();
    }

    clearCombo() {
        this.comboPoints = 0;
        this.updateMultiplier();
        this.updateGaugeHeight();
    }

    updateGaugeHeight() {
        const pixels = [];
        for (let i = 0; i < 59; i++) {
            if (i < this.comboPoints) {
                pixels.unshift(colorAtPercent(GreenToRed, 1 - i / 59));
            }
            else {
                pixels.unshift(null);
            }
        }

        this.fillGaugeSprite = new Sprite([
            pixels, pixels, pixels, pixels
        ]);
    }

    updateMultiplier() {
        if (this.comboPoints >= 59) {
            this.pointMultiplier = 6;
        }
        else if (this.comboPoints >= 48) {
            this.pointMultiplier = 5;
        }
        else if (this.comboPoints >= 36) {
            this.pointMultiplier = 4;
        }
        else if (this.comboPoints >= 24 ) {
            this.pointMultiplier = 3;
        }
        else if (this.comboPoints >= 12) {
            this.pointMultiplier = 2;
        }
        else {
            this.pointMultiplier = 1;
        }

        this.multiplierDisplay.changeMessage(this.pointMultiplier + "x");
    }

    updateScore() {
        this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
    }
}
