import Bank from '../components/bank.js';
import Bullet from '../components/bullet.js';
import collectEntities from '../helpers/collect-entities.js';
import { boxCollision, spriteCollision } from '../helpers/collisions.js';
import ComboGauge from '../components/combo-gauge.js';
import ControlsScreen from '../screens/controls-description.js';
import EmbeddedTitleScreen from '../screens/slim-title-screen.js';
import EventedInput from './evented-input.js';
import GameObject from './game-object.js';
import GameOverScreen from '../screens/game-over-screen.js';
import InputInterpreter from '../helpers/input-interpreter.js';
import LevelManager from '../levels/level-manager.js';
import LifeMeter from '../components/life-meter.js';
import PlayerShip from '../ships/player-controlled-ship.js';
import TextDisplay from '../components/text-display.js';
import TitleScreen from '../screens/title-screen.js';

export default class Phoenix extends GameObject {
    FILL_COLOR = "#000031";
    interfaceColor = "#ffd";

    constructor(options) {
        super(null);
        
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
        this.levelManager = new LevelManager(this, this);

        this.reset();
    }

    reset() {
        super.reset();

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
    }

    clearBullets() {
        this.children
            .filter(function (entity) { return entity.type === "bullet" })
            .forEach(function (bullet) { this.removeChild(bullet) }.bind(this));
    }

    startNewGame() {
        this.addChild(this.bank);
        this.addChild(this.comboGauge);
        this.addChild(this.lifeMeter);

        this.levelManager.start();
    }

    finishGame() {
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
    }

    showControlsScreen() {
        this.addChild(this.controlsScreen);
    }

    processInput(rawInput) {
        super.processInput(this.inputInterpreter.interpret(rawInput));
    }

    update(dtime) {
        if (!this.paused) {
            super.update(dtime);

            this.checkCollisions();
            this.checkGameOver();
        }
    }

    togglePause() {
        if (this.paused) {
            this.unpause();
        }
        else {
            this.pause();
        }
    }

    pause() {
        if (this.levelManager.running && !this.paused && !this.gameOver && !this.levelManager.currentLevel.isShop) {
            this.paused = true;
            this.addChild(this.pausedText);
        }
    }

    unpause() {
        this.paused = false;
        this.removeChild(this.pausedText);
    }

    checkCollisions() {
        const physicalEntities = collectEntities(this, this.physicalEntityMatcher);
        const collisionPairs = this.findBoxCollisions(physicalEntities);
        this.checkPairsForCollision(collisionPairs);
    }

    physicalEntityMatcher(entity) {
        return entity.isPhysicalEntity && !entity.exploding;
    }

    findBoxCollisions(entities) {
        const collisionPairs = [];

        for (let i = 0; i < entities.length - 1; i++) {
            const outer = entities[ i ];

            for (let j = i + 1; j < entities.length; j++) {
                const inner = entities[ j ];

                if ((outer.type === "pickup" || inner.type === "pickup") &&
                    !(outer.type === "player" || inner.type === "player")) {
                    // When one of the entities is a pickup item such as money then the only collide-able targets
                    // are player entities, so all other collisions get eliminated.
                    continue;
                }

                if (outer.team !== inner.team && boxCollision(outer, inner)) {
                    collisionPairs.push([ outer, inner ]);
                }
            }
        }

        return collisionPairs;
    }

    checkPairsForCollision(pairs) {
        pairs.forEach(function (pair) {
            const a = pair[ 0 ];
            const b = pair[ 1 ];

            if (spriteCollision(a, b)) {
                a.applyDamage(b.damage, b);
                b.applyDamage(a.damage, a);
            }
        });
    }

    checkGameOver() {
        const gameResult = this.player.destroyed ? "loss" :
            this.levelManager.complete ? "win" :
                null;

        if (gameResult && !this.gameOver) {
            this.gameOver = true;
            this.gameOverScreen.setResult(gameResult);
            this.gameOverScreen.setFinalScore(this.comboGauge.getScore());

            this.removeChild(this.player);
            this.addChild(this.gameOverScreen);
        }
    }

    spawnBullet(data) {
        this.addChild(new Bullet(this, data));
    }

    enemyDestroyed(data) {
        this.comboGauge.addPoints(data.shipValue);
    }

    enemyHit() {
        this.comboGauge.bumpCombo();
    }

    playerHit() {
        this.comboGauge.clearCombo();
    }

    moneyCollected(value) {
        this.bank.addMoney(value);
    }
}
