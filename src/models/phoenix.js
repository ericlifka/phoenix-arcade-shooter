DefineModule('models/phoenix', function (require) {
    var Bank = require('components/bank');
    var Bullet = require('components/bullet');
    var collectEntities = require('helpers/collect-entities');
    var Collisions = require('helpers/collisions');
    var ComboGauge = require('components/combo-gauge');
    var ControlsScreen = require('screens/controls-description');
    var EmbeddedTitleScreen = require('screens/embedded-title-screen');
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var GameOverScreen = require('screens/game-over-screen');
    var InputInterpreter = require('helpers/input-interpreter');
    var LevelManager = require('levels/level-manager');
    var LifeMeter = require('components/life-meter');
    var PlayerShip = require('ships/player-controlled-ship');
    var TextDisplay = require('components/text-display');
    var TitleScreen = require('screens/title-screen');

    return DefineClass(GameObject, {
        FILL_COLOR: "#000031",
        interfaceColor: "#ffd",

        constructor: function (options) {
            this.embedded = !!options.embedded;
            this.width = options.width;
            this.height = options.height;

            //this.titleScreen = this.embedded ?
            //    new EmbeddedTitleScreen(this) :
            //    new TitleScreen(this);
            this.titleScreen = new EmbeddedTitleScreen(this);

            this.controlsScreen = new ControlsScreen(this);
            this.gameOverScreen = new GameOverScreen(this);
            this.player = new PlayerShip(this);
            this.inputInterpreter = new InputInterpreter();

            this.pauseInputTracker = new EventedInput({
                onStart: this.togglePause.bind(this)
            });

            this.pausedText = new TextDisplay(this, {
                font: "arcade",
                message: "PAUSE",
                color: "yellow",
                position: { x: 82, y: 70 }
            });

            this.comboGauge = new ComboGauge(this, {
                position: { x: 1, y: this.height - 68 },
                color: this.interfaceColor
            });
            this.lifeMeter = new LifeMeter(this.player, {
                scale: 2,
                width: 4,
                anchor: { right: this.width - 1, bottom: this.height - 7 },
                showBorder: true,
                borderColor: this.interfaceColor
            });
            this.bank = new Bank(this, {
                position: { x: this.width, y: this.height - 6 },
                color: this.interfaceColor
            });

            // the level manager reaches into all sorts of places, so it needs to be created last
            this.levelManager = new LevelManager(this);

            this.super('constructor');
        },
        reset: function () {
            this.super('reset');

            this.gameOver = false;
            this.paused = false;

            this.bank.reset();
            this.comboGauge.reset();
            this.lifeMeter.reset();
            this.titleScreen.reset();
            this.gameOverScreen.reset();
            this.levelManager.reset();
            this.player.reset();

            this.addChild(this.player);
            this.addChild(this.levelManager);
            this.addChild(this.titleScreen);
            this.addChild(this.pauseInputTracker);
        },
        clearBullets: function () {
            this.children
                .filter(function (entity) { return entity.type === "bullet" })
                .forEach(function (bullet) { this.removeChild(bullet) }.bind(this));
        },
        startNewGame: function () {
            this.addChild(this.bank);
            this.addChild(this.comboGauge);
            this.addChild(this.lifeMeter);

            this.levelManager.start();
        },
        finishGame: function () {
            if (this.gameOverCallback) {
                this.gameOverCallback({
                    score: this.comboGauge.getScore(),
                    level: this.levelManager.levelNameCounter
                });
                this.destroy();
            }
            else {
                this.reset();
            }
        },
        showControlsScreen: function () {
            this.addChild(this.controlsScreen);
        },
        processInput: function (rawInput) {
            this.super('processInput', [ this.inputInterpreter.interpret(rawInput) ]);
        },
        update: function (dtime) {
            if (!this.paused) {
                this.super('update', arguments);

                this.checkCollisions();
                this.checkGameOver();
            }
        },
        togglePause: function () {
            if (this.paused) {
                this.unpause();
            }
            else {
                this.pause();
            }
        },
        pause: function () {
            if (this.levelManager.running && !this.paused && !this.gameOver && !this.levelManager.currentLevel.isShop) {
                this.paused = true;
                this.addChild(this.pausedText);
            }
        },
        unpause: function () {
            this.paused = false;
            this.removeChild(this.pausedText);
        },
        checkCollisions: function () {
            var physicalEntities = collectEntities(this, this.physicalEntityMatcher);
            var collisionPairs = this.findBoxCollisions(physicalEntities);
            this.checkPairsForCollision(collisionPairs);
        },
        physicalEntityMatcher: function (entity) {
            return entity.isPhysicalEntity && !entity.exploding;
        },
        findBoxCollisions: function (entities) {
            var collisionPairs = [];

            for (var i = 0; i < entities.length - 1; i++) {
                var outer = entities[ i ];

                for (var j = i + 1; j < entities.length; j++) {
                    var inner = entities[ j ];

                    if ((outer.type === "pickup" || inner.type === "pickup") &&
                        !(outer.type === "player" || inner.type === "player")) {
                        // When one of the entities is a pickup item such as money then the only collide-able targets
                        // are player entities, so all other collisions get eliminated.
                        continue;
                    }

                    if (outer.team !== inner.team && Collisions.boxCollision(outer, inner)) {
                        collisionPairs.push([ outer, inner ]);
                    }
                }
            }

            return collisionPairs;
        },
        checkPairsForCollision: function (pairs) {
            pairs.forEach(function (pair) {
                var a = pair[ 0 ];
                var b = pair[ 1 ];

                if (Collisions.spriteCollision(a, b)) {
                    a.applyDamage(b.damage, b);
                    b.applyDamage(a.damage, a);
                }
            });
        },
        checkGameOver: function () {
            var gameResult = this.player.destroyed ? "loss" :
                this.levelManager.complete ? "win" :
                    null;

            if (gameResult && !this.gameOver) {
                this.gameOver = true;
                this.gameOverScreen.setResult(gameResult);
                this.gameOverScreen.setFinalScore(this.comboGauge.getScore());

                this.removeChild(this.player);
                this.addChild(this.gameOverScreen);
            }
        },
        spawnBullet: function (data) {
            this.addChild(new Bullet(this, data));
        },
        enemyDestroyed: function (data) {
            this.comboGauge.addPoints(data.shipValue);
        },
        enemyHit: function () {
            this.comboGauge.bumpCombo();
        },
        playerHit: function () {
            this.comboGauge.clearCombo();
        },
        moneyCollected: function (value) {
            this.bank.addMoney(value);
        }
    });
});
