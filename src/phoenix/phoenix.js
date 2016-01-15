DefineModule('phoenix/game', function (require) {
    var Bullet = require('phoenix/bullet');
    var Collisions = require('helpers/collisions');
    var GameObject = require('models/game-object');
    var InputInterpreter = require('phoenix/input-interpreter');
    var LevelManager = require('phoenix/level-manager');
    var LifeDisplay = require('components/life-display');
    var PlayerShip = require('phoenix/ships/player-controlled-ship');

    return DefineClass(GameObject, {
        FILL_COLOR: "#000031",
        constructor: function (gameDimensions) {
            this.super('constructor');

            this.width = gameDimensions.width;
            this.height = gameDimensions.height;

            this.inputInterpreter = new InputInterpreter();
            this.levelManager = new LevelManager(this);
            this.player = new PlayerShip(this);

            this.addChild(this.levelManager);
            this.addChild(this.player);
            this.addChild(new LifeDisplay(this, this.player, {x: this.width-5, y: 2}));

            this.levelManager.start();
        },
        spawnBullet: function (team, position, velocity, acceleration) {
            this.addChild(new Bullet(this, team,  position, velocity, acceleration));
        },
        processInput: function (rawInput) {
            var input = this.inputInterpreter.interpret(rawInput);

            this.super('processInput', [ input ]);
        },
        update: function (dtime) {
            this.super('update', arguments);
            this.checkCollisions();
        },
        checkCollisions: function () {
            var physicalEntities = this.children.filter(function (child) {
                return child.position && child.sprite && !child.exploding;
            });

            var collisionPairs = [ ];

            for (var i = 0; i < physicalEntities.length - 1; i++) {
                var outer = physicalEntities[ i ];

                for (var j = i + 1; j < physicalEntities.length; j++) {
                    var inner = physicalEntities[ j ];

                    if (outer.team !== inner.team && Collisions.boxCollision(outer, inner)) {
                        collisionPairs.push([outer, inner]);
                    }
                }
            }

            collisionPairs.forEach(function (entityPair) {
                var a = entityPair[ 0 ];
                var b = entityPair[ 1 ];

                if (Collisions.spriteCollision(a, b)) {
                    a.applyDamage(b.damage);
                    b.applyDamage(a.damage);
                }
            });
        }
    });
});
