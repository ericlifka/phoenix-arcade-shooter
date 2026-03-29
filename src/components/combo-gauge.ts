import GameObject from '../models/game-object.js';
import { GreenToRed, colorAtPercent } from '../helpers/gradients.js';
import frameSprite from '../sprites/combo-gauge.js';
import padScoreDisplay from '../helpers/pad-score-display.js';
import Sprite from '../rendering/core/sprite.js';
import TextDisplay from './text-display.js';
import { ComboGaugeOptions } from '../types/game';

/**
 * Combo gauge that displays multiplier and score
 * Fills up as player hits enemies, increases multiplier
 */
export default class ComboGauge extends GameObject {
    index = 1;
    private color: string;
    private multiplierDisplay: TextDisplay;
    private scoreDisplay: TextDisplay;
    private comboPoints: number = 0;
    private pointTotal: number = 0;
    private pointMultiplier: number = 1;
    private fillGaugeSprite!: any;

    constructor(parent: GameObject, options: ComboGaugeOptions) {
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

        this.reset();
    }

    reset(): void {
        super.reset();

        this.comboPoints = 0;
        this.pointTotal = 0;

        this.updateMultiplier();
        this.updateGaugeHeight();
        this.updateScore();

        this.addChild(this.multiplierDisplay);
        this.addChild(this.scoreDisplay);
    }

    renderToFrame(frame: any): void {
        if (this.fillGaugeSprite && this.position) {
            this.fillGaugeSprite.renderToFrame(frame, this.position.x + 1, this.position.y + 1, this.index - 1);
        }

        super.renderToFrame(frame);
    }

    addPoints(points: number): void {
        this.pointTotal += this.pointMultiplier * points;
        this.updateScore();
    }

    getScore(): number {
        return this.pointTotal;
    }

    bumpCombo(): void {
        this.comboPoints++;
        this.updateMultiplier();
        this.updateGaugeHeight();
    }

    clearCombo(): void {
        this.comboPoints = 0;
        this.updateMultiplier();
        this.updateGaugeHeight();
    }

    private updateScore(): void {
        this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
    }

    private updateMultiplier(): void {
        if (this.comboPoints >= 59) {
            this.pointMultiplier = 6;
        }
        else if (this.comboPoints >= 48) {
            this.pointMultiplier = 5;
        }
        else if (this.comboPoints >= 36) {
            this.pointMultiplier = 4;
        }
        else if (this.comboPoints >= 24) {
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

    private updateGaugeHeight(): void {
        // Create a full vertical array of pixels (59 high)
        // Pixels below comboPoints are colored, pixels above are transparent
        const pixels: (string | null)[] = [];

        for (let i = 0; i < 59; i++) {
            if (i < this.comboPoints) {
                // Filled portion - use gradient color
                pixels.unshift(colorAtPercent(GreenToRed, 1 - i / 59));
            }
            else {
                // Empty portion - transparent
                pixels.unshift(null);
            }
        }

        // Create sprite with 4 columns of the same pixel data
        this.fillGaugeSprite = new Sprite([
            pixels, pixels, pixels, pixels
        ]);
    }
}
