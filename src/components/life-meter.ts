import GameObject from '../models/game-object.js';
import { GreenToRed, colorAtPercent } from '../helpers/gradients.js';
import Sprite from '../rendering/core/sprite.js';
import { LifeMeterOptions } from '../types/game';
import { Anchor } from '../types/rendering';

/**
 * Visual health/life meter that displays entity health with color gradient
 */
export default class LifeMeter extends GameObject {
    index = 1;
    private entity: GameObject;
    private anchor: Anchor;
    private horizontal: boolean;
    private length: number;
    width: number; // Not private because parent uses it
    private scale?: number;
    private showBorder: boolean;
    private borderColor: string;
    private currentLife?: number;
    private maxLife?: number;

    constructor(boundEntity: GameObject, options?: LifeMeterOptions) {
        super(boundEntity);

        const opts = options || {};

        this.entity = boundEntity;
        this.position = opts.position || { x: 0, y: 0 };
        this.anchor = opts.anchor || {};
        this.horizontal = !!opts.horizontal;
        this.length = opts.length || 10;
        this.width = opts.width || 1;
        this.scale = opts.scale;
        this.showBorder = !!opts.showBorder;
        this.borderColor = opts.borderColor || "#ffffff";

        this.reset();
    }

    update(): void {
        if (this.entity.life !== this.currentLife || this.entity.maxLife !== this.maxLife) {
            this.currentLife = this.entity.life;
            this.maxLife = this.entity.maxLife;

            if (this.scale && this.maxLife) {
                this.length = this.maxLife * this.scale;
                if (this.length > 140) {
                    // this just applies to the player's health if they get so many upgrades
                    // it would overflow the screen, manually set lengths will always honor them.
                    this.length = 140;
                }
            }

            this.redrawMeter();
        }
    }

    private redrawMeter(): void {
        const colors = this.buildSpriteColorArray();

        if (this.showBorder) {
            this.addBorderToColorArray(colors);
        }

        this.sprite = new Sprite(colors);

        if (this.horizontal && this.sprite) {
            this.sprite.rotateRight();
        }

        this.updatePosition();
    }

    private buildSpriteColorArray(): (string | null)[][] {
        const percentage = (this.currentLife || 0) / (this.maxLife || 1) * 100;
        const meterColor = colorAtPercent(GreenToRed, (this.currentLife || 0) / (this.maxLife || 1));
        const colors = this.buildEmptySpriteColorArray();

        for (let i = this.length - 1; i >= 0; i--) {
            let color: string | null = null;
            if (i / this.length * 100 < percentage) {
                color = meterColor;
            }

            colors.forEach((colorArray) => {
                colorArray.push(color);
            });
        }

        return colors;
    }

    private buildEmptySpriteColorArray(): (string | null)[][] {
        const colors: (string | null)[][] = [];
        for (let j = 0; j < this.width; j++) {
            colors.push([]);
        }
        return colors;
    }

    private addBorderToColorArray(colors: (string | null)[][]): void {
        this.addBezelPixelsToBorder(colors);
        this.addBorderEnds(colors);
        this.addBorderEdges(colors);
    }

    private addBezelPixelsToBorder(colors: (string | null)[][]): void {
        if (this.width > 2) {
            colors[0][0] = this.borderColor;
            colors[this.width - 1][0] = this.borderColor;
            colors[0][this.length - 1] = this.borderColor;
            colors[this.width - 1][this.length - 1] = this.borderColor;
        }
    }

    private addBorderEnds(colors: (string | null)[][]): void {
        for (let j = 0; j < this.width; j++) {
            colors[j].push(this.borderColor);
            colors[j].unshift(this.borderColor);
        }
    }

    private addBorderEdges(colors: (string | null)[][]): void {
        const border: (string | null)[] = [null];
        for (let i = 0; i < this.length; i++) {
            border.push(this.borderColor);
        }
        border.push(null);

        colors.push(border);
        colors.unshift(border);
    }

    private updatePosition(): void {
        if (!this.position || !this.sprite) return;

        if (this.anchor.left !== undefined) {
            this.position.x = this.anchor.left;
        }

        if (this.anchor.top !== undefined) {
            this.position.y = this.anchor.top;
        }

        if (this.anchor.right !== undefined) {
            this.position.x = this.anchor.right - this.sprite.width;
        }

        if (this.anchor.bottom !== undefined) {
            this.position.y = this.anchor.bottom - this.sprite.height;
        }
    }
}
