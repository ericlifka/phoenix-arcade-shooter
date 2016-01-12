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

            this.createBackgroundSprite();
        },

        renderToFrame: function (frame) {
            this.super('renderToFrame', arguments);

            var font = this.font;
            var position = this.position;
            var offsetY = position.y;

            this.message.forEach(function (line) {
                var offsetX = position.x;

                line.forEach(function (char) {
                    var sprite = font[ char ];
                    if (sprite) {
                        sprite.renderToFrame(frame, offsetX, offsetY, 10);
                        offsetX += sprite.width + font.meta.letterSpacing;
                    }
                    else {
                        console.error("Tried to print an unsupported letter: '" + char + "'");
                    }
                });

                offsetY += font.meta.lineHeight;
            });
        },

        createBackgroundSprite: function () {
            var spriteRows = [];
            var dimensions = this.calculateMessageDimensions();

            if (this.padding) {
                dimensions.width += this.padding * 2;
                dimensions.height += this.padding * 2;
            }

            if (this.border) {
                dimensions.width += 2;
                dimensions.width += 2;
            }

            for (var y = 0; y < dimensions.height; y++) {
                var row = [ ];

                for (var x = 0; x < dimensions.width; x++) {

                    if (this.border && (x === 0 || y === 0)) {
                        row.push(this.borderColor);
                    } else {
                        row.push(this.background);
                    }

                }

                spriteRows.push(row);
            }

            this.sprite = new Sprite(spriteRows);
        },

        calculateMessageDimensions: function () {
            return {
                width: 20,
                height: 20
            };
        }
    });
});
