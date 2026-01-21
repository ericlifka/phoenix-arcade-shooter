import GameObject from '../models/game-object.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import Sprite from '../../libs/pxlr-core/core/sprite.js';
import arcadeFont from '../../libs/pxlr-fonts/fonts/arcade.js';
import arcadeSmallFont from '../../libs/pxlr-fonts/fonts/arcade-small.js';
import phoenixFont from '../../libs/pxlr-fonts/fonts/phoenix.js';

const fonts = {
    'arcade': arcadeFont,
    'arcade-small': arcadeSmallFont,
    'phoenix': phoenixFont
};

export default class TextDisplay extends GameObject {
    constructor(parent, options) {
        super(parent);
        
        this.rawMessage = options.message || " ";
        this.font = fonts[options.font || "arcade-small"];
        this.color = options.color || "white";
        this.position = options.position;
        this.border = !!options.border;
        this.padding = options.padding || 0;
        this.background = options.background || null;
        this.index = options.index || 10;
        this.isPhysicalEntity = options.isPhysicalEntity;
    }

    reset() {
        super.reset();
        this.changeMessage(this.rawMessage);
    }

    changeMessage(text) {
        text = text || " ";
        this.rawMessage = text;

        if (typeof text === "string") {
            text = [ text ];
        }
        text = text.map(function (str) {
            return str.split('');
        });
        this.message = text;

        this.populateSprites();
        this.updateColor(this.color);
    }

    populateSprites() {
        this.children = []; // intentionally clear all previous sprites before adding new ones
        const self = this;

        let width = 0;
        let height = 0;
        let xOffset = this.position.x;
        let yOffset = this.position.y;
        const lineWidths = [];

        if (this.padding) {
            xOffset += this.padding;
            yOffset += this.padding;
            width += this.padding * 2;
            height += this.padding * 2;
        }

        if (this.border) {
            xOffset += 1;
            yOffset += 1;
            width += 1;
            height += 1;
        }

        this.message.forEach(function (line) {
            let xLineOffset = xOffset;
            let lineWidth = 0;

            line.forEach(function (char) {
                const sprite = self.font[ char ];
                if (sprite) {
                    const entity = new GameObject(self);
                    entity.sprite = sprite.clone();
                    entity.index = self.index + 1;
                    entity.position = {
                        x: xLineOffset,
                        y: yOffset
                    };
                    self.addChild(entity);

                    lineWidth += sprite.width + self.font.meta.letterSpacing;
                    xLineOffset += sprite.width + self.font.meta.letterSpacing;
                }
                else {
                    console.error("Tried to print an unsupported letter: '" + char + "'");
                }

            });

            lineWidths.push(lineWidth);
            yOffset += self.font.meta.lineHeight;
            height += self.font.meta.lineHeight;
        });

        width += Math.max.apply(null, lineWidths);
        this.width = width;
        this.height = height;

        this.createBackgroundSprite(width, height);
    }

    createBackgroundSprite(width, height) {
        const spriteRows = [];
        for (let x = 0; x < width; x++) {
            const row = [];
            for (let y = 0; y < height; y++) {
                row.push(this.background);
            }
            spriteRows.push(row);
        }
        this.sprite = new Sprite(spriteRows);
    }

    updateColor(color) {
        this.color = color;
        const width = this.width;
        const height = this.height;

        this.children.forEach(function (entity) {
            entity.sprite.applyColor(color);
        });

        if (this.border) {
            this.sprite.iterateCells(function (cell, x, y) {
                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    cell.color = color;
                }
            });
        }
    }

    applyDamage() {
        this.children.forEach(function (entity) {
            entity.sprite = shipExplosion({ x: -2, y: -1 });
        });
    }
}
