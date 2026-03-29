(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __moduleCache = /* @__PURE__ */ new WeakMap;
  var __toCommonJS = (from) => {
    var entry = __moduleCache.get(from), desc;
    if (entry)
      return entry;
    entry = __defProp({}, "__esModule", { value: true });
    if (from && typeof from === "object" || typeof from === "function")
      __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
        get: () => from[key],
        enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
      }));
    __moduleCache.set(from, entry);
    return entry;
  };

  // src/main.ts
  var exports_main = {};

  // src/rendering/core/cell-grid.ts
  class CellGrid {
    width;
    height;
    cells;
    iterateCells(handler) {
      for (let x = 0;x < this.width; x++) {
        for (let y = 0;y < this.height; y++) {
          handler(this.cells[x][y], x, y);
        }
      }
    }
    cellAt(x, y) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        return this.cells[x][y];
      } else {
        return { x: -1, y: -1, color: "#000000", index: -1 };
      }
    }
  }

  // src/rendering/gl/frame.ts
  class Frame extends CellGrid {
    fillColor;
    constructor(dimensions) {
      super();
      this.width = dimensions.width;
      this.height = dimensions.height;
      this.cells = [];
      for (let x = 0;x < this.width; x++) {
        this.cells[x] = [];
        for (let y = 0;y < this.height; y++) {
          this.cells[x][y] = {
            x,
            y,
            render_x: x * dimensions.pixelSize,
            render_y: y * dimensions.pixelSize,
            color: "#000000",
            index: -1
          };
        }
      }
    }
    clear() {
      const color = this.fillColor;
      if (color) {
        this.iterateCells(function(cell) {
          cell.color = color;
          cell.index = -1;
        });
      }
    }
    setFillColor(fillColor) {
      this.fillColor = fillColor;
    }
  }

  // src/rendering/gl/canvas.ts
  function maximumPixelSize(width, height) {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    let pixelSize = 1;
    while (true) {
      if (width * pixelSize > maxWidth || height * pixelSize > maxHeight) {
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
    const el = document.createElement("canvas");
    el.width = dimensions.fullWidth;
    el.height = dimensions.fullHeight;
    el.classList.add("pixel-engine-canvas");
    return el;
  }

  class CanvasRenderer {
    width = 80;
    height = 50;
    pixelSize = 1;
    fullWidth;
    fullHeight;
    nextFrame = 0;
    container;
    canvas;
    canvasDrawContext;
    frames;
    constructor(options) {
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
    }
    newRenderFrame() {
      return this.frames[this.nextFrame];
    }
    renderFrame() {
      const frame = this.frames[this.nextFrame];
      const pixelSize = this.pixelSize;
      const ctx = this.canvasDrawContext;
      const fillColor = frame.fillColor;
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, this.fullWidth, this.fullHeight);
      frame.iterateCells(function(cell, x, y) {
        if (cell.color !== fillColor) {
          ctx.beginPath();
          ctx.rect(cell.render_x, cell.render_y, pixelSize, pixelSize);
          ctx.fillStyle = cell.color;
          ctx.fill();
          ctx.closePath();
        }
      });
      this.nextFrame = +!this.nextFrame;
    }
    setFillColor(fillColor) {
      this.frames.forEach(function(frame) {
        frame.setFillColor(fillColor);
      });
    }
  }

  // src/controllers/gamepad-input.ts
  var BUTTON_MAP = {
    0: "A",
    1: "B",
    2: "X",
    3: "Y",
    4: "left-bumper",
    5: "right-bumper",
    6: "left-trigger",
    7: "right-trigger",
    8: "back",
    9: "start",
    10: "left-stick-press",
    11: "right-stick-press",
    12: "d-pad-up",
    13: "d-pad-down",
    14: "d-pad-left",
    15: "d-pad-right"
  };
  function gamepadDescriptor() {
    const descriptor = { INPUT_TYPE: "gamepad" };
    Object.keys(BUTTON_MAP).forEach((key) => {
      descriptor[BUTTON_MAP[parseInt(key)]] = false;
    });
    descriptor["left-stick-x"] = 0;
    descriptor["left-stick-y"] = 0;
    descriptor["right-stick-x"] = 0;
    descriptor["right-stick-y"] = 0;
    return descriptor;
  }
  function normalize(axisTilt) {
    return Math.round(axisTilt * 10) / 10;
  }

  class GamepadInput {
    constructor() {
      window.addEventListener("gamepadconnected", (e) => {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
      });
      window.addEventListener("gamepaddisconnected", (e) => {
        console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id);
      });
    }
    getInputState() {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[0];
      const gamepadState = gamepadDescriptor();
      if (gamepad && gamepad.connected) {
        gamepad.buttons.forEach((button, index) => {
          const buttonName = BUTTON_MAP[index];
          if (buttonName) {
            gamepadState[buttonName] = button.pressed;
          }
        });
        gamepadState["left-stick-x"] = normalize(gamepad.axes[0]);
        gamepadState["left-stick-y"] = normalize(gamepad.axes[1]);
        gamepadState["right-stick-x"] = normalize(gamepad.axes[2]);
        gamepadState["right-stick-y"] = normalize(gamepad.axes[3]);
      }
      return gamepadState;
    }
    clearState() {}
  }

  // src/controllers/keyboard-input.ts
  function cloneObj(obj) {
    const nObj = {};
    Object.keys(obj).forEach((key) => {
      nObj[key] = obj[key];
    });
    return nObj;
  }
  function newInputDescriptor() {
    return {
      W: false,
      A: false,
      S: false,
      D: false,
      SPACE: false,
      ENTER: false
    };
  }
  var KEYS = {
    87: "W",
    65: "A",
    83: "S",
    68: "D",
    32: "SPACE",
    13: "ENTER"
  };

  class KeyboardInput {
    inputState;
    clearAfterNext;
    constructor() {
      this.inputState = { INPUT_TYPE: "keyboard", ...newInputDescriptor() };
      this.clearAfterNext = newInputDescriptor();
      this.clearState();
      document.body.addEventListener("keydown", this.keydown.bind(this));
      document.body.addEventListener("keyup", this.keyup.bind(this));
    }
    getInputState() {
      const state = cloneObj(this.inputState);
      this.propagateInputClears();
      return state;
    }
    clearState() {
      this.clearAfterNext = newInputDescriptor();
      this.inputState = { INPUT_TYPE: "keyboard", ...newInputDescriptor() };
    }
    propagateInputClears() {
      Object.keys(this.clearAfterNext).forEach((key) => {
        const k = key;
        if (this.clearAfterNext[k]) {
          this.inputState[k] = false;
          this.clearAfterNext[k] = false;
        }
      });
    }
    keydown(event) {
      const key = KEYS[event.keyCode];
      if (key) {
        this.inputState[key] = true;
        this.clearAfterNext[key] = false;
      }
    }
    keyup(event) {
      const key = KEYS[event.keyCode];
      if (key) {
        this.clearAfterNext[key] = true;
      }
    }
  }

  // src/models/game-object.ts
  class GameObject {
    parent;
    children;
    destroyed;
    damage;
    life;
    maxLife;
    position;
    velocity;
    acceleration;
    sprite;
    index;
    exploding;
    explosion;
    constructor(parentObj) {
      this.parent = parentObj;
      this.children = [];
      this.destroyed = false;
      this.damage = 0;
    }
    reset() {
      this.children = [];
      this.destroyed = false;
    }
    triggerEvent(event, data) {
      let entityRef = this.parent;
      while (entityRef) {
        if (typeof entityRef[event] === "function") {
          entityRef[event](data);
          return;
        }
        entityRef = entityRef.parent;
      }
      console.error("Couldn't find event '" + event + "' in parent chain of ", this);
    }
    processInput(input) {
      this.children && this.children.forEach((child) => {
        if (typeof child.processInput === "function") {
          child.processInput(input);
        }
      });
    }
    update(dtime) {
      this.children && this.children.forEach((child) => {
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
      if (this.exploding && this.sprite && this.sprite.finished) {
        this.destroy();
      }
    }
    checkBoundaries() {}
    renderToFrame(frame) {
      this.children && this.children.forEach((child) => {
        if (typeof child.renderToFrame === "function") {
          child.renderToFrame(frame);
        }
      });
      if (this.sprite && this.position) {
        this.sprite.renderToFrame(frame, Math.floor(this.position.x), Math.floor(this.position.y), this.index || 0);
      }
    }
    addChild(child) {
      if (child) {
        this.children.push(child);
      }
    }
    removeChild(child) {
      if (child) {
        const index = this.children.indexOf(child);
        if (index >= 0) {
          this.children.splice(index, 1);
        }
      }
    }
    destroy() {
      if (this.parent && this.parent.removeChild) {
        this.parent.removeChild(this);
      }
      this.children = null;
      this.destroyed = true;
    }
    applyDamage(damage, sourceEntity) {
      if (this.maxLife) {
        this.life = (this.life || 0) - damage;
        if (this.life <= 0) {
          this.exploding = true;
          if (this.explosion) {
            this.sprite = this.explosion();
          }
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
  }

  // src/helpers/random.ts
  function integer(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function rangeCap(n, min, max) {
    if (typeof n !== "number" || n < min) {
      return min;
    } else if (n > max) {
      return max;
    } else {
      return n;
    }
  }
  function sample(collection, requestedCount) {
    requestedCount = rangeCap(requestedCount, 1, collection.length);
    const range = collection.length - 1;
    const selected = {};
    let count = 0;
    let choice;
    while (count < requestedCount) {
      choice = integer(0, range);
      if (!selected[choice]) {
        selected[choice] = true;
        count++;
      }
    }
    return Object.keys(selected).map((key) => {
      return collection[parseInt(key)];
    });
  }

  // src/rendering/core/animation.ts
  class Animation {
    finished = false;
    frames;
    millisPerFrame;
    currentFrame;
    loop;
    width;
    height;
    millisEllapsedOnFrame = 0;
    constructor(options) {
      this.frames = options.frames;
      this.millisPerFrame = options.millisPerFrame || 100;
      this.currentFrame = options.offsetIndex || 0;
      this.loop = options.loop;
      this.width = this.frames[0].width;
      this.height = this.frames[0].height;
    }
    update(dtime) {
      if (this.finished)
        return;
      this.millisEllapsedOnFrame += dtime;
      if (this.millisEllapsedOnFrame >= this.millisPerFrame) {
        this.millisEllapsedOnFrame -= this.millisPerFrame;
        this.currentFrame += 1;
        if (this.currentFrame >= this.frames.length) {
          if (this.loop) {
            this.currentFrame = 0;
          } else {
            this.finished = true;
          }
        }
      }
    }
    renderToFrame(frame, x, y, index) {
      if (this.finished)
        return;
      this.frames[this.currentFrame].renderToFrame(frame, x, y, index);
    }
  }

  // src/rendering/core/sprite.ts
  class Sprite extends CellGrid {
    finished = true;
    meta;
    offsetAdjustment;
    constructor(pixels, meta) {
      super();
      this.meta = meta || {};
      this.width = pixels.length;
      this.height = pixels[0].length;
      this.offsetAdjustment = { x: 0, y: 0 };
      this.cells = [];
      for (let x = 0;x < this.width; x++) {
        this.cells[x] = [];
        for (let y = 0;y < this.height; y++) {
          this.cells[x][y] = {
            x,
            y,
            color: pixels[x][y]
          };
        }
      }
    }
    setPermanentOffset(offset) {
      offset = offset || {};
      this.offsetAdjustment.x = offset.x || 0;
      this.offsetAdjustment.y = offset.y || 0;
      return this;
    }
    applyColor(color) {
      this.iterateCells(function(cell) {
        if (cell.color) {
          cell.color = color;
        }
      });
      return this;
    }
    update(_dtime) {}
    renderToFrame(frame, x, y, index) {
      index = index || 0;
      const offset_x = this.offsetAdjustment.x;
      const offset_y = this.offsetAdjustment.y;
      this.iterateCells(function(cell, _x, _y) {
        if (cell.color) {
          const frameCell = frame.cellAt(x + _x + offset_x, y + _y + offset_y);
          if (index >= frameCell.index) {
            frameCell.color = cell.color;
            frameCell.index = index;
          }
        }
      });
    }
    clone() {
      const colorGrid = [];
      for (let x = 0;x < this.width; x++) {
        colorGrid[x] = [];
        for (let y = 0;y < this.height; y++) {
          colorGrid[x][y] = this.cells[x][y].color;
        }
      }
      const sprite = new Sprite(colorGrid);
      sprite.setPermanentOffset(this.offsetAdjustment);
      return sprite;
    }
    rotateLeft() {
      const width = this.width;
      const height = this.height;
      const oldCells = this.cells;
      const newCells = [];
      let x;
      let y;
      for (x = 0;x < height; x++) {
        newCells[x] = [];
      }
      for (x = 0;x < width; x++) {
        for (y = 0;y < height; y++) {
          newCells[y][width - x - 1] = {
            x: y,
            y: width - x - 1,
            color: oldCells[x][y].color
          };
        }
      }
      this.width = height;
      this.height = width;
      this.cells = newCells;
      return this;
    }
    rotateRight() {
      return this.rotateLeft().rotateLeft().rotateLeft();
    }
    invertX() {
      for (let x = 0;x < this.width / 2; x++) {
        const left = this.cells[x];
        const right = this.cells[this.width - x - 1];
        this.cells[x] = right;
        this.cells[this.width - x - 1] = left;
      }
      return this;
    }
    invertY() {
      for (let x = 0;x < this.width; x++) {
        this.cells[x].reverse();
      }
      return this;
    }
  }

  // src/sprites/animations/small-explosion.ts
  var n = null;
  var y = "yellow";
  var o = "orange";
  var r = "red";
  function newFrameSet() {
    const frames = [
      new Sprite([
        [n, n, n, n, n],
        [n, n, n, n, n],
        [n, n, r, n, n],
        [n, n, n, n, n],
        [n, n, n, n, n]
      ]),
      new Sprite([
        [n, n, n, n, n],
        [n, n, r, n, n],
        [n, y, y, o, n],
        [n, n, o, n, n],
        [n, n, n, n, n]
      ]),
      new Sprite([
        [y, n, r, n, n],
        [n, y, y, y, n],
        [o, y, n, y, o],
        [n, o, r, n, n],
        [n, n, y, y, n]
      ]),
      new Sprite([
        [y, n, y, n, n],
        [n, n, n, n, y],
        [n, n, n, n, y],
        [n, y, n, n, n],
        [n, n, y, y, n]
      ]),
      new Sprite([
        [n, n, n, y, n],
        [n, y, n, n, n],
        [n, n, n, n, n],
        [n, n, n, n, n],
        [y, n, n, n, y]
      ])
    ];
    frames.forEach((frame) => {
      for (let i = 0, times = integer(0, 3);i < times; i++) {
        frame.rotateLeft();
      }
    });
    return frames;
  }
  function smallExplosion() {
    return new Animation({
      frames: newFrameSet(),
      millisPerFrame: 50
    });
  }

  // src/rendering/core/sprite-group.ts
  class SpriteGroup {
    spriteDescriptors;
    width;
    height;
    finished = false;
    constructor(sprites) {
      this.spriteDescriptors = sprites || [];
      this.width = Math.max.apply(null, this.spriteDescriptors.map(function(descriptor) {
        return descriptor.x + descriptor.sprite.width;
      }));
      this.height = Math.max.apply(null, this.spriteDescriptors.map(function(descriptor) {
        return descriptor.y + descriptor.sprite.height;
      }));
    }
    update(dtime) {
      let finished = true;
      this.spriteDescriptors.forEach(function(descriptor) {
        descriptor.sprite.update(dtime);
        if (!descriptor.sprite.finished) {
          finished = false;
        }
      });
      this.finished = finished;
    }
    renderToFrame(frame, x, y2, index) {
      this.spriteDescriptors.forEach(function(descriptor) {
        descriptor.sprite.renderToFrame(frame, x + descriptor.x, y2 + descriptor.y, index);
      });
    }
  }

  // src/sprites/animations/ship-explosion.ts
  function shipExplosion(offset) {
    const finalOffset = { x: offset?.x || 0, y: offset?.y || 0 };
    return new SpriteGroup([
      {
        x: 0 + finalOffset.x,
        y: integer(0, 3) + finalOffset.y,
        sprite: smallExplosion()
      },
      {
        x: integer(3, 6) + finalOffset.x,
        y: 0 + finalOffset.y,
        sprite: smallExplosion()
      },
      {
        x: integer(2, 4) + finalOffset.x,
        y: integer(4, 6) + finalOffset.y,
        sprite: smallExplosion()
      }
    ]);
  }

  // src/rendering/fonts/arcade.ts
  var w = "white";
  var n2 = null;
  var arcade_default = {
    meta: {
      width: 7,
      height: 7,
      lineHeight: 11,
      letterSpacing: 1,
      credit: "http://www.urbanfonts.com/fonts/Arcade.htm"
    },
    A: new Sprite([
      [n2, n2, w, w, w, w, w],
      [n2, w, w, w, w, w, w],
      [w, w, n2, n2, w, n2, n2],
      [w, n2, n2, n2, w, n2, n2],
      [w, w, n2, n2, w, n2, n2],
      [n2, w, w, w, w, w, w],
      [n2, n2, w, w, w, w, w]
    ]),
    B: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, w, w, w, w, w, w],
      [n2, w, w, n2, w, w, n2]
    ]),
    C: new Sprite([
      [n2, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, w, n2, n2, n2, w, w],
      [n2, w, n2, n2, n2, w, n2]
    ]),
    D: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, w, w, w, w, w, w],
      [n2, w, w, w, w, w, n2]
    ]),
    E: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w]
    ]),
    F: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, n2, w, n2, n2, n2],
      [w, n2, n2, w, n2, n2, n2],
      [w, n2, n2, w, n2, n2, n2],
      [w, n2, n2, w, n2, n2, n2],
      [w, n2, n2, n2, n2, n2, n2]
    ]),
    G: new Sprite([
      [n2, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, w, n2, w, w, w, w],
      [n2, w, n2, w, w, w, n2]
    ]),
    H: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, n2, n2, w, n2, n2, n2],
      [n2, n2, n2, w, n2, n2, n2],
      [n2, n2, n2, w, n2, n2, n2],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w]
    ]),
    I: new Sprite([
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w]
    ]),
    J: new Sprite([
      [n2, n2, n2, n2, n2, w, n2],
      [n2, n2, n2, n2, n2, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, n2],
      [w, n2, n2, n2, n2, n2, n2]
    ]),
    K: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, n2, n2, w, w, n2, n2],
      [n2, n2, w, w, w, w, n2],
      [n2, w, w, n2, w, w, n2],
      [w, w, n2, n2, n2, w, w],
      [w, n2, n2, n2, n2, n2, w]
    ]),
    L: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w]
    ]),
    M: new Sprite([
      [w, w, w, w, w, w, w],
      [n2, w, w, w, w, w, w],
      [n2, n2, w, w, n2, n2, n2],
      [n2, n2, n2, w, w, n2, n2],
      [n2, n2, w, w, n2, n2, n2],
      [n2, w, w, w, w, w, w],
      [w, w, w, w, w, w, w]
    ]),
    N: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, w, w, n2, n2, n2, n2],
      [n2, n2, w, w, n2, n2, n2],
      [n2, n2, n2, w, w, n2, n2],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w]
    ]),
    O: new Sprite([
      [n2, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, w, w, w, w, w, w],
      [n2, w, w, w, w, w, n2]
    ]),
    P: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, n2, w, n2, n2, n2],
      [w, n2, n2, w, n2, n2, n2],
      [w, n2, n2, w, n2, n2, n2],
      [w, w, w, w, n2, n2, n2],
      [n2, w, w, n2, n2, n2, n2]
    ]),
    Q: new Sprite([
      [n2, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, w, n2, w],
      [w, n2, n2, n2, w, w, n2],
      [w, w, w, w, w, w, w],
      [n2, w, w, w, w, n2, w]
    ]),
    R: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, n2, w, n2, n2, n2],
      [w, n2, n2, w, w, n2, n2],
      [w, n2, n2, w, w, w, n2],
      [w, w, w, w, n2, w, w],
      [n2, w, w, n2, n2, n2, w]
    ]),
    S: new Sprite([
      [n2, w, w, n2, n2, w, n2],
      [w, w, w, w, n2, w, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, w, n2, w, w, w, w],
      [n2, w, n2, n2, w, w, n2]
    ]),
    T: new Sprite([
      [w, n2, n2, n2, n2, n2, n2],
      [w, n2, n2, n2, n2, n2, n2],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, n2, n2, n2, n2, n2],
      [w, n2, n2, n2, n2, n2, n2]
    ]),
    U: new Sprite([
      [w, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, n2]
    ]),
    V: new Sprite([
      [w, w, w, w, w, n2, n2],
      [w, w, w, w, w, w, n2],
      [n2, n2, n2, n2, n2, w, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, w, w],
      [w, w, w, w, w, w, n2],
      [w, w, w, w, w, n2, n2]
    ]),
    W: new Sprite([
      [w, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [n2, n2, n2, n2, n2, w, w],
      [n2, n2, n2, n2, w, w, n2],
      [n2, n2, n2, n2, n2, w, w],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, n2]
    ]),
    X: new Sprite([
      [w, n2, n2, n2, n2, w, w],
      [w, w, n2, n2, w, w, n2],
      [n2, w, w, w, w, n2, n2],
      [n2, n2, w, w, n2, n2, n2],
      [n2, w, w, w, w, n2, n2],
      [w, w, n2, n2, w, w, n2],
      [w, n2, n2, n2, n2, w, w]
    ]),
    Y: new Sprite([
      [w, w, w, n2, n2, n2, n2],
      [w, w, w, w, n2, n2, n2],
      [n2, n2, n2, w, w, w, w],
      [n2, n2, n2, w, w, w, w],
      [w, w, w, w, n2, n2, n2],
      [w, w, w, n2, n2, n2, n2],
      [n2, n2, n2, n2, n2, n2, n2]
    ]),
    Z: new Sprite([
      [w, n2, n2, n2, n2, w, w],
      [w, n2, n2, n2, w, w, w],
      [w, n2, n2, w, w, n2, w],
      [w, n2, w, w, n2, n2, w],
      [w, w, w, n2, n2, n2, w],
      [w, w, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w]
    ]),
    a: new Sprite([
      [n2, n2, n2, n2, n2, w, n2],
      [n2, n2, w, n2, w, w, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, w, w, w, w]
    ]),
    b: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, w, w, w, n2]
    ]),
    c: new Sprite([
      [n2, n2, n2, w, w, w, n2],
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, w, n2, w, w],
      [n2, n2, n2, w, n2, w, n2]
    ]),
    d: new Sprite([
      [n2, n2, n2, w, w, w, n2],
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w]
    ]),
    e: new Sprite([
      [n2, n2, n2, w, w, w, n2],
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, w, w, n2, w],
      [n2, n2, n2, w, w, n2, n2]
    ]),
    f: new Sprite([
      [n2, n2, w, n2, n2, n2, n2],
      [n2, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [w, n2, w, n2, n2, n2, n2],
      [w, n2, n2, n2, n2, n2, n2]
    ]),
    g: new Sprite([
      [n2, n2, n2, w, w, w, n2, n2, n2],
      [n2, n2, w, w, w, w, w, n2, w],
      [n2, n2, w, n2, n2, n2, w, n2, w],
      [n2, n2, w, n2, n2, n2, w, n2, w],
      [n2, n2, w, n2, n2, n2, w, n2, w],
      [n2, n2, w, w, w, w, w, w, w],
      [n2, n2, n2, w, w, w, w, w, n2]
    ]),
    h: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, n2],
      [n2, n2, w, n2, n2, n2, n2],
      [n2, n2, w, n2, n2, n2, n2],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, w, w, w, w]
    ]),
    i: new Sprite([
      [w, n2, w, w, w, w, w],
      [w, n2, w, w, w, w, w]
    ]),
    j: new Sprite([
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [w, n2, w, w, w, w, w],
      [w, n2, w, w, w, w, n2]
    ]),
    k: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, n2, n2, n2, w, n2, n2],
      [n2, n2, n2, w, w, w, n2],
      [n2, n2, w, w, n2, w, w],
      [n2, n2, w, n2, n2, n2, w]
    ]),
    l: new Sprite([
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w]
    ]),
    m: new Sprite([
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, n2],
      [n2, n2, n2, w, w, w, w],
      [n2, n2, w, n2, n2, n2, n2],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, w, w, w, w]
    ]),
    n: new Sprite([
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, n2],
      [n2, n2, w, n2, n2, n2, n2],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, w, w, w, w]
    ]),
    o: new Sprite([
      [n2, n2, n2, w, w, w, n2],
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, w, w, w, n2]
    ]),
    p: new Sprite([
      [n2, n2, w, w, w, w, w, w, w],
      [n2, n2, w, w, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, w, n2, n2],
      [n2, n2, w, n2, n2, n2, w, n2, n2],
      [n2, n2, w, n2, n2, n2, w, n2, n2],
      [n2, n2, w, w, w, w, w, n2, n2],
      [n2, n2, n2, w, w, w, n2, n2, n2]
    ]),
    q: new Sprite([
      [n2, n2, n2, w, w, w, n2, n2, n2],
      [n2, n2, w, w, w, w, w, n2, n2],
      [n2, n2, w, n2, n2, n2, w, n2, n2],
      [n2, n2, w, n2, n2, n2, w, n2, n2],
      [n2, n2, w, n2, n2, n2, w, n2, n2],
      [n2, n2, w, w, w, w, w, w, w],
      [n2, n2, w, w, w, w, w, w, w]
    ]),
    r: new Sprite([
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, w, n2, n2, n2],
      [n2, n2, w, n2, n2, n2, n2],
      [n2, n2, w, n2, n2, n2, n2]
    ]),
    s: new Sprite([
      [n2, n2, n2, w, n2, n2, n2],
      [n2, n2, w, w, w, n2, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, n2, w, w, w],
      [n2, n2, n2, n2, n2, w, n2]
    ]),
    t: new Sprite([
      [n2, n2, w, n2, n2, n2, n2],
      [w, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w]
    ]),
    u: new Sprite([
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, w, w, w, n2]
    ]),
    v: new Sprite([
      [n2, n2, w, w, w, n2, n2],
      [n2, n2, w, w, w, w, n2],
      [n2, n2, n2, n2, n2, w, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, w, w],
      [n2, n2, w, w, w, w, n2],
      [n2, n2, w, w, w, n2, n2]
    ]),
    w: new Sprite([
      [n2, n2, w, w, w, w, n2],
      [n2, n2, w, w, w, w, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, w, n2],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, w, w, w, w, w],
      [n2, n2, w, w, w, w, n2]
    ]),
    x: new Sprite([
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, w, n2, w, w],
      [n2, n2, n2, w, w, w, n2],
      [n2, n2, n2, n2, w, n2, n2],
      [n2, n2, n2, w, w, w, n2],
      [n2, n2, w, w, n2, w, w],
      [n2, n2, w, n2, n2, n2, w]
    ]),
    y: new Sprite([
      [n2, n2, w, w, w, w, n2, n2, n2],
      [n2, n2, w, w, w, w, w, n2, w],
      [n2, n2, n2, n2, n2, n2, w, n2, w],
      [n2, n2, n2, n2, n2, n2, w, n2, w],
      [n2, n2, n2, n2, n2, n2, w, n2, w],
      [n2, n2, w, w, w, w, w, w, w],
      [n2, n2, w, w, w, w, w, w, n2]
    ]),
    z: new Sprite([
      [n2, n2, w, n2, n2, n2, w],
      [n2, n2, w, n2, n2, w, w],
      [n2, n2, w, n2, w, w, w],
      [n2, n2, w, n2, w, n2, w],
      [n2, n2, w, w, w, n2, w],
      [n2, n2, w, w, n2, n2, w],
      [n2, n2, w, n2, n2, n2, w]
    ]),
    " ": new Sprite([
      [n2, n2, n2, n2, n2, n2, n2],
      [n2, n2, n2, n2, n2, n2, n2],
      [n2, n2, n2, n2, n2, n2, n2],
      [n2, n2, n2, n2, n2, n2, n2],
      [n2, n2, n2, n2, n2, n2, n2]
    ]),
    "0": new Sprite([
      [n2, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, w, w, w, w, w, w],
      [n2, w, w, w, w, w, n2]
    ]),
    "1": new Sprite([
      [n2, n2, n2, n2, n2, n2, w],
      [n2, w, n2, n2, n2, n2, w],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, n2, w]
    ]),
    "2": new Sprite([
      [n2, w, n2, n2, n2, w, w],
      [w, w, n2, n2, w, w, w],
      [w, n2, n2, w, w, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, w, w, n2, n2, w],
      [w, w, w, n2, n2, n2, w],
      [n2, w, n2, n2, n2, n2, w]
    ]),
    "3": new Sprite([
      [n2, w, n2, n2, n2, w, n2],
      [w, w, n2, n2, n2, w, w],
      [w, n2, n2, n2, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, w, w, w, w, w, w],
      [n2, w, w, n2, w, w, n2]
    ]),
    "4": new Sprite([
      [n2, n2, n2, w, w, n2, n2],
      [n2, n2, w, w, w, n2, n2],
      [n2, w, w, n2, w, n2, n2],
      [w, w, n2, n2, w, n2, n2],
      [w, w, w, w, w, w, w],
      [w, w, w, w, w, w, w],
      [n2, n2, n2, n2, w, n2, n2]
    ]),
    "5": new Sprite([
      [w, w, w, n2, n2, w, n2],
      [w, w, w, n2, n2, w, w],
      [w, n2, w, n2, n2, n2, w],
      [w, n2, w, n2, n2, n2, w],
      [w, n2, w, n2, n2, n2, w],
      [w, n2, w, w, w, w, w],
      [n2, n2, n2, w, w, w, n2]
    ]),
    "6": new Sprite([
      [n2, w, w, w, w, w, n2],
      [w, w, w, w, w, w, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, w, n2, w, w, w, w],
      [n2, w, n2, n2, w, w, n2]
    ]),
    "7": new Sprite([
      [w, n2, n2, n2, n2, n2, n2],
      [w, n2, n2, n2, n2, n2, n2],
      [w, n2, n2, w, w, w, w],
      [w, n2, w, w, w, w, w],
      [w, w, w, n2, n2, n2, n2],
      [w, w, n2, n2, n2, n2, n2],
      [w, n2, n2, n2, n2, n2, n2]
    ]),
    "8": new Sprite([
      [n2, w, w, n2, w, w, n2],
      [w, w, w, w, w, w, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, w, w, w, w, w, w],
      [n2, w, w, n2, w, w, n2]
    ]),
    "9": new Sprite([
      [n2, w, w, n2, n2, n2, n2],
      [w, w, w, w, n2, n2, n2],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, n2, w],
      [w, n2, n2, w, n2, w, w],
      [w, w, w, w, w, w, n2],
      [n2, w, w, w, w, n2, n2]
    ]),
    "!": new Sprite([
      [n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, w, n2, w],
      [n2, n2, n2, w, w, n2, n2],
      [n2, n2, w, w, n2, n2, n2],
      [n2, w, w, w, n2, n2, n2],
      [w, w, w, n2, n2, n2, n2],
      [w, w, w, n2, n2, n2, n2]
    ]),
    ".": new Sprite([
      [n2, n2, n2, n2, n2, w, w],
      [n2, n2, n2, n2, n2, w, w],
      [n2, n2, n2, n2, n2, n2, n2],
      [n2, n2, n2, n2, n2, n2, n2]
    ]),
    ",": new Sprite([
      [n2, n2, n2, n2, n2, n2, n2, w],
      [n2, n2, n2, n2, n2, w, w, w],
      [n2, n2, n2, n2, n2, w, w, n2]
    ]),
    "?": new Sprite([
      [n2, w, n2, n2, n2, n2, n2],
      [w, w, n2, n2, n2, n2, n2],
      [w, n2, n2, w, n2, w, w],
      [w, n2, w, w, n2, w, w],
      [w, w, w, n2, n2, n2, n2],
      [n2, w, n2, n2, n2, n2, n2]
    ]),
    $: new Sprite([
      [n2, n2, w, n2, n2],
      [n2, w, w, w, n2],
      [w, n2, w, n2, w],
      [n2, w, w, n2, n2],
      [n2, n2, w, n2, n2],
      [n2, n2, w, w, n2],
      [w, n2, w, n2, w],
      [n2, w, w, w, n2],
      [n2, n2, w, n2, n2]
    ]).invertY().rotateRight()
  };

  // src/rendering/fonts/arcade-small.ts
  var w2 = "white";
  var n3 = null;
  var arcade_small_default = {
    meta: {
      width: 3,
      height: 5,
      lineHeight: 8,
      letterSpacing: 1,
      credit: "me"
    },
    A: new Sprite([
      [n3, w2, w2, w2, w2],
      [w2, n3, w2, n3, n3],
      [n3, w2, w2, w2, w2]
    ]),
    B: new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, w2, n3, w2],
      [n3, w2, n3, w2, n3]
    ]),
    C: new Sprite([
      [n3, w2, w2, w2, n3],
      [w2, n3, n3, n3, w2],
      [n3, w2, n3, w2, n3]
    ]),
    D: new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, n3, n3, w2],
      [n3, w2, w2, w2, n3]
    ]),
    E: new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, w2, n3, w2],
      [w2, n3, n3, n3, w2]
    ]),
    F: new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, w2, n3, n3],
      [w2, n3, n3, n3, n3]
    ]),
    G: new Sprite([
      [n3, w2, w2, w2, n3],
      [w2, n3, n3, n3, w2],
      [w2, n3, n3, w2, w2]
    ]),
    H: new Sprite([
      [w2, w2, w2, w2, w2],
      [n3, n3, w2, n3, n3],
      [w2, w2, w2, w2, w2]
    ]),
    I: new Sprite([
      [w2, n3, n3, n3, w2],
      [w2, w2, w2, w2, w2],
      [w2, n3, n3, n3, w2]
    ]),
    J: new Sprite([
      [n3, n3, n3, w2, n3],
      [n3, n3, n3, n3, w2],
      [w2, w2, w2, w2, n3]
    ]),
    K: new Sprite([
      [w2, w2, w2, w2, w2],
      [n3, n3, w2, n3, n3],
      [w2, w2, n3, w2, w2]
    ]),
    L: new Sprite([
      [w2, w2, w2, w2, w2],
      [n3, n3, n3, n3, w2],
      [n3, n3, n3, n3, w2]
    ]),
    M: new Sprite([
      [w2, w2, w2, w2, w2],
      [n3, w2, n3, n3, n3],
      [n3, n3, w2, n3, n3],
      [n3, w2, n3, n3, n3],
      [w2, w2, w2, w2, w2]
    ]),
    N: new Sprite([
      [w2, w2, w2, w2, w2],
      [n3, w2, n3, n3, n3],
      [n3, n3, w2, n3, n3],
      [w2, w2, w2, w2, w2]
    ]),
    O: new Sprite([
      [n3, w2, w2, w2, n3],
      [w2, n3, n3, n3, w2],
      [n3, w2, w2, w2, n3]
    ]),
    P: new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, w2, n3, n3],
      [n3, w2, n3, n3, n3]
    ]),
    Q: new Sprite([
      [n3, w2, w2, w2, n3],
      [w2, n3, n3, n3, w2],
      [w2, n3, n3, w2, w2],
      [n3, w2, w2, w2, w2]
    ]),
    R: new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, w2, n3, n3],
      [n3, w2, n3, w2, w2]
    ]),
    S: new Sprite([
      [n3, w2, n3, n3, w2],
      [w2, n3, w2, n3, w2],
      [w2, n3, n3, w2, n3]
    ]),
    T: new Sprite([
      [w2, n3, n3, n3, n3],
      [w2, w2, w2, w2, w2],
      [w2, n3, n3, n3, n3]
    ]),
    U: new Sprite([
      [w2, w2, w2, w2, n3],
      [n3, n3, n3, n3, w2],
      [w2, w2, w2, w2, w2]
    ]),
    V: new Sprite([
      [w2, w2, w2, w2, n3],
      [n3, n3, n3, n3, w2],
      [w2, w2, w2, w2, n3]
    ]),
    W: new Sprite([
      [w2, w2, w2, w2, n3],
      [n3, n3, n3, n3, w2],
      [n3, n3, n3, w2, n3],
      [n3, n3, n3, n3, w2],
      [w2, w2, w2, w2, n3]
    ]),
    X: new Sprite([
      [w2, w2, n3, w2, w2],
      [n3, n3, w2, n3, n3],
      [w2, w2, n3, w2, w2]
    ]),
    Y: new Sprite([
      [w2, w2, n3, n3, n3],
      [n3, n3, w2, n3, w2],
      [w2, w2, w2, w2, n3]
    ]),
    Z: new Sprite([
      [w2, n3, n3, w2, w2],
      [w2, n3, w2, n3, w2],
      [w2, w2, n3, n3, w2]
    ]),
    a: new Sprite([
      [n3, n3, n3, n3, w2, n3],
      [n3, w2, n3, w2, n3, w2],
      [n3, w2, w2, w2, w2, w2]
    ]),
    b: new Sprite([
      [w2, w2, w2, w2, w2],
      [n3, n3, w2, n3, w2],
      [n3, n3, n3, w2, w2]
    ]),
    c: new Sprite([
      [n3, w2, w2, w2, w2],
      [n3, w2, n3, n3, w2]
    ]),
    d: new Sprite([
      [n3, n3, n3, w2, w2],
      [n3, n3, w2, n3, w2],
      [w2, w2, w2, w2, w2]
    ]),
    e: new Sprite([
      [n3, w2, w2, w2, w2, n3],
      [n3, w2, n3, w2, n3, w2],
      [n3, n3, w2, w2, n3, n3]
    ]),
    f: new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, w2, n3, n3]
    ]),
    g: new Sprite([
      [n3, n3, w2, w2, n3, n3, w2],
      [n3, n3, w2, n3, w2, n3, w2],
      [n3, n3, w2, w2, w2, w2, n3]
    ]),
    h: new Sprite([
      [w2, w2, w2, w2, w2],
      [n3, n3, w2, n3, n3],
      [n3, n3, n3, w2, w2]
    ]),
    i: new Sprite([
      [w2, n3, w2, w2, w2]
    ]),
    j: new Sprite([
      [n3, n3, n3, n3, n3, w2],
      [n3, w2, n3, w2, w2, w2]
    ]),
    k: new Sprite([
      [w2, w2, w2, w2, w2],
      [n3, n3, w2, n3, n3],
      [n3, w2, n3, w2, w2]
    ]),
    l: new Sprite([
      [w2, w2, w2, w2, w2]
    ]),
    m: new Sprite([
      [n3, n3, w2, w2, w2],
      [n3, n3, w2, n3, n3],
      [n3, n3, n3, w2, n3],
      [n3, n3, w2, n3, n3],
      [n3, n3, w2, w2, w2]
    ]),
    n: new Sprite([
      [n3, n3, w2, w2, w2],
      [n3, n3, w2, n3, n3],
      [n3, n3, n3, w2, w2]
    ]),
    o: new Sprite([
      [n3, n3, w2, w2, w2],
      [n3, n3, w2, n3, w2],
      [n3, n3, w2, w2, w2]
    ]),
    p: new Sprite([
      [n3, n3, w2, w2, w2, w2, w2],
      [n3, n3, w2, n3, w2, n3, n3],
      [n3, n3, w2, w2, n3, n3, n3]
    ]),
    q: new Sprite([
      [n3, n3, w2, w2, n3, n3, n3],
      [n3, n3, w2, n3, w2, n3, n3],
      [n3, n3, w2, w2, w2, w2, w2]
    ]),
    r: new Sprite([
      [n3, n3, w2, w2, w2],
      [n3, n3, w2, n3, n3]
    ]),
    s: new Sprite([
      [n3, w2, w2, n3, w2],
      [n3, w2, n3, w2, w2]
    ]),
    t: new Sprite([
      [n3, w2, n3, n3, n3],
      [w2, w2, w2, w2, w2],
      [n3, w2, n3, n3, n3]
    ]),
    u: new Sprite([
      [n3, n3, w2, w2, n3],
      [n3, n3, n3, n3, w2],
      [n3, n3, w2, w2, w2]
    ]),
    v: new Sprite([
      [n3, n3, w2, w2, n3],
      [n3, n3, n3, n3, w2],
      [n3, n3, w2, w2, n3]
    ]),
    w: new Sprite([
      [n3, n3, w2, w2, n3],
      [n3, n3, n3, n3, w2],
      [n3, n3, n3, w2, w2],
      [n3, n3, n3, n3, w2],
      [n3, n3, w2, w2, n3]
    ]),
    x: new Sprite([
      [n3, n3, w2, n3, w2],
      [n3, n3, n3, w2, n3],
      [n3, n3, w2, n3, w2]
    ]),
    y: new Sprite([
      [n3, n3, w2, w2, w2, n3, w2],
      [n3, n3, n3, n3, w2, n3, w2],
      [n3, n3, w2, w2, w2, w2, n3]
    ]),
    z: new Sprite([
      [n3, n3, w2, n3, n3],
      [n3, n3, w2, w2, w2],
      [n3, n3, n3, n3, w2]
    ]),
    "0": new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, n3, n3, w2],
      [w2, w2, w2, w2, w2]
    ]),
    "1": new Sprite([
      [w2, n3, n3, n3, w2],
      [w2, w2, w2, w2, w2],
      [n3, n3, n3, n3, w2]
    ]),
    "2": new Sprite([
      [w2, n3, w2, w2, w2],
      [w2, n3, w2, n3, w2],
      [n3, w2, w2, n3, w2]
    ]),
    "3": new Sprite([
      [w2, n3, w2, n3, w2],
      [w2, n3, w2, n3, w2],
      [w2, w2, w2, w2, w2]
    ]),
    "4": new Sprite([
      [w2, w2, n3, n3, n3],
      [n3, n3, w2, n3, n3],
      [w2, w2, w2, w2, w2]
    ]),
    "5": new Sprite([
      [w2, w2, w2, n3, w2],
      [w2, n3, w2, n3, w2],
      [w2, n3, n3, w2, w2]
    ]),
    "6": new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, w2, n3, w2],
      [w2, n3, n3, w2, w2]
    ]),
    "7": new Sprite([
      [w2, n3, n3, w2, w2],
      [w2, n3, w2, n3, n3],
      [w2, w2, n3, n3, n3]
    ]),
    "8": new Sprite([
      [w2, w2, n3, w2, w2],
      [w2, n3, w2, n3, w2],
      [w2, w2, n3, w2, w2]
    ]),
    "9": new Sprite([
      [w2, w2, n3, n3, w2],
      [w2, n3, w2, n3, w2],
      [w2, w2, w2, w2, w2]
    ]),
    "!": new Sprite([
      [w2, w2, w2, n3, w2]
    ]),
    ".": new Sprite([
      [n3, n3, n3, n3, w2]
    ]),
    ",": new Sprite([
      [n3, n3, n3, n3, w2, w2]
    ]),
    "?": new Sprite([
      [w2, n3, w2, w2, n3, w2],
      [n3, w2, n3, n3, n3, n3]
    ]),
    "<": new Sprite([
      [n3, n3, w2, n3, n3],
      [n3, w2, w2, w2, n3],
      [w2, w2, n3, w2, w2],
      [w2, n3, n3, n3, w2]
    ]),
    ">": new Sprite([
      [w2, n3, n3, n3, w2],
      [w2, w2, n3, w2, w2],
      [n3, w2, w2, w2, n3],
      [n3, n3, w2, n3, n3]
    ]),
    "-": new Sprite([
      [n3, n3, w2, n3, n3],
      [n3, n3, w2, n3, n3],
      [n3, n3, w2, n3, n3]
    ]),
    ":": new Sprite([
      [n3, n3, n3, n3, n3],
      [n3, n3, w2, n3, w2],
      [n3, n3, n3, n3, n3]
    ]),
    $: new Sprite([
      [n3, n3, w2, n3],
      [w2, w2, w2, w2],
      [w2, n3, w2, n3],
      [w2, w2, w2, w2],
      [n3, w2, n3, w2],
      [w2, w2, w2, w2],
      [n3, w2, n3, n3]
    ]).invertY().rotateRight().setPermanentOffset({ x: 0, y: -1 }),
    "+": new Sprite([
      [n3, n3, n3],
      [n3, w2, n3],
      [w2, w2, w2],
      [n3, w2, n3],
      [n3, n3, n3]
    ]).invertY().rotateRight(),
    "%": new Sprite([
      [w2, n3, n3, w2],
      [n3, n3, w2, w2],
      [n3, w2, w2, n3],
      [w2, w2, n3, n3],
      [w2, n3, n3, w2]
    ]).invertY().rotateRight(),
    " ": new Sprite([
      [n3, n3, n3, n3, n3],
      [n3, n3, n3, n3, n3],
      [n3, n3, n3, n3, n3]
    ])
  };

  // src/rendering/fonts/phoenix.ts
  var w3 = "white";
  var n4 = null;
  var phoenix_default = {
    meta: {
      width: 15,
      height: 15,
      lineHeight: 16,
      letterSpacing: -1
    },
    P: new Sprite([
      [n4, n4, n4, w3, w3, w3, w3, w3, w3, w3, w3, w3, n4, n4],
      [n4, n4, n4, n4, n4, w3, w3, w3, n4, n4, w3, w3, w3, n4],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, w3, w3, w3],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3],
      [n4, n4, n4, n4, w3, w3, w3, n4, n4, n4, n4, w3, w3, w3],
      [n4, n4, n4, w3, w3, w3, w3, w3, n4, n4, w3, w3, w3, n4],
      [n4, n4, n4, w3, w3, n4, w3, w3, w3, w3, w3, w3, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [w3, w3, w3, w3, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4]
    ]).invertY().rotateRight(),
    H: new Sprite([
      [n4, n4, n4, w3, w3, w3, w3, w3, w3, n4, n4, w3, w3, w3, w3, w3, w3],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, w3, w3, w3, w3, w3, w3, w3, w3, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [w3, w3, w3, w3, w3, w3, n4, n4, w3, w3, w3, w3, w3, w3, n4, n4, n4]
    ]).invertY().rotateRight(),
    O: new Sprite([
      [n4, n4, n4, n4, n4, w3, w3, w3, w3, w3, n4, n4],
      [n4, n4, n4, n4, w3, w3, w3, n4, w3, w3, w3, n4],
      [n4, n4, n4, w3, w3, w3, n4, n4, n4, w3, w3, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, w3, w3, w3],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3],
      [n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, w3, w3],
      [n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, w3, w3],
      [n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4],
      [w3, w3, n4, n4, n4, n4, n4, n4, n4, w3, w3, n4],
      [w3, w3, n4, n4, n4, n4, n4, n4, n4, w3, w3, n4],
      [w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4],
      [n4, w3, w3, n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, w3, w3, n4, n4, n4, n4, n4]
    ]).invertY().rotateRight(),
    E: new Sprite([
      [n4, n4, n4, w3, w3, w3, w3, w3, w3, w3, w3, w3, w3, w3],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, w3, n4, n4, n4],
      [n4, n4, n4, w3, w3, w3, w3, w3, w3, w3, w3, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, w3, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, n4, w3, n4, n4],
      [w3, w3, w3, w3, w3, w3, w3, w3, w3, w3, w3, w3, n4, n4]
    ]).invertY().rotateRight(),
    N: new Sprite([
      [n4, n4, n4, w3, w3, w3, w3, n4, n4, n4, n4, w3, w3, w3, w3, w3, w3],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4],
      [n4, n4, n4, n4, n4, w3, w3, w3, n4, n4, n4, n4, n4, w3, w3, n4, n4],
      [n4, n4, n4, n4, w3, w3, w3, w3, n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, w3, w3, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, w3, w3, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, w3, w3, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, w3, w3, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, w3, w3, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, w3, w3, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, w3, w3, w3, w3, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, w3, w3, w3, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [w3, w3, w3, w3, w3, w3, n4, n4, n4, n4, w3, w3, w3, w3, n4, n4, n4]
    ]).invertY().rotateRight(),
    I: new Sprite([
      [n4, n4, n4, w3, w3, w3, w3, w3, w3],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [w3, w3, w3, w3, w3, w3, n4, n4, n4]
    ]).invertY().rotateRight(),
    X: new Sprite([
      [n4, n4, n4, w3, w3, w3, w3, w3, w3, n4, n4, w3, w3, w3, w3, w3, w3],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4],
      [n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, w3, w3, n4, n4, n4, n4],
      [n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, n4, n4, n4, w3, w3, w3, w3, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, n4, n4, n4, w3, w3, w3, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, n4, n4, n4, w3, w3, w3, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, n4, n4, n4, w3, w3, w3, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, n4, n4, w3, w3, w3, w3, n4, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, n4, w3, w3, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, n4, w3, w3, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, n4],
      [n4, n4, n4, w3, w3, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [n4, n4, w3, w3, n4, n4, n4, n4, n4, n4, w3, w3, n4, n4, n4, n4, n4],
      [w3, w3, w3, w3, w3, w3, n4, n4, w3, w3, w3, w3, w3, w3, n4, n4, n4]
    ]).invertY().rotateRight()
  };

  // src/components/text-display.ts
  var fonts = {
    arcade: arcade_default,
    "arcade-small": arcade_small_default,
    phoenix: phoenix_default
  };

  class TextDisplay extends GameObject {
    rawMessage;
    font;
    color;
    border;
    padding;
    background;
    isPhysicalEntity;
    message;
    width;
    height;
    constructor(parent, options) {
      super(parent);
      this.rawMessage = options.message || " ";
      this.font = fonts[options.font || "arcade-small"];
      this.color = options.color || "white";
      this.position = options.position;
      this.border = !!options.border;
      this.padding = options.padding || 0;
      this.background = options.background || null;
      this.index = options.index || 10;
      this.isPhysicalEntity = options.isPhysicalEntity;
      this.reset();
    }
    reset() {
      super.reset();
      this.changeMessage(this.rawMessage);
    }
    changeMessage(text) {
      let processedText = text || " ";
      this.rawMessage = processedText;
      if (typeof processedText === "string") {
        processedText = [processedText];
      }
      const charArrays = processedText.map((str) => str.split(""));
      this.message = charArrays;
      this.populateSprites();
      this.updateColor(this.color);
    }
    populateSprites() {
      this.children = [];
      const self = this;
      if (!this.position || !this.message)
        return;
      let width = 0;
      let height = 0;
      let xOffset = this.position.x;
      let yOffset = this.position.y;
      const lineWidths = [];
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
      this.message.forEach((line) => {
        let xLineOffset = xOffset;
        let lineWidth = 0;
        line.forEach((char) => {
          const sprite = self.font[char];
          if (sprite) {
            const entity = new GameObject(self);
            entity.sprite = sprite.clone();
            entity.index = self.index + 1;
            entity.position = {
              x: xLineOffset,
              y: yOffset
            };
            self.addChild(entity);
            lineWidth += sprite.width + self.font.meta.letterSpacing;
            xLineOffset += sprite.width + self.font.meta.letterSpacing;
          } else {
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
    }
    createBackgroundSprite(width, height) {
      const spriteRows = [];
      for (let x = 0;x < width; x++) {
        const row = [];
        for (let y2 = 0;y2 < height; y2++) {
          row.push(this.background);
        }
        spriteRows.push(row);
      }
      this.sprite = new Sprite(spriteRows);
    }
    updateColor(color) {
      this.color = color;
      const width = this.width;
      const height = this.height;
      this.children.forEach((entity) => {
        if (entity.sprite) {
          entity.sprite.applyColor(color);
        }
      });
      if (this.border && this.sprite && width && height) {
        this.sprite.iterateCells((cell, x, y2) => {
          if (x === 0 || y2 === 0 || x === width - 1 || y2 === height - 1) {
            cell.color = color;
          }
        });
      }
    }
    applyDamage() {
      this.children.forEach((entity) => {
        if (entity) {
          entity.sprite = shipExplosion({ x: -2, y: -1 });
        }
      });
    }
  }

  // src/components/bank.ts
  class Bank extends GameObject {
    index = 1;
    anchorPoint;
    color;
    valueDisplay;
    value = 0;
    width;
    constructor(parent, options) {
      super(parent);
      const opts = options || {};
      this.anchorPoint = opts.position || { x: 0, y: 0 };
      this.position = { x: 0, y: this.anchorPoint.y };
      this.color = opts.color || "#ffffff";
      this.valueDisplay = new TextDisplay(this, {
        font: "arcade-small",
        color: this.color,
        index: 1,
        position: { x: this.position.x, y: this.position.y }
      });
      this.reset();
    }
    reset() {
      super.reset();
      this.addChild(this.valueDisplay);
      this.value = 0;
      this.updateDisplay();
    }
    addMoney(value) {
      this.value += value;
      this.updateDisplay();
    }
    removeMoney(amount) {
      this.value -= amount;
      this.updateDisplay();
    }
    updateDisplay() {
      this.valueDisplay.changeMessage("$" + this.value + ".0");
      const width = this.valueDisplay.width;
      if (width && this.position && this.valueDisplay.position) {
        this.position.x = this.valueDisplay.position.x = this.anchorPoint.x - width;
      }
    }
  }

  // src/sprites/bullet.ts
  function bulletSprite() {
    return new Sprite([
      ["white", "white"]
    ]);
  }

  // src/components/bullet.ts
  class Bullet extends GameObject {
    type = "bullet";
    isPhysicalEntity = true;
    index = 5;
    team;
    value;
    constructor(parent, options) {
      super(parent);
      const opts = options || {};
      this.team = opts.team || 0;
      this.position = opts.position || { x: 0, y: 0 };
      this.velocity = opts.velocity || { x: 0, y: 0 };
      this.acceleration = opts.acceleration || { x: 0, y: 0 };
      this.damage = opts.damage || 1;
      this.life = opts.life || 0;
      this.maxLife = opts.maxLife || 1;
      this.sprite = bulletSprite();
      this.explosion = smallExplosion;
      this.updateBulletDirection();
      this.updateColor();
      this.reset();
    }
    checkBoundaries() {
      if (this.position && this.parent) {
        const parentWidth = this.parent.width;
        const parentHeight = this.parent.height;
        if (this.position.x < 0 || this.position.y < 0 || this.position.x > parentWidth || this.position.y > parentHeight) {
          this.destroy();
        }
      }
    }
    updateBulletDirection() {
      if (this.velocity && this.sprite) {
        if (Math.abs(this.velocity.x) > Math.abs(this.velocity.y)) {
          this.sprite.rotateRight();
        }
      }
    }
    updateColor() {
      if (this.sprite) {
        switch (this.team) {
          case 0:
            this.sprite.applyColor("#B1D8AD");
            break;
          case 1:
            this.sprite.applyColor("#F7BEBE");
            break;
          default:
            break;
        }
      }
    }
    applyDamage(damage, sourceEntity) {
      super.applyDamage(damage, sourceEntity);
      if (this.position && this.sprite) {
        this.position.x -= Math.floor(this.sprite.width / 2);
        this.position.y -= Math.floor(this.sprite.height / 2);
      }
    }
  }

  // src/helpers/collect-entities.ts
  function collectEntities(node, matcherFn, collection) {
    collection = collection || [];
    if (node) {
      if (matcherFn(node)) {
        collection.push(node);
      }
      if (node.children && node.children.length) {
        for (let i = 0;i < node.children.length; i++) {
          collectEntities(node.children[i], matcherFn, collection);
        }
      }
    }
    return collection;
  }

  // src/helpers/collisions.ts
  var DUMMY_CELL = { x: -1, y: -1, color: "", index: -1 };

  class CollisionDetectionFrame {
    collisionDetected = false;
    cells = [];
    cellAt(x, y2) {
      if (!this.collisionDetected) {
        if (!this.cells[x]) {
          this.cells[x] = [];
        }
        if (!this.cells[x][y2]) {
          this.cells[x][y2] = true;
        } else {
          this.collisionDetected = true;
        }
      }
      return DUMMY_CELL;
    }
  }
  function entityToBoundingBox(entity) {
    return {
      x1: entity.position.x,
      x2: entity.position.x + entity.sprite.width,
      y1: entity.position.y,
      y2: entity.position.y + entity.sprite.height
    };
  }
  function boxCollision(entityA, entityB) {
    const a = entityToBoundingBox(entityA);
    const b = entityToBoundingBox(entityB);
    return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  }
  function spriteCollision(entityA, entityB) {
    const collisionFrame = new CollisionDetectionFrame;
    entityA.renderToFrame(collisionFrame);
    entityB.renderToFrame(collisionFrame);
    return collisionFrame.collisionDetected;
  }

  // src/helpers/gradients.ts
  var GreenToRed = {
    start: 120,
    end: 0,
    inverted: true,
    S: 1,
    L: 0.5
  };
  function colorAtPercent(gradient, percent) {
    if (gradient.inverted) {
      percent = 1 - percent;
    }
    let H = (gradient.end - gradient.start) * percent + gradient.start;
    let S = gradient.S * 100;
    let L = gradient.L * 100;
    H = Math.floor(H);
    const SStr = Math.floor(S) + "%";
    const LStr = Math.floor(L) + "%";
    return "hsl(" + H + ", " + SStr + ", " + LStr + ")";
  }

  // src/sprites/combo-gauge.ts
  function comboGaugeSprite() {
    const w4 = "#fff";
    const n5 = null;
    return new Sprite([
      [n5, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, n5],
      [w4, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, w4],
      [w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4],
      [w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4],
      [w4, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, n5, n5, n5, n5, n5, n5, n5, n5, n5, n5, w4, w4],
      [n5, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, w4, n5]
    ]);
  }

  // src/helpers/pad-score-display.ts
  function padScoreDisplay(score) {
    let scoreStr = score + "";
    switch (scoreStr.length) {
      case 0:
        scoreStr = "0" + scoreStr;
      case 1:
        scoreStr = "0" + scoreStr;
      case 2:
        scoreStr = "0" + scoreStr;
      case 3:
        scoreStr = "0" + scoreStr;
      case 4:
        scoreStr = "0" + scoreStr;
      case 5:
        scoreStr = "0" + scoreStr;
    }
    return scoreStr;
  }

  // src/components/combo-gauge.ts
  class ComboGauge extends GameObject {
    index = 1;
    color;
    multiplierDisplay;
    scoreDisplay;
    comboPoints = 0;
    pointTotal = 0;
    pointMultiplier = 1;
    fillGaugeSprite;
    constructor(parent, options) {
      super(parent);
      this.position = options.position;
      this.color = options.color || "#ffffff";
      this.sprite = comboGaugeSprite().applyColor(this.color);
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
      this.reset();
    }
    reset() {
      super.reset();
      this.comboPoints = 0;
      this.pointTotal = 0;
      this.updateMultiplier();
      this.updateGaugeHeight();
      this.updateScore();
      this.addChild(this.multiplierDisplay);
      this.addChild(this.scoreDisplay);
    }
    renderToFrame(frame) {
      if (this.fillGaugeSprite && this.position) {
        this.fillGaugeSprite.renderToFrame(frame, this.position.x + 1, this.position.y + 1, this.index - 1);
      }
      super.renderToFrame(frame);
    }
    addPoints(points) {
      this.pointTotal += this.pointMultiplier * points;
      this.updateScore();
    }
    getScore() {
      return this.pointTotal;
    }
    bumpCombo() {
      this.comboPoints++;
      this.updateMultiplier();
      this.updateGaugeHeight();
    }
    clearCombo() {
      this.comboPoints = 0;
      this.updateMultiplier();
      this.updateGaugeHeight();
    }
    updateScore() {
      this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
    }
    updateMultiplier() {
      if (this.comboPoints >= 59) {
        this.pointMultiplier = 6;
      } else if (this.comboPoints >= 48) {
        this.pointMultiplier = 5;
      } else if (this.comboPoints >= 36) {
        this.pointMultiplier = 4;
      } else if (this.comboPoints >= 24) {
        this.pointMultiplier = 3;
      } else if (this.comboPoints >= 12) {
        this.pointMultiplier = 2;
      } else {
        this.pointMultiplier = 1;
      }
      this.multiplierDisplay.changeMessage(this.pointMultiplier + "x");
    }
    updateGaugeHeight() {
      const pixels = [];
      for (let i = 0;i < 59; i++) {
        if (i < this.comboPoints) {
          pixels.unshift(colorAtPercent(GreenToRed, 1 - i / 59));
        } else {
          pixels.unshift(null);
        }
      }
      this.fillGaugeSprite = new Sprite([
        pixels,
        pixels,
        pixels,
        pixels
      ]);
    }
  }

  // src/models/evented-input.ts
  class EventedInput {
    onUp;
    onDown;
    onFire;
    onStart;
    onSelect;
    upReleased = false;
    downReleased = false;
    fireReleased = false;
    startReleased = false;
    constructor(options) {
      this.onUp = options.onUp || function() {};
      this.onDown = options.onDown || function() {};
      this.onFire = options.onFire || function() {};
      this.onStart = options.onStart || function() {};
      this.onSelect = options.onSelect || function() {};
      this.reset();
    }
    reset() {
      this.upReleased = false;
      this.downReleased = false;
      this.fireReleased = false;
      this.startReleased = false;
    }
    processInput(input) {
      if (input.movementVector.y < 0.6) {
        this.downReleased = true;
      }
      if (input.movementVector.y > -0.6) {
        this.upReleased = true;
      }
      if (!input.start) {
        this.startReleased = true;
      }
      if (!input.fire) {
        this.fireReleased = true;
      }
      if (input.movementVector.y >= 0.6 && this.downReleased) {
        this.downReleased = false;
        this.onDown();
      }
      if (input.movementVector.y <= -0.6 && this.upReleased) {
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
  }

  // src/screens/controls-description.ts
  class ControlsDescription extends GameObject {
    headerDef = {
      font: "arcade",
      message: "Controls",
      color: "white",
      position: { x: 5, y: 5 }
    };
    inputDescriptions = [
      {
        message: ["", "Move", "Fire"],
        position: { x: 5, y: 20 }
      },
      {
        message: ["- Keyboard", "- WASD", "- Space"],
        position: { x: 35, y: 20 }
      },
      {
        message: ["- Controller", "- Left Stick", "- A"],
        position: { x: 85, y: 20 }
      }
    ];
    constructor(parent) {
      super(parent);
      this.reset();
    }
    reset() {
      super.reset();
      this.addChild(new TextDisplay(this, this.headerDef));
      this.inputDescriptions.forEach(function(item) {
        this.addChild(new TextDisplay(this, {
          font: "arcade-small",
          color: "#F6EC9A",
          message: item.message,
          position: item.position
        }));
      }.bind(this));
      this.addChild(new EventedInput({
        onSelect: this.onSelect.bind(this)
      }));
    }
    onSelect() {
      this.parent.reset();
    }
  }

  // src/sprites/arrow-ship.ts
  function arrowShipSprite() {
    const w1 = "#ffffff";
    const w22 = "#cccccc";
    const g1 = "#aaaaaa";
    const g2 = "#888888";
    const g3 = "#666666";
    const g4 = "#222222";
    const nn = null;
    return new Sprite([
      [g3, nn, nn, nn, nn, nn, g3],
      [g2, g2, nn, nn, nn, g2, g2],
      [nn, g2, g1, nn, g1, g2, nn],
      [nn, g1, g1, w1, g1, g1, nn],
      [nn, nn, w22, g4, w22, nn, nn],
      [nn, nn, w22, w1, w22, nn, nn],
      [nn, nn, nn, w1, nn, nn, nn],
      [nn, nn, nn, w1, nn, nn, nn]
    ], {
      guns: [{ x: 3, y: 7 }]
    });
  }

  // src/screens/slim-title-screen.ts
  class SlimTitleScreen extends GameObject {
    selectedMenuItem;
    timeSinceSelected;
    selecting;
    selectorShip;
    selectorRight;
    constructor(parent) {
      super(parent);
      this.reset();
    }
    reset() {
      super.reset();
      this.selectedMenuItem = 0;
      this.timeSinceSelected = 0;
      this.selecting = false;
      this.addDisplayText();
      this.createShipSelectors();
      this.addChild(new EventedInput({
        onSelect: this.onSelect.bind(this)
      }));
    }
    addDisplayText() {
      this.addChild(new TextDisplay(this, {
        font: "phoenix",
        message: "PHOENIX",
        position: { x: 50, y: 30 }
      }));
      this.addChild(new TextDisplay(this, {
        font: "arcade-small",
        message: "Start",
        position: { x: 90, y: 80 },
        isPhysicalEntity: true
      }));
      this.addChild(new TextDisplay(this, {
        font: "arcade-small",
        message: "WASD - move ship",
        position: { x: 5, y: 120 }
      }));
      this.addChild(new TextDisplay(this, {
        font: "arcade-small",
        message: "SPACE - fire gun",
        position: { x: 5, y: 130 }
      }));
      this.addChild(new TextDisplay(this, {
        font: "arcade-small",
        message: "ENTER - pause",
        position: { x: 5, y: 140 }
      }));
    }
    createShipSelectors() {
      this.selectorShip = new GameObject;
      this.selectorRight = new GameObject;
      this.selectorShip.sprite = arrowShipSprite();
      this.selectorRight.sprite = arrowShipSprite().invertX();
      this.selectorShip.position = { x: 70, y: 80 };
      this.selectorRight.position = { x: 120, y: 80 };
      this.addChild(this.selectorShip);
      this.addChild(this.selectorRight);
    }
    update(dtime) {
      super.update(dtime);
      this.timeSinceSelected += dtime;
      if (this.selecting && this.timeSinceSelected > 595) {
        this.propagateSelection();
      }
    }
    onSelect() {
      if (!this.selecting) {
        this.startGame();
      }
    }
    startGame() {
      this.selecting = true;
      this.timeSinceSelected = 0;
      const x1 = this.selectorShip.position.x + this.selectorShip.sprite.width;
      const x2 = this.selectorRight.position.x;
      const y2 = this.selectorShip.position.y + Math.floor(this.selectorShip.sprite.height / 2);
      this.addChild(new Bullet(this, {
        team: 2,
        position: { x: x1, y: y2 },
        velocity: { x: 50, y: 0 }
      }));
      this.addChild(new Bullet(this, {
        team: 3,
        position: { x: x2, y: y2 },
        velocity: { x: -50, y: 0 }
      }));
    }
    propagateSelection() {
      this.parent.startNewGame();
      this.destroy();
    }
  }

  // src/screens/game-over-screen.ts
  class GameOverScreen extends GameObject {
    resultMessage = {
      font: "arcade",
      message: "GAME OVER",
      position: { x: 67, y: 53 }
    };
    headerDef = {
      font: "arcade-small",
      border: true,
      padding: 20,
      message: "< hit enter >",
      position: { x: 55, y: 45 }
    };
    subHeaderDef = {
      font: "arcade-small",
      message: "Final Score:",
      position: { x: 68, y: 77 }
    };
    scoreDisplayDef = {
      font: "arcade-small",
      message: "0",
      color: "yellow",
      position: { x: 111, y: 77 }
    };
    result;
    header;
    subHeader;
    scoreDisplay;
    inputEvents;
    constructor(parent) {
      super(parent);
      this.result = new TextDisplay(this, this.resultMessage);
      this.header = new TextDisplay(this, this.headerDef);
      this.subHeader = new TextDisplay(this, this.subHeaderDef);
      this.scoreDisplay = new TextDisplay(this, this.scoreDisplayDef);
      this.inputEvents = new EventedInput({
        onStart: this.onStart.bind(this)
      });
      this.reset();
    }
    reset() {
      super.reset();
      this.addChild(this.result);
      this.addChild(this.header);
      this.addChild(this.subHeader);
      this.addChild(this.scoreDisplay);
      this.addChild(this.inputEvents);
      this.inputEvents.reset();
    }
    onStart() {
      this.parent.finishGame();
    }
    setResult(result) {
      if (result === "win") {
        this.header.updateColor("green");
        this.result.updateColor("green");
        this.subHeader.updateColor("green");
        this.result.changeMessage("YOU WIN!");
      } else if (result === "loss") {
        this.header.updateColor("red");
        this.result.updateColor("red");
        this.subHeader.updateColor("red");
        this.result.changeMessage("GAME OVER");
      }
    }
    setFinalScore(score) {
      this.scoreDisplay.changeMessage(padScoreDisplay(score));
    }
  }

  // src/helpers/input-interpreter.ts
  function newInputDescriptor2() {
    return {
      movementVector: { x: 0, y: 0 },
      fire: false,
      start: false
    };
  }
  function normalizeVector(vector) {
    const x = vector.x;
    const y2 = vector.y;
    const length = Math.sqrt(Math.pow(x, 2) + Math.pow(y2, 2));
    if (length > 1) {
      vector.x = x / length;
      vector.y = y2 / length;
    }
  }

  class InputInterpreter {
    interpret(inputSources) {
      const gameInput = newInputDescriptor2();
      inputSources.forEach((inputSource) => {
        switch (inputSource.INPUT_TYPE) {
          case "gamepad":
            return this.addGamepadInput(inputSource, gameInput);
          case "keyboard":
            return this.addKeyboardInput(inputSource, gameInput);
          default:
            console.error("Unsupported input type: ", inputSource.INPUT_TYPE);
        }
      });
      normalizeVector(gameInput.movementVector);
      return gameInput;
    }
    addKeyboardInput(keyboard, gameInput) {
      if (keyboard["ENTER"]) {
        gameInput.start = true;
      }
      if (keyboard["SPACE"]) {
        gameInput.fire = true;
      }
      if (keyboard["W"]) {
        gameInput.movementVector.y -= 1;
      }
      if (keyboard["A"]) {
        gameInput.movementVector.x -= 1;
      }
      if (keyboard["S"]) {
        gameInput.movementVector.y += 1;
      }
      if (keyboard["D"]) {
        gameInput.movementVector.x += 1;
      }
    }
    addGamepadInput(gamepad, gameInput) {
      if (gamepad["start"]) {
        gameInput.start = true;
      }
      if (gamepad["A"]) {
        gameInput.fire = true;
      }
      gameInput.movementVector.x += gamepad["left-stick-x"];
      gameInput.movementVector.y += gamepad["left-stick-y"];
      if (gamepad["d-pad-up"]) {
        gameInput.movementVector.y -= 1;
      }
      if (gamepad["d-pad-left"]) {
        gameInput.movementVector.x -= 1;
      }
      if (gamepad["d-pad-down"]) {
        gameInput.movementVector.y += 1;
      }
      if (gamepad["d-pad-right"]) {
        gameInput.movementVector.x += 1;
      }
    }
  }

  // src/scripts/fly-player-in-from-bottom.ts
  class FlyPlayerInFromBottom extends GameObject {
    game;
    player;
    constructor(parent, game) {
      super(parent);
      this.game = game;
      this.player = game.player;
      this.reset();
    }
    start() {
      this.player.preventInputControl = true;
      const position = this.player.position;
      const velocity = this.player.velocity;
      position.x = Math.floor(this.game.width / 2 - this.player.sprite.width / 2);
      position.y = this.game.height + 30;
      velocity.x = 0;
      velocity.y = -this.player.SPEED / 5;
      return this;
    }
    update(dtime) {
      super.update(dtime);
      if (this.player.position.y < this.game.height - this.player.sprite.height - 2) {
        this.player.preventInputControl = false;
        this.destroy();
      }
    }
  }

  // src/components/fadeout-banner.ts
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

  class FadeoutBanner extends GameObject {
    text;
    interval;
    elapsedTime = 0;
    colorIndex = 0;
    textDisplay;
    constructor(parent, text, time) {
      super(parent);
      this.text = text;
      this.interval = time / colorGradient.length;
      this.reset();
    }
    start() {
      this.elapsedTime = 0;
      this.colorIndex = 0;
      this.textDisplay = new TextDisplay(this, {
        message: this.text,
        position: { x: 55, y: 50 },
        border: true,
        padding: 15,
        color: colorGradient[this.colorIndex],
        font: "arcade"
      });
      this.addChild(this.textDisplay);
    }
    update(dtime) {
      this.elapsedTime += dtime;
      if (this.elapsedTime > this.interval) {
        this.elapsedTime -= this.interval;
        this.colorIndex++;
        if (this.colorIndex > colorGradient.length) {
          this.parent?.removeChild(this);
        } else if (this.textDisplay) {
          this.textDisplay.updateColor(colorGradient[this.colorIndex]);
        }
      }
    }
  }

  // src/sprites/arrow-boss.ts
  function arrowBossSprite() {
    const w1 = "#ffffff";
    const w22 = "#cccccc";
    const g1 = "#aaaaaa";
    const g2 = "#888888";
    const g3 = "#666666";
    const g4 = "#222222";
    const nn = null;
    return new Sprite([
      [g3, nn, nn, nn, nn, nn, nn, nn, g3, nn, nn, nn, nn, nn, nn, nn, g3],
      [g2, g2, nn, nn, nn, nn, g2, g2, w22, g2, g2, nn, nn, nn, nn, g2, g2],
      [nn, g2, g1, nn, g1, g1, w22, w22, w22, w22, w22, g1, g1, nn, g1, g2, nn],
      [nn, g1, g1, g1, g1, w22, w22, w22, g3, w22, w22, w22, g1, g1, g1, g1, nn],
      [nn, nn, w22, g1, w22, w1, w22, g3, g4, g3, w22, w1, w22, g1, w22, nn, nn],
      [nn, nn, w22, w1, w22, w1, w1, w22, g3, w22, w1, w1, w22, w1, w22, nn, nn],
      [nn, nn, nn, w1, nn, nn, w1, w1, w22, w1, w1, nn, nn, w1, nn, nn, nn],
      [nn, nn, nn, w1, nn, nn, nn, w1, w1, w1, nn, nn, nn, w1, nn, nn, nn],
      [nn, nn, nn, w1, nn, nn, nn, nn, w1, nn, nn, nn, nn, w1, nn, nn, nn],
      [nn, nn, nn, nn, nn, nn, nn, nn, w1, nn, nn, nn, nn, nn, nn, nn, nn],
      [nn, nn, nn, nn, nn, nn, nn, nn, w1, nn, nn, nn, nn, nn, nn, nn, nn]
    ], {
      guns: [
        { x: 3, y: 8 },
        { x: 8, y: 10 },
        { x: 13, y: 8 }
      ]
    });
  }

  // src/components/muzzle-flash.ts
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
  var frames = shades.map((shade) => {
    return new Sprite([
      [shade, shade]
    ]);
  });

  class MuzzleFlash extends GameObject {
    gunPosition;
    constructor(parent, gunPosition) {
      super(parent);
      this.gunPosition = gunPosition;
      this.sprite = new Animation({
        frames,
        millisPerFrame: 25
      });
      this.reset();
    }
    update(dtime) {
      super.update(dtime);
      if (this.sprite && this.sprite.finished) {
        this.destroy();
      }
    }
    renderToFrame(frame) {
      if (this.sprite && this.parent && this.parent.position) {
        this.sprite.renderToFrame(frame, Math.floor(this.parent.position.x + this.gunPosition.x), Math.floor(this.parent.position.y + this.gunPosition.y - 1), (this.parent.index || 0) + 1);
      }
    }
  }

  // src/ships/arrow-boss.ts
  class ArrowBoss extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = 120;
    team = 1;
    index = 5;
    difficultyMultiplier;
    explosion;
    sprite;
    guns;
    position;
    velocity;
    constructor(parent, difficultyMultiplier) {
      super(parent);
      this.difficultyMultiplier = difficultyMultiplier;
      this.reset();
    }
    reset() {
      super.reset();
      this.sprite = arrowBossSprite().rotateRight();
      this.explosion = shipExplosion;
      this.guns = this.sprite.meta.guns;
      this.position = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      this.damage = 50 * this.difficultyMultiplier;
      this.life = 20 * this.difficultyMultiplier;
      this.maxLife = 20 * this.difficultyMultiplier;
    }
    fire(gunIndex) {
      const gun = this.guns[gunIndex];
      const position = {
        x: this.position.x + gun.x,
        y: this.position.y + gun.y
      };
      const velocity = { x: 0, y: this.BULLET_SPEED };
      this.triggerEvent("spawnBullet", {
        team: this.team,
        position,
        velocity,
        damage: this.difficultyMultiplier
      });
      this.addChild(new MuzzleFlash(this, gun));
    }
    applyDamage(damage, sourceEntity) {
      this.triggerEvent("enemyHit");
      super.applyDamage(damage, sourceEntity);
    }
    destroy() {
      this.triggerEvent("enemyDestroyed", {
        shipValue: this.maxLife
      });
      super.destroy();
    }
  }

  // src/scripts/chain-gun-fire.ts
  class ChainGunFire extends GameObject {
    ship;
    gunIndex;
    fireRate;
    burstSize;
    thresholdMin;
    thresholdMax;
    elapsed;
    threshold;
    firing;
    burstCount;
    constructor(parent, ship, options) {
      super(parent);
      const opts = options || {};
      this.ship = ship;
      this.gunIndex = opts.gunIndex ?? 0;
      this.fireRate = opts.fireRate ?? 150;
      this.burstSize = opts.burstSize ?? 5;
      this.thresholdMin = opts.thresholdMin ?? 2000;
      this.thresholdMax = opts.thresholdMax ?? 6000;
      this.reset();
    }
    start() {
      this.resetTimer();
      this.threshold += this.thresholdMax;
    }
    update(dtime) {
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
      } else {
        if (this.elapsed > this.threshold) {
          this.firing = true;
          this.elapsed = 0;
          this.burstCount = 0;
        }
      }
    }
    resetTimer() {
      this.elapsed = 0;
      this.threshold = integer(this.thresholdMin, this.thresholdMax);
    }
  }

  // src/sprites/dagger-ship.ts
  function daggerShipSprite() {
    const w1 = "#ffffff";
    const w22 = "#cccccc";
    const g1 = "#aaaaaa";
    const g2 = "#888888";
    const g3 = "#666666";
    const g4 = "#222222";
    const nn = null;
    return new Sprite([
      [nn, nn, w1, nn, nn],
      [nn, nn, w1, nn, nn],
      [nn, nn, w1, nn, nn],
      [nn, w22, w1, w22, nn],
      [nn, w22, g4, w22, nn],
      [nn, w22, w1, w22, nn],
      [nn, g2, g1, g2, nn],
      [g2, g2, nn, g2, g2],
      [g3, nn, nn, nn, g3]
    ], {
      guns: [{ x: 2, y: 8 }]
    });
  }

  // src/ships/arrow-ship.ts
  class ArrowShip extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = 100;
    team = 1;
    index = 5;
    difficultyMultiplier;
    alternateShip;
    explosion;
    sprite;
    gun;
    position;
    velocity;
    constructor(parent, difficultyMultiplier, alternateShip) {
      super(parent);
      this.difficultyMultiplier = difficultyMultiplier;
      this.alternateShip = alternateShip;
      this.reset();
    }
    reset() {
      super.reset();
      if (this.alternateShip) {
        this.sprite = daggerShipSprite().rotateLeft();
      } else {
        this.sprite = arrowShipSprite().rotateRight();
      }
      this.explosion = shipExplosion;
      this.gun = this.sprite.meta.guns[0];
      this.position = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      this.damage = 5 * this.difficultyMultiplier;
      this.maxLife = this.difficultyMultiplier;
      this.life = this.difficultyMultiplier;
    }
    fire() {
      const position = {
        x: this.position.x + this.gun.x,
        y: this.position.y + this.gun.y
      };
      const velocity = { x: 0, y: this.BULLET_SPEED };
      this.triggerEvent("spawnBullet", {
        team: this.team,
        position,
        velocity,
        damage: this.difficultyMultiplier
      });
      this.addChild(new MuzzleFlash(this, this.gun));
    }
    applyDamage(damage, sourceEntity) {
      this.triggerEvent("enemyHit");
      super.applyDamage(damage, sourceEntity);
    }
    destroy() {
      this.triggerEvent("enemyDestroyed", {
        shipValue: this.maxLife
      });
      super.destroy();
    }
  }

  // src/scripts/fire-single-gun-random-rate.ts
  class FireSingleGunRandomRate extends GameObject {
    ship;
    gunIndex;
    thresholdMin;
    thresholdMax;
    elapsed;
    threshold;
    constructor(parent, ship, options) {
      super(parent);
      const opts = options || {};
      this.ship = ship;
      this.gunIndex = opts.gunIndex ?? 0;
      this.thresholdMin = opts.thresholdMin ?? 1000;
      this.thresholdMax = opts.thresholdMax ?? 3000;
      this.reset();
    }
    start() {
      this.resetTimer();
      this.threshold += this.thresholdMax;
    }
    update(dtime) {
      if (this.ship.destroyed) {
        this.destroy();
      }
      this.elapsed += dtime;
      if (this.elapsed > this.threshold) {
        this.resetTimer();
        this.ship.fire(this.gunIndex);
      }
    }
    resetTimer() {
      this.elapsed = 0;
      this.threshold = integer(this.thresholdMin, this.thresholdMax);
    }
  }

  // src/components/life-meter.ts
  class LifeMeter extends GameObject {
    index = 1;
    entity;
    anchor;
    horizontal;
    length;
    width;
    scale;
    showBorder;
    borderColor;
    currentLife;
    maxLife;
    constructor(boundEntity, options) {
      super(boundEntity);
      const opts = options || {};
      this.entity = boundEntity;
      this.position = opts.position || { x: 0, y: 0 };
      this.anchor = opts.anchor || {};
      this.horizontal = !!opts.horizontal;
      this.length = opts.length || 10;
      this.width = opts.width || 1;
      this.scale = opts.scale;
      this.showBorder = !!opts.showBorder;
      this.borderColor = opts.borderColor || "#ffffff";
      this.reset();
    }
    update() {
      if (this.entity.life !== this.currentLife || this.entity.maxLife !== this.maxLife) {
        this.currentLife = this.entity.life;
        this.maxLife = this.entity.maxLife;
        if (this.scale && this.maxLife) {
          this.length = this.maxLife * this.scale;
          if (this.length > 70) {
            this.length = 70;
          }
        }
        this.redrawMeter();
      }
    }
    redrawMeter() {
      const colors = this.buildSpriteColorArray();
      if (this.showBorder) {
        this.addBorderToColorArray(colors);
      }
      this.sprite = new Sprite(colors);
      if (this.horizontal && this.sprite) {
        this.sprite.rotateRight();
      }
      this.updatePosition();
    }
    buildSpriteColorArray() {
      const percentage = (this.currentLife || 0) / (this.maxLife || 1) * 100;
      const meterColor = colorAtPercent(GreenToRed, (this.currentLife || 0) / (this.maxLife || 1));
      const colors = this.buildEmptySpriteColorArray();
      for (let i = this.length - 1;i >= 0; i--) {
        let color = null;
        if (i / this.length * 100 < percentage) {
          color = meterColor;
        }
        colors.forEach((colorArray) => {
          colorArray.push(color);
        });
      }
      return colors;
    }
    buildEmptySpriteColorArray() {
      const colors = [];
      for (let j = 0;j < this.width; j++) {
        colors.push([]);
      }
      return colors;
    }
    addBorderToColorArray(colors) {
      this.addBezelPixelsToBorder(colors);
      this.addBorderEnds(colors);
      this.addBorderEdges(colors);
    }
    addBezelPixelsToBorder(colors) {
      if (this.width > 2) {
        colors[0][0] = this.borderColor;
        colors[this.width - 1][0] = this.borderColor;
        colors[0][this.length - 1] = this.borderColor;
        colors[this.width - 1][this.length - 1] = this.borderColor;
      }
    }
    addBorderEnds(colors) {
      for (let j = 0;j < this.width; j++) {
        colors[j].push(this.borderColor);
        colors[j].unshift(this.borderColor);
      }
    }
    addBorderEdges(colors) {
      const border = [null];
      for (let i = 0;i < this.length; i++) {
        border.push(this.borderColor);
      }
      border.push(null);
      colors.push(border);
      colors.unshift(border);
    }
    updatePosition() {
      if (!this.position || !this.sprite)
        return;
      if (this.anchor.left !== undefined) {
        this.position.x = this.anchor.left;
      }
      if (this.anchor.top !== undefined) {
        this.position.y = this.anchor.top;
      }
      if (this.anchor.right !== undefined) {
        this.position.x = this.anchor.right - this.sprite.width;
      }
      if (this.anchor.bottom !== undefined) {
        this.position.y = this.anchor.bottom - this.sprite.height;
      }
    }
  }

  // src/components/money-drop.ts
  class MoneyDrop extends GameObject {
    isPhysicalEntity = true;
    type = "pickup";
    team = 1;
    index = 4;
    value;
    constructor(parent, position, velocity) {
      super(parent);
      this.value = 10;
      this.position = position;
      this.velocity = { x: 0, y: 50 };
      this.sprite = arcade_default["$"];
      this.reset();
    }
    checkBoundaries() {
      if (this.position && this.parent) {
        const parentWidth = this.parent.width;
        const parentHeight = this.parent.height;
        if (this.position.x < 0 || this.position.y < 0 || this.position.x > parentWidth || this.position.y > parentHeight) {
          this.destroy();
        }
      }
    }
    applyDamage(damage, sourceEntity) {
      if (sourceEntity && sourceEntity.type === "player") {
        this.triggerEvent("moneyCollected", this.value);
        this.destroy();
      }
    }
  }

  // src/scripts/move-object-to-point.ts
  class MoveObjectToPoint extends GameObject {
    object;
    target;
    delta;
    xPositive;
    yPositive;
    constructor(parent, object, targetPoint, timeDelta) {
      super(parent);
      this.object = object;
      this.target = targetPoint;
      this.delta = timeDelta;
      this.reset();
    }
    start() {
      const current = this.object.position;
      const xDiff = this.target.x - current.x;
      const yDiff = this.target.y - current.y;
      this.object.velocity.x = xDiff / this.delta;
      this.object.velocity.y = yDiff / this.delta;
      this.xPositive = xDiff > 0;
      this.yPositive = yDiff > 0;
    }
    update(dtime) {
      super.update(dtime);
      if (this.metXThreshold() && this.metYThreshold()) {
        this.object.velocity.x = 0;
        this.object.velocity.y = 0;
        this.object.position.x = this.target.x;
        this.object.position.y = this.target.y;
        this.parent.removeChild(this);
      }
    }
    metXThreshold() {
      return this.xPositive && this.object.position.x >= this.target.x || !this.xPositive && this.object.position.x <= this.target.x;
    }
    metYThreshold() {
      return this.yPositive && this.object.position.y >= this.target.y || !this.yPositive && this.object.position.y <= this.target.y;
    }
  }

  // src/models/script-chain.ts
  class ScriptChain extends GameObject {
    repeat;
    scripts;
    scriptIndex;
    activeScript;
    constructor(parent, repeat, scripts) {
      super(parent);
      this.repeat = repeat;
      this.scripts = scripts;
      this.scriptIndex = 0;
      this.activeScript = null;
      const self = this;
      scripts.forEach(function(script) {
        script.parent = self;
      });
      this.reset();
    }
    start() {
      this.activeScript = this.scripts[this.scriptIndex];
      this.activeScript.start();
    }
    update(dtime) {
      if (this.activeScript) {
        this.activeScript.update(dtime);
      }
    }
    removeChild() {
      this.scriptIndex++;
      if (this.scriptIndex >= this.scripts.length) {
        if (this.repeat) {
          this.scriptIndex = 0;
        } else {
          this.parent?.removeChild(this);
          return;
        }
      }
      this.activeScript = this.scripts[this.scriptIndex];
      this.activeScript.start();
    }
  }

  // src/scripts/watch-for-death.ts
  class WatchForDeath extends GameObject {
    entity;
    callback;
    started = false;
    constructor(parent, entity, callback) {
      super(parent);
      this.entity = entity;
      this.callback = callback;
      this.reset();
    }
    update(_dtime) {
      if (this.entity.destroyed && this.started) {
        this.started = false;
        this.callback();
        this.destroy();
      }
    }
    start() {
      this.started = true;
    }
  }

  // src/levels/level-group-01.ts
  class LevelGroup01 extends GameObject {
    alternateShip;
    difficultyMultiplier;
    width;
    height;
    boss;
    game;
    levelName;
    rowCount;
    ships;
    scripts;
    constructor(parent, game, difficultyMultiplier, alternateShip, rowCount, levelName) {
      super(parent);
      this.alternateShip = alternateShip;
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
      this.reset();
    }
    start() {
      this.ships = [];
      this.scripts = [];
      let start = 4 - this.difficultyMultiplier;
      start = start < 1 ? 1 : start;
      let end = 7 + this.difficultyMultiplier;
      end = end > 10 ? 10 : end;
      for (let i = start;i <= end; i++) {
        this.newShip(10 * i + 39, -40, 45, 3);
        if (this.rowCount >= 2) {
          this.newShip(10 * i + 39, -30, 55, 3);
        }
        if (this.rowCount >= 3) {
          this.newShip(10 * i + 39, -20, 65, 3);
        }
        if (this.rowCount >= 4) {
          this.newShip(10 * i + 39, -10, 75, 3);
        }
      }
      this.attachMoneyScripts();
      if (this.boss) {
        this.newBossShip();
      }
      if (this.levelName) {
        this.scripts.push(new FadeoutBanner(this, this.levelName, 2000));
      }
      this.ships.forEach(function(ship) {
        this.addChild(ship);
      }.bind(this));
      this.scripts.forEach(function(script) {
        script.start();
        this.addChild(script);
      }.bind(this));
    }
    checkIfLevelComplete() {
      for (let i = 0;i < this.children.length; i++) {
        const child = this.children[i];
        if (child && child.position && !child.destroyed) {
          return false;
        }
      }
      return true;
    }
    newShip(startX, startY, endY, time) {
      const ship = new ArrowShip(this, this.difficultyMultiplier, this.alternateShip);
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
    }
    newBossShip() {
      const boss = new ArrowBoss(this, this.difficultyMultiplier);
      window.boss = boss;
      const gameWidth = this.game.width;
      const bossWidth = boss.sprite.width;
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
      this.scripts.push(new WatchForDeath(this, boss, function() {
        const p = boss.position;
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
    }
    attachMoneyScripts() {
      const divisor = this.difficultyMultiplier > 4 ? 2 : 3;
      const count = Math.floor(this.ships.length / divisor);
      const selectedShips = sample(this.ships, count);
      selectedShips.forEach(function(ship) {
        this.scripts.push(new WatchForDeath(this, ship, function() {
          this.addChild(new MoneyDrop(this, ship.position));
        }.bind(this)));
      }.bind(this));
    }
  }

  // src/levels/shop.ts
  class Shop extends GameObject {
    isShop = true;
    index = 1;
    headerDef = { message: "Ship Upgrades", position: { x: 50, y: 10 } };
    menuItems = {
      health: { message: "+1 Ship Health", position: { x: 90, y: 50 } },
      rate: { message: "10% faster Firing Rate", position: { x: 90, y: 65 } },
      damage: { message: "+1 Bullet Damage", position: { x: 90, y: 80 } },
      guns: { message: "Install wing guns", position: { x: 90, y: 95 } },
      leave: { message: "Leave Shop", position: { x: 60, y: 110 } }
    };
    menuSelectorPositions = [49, 64, 79, 94, 109];
    disabledColor = "#777";
    game;
    bank;
    player;
    input;
    titleText;
    selectorShip;
    selectedMenuItem;
    timeSinceSelected;
    selecting;
    isDoneShopping;
    constructor(parent, game) {
      super(parent);
      this.game = game;
      this.bank = game.bank;
      this.player = game.player;
      this.input = new EventedInput({
        onUp: this.onUp.bind(this),
        onDown: this.onDown.bind(this),
        onSelect: this.onSelect.bind(this)
      });
      this.reset();
    }
    reset() {
      super.reset();
      this.input.reset();
      this.isDoneShopping = false;
      this.selectedMenuItem = 0;
      this.createMenuText();
      this.setCosts();
      this.createSelectorShip();
      this.addChild(this.input);
    }
    start() {
      this.input.reset();
      this.isDoneShopping = false;
      this.setCosts();
    }
    checkIfLevelComplete() {
      return this.isDoneShopping;
    }
    update(dtime) {
      super.update(dtime);
      this.timeSinceSelected += dtime;
      if (this.selecting && this.timeSinceSelected > 595) {
        this.propagateSelection();
      }
    }
    createMenuText() {
      this.titleText = new TextDisplay(this, {
        font: "arcade",
        message: this.headerDef.message,
        position: this.headerDef.position,
        color: this.game.interfaceColor
      });
      this.addChild(this.titleText);
      Object.keys(this.menuItems).forEach(function(key) {
        const item = this.menuItems[key];
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
          message: "",
          position: { x: item.position.x - 30, y: item.position.y },
          color: this.game.interfaceColor,
          isPhysicalEntity: true
        });
        this.addChild(item.costText);
      }.bind(this));
    }
    setCosts() {
      const items = this.menuItems;
      const player = this.player;
      const bank = this.bank;
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
    }
    createSelectorShip() {
      this.selectorShip = new GameObject;
      this.selectorShip.sprite = arrowShipSprite();
      this.selectorShip.position = { x: 40, y: 0 };
      this.addChild(this.selectorShip);
      this.updateSelectorPosition();
    }
    updateSelectorPosition() {
      this.selectorShip.position.y = this.menuSelectorPositions[this.selectedMenuItem];
    }
    onUp() {
      if (!this.selecting && this.selectedMenuItem > 0) {
        this.selectedMenuItem--;
        this.updateSelectorPosition();
      }
    }
    onDown() {
      if (!this.selecting && this.selectedMenuItem < this.menuSelectorPositions.length - 1) {
        this.selectedMenuItem++;
        this.updateSelectorPosition();
      }
    }
    onSelect() {
      if (!this.selecting) {
        let selection;
        switch (this.selectedMenuItem) {
          case 0:
            selection = this.menuItems.health;
            break;
          case 1:
            selection = this.menuItems.rate;
            break;
          case 2:
            selection = this.menuItems.damage;
            break;
          case 3:
            selection = this.menuItems.guns;
            break;
          case 4:
            this.startGame();
            return;
          default:
            return;
        }
        if (this.bank.value >= selection.cost && selection.cost !== -1) {
          this.bank.removeMoney(selection.cost);
          this.startGame();
        }
      }
    }
    startGame() {
      this.selecting = true;
      this.timeSinceSelected = 0;
      const x1 = this.selectorShip.position.x + this.selectorShip.sprite.width;
      const y2 = this.selectorShip.position.y + Math.floor(this.selectorShip.sprite.height / 2);
      this.addChild(new Bullet(this, {
        team: 2,
        position: { x: x1, y: y2 },
        velocity: { x: 50, y: 0 }
      }));
    }
    propagateSelection() {
      switch (this.selectedMenuItem) {
        case 0:
          this.player.lifeUpgrades++;
          this.player.maxLife++;
          break;
        case 1:
          this.player.rateUpgrades++;
          this.player.FIRE_RATE = Math.ceil(this.player.FIRE_RATE * 0.9);
          break;
        case 2:
          this.player.damageUpgrades++;
          break;
        case 3:
          this.player.addWingGuns();
          break;
        case 4:
          this.isDoneShopping = true;
          break;
      }
      this.setCosts();
      this.selecting = false;
    }
  }

  // src/levels/level-manager.ts
  class LevelManager extends GameObject {
    game;
    width;
    height;
    player;
    levelNameCounter;
    difficultyMultiplier;
    running;
    complete;
    currentLevel = null;
    shop;
    levels;
    levelIndex;
    constructor(parent, game) {
      super(parent);
      this.game = game;
      this.width = game.width;
      this.height = game.height;
      this.player = game.player;
      this.reset();
    }
    reset() {
      super.reset();
      this.levelNameCounter = 0;
      this.difficultyMultiplier = 1;
      this.running = false;
      this.complete = false;
      this.currentLevel = null;
      this.shop = new Shop(this, this.game);
      this.loadLevels();
    }
    loadLevels() {
      this.levels = [
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 2),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 3),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 4),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, "boss"),
        this.shop,
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 2),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 3),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 4),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, "boss"),
        this.shop
      ];
      this.levelIndex = -1;
    }
    start() {
      this.running = true;
      this.loadNextLevel();
    }
    stop() {
      this.running = false;
      if (this.currentLevel) {
        this.removeChild(this.currentLevel);
      }
      this.currentLevel = null;
    }
    loadNextLevel() {
      if (this.levelIndex >= this.levels.length - 1) {
        this.difficultyMultiplier++;
        this.loadLevels();
      }
      this.levelIndex++;
      this.currentLevel = this.levels[this.levelIndex];
      if (this.currentLevel.isShop) {
        this.game.clearBullets();
        this.player.hideOffscreen();
      }
      if (this.currentLevel.levelName) {
        this.addChild(new FlyPlayerInFromBottom(this, this.game).start());
        this.player.refillHealth();
      }
      this.addChild(this.currentLevel);
      this.currentLevel.start();
    }
    update(dtime) {
      super.update(dtime);
      if (this.currentLevel && this.currentLevel.checkIfLevelComplete()) {
        if (this.currentLevel.isShop) {
          this.removeChild(this.currentLevel);
        } else {
          this.currentLevel.destroy();
        }
        this.loadNextLevel();
      }
    }
    levelName() {
      this.levelNameCounter++;
      return "LEVEL " + this.pad(this.levelNameCounter);
    }
    pad(val) {
      if (val < 10) {
        return "00" + val;
      }
      if (val < 100) {
        return "0" + val;
      }
    }
  }

  // src/sprites/player-ship.ts
  function playerShipSprite() {
    const w4 = "white";
    const n5 = null;
    return new Sprite([
      [n5, n5, n5, w4, n5, n5, n5],
      [n5, n5, n5, w4, n5, n5, n5],
      [n5, n5, w4, w4, w4, n5, n5],
      [n5, n5, w4, w4, w4, n5, n5],
      [n5, n5, w4, w4, w4, n5, n5],
      [n5, w4, w4, w4, w4, w4, n5],
      [w4, w4, w4, w4, w4, w4, w4],
      [n5, n5, w4, w4, w4, n5, n5],
      [n5, n5, n5, w4, n5, n5, n5]
    ], {
      guns: [
        { x: 3, y: 1 }
      ]
    });
  }

  // src/sprites/player-ship-wing-guns.ts
  function playerShipWingGunsSprite() {
    const w4 = "white";
    const n5 = null;
    return new Sprite([
      [n5, n5, n5, n5, w4, n5, n5, n5, n5],
      [n5, n5, n5, n5, w4, n5, n5, n5, n5],
      [n5, n5, n5, w4, w4, w4, n5, n5, n5],
      [n5, n5, n5, w4, w4, w4, n5, n5, n5],
      [w4, n5, n5, w4, w4, w4, n5, n5, w4],
      [w4, n5, w4, w4, w4, w4, w4, n5, w4],
      [w4, w4, w4, w4, w4, w4, w4, w4, w4],
      [n5, n5, n5, w4, w4, w4, n5, n5, n5],
      [n5, n5, n5, n5, w4, n5, n5, n5, n5]
    ], {
      guns: [
        { x: 0, y: 5 },
        { x: 4, y: 1 },
        { x: 8, y: 5 }
      ]
    });
  }

  // src/ships/player-controlled-ship.ts
  class PlayerControlledShip extends GameObject {
    type = "player";
    isPhysicalEntity = true;
    index = 5;
    explosion;
    sprite;
    position;
    velocity;
    damageUpgrades = 0;
    lifeUpgrades = 0;
    rateUpgrades = 0;
    wingGunsUnlocked = false;
    SPEED = 50;
    BULLET_SPEED = 100;
    FIRE_RATE = 500;
    preventInputControl = true;
    exploding = false;
    team = 0;
    damage = 5;
    timeSinceFired = 0;
    firing;
    constructor(parent) {
      super(parent);
      this.reset();
    }
    reset() {
      super.reset();
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
    }
    refillHealth() {
      this.life = this.maxLife;
    }
    addWingGuns() {
      this.wingGunsUnlocked = true;
      this.sprite = playerShipWingGunsSprite().rotateRight();
    }
    processInput(input) {
      super.processInput(input);
      if (this.preventInputControl || this.exploding || this.destroyed) {
        return;
      }
      this.velocity.x = input.movementVector.x * this.SPEED;
      this.velocity.y = input.movementVector.y * this.SPEED;
      this.firing = input.fire;
    }
    update(dtime) {
      super.update(dtime);
      this.timeSinceFired += dtime;
      if (this.firing && this.timeSinceFired > this.FIRE_RATE) {
        this.timeSinceFired = 0;
        this.fire();
      }
    }
    hideOffscreen() {
      this.preventInputControl = true;
      this.position.x = -100;
      this.velocity.x = 0;
      this.velocity.y = 0;
    }
    checkBoundaries() {
      if (this.preventInputControl) {
        return;
      }
      if (this.position.x < 0) {
        this.position.x = 0;
      }
      if (this.position.y < 0) {
        this.position.y = 0;
      }
      const parent = this.parent;
      if (parent && this.sprite) {
        if (this.position.x + this.sprite.width > parent.width) {
          this.position.x = parent.width - this.sprite.width;
        }
        if (this.position.y + this.sprite.height > parent.height) {
          this.position.y = parent.height - this.sprite.height;
        }
      }
    }
    fire() {
      this.sprite.meta.guns.forEach(function(gun, index) {
        this.triggerEvent("spawnBullet", {
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
    }
    applyDamage(damage, sourceEntity) {
      if (damage > 0) {
        this.triggerEvent("playerHit");
      }
      super.applyDamage(damage, sourceEntity);
    }
  }

  // src/models/phoenix.ts
  class Phoenix extends GameObject {
    FILL_COLOR = "#000031";
    interfaceColor = "#ffd";
    width;
    height;
    titleScreen;
    controlsScreen;
    gameOverScreen;
    player;
    inputInterpreter;
    pauseInputTracker;
    pausedText;
    comboGauge;
    lifeMeter;
    bank;
    levelManager;
    gameOver = false;
    paused = false;
    gameOverCallback;
    constructor(options) {
      super(null);
      this.width = options.width;
      this.height = options.height;
      this.titleScreen = new SlimTitleScreen(this);
      this.controlsScreen = new ControlsDescription(this);
      this.gameOverScreen = new GameOverScreen(this);
      this.player = new PlayerControlledShip(this);
      this.inputInterpreter = new InputInterpreter;
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
      this.children.filter(function(entity) {
        return entity.type === "bullet";
      }).forEach(function(bullet) {
        this.removeChild(bullet);
      }.bind(this));
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
      } else {
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
      } else {
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
      return !!(entity.isPhysicalEntity && !entity.exploding);
    }
    findBoxCollisions(entities) {
      const collisionPairs = [];
      for (let i = 0;i < entities.length - 1; i++) {
        const outer = entities[i];
        for (let j = i + 1;j < entities.length; j++) {
          const inner = entities[j];
          if ((outer.type === "pickup" || inner.type === "pickup") && !(outer.type === "player" || inner.type === "player")) {
            continue;
          }
          if (outer.team !== inner.team && boxCollision(outer, inner)) {
            collisionPairs.push([outer, inner]);
          }
        }
      }
      return collisionPairs;
    }
    checkPairsForCollision(pairs) {
      pairs.forEach(function(pair) {
        const a = pair[0];
        const b = pair[1];
        if (spriteCollision(a, b)) {
          a.applyDamage(b.damage, b);
          b.applyDamage(a.damage, a);
        }
      });
    }
    checkGameOver() {
      const gameResult = this.player.destroyed ? "loss" : this.levelManager.complete ? "win" : null;
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

  // src/helpers/run-loop.ts
  var fpsCounterDOM = null;
  function updateFPScounter(dtime) {
    if (!fpsCounterDOM) {
      fpsCounterDOM = document.createElement("div");
      fpsCounterDOM.classList.add("fps-counter");
      fpsCounterDOM.oldfps = 0;
      document.body.appendChild(fpsCounterDOM);
    }
    let fps = Math.floor(1000 / dtime * 10) / 10;
    if (Math.abs(fps - fpsCounterDOM.oldfps) > 0.2) {
      fpsCounterDOM.oldfps = fps;
      let fpsStr = fps + "";
      fpsStr += (fpsStr.length <= 2 ? ".0" : "") + " fps";
      fpsCounterDOM.innerHTML = fpsStr;
    }
  }
  function now() {
    return new Date().valueOf();
  }
  function fpsTracker() {
    const frameTimes = [];
    for (let i = 0;i < 100; i++) {
      frameTimes.push(20);
    }
    frameTimes.totalTime = 20 * 100;
    frameTimes.push = function(ftime) {
      const overflow = this.shift();
      this.totalTime += ftime - overflow;
      return Array.prototype.push.call(this, ftime);
    };
    frameTimes.average = function() {
      return this.totalTime / this.length;
    };
    return frameTimes;
  }

  class RunLoop {
    callback;
    fpsTracker;
    active;
    lastFrameTime;
    boundFrameHandler;
    constructor(callback) {
      this.callback = callback || function() {};
      this.fpsTracker = fpsTracker();
      this.active = false;
      this.lastFrameTime = now();
      this.boundFrameHandler = this.frameHandler.bind(this);
    }
    frameHandler() {
      if (!this.active)
        return;
      const currentTime = now();
      const dtime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      this.updateFPScounter(dtime);
      try {
        this.callback(dtime);
      } catch (e) {
        console.error("Error running frame: ", e);
      }
      window.requestAnimationFrame(this.boundFrameHandler);
    }
    start() {
      if (!this.active) {
        this.active = true;
        window.requestAnimationFrame(this.boundFrameHandler);
      }
    }
    stop() {
      this.active = false;
    }
    addCallback(callback) {
      this.callback = callback;
    }
    updateFPScounter(dtime) {
      this.fpsTracker.push(dtime);
      updateFPScounter(this.fpsTracker.average());
    }
  }

  // src/main.ts
  var gameDimensions = { width: 200, height: 150 };
  var gamepadInput = new GamepadInput;
  var keyboardInput = new KeyboardInput;
  var phoenix = new Phoenix(gameDimensions);
  var renderer = new CanvasRenderer(gameDimensions);
  var runLoop = new RunLoop;
  renderer.setFillColor(phoenix.FILL_COLOR);
  runLoop.addCallback(function(dtime) {
    phoenix.processInput([
      keyboardInput.getInputState(),
      gamepadInput.getInputState()
    ]);
    phoenix.update(dtime);
    const frame = renderer.newRenderFrame();
    frame.clear();
    phoenix.renderToFrame(frame);
    renderer.renderFrame(frame);
  });
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      phoenix.pause();
    }
  });
  window.addEventListener("blur", function() {
    phoenix.pause();
  });
  window.addEventListener("focus", function() {
    keyboardInput.clearState();
    gamepadInput.clearState();
  });
  runLoop.start();
  window.activeGame = phoenix;
})();
