DefineModule('levels/level-group-01', function (require) {
    var Banner = require('components/fadeout-banner');
    var BossShip = require('ships/arrow-boss');
    var ChainGunFire = require('scripts/chain-gun-fire');
    var EnemyShip = require('ships/arrow-ship');
    var FireSingleGunRandomRate = require('scripts/fire-single-gun-random-rate');
    var GameObject = require('models/game-object');
    var LifeMeter = require('components/life-meter');
    var MoneyDrop = require('components/money-drop');
    var MoveObjectToPoint = require('scripts/move-object-to-point');
    var ScriptChain = require('models/script-chain');
    var WatchForDeath = require('scripts/watch-for-death');

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
        },
        start: function () {
            this.ships = [];
            this.scripts = [];

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
                this.scripts.push(new Banner(this, this.levelName, 2000));
            }

            this.ships.forEach(function (ship) {
                this.addChild(ship);
            }.bind(this));

            this.scripts.forEach(function (script) {
                script.start();
                this.addChild(script);
            }.bind(this));
        },
        checkIfLevelComplete: function () {
            var remainingShips = this.ships.filter(function (ship) {
                return !ship.destroyed;
            });

            return remainingShips.length === 0;
        },
        newShip: function (startX, startY, endY, time) {
            var ship = new EnemyShip(this);

            ship.position.x = startX;
            ship.position.y = startY;

            this.scripts.push(new FireSingleGunRandomRate(this, ship));
            this.scripts.push(new ScriptChain(this, false, [
                new MoveObjectToPoint(null, ship, { x: startX, y: endY }, time * 2),
                new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY }, time),
                new ScriptChain(this, true, [
                    new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY - 30 }, time),
                    new MoveObjectToPoint(null, ship, { x: startX + 40, y: endY - 30 }, time * 2),
                    new MoveObjectToPoint(null, ship, { x: startX + 40, y: endY }, time),
                    new MoveObjectToPoint(null, ship, { x: startX - 40, y: endY }, time * 2)
                ])
            ]));
            this.scripts.push(new WatchForDeath(this, ship, function () {
                this.spawnMoneyDrop(ship.position);
            }.bind(this)));
            this.ships.push(ship);
        },
        newBossShip: function () {
            var boss = window.boss = new BossShip(this);
            var gameWidth = this.game.width;
            var bossWidth = boss.sprite.width;

            boss.position.x = -this.game.width / 2;
            boss.position.y = 1;

            boss.addChild(new LifeMeter(boss, {
                position: { x: 0, y: 0 },
                length: this.game.width,
                width: 1,
                horizontal: true
            }));

            this.scripts.push(new FireSingleGunRandomRate(this, boss, { gunIndex: 0 }));
            this.scripts.push(new FireSingleGunRandomRate(this, boss, { gunIndex: 2 }));
            this.scripts.push(new ChainGunFire(this, boss, { gunIndex: 1 }));

            this.scripts.push(new ScriptChain(this, true, [
                new MoveObjectToPoint(null, boss, { x: 1, y: 1 }, 8),
                new MoveObjectToPoint(null, boss, { x: gameWidth - bossWidth - 5, y: 1 }, 8)
            ]));

            this.ships.push(boss);
        },
        spawnMoneyDrop: function (position) {
            this.addChild(new MoneyDrop(this, position));
        }
    });
});
