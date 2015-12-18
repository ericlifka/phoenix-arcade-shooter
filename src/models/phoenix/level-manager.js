(function () {

    var FlyPlayerInFromBottom = DefineClass(GameObject, {
        TIME_STEP: 100,
        ELAPSED: 0,
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.player = game.player;
        },
        start: function () {
            this.player.processUpdates = false;

            this.setStartingPosition();
        },
        update: function (dtime) {
            this.super('update', arguments);

            this.ELAPSED += dtime;
            if (this.ELAPSED > this.TIME_STEP) {
                this.player.position.y--;
                this.ELAPSED = 0;
            }

            if (this.player.position.y < this.game.height - this.player.sprite.height - 2) {
                this.player.processUpdates = true;
                this.parent.removeChild(this);
            }
        },
        setStartingPosition: function () {
            var position = this.player.position;
            var velocity = this.player.velocity;

            position.x = Math.floor(this.game.width / 2 - this.player.sprite.width / 2);
            position.y = this.game.height;
            velocity.x = 0;
            velocity.y = 0;
        },
    });

    window.PhoenixLevelManager = DefineClass(GameObject, {
        levels: [
            {

            }
        ],
        constructor: function (game) {
            this.super('constructor', arguments);

            this.game = game;
            this.nextLevel = 0;
        },
        startLevel: function () {
            this.currentLevel = this.levels[ this.nextLevel ];
            this.nextLevel++;

            this.children.push(new FlyPlayerInFromBottom(this, this.game));

            this.children.forEach(function (script) {
                script.start();
            });
        }
    });
}());
