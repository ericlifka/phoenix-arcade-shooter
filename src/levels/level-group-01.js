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
    var Random = require('helpers/random');
    var WatchForDeath = require('scripts/watch-for-death');

    return DefineClass(GameObject, {
        constructor: function (parent, game, rowCount, levelName) {
            this.super('constructor', arguments);

            this.width = this.parent.width;
            this.height = this.parent.height;

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

            this.attachMoneyScripts();

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
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[ i ];
                if (child && child.position && !child.destroyed) {
                    return false;
                }
            }

            return true;
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
        attachMoneyScripts: function () {
            var count = this.ships.length / 5;
            var selectedShips = Random.sample(this.ships, count);

            selectedShips.forEach(function (ship) {
                this.scripts.push(new WatchForDeath(this, ship, function () {
                    this.addChild(new MoneyDrop(this, ship.position));
                }.bind(this)));
            }.bind(this));
        }
    });
});
