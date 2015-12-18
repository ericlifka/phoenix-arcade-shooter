(function () {

    var FlyPlayerInFromBottom = DefineClass({
        constructor: function (game) {
            this.game = game;
            this.player = game.player;
        },
        start: function () {

        },
        update: function (dtime) {

        }
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
        }
    });
}());
