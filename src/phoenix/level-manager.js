DefineModule('phoenix/level-manager', function (require) {
    var GameObject = require('models/game-object');
    var EnemyShip = require('phoenix/enemy-ship');
    var FlyPlayerInFromBottom = require('phoenix/scripts/fly-player-in-from-bottom');

    var MoveObjectToPoint = require('phoenix/scripts/move-object-to-point');

    var LevelOneEnemies = DefineClass(GameObject, {
        speed: 10,
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.ships = [];

            for (var i = 1; i <= 10; i++) {
                var ship = new EnemyShip(game);
                ship.position.x = 10 * i;
                ship.position.y = -20 * i;

                this.addChild(new MoveObjectToPoint(game, ship, {
                    x: ship.position.x,
                    y: 20
                }, 2 + i * .5));
                this.ships.push(ship);
            }
        },
        start: function () {
            var game = this.game;
            this.ships.forEach(function (ship) {
                game.addChild(ship);
            });

            this.children.forEach(function (script) {
                script.start();
            });
        }
    });

    return DefineClass(GameObject, {
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
            this.children.push(new LevelOneEnemies(this, this.game));

            this.children.forEach(function (script) {
                script.active = true;
                script.start();
            });
        },
        signalScriptFinished: function (script) {
            script.active = false;
            this.removeChild(script);
        }
    });
});
