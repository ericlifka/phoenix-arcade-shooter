DefineModule('phoenix/levels/level-group-01', function (require) {
    var Banner = require('components/fadeout-banner');
    var EnemyShip = require('phoenix/enemy-ship');
    var FlyPlayerInFromBottom = require('phoenix/scripts/fly-player-in-from-bottom');
    var GameObject = require('models/game-object');
    var MoveObjectToPoint = require('phoenix/scripts/move-object-to-point');
    var ScriptChain = require('models/script-chain');

    return DefineClass(GameObject, {
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.ships = [ ];
        },
        start: function () {
            var game = this.game;

            for (var i = 1; i <= 10; i++) {
                this.newShip(10 * i + 39, -20, 60, 3);
                this.newShip(10 * i + 39, -30, 50, 3);
                this.newShip(10 * i + 39, -40, 40, 3);
            }

            this.addChild(new FlyPlayerInFromBottom(this, game));
            this.addChild(new Banner(this, "LEVEL 1", 2000));

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

            this.addChild(new ScriptChain(this, false, [
                new MoveObjectToPoint(null, ship, { x: startX, y: endY }, time * 2),
                new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY }, time),
                new ScriptChain(this, true, [
                    new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY - 30 }, time),
                    new MoveObjectToPoint(null, ship, { x: startX + 40, y: endY - 30 }, time * 2),
                    new MoveObjectToPoint(null, ship, { x: startX + 40, y: endY }, time),
                    new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY }, time * 2)
                ])
            ]));
            this.ships.push(ship);
        }
    });
});
