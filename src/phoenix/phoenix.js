DefineModule('phoenix/game', function (require) {
    var GameObject = require('models/game-object');
    var LevelManager = require('phoenix/level-manager');
    var Bullet = require('phoenix/bullet');
    var Player = require('phoenix/player');

    var Phoenix = DefineClass(GameObject, {
        FILL_COLOR: "#020031",
        constructor: function (gameDimensions) {
            this.super('constructor');

            this.width = gameDimensions.width;
            this.height = gameDimensions.height;

            this.levelManager = new LevelManager(this);
            this.player = new Player(this);

            this.addChild(this.levelManager);
            this.addChild(this.player);

            this.levelManager.startLevel();
        },
        spawnBullet: function (position, velocity, acceleration) {
            this.addChild(new Bullet(this, position, velocity, acceleration));
        }
    });

    return function (gameDimensions) {
        return new Phoenix(gameDimensions);
    };
});
