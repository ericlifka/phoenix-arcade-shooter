DefineModule('components/text-display', function (require) {
    var GameObject = require('models/game-object');
    var shipExplosion = require('sprites/animations/ship-explosion');
    var Sprite = require('models/sprite');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.rawMessage = options.message || " ";
            this.font = require("fonts/" + (options.font || "arcade-small"));
            this.color = options.color || "white";
            this.position = options.position;
            this.border = !!options.border;
            this.padding = options.padding || 0;
            this.background = options.background || null;
            this.index = options.index || 10;
            this.isPhysicalEntity = options.isPhysicalEntity;

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.changeMessage(this.rawMessage);
            this.updateColor(this.color);
        },

        changeMessage: function (text) {
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
        },

        populateSprites: function () {
            this.children = []; // intentionally clear all previous sprites before adding new ones
            var self = this;

            var width = 0;
            var height = 0;
            var xOffset = this.position.x;
            var yOffset = this.position.y;
            var lineWidths = [];

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
                var xLineOffset = xOffset;
                var lineWidth = 0;

                line.forEach(function (char) {
                    var sprite = self.font[ char ];
                    if (sprite) {
                        var entity = new GameObject(self);
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
        },

        createBackgroundSprite: function (width, height) {
            var spriteRows = [];
            for (var x = 0; x < width; x++) {
                var row = [];
                for (var y = 0; y < height; y++) {
                    row.push(this.background);
                }
                spriteRows.push(row);
            }
            this.sprite = new Sprite(spriteRows);
        },

        updateColor: function (color) {
            this.color = color;
            var width = this.width;
            var height = this.height;

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
        },

        applyDamage: function () {
            this.children.forEach(function (entity) {
                entity.sprite = shipExplosion({ x: -2, y: -1 });
            });
        }
    });
});
