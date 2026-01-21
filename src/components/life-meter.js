import GameObject from '../models/game-object.js';
import { GreenToRed, colorAtPercent } from '../helpers/gradients.js';
import Sprite from '../../libs/pxlr-core/core/sprite.js';

export default class LifeMeter extends GameObject {
    index = 1;

    constructor(boundEntity, options) {
        super(boundEntity);

        options = options || {};

        this.entity = boundEntity;
        this.position = options.position || { x: 0, y: 0 };
        this.anchor = options.anchor || {};
        this.horizontal = !!options.horizontal;
        this.length = options.length || 10;
        this.width = options.width || 1;
        this.scale = options.scale;
        this.showBorder = !!options.showBorder;
        this.borderColor = options.borderColor || "#ffffff";
    }

    update() {
        if (this.entity.life !== this.currentLife || this.entity.maxLife !== this.maxLife) {
            this.currentLife = this.entity.life;
            this.maxLife = this.entity.maxLife;

            if (this.scale) {
                this.length = this.maxLife * this.scale;
                if (this.length > 70) {
                    // this just applies to the player's health if they get so many upgrades
                    // it would overflow the screen, manually set lengths will always honor them.
                    this.length = 70;
                }
            }

            this.redrawMeter();
        }
    }

    redrawMeter() {
        const colors = this.buildSpriteColorArray();

        if (this.showBorder) {
            this.addBorderToColorArray(colors);
        }

        this.sprite = new Sprite(colors);

        if (this.horizontal) {
            this.sprite.rotateRight();
        }

        this.updatePosition();
    }

    buildSpriteColorArray() {
        const percentage = this.currentLife / this.maxLife * 100;
        const meterColor = colorAtPercent(GreenToRed, this.currentLife / this.maxLife);
        const colors = this.buildEmptySpriteColorArray();

        for (let i = this.length - 1; i >= 0; i--) {
            let color = null;
            if (i / this.length * 100 < percentage) {
                color = meterColor;
            }

            colors.forEach(function (colorArray) {
                colorArray.push(color);
            });
        }

        return colors;
    }

    buildEmptySpriteColorArray() {
        const colors = [];
        for (let j = 0; j < this.width; j++) {
            colors.push([]);
        }
        return colors;
    }

    addBorderToColorArray(colors) {
        this.addBezelPixelsToBorder(colors);
        this.addBorderEnds(colors);
        this.addBorderEdges(colors);
    }

    addBezelPixelsToBorder(colors) {
        if (this.width > 2) {
            colors[ 0 ][ 0 ] = this.borderColor;
            colors[ this.width - 1 ][ 0 ] = this.borderColor;
            colors[ 0 ][ this.length - 1 ] = this.borderColor;
            colors[ this.width - 1 ][ this.length - 1 ] = this.borderColor;
        }
    }

    addBorderEnds(colors) {
        for (let j = 0; j < this.width; j++) {
            colors[ j ].push(this.borderColor);
            colors[ j ].unshift(this.borderColor);
        }
    }

    addBorderEdges(colors) {
        const border = [ null ];
        for (let i = 0; i < this.length; i++) {
            border.push(this.borderColor);
        }
        border.push(null);

        colors.push(border);
        colors.unshift(border);
    }

    updatePosition() {
        if (this.anchor.left) {
            this.position.x = this.anchor.left;
        }

        if (this.anchor.top) {
            this.position.y = this.anchor.top;
        }

        if (this.anchor.right) {
            this.position.x = this.anchor.right - this.sprite.width;
        }

        if (this.anchor.bottom) {
            this.position.y = this.anchor.bottom - this.sprite.height;
        }
    }
}
