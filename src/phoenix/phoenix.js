DefineModule('phoenix/game', function (require) {
    var GameObject = require('models/game-object');
    var LevelManager = require('phoenix/level-manager');
    var Bullet = require('phoenix/bullet');
    var PlayerShip = require('phoenix/player-controlled-ship');
    var Collisions = require('helpers/collisions');

    return DefineClass(GameObject, {
        FILL_COLOR: "#020031",
        constructor: function (gameDimensions) {
            this.super('constructor');

            this.width = gameDimensions.width;
            this.height = gameDimensions.height;

            this.levelManager = new LevelManager(this);
            this.player = new PlayerShip(this);

            this.addChild(this.levelManager);
            this.addChild(this.player);

            this.levelManager.startLevel();
        },
        spawnBullet: function (position, velocity, acceleration) {
            this.addChild(new Bullet(this, position, velocity, acceleration));
        },
        despawnBullet: function (bullet) {
            this.removeChild(bullet);
        },
        update: function (dtime) {
            this.super('update', arguments);
            this.checkCollisions();
        },
        checkCollisions: function () {
            var physicalEntities = this.children.filter(function (child) {
                return child.position && child.sprite;
            });

            var collisions = [ ];
            physicalEntities.forEach(function (entity) {
                physicalEntities.forEach(function (otherEntity) {
                    if (entity === otherEntity) {
                        return;
                    }

                    if (Collisions.boxCollision(entity, otherEntity)) {
                        collisions.push([entity, otherEntity]);
                    }
                });
            });

            collisions.forEach(function (entityPair) {
                if (Collisions.spriteCollision(entityPair[0], entityPair[1])) {
                    /* figure out what the fuck to do with this */

                    entityPair[0].destroyed = true;
                    entityPair[1].destroyed = true;

                    this.removeChild(entityPair[0]);
                    this.removeChild(entityPair[1]);
                }
            }.bind(this));
        }
    });
});
