DefineModule('phoenix/level-manager', function (require) {
    var GameObject = require('models/game-object');
    var EnemyShip = require('phoenix/enemy-ship');

    var FlyPlayerInFromBottom = DefineClass(GameObject, {
        TIME_STEP: 100,
        ELAPSED: 0,
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.player = game.player;
        },
        start: function () {
            this.player.preventInputControl = true;

            this.setStartingPosition();
        },
        update: function (dtime) {
            this.super('update', arguments);

            if (this.player.position.y < this.game.height - this.player.sprite.height - 2) {
                this.player.preventInputControl = false;
                this.parent.signalScriptFinished(this);
            }
        },
        setStartingPosition: function () {
            var position = this.player.position;
            var velocity = this.player.velocity;

            position.x = Math.floor(this.game.width / 2 - this.player.sprite.width / 2);
            position.y = this.game.height + 2;
            velocity.x = 0;
            velocity.y = -this.player.SPEED / 5;
        }
    });

    var MoveObjectToPoint = DefineClass(GameObject, {
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
        },
        update: function (dtime) {
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
            }
        }
    });

    var LevelOneEnemies = DefineClass(GameObject, {
        speed: 10,
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.ships = [];

            for (var i = 0; i < 10; i++) {
                var ship = new EnemyShip(game);
                ship.position.x = 10 * (i + 1);
                ship.position.y = -20;
                
                this.addChild(new MoveObjectToPoint(game, ship, {
                    x: ship.position.x,
                    y: 20
                }, 2));
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
