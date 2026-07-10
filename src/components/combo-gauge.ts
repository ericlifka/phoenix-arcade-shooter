import GameObject from '../models/game-object.js';
import { GreenToRed, colorAtPercent } from '../helpers/gradients.js';
import padScoreDisplay from '../helpers/pad-score-display.js';
import Sprite from '../rendering/core/sprite.js';
import TextDisplay from './text-display.js';
import { ComboGaugeOptions } from '../types/game';
import type PlayerControlledShip from '../ships/player-controlled-ship.js';

export const MAX_COMBO_SEGMENTS = 10;
export const MAX_COMBO_MULTIPLIER = MAX_COMBO_SEGMENTS + 1;
export const COMBO_SEGMENT_HEIGHT = 12;
export const MAX_COMBO_FILL_HEIGHT = MAX_COMBO_SEGMENTS * COMBO_SEGMENT_HEIGHT;
export const COMBO_FILL_WIDTH = 4;

function buildFrameSprite(segmentCount: number, borderColor: string): Sprite {
    const fillHeight = segmentCount * COMBO_SEGMENT_HEIGHT;
    const dividerCount = segmentCount - 1;
    const frameWidth = COMBO_FILL_WIDTH + 2;
    const frameHeight = fillHeight + dividerCount + 2;
    const pixels: (string | null)[][] = [];

    for (let x = 0; x < frameWidth; x++) {
        pixels[x] = [];
        for (let y = 0; y < frameHeight; y++) {
            pixels[x][y] = null;
        }
    }

    const left = 0;
    const right = frameWidth - 1;
    const barStart = 2;
    const barEnd = frameWidth - 3;

    // Horizontal bars (top, bottom, segment dividers) with 1px openings on each side
    function drawHorizontalBar(y: number): void {
        for (let x = barStart; x <= barEnd; x++) {
            pixels[x][y] = borderColor;
        }
    }

    // Vertical sides
    for (let y = 1; y < frameHeight - 1; y++) {
        pixels[left][y] = borderColor;
        pixels[right][y] = borderColor;
    }

    drawHorizontalBar(0);
    drawHorizontalBar(frameHeight - 1);

    for (let seg = 1; seg < segmentCount; seg++) {
        drawHorizontalBar(seg * (COMBO_SEGMENT_HEIGHT + 1));
    }

    // Rounded corners: outer pixel transparent, inner L-shape filled
    // Top-left
    pixels[1][1] = borderColor;
    pixels[1][0] = borderColor;
    // Top-right
    pixels[right - 1][1] = borderColor;
    pixels[right - 1][0] = borderColor;
    // Bottom-left
    pixels[1][frameHeight - 2] = borderColor;
    pixels[1][frameHeight - 1] = borderColor;
    // Bottom-right
    pixels[right - 1][frameHeight - 2] = borderColor;
    pixels[right - 1][frameHeight - 1] = borderColor;

    return new Sprite(pixels);
}

/**
 * Combo gauge that displays score and, once unlocked via the shop, combo multiplier + fill.
 * Segment count is upgradeable via the shop (0 = score only, up to 10 segments / 11x).
 */
export default class ComboGauge extends GameObject {
    index = 1;
    private color: string;
    private anchorBottom: number;
    private player?: PlayerControlledShip;
    private multiplierDisplay: TextDisplay;
    private scoreDisplay: TextDisplay;
    private segmentCount = 0;
    private comboPoints = 0;
    private pointTotal = 0;
    private pointMultiplier = 1;
    private fillGaugeSprite!: any;

    constructor(parent: GameObject, options: ComboGaugeOptions) {
        super(parent);

        this.position = options.position;
        this.color = options.color || '#ffffff';
        this.anchorBottom = options.anchorBottom ?? options.position.y;
        this.player = options.player;

        this.multiplierDisplay = new TextDisplay(this, {
            font: 'arcade-small',
            color: this.color,
            index: 1,
            position: { x: this.position.x, y: this.position.y }
        });
        this.scoreDisplay = new TextDisplay(this, {
            font: 'arcade-small',
            color: this.color,
            index: 1,
            position: { x: this.position.x, y: this.position.y }
        });

        this.reset();
    }

    reset(): void {
        super.reset();

        this.comboPoints = 0;
        this.pointTotal = 0;

        this.syncFromPlayer();
        this.updateMultiplier();
        this.updateGaugeFill();
        this.updateScore();

        this.addChild(this.scoreDisplay);
        this.updateComboVisibility();
    }

    syncFromPlayer(): void {
        if (this.player) {
            this.segmentCount = this.player.comboSegments;
        }

        if (this.comboActive()) {
            this.sprite = buildFrameSprite(this.segmentCount, this.color);

            const maxPoints = this.activeFillHeight();
            if (this.comboPoints > maxPoints) {
                this.comboPoints = maxPoints;
            }
        } else {
            this.sprite = undefined;
            this.fillGaugeSprite = undefined;
            this.comboPoints = 0;
        }

        this.updateLayout();
        this.updateMultiplier();
        this.updateGaugeFill();
        this.updateComboVisibility();
    }

    renderToFrame(frame: any): void {
        if (this.comboActive() && this.fillGaugeSprite && this.position) {
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

    getMultiplier(): number {
        return this.pointMultiplier;
    }

    bumpCombo(): void {
        if (!this.comboActive()) {
            return;
        }

        const maxPoints = this.activeFillHeight();
        if (this.comboPoints < maxPoints) {
            this.comboPoints++;
        }

        this.updateMultiplier();
        this.updateGaugeFill();
    }

    clearCombo(): void {
        if (!this.comboActive()) {
            return;
        }

        this.comboPoints = 0;
        this.updateMultiplier();
        this.updateGaugeFill();
    }

    private comboActive(): boolean {
        return this.segmentCount > 0;
    }

    private updateComboVisibility(): void {
        if (this.comboActive()) {
            if (!this.children.includes(this.multiplierDisplay)) {
                this.addChild(this.multiplierDisplay);
            }
        } else {
            this.removeChild(this.multiplierDisplay);
        }
    }

    private activeFillHeight(): number {
        return this.segmentCount * COMBO_SEGMENT_HEIGHT;
    }

    private updateLayout(): void {
        if (!this.position) {
            return;
        }

        if (this.comboActive() && this.sprite) {
            this.position.y = this.anchorBottom - this.sprite.height;
            this.multiplierDisplay.position = {
                x: this.position.x + 7,
                y: this.position.y + this.sprite.height - 5
            };
        }

        this.scoreDisplay.position = {
            x: this.position.x,
            y: this.anchorBottom + 1
        };

        this.repositionDisplays();
    }

    private repositionDisplays(): void {
        this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
        if (this.comboActive()) {
            this.multiplierDisplay.changeMessage(this.pointMultiplier + 'x');
        }
    }

    private updateScore(): void {
        this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
    }

    private updateMultiplier(): void {
        if (!this.comboActive()) {
            this.pointMultiplier = 1;
            return;
        }

        const filledSegments = Math.floor(this.comboPoints / COMBO_SEGMENT_HEIGHT);
        this.pointMultiplier = Math.min(this.segmentCount + 1, 1 + filledSegments, MAX_COMBO_MULTIPLIER);
        this.multiplierDisplay.changeMessage(this.pointMultiplier + 'x');
    }

    private innerFillHeight(): number {
        return this.segmentCount * COMBO_SEGMENT_HEIGHT + (this.segmentCount - 1);
    }

    private isDividerRow(frameRow: number): boolean {
        for (let seg = 1; seg < this.segmentCount; seg++) {
            if (frameRow === seg * (COMBO_SEGMENT_HEIGHT + 1)) {
                return true;
            }
        }

        return false;
    }

    private updateGaugeFill(): void {
        if (!this.comboActive()) {
            this.fillGaugeSprite = undefined;
            return;
        }

        const innerHeight = this.innerFillHeight();
        const pixels: (string | null)[] = new Array(innerHeight).fill(null);
        let filled = 0;

        // Fill from the bottom of the inner area, skipping divider rows for height count
        for (let innerY = innerHeight - 1; innerY >= 0; innerY--) {
            const frameRow = innerY + 1;
            if (this.isDividerRow(frameRow)) {
                continue;
            }

            if (filled < this.comboPoints) {
                pixels[innerY] = colorAtPercent(GreenToRed, 1 - filled / MAX_COMBO_FILL_HEIGHT);
                filled++;
            }
        }

        // Divider rows are transparent in the frame except side openings — paint them
        // so the gradient shows through (frame border covers the center pixels).
        for (let innerY = 0; innerY < innerHeight; innerY++) {
            const frameRow = innerY + 1;
            if (!this.isDividerRow(frameRow)) {
                continue;
            }

            if (pixels[innerY + 1] != null) {
                pixels[innerY] = pixels[innerY + 1];
            } else if (innerY > 0 && pixels[innerY - 1] != null) {
                pixels[innerY] = pixels[innerY - 1];
            }
        }

        const column = pixels;
        this.fillGaugeSprite = new Sprite([
            column, column, column, column
        ]);
    }
}
