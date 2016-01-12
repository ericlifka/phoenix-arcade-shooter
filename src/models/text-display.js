DefineModule('models/text-display', function (require) {
    var ArcadeFont = require('fonts/arcade');
    var GameObject = require('models/game-object');

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
            this.font = ArcadeFont;
        },

        renderToFrame: function (frame) {
            var font = this.font;
            var position = this.position;
            var offsetY = position.y;

            this.message.forEach(function (line) {
                var offsetX = position.x;

                line.forEach(function (char) {
                    var sprite = font[ char ];
                    if (sprite) {
                        sprite.renderToFrame(offsetX, offsetY, frame);
                        offsetX += sprite.width + font.meta.letterSpacing;
                    }
                    else {
                        console.error("Tried to print an unsupported letter: '" + char + "'");
                    }
                });

                offsetY += font.meta.lineHeight;
            });
        }
    });
});
