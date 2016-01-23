DefineModule('phoenix/game', function (require) {
    var Bullet = require('phoenix/bullet');
    var Collisions = require('helpers/collisions');
    var GameObject = require('models/game-object');
    var GameOverScreen = require('phoenix/game-over-screen');
    var GameWonScreen = require('phoenix/game-won-screen');
    var InputInterpreter = require('phoenix/input-interpreter');
    var LevelManager = require('phoenix/level-manager');
    var LifeMeter = require('components/life-meter');
    var PlayerShip = require('phoenix/ships/player-controlled-ship');
    var TextDisplay = require('components/text-display');
    var TitleScreen = require('phoenix/title-screen');

    return DefineClass(GameObject, {
        FILL_COLOR: "#000031",

        constructor: function (gameDimensions) {
            this.width = gameDimensions.width;
            this.height = gameDimensions.height;

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
            this.addChild(new LifeMeter(this.player, {
                position: { x: this.width - 5, y: 2 },
                length: 30,
                width: 1,
            }));

            this.levelManager.start();
        },
        spawnBullet: function (team, position, velocity, acceleration) {
            this.addChild(new Bullet(this, team, position, velocity, acceleration));
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
            if (this.levelManager.running) {
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
            var physicalEntities = this.children.filter(function (child) {
                return child.position && child.sprite && !child.exploding;
            });

            var collisionPairs = [];

            for (var i = 0; i < physicalEntities.length - 1; i++) {
                var outer = physicalEntities[ i ];

                for (var j = i + 1; j < physicalEntities.length; j++) {
                    var inner = physicalEntities[ j ];

                    if (outer.team !== inner.team && Collisions.boxCollision(outer, inner)) {
                        collisionPairs.push([ outer, inner ]);
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
