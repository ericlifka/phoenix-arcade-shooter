DefineModule('models/phoenix', function (require) {
    var collectEntities = require('helpers/collect-entities');
    var Collisions = require('helpers/collisions');
    var ComboGauge = require('components/combo-gauge');
    var ControlsScreen = require('screens/controls-description');
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var GameOverScreen = require('screens/game-over-screen');
    var GameWonScreen = require('screens/game-won-screen');
    var InputInterpreter = require('helpers/input-interpreter');
    var LevelManager = require('levels/level-manager');
    var LifeMeter = require('components/life-meter');
    var PlayerShip = require('ships/player-controlled-ship');
    var TextDisplay = require('components/text-display');
    var TitleScreen = require('screens/title-screen');

    return DefineClass(GameObject, {
        FILL_COLOR: "#000031",
        interfaceColor: "#ffd",

        constructor: function (gameDimensions) {
            this.width = gameDimensions.width;
            this.height = gameDimensions.height;

            this.controlsScreen = new ControlsScreen(this);
            this.titleScreen = new TitleScreen(this);
            this.gameOverScreen = new GameOverScreen(this);
            this.gameWonScreen = new GameWonScreen(this);
            this.inputInterpreter = new InputInterpreter();
            this.levelManager = new LevelManager(this);
            this.player = new PlayerShip(this);

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
                position: { x: this.width - 7, y: this.height - 63 },
                length: 60,
                width: 4,
                showBorder: true,
                borderColor: this.interfaceColor
            });

            this.super('constructor');
        },
        reset: function () {
            this.super('reset');

            this.gameOver = false;
            this.paused = false;

            this.comboGauge.reset();
            this.lifeMeter.reset();
            this.titleScreen.reset();
            this.gameOverScreen.reset();
            this.gameWonScreen.reset();
            this.levelManager.reset();
            this.player.reset();

            this.addChild(this.player);
            this.addChild(this.levelManager);
            this.addChild(this.titleScreen);
            this.addChild(this.pauseInputTracker);
        },
        startNewGame: function () {

            this.addChild(this.comboGauge);
            this.addChild(this.lifeMeter);

            this.levelManager.start();
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
            if (this.levelManager.running && !this.paused && !this.gameOver) {
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
                    a.applyDamage(b.damage);
                    b.applyDamage(a.damage);
                }
            });
        },
        checkGameOver: function () {
            if (this.player.destroyed && !this.gameOver) {
                this.gameOver = true;
                this.gameOverScreen.setResult("loss");
                this.gameOverScreen.setFinalScore(this.comboGauge.getScore());
                this.removeChild(this.player);
                this.addChild(this.gameOverScreen);
            }
            if (this.levelManager.complete && !this.gameOver) {
                this.gameOver = true;
                this.gameOverScreen.setResult("win");
                this.gameOverScreen.setFinalScore(this.comboGauge.getScore());
                this.removeChild(this.player);
                this.addChild(this.gameOverScreen);
            }
        },
        enemyDestroyed: function (data) {
            this.comboGauge.addPoints(data.shipValue);
        },
        enemyHit: function () {
            this.comboGauge.bumpCombo();
        },
        playerHit: function () {
            this.comboGauge.clearCombo();
        }
    });
});
