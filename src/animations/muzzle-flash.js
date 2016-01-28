DefineModule('phoenix/animations/muzzle-flash', function (require) {
    var Animation = require('models/animation');
    var GameObject = require('models/game-object');
    var Sprite = require('models/sprite');

    var shades = [
        "#ff0000",
        "#ff3300",
        "#ff6600",
        "#ff9933",
        "#ffcc00",
        "#ff9900",
        "#ffcc00",
        "#ffcc66",
        "#ffcc99"
    ];

    var frames = shades.map(function (shade) {
        return new Sprite([
            [ shade, shade ]
        ]);
    });

    return DefineClass(GameObject, {
        constructor: function (parent, gunPosition) {
            this.super('constructor', arguments);

            this.gunPosition = gunPosition;
            this.sprite = new Animation({
                frames: frames,
                millisPerFrame: 25
            });
        },

        update: function () {
            this.super('update', arguments);

            if (this.sprite.finished) {
                this.destroy();
            }
        },

        renderToFrame: function (frame) {
            this.sprite.renderToFrame(frame,
                Math.floor(this.parent.position.x + this.gunPosition.x),
                Math.floor(this.parent.position.y + this.gunPosition.y-1),
                (this.parent.index || 0) + 1);
        }
    })
});
