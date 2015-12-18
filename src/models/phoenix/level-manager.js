(function () {

    var FlyPlayerInFromBottom = DefineClass({
        constructor: function (game) {
            this.game = game;
            this.player = game.player;
        },
        start: function () {
            this.setStartingPosition();
        },
        update: function (dtime) {

        },
        setStartingPosition: function () {
            var position = this.player.position;
            var velocity = this.player.velocity;

            position.x = Math.floor(this.game.width / 2 - this.sprite.width / 2);
            position.y = this.game.height - this.sprite.height - 1;
            velocity.x = 0;
            velocity.y = 0;
        },
    });

    window.PhoenixLevelManager = DefineClass({
        levels: [
            {

            }
        ],
        constructor: function (game) {
            this.game = game;
            this.activeScripts = [ ];
            this.nextLevel = 0;
        },
        startLevel: function () {
            this.currentLevel = this.levels[ this.nextLevel ];
            this.nextLevel++;

            this.activeScripts.push(new FlyPlayerInFromBottom(this.game));

            this.activeScripts.forEach(function (script) {
                script.start();
            });
        },
        update: function (dtime) {
            this.activeScripts.forEach(function (script) {
                script.update(dtime);
            });
        }
    });
}());
