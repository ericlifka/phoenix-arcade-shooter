DefineModule('phoenix/animations/muzzle-flash', function (require) {
    var Animation = require('models/animation');
    var GameObject = require('models/game-object');
    var Sprite = require('models/sprite');

    var y = "yellow";
    var o = "orange";
    var r = "red";

    var frames = [
        new Sprite([
            [ r, r ]
        ]),
        new Sprite([
            [ o, o ]
        ]),
        new Sprite([
            [ y, y ]
        ])
    ];

    return DefineClass(GameObject, {
        constructor: function (parent, gunPosition) {
            this.super('constructor', arguments);

            this.gunPosition = gunPosition;
            this.sprite = new Animation({
                frames: frames,
                millisPerFrame: 50
            });
        },

        update: function (dtime) {
            this.super('update', arguments);

            if (this.sprite.finished) {
                this.destroy();
            }
        },

        renderToFrame: function (frame) {
            this.sprite.renderToFrame(frame,
                Math.floor(this.parent.position.x + this.gunPosition.x),
                Math.floor(this.parent.position.y + this.gunPosition.y),
                (this.parent.index || 0) + 1);
        }
    })
});
