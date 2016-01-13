DefineModule('models/text-display', function (require) {
    var ArcadeFont = require('fonts/arcade');
    var ArcadeSmallFont = require('fonts/arcade-small');
    var GameObject = require('models/game-object');
    var Sprite = require('models/sprite');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.super('constructor', arguments);

            var message = options.message || "";
            if (typeof message === "string") {
                message = [ message ];
            }
            message = message.map(function (str) { return str.split(''); });

            this.message = message;
            this.position = options.position;
            this.font = ArcadeSmallFont;
            this.border = !!options.border;
            this.padding = !!options.padding;
            this.borderColor = options.borderColor || "white";
            this.background = options.background || null;
            this.index = options.index || 10;

            this.populateSprites();
        },

        populateSprites: function () {
            var self = this;
            var width = 0;
            var height = 0;
            var xOffset = 0;
            var yOffset = 0;
            var lineWidths = [ ];

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
                        entity.sprite = sprite;
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

            this.createBackgroundSprite(width, height);
        },

        createBackgroundSprite: function (width, height) {
            var spriteRows = [ ];

            for (var x = 0; x < width; x++) {
                var row = [ ];

                for (var y = 0; y < height; y++) {
                    if (this.border &&
                        (x === 0 || y === 0 || x === width-1 || y === height-1)) {
                        row.push(this.borderColor);
                    } else {
                        row.push(this.background);
                    }
                }
                spriteRows.push(row);
            }
            this.sprite = new Sprite(spriteRows);
        }
    });
});
