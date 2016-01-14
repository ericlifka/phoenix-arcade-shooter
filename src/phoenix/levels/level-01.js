DefineModule('phoenix/levels/level-01', function (require) {
    var Banner = require('components/fadeout-banner');
    var EnemyShip = require('phoenix/enemy-ship');
    var FlyPlayerInFromBottom = require('phoenix/scripts/fly-player-in-from-bottom');
    var GameObject = require('models/game-object');
    var MoveObjectToPoint = require('phoenix/scripts/move-object-to-point');

    return DefineClass(GameObject, {
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.ships = [];

            for (var i = 1; i <= 10; i++) {
                this.newShip(10 * i + 39, -20, 30, 2);
                this.newShip(10 * i + 39, -30, 20, 3);
                this.newShip(10 * i + 39, -40, 10, 4);
            }

            this.addChild(new FlyPlayerInFromBottom(this, this.game));
            this.addChild(new Banner(this, "LEVEL 1", 2000));
        },
        start: function () {
            var game = this.game;
            this.ships.forEach(function (ship) {
                game.addChild(ship);
            });

            this.children.forEach(function (script) {
                script.start();
            });
        },
        checkIfLevelComplete: function () {
            var remainingShips = this.ships.filter(function (ship) {
                return !ship.destroyed;
            });

            return remainingShips.length === 0;
        },
        newShip: function (startX, startY, endY, time) {
            var ship = new EnemyShip(this.game);

            ship.position.x = startX;
            ship.position.y = startY;

            this.addChild(new MoveObjectToPoint(this, ship, { x: startX, y: endY }, time));
            this.ships.push(ship);
        }
    });
});
