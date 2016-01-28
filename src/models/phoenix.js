DefineModule('models/phoenix', function (require) {
    var collectEntities = require('helpers/collect-entities');
    var Collisions = require('helpers/collisions');
    var ComboGauge = require('components/combo-gauge');
    var ControlsScreen = require('screens/controls-description');
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

            this.pausedText = new TextDisplay(this, {
                font: "arcade",
                message: "PAUSE",
                color: "yellow",
                position: { x: 82, y: 70 }
            });

            this.super('constructor');
        },
        reset: function () {
            this.super('reset');

            this.gameOver = false;
            this.paused = false;
            this.unpressedMenuSelect = false;

            this.titleScreen.reset();
            this.gameOverScreen.reset();
            this.gameWonScreen.reset();
            this.levelManager.reset();
            this.player.reset();

            this.addChild(this.player);
            this.addChild(this.levelManager);
            this.addChild(this.titleScreen);
        },
        startNewGame: function () {
            this.addChild(new ComboGauge(this, {
                position: { x: 1, y: this.height - 75 }
            }));
            this.addChild(new LifeMeter(this.player, {
                position: { x: this.width - 2, y: this.height - 21 },
                length: 20,
                width: 1
            }));

            this.levelManager.start();
        },
        showControlsScreen: function () {
            this.addChild(this.controlsScreen);
        },
        processInput: function (rawInput) {
            var input = this.inputInterpreter.interpret(rawInput);

            this.checkPauseState(input);

            this.super('processInput', [ input ]);
        },
        update: function (dtime) {
            if (!this.paused) {
                this.super('update', arguments);

                this.checkCollisions();
                this.checkGameOver();
            }
        },
        checkPauseState: function (input) {
            if (!this.levelManager.running) {
                return;
            }

            if (input.menuSelect && this.unpressedMenuSelect) {
                if (this.paused) {
                    this.unpause();
                }
                else {
                    this.pause();
                }
            }
            else if (!input.menuSelect) {
                this.unpressedMenuSelect = true;
            }
        },
        pause: function () {
            if (this.levelManager.running && !this.paused) {
                this.paused = true;
                this.unpressedMenuSelect = false;
                this.addChild(this.pausedText);
            }
        },
        unpause: function () {
            this.paused = false;
            this.unpressedMenuSelect = false;
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
                this.addChild(this.gameOverScreen);
            }
            if (this.levelManager.complete && !this.gameOver) {
                this.gameOver = true;
                this.removeChild(this.player);
                this.addChild(this.gameWonScreen);
            }
        }
    });
});
