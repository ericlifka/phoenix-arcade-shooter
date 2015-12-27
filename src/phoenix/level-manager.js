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
            var target = this.target;
            var current = this.object.position;

            var xDiff = target.x - current.x;
            var yDiff = target.y - current.y;

            var xSpeed = xDiff / this.delta;
            var ySpeed = yDiff / this.delta;

            this.object.velocity.x = xSpeed;
            this.object.velocity.y = ySpeed;
        },
        update: function (dtime) {
            this.super('update', arguments);
        }
    });

    var LevelOneEnemies = DefineClass(GameObject, {
        speed: 10,
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.ship = new EnemyShip(game);

            this.ship.position.x =  Math.floor(this.game.width / 2);
            this.ship.position.y = -20;
            this.helper = new MoveObjectToPoint(game, this.ship, {x:this.ship.position.x, y:this.ship.position.y + 40}, 2);
        },
        start: function () {
            this.helper.start();
            //
            // this.ship.velocity.y = this.speed;

            this.addChild(this.helper);
            this.game.addChild(this.ship);
        },
        // update: function (dtime) {
        //     this.super('update', arguments);
        //
        //     if (this.ship.position.y > 20) {
        //         this.ship.velocity.y = 0;
        //         this.parent.signalScriptFinished(this);
        //     }
        // }
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
