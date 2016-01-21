DefineModule('phoenix/levels/level-group-01', function (require) {
    var Banner = require('components/fadeout-banner');
    var BossShip = require('phoenix/ships/arrow-boss');
    var ChainGunFire = require('phoenix/scripts/chain-gun-fire');
    var EnemyShip = require('phoenix/ships/arrow-ship');
    var FireSingleGunRandomRate = require('phoenix/scripts/fire-single-gun-random-rate');
    var GameObject = require('models/game-object');
    var MoveObjectToPoint = require('phoenix/scripts/move-object-to-point');
    var ScriptChain = require('models/script-chain');

    return DefineClass(GameObject, {
        constructor: function (parent, game, rowCount, levelName) {
            this.super('constructor', arguments);

            if (rowCount === "boss") {
                rowCount = 1;
                this.boss = true;
            }

            this.game = game;
            this.levelName = levelName;
            this.rowCount = rowCount;

            this.ships = [];
        },
        start: function () {
            var game = this.game;

            for (var i = 1; i <= 10; i++) {
                this.newShip(10 * i + 39, -40, 45, 3);

                if (this.rowCount >= 2) {
                    this.newShip(10 * i + 39, -30, 55, 3);
                }

                if (this.rowCount >= 3) {
                    this.newShip(10 * i + 39, -20, 65, 3);
                }
            }

            if (this.boss) {
                this.newBossShip();
            }

            if (this.levelName) {
                this.addChild(new Banner(this, this.levelName, 2000));
            }

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

            this.addChild(new FireSingleGunRandomRate(this, ship));
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
        },
        newBossShip: function () {
            var boss = window.boss = new BossShip(this.game);
            var gameWidth = this.game.width;
            var bossWidth = boss.sprite.width;

            boss.position.x = -this.game.width / 2;
            boss.position.y = 1;

            this.addChild(new FireSingleGunRandomRate(this, boss, 0));
            this.addChild(new FireSingleGunRandomRate(this, boss, 2));
            this.addChild(new ChainGunFire(this, boss, 1));

            this.addChild(new ScriptChain(this, true, [
                new MoveObjectToPoint(null, boss, { x: 1, y: 1 }, 8),
                new MoveObjectToPoint(null, boss, { x: gameWidth - bossWidth - 5, y: 1 }, 8)
            ]));

            this.ships.push(boss);
        }
    });
});
