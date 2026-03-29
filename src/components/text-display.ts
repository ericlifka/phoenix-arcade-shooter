import GameObject from '../models/game-object.js';
import shipExplosion from '../sprites/animations/ship-explosion.js';
import Sprite from '../rendering/core/sprite.js';
import arcadeFont from '../rendering/fonts/arcade.js';
import arcadeSmallFont from '../rendering/fonts/arcade-small.js';
import phoenixFont from '../rendering/fonts/phoenix.js';
import { TextDisplayOptions } from '../types/game';
import { Font } from '../types/rendering';

const fonts: Record<string, Font> = {
    'arcade': arcadeFont,
    'arcade-small': arcadeSmallFont,
    'phoenix': phoenixFont
};

/**
 * Displays pixel text using custom fonts
 * Can be single or multi-line, with optional border and background
 */
export default class TextDisplay extends GameObject {
    rawMessage: string | string[];
    font: Font;
    color: string;
    border: boolean;
    padding: number;
    background: string | null;
    isPhysicalEntity?: boolean;
    message?: string[][];
    width?: number;
    height?: number;

    constructor(parent: GameObject, options: TextDisplayOptions) {
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

        this.reset();
    }

    reset(): void {
        super.reset();
        this.changeMessage(this.rawMessage);
    }

    changeMessage(text: string | string[]): void {
        let processedText: string | string[] = text || " ";
        this.rawMessage = processedText;

        if (typeof processedText === "string") {
            processedText = [processedText];
        }
        const charArrays = processedText.map((str) => str.split(''));
        this.message = charArrays;

        this.populateSprites();
        this.updateColor(this.color);
    }

    private populateSprites(): void {
        this.children = []; // intentionally clear all previous sprites before adding new ones
        const self = this;

        if (!this.position || !this.message) return;

        let width = 0;
        let height = 0;
        let xOffset = this.position.x;
        let yOffset = this.position.y;
        const lineWidths: number[] = [];

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

        this.message.forEach((line) => {
            let xLineOffset = xOffset;
            let lineWidth = 0;

            line.forEach((char) => {
                const sprite = self.font[char];
                if (sprite) {
                    const entity = new GameObject(self);
                    entity.sprite = sprite.clone();
                    entity.index = self.index! + 1;
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

    private createBackgroundSprite(width: number, height: number): void {
        const spriteRows: (string | null)[][] = [];
        for (let x = 0; x < width; x++) {
            const row: (string | null)[] = [];
            for (let y = 0; y < height; y++) {
                row.push(this.background);
            }
            spriteRows.push(row);
        }
        this.sprite = new Sprite(spriteRows);
    }

    updateColor(color: string): void {
        this.color = color;
        const width = this.width;
        const height = this.height;

        this.children.forEach((entity) => {
            if (entity.sprite) {
                entity.sprite.applyColor(color);
            }
        });

        if (this.border && this.sprite && width && height) {
            this.sprite.iterateCells((cell: any, x: number, y: number) => {
                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    cell.color = color;
                }
            });
        }
    }

    applyDamage(): void {
        this.children.forEach((entity) => {
            if (entity) {
                entity.sprite = shipExplosion({ x: -2, y: -1 });
            }
        });
    }
}
