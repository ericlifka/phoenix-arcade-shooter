(function () {
var DefineClass;
var DefineModule;

(function () {
    var moduleDefinitions = {};
    var evaluatedModules = {};
    var evaluationStack = [];

    function require(moduleName) {
        if (evaluationStack.indexOf(moduleName) > -1) {
            throw "Circular dependencies not supported: " + moduleName
            + " required while still being evaluated";
        }

        var module = evaluatedModules[ moduleName ];
        if (module) {
            return module;
        }

        var moduleDefinition = moduleDefinitions[ moduleName ];
        if (moduleDefinition) {
            evaluationStack.push(moduleName);
            module = evaluatedModules[ moduleName ] = moduleDefinition(require);
            evaluationStack.pop();

            return module;
        }
        else {
            throw "No module found: " + moduleName;
        }
    }

    function mixIn(_class, properties) {
        Object.keys(properties).forEach(function (key) {
            _class.prototype[ key ] = properties[ key ];
        });
    }

    DefineClass = function (Base, definition) {
        if (typeof Base === "object" && !definition) {
            definition = Base;
            Base = function () {
            };
        }

        function Constructor() {
            if (typeof this.constructor === "function") {
                this.constructor.apply(this, arguments);
            }
        }

        Constructor.prototype = new Base();
        mixIn(Constructor, definition);
        mixIn(Constructor, {
            super: function (name, args) {
                // WARNING: this is known to only work for one level of base class
                // if the base class has a parent and uses a super call it won't work
                if (typeof Base.prototype[ name ] === "function") {
                    Base.prototype[ name ].apply(this, args);
                }
            }
        });

        return Constructor;
    };

    DefineModule = function (moduleName, moduleDefinition) {
        if (moduleDefinitions[ moduleName ]) {
            throw "Duplicate module definition: " + moduleName;
        }

        moduleDefinitions[ moduleName ] = moduleDefinition;
    };

    window.addEventListener('load', function () {
        require('main');
    });

}());

DefineModule('main', function (require) {
    var CanvasRenderer = require('views/canvas-renderer');
    var GamepadController = require('controllers/gamepad-input');
    var KeyboardController = require('controllers/keyboard-input');
    var Phoenix = require('models/phoenix');
    var RunLoop = require('helpers/run-loop');
    //var WebGLRenderer = require('views/webgl-renderer');

    var gameDimensions = { width: 200, height: 150 };
    var gamepadInput = new GamepadController();
    var keyboardInput = new KeyboardController();

    var phoenix = new Phoenix(gameDimensions);
    var renderer = new CanvasRenderer(gameDimensions);
    var runLoop = new RunLoop();

    renderer.setFillColor(phoenix.FILL_COLOR);

    runLoop.addCallback(function (dtime) {
        phoenix.processInput([
            keyboardInput.getInputState(),
            gamepadInput.getInputState()
        ]);

        phoenix.update(dtime);

        var frame = renderer.newRenderFrame();
        frame.clear();
        phoenix.renderToFrame(frame);

        renderer.renderFrame(frame);
    });

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            phoenix.pause();
        }
    });

    window.addEventListener("blur", function () {
        phoenix.pause();
    });

    window.addEventListener("focus", function () {
        keyboardInput.clearState();
        gamepadInput.clearState();
    });

    runLoop.start();
    window.activeGame = phoenix;
});

DefineModule('components/bank', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        index: 1,

        constructor: function (parent, options) {
            options = options || { };
            this.anchorPoint = options.position; // this text expands from the right, so the position has to be dynamic
            this.position = { x: 0, y: this.anchorPoint.y };
            this.color = options.color || "#ffffff";

            this.valueDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: this.color,
                index: 1,
                position: { x: this.position.x, y: this.position.y }
            });

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.addChild(this.valueDisplay);
            this.value = 0;
            this.updateDisplay();
        },
        addMoney: function (value) {
            this.value += value;
            this.updateDisplay();
        },
        removeMoney: function (amount) {
            this.value -= amount;
            this.updateDisplay();
        },
        updateDisplay: function () {
            this.valueDisplay.changeMessage("$" + this.value + ".0");
            var width = this.valueDisplay.width;
            this.position.x = this.valueDisplay.position.x = this.anchorPoint.x - width;
        }
    });
});

DefineModule('components/bullet', function (require) {
    var GameObject = require('models/game-object');
    var bulletSprite = require('sprites/bullet');
    var smallExplosion = require('sprites/animations/small-explosion');

    return DefineClass(GameObject, {
        type: "bullet",
        isPhysicalEntity: true,
        index: 5,

        constructor: function (parent, options) {
            this.super('constructor', arguments);

            options = options || { };
            this.team = options.team || 0;
            this.position = options.position || { x: 0, y: 0 };
            this.velocity = options.velocity || { x: 0, y: 0 };
            this.acceleration = options.acceleration || { x: 0, y: 0 };
            this.damage = options.damage || 1;
            this.life = options.life || 0;
            this.maxLife = options.maxLife || 1;

            this.sprite = bulletSprite();
            this.explosion = smallExplosion;

            this.updateBulletDirection();
            this.updateColor();
        },
        checkBoundaries: function () {
            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x > this.parent.width
                || this.position.y > this.parent.height) {

                this.destroy();
            }
        },
        updateBulletDirection: function () {
            if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y)) {
                this.sprite.rotateRight();
            }
        },
        updateColor: function () {
            switch (this.team) {
                case 0: this.sprite.applyColor("#B1D8AD"); break;
                case 1: this.sprite.applyColor("#F7BEBE"); break;
                default: break;
            }
        },
        applyDamage: function (damage) {
            this.super('applyDamage', arguments);

            this.position.x -= Math.floor(this.sprite.width / 2);
            this.position.y -= Math.floor(this.sprite.height / 2);
        }
    });
});

DefineModule('components/combo-gauge', function (require) {
    var GameObject = require('models/game-object');
    var Gradients = require('helpers/gradients');
    var frameSprite = require('sprites/combo-gauge');
    var padScoreDisplay = require('helpers/pad-score-display');
    var Sprite = require('models/sprite');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        index: 1,

        constructor: function (parent, options) {
            this.position = options.position;
            this.color = options.color || "#ffffff";
            this.sprite = frameSprite().applyColor(this.color);

            this.multiplierDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: this.color,
                index: 1,
                position: { x: this.position.x + 7, y: this.position.y + this.sprite.height - 5 }
            });
            this.scoreDisplay = new TextDisplay(this, {
                font: "arcade-small",
                color: this.color,
                index: 1,
                position: { x: this.position.x, y: this.position.y + this.sprite.height + 1 }
            });

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.comboPoints = 0;
            this.pointTotal = 0;

            this.updateMultiplier();
            this.updateGaugeHeight();
            this.updateScore();

            this.addChild(this.multiplierDisplay);
            this.addChild(this.scoreDisplay);
        },

        renderToFrame: function (frame) {
            this.fillGaugeSprite.renderToFrame(frame, this.position.x + 1, this.position.y + 1, this.index - 1);

            this.super('renderToFrame', arguments);
        },

        addPoints: function (points) {
            this.pointTotal += this.pointMultiplier * points;
            this.updateScore();
        },

        getScore: function () {
            return this.pointTotal;
        },

        bumpCombo: function () {
            this.comboPoints++;
            this.updateMultiplier();
            this.updateGaugeHeight();
        },

        clearCombo: function () {
            this.comboPoints = 0;
            this.updateMultiplier();
            this.updateGaugeHeight();
        },

        updateGaugeHeight: function () {
            var pixels = [];
            for (var i = 0; i < 59; i++) {
                if (i < this.comboPoints) {
                    pixels.unshift(Gradients.colorAtPercent(Gradients.GreenToRed, 1 - i / 59));
                }
                else {
                    pixels.unshift(null);
                }
            }

            this.fillGaugeSprite = new Sprite([
                pixels, pixels, pixels, pixels
            ]);
        },

        updateMultiplier: function () {
            if (this.comboPoints >= 59) {
                this.pointMultiplier = 6;
            }
            else if (this.comboPoints >= 48) {
                this.pointMultiplier = 5;
            }
            else if (this.comboPoints >= 36) {
                this.pointMultiplier = 4;
            }
            else if (this.comboPoints >= 24 ) {
                this.pointMultiplier = 3;
            }
            else if (this.comboPoints >= 12) {
                this.pointMultiplier = 2;
            }
            else {
                this.pointMultiplier = 1;
            }

            this.multiplierDisplay.changeMessage(this.pointMultiplier + "x");
        },

        updateScore: function () {
            this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
        }
    });
});

DefineModule('components/fadeout-banner', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    var colorGradient = [
        "rgb(255,255,255)",
        "rgb(226,226,232)",
        "rgb(171,171,189)",
        "rgb(142,142,165)",
        "rgb(114,113,142)",
        "rgb(85,84,119)",
        "rgb(58,57,97)",
        "rgb(29,27,74)",
        "rgb(1,0,51)"
    ];

    return DefineClass(GameObject, {
        constructor: function (parent, text, time) {
            this.super('constructor', arguments);

            this.text = text;
            this.interval = time / colorGradient.length;
        },

        start: function () {
            this.elapsedTime = 0;
            this.colorIndex = 0;

            this.textDisplay = new TextDisplay(this, {
                message: this.text,
                position: { x: 55, y: 50 },
                border: true,
                padding: 15,
                color: colorGradient[ this.colorIndex ],
                font: "arcade"
            });
            this.addChild(this.textDisplay);
        },

        update: function (dtime) {
            this.elapsedTime += dtime;

            if (this.elapsedTime > this.interval) {
                this.elapsedTime -= this.interval;
                this.colorIndex++;

                if (this.colorIndex > colorGradient.length) {
                    this.parent.removeChild(this);
                } else {
                    this.textDisplay.updateColor(colorGradient[ this.colorIndex ]);
                }
            }
        }
    });
});

DefineModule('components/life-meter', function (require) {
    var GameObject = require('models/game-object');
    var Gradients = require('helpers/gradients');
    var Sprite = require('models/sprite');

    return DefineClass(GameObject, {
        index: 1,

        constructor: function (boundEntity, options) {
            this.super('constructor', arguments);

            options = options || {};

            this.entity = boundEntity;
            this.position = options.position || { x: 0, y: 0 };
            this.anchor = options.anchor || { };
            this.horizontal = !!options.horizontal;
            this.length = options.length || 10;
            this.width = options.width || 1;
            this.scale = options.scale;
            this.showBorder = !!options.showBorder;
            this.borderColor = options.borderColor || "#ffffff";
        },

        update: function () {
            if (this.entity.life !== this.currentLife || this.entity.maxLife !== this.maxLife) {
                this.currentLife = this.entity.life;
                this.maxLife = this.entity.maxLife;

                if (this.scale) {
                    this.length = this.maxLife * this.scale;
                    if (this.length > 70) {
                        // this just applies to the player's health if they get so many upgrades
                        // it would overflow the screen, manually set lengths will always honor them.
                        this.length = 70;
                    }
                }

                this.redrawMeter();
            }
        },

        redrawMeter: function () {
            var colors = this.buildSpriteColorArray();

            if (this.showBorder) {
                this.addBorderToColorArray(colors);
            }

            this.sprite = new Sprite(colors);

            if (this.horizontal) {
                this.sprite.rotateRight();
            }

            this.updatePosition();
        },

        buildSpriteColorArray: function () {
            var percentage = this.currentLife / this.maxLife * 100;
            var meterColor = Gradients.colorAtPercent(Gradients.GreenToRed, this.currentLife / this.maxLife);
            var colors = this.buildEmptySpriteColorArray();

            for (var i = this.length - 1; i >= 0; i--) {
                var color = null;
                if (i / this.length * 100 < percentage) {
                    color = meterColor;
                }

                colors.forEach(function (colorArray) {
                    colorArray.push(color);
                });
            }

            return colors;
        },

        buildEmptySpriteColorArray: function() {
            var colors = [];
            for (var j = 0; j < this.width; j++) {
                colors.push([]);
            }
            return colors;
        },

        addBorderToColorArray: function (colors) {
            this.addBezelPixelsToBorder(colors);
            this.addBorderEnds(colors);
            this.addBorderEdges(colors);
        },

        addBezelPixelsToBorder: function (colors) {
            if (this.width > 2) {
                colors[ 0 ][ 0 ] = this.borderColor;
                colors[ this.width - 1 ][ 0 ] = this.borderColor;
                colors[ 0 ][ this.length - 1 ] = this.borderColor;
                colors[ this.width - 1 ][ this.length - 1 ] = this.borderColor;
            }
        },

        addBorderEnds: function (colors) {
            for (var j = 0; j < this.width; j++) {
                colors[ j ].push(this.borderColor);
                colors[ j ].unshift(this.borderColor);
            }
        },

        addBorderEdges: function (colors) {
            var border = [ null ];
            for (var i = 0; i < this.length; i++) {
                border.push(this.borderColor);
            }
            border.push(null);

            colors.push(border);
            colors.unshift(border);
        },

        updatePosition: function () {
            if (this.anchor.left) {
                this.position.x = this.anchor.left;
            }

            if (this.anchor.top) {
                this.position.y = this.anchor.top;
            }

            if (this.anchor.right) {
                this.position.x = this.anchor.right - this.sprite.width;
            }

            if (this.anchor.bottom) {
                this.position.y = this.anchor.bottom - this.sprite.height;
            }
        }
    });
});

DefineModule('components/money-drop', function (require) {
    var GameObject = require('models/game-object');
    var ArcadeFont = require('fonts/arcade');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        type: "pickup",
        team: 1,
        index: 4,

        constructor: function (parent, position, velocity) {
            this.super('constructor', arguments);

            this.value = 10;
            this.position = position;
            this.velocity = { x: 0, y: 50 };
            this.sprite = ArcadeFont[ '$' ];
        },
        checkBoundaries: function () {
            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x > this.parent.width
                || this.position.y > this.parent.height) {

                this.destroy();
            }
        },
        applyDamage: function (damage, sourceEntity) {
            if (sourceEntity.type === "player") {
                this.triggerEvent('moneyCollected', this.value);
                this.destroy();
            }
        }
    });
});

DefineModule('components/muzzle-flash', function (require) {
    var Animation = require('models/animation');
    var GameObject = require('models/game-object');
    var Sprite = require('models/sprite');

    var shades = [
        "#ff0000",
        "#ff3300",
        "#ff6600",
        "#ff9933",
        "#ffcc00",
        "#ff9900",
        "#ffcc00",
        "#ffcc66",
        "#ffcc99"
    ];

    var frames = shades.map(function (shade) {
        return new Sprite([
            [ shade, shade ]
        ]);
    });

    return DefineClass(GameObject, {
        constructor: function (parent, gunPosition) {
            this.super('constructor', arguments);

            this.gunPosition = gunPosition;
            this.sprite = new Animation({
                frames: frames,
                millisPerFrame: 25
            });
        },

        update: function () {
            this.super('update', arguments);

            if (this.sprite.finished) {
                this.destroy();
            }
        },

        renderToFrame: function (frame) {
            this.sprite.renderToFrame(frame,
                Math.floor(this.parent.position.x + this.gunPosition.x),
                Math.floor(this.parent.position.y + this.gunPosition.y-1),
                (this.parent.index || 0) + 1);
        }
    })
});

DefineModule('components/text-display', function (require) {
    var GameObject = require('models/game-object');
    var shipExplosion = require('sprites/animations/ship-explosion');
    var Sprite = require('models/sprite');

    return DefineClass(GameObject, {
        constructor: function (parent, options) {
            this.rawMessage = options.message || " ";
            this.font = require("fonts/" + (options.font || "arcade-small"));
            this.color = options.color || "white";
            this.position = options.position;
            this.border = !!options.border;
            this.padding = options.padding || 0;
            this.background = options.background || null;
            this.index = options.index || 10;
            this.isPhysicalEntity = options.isPhysicalEntity;

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.changeMessage(this.rawMessage);
        },

        changeMessage: function (text) {
            text = text || " ";
            this.rawMessage = text;

            if (typeof text === "string") {
                text = [ text ];
            }
            text = text.map(function (str) {
                return str.split('');
            });
            this.message = text;

            this.populateSprites();
            this.updateColor(this.color);
        },

        populateSprites: function () {
            this.children = []; // intentionally clear all previous sprites before adding new ones
            var self = this;

            var width = 0;
            var height = 0;
            var xOffset = this.position.x;
            var yOffset = this.position.y;
            var lineWidths = [];

            if (this.padding) {
                xOffset += this.padding;
                yOffset += this.padding;
                width += this.padding * 2;
                height += this.padding * 2;
            }

            if (this.border) {
                xOffset += 1;
                yOffset += 1;
                width += 1;
                height += 1;
            }

            this.message.forEach(function (line) {
                var xLineOffset = xOffset;
                var lineWidth = 0;

                line.forEach(function (char) {
                    var sprite = self.font[ char ];
                    if (sprite) {
                        var entity = new GameObject(self);
                        entity.sprite = sprite.clone();
                        entity.index = self.index + 1;
                        entity.position = {
                            x: xLineOffset,
                            y: yOffset
                        };
                        self.addChild(entity);

                        lineWidth += sprite.width + self.font.meta.letterSpacing;
                        xLineOffset += sprite.width + self.font.meta.letterSpacing;
                    }
                    else {
                        console.error("Tried to print an unsupported letter: '" + char + "'");
                    }

                });

                lineWidths.push(lineWidth);
                yOffset += self.font.meta.lineHeight;
                height += self.font.meta.lineHeight;
            });

            width += Math.max.apply(null, lineWidths);
            this.width = width;
            this.height = height;

            this.createBackgroundSprite(width, height);
        },

        createBackgroundSprite: function (width, height) {
            var spriteRows = [];
            for (var x = 0; x < width; x++) {
                var row = [];
                for (var y = 0; y < height; y++) {
                    row.push(this.background);
                }
                spriteRows.push(row);
            }
            this.sprite = new Sprite(spriteRows);
        },

        updateColor: function (color) {
            this.color = color;
            var width = this.width;
            var height = this.height;

            this.children.forEach(function (entity) {
                entity.sprite.applyColor(color);
            });

            if (this.border) {
                this.sprite.iterateCells(function (cell, x, y) {
                    if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                        cell.color = color;
                    }
                });
            }
        },

        applyDamage: function () {
            this.children.forEach(function (entity) {
                entity.sprite = shipExplosion({ x: -2, y: -1 });
            });
        }
    });
});

DefineModule('controllers/gamepad-input', function (require) {
    var BUTTON_MAP = {
        0: 'A',
        1: 'B',
        2: 'X',
        3: 'Y',
        4: 'left-bumper',
        5: 'right-bumper',
        6: 'left-trigger',
        7: 'right-trigger',
        8: 'back',
        9: 'start',
        10: 'left-stick-press',
        11: 'right-stick-press',
        12: 'd-pad-up',
        13: 'd-pad-down',
        14: 'd-pad-left',
        15: 'd-pad-right'
    };

    function gamepadDescriptor() {
        var descriptor = { INPUT_TYPE: 'gamepad' };

        Object.keys(BUTTON_MAP).forEach(function (key) {
            descriptor[ BUTTON_MAP[ key ] ] = false;
        });

        descriptor[ 'left-stick-x' ] = 0;
        descriptor[ 'left-stick-y' ] = 0;
        descriptor[ 'right-stick-x' ] = 0;
        descriptor[ 'right-stick-y' ] = 0;

        return descriptor;
    }

    function normalize(axisTilt) {
        return Math.round(axisTilt * 10) / 10;
    }

    return DefineClass({
        constructor: function () {
            window.addEventListener("gamepadconnected", function (e) {
                console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                    e.gamepad.index, e.gamepad.id,
                    e.gamepad.buttons.length, e.gamepad.axes.length);
            });
            window.addEventListener("gamepaddisconnected", function (e) {
                console.log("Gamepad disconnected from index %d: %s",
                    e.gamepad.index, e.gamepad.id);
            });
        },
        getInputState: function () {
            var gamepad = navigator.getGamepads()[ 0 ];
            var gamepadState = gamepadDescriptor();

            if (gamepad && gamepad.connected) {
                gamepad.buttons.forEach(function (button, index) {
                    gamepadState[ BUTTON_MAP[ index ] ] = button.pressed;
                });

                gamepadState[ 'left-stick-x' ] = normalize(gamepad.axes[ 0 ]);
                gamepadState[ 'left-stick-y' ] = normalize(gamepad.axes[ 1 ]);
                gamepadState[ 'right-stick-x' ] = normalize(gamepad.axes[ 2 ]);
                gamepadState[ 'right-stick-y' ] = normalize(gamepad.axes[ 3 ]);
            }

            return gamepadState;
        },
        clearState: function () {
            /* no op for gamepads */
        }
    });
});

DefineModule('controllers/keyboard-input', function (require) {
    function cloneObj(obj) {
        var nObj = {};
        Object.keys(obj).forEach(function (key) {
            nObj[ key ] = obj[ key ];
        });
        return nObj;
    }

    function newInputDescriptor() {
        return {
            W: false, A: false, S: false, D: false,
            SPACE: false, ENTER: false
        };
    }

    var KEYS = {
        87: 'W', 65: 'A', 83: 'S', 68: 'D',
        32: 'SPACE', 13: 'ENTER'
    };

    return DefineClass({
        constructor: function () {
            this.clearState();

            document.body.addEventListener('keydown', this.keydown.bind(this));
            document.body.addEventListener('keyup', this.keyup.bind(this));
        },
        getInputState: function () {
            var state = cloneObj(this.inputState);
            this.propagateInputClears();
            return state;
        },
        clearState: function () {
            this.clearAfterNext = newInputDescriptor();
            this.inputState = newInputDescriptor();
            this.inputState.INPUT_TYPE = "keyboard";
        },
        propagateInputClears: function () {
            Object.keys(this.clearAfterNext).forEach(function (key) {
                if (this.clearAfterNext[ key ]) {
                    this.inputState[ key ] = false;
                    this.clearAfterNext[ key ] = false;
                }
            }.bind(this));
        },
        keydown: function (event) {
            this.inputState[ KEYS[ event.keyCode ] ] = true;
            this.clearAfterNext[ KEYS[ event.keyCode ] ] = false;
        },
        keyup: function (event) {
            this.clearAfterNext[ KEYS[ event.keyCode ] ] = true;
        }
    });
});

DefineModule('fonts/arcade-small', function (require) {
    var Sprite = require('models/sprite');

    var w = "white";
    var n = null;

    return {
        meta: {
            width: 3,
            height: 5,
            lineHeight: 8,
            letterSpacing: 1,
            credit: "me"
        },
        A: new Sprite([
            [ n, w, w, w, w ],
            [ w, n, w, n, n ],
            [ n, w, w, w, w ]
        ]),
        B: new Sprite([
            [ w, w, w, w, w ],
            [ w, n, w, n, w ],
            [ n, w, n, w, n ]
        ]),
        C: new Sprite([
            [ n, w, w, w, n ],
            [ w, n, n, n, w ],
            [ n, w, n, w, n ]
        ]),
        D: new Sprite([
            [ w, w, w, w, w ],
            [ w, n, n, n, w ],
            [ n, w, w, w, n ]
        ]),
        E: new Sprite([
            [ w, w, w, w, w ],
            [ w, n, w, n, w ],
            [ w, n, n, n, w ]
        ]),
        F: new Sprite([
            [ w, w, w, w, w ],
            [ w, n, w, n, n ],
            [ w, n, n, n, n ]
        ]),
        G: new Sprite([
            [ n, w, w, w, n ],
            [ w, n, n, n, w ],
            [ w, n, n, w, w ]
        ]),
        H: new Sprite([
            [ w, w, w, w, w ],
            [ n, n, w, n, n ],
            [ w, w, w, w, w ]
        ]),
        I: new Sprite([
            [ w, n, n, n, w ],
            [ w, w, w, w, w ],
            [ w, n, n, n, w ]
        ]),
        J: new Sprite([
            [ n, n, n, w, n ],
            [ n, n, n, n, w ],
            [ w, w, w, w, n ]
        ]),
        K: new Sprite([
            [ w, w, w, w, w ],
            [ n, n, w, n, n ],
            [ w, w, n, w, w ]
        ]),
        L: new Sprite([
            [ w, w, w, w, w ],
            [ n, n, n, n, w ],
            [ n, n, n, n, w ]
        ]),
        M: new Sprite([
            [ w, w, w, w, w ],
            [ n, w, n, n, n ],
            [ n, n, w, n, n ],
            [ n, w, n, n, n ],
            [ w, w, w, w, w ]
        ]),
        N: new Sprite([
            [ w, w, w, w, w ],
            [ n, w, n, n, n ],
            [ n, n, w, n, n ],
            [ w, w, w, w, w ]
        ]),
        O: new Sprite([
            [ n, w, w, w, n ],
            [ w, n, n, n, w ],
            [ n, w, w, w, n ]
        ]),
        P: new Sprite([
            [ w, w, w, w, w ],
            [ w, n, w, n, n ],
            [ n, w, n, n, n ]
        ]),
        Q: new Sprite([
            [ n, w, w, w, n ],
            [ w, n, n, n, w ],
            [ w, n, n, w, w ],
            [ n, w, w, w, w ]
        ]),
        R: new Sprite([
            [ w, w, w, w, w ],
            [ w, n, w, n, n ],
            [ n, w, n, w, w ]
        ]),
        S: new Sprite([
            [ n, w, n, n, w ],
            [ w, n, w, n, w ],
            [ w, n, n, w, n ]
        ]),
        T: new Sprite([
            [ w, n, n, n, n ],
            [ w, w, w, w, w ],
            [ w, n, n, n, n ]
        ]),
        U: new Sprite([
            [ w, w, w, w, n ],
            [ n, n, n, n, w ],
            [ w, w, w, w, w ]
        ]),
        V: new Sprite([
            [ w, w, w, w, n ],
            [ n, n, n, n, w ],
            [ w, w, w, w, n ]
        ]),
        W: new Sprite([
            [ w, w, w, w, n ],
            [ n, n, n, n, w ],
            [ n, n, n, w, n ],
            [ n, n, n, n, w ],
            [ w, w, w, w, n ]
        ]),
        X: new Sprite([
            [ w, w, n, w, w ],
            [ n, n, w, n, n ],
            [ w, w, n, w, w ]
        ]),
        Y: new Sprite([
            [ w, w, n, n, n ],
            [ n, n, w, n, w ],
            [ w, w, w, w, n ]
        ]),
        Z: new Sprite([
            [ w, n, n, w, w ],
            [ w, n, w, n, w ],
            [ w, w, n, n, w ]
        ]),
        a: new Sprite([
            [ n, n, n, n, w, n ],
            [ n, w, n, w, n, w ],
            [ n, w, w, w, w, w ]
        ]),
        b: new Sprite([
            [ w, w, w, w, w ],
            [ n, n, w, n, w ],
            [ n, n, n, w, w ]
        ]),
        c: new Sprite([
            [ n, w, w, w, w ],
            [ n, w, n, n, w ]
        ]),
        d: new Sprite([
            [ n, n, n, w, w ],
            [ n, n, w, n, w ],
            [ w, w, w, w, w ]
        ]),
        e: new Sprite([
            [ n, w, w, w, w, n ],
            [ n, w, n, w, n, w ],
            [ n, n, w, w, n, n ]
        ]),
        f: new Sprite([
            [ w, w, w, w, w ],
            [ w, n, w, n, n ]
        ]),
        g: new Sprite([
            [ n, n, w, w, n, n, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, w, w, w, n ]
        ]),
        h: new Sprite([
            [ w, w, w, w, w ],
            [ n, n, w, n, n ],
            [ n, n, n, w, w ]
        ]),
        i: new Sprite([
            [ w, n, w, w, w ]
        ]),
        j: new Sprite([
            [ n, n, n, n, n, w ],
            [ n, w, n, w, w, w ]
        ]),
        k: new Sprite([
            [ w, w, w, w, w ],
            [ n, n, w, n, n ],
            [ n, w, n, w, w ]
        ]),
        l: new Sprite([
            [ w, w, w, w, w ]
        ]),
        m: new Sprite([
            [ n, n, w, w, w ],
            [ n, n, w, n, n ],
            [ n, n, n, w, n ],
            [ n, n, w, n, n ],
            [ n, n, w, w, w ]
        ]),
        n: new Sprite([
            [ n, n, w, w, w ],
            [ n, n, w, n, n ],
            [ n, n, n, w, w ]
        ]),
        o: new Sprite([
            [ n, n, w, w, w ],
            [ n, n, w, n, w ],
            [ n, n, w, w, w ]
        ]),
        p: new Sprite([
            [ n, n, w, w, w, w, w ],
            [ n, n, w, n, w, n, n ],
            [ n, n, w, w, n, n, n ]
        ]),
        q: new Sprite([
            [ n, n, w, w, n, n, n ],
            [ n, n, w, n, w, n, n ],
            [ n, n, w, w, w, w, w ]
        ]),
        r: new Sprite([
            [ n, n, w, w, w ],
            [ n, n, w, n, n ]
        ]),
        s: new Sprite([
            [ n, w, w, n, w ],
            [ n, w, n, w, w ]
        ]),
        t: new Sprite([
            [ n, w, n, n, n ],
            [ w, w, w, w, w ],
            [ n, w, n, n, n ]
        ]),
        u: new Sprite([
            [ n, n, w, w, n ],
            [ n, n, n, n, w ],
            [ n, n, w, w, w ]
        ]),
        v: new Sprite([
            [ n, n, w, w, n ],
            [ n, n, n, n, w ],
            [ n, n, w, w, n ]
        ]),
        w: new Sprite([
            [ n, n, w, w, n ],
            [ n, n, n, n, w ],
            [ n, n, n, w, w ],
            [ n, n, n, n, w ],
            [ n, n, w, w, n ]
        ]),
        x: new Sprite([
            [ n, n, w, n, w ],
            [ n, n, n, w, n ],
            [ n, n, w, n, w ]
        ]),
        y: new Sprite([
            [ n, n, w, w, w, n, w ],
            [ n, n, n, n, w, n, w ],
            [ n, n, w, w, w, w, n ]
        ]),
        z: new Sprite([
            [ n, n, w, n, n ],
            [ n, n, w, w, w ],
            [ n, n, n, n, w ]
        ]),
        '0': new Sprite([
            [ w, w, w, w, w ],
            [ w, n, n, n, w ],
            [ w, w, w, w, w ]
        ]),
        '1': new Sprite([
            [ w, n, n, n, w ],
            [ w, w, w, w, w ],
            [ n, n, n, n, w ]
        ]),
        '2': new Sprite([
            [ w, n, w, w, w ],
            [ w, n, w, n, w ],
            [ n, w, w, n, w ]
        ]),
        '3': new Sprite([
            [ w, n, w, n, w ],
            [ w, n, w, n, w ],
            [ w, w, w, w, w ]
        ]),
        '4': new Sprite([
            [ w, w, n, n, n ],
            [ n, n, w, n, n ],
            [ w, w, w, w, w ]
        ]),
        '5': new Sprite([
            [ w, w, w, n, w ],
            [ w, n, w, n, w ],
            [ w, n, n, w, w ]
        ]),
        '6': new Sprite([
            [ w, w, w, w, w ],
            [ w, n, w, n, w ],
            [ w, n, n, w, w ]
        ]),
        '7': new Sprite([
            [ w, n, n, w, w ],
            [ w, n, w, n, n ],
            [ w, w, n, n, n ]
        ]),
        '8': new Sprite([
            [ w, w, n, w, w ],
            [ w, n, w, n, w ],
            [ w, w, n, w, w ]
        ]),
        '9': new Sprite([
            [ w, w, n, n, w ],
            [ w, n, w, n, w ],
            [ w, w, w, w, w ]
        ]),
        '!': new Sprite([
            [ w, w, w, n, w ]
        ]),
        '.': new Sprite([
            [ n, n, n, n, w ]
        ]),
        ',': new Sprite([
            [ n, n, n, n, w, w ]
        ]),
        '?': new Sprite([
            [ w, n, w, w, n, w ],
            [ n, w, n, n, n, n ]
        ]),
        '<': new Sprite([
            [ n, n, w, n, n],
            [ n, w, w, w, n],
            [ w, w, n, w, w],
            [ w, n, n, n, w]

        ]),
        '>': new Sprite([
            [ w, n, n, n, w],
            [ w, w, n, w, w],
            [ n, w, w, w, n],
            [ n, n, w, n, n]
        ]),
        '-': new Sprite([
            [ n, n, w, n, n ],
            [ n, n, w, n, n ],
            [ n, n, w, n, n ]
        ]),
        ':': new Sprite([
            [ n, n, n, n, n ],
            [ n, n, w, n, w ],
            [ n, n, n, n, n ]
        ]),
        '$': new Sprite([
            [ n, n, w, n ],
            [ w, w, w, w ],
            [ w, n, w, n ],
            [ w, w, w, w ],
            [ n, w, n, w ],
            [ w, w, w, w ],
            [ n, w, n, n ]
        ]).invertY().rotateRight().setPermanentOffset({x: 0, y: -1}),
        '+': new Sprite([
            [ n, n, n ],
            [ n, w, n ],
            [ w, w, w ],
            [ n, w, n ],
            [ n, n, n ]
        ]).invertY().rotateRight(),
        '%': new Sprite([
            [ w, n, n, w ],
            [ n, n, w, w ],
            [ n, w, w, n ],
            [ w, w, n, n ],
            [ w, n, n, w ]
        ]).invertY().rotateRight(),
        ' ': new Sprite([
            [ n, n, n, n, n ],
            [ n, n, n, n, n ],
            [ n, n, n, n, n ]
        ])
    };
});

DefineModule('fonts/arcade', function (require) {
    var Sprite = require('models/sprite');

    var w = "white";
    var n = null;

    return {
        meta: {
            width: 7,
            height: 7,
            lineHeight: 11,
            letterSpacing: 1,
            credit: "http://www.urbanfonts.com/fonts/Arcade.htm"
        },
        A: new Sprite([
            [ n, n, w, w, w, w, w ],
            [ n, w, w, w, w, w, w ],
            [ w, w, n, n, w, n, n ],
            [ w, n, n, n, w, n, n ],
            [ w, w, n, n, w, n, n ],
            [ n, w, w, w, w, w, w ],
            [ n, n, w, w, w, w, w ]
        ]),
        B: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ n, w, w, n, w, w, n ]
        ]),
        C: new Sprite([
            [ n, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, w, n, n, n, w, w ],
            [ n, w, n, n, n, w, n ]
        ]),
        D: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ n, w, w, w, w, w, n ]
        ]),
        E: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, n, n, n, w ]
        ]),
        F: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, w, n, n, n ],
            [ w, n, n, w, n, n, n ],
            [ w, n, n, w, n, n, n ],
            [ w, n, n, w, n, n, n ],
            [ w, n, n, n, n, n, n ]
        ]),
        G: new Sprite([
            [ n, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, w, n, w, w, w, w ],
            [ n, w, n, w, w, w, n ]
        ]),
        H: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, n, w, n, n, n ],
            [ n, n, n, w, n, n, n ],
            [ n, n, n, w, n, n, n ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ]
        ]),
        I: new Sprite([
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ]
        ]),
        J: new Sprite([
            [ n, n, n, n, n, w, n ],
            [ n, n, n, n, n, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, n ],
            [ w, n, n, n, n, n, n ]
        ]),
        K: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, n, w, w, n, n ],
            [ n, n, w, w, w, w, n ],
            [ n, w, w, n, w, w, n ],
            [ w, w, n, n, n, w, w ],
            [ w, n, n, n, n, n, w ]
        ]),
        L: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ]
        ]),
        M: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ n, w, w, w, w, w, w ],
            [ n, n, w, w, n, n, n ],
            [ n, n, n, w, w, n, n ],
            [ n, n, w, w, n, n, n ],
            [ n, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ]
        ]),
        N: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, w, w, n, n, n, n ],
            [ n, n, w, w, n, n, n ],
            [ n, n, n, w, w, n, n ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ]
        ]),
        O: new Sprite([
            [ n, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ n, w, w, w, w, w, n ]
        ]),
        P: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, w, n, n, n ],
            [ w, n, n, w, n, n, n ],
            [ w, n, n, w, n, n, n ],
            [ w, w, w, w, n, n, n ],
            [ n, w, w, n, n, n, n ]
        ]),
        Q: new Sprite([
            [ n, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, w, n, w ],
            [ w, n, n, n, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ n, w, w, w, w, n, w ]
        ]),
        R: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, w, n, n, n ],
            [ w, n, n, w, w, n, n ],
            [ w, n, n, w, w, w, n ],
            [ w, w, w, w, n, w, w ],
            [ n, w, w, n, n, n, w ]
        ]),
        S: new Sprite([
            [ n, w, w, n, n, w, n ],
            [ w, w, w, w, n, w, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, w, n, w, w, w, w ],
            [ n, w, n, n, w, w, n ]
        ]),
        T: new Sprite([
            [ w, n, n, n, n, n, n ],
            [ w, n, n, n, n, n, n ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, n, n, n, n ],
            [ w, n, n, n, n, n, n ]
        ]),
        U: new Sprite([
            [ w, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, n ]
        ]),
        V: new Sprite([
            [ w, w, w, w, w, n, n ],
            [ w, w, w, w, w, w, n ],
            [ n, n, n, n, n, w, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, w, w ],
            [ w, w, w, w, w, w, n ],
            [ w, w, w, w, w, n, n ]
        ]),
        W: new Sprite([
            [ w, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ n, n, n, n, n, w, w ],
            [ n, n, n, n, w, w, n ],
            [ n, n, n, n, n, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, n ]
        ]),
        X: new Sprite([
            [ w, n, n, n, n, w, w ],
            [ w, w, n, n, w, w, n ],
            [ n, w, w, w, w, n, n ],
            [ n, n, w, w, n, n, n ],
            [ n, w, w, w, w, n, n ],
            [ w, w, n, n, w, w, n ],
            [ w, n, n, n, n, w, w ]
        ]),
        Y: new Sprite([
            [ w, w, w, n, n, n, n ],
            [ w, w, w, w, n, n, n ],
            [ n, n, n, w, w, w, w ],
            [ n, n, n, w, w, w, w ],
            [ w, w, w, w, n, n, n ],
            [ w, w, w, n, n, n, n ],
            [ n, n, n, n, n, n, n ]
        ]),
        Z: new Sprite([
            [ w, n, n, n, n, w, w ],
            [ w, n, n, n, w, w, w ],
            [ w, n, n, w, w, n, w ],
            [ w, n, w, w, n, n, w ],
            [ w, w, w, n, n, n, w ],
            [ w, w, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ]
        ]),
        a: new Sprite([
            [ n, n, n, n, n, w, n ],
            [ n, n, w, n, w, w, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, w, w, w, w ]
        ]),
        b: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, w, w, w, n ]
        ]),
        c: new Sprite([
            [ n, n, n, w, w, w, n ],
            [ n, n, w, w, w, w, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, w, n, w, w ],
            [ n, n, n, w, n, w, n ]
        ]),
        d: new Sprite([
            [ n, n, n, w, w, w, n ],
            [ n, n, w, w, w, w, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ]
        ]),
        e: new Sprite([
            [ n, n, n, w, w, w, n ],
            [ n, n, w, w, w, w, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, w, w, n, w ],
            [ n, n, n, w, w, n, n ]
        ]),
        f: new Sprite([
            [ n, n, w, n, n, n, n ],
            [ n, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ w, n, w, n, n, n, n ],
            [ w, n, n, n, n, n, n ]
        ]),
        g: new Sprite([
            [ n, n, n, w, w, w, n, n, n ],
            [ n, n, w, w, w, w, w, n, w ],
            [ n, n, w, n, n, n, w, n, w ],
            [ n, n, w, n, n, n, w, n, w ],
            [ n, n, w, n, n, n, w, n, w ],
            [ n, n, w, w, w, w, w, w, w ],
            [ n, n, n, w, w, w, w, w, n ]
        ]),
        h: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, w, n, n, n, n ],
            [ n, n, w, n, n, n, n ],
            [ n, n, w, n, n, n, n ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, w, w, w, w ]
        ]),
        i: new Sprite([
            [ w, n, w, w, w, w, w ],
            [ w, n, w, w, w, w, w ]
        ]),
        j: new Sprite([
            [ n, n, n, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ w, n, w, w, w, w, w ],
            [ w, n, w, w, w, w, n ]
        ]),
        k: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, n, n, w, n, n ],
            [ n, n, n, w, w, w, n ],
            [ n, n, w, w, n, w, w ],
            [ n, n, w, n, n, n, w ]
        ]),
        l: new Sprite([
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ]
        ]),
        m: new Sprite([
            [ n, n, w, w, w, w, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, w, n, n, n, n ],
            [ n, n, n, w, w, w, w ],
            [ n, n, w, n, n, n, n ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, w, w, w, w ]
        ]),
        n: new Sprite([
            [ n, n, w, w, w, w, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, w, n, n, n, n ],
            [ n, n, w, n, n, n, n ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, w, w, w, w ]
        ]),
        o: new Sprite([
            [ n, n, n, w, w, w, n ],
            [ n, n, w, w, w, w, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, w, w, w, n ]
        ]),
        p: new Sprite([
            [ n, n, w, w, w, w, w, w, w ],
            [ n, n, w, w, w, w, w, w, w ],
            [ n, n, w, n, n, n, w, n, n ],
            [ n, n, w, n, n, n, w, n, n ],
            [ n, n, w, n, n, n, w, n, n ],
            [ n, n, w, w, w, w, w, n, n ],
            [ n, n, n, w, w, w, n, n, n ]
        ]),
        q: new Sprite([
            [ n, n, n, w, w, w, n, n, n ],
            [ n, n, w, w, w, w, w, n, n ],
            [ n, n, w, n, n, n, w, n, n ],
            [ n, n, w, n, n, n, w, n, n ],
            [ n, n, w, n, n, n, w, n, n ],
            [ n, n, w, w, w, w, w, w, w ],
            [ n, n, w, w, w, w, w, w, w ]
        ]),
        r: new Sprite([
            [ n, n, w, w, w, w, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, w, n, n, n ],
            [ n, n, w, n, n, n, n ],
            [ n, n, w, n, n, n, n ]
        ]),
        s: new Sprite([
            [ n, n, n, w, n, n, n ],
            [ n, n, w, w, w, n, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, n, w, w, w ],
            [ n, n, n, n, n, w, n ]
        ]),
        t: new Sprite([
            [ n, n, w, n, n, n, n ],
            [ w, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ n, n, w, n, n, n, w ],
            [ n, n, n, n, n, n, w ]
        ]),
        u: new Sprite([
            [ n, n, w, w, w, w, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, w, w, w, w, n ]
        ]),
        v: new Sprite([
            [ n, n, w, w, w, n, n ],
            [ n, n, w, w, w, w, n ],
            [ n, n, n, n, n, w, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, w, w ],
            [ n, n, w, w, w, w, n ],
            [ n, n, w, w, w, n, n ]
        ]),
        w: new Sprite([
            [ n, n, w, w, w, w, n ],
            [ n, n, w, w, w, w, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, w, n ],
            [ n, n, n, n, n, n, w ],
            [ n, n, w, w, w, w, w ],
            [ n, n, w, w, w, w, n ]
        ]),
        x: new Sprite([
            [ n, n, w, n, n, n, w ],
            [ n, n, w, w, n, w, w ],
            [ n, n, n, w, w, w, n ],
            [ n, n, n, n, w, n, n ],
            [ n, n, n, w, w, w, n ],
            [ n, n, w, w, n, w, w ],
            [ n, n, w, n, n, n, w ]
        ]),
        y: new Sprite([
            [ n, n, w, w, w, w, n, n, n ],
            [ n, n, w, w, w, w, w, n, w ],
            [ n, n, n, n, n, n, w, n, w ],
            [ n, n, n, n, n, n, w, n, w ],
            [ n, n, n, n, n, n, w, n, w ],
            [ n, n, w, w, w, w, w, w, w ],
            [ n, n, w, w, w, w, w, w, n ]
        ]),
        z: new Sprite([
            [ n, n, w, n, n, n, w ],
            [ n, n, w, n, n, w, w ],
            [ n, n, w, n, w, w, w ],
            [ n, n, w, n, w, n, w ],
            [ n, n, w, w, w, n, w ],
            [ n, n, w, w, n, n, w ],
            [ n, n, w, n, n, n, w ]
        ]),
        ' ': new Sprite([
            [ n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n ]
        ]),
        '0': new Sprite([
            [ n, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, n, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ n, w, w, w, w, w, n ]
        ]),
        '1': new Sprite([
            [ n, n, n, n, n, n, w ],
            [ n, w, n, n, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, n, n, w ]
        ]),
        '2': new Sprite([
            [ n, w, n, n, n, w, w ],
            [ w, w, n, n, w, w, w ],
            [ w, n, n, w, w, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, w, w, n, n, w ],
            [ w, w, w, n, n, n, w ],
            [ n, w, n, n, n, n, w ]
        ]),
        '3': new Sprite([
            [ n, w, n, n, n, w, n ],
            [ w, w, n, n, n, w, w ],
            [ w, n, n, n, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ n, w, w, n, w, w, n ]
        ]),
        '4': new Sprite([
            [ n, n, n, w, w, n, n ],
            [ n, n, w, w, w, n, n ],
            [ n, w, w, n, w, n, n ],
            [ w, w, n, n, w, n, n ],
            [ w, w, w, w, w, w, w ],
            [ w, w, w, w, w, w, w ],
            [ n, n, n, n, w, n, n ]
        ]),
        '5': new Sprite([
            [ w, w, w, n, n, w, n ],
            [ w, w, w, n, n, w, w ],
            [ w, n, w, n, n, n, w ],
            [ w, n, w, n, n, n, w ],
            [ w, n, w, n, n, n, w ],
            [ w, n, w, w, w, w, w ],
            [ n, n, n, w, w, w, n ]

        ]),
        '6': new Sprite([
            [ n, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, w, n, w, w, w, w ],
            [ n, w, n, n, w, w, n ]
        ]),
        '7': new Sprite([
            [ w, n, n, n, n, n, n ],
            [ w, n, n, n, n, n, n ],
            [ w, n, n, w, w, w, w ],
            [ w, n, w, w, w, w, w ],
            [ w, w, w, n, n, n, n ],
            [ w, w, n, n, n, n, n ],
            [ w, n, n, n, n, n, n ]
        ]),
        '8': new Sprite([
            [ n, w, w, n, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, w, w, w, w, w, w ],
            [ n, w, w, n, w, w, n ]
        ]),
        '9': new Sprite([
            [ n, w, w, n, n, n, n ],
            [ w, w, w, w, n, n, n ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, n, w ],
            [ w, n, n, w, n, w, w ],
            [ w, w, w, w, w, w, n ],
            [ n, w, w, w, w, n, n ]
        ]),
        '!': new Sprite([
            [ n, n, n, n, n, n, w ],
            [ n, n, n, n, w, n, w ],
            [ n, n, n, w, w, n, n ],
            [ n, n, w, w, n, n, n ],
            [ n, w, w, w, n, n, n ],
            [ w, w, w, n, n, n, n ],
            [ w, w, w, n, n, n, n ]
        ]),
        '.': new Sprite([
            [ n, n, n, n, n, w, w ],
            [ n, n, n, n, n, w, w ],
            [ n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n ]
        ]),
        ',': new Sprite([
            [ n, n, n, n, n, n, n, w ],
            [ n, n, n, n, n, w, w, w ],
            [ n, n, n, n, n, w, w, n ]
        ]),
        '?': new Sprite([
            [ n, w, n, n, n, n, n ],
            [ w, w, n, n, n, n, n ],
            [ w, n, n, w, n, w, w ],
            [ w, n, w, w, n, w, w ],
            [ w, w, w, n, n, n, n ],
            [ n, w, n, n, n, n, n ]
        ]),
        '$': new Sprite([
            [ n, n, w, n, n ],
            [ n, w, w, w, n ],
            [ w, n, w, n, w ],
            [ n, w, w, n, n ],
            [ n, n, w, n, n ],
            [ n, n, w, w, n ],
            [ w, n, w, n, w ],
            [ n, w, w, w, n ],
            [ n, n, w, n, n ]
        ]).invertY().rotateRight()
    };
});

DefineModule('fonts/phoenix', function (require) {
    var Sprite = require('models/sprite');

    var w = "white";
    var n = null;

    return {
        meta: {
            width: 15,
            height: 15,
            lineHeight: 16,
            letterSpacing: -1
        },
        P: new Sprite([
            [ n, n, n, w, w, w, w, w, w, w, w, w, n, n ],
            [ n, n, n, n, n, w, w, w, n, n, w, w, w, n ],
            [ n, n, n, n, n, w, w, n, n, n, n, w, w, w ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, w, w ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, w, w ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, w, w ],
            [ n, n, n, n, w, w, w, n, n, n, n, w, w, w ],
            [ n, n, n, w, w, w, w, w, n, n, w, w, w, n ],
            [ n, n, n, w, w, n, w, w, w, w, w, w, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, n, n, n, n ],
            [ w, w, w, w, w, w, n, n, n, n, n, n, n, n ]
        ]).invertY().rotateRight(),
        H: new Sprite([
            [ n, n, n, w, w, w, w, w, w, n, n, w, w, w, w, w, w ],
            [ n, n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n ],
            [ n, n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n ],
            [ n, n, n, w, w, w, w, w, w, w, w, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n ],
            [ w, w, w, w, w, w, n, n, w, w, w, w, w, w, n, n, n ]
        ]).invertY().rotateRight(),
        O: new Sprite([
            [ n, n, n, n, n, w, w, w, w, w, n, n ],
            [ n, n, n, n, w, w, w, n, w, w, w, n ],
            [ n, n, n, w, w, w, n, n, n, w, w, n ],
            [ n, n, n, w, w, n, n, n, n, w, w, w ],
            [ n, n, w, w, n, n, n, n, n, n, w, w ],
            [ n, n, w, w, n, n, n, n, n, n, w, w ],
            [ n, w, w, n, n, n, n, n, n, n, w, w ],
            [ n, w, w, n, n, n, n, n, n, n, w, w ],
            [ n, w, w, n, n, n, n, n, n, w, w, n ],
            [ w, w, n, n, n, n, n, n, n, w, w, n ],
            [ w, w, n, n, n, n, n, n, n, w, w, n ],
            [ w, w, n, n, n, n, n, n, w, w, n, n ],
            [ n, w, w, n, n, n, n, w, w, n, n, n ],
            [ n, n, w, w, n, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, w, w, n, n, n, n, n ]
        ]).invertY().rotateRight(),
        E: new Sprite([
            [ n, n, n, w, w, w, w, w, w, w, w, w, w, w ],
            [ n, n, n, n, n, w, w, n, n, n, n, n, n, w ],
            [ n, n, n, n, n, w, w, n, n, n, n, n, n, n ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, n, n ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, n, n ],
            [ n, n, n, n, w, w, n, n, n, n, n, n, n, n ],
            [ n, n, n, n, w, w, n, n, n, n, w, n, n, n ],
            [ n, n, n, w, w, w, w, w, w, w, w, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, w, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, n, w, n, n ],
            [ w, w, w, w, w, w, w, w, w, w, w, w, n, n ]
        ]).invertY().rotateRight(),
        N: new Sprite([
            [ n, n, n, w, w, w, w, n, n, n, n, w, w, w, w, w, w ],
            [ n, n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n ],
            [ n, n, n, n, n, w, w, w, n, n, n, n, n, w, w, n, n ],
            [ n, n, n, n, w, w, w, w, n, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, w, w, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, w, w, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, w, w, n, n, n, w, w, n, n, n ],
            [ n, n, n, w, w, n, n, n, w, w, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, w, w, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, w, w, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, w, w, w, w, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, w, w, w, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n ],
            [ w, w, w, w, w, w, n, n, n, n, w, w, w, w, n, n, n ]
        ]).invertY().rotateRight(),
        I: new Sprite([
            [ n, n, n, w, w, w, w, w, w ],
            [ n, n, n, n, n, w, w, n, n ],
            [ n, n, n, n, n, w, w, n, n ],
            [ n, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, w, w, n, n, n ],
            [ n, n, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n ],
            [ w, w, w, w, w, w, n, n, n ]
        ]).invertY().rotateRight(),
        X: new Sprite([
            [ n, n, n, w, w, w, w, w, w, n, n, w, w, w, w, w, w ],
            [ n, n, n, n, n, w, w, n, n, n, n, n, n, w, w, n, n ],
            [ n, n, n, n, n, w, w, n, n, n, n, n, w, w, n, n, n ],
            [ n, n, n, n, n, n, w, w, n, n, n, w, w, n, n, n, n ],
            [ n, n, n, n, n, n, w, w, n, n, w, w, n, n, n, n, n ],
            [ n, n, n, n, n, n, n, w, w, w, w, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n, w, w, w, n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n, w, w, w, n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, n, w, w, w, n, n, n, n, n, n, n ],
            [ n, n, n, n, n, n, w, w, w, w, n, n, n, n, n, n, n ],
            [ n, n, n, n, n, w, w, n, n, w, w, n, n, n, n, n, n ],
            [ n, n, n, n, w, w, n, n, n, w, w, n, n, n, n, n, n ],
            [ n, n, n, w, w, n, n, n, n, n, w, w, n, n, n, n, n ],
            [ n, n, w, w, n, n, n, n, n, n, w, w, n, n, n, n, n ],
            [ w, w, w, w, w, w, n, n, w, w, w, w, w, w, n, n, n ]
        ]).invertY().rotateRight()
    };
});

DefineModule('helpers/collect-entities', function () {
    return function visitNode(node, matcherFn, collection) {
        collection = collection || [];

        if (node) {
            if (matcherFn(node)) {
                collection.push(node);
            }

            if (node.children && node.children.length) {
                for (var i = 0; i < node.children.length; i++) {
                    visitNode(node.children[i], matcherFn, collection);
                }
            }
        }

        return collection;
    };
});

DefineModule('helpers/collisions', function (require) {
    var DUMMY_CELL = { x: -1, y: -1, color: null, index: -1 };
    var CollisionDetectionFrame = DefineClass({
        collisionDetected: false,

        constructor: function () {
            this.cells = [];
        },

        cellAt: function (x, y) {
            if (!this.collisionDetected) {
                if (!this.cells[ x ]) {
                    this.cells[ x ] = [];
                }

                if (!this.cells[ x ][ y ]) {
                    this.cells[ x ][ y ] = true;
                }
                else {
                    this.collisionDetected = true;
                }
            }

            return DUMMY_CELL;
        }
    });

    function entityToBoundingBox(entity) {
        return {
            x1: entity.position.x,
            x2: entity.position.x + entity.sprite.width,
            y1: entity.position.y,
            y2: entity.position.y + entity.sprite.height
        };
    }

    return {
        boxCollision: function (entityA, entityB) {
            var a = entityToBoundingBox(entityA);
            var b = entityToBoundingBox(entityB);

            return (
                a.x1 < b.x2 &&
                a.x2 > b.x1 &&
                a.y1 < b.y2 &&
                a.y2 > b.y1
            );
        },
        spriteCollision: function (entityA, entityB) {
            var collisionFrame = new CollisionDetectionFrame();

            entityA.renderToFrame(collisionFrame);
            entityB.renderToFrame(collisionFrame);

            return collisionFrame.collisionDetected;
        }
    };
});

DefineModule('helpers/gradients', function () {
    return {
        GreenToRed: {
            start: 120,
            end: 0,
            inverted: true,
            S: 1,
            L: .5
        },

        colorAtPercent: function (gradient, percent) {
            if (gradient.inverted) {
                percent = 1 - percent;
            }

            var H = (gradient.end - gradient.start) * percent + gradient.start;
            var S = gradient.S * 100;
            var L = gradient.L * 100;

            H = Math.floor(H);
            S = Math.floor(S) + "%";
            L = Math.floor(L) + "%";

            return "hsl(" + H + ", " + S + ", " + L + ")";
        }
    };
});

DefineModule('helpers/input-interpreter', function (require) {
    function newInputDescriptor() {
        return {
            GAME: 'phoenix',
            movementVector: { x: 0, y: 0 },
            fire: false
        };
    }

    function normalizeVector(vector) {
        var x = vector.x;
        var y = vector.y;
        var length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

        if (length > 1) {
            vector.x = x / length;
            vector.y = y / length;
        }
    }

    return DefineClass({
        interpret: function (inputSources) {
            var gameInput = newInputDescriptor();

            inputSources.forEach(function (inputSource) {
                switch (inputSource.INPUT_TYPE) {
                    case 'gamepad':
                        return this.addGamepadInput(inputSource, gameInput);
                    case 'keyboard':
                        return this.addKeyboardInput(inputSource, gameInput);
                    default:
                        console.error("Unsupported input type: ", inputSource.INPUT_TYPE);
                }
            }.bind(this));

            normalizeVector(gameInput.movementVector);

            return gameInput;
        },

        addKeyboardInput: function (keyboard, gameInput) {
            if (keyboard[ 'ENTER' ]) {
                gameInput.start = true;
            }

            if (keyboard[ 'SPACE' ]) {
                gameInput.fire = true;
            }

            if (keyboard[ 'W' ]) {
                gameInput.movementVector.y -= 1;
            }

            if (keyboard[ 'A' ]) {
                gameInput.movementVector.x -= 1;
            }

            if (keyboard[ 'S' ]) {
                gameInput.movementVector.y += 1;
            }

            if (keyboard[ 'D' ]) {
                gameInput.movementVector.x += 1;
            }
        },

        addGamepadInput: function (gamepad, gameInput) {
            if (gamepad[ 'start' ]) {
                gameInput.start = true;
            }

            if (gamepad[ 'A' ]) {
                gameInput.fire = true;
            }

            gameInput.movementVector.x += gamepad[ 'left-stick-x' ];
            gameInput.movementVector.y += gamepad[ 'left-stick-y' ];

            if (gamepad[ 'd-pad-up' ]) {
                gameInput.movementVector.y -= 1;
            }
            if (gamepad[ 'd-pad-left' ]) {
                gameInput.movementVector.x -= 1;
            }
            if (gamepad[ 'd-pad-down' ]) {
                gameInput.movementVector.y += 1;
            }
            if (gamepad[ 'd-pad-right' ]) {
                gameInput.movementVector.x += 1;
            }
        }
    });
});

DefineModule('helpers/pad-score-display', function () {
    return function (score) {
        score = score + "";
        switch (score.length) {
            case 0: score = "0" + score;
            case 1: score = "0" + score;
            case 2: score = "0" + score;
            case 3: score = "0" + score;
        }

        return score;
    };
});

DefineModule('helpers/random', function (require) {
    function integer(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function rangeCap(n, min, max) {
        if (typeof n !== "number" || n < min) {
            return min;
        }

        else if (n > max) {
            return max;
        }

        else {
            return n;
        }
    }

    function sample(collection, requestedCount) {
        requestedCount = rangeCap(requestedCount, 1, collection.length);
        var range = collection.length - 1;
        var selected = {};
        var count = 0;
        var choice;

        while (count < requestedCount) {
            choice = integer(0, range);
            if (!selected[ choice ]) {
                selected[ choice ] = true;
                count++;
            }
        }

        return Object.keys(selected).map(function (key) {
            return collection[ key ];
        });
    }

    return {
        integer: integer,
        rangeCap: rangeCap,
        sample: sample
    };
});

DefineModule('helpers/run-loop', function (require) {
    var fpsCounterDOM = null;

    function updateFPScounter(dtime) {
        if (!fpsCounterDOM) {
            fpsCounterDOM = document.createElement('div');
            fpsCounterDOM.classList.add('fps-counter');
            fpsCounterDOM.oldfps = 0;
            document.body.appendChild(fpsCounterDOM);
        }

        var fps = Math.floor(1000 / dtime * 10) / 10;
        if (Math.abs(fps - fpsCounterDOM.oldfps) > .2) {
            fpsCounterDOM.oldfps = fps;
            fps = fps + "";
            fps += (fps.length <= 2 ? ".0" : "") + " fps";
            fpsCounterDOM.innerHTML = fps;
        }
    }

    function now() {
        return (new Date()).valueOf();
    }

    function fpsTracker() {
        var frameTimes = [];

        for (var i = 0; i < 100; i++) {
            frameTimes.push(20);
        }
        frameTimes.totalTime = 20 * 100;

        frameTimes.push = function (ftime) {
            var overflow = this.shift();
            this.totalTime += ftime - overflow;
            return Array.prototype.push.call(this, ftime);
        };
        frameTimes.average = function () {
            return this.totalTime / this.length;
        };

        return frameTimes;
    }

    return DefineClass({
        constructor: function (callback) {
            this.callback = callback || function () {
                };

            this.fpsTracker = fpsTracker();
            this.active = false;
            this.lastFrameTime = now();
            this.boundFrameHandler = this.frameHandler.bind(this);
        },
        frameHandler: function () {
            if (!this.active) return;

            var currentTime = now();
            var dtime = currentTime - this.lastFrameTime;

            this.lastFrameTime = currentTime;
            this.updateFPScounter(dtime);

            try {
                this.callback(dtime);
            } catch (e) {
                console.error('Error running frame: ', e);
            }

            window.requestAnimationFrame(this.boundFrameHandler);
        },
        start: function () {
            if (!this.active) {
                this.active = true;
                window.requestAnimationFrame(this.boundFrameHandler);
            }
        },
        stop: function () {
            this.active = false;
        },
        addCallback: function (callback) {
            this.callback = callback;
        },
        updateFPScounter: function (dtime) {
            this.fpsTracker.push(dtime);

            updateFPScounter(this.fpsTracker.average());
        }
    });
});

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
        constructor: function (parent, game, difficultyMultiplier, rowCount, levelName) {
            this.super('constructor', arguments);

            this.difficultyMultiplier = difficultyMultiplier;
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
            var ship = new EnemyShip(this, this.difficultyMultiplier);

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
            var boss = window.boss = new BossShip(this, this.difficultyMultiplier);
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
            this.scripts.push(new WatchForDeath(this, boss, function () {
                var p = boss.position;
                this.addChild(new MoneyDrop(this, {
                    x: p.x,
                    y: p.y
                }));
                this.addChild(new MoneyDrop(this, {
                    x: p.x + 7,
                    y: p.y
                }));
                this.addChild(new MoneyDrop(this, {
                    x: p.x + 4,
                    y: p.y + 8
                }));
            }.bind(this)));

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

DefineModule('levels/level-group-02', function (require) {
    var GameObject = require('models/game-object');
    var FlyingSaucer = require('ships/flying-saucer');

    return DefineClass(GameObject, {
        constructor: function (parent, game, difficultyMultiplier, shipCount, levelName) {
            this.super('constructor', arguments);

            if (groupCount === "boss") {
                groupCount = 1;
                this.boss = true;
            }

            this.game = game;
            this.levelName = levelName;
            this.rowCount = groupCount;
        },

        start: function () {

        },

        checkIfLevelComplete: function () {

        }
    });
});

DefineModule('levels/level-manager', function (require) {
    var FlyPlayerInFromBottom = require('scripts/fly-player-in-from-bottom');
    var GameObject = require('models/game-object');
    var Level_group_01 = require('levels/level-group-01');
    var Shop = require('levels/shop');

    return DefineClass(GameObject, {
        constructor: function (game) {
            this.game = game;
            this.width = game.width;
            this.height = game.height;
            this.player = game.player;

            this.super('constructor', arguments);
        },

        reset: function () {
            this.super('reset');

            this.levelNameCounter = 0;
            this.difficultyMultiplier = 1;
            this.running = false;
            this.complete = false;
            this.currentLevel = null;
            this.shop = new Shop(this, this.game);

            this.loadLevels();
        },
        loadLevels: function () {
            this.levels = [
                new Level_group_01(this, this.game, this.difficultyMultiplier, 1, this.levelName()),
                new Level_group_01(this, this.game, this.difficultyMultiplier, 2),
                new Level_group_01(this, this.game, this.difficultyMultiplier, 3),
                new Level_group_01(this, this.game, this.difficultyMultiplier, "boss"),
                this.shop
            ];
            this.levelIndex = -1;
        },
        start: function () {
            this.running = true;
            this.loadNextLevel();
        },

        stop: function () {
            this.running = false;
            this.removeChild(this.currentLevel);
            this.currentLevel = null;
        },

        loadNextLevel: function () {
            if (this.levelIndex >= this.levels.length - 1) { // last level was completed
                this.difficultyMultiplier++;
                this.loadLevels();
            }

            this.levelIndex++;
            this.currentLevel = this.levels[ this.levelIndex ];

            if (this.currentLevel.isShop) {
                this.game.clearBullets();
                this.player.hideOffscreen();
            }

            if (this.currentLevel.levelName) { // kinda derp way of knowing where the level blocks start
                this.addChild(new FlyPlayerInFromBottom(this, this.game).start());
                this.player.refillHealth();
            }

            this.addChild(this.currentLevel);
            this.currentLevel.start();
        },
        update: function () {
            this.super('update', arguments);

            if (this.currentLevel && this.currentLevel.checkIfLevelComplete()) {
                if (this.currentLevel.isShop) {
                    this.removeChild(this.currentLevel);
                } else {
                    this.currentLevel.destroy();
                }

                this.loadNextLevel();
            }
        },

        levelName: function () {
            this.levelNameCounter++;
            return "LEVEL " + this.pad(this.levelNameCounter);
        },
        pad: function (val) {
            if (val < 10) {
                return "00" + val;
            }
            if (val < 100) {
                return "0" + val;
            }
        }
    });
});

DefineModule('levels/shop', function (require) {
    var ArrowShip = require('sprites/arrow-ship');
    var Bullet = require('components/bullet');
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        isShop: true,
        index: 1,
        headerDef: { message: "Ship Upgrades", position: { x: 50, y: 10 } },
        menuItems: {
            health: { message: "+1 Ship Health", position: { x: 90, y: 50 } },
            rate: { message: "10% faster Firing Rate", position: { x: 90, y: 65 } },
            damage: { message: "+1 Bullet Damage", position: { x: 90, y: 80 } },
            guns: { message: "Install wing guns", position: { x: 90, y: 95 } },
            leave: { message: "Leave Shop", position: { x: 60, y: 110 } }
        },
        menuSelectorPositions: [ 49, 64, 79, 94, 109 ],
        disabledColor: "#777",

        constructor: function (parent, game) {
            this.game = game;
            this.bank = game.bank;
            this.player = game.player;

            this.input = new EventedInput({
                onUp: this.onUp.bind(this),
                onDown: this.onDown.bind(this),
                onSelect: this.onSelect.bind(this)
            });

            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset', arguments);

            this.input.reset();
            this.isDoneShopping = false;
            this.selectedMenuItem = 0;
            this.createMenuText();
            this.setCosts();
            this.createSelectorShip();

            this.addChild(this.input);
        },
        start: function () {
            this.input.reset();
            this.isDoneShopping = false;
            this.setCosts();
        },
        checkIfLevelComplete: function () {
            return this.isDoneShopping;
        },
        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceSelected += dtime;
            if (this.selecting && this.timeSinceSelected > 595) {
                this.propagateSelection();
            }
        },

        createMenuText: function () {
            this.titleText = new TextDisplay(this, {
                font: "arcade",
                message: this.headerDef.message,
                position: this.headerDef.position,
                color: this.game.interfaceColor
            });
            this.addChild(this.titleText);

            Object.keys(this.menuItems).forEach(function (key) {
                var item = this.menuItems[ key ];

                item.description = new TextDisplay(this, {
                    font: "arcade-small",
                    message: item.message,
                    position: item.position,
                    color: this.game.interfaceColor,
                    isPhysicalEntity: true
                });
                this.addChild(item.description);

                item.costText = new TextDisplay(this, {
                    font: "arcade-small",
                    message: '',
                    position: { x: item.position.x - 30, y: item.position.y },
                    color: this.game.interfaceColor,
                    isPhysicalEntity: true
                });
                this.addChild(item.costText);
            }.bind(this));
        },
        setCosts: function () {
            var items = this.menuItems;
            var player = this.player;
            var bank = this.bank;

            items.health.cost = 10 + player.lifeUpgrades * 10;
            items.rate.cost = 50 + player.rateUpgrades * 50;
            items.damage.cost = 100 + player.damageUpgrades * 100;
            items.guns.cost = player.wingGunsUnlocked ? -1 : 1000;

            items.damage.costText.changeMessage("$" + items.damage.cost);
            items.health.costText.changeMessage("$" + items.health.cost);
            items.rate.costText.changeMessage("$" + items.rate.cost);
            items.guns.costText.changeMessage(player.wingGunsUnlocked ? "--" : "$" + items.guns.cost);
            items.leave.description.changeMessage(items.leave.message);

            items.health.costText.updateColor(items.health.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
            items.rate.costText.updateColor(items.rate.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
            items.damage.costText.updateColor(items.damage.cost > bank.value ? this.disabledColor : this.game.interfaceColor);
            items.guns.costText.updateColor(items.guns.cost > bank.value || player.wingGunsUnlocked ? this.disabledColor : this.game.interfaceColor);
        },
        createSelectorShip: function () {
            this.selectorShip = new GameObject();
            this.selectorShip.sprite = new ArrowShip();
            this.selectorShip.position = { x: 40, y: 0 };
            this.addChild(this.selectorShip);

            this.updateSelectorPosition();
        },
        updateSelectorPosition: function () {
            this.selectorShip.position.y = this.menuSelectorPositions[ this.selectedMenuItem ];
        },
        onUp: function () {
            if (!this.selecting && this.selectedMenuItem > 0) {
                this.selectedMenuItem--;
                this.updateSelectorPosition();
            }
        },
        onDown: function () {
            if (!this.selecting && this.selectedMenuItem < this.menuSelectorPositions.length - 1) {
                this.selectedMenuItem++;
                this.updateSelectorPosition();
            }
        },
        onSelect: function () {
            if (!this.selecting) {
                var selection;
                switch (this.selectedMenuItem) {
                    case 0: selection = this.menuItems.health; break;
                    case 1: selection = this.menuItems.rate; break;
                    case 2: selection = this.menuItems.damage; break;
                    case 3: selection = this.menuItems.guns; break;
                    case 4: this.startGame(); return;
                    default: return;
                }

                if (this.bank.value >= selection.cost && selection.cost !== -1) {
                    this.bank.removeMoney(selection.cost);
                    this.startGame();
                }
            }
        },
        startGame: function () {
            this.selecting = true;
            this.timeSinceSelected = 0;

            var x1 = this.selectorShip.position.x + this.selectorShip.sprite.width;
            var y = this.selectorShip.position.y + Math.floor(this.selectorShip.sprite.height / 2);

            this.addChild(new Bullet(this, {
                team: 2,
                position: { x: x1, y: y },
                velocity: { x: 50, y: 0 }
            }));
        },
        propagateSelection: function () {
            switch (this.selectedMenuItem) {
                case 0:
                    this.player.lifeUpgrades++;
                    this.player.maxLife++;
                    break;

                case 1: // rate
                    this.player.rateUpgrades++;
                    this.player.FIRE_RATE = Math.ceil(this.player.FIRE_RATE * .9);
                    break;

                case 2: // damage
                    this.player.damageUpgrades++;
                    break;

                case 3: // guns
                    this.player.addWingGuns();
                    break;

                case 4: // done shopping
                    this.isDoneShopping = true;
                    break;
            }

            this.setCosts();
            this.selecting = false;
        }
    });
});

DefineModule('models/animation', function (require) {
    return DefineClass({
        finished: false,
        constructor: function (options) {
            this.frames = options.frames;
            this.millisPerFrame = options.millisPerFrame || 100;
            this.currentFrame = options.offsetIndex || 0;
            this.loop = options.loop;

            this.width = this.frames[ 0 ].width;
            this.height = this.frames[ 0 ].height;
            this.millisEllapsedOnFrame = 0;
        },
        update: function (dtime) {
            if (this.finished) return;

            this.millisEllapsedOnFrame += dtime;

            if (this.millisEllapsedOnFrame >= this.millisPerFrame) {
                this.millisEllapsedOnFrame -= this.millisPerFrame;
                this.currentFrame += 1;

                if (this.currentFrame >= this.frames.length) {
                    if (this.loop) {
                        this.currentFrame = 0;
                    }
                    else {
                        this.finished = true;
                    }
                }
            }
        },
        renderToFrame: function (frame, x, y, index) {
            if (this.finished) return;

            this.frames[ this.currentFrame ].renderToFrame(frame, x, y, index);
        }
    });
});

DefineModule('models/cell-grid', function (require) {
    return DefineClass({
        iterateCells: function (handler) {
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    handler(this.cells[ x ][ y ], x, y);
                }
            }
        },
        cellAt: function (x, y) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                return this.cells[ x ][ y ];
            }
            else {
                return { x: -1, y: -1, color: "#000000", index: -1 };
            }
        }
    });
});

DefineModule('models/evented-input', function (require) {
    return DefineClass({
        constructor: function (options) {
            this.onUp = options.onUp || function () {};
            this.onDown = options.onDown || function () {};
            this.onFire = options.onFire || function () {};
            this.onStart = options.onStart || function () {};
            this.onSelect = options.onSelect || function () {};

            this.reset();
        },

        reset: function () {
            this.upReleased = false;
            this.downReleased = false;
            this.fireReleased = false;
            this.startReleased = false;
        },

        processInput: function (input) {
            if (input.movementVector.y < .6) {
                this.downReleased = true;
            }
            if (input.movementVector.y > -.6) {
                this.upReleased = true;
            }
            if (!input.start) {
                this.startReleased = true;
            }
            if (!input.fire) {
                this.fireReleased = true;
            }

            if (input.movementVector.y >= .6 && this.downReleased) {
                this.downReleased = false;
                this.onDown();
            }
            if (input.movementVector.y <= -.6 && this.upReleased) {
                this.upReleased = false;
                this.onUp();
            }
            if (input.start && this.startReleased) {
                this.startReleased = false;
                this.onStart();
                this.onSelect();
            }
            if (input.fire && this.fireReleased) {
                this.fireReleased = false;
                this.onFire();
                this.onSelect();
            }
        }
    });
});

DefineModule('models/frame', function (require) {
    var CellGrid = require('models/cell-grid');

    return DefineClass(CellGrid, {
        constructor: function Frame(dimensions) {
            this.width = dimensions.width;
            this.height = dimensions.height;
            this.cells = [];

            for (var x = 0; x < this.width; x++) {
                this.cells[ x ] = [];

                for (var y = 0; y < this.height; y++) {
                    this.cells[ x ][ y ] = {
                        x: x,
                        y: y,
                        render_x: x * dimensions.pixelSize,
                        render_y: y * dimensions.pixelSize,
                        color: "#000000",
                        index: -1
                    };
                }
            }
        },
        clear: function () {
            var color = this.fillColor;
            if (color) {
                this.iterateCells(function (cell) {
                    cell.color = color;
                    cell.index = -1;
                });
            }
        },
        setFillColor: function (fillColor) {
            this.fillColor = fillColor;
        }
    });
});

DefineModule('models/game-object', function (require) {
    return DefineClass({
        damage: 0,
        constructor: function (parentObj) {
            this.parent = parentObj;

            this.reset();
        },
        reset: function () {
            this.children = [];
            this.destroyed = false;
        },
        triggerEvent: function (event, data) {
            var entityRef = this.parent;

            while (entityRef) {
                if (typeof entityRef[ event ] === 'function') {
                    entityRef[ event ](data);
                    return;
                }

                entityRef = entityRef.parent;
            }

            console.error("Couldn't find event '" + event + "' in parent chain of ", this);
        },
        processInput: function (input) {
            this.children && this.children.forEach(function (child) {
                if (typeof child.processInput === "function") {
                    child.processInput(input);
                }
            });
        },
        update: function (dtime) {
            this.children && this.children.forEach(function (child) {
                if (typeof child.update === "function") {
                    child.update(dtime);
                }
            });

            if (this.sprite) {
                this.sprite.update(dtime);
            }

            if (this.position && this.velocity) {
                this.position.x += this.velocity.x * dtime / 1000;
                this.position.y += this.velocity.y * dtime / 1000;
            }

            this.checkBoundaries();

            if (this.exploding && this.sprite.finished) {
                this.destroy();
            }
        },
        checkBoundaries: function () {
            /* a place to verify that objects are within the screen constraints */
        },
        renderToFrame: function (frame) {
            this.children && this.children.forEach(function (child) {
                if (typeof child.renderToFrame === "function") {
                    child.renderToFrame(frame);
                }
            });

            if (this.sprite && this.position) {
                this.sprite.renderToFrame(frame, Math.floor(this.position.x), Math.floor(this.position.y), this.index || 0);
            }
        },
        addChild: function (child) {
            if (child) {
                this.children.push(child);
            }
        },
        removeChild: function (child) {
            if (child) {
                var index = this.children.indexOf(child);
                if (index >= 0) {
                    this.children.splice(index, 1);
                }
            }
        },
        destroy: function () {
            if (this.parent && this.parent.removeChild) {
                this.parent.removeChild(this);
            }

            this.children = null; // may need to iterate through children and destroy them too
            this.destroyed = true;
        },
        applyDamage: function (damage, sourceEntity) {
            if (this.maxLife) {
                this.life -= damage;

                if (this.life <= 0) {
                    this.exploding = true;
                    this.sprite = this.explosion();

                    if (this.velocity) {
                        this.velocity.x = 0;
                        this.velocity.y = 0;
                    }
                    if (this.acceleration) {
                        this.acceleration.x = 0;
                        this.acceleration.y = 0;
                    }
                }
            }
        }
    });
});

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

DefineModule('models/script-chain', function (require) {
    var GameObject = require('models/game-object');
    return DefineClass(GameObject, {
        constructor: function (parent, repeat, scripts) {
            this.super('constructor', arguments);

            this.repeat = repeat;
            this.scripts = scripts;
            this.scriptIndex = 0;
            this.activeScript = null;

            var self = this;
            scripts.forEach(function (script) {
                script.parent = self;
            });
        },

        start: function () {
            this.activeScript = this.scripts[ this.scriptIndex ];
            this.activeScript.start();
        },

        update: function (dtime) {
            this.activeScript.update(dtime);
        },

        removeChild: function () {
            this.scriptIndex++;
            if (this.scriptIndex >= this.scripts.length) {
                if (this.repeat) {
                    this.scriptIndex = 0;
                } else {
                    this.parent.removeChild(this);
                    return;
                }
            }

            this.activeScript = this.scripts[ this.scriptIndex ];
            this.activeScript.start();
        }
    });
});

DefineModule('models/sprite-group', function (require) {
    return DefineClass({
        constructor: function (sprites) {
            this.spriteDescriptors = sprites || [];

            this.width = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
                return descriptor.x + descriptor.sprite.width;
            }));

            this.height = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
                return descriptor.y + descriptor.sprite.height;
            }));
        },

        update: function (dtime) {
            var finished = true;

            this.spriteDescriptors.forEach(function (descriptor) {
                descriptor.sprite.update(dtime);

                if (!descriptor.sprite.finished) {
                    finished = false;
                }
            });

            this.finished = finished;
        },

        renderToFrame: function (frame, x, y, index) {
            this.spriteDescriptors.forEach(function (descriptor) {
                descriptor.sprite.renderToFrame(
                    frame,
                    x + descriptor.x,
                    y + descriptor.y,
                    index
                );
            });
        }
    });
});

DefineModule('models/sprite', function (require) {
    var CellGrid = require('models/cell-grid');

    var Sprite = DefineClass(CellGrid, {
        finished: true,
        constructor: function Sprite(pixels, meta) {
            this.meta = meta || {};
            this.width = pixels.length;
            this.height = pixels[ 0 ].length;
            this.offsetAdjustment = { x: 0, y: 0 };

            this.cells = [];
            for (var x = 0; x < this.width; x++) {
                this.cells[ x ] = [];
                for (var y = 0; y < this.height; y++) {
                    this.cells[ x ][ y ] = {
                        x: x,
                        y: y,
                        color: pixels[ x ][ y ]
                    };
                }
            }
        },
        setPermanentOffset: function (offset) {
            offset = offset || { };
            this.offsetAdjustment.x = offset.x || 0;
            this.offsetAdjustment.y = offset.y || 0;

            return this;
        },
        applyColor: function (color) {
            this.iterateCells(function (cell) {
                if (cell.color) {
                    cell.color = color;
                }
            });

            return this;
        },
        update: function (dtime) {
            /*
             sprites ignore updates by default, but accept the event
             so that the api signature of sprites and animations matches
             */
        },
        renderToFrame: function (frame, x, y, index) {
            index = index || 0;
            var offset_x = this.offsetAdjustment.x;
            var offset_y = this.offsetAdjustment.y;
            this.iterateCells(function (cell, _x, _y) {
                if (cell.color) {
                    var frameCell = frame.cellAt(x + _x + offset_x, y + _y + offset_y);
                    if (index >= frameCell.index) {
                        frameCell.color = cell.color;
                        frameCell.index = index;
                    }
                }
            });
        },
        clone: function () {
            var colorGrid = [];
            for (var x = 0; x < this.width; x++) {
                colorGrid[ x ] = [];
                for (var y = 0; y < this.height; y++) {
                    colorGrid[ x ][ y ] = this.cells[ x ][ y ].color;
                }
            }

            var sprite = new Sprite(colorGrid);
            sprite.setPermanentOffset(this.offsetAdjustment);

            return sprite;
        },
        rotateLeft: function () {
            var width = this.width;
            var height = this.height;
            var oldCells = this.cells;
            var newCells = [];
            var x, y;

            for (x = 0; x < height; x++) {
                newCells[ x ] = [];
            }

            for (x = 0; x < width; x++) {
                for (y = 0; y < height; y++) {
                    newCells[ y ][ width - x - 1 ] = {
                        x: y,
                        y: width - x - 1,
                        color: oldCells[ x ][ y ].color
                    };
                }
            }

            this.width = height;
            this.height = width;
            this.cells = newCells;
            return this;
        },
        rotateRight: function () {
            return this
                .rotateLeft()
                .rotateLeft()
                .rotateLeft();
        },
        invertX: function () {
            for (var x = 0; x < this.width / 2; x++) {
                var left = this.cells[ x ];
                var right = this.cells[ this.width - x - 1 ];
                this.cells[ x ] = right;
                this.cells[ this.width - x - 1 ] = left;
            }
            return this;
        },
        invertY: function () {
            for (var x = 0; x < this.width; x++) {
                this.cells[ x ].reverse();
            }
            return this;
        }
    });

    return Sprite;
});

DefineModule('screens/controls-description', function (require) {
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        headerDef: {
            font: "arcade",
            message: "Controls",
            color: "white",
            position: { x: 5, y: 5 }
        },
        inputDescriptions: [
            {
                message: [ "", "Move", "Fire" ],
                position: { x: 5, y: 20 }
            },
            {
                message: [ "- Keyboard", "- WASD", "- Space" ],
                position: { x: 35, y: 20 }
            },
            {
                message: [ "- Controller", "- Left Stick", "- A" ],
                position: { x: 85, y: 20 }
            }
        ],

        reset: function () {
            this.super('reset');

            this.addChild(new TextDisplay(this, this.headerDef));

            this.inputDescriptions.forEach(function (item) {
                this.addChild(new TextDisplay(this, {
                    font: "arcade-small",
                    color: "#F6EC9A",
                    message: item.message,
                    position: item.position
                }))
            }.bind(this));

            this.addChild(new EventedInput({
                onSelect: this.onSelect.bind(this)
            }));
        },

        onSelect: function () {
            this.parent.reset();
        }
    })
});

DefineModule('screens/game-over-screen', function (require) {
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var padScoreDisplay = require('helpers/pad-score-display');
    var TextDisplay = require('components/text-display');

    return DefineClass(GameObject, {
        headerDef: {
            font: "arcade",
            border: 1,
            padding: 20,
            position: { x: 45, y: 45 }
        },
        subHeaderDef: {
            font: "arcade-small",
            message: "Final Score:",
            position: { x: 66, y: 81 }
        },
        scoreDisplayDef: {
            font: "arcade-small",
            message: "0",
            color: "yellow",
            position: { x: 110, y: 81 }
        },

        constructor: function () {
            this.header = new TextDisplay(this, this.headerDef);
            this.subHeader = new TextDisplay(this, this.subHeaderDef);
            this.scoreDisplay = new TextDisplay(this, this.scoreDisplayDef);

            this.inputEvents = new EventedInput({
                onStart: this.onStart.bind(this)
            });

            this.super('constructor', arguments);
        },

        reset: function () {
            this.super('reset');

            this.addChild(this.header);
            this.addChild(this.subHeader);
            this.addChild(this.scoreDisplay);

            this.addChild(this.inputEvents);
        },

        onStart: function () {
            this.parent.finishGame();
        },

        setResult: function (result) {
            if (result === "win") {
                this.header.updateColor("green");
                this.subHeader.updateColor("green");
                this.header.changeMessage("YOU WIN!");
            } else if (result === "loss") {
                this.header.updateColor("red");
                this.subHeader.updateColor("red");
                this.header.changeMessage("GAME OVER");
            }
        },

        setFinalScore: function (score) {
            this.scoreDisplay.changeMessage(padScoreDisplay(score));
        }
    })
});

DefineModule('screens/title-screen', function (require) {
    var Bullet = require('components/bullet');
    var EventedInput = require('models/evented-input');
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');
    var ArrowShip = require('sprites/arrow-ship');

    return DefineClass(GameObject, {
        headerDef: { message: "PHOENIX", position: { x: 50, y: 30 } },
        menuItems: [
            { message: "New", position: { x: 90, y: 90 } },
            { message: "Load", position: { x: 89, y: 105 } },
            { message: "controls", position: { x: 84, y: 120 } }
        ],

        reset: function () {
            this.super('reset');

            this.selectedMenuItem = 0;
            this.timeSinceSelected = 0;
            this.selecting = false;

            this.addDisplayText();
            this.createShipSelectors();

            this.addChild(new EventedInput({
                onUp: this.onUp.bind(this),
                onDown: this.onDown.bind(this),
                onSelect: this.onSelect.bind(this)
            }));
        },

        addDisplayText: function () {
            this.addChild(new TextDisplay(this, {
                font: 'phoenix',
                message: this.headerDef.message,
                position: this.headerDef.position
            }));

            this.menuItems.forEach(function (item) {
                this.addChild(new TextDisplay(this, {
                    font: "arcade-small",
                    message: item.message,
                    position: item.position,
                    isPhysicalEntity: true
                }));
            }.bind(this));
        },

        createShipSelectors: function () {
            this.selectorShip = new GameObject();
            this.selectorRight = new GameObject();

            this.selectorShip.sprite = new ArrowShip();
            this.selectorRight.sprite = new ArrowShip().invertX();

            this.selectorShip.position = { x: 70, y: 0 };
            this.selectorRight.position = { x: 115, y: 0 };

            this.addChild(this.selectorShip);
            this.addChild(this.selectorRight);

            this.updateSelectorPosition();
        },

        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceSelected += dtime;
            if (this.selecting && this.timeSinceSelected > 595) {
                this.propagateSelection();
            }
        },

        onUp: function () {
            if (this.selectedMenuItem > 0 && !this.selecting) {
                this.selectedMenuItem--;
                this.updateSelectorPosition();
            }
        },

        onDown: function () {
            if (this.selectedMenuItem < this.menuItems.length - 1 && !this.selecting) {
                this.selectedMenuItem++;
                this.updateSelectorPosition();
            }
        },

        onSelect: function () {
            if (!this.selecting) {
                this.startGame();
            }
        },

        updateSelectorPosition: function () {
            var selectedY = this.menuItems[ this.selectedMenuItem ].position.y;

            this.selectorShip.position.y = selectedY;
            this.selectorRight.position.y = selectedY;
        },

        startGame: function () {
            this.selecting = true;
            this.timeSinceSelected = 0;

            var x1 = this.selectorShip.position.x + this.selectorShip.sprite.width;
            var x2 = this.selectorRight.position.x;
            var y = this.selectorShip.position.y + Math.floor(this.selectorShip.sprite.height / 2);

            this.addChild(new Bullet(this, {
                team: 2,
                position: { x: x1, y: y },
                velocity: { x: 50, y: 0 }
            }));
            this.addChild(new Bullet(this, {
                team: 3,
                position: { x: x2, y: y },
                velocity: { x: -50, y: 0}
            }));
        },

        propagateSelection: function () {
            this.destroy();
            switch (this.selectedMenuItem) {
                case 0:
                case 1:
                    this.parent.startNewGame();
                    break;
                case 2:
                    this.parent.showControlsScreen();
                    break;
                default:
                    console.error('Unsupported menu option');
            }

        }
    });
});

DefineModule('ships/arrow-boss', function (require) {
    var GameObject = require('models/game-object');
    var shipSprite = require('sprites/arrow-boss');
    var shipExplosion = require('sprites/animations/ship-explosion');
    var MuzzleFlash = require('components/muzzle-flash');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        BULLET_SPEED: 120,
        team: 1,
        index: 5,

        constructor: function (parent, difficultyMultiplier) {
            this.difficultyMultiplier = difficultyMultiplier;
            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.sprite = shipSprite().rotateRight();
            this.explosion = shipExplosion;
            this.guns = this.sprite.meta.guns;

            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };

            this.damage = 50 * this.difficultyMultiplier;
            this.life = 25 * this.difficultyMultiplier;
            this.maxLife = 25 * this.difficultyMultiplier;
        },
        fire: function (gunIndex) {
            var gun = this.guns[ gunIndex ];

            var position = {
                x: this.position.x + gun.x,
                y: this.position.y + gun.y
            };
            var velocity = { x: 0, y: this.BULLET_SPEED };

            this.triggerEvent('spawnBullet', {
                team: this.team,
                position: position,
                velocity: velocity,
                damage: this.difficultyMultiplier
            });
            this.addChild(new MuzzleFlash(this, gun));
        },
        applyDamage: function () {
            this.triggerEvent('enemyHit');
            this.super('applyDamage', arguments);
        },
        destroy: function () {
            this.triggerEvent('enemyDestroyed', {
                shipValue: this.maxLife
            });

            this.super('destroy', arguments);
        }
    });
});

DefineModule('ships/arrow-ship', function (require) {
    var GameObject = require('models/game-object');
    var MuzzleFlash = require('components/muzzle-flash');
    var shipSprite = require('sprites/arrow-ship');
    var shipExplosion = require('sprites/animations/ship-explosion');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        BULLET_SPEED: 100,
        team: 1,
        index: 5,

        constructor: function (parent, difficultyMultiplier) {
            this.difficultyMultiplier = difficultyMultiplier;
            this.super('constructor', arguments);
        },
        reset: function () {
            this.super('reset');

            this.sprite = shipSprite().rotateRight();
            this.explosion = shipExplosion;
            this.gun = this.sprite.meta.guns[ 0 ];

            this.position = { x: 0, y: 0 };
            this.velocity = { x: 0, y: 0 };

            this.damage = 5 * this.difficultyMultiplier;
            this.maxLife = this.difficultyMultiplier;
            this.life = this.difficultyMultiplier;
        },
        fire: function () {

            var position = {
                x: this.position.x + this.gun.x,
                y: this.position.y + this.gun.y
            };
            var velocity = { x: 0, y: this.BULLET_SPEED };

            this.triggerEvent('spawnBullet', {
                team: this.team,
                position: position,
                velocity: velocity,
                damage: this.difficultyMultiplier
            });
            this.addChild(new MuzzleFlash(this, this.gun));
        },
        applyDamage: function () {
            this.triggerEvent('enemyHit');
            this.super('applyDamage', arguments);
        },
        destroy: function () {
            this.triggerEvent('enemyDestroyed', {
                shipValue: this.maxLife
            });

            this.super('destroy', arguments);
        }
    });
});

DefineModule('ships/flying-saucer', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        BULLET_SPEED: 100,
        team: 1,
        index: 5,

        reset: function () {
            this.super('reset');
        }
    });
});

DefineModule('ships/player-controlled-ship', function (require) {
    var GameObject = require('models/game-object');
    var MuzzleFlash = require('components/muzzle-flash');
    var playerShipSprite = require('sprites/player-ship');
    var playerShipSpriteWingGuns = require('sprites/player-ship-wing-guns');
    var shipExplosion = require('sprites/animations/ship-explosion');

    return DefineClass(GameObject, {
        type: "player",
        isPhysicalEntity: true,
        index: 5,

        reset: function () {
            this.super('reset');

            this.sprite = playerShipSprite().rotateRight();
            this.explosion = shipExplosion;

            this.position = { x: -100, y: -100 };
            this.velocity = { x: 0, y: 0 };

            this.life = 10;
            this.maxLife = 10;
            this.damageUpgrades = 0;
            this.lifeUpgrades = 0;
            this.rateUpgrades = 0;
            this.wingGunsUnlocked = false;
            this.SPEED = 50;
            this.BULLET_SPEED = 100;
            this.FIRE_RATE = 500;

            this.preventInputControl = true;
            this.exploding = false;
            this.team = 0;
            this.damage = 5;
            this.timeSinceFired = 0;
        },
        refillHealth: function () {
            this.life = this.maxLife;
        },
        addWingGuns: function () {
            this.wingGunsUnlocked = true;
            this.sprite = playerShipSpriteWingGuns().rotateRight();
        },
        processInput: function (input) {
            this.super('processInput', arguments);
            if (this.preventInputControl || this.exploding || this.destroyed) {
                // ship in a state where input isn't appropriate
                return;
            }

            this.velocity.x = input.movementVector.x * this.SPEED;
            this.velocity.y = input.movementVector.y * this.SPEED;

            this.firing = input.fire;
        },
        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceFired += dtime;
            if (this.firing && this.timeSinceFired > this.FIRE_RATE) {
                this.timeSinceFired = 0;

                this.fire();
            }
        },
        hideOffscreen: function () {
            this.preventInputControl = true;
            this.position.x = -100;
            this.velocity.x = 0;
            this.velocity.y = 0;
        },
        checkBoundaries: function () {
            if (this.preventInputControl) {
                // don't check screen boundaries when an external script is controlling the player
                return;
            }

            if (this.position.x < 0) {
                this.position.x = 0;
            }
            if (this.position.y < 0) {
                this.position.y = 0;
            }
            if (this.position.x + this.sprite.width > this.parent.width) {
                this.position.x = this.parent.width - this.sprite.width;
            }
            if (this.position.y + this.sprite.height > this.parent.height) {
                this.position.y = this.parent.height - this.sprite.height;
            }
        },
        fire: function () {
            this.sprite.meta.guns.forEach(function (gun, index) {
                this.triggerEvent('spawnBullet', {
                    team: this.team,
                    damage: this.damageUpgrades + 1,
                    velocity: {
                        x: this.wingGunsUnlocked ? (index - 1) * 10 : 0,
                        y: -this.BULLET_SPEED
                    },
                    position: {
                        x: this.position.x + gun.x,
                        y: this.position.y + gun.y
                    }
                });

                this.addChild(new MuzzleFlash(this, gun));
            }.bind(this));
        },

        applyDamage: function (damage, sourceEntity) {
            if (damage > 0) {
                this.triggerEvent('playerHit');
            }

            this.super('applyDamage', arguments);
        }
    });
});

DefineModule('scripts/chain-gun-fire', function (require) {
    var GameObject = require('models/game-object');
    var Random = require('helpers/random');

    return DefineClass(GameObject, {
        constructor: function (parent, ship, options) {
            this.super('constructor', arguments);
            options = options || {};

            this.ship = ship;
            this.gunIndex = options.gunIndex || 0;
            this.fireRate = options.fireRate || 150;
            this.burstSize = options.burstSize || 5;
            this.thresholdMin = options.thresholdMin || 2000;
            this.thresholdMax = options.thresholdMax || 6000;
        },

        start: function () {
            this.resetTimer();
            this.threshold += this.thresholdMax;
        },

        update: function (dtime) {
            if (this.ship.destroyed) {
                this.destroy();
            }

            this.elapsed += dtime;

            if (this.firing) {

                if (this.elapsed > this.fireRate) {
                    this.elapsed -= this.fireRate;
                    this.burstCount++;
                    this.ship.fire(this.gunIndex);

                    if (this.burstCount > this.burstSize) {
                        this.firing = false;
                        this.resetTimer();
                    }
                }

            }
            else {

                if (this.elapsed > this.threshold) {
                    this.firing = true;
                    this.elapsed = 0;
                    this.burstCount = 0;
                }

            }
        },

        resetTimer: function () {
            this.elapsed = 0;
            this.threshold = Random.integer(this.thresholdMin, this.thresholdMax);
        }
    });
});

DefineModule('scripts/fire-single-gun-random-rate', function (require) {
    var GameObject = require('models/game-object');
    var Random = require('helpers/random');

    return DefineClass(GameObject, {
        constructor: function (parent, ship, options) {
            this.super('constructor', arguments);
            options = options || {};

            this.ship = ship;
            this.gunIndex = options.gunIndex || 0;
            this.thresholdMin = options.thresholdMin || 1000;
            this.thresholdMax = options.thresholdMax || 3000;
        },

        start: function () {
            this.resetTimer();
            this.threshold += this.thresholdMax;
        },

        update: function (dtime) {
            if (this.ship.destroyed) {
                this.destroy();
            }

            this.elapsed += dtime;

            if (this.elapsed > this.threshold) {
                this.resetTimer();
                this.ship.fire(this.gunIndex);
            }
        },

        resetTimer: function () {
            this.elapsed = 0;
            this.threshold = Random.integer(this.thresholdMin, this.thresholdMax);
        }
    });
});

DefineModule('scripts/fly-player-in-from-bottom', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, game) {
            this.super('constructor', arguments);

            this.game = game;
            this.player = game.player;
        },
        start: function () {
            this.player.preventInputControl = true;

            var position = this.player.position;
            var velocity = this.player.velocity;

            position.x = Math.floor(this.game.width / 2 - this.player.sprite.width / 2);
            position.y = this.game.height + 30;
            velocity.x = 0;
            velocity.y = -this.player.SPEED / 5;

            return this;
        },
        update: function (dtime) {
            this.super('update', arguments);

            if (this.player.position.y < this.game.height - this.player.sprite.height - 2) {
                this.player.preventInputControl = false;
                this.destroy();
            }
        }
    });
});

DefineModule('scripts/move-object-to-point', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, object, targetPoint, timeDelta) {
            this.super('constructor', arguments);

            this.object = object;
            this.target = targetPoint;
            this.delta = timeDelta;
        },
        start: function () {
            var current = this.object.position;

            var xDiff = this.target.x - current.x;
            var yDiff = this.target.y - current.y;

            this.object.velocity.x = xDiff / this.delta;
            this.object.velocity.y = yDiff / this.delta;

            this.xPositive = xDiff > 0;
            this.yPositive = yDiff > 0;
        },
        update: function (dtime) {
            this.super('update', arguments);

            if (this.metXThreshold() && this.metYThreshold()) {
                this.object.velocity.x = 0;
                this.object.velocity.y = 0;

                this.object.position.x = this.target.x;
                this.object.position.y = this.target.y;

                this.parent.removeChild(this);
            }
        },

        metXThreshold: function () {
            return (
                this.xPositive && this.object.position.x >= this.target.x ||
                !this.xPositive && this.object.position.x <= this.target.x
            );
        },

        metYThreshold: function () {
            return (
                this.yPositive && this.object.position.y >= this.target.y ||
                !this.yPositive && this.object.position.y <= this.target.y
            );
        }
    });
});

DefineModule('scripts/watch-for-death', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, entity, callback) {
            this.super('constructor', arguments);

            this.entity = entity;
            this.callback = callback;
            this.started = false;
        },

        update: function () {
            if (this.entity.destroyed && this.started) {
                this.started = false;
                this.callback();
                this.destroy();
            }
        },

        start: function () {
            this.started = true;
        }
    });
});

DefineModule('views/canvas-renderer', function (require) {
    var Frame = require('models/frame');

    function maximumPixelSize(width, height) {
        var maxWidth = window.innerWidth;
        var maxHeight = window.innerHeight;
        var pixelSize = 1;
        while (true) {
            if (width * pixelSize > maxWidth ||
                height * pixelSize > maxHeight) {

                pixelSize--;
                break;
            }

            pixelSize++;
        }

        if (pixelSize <= 0) {
            pixelSize = 1;
        }

        return pixelSize;
    }

    function createCanvasEl(dimensions) {
        dimensions.fullWidth = dimensions.width * dimensions.pixelSize;
        dimensions.fullHeight = dimensions.height * dimensions.pixelSize;

        var el = document.createElement('canvas');
        el.width = dimensions.fullWidth;
        el.height = dimensions.fullHeight;
        el.classList.add('pixel-engine-canvas');

        return el;
    }

    return DefineClass({
        width: 80,
        height: 50,
        pixelSize: 1,
        nextFrame: 0,

        constructor: function Renderer(options) {
            options = options || {};

            this.width = options.width || this.width;
            this.height = options.height || this.height;
            this.pixelSize = maximumPixelSize(this.width, this.height);

            this.container = options.container || document.body;
            this.canvas = createCanvasEl(this);
            this.container.appendChild(this.canvas);

            this.canvasDrawContext = this.canvas.getContext("2d", { alpha: false });
            this.frames = [
                new Frame(this),
                new Frame(this)
            ];
        },

        newRenderFrame: function () {
            return this.frames[ this.nextFrame ];
        },
        renderFrame: function () {
            var frame = this.frames[ this.nextFrame ];
            var pixelSize = this.pixelSize;
            var ctx = this.canvasDrawContext;
            var fillColor = frame.fillColor;

            ctx.fillStyle = fillColor;
            ctx.fillRect(0, 0, this.fullWidth, this.fullHeight);

            frame.iterateCells(function (cell, x, y) {
                if (cell.color !== fillColor) {
                    ctx.beginPath();
                    ctx.rect(cell.render_x, cell.render_y, pixelSize, pixelSize);
                    ctx.fillStyle = cell.color;
                    ctx.fill();
                    ctx.closePath();
                }
            });

            this.nextFrame = +!this.nextFrame; // switch the frames
        },
        setFillColor: function (fillColor) {
            this.frames.forEach(function (frame) {
                frame.setFillColor(fillColor);
            });
        }
    });
});

DefineModule('views/webgl-renderer', function (require) {
    var Frame = require('models/frame');

    function maximumPixelSize(width, height) {
        var maxWidth = window.innerWidth;
        var maxHeight = window.innerHeight;
        var pixelSize = 1;
        while (true) {
            if (width * pixelSize > maxWidth ||
                height * pixelSize > maxHeight) {

                pixelSize--;
                break;
            }

            pixelSize++;
        }

        if (pixelSize <= 0) {
            pixelSize = 1;
        }

        return pixelSize;
    }

    function createCanvasEl(dimensions) {
        dimensions.fullWidth = dimensions.width * dimensions.pixelSize;
        dimensions.fullHeight = dimensions.height * dimensions.pixelSize;

        var el = document.createElement('canvas');
        el.width = dimensions.fullWidth;
        el.height = dimensions.fullHeight;
        el.classList.add('pixel-engine-canvas');

        return el;
    }

    var horizAspect = 480.0/640.0;

    function loadIdentity() {
        mvMatrix = Matrix.I(4);
    }

    function multMatrix(m) {
        mvMatrix = mvMatrix.x(m);
    }

    function mvTranslate(v) {
        multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
    }

    function setMatrixUniforms() {
        var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

        var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
    }

    function drawScene(gl) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

        loadIdentity();
        mvTranslate([-0.0, 0.0, -6.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function initBuffers(gl) {
        squareVerticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

        var vertices = [
            1.0,  1.0,  0.0,
            -1.0, 1.0,  0.0,
            1.0,  -1.0, 0.0,
            -1.0, -1.0, 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    }

    function getShader(gl, id) {
        var shaderScript, theSource, currentChild, shader;

        shaderScript = document.getElementById(id);

        if (!shaderScript) {
            return null;
        }

        theSource = "";
        currentChild = shaderScript.firstChild;

        while (currentChild) {
            if (currentChild.nodeType == currentChild.TEXT_NODE) {
                theSource += currentChild.textContent;
            }

            currentChild = currentChild.nextSibling;
        }

        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            // Unknown shader type
            return null;
        }

        gl.shaderSource(shader, theSource);

        // Compile the shader program
        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function initShaders(gl) {
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");

        // Create the shader program

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Unable to initialize the shader program.");
        }

        gl.useProgram(shaderProgram);

        vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        gl.enableVertexAttribArray(vertexPositionAttribute);
    }

    return DefineClass({
        width: 80,
        height: 50,
        pixelSize: 1,
        nextFrame: 0,

        constructor: function Renderer(options) {
            options = options || {};

            this.width = options.width || this.width;
            this.height = options.height || this.height;
            this.pixelSize = maximumPixelSize(this.width, this.height);

            this.container = options.container || document.body;
            this.canvas = createCanvasEl(this);
            this.container.appendChild(this.canvas);

            this.canvasDrawContext = this.canvas.getContext("webgl");
            this.canvasDrawContext.clearColor(0.0, 0.0, 0.0, 1.0);
            this.canvasDrawContext.enable(this.canvasDrawContext.DEPTH_TEST);
            this.canvasDrawContext.depthFunc(this.canvasDrawContext.LEQUAL);
            this.canvasDrawContext.clear(this.canvasDrawContext.COLOR_BUFFER_BIT | this.canvasDrawContext.DEPTH_BUFFER_BIT);

            this.frames = [
                new Frame(this),
                new Frame(this)
            ];
        },

        newRenderFrame: function () {
            return this.frames[ this.nextFrame ];
        },
        renderFrame: function () {
            //var frame = this.frames[ this.nextFrame ];
            //var pixelSize = this.pixelSize;
            //var ctx = this.canvasDrawContext;
            //var fillColor = frame.fillColor;
            //
            //ctx.fillStyle = fillColor;
            //ctx.fillRect(0, 0, this.fullWidth, this.fullHeight);
            //
            //frame.iterateCells(function (cell, x, y) {
            //    if (cell.color !== fillColor) {
            //        ctx.beginPath();
            //        ctx.rect(cell.render_x, cell.render_y, pixelSize, pixelSize);
            //        ctx.fillStyle = cell.color;
            //        ctx.fill();
            //        ctx.closePath();
            //    }
            //});
            //
            //this.nextFrame = +!this.nextFrame; // switch the frames
        },
        setFillColor: function (fillColor) {
            this.frames.forEach(function (frame) {
                frame.setFillColor(fillColor);
            });
        }
    });
});

DefineModule('sprites/arrow-boss', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w1 = "#ffffff";
        var w2 = "#cccccc";
        var g1 = "#aaaaaa";
        var g2 = "#888888";
        var g3 = "#666666";
        var g4 = "#222222";
        var nn = null;
        return new Sprite([
                [ g3, nn, nn, nn, nn, nn, nn, nn, g3, nn, nn, nn, nn, nn, nn, nn, g3 ],
                [ g2, g2, nn, nn, nn, nn, g2, g2, w2, g2, g2, nn, nn, nn, nn, g2, g2 ],
                [ nn, g2, g1, nn, g1, g1, w2, w2, w2, w2, w2, g1, g1, nn, g1, g2, nn ],
                [ nn, g1, g1, g1, g1, w2, w2, w2, g3, w2, w2, w2, g1, g1, g1, g1, nn ],
                [ nn, nn, w2, g1, w2, w1, w2, g3, g4, g3, w2, w1, w2, g1, w2, nn, nn ],
                [ nn, nn, w2, w1, w2, w1, w1, w2, g3, w2, w1, w1, w2, w1, w2, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, w1, w1, w2, w1, w1, nn, nn, w1, nn, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, nn, w1, w1, w1, nn, nn, nn, w1, nn, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, nn, nn, w1, nn, nn, nn, nn, w1, nn, nn, nn ],
                [ nn, nn, nn, nn, nn, nn, nn, nn, w1, nn, nn, nn, nn, nn, nn, nn, nn ],
                [ nn, nn, nn, nn, nn, nn, nn, nn, w1, nn, nn, nn, nn, nn, nn, nn, nn ]
            ],
            {
                guns: [
                    { x: 3, y: 8 },
                    { x: 8, y: 10 },
                    { x: 13, y: 8 }
                ]
            });
    };
});

DefineModule('sprites/arrow-ship', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w1 = "#ffffff";
        var w2 = "#cccccc";
        var g1 = "#aaaaaa";
        var g2 = "#888888";
        var g3 = "#666666";
        var g4 = "#222222";
        var nn = null;
        return new Sprite([
                [ g3, nn, nn, nn, nn, nn, g3 ],
                [ g2, g2, nn, nn, nn, g2, g2 ],
                [ nn, g2, g1, nn, g1, g2, nn ],
                [ nn, g1, g1, w1, g1, g1, nn ],
                [ nn, nn, w2, g4, w2, nn, nn ],
                [ nn, nn, w2, w1, w2, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, nn ],
                [ nn, nn, nn, w1, nn, nn, nn ]
            ],
            {
                guns: [
                    { x: 3, y: 7 }
                ]
            });
    };
});

DefineModule('sprites/bullet', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        return new Sprite([
            [ "white", "white" ]
        ]);
    }
});

DefineModule('sprites/combo-gauge', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "#fff";
        var n = null;

        return new Sprite([
            [n,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,n],
            [w,w,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,w,w],
            [w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,w],
            [w,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,w],
            [w,w,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,n,w,n,n,n,n,n,n,n,n,n,n,w,w],
            [n,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,w,n]
        ]);
    };
});

DefineModule('sprites/dagger-ship', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
            [ n, w, n ],
            [ n, w, n ],
            [ n, w, n ],
            [ w, w, w ],
            [ w, w, w ],
            [ w, w, w ],
            [ w, w, w ],
            [ w, w, w ],
            [ n, w, n ]
        ]);
    }
});

DefineModule('sprites/flying-saucer', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
                [ n, n, n, w, w, w, w, w, n, n, n ],
                [ n, n, w, n, n, n, n, n, w, n, n ],
                [ n, w, n, n, n, n, n, n, n, w, n ],
                [ w, n, n, n, n, n, n, n, n, n, w ],
                [ w, n, n, n, n, n, n, n, n, n, w ],
                [ w, n, n, n, n, w, n, n, n, n, w ],
                [ w, n, n, n, n, n, n, n, n, n, w ],
                [ w, n, n, n, n, n, n, n, n, n, w ],
                [ n, w, n, n, n, n, n, n, n, w, n ],
                [ n, n, w, n, n, n, n, n, w, n, n ],
                [ n, n, n, w, w, w, w, w, n, n, n ]
            ],
            {
                guns: [
                ]
            });
    };
});

DefineModule('sprites/player-ship-wing-guns', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
                [ n, n, n, n, w, n, n, n, n ],
                [ n, n, n, n, w, n, n, n, n ],
                [ n, n, n, w, w, w, n, n, n ],
                [ n, n, n, w, w, w, n, n, n ],
                [ w, n, n, w, w, w, n, n, w ],
                [ w, n, w, w, w, w, w, n, w ],
                [ w, w, w, w, w, w, w, w, w ],
                [ n, n, n, w, w, w, n, n, n ],
                [ n, n, n, n, w, n, n, n, n ]
            ],
            {
                guns: [
                    { x: 0, y: 5 },
                    { x: 4, y: 1 },
                    { x: 8, y: 5 }
                ]
            });
    };
});

DefineModule('sprites/player-ship', function (require) {
    var Sprite = require('models/sprite');

    return function () {
        var w = "white";
        var n = null;
        return new Sprite([
            [ n, n, n, w, n, n, n ],
            [ n, n, n, w, n, n, n ],
            [ n, n, w, w, w, n, n ],
            [ n, n, w, w, w, n, n ],
            [ n, n, w, w, w, n, n ],
            [ n, w, w, w, w, w, n ],
            [ w, w, w, w, w, w, w ],
            [ n, n, w, w, w, n, n ],
            [ n, n, n, w, n, n, n ]
        ],
        {
            guns: [
                { x: 3, y: 1 }
            ]
        });
    };
});

DefineModule('sprites/animations/ship-explosion', function (require) {
    var Random = require('helpers/random');
    var smallExplosion = require('sprites/animations/small-explosion');
    var SpriteGroup = require('models/sprite-group');

    return function (offset) {
        offset = offset || { x: 0, y: 0 };

        return new SpriteGroup([
            {
                x: 0 + offset.x,
                y: Random.integer(0, 3) + offset.y,
                sprite: smallExplosion()
            },
            {
                x: Random.integer(3, 6) + offset.x,
                y: 0 + offset.y,
                sprite: smallExplosion()
            },
            {
                x: Random.integer(2, 4) + offset.x,
                y: Random.integer(4, 6) + offset.y,
                sprite: smallExplosion()
            }
        ]);
    }
});

DefineModule('sprites/animations/small-explosion', function (require) {
    var Animation = require('models/animation');
    var Random = require('helpers/random');
    var Sprite = require('models/sprite');

    var n = null;
    var y = "yellow";
    var o = "orange";
    var r = "red";

    function newFrameSet() {
        var frames = [
            new Sprite([
                [ n, n, n, n, n ],
                [ n, n, n, n, n ],
                [ n, n, r, n, n ],
                [ n, n, n, n, n ],
                [ n, n, n, n, n ]
            ]),
            new Sprite([
                [ n, n, n, n, n ],
                [ n, n, r, n, n ],
                [ n, y, y, o, n ],
                [ n, n, o, n, n ],
                [ n, n, n, n, n ]
            ]),
            new Sprite([
                [ y, n, r, n, n ],
                [ n, y, y, y, n ],
                [ o, y, n, y, o ],
                [ n, o, r, n, n ],
                [ n, n, y, y, n ]
            ]),
            new Sprite([
                [ y, n, y, n, n ],
                [ n, n, n, n, y ],
                [ n, n, n, n, y ],
                [ n, y, n, n, n ],
                [ n, n, y, y, n ]
            ]),
            new Sprite([
                [ n, n, n, y, n ],
                [ n, y, n, n, n ],
                [ n, n, n, n, n ],
                [ n, n, n, n, n ],
                [ y, n, n, n, y ]
            ])
        ];

        frames.forEach(function (frame) {
            for (var i = 0, times = Random.integer(0, 3); i < times; i++) {
                frame.rotateLeft();
            }
        });

        return frames;
    }


    return function () {
        return new Animation({
            frames: newFrameSet(),
            millisPerFrame: 50
        });
    }
});
}());
