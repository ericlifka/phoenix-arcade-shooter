DefineModule('phoenix/level-manager', function (require) {
    var GameObject = require('models/game-object');
    var EnemyShip = require('phoenix/enemy-ship');
    var FlyPlayerInFromBottom = require('phoenix/scripts/fly-player-in-from-bottom');

    var MoveObjectToPoint = DefineClass(GameObject, {
        active: false,
        constructor: function (parent, object, targetPoint, timeDelta) {
            this.super('constructor', arguments);

            this.object = object;
            this.target = targetPoint;
            this.delta = timeDelta;
        },
        start: function () {
            var current = this.object.position;

            var xDiff = this.target.x - current.x;
            var yDiff = this.target.y - current.y;

            this.object.velocity.x = xDiff / this.delta;
            this.object.velocity.y = yDiff / this.delta;

            this.xPositive = xDiff > 0;
            this.yPositive = yDiff > 0;

            this.active = true;
        },
        update: function (dtime) {
            if (!this.active) {
                return;
            }

            this.super('update', arguments);

            var xPositive = this.xPositive;
            var yPositive = this.yPositive;
            var position = this.object.position;
            var target = this.target;

            if (xPositive && position.x > target.x ||
                !xPositive && position.x < target.x ||
                yPositive && position.y > target.y ||
                !yPositive && position.y < target.y)
            {
                this.object.velocity.x = 0;
                this.object.velocity.y = 0;

                this.active = false;
            }
        }
    });

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
