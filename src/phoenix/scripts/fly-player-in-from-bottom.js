DefineModule('phoenix/scripts/fly-player-in-from-bottom', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.player = game.player;
        },
        start: function () {
            this.player.preventInputControl = true;

            var position = this.player.position;
            var velocity = this.player.velocity;

            position.x = Math.floor(this.game.width / 2 - this.player.sprite.width / 2);
            position.y = this.game.height + 30;
            velocity.x = 0;
            velocity.y = -this.player.SPEED / 5;
        },
        update: function (dtime) {
            this.super('update', arguments);

            if (this.player.position.y < this.game.height - this.player.sprite.height - 2) {
                this.player.preventInputControl = false;
                this.parent.removeChild(this);
            }
        }
    });
});
