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

  // src/rendering/gl/webgl.ts
  function maximumPixelSize(width, height) {
    const maxWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    const maxHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
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
  var VERTEX_SHADER_SOURCE = `
attribute vec2 aQuad;
attribute vec2 aInstancePos;
attribute vec3 aInstanceColor;

uniform vec2 uResolution;
uniform float uPixelSize;

varying vec3 vColor;

void main() {
    vec2 pixelPos = (aInstancePos + aQuad) * uPixelSize;
    vec2 clip = (pixelPos / uResolution) * 2.0 - 1.0;
    clip.y = -clip.y;
    gl_Position = vec4(clip, 0.0, 1.0);
    vColor = aInstanceColor;
}
`;
  var FRAGMENT_SHADER_SOURCE = `
precision mediump float;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`;
  var INSTANCE_FLOATS = 5;
  var INSTANCE_STRIDE_BYTES = INSTANCE_FLOATS * 4;
  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error("WebGL shader compile failed: " + info);
    }
    return shader;
  }
  function linkProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error("WebGL program link failed: " + info);
    }
    return program;
  }

  class WebGLRenderer {
    width = 80;
    height = 50;
    pixelSize = 1;
    fullWidth;
    fullHeight;
    nextFrame = 0;
    container;
    canvas;
    frames;
    gl;
    isWebGL2 = false;
    instancedExt = null;
    program;
    quadBuffer;
    instanceBuffer;
    instanceData;
    aQuadLoc = 0;
    aInstancePosLoc = 0;
    aInstanceColorLoc = 0;
    uResolutionLoc;
    uPixelSizeLoc;
    colorCache = new Map;
    colorParseCanvas = null;
    colorParseCtx = null;
    constructor(options) {
      options = options || {};
      this.width = options.width || this.width;
      this.height = options.height || this.height;
      this.pixelSize = maximumPixelSize(this.width, this.height);
      this.container = options.container || document.body;
      this.canvas = createCanvasEl(this);
      this.container.appendChild(this.canvas);
      this.initGL();
      this.frames = [
        new Frame(this),
        new Frame(this)
      ];
    }
    initGL() {
      const gl2 = this.canvas.getContext("webgl2");
      if (gl2) {
        this.gl = gl2;
        this.isWebGL2 = true;
      } else {
        const gl1 = this.canvas.getContext("webgl", { alpha: false });
        if (!gl1) {
          throw new Error("WebGL is not supported in this browser");
        }
        this.gl = gl1;
        this.instancedExt = gl1.getExtension("ANGLE_instanced_arrays");
        if (!this.instancedExt) {
          throw new Error("ANGLE_instanced_arrays extension is required but not supported");
        }
      }
      const gl = this.gl;
      gl.viewport(0, 0, this.fullWidth, this.fullHeight);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
      this.program = linkProgram(gl, vs, fs);
      gl.useProgram(this.program);
      this.aQuadLoc = gl.getAttribLocation(this.program, "aQuad");
      this.aInstancePosLoc = gl.getAttribLocation(this.program, "aInstancePos");
      this.aInstanceColorLoc = gl.getAttribLocation(this.program, "aInstanceColor");
      this.uResolutionLoc = gl.getUniformLocation(this.program, "uResolution");
      this.uPixelSizeLoc = gl.getUniformLocation(this.program, "uPixelSize");
      gl.uniform2f(this.uResolutionLoc, this.fullWidth, this.fullHeight);
      gl.uniform1f(this.uPixelSizeLoc, this.pixelSize);
      this.quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        1
      ]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(this.aQuadLoc);
      gl.vertexAttribPointer(this.aQuadLoc, 2, gl.FLOAT, false, 0, 0);
      const maxInstances = this.width * this.height;
      this.instanceData = new Float32Array(maxInstances * INSTANCE_FLOATS);
      this.instanceBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.instanceData.byteLength, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(this.aInstancePosLoc);
      gl.vertexAttribPointer(this.aInstancePosLoc, 2, gl.FLOAT, false, INSTANCE_STRIDE_BYTES, 0);
      this.setAttribDivisor(this.aInstancePosLoc, 1);
      gl.enableVertexAttribArray(this.aInstanceColorLoc);
      gl.vertexAttribPointer(this.aInstanceColorLoc, 3, gl.FLOAT, false, INSTANCE_STRIDE_BYTES, 2 * 4);
      this.setAttribDivisor(this.aInstanceColorLoc, 1);
    }
    setAttribDivisor(loc, divisor) {
      if (this.isWebGL2) {
        this.gl.vertexAttribDivisor(loc, divisor);
      } else if (this.instancedExt) {
        this.instancedExt.vertexAttribDivisorANGLE(loc, divisor);
      }
    }
    drawInstanced(count) {
      const gl = this.gl;
      if (this.isWebGL2) {
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
      } else if (this.instancedExt) {
        this.instancedExt.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, count);
      }
    }
    parseColor(color) {
      const cached = this.colorCache.get(color);
      if (cached) {
        return cached;
      }
      if (!this.colorParseCanvas) {
        this.colorParseCanvas = document.createElement("canvas");
        this.colorParseCanvas.width = 1;
        this.colorParseCanvas.height = 1;
        this.colorParseCtx = this.colorParseCanvas.getContext("2d");
      }
      const ctx = this.colorParseCtx;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color || "#000000";
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      const rgb = [data[0] / 255, data[1] / 255, data[2] / 255];
      this.colorCache.set(color, rgb);
      return rgb;
    }
    newRenderFrame() {
      return this.frames[this.nextFrame];
    }
    renderFrame(_) {
      const frame = this.frames[this.nextFrame];
      const fillColor = frame.fillColor || "#000000";
      const fillRGB = this.parseColor(fillColor);
      const gl = this.gl;
      gl.clearColor(fillRGB[0], fillRGB[1], fillRGB[2], 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const data = this.instanceData;
      const width = this.width;
      const height = this.height;
      let count = 0;
      for (let x = 0;x < width; x++) {
        const col = frame.cells[x];
        for (let y = 0;y < height; y++) {
          const cell = col[y];
          if (cell.color !== fillColor) {
            const rgb = this.parseColor(cell.color);
            const offset = count * INSTANCE_FLOATS;
            data[offset] = x;
            data[offset + 1] = y;
            data[offset + 2] = rgb[0];
            data[offset + 3] = rgb[1];
            data[offset + 4] = rgb[2];
            count++;
          }
        }
      }
      if (count > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * INSTANCE_FLOATS));
        this.drawInstanced(count);
      }
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
      B: false,
      ENTER: false
    };
  }
  var KEYS = {
    87: "W",
    65: "A",
    83: "S",
    68: "D",
    32: "SPACE",
    66: "B",
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
      if (this.children) {
        for (const child of this.children.slice()) {
          if (!child.destroyed && typeof child.update === "function") {
            child.update(dtime);
          }
        }
      }
      if (this.sprite) {
        this.sprite.update(dtime);
      }
      if (this.velocity && this.acceleration) {
        this.velocity.x += this.acceleration.x * dtime / 1000;
        this.velocity.y += this.acceleration.y * dtime / 1000;
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
      if (child && this.children) {
        this.children.push(child);
      }
    }
    removeChild(child) {
      if (child && this.children) {
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
      return Math.round(n);
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
          newCells[height - y - 1][x] = {
            x: height - y - 1,
            y: x,
            color: oldCells[x][y].color
          };
        }
      }
      this.width = height;
      this.height = width;
      this.cells = newCells;
      return this;
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
    "[": new Sprite([
      [w2, w2, w2, w2, w2],
      [w2, n3, n3, n3, w2],
      [w2, n3, n3, n3, w2]
    ]),
    "]": new Sprite([
      [w2, n3, n3, n3, w2],
      [w2, n3, n3, n3, w2],
      [w2, w2, w2, w2, w2]
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
  var n4 = null;
  var w3 = "white";
  var TIP = "#ffffff";
  var HIGHLIGHT = "#fff0e0";
  var BODY = "#ffd0a8";
  var WING = "#e87848";
  var EDGE = "#a84028";
  function shadeGlyph(mask) {
    const width = mask.length;
    const height = mask[0].length;
    const out = mask.map((col) => col.slice());
    for (let x = 0;x < width; x++) {
      for (let y2 = 0;y2 < height; y2++) {
        if (!mask[x][y2])
          continue;
        const isEdge = !(mask[x - 1]?.[y2] && mask[x + 1]?.[y2] && mask[x][y2 - 1] && mask[x][y2 + 1]);
        const t = height <= 1 ? 0 : y2 / (height - 1);
        if (isEdge) {
          out[x][y2] = t > 0.65 ? EDGE : WING;
        } else if (t < 0.3) {
          out[x][y2] = TIP;
        } else if (t < 0.6) {
          out[x][y2] = HIGHLIGHT;
        } else {
          out[x][y2] = BODY;
        }
      }
    }
    return out;
  }
  function letter(mask) {
    return new Sprite(shadeGlyph(mask)).invertY().rotateRight();
  }
  var phoenix_default = {
    meta: {
      width: 15,
      height: 15,
      lineHeight: 16,
      letterSpacing: -1
    },
    P: letter([
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
    ]),
    H: letter([
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
    ]),
    O: letter([
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
    ]),
    E: letter([
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
    ]),
    N: letter([
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
    ]),
    I: letter([
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
    ]),
    X: letter([
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
    ])
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
    preserveSpriteColors;
    message;
    width;
    height;
    constructor(parent, options) {
      super(parent);
      this.rawMessage = options.message || " ";
      this.font = fonts[options.font || "arcade-small"];
      this.color = options.color || "white";
      this.preserveSpriteColors = !!options.preserveSpriteColors;
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
      if (!this.preserveSpriteColors) {
        this.updateColor(this.color);
      }
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
      this.resetForRun();
    }
    resetForRun() {
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
      this.valueDisplay.changeMessage(`$${this.value.toFixed(2)}`);
      const width = this.valueDisplay.width;
      if (width && this.position && this.valueDisplay.position) {
        this.position.x = this.valueDisplay.position.x = this.anchorPoint.x - width;
      }
    }
  }

  // src/balance/bombs.ts
  var bombs = {
    damage: 50,
    blastRadius: 15,
    initialSpeed: 40,
    acceleration: 120
  };

  // src/sprites/bomb.ts
  function bombSprite() {
    return new Sprite([
      [null, "orange", null],
      ["orange", "yellow", "orange"],
      [null, "orange", null]
    ]);
  }

  // src/sprites/animations/bomb-explosion.ts
  function bombExplosion() {
    const sprites = [];
    const center = 20;
    for (let ring = 0;ring < 5; ring++) {
      const count = 4 + ring * 2;
      for (let i = 0;i < count; i++) {
        const angle = i / count * Math.PI * 2 + ring * 0.2;
        const dist = ring * 4 + integer(0, 2);
        sprites.push({
          x: center + Math.round(Math.cos(angle) * dist),
          y: center + Math.round(Math.sin(angle) * dist),
          sprite: smallExplosion()
        });
      }
    }
    for (let i = 0;i < 6; i++) {
      sprites.push({
        x: center + integer(-3, 3),
        y: center + integer(-3, 3),
        sprite: smallExplosion()
      });
    }
    return new SpriteGroup(sprites);
  }

  // src/components/bomb.ts
  class Bomb extends GameObject {
    type = "bomb";
    isPhysicalEntity = true;
    index = 5;
    team;
    exploding = false;
    constructor(parent, options) {
      super(parent);
      const opts = options || {};
      this.team = opts.team ?? 0;
      this.position = opts.position ? { x: opts.position.x, y: opts.position.y } : { x: 0, y: 0 };
      this.velocity = opts.velocity ? { x: opts.velocity.x, y: opts.velocity.y } : { x: 0, y: -bombs.initialSpeed };
      this.acceleration = opts.acceleration ? { x: opts.acceleration.x, y: opts.acceleration.y } : { x: 0, y: -bombs.acceleration };
      this.damage = 0;
      this.sprite = bombSprite();
      this.explosion = bombExplosion;
    }
    get blastCenter() {
      return {
        x: (this.position?.x || 0) + (this.sprite?.width || 0) / 2,
        y: (this.position?.y || 0) + (this.sprite?.height || 0) / 2
      };
    }
    checkBoundaries() {
      if (!this.position || this.exploding) {
        return;
      }
      if (this.position.y + bombs.blastRadius < 0) {
        this.triggerEvent("bombCleared", this);
        this.destroy();
      }
    }
    detonate() {
      if (this.exploding || this.destroyed) {
        return;
      }
      this.exploding = true;
      this.isPhysicalEntity = false;
      const center = this.blastCenter;
      this.triggerEvent("applyBombBlast", {
        center,
        radius: bombs.blastRadius,
        damage: bombs.damage,
        source: this
      });
      if (this.position && this.sprite) {
        this.position.x = center.x - 20;
        this.position.y = center.y - 20;
      }
      this.sprite = bombExplosion();
      if (this.velocity) {
        this.velocity.x = 0;
        this.velocity.y = 0;
      }
      if (this.acceleration) {
        this.acceleration.x = 0;
        this.acceleration.y = 0;
      }
      this.triggerEvent("bombCleared", this);
    }
    applyDamage() {}
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
  function circleIntersectsBox(cx, cy, radius, entity) {
    const left = entity.position.x;
    const right = entity.position.x + entity.sprite.width;
    const top = entity.position.y;
    const bottom = entity.position.y + entity.sprite.height;
    const nearestX = Math.max(left, Math.min(cx, right));
    const nearestY = Math.max(top, Math.min(cy, bottom));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy <= radius * radius;
  }
  function spriteCollision(entityA, entityB) {
    const collisionFrame = new CollisionDetectionFrame;
    entityA.renderToFrame(collisionFrame);
    entityB.renderToFrame(collisionFrame);
    return collisionFrame.collisionDetected;
  }

  // src/balance/player-ships.ts
  var playerShipDefs = [
    {
      id: "starter",
      unlockCost: null,
      maxHealth: 3,
      maxArmor: 2,
      maxBombCapacity: 3,
      maxShipSpeed: 5,
      maxFireSpeed: 5,
      maxDamage: 3,
      maxCombo: 4
    },
    {
      id: "double",
      unlockCost: 500,
      maxHealth: 4,
      maxArmor: 3,
      maxBombCapacity: 3,
      maxShipSpeed: 4,
      maxFireSpeed: 4,
      maxDamage: 4,
      maxCombo: 6
    },
    {
      id: "triple",
      unlockCost: 1000,
      maxHealth: 5,
      maxArmor: 5,
      maxBombCapacity: 3,
      maxShipSpeed: 3,
      maxFireSpeed: 3,
      maxDamage: 5,
      maxCombo: 8
    },
    {
      id: "radial",
      unlockCost: 1500,
      maxHealth: 6,
      maxArmor: 8,
      maxBombCapacity: 3,
      maxShipSpeed: 2,
      maxFireSpeed: 2,
      maxDamage: 6,
      maxCombo: 10
    }
  ];
  var DEFAULT_PLAYER_SHIP_ID = "starter";
  function playerShipDef(id) {
    const def = playerShipDefs.find((ship) => ship.id === id);
    if (!def) {
      throw new Error(`Unknown player ship id: ${id}`);
    }
    return def;
  }

  // src/ships/player-ship-profile.ts
  function createShipProfile(id, unlocked) {
    return {
      id,
      unlocked,
      comboSegments: 0,
      comboUpgrades: 0,
      maxHealthRanks: 0,
      armorRanks: 0,
      bombCapacityRanks: 0,
      shipSpeedRanks: 0,
      fireSpeedRanks: 0,
      damageRanks: 0
    };
  }
  function createStarterHangar() {
    const hangar = {};
    for (const def of playerShipDefs) {
      hangar[def.id] = createShipProfile(def.id, def.unlockCost === null);
    }
    return hangar;
  }
  function defaultActiveShipId() {
    return DEFAULT_PLAYER_SHIP_ID;
  }

  // src/helpers/game-save.ts
  var SAVE_VERSION = 1;
  var SAVE_STORAGE_KEY = "phoenix-arcade-shooter-save-v1";
  var RANK_KEYS = [
    "comboSegments",
    "comboUpgrades",
    "maxHealthRanks",
    "armorRanks",
    "bombCapacityRanks",
    "shipSpeedRanks",
    "fireSpeedRanks",
    "damageRanks"
  ];
  function isPlayerShipId(id) {
    return playerShipDefs.some((def) => def.id === id);
  }
  function isNonNegativeInt(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
  }
  function cloneProfile(profile) {
    return {
      id: profile.id,
      unlocked: profile.unlocked,
      comboSegments: profile.comboSegments,
      comboUpgrades: profile.comboUpgrades,
      maxHealthRanks: profile.maxHealthRanks,
      armorRanks: profile.armorRanks,
      bombCapacityRanks: profile.bombCapacityRanks,
      shipSpeedRanks: profile.shipSpeedRanks,
      fireSpeedRanks: profile.fireSpeedRanks,
      damageRanks: profile.damageRanks
    };
  }
  function cloneHangar(hangar) {
    const clone = {};
    for (const def of playerShipDefs) {
      const profile = hangar[def.id];
      clone[def.id] = profile ? cloneProfile(profile) : createShipProfile(def.id, def.unlockCost === null);
    }
    return clone;
  }
  function mergeHangarWithDefs(saved) {
    return cloneHangar(saved);
  }
  function validateProfile(id, raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const profile = raw;
    if (typeof profile.unlocked !== "boolean") {
      return null;
    }
    for (const key of RANK_KEYS) {
      if (key === "damageRanks" && profile[key] === undefined) {
        continue;
      }
      if (!isNonNegativeInt(profile[key])) {
        return null;
      }
    }
    return {
      id,
      unlocked: profile.unlocked,
      comboSegments: profile.comboSegments,
      comboUpgrades: profile.comboUpgrades,
      maxHealthRanks: profile.maxHealthRanks,
      armorRanks: profile.armorRanks,
      bombCapacityRanks: profile.bombCapacityRanks,
      shipSpeedRanks: profile.shipSpeedRanks,
      fireSpeedRanks: profile.fireSpeedRanks,
      damageRanks: isNonNegativeInt(profile.damageRanks) ? profile.damageRanks : 0
    };
  }
  function validateSave(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const data = raw;
    if (data.version !== SAVE_VERSION) {
      return null;
    }
    if (!isNonNegativeInt(data.runsCompleted)) {
      return null;
    }
    if (!data.shipHangar || typeof data.shipHangar !== "object") {
      return null;
    }
    const hangarRaw = data.shipHangar;
    const hangar = {};
    for (const def of playerShipDefs) {
      const validated = hangarRaw[def.id] ? validateProfile(def.id, hangarRaw[def.id]) : null;
      hangar[def.id] = validated || createShipProfile(def.id, def.unlockCost === null);
      if (hangarRaw[def.id] && !validated) {
        return null;
      }
    }
    for (const key of Object.keys(hangarRaw)) {
      if (!isPlayerShipId(key)) {
        continue;
      }
    }
    return {
      version: SAVE_VERSION,
      runsCompleted: data.runsCompleted,
      shipHangar: hangar
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return validateSave(JSON.parse(raw));
    } catch {
      return null;
    }
  }
  function writeSave(data) {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }
  function clearSave() {
    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch {}
  }
  function hangarHasMetaProgress(hangar) {
    for (const def of playerShipDefs) {
      const profile = hangar[def.id];
      if (!profile) {
        continue;
      }
      if (def.unlockCost !== null && profile.unlocked) {
        return true;
      }
      if (profile.maxHealthRanks > 0 || profile.armorRanks > 0 || profile.bombCapacityRanks > 0 || profile.shipSpeedRanks > 0 || profile.fireSpeedRanks > 0 || profile.damageRanks > 0 || profile.comboSegments > 0 || profile.comboUpgrades > 0) {
        return true;
      }
    }
    return false;
  }
  function captureSave(host) {
    return {
      version: SAVE_VERSION,
      runsCompleted: host.runsCompleted,
      shipHangar: cloneHangar(host.player.shipHangar)
    };
  }
  function applySave(host, data) {
    host.runsCompleted = data.runsCompleted;
    host.player.shipHangar = mergeHangarWithDefs(data.shipHangar);
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

  // src/balance/shop.ts
  var MAX_COMBO_UPGRADES = 10;
  var COMBO_UPGRADE_COSTS = [
    25,
    50,
    100,
    200,
    400,
    1000,
    2000,
    3500,
    6000,
    1e4
  ];
  var shopTabs = [
    { id: "run", kind: "text", label: "Supplies" },
    ...playerShipDefs.map((ship) => ({
      id: ship.id,
      kind: "ship",
      shipId: ship.id
    }))
  ];
  var runShopUpgrades = [
    {
      id: "fullHeal",
      tab: "run",
      permanent: false,
      label: "Full Heal",
      maxRanks: null,
      cost: { kind: "linear", base: 25, perRank: 10 }
    },
    {
      id: "health",
      tab: "run",
      permanent: false,
      label: "+1 Ship Health",
      maxRanks: null,
      cost: { kind: "linear", base: 5, perRank: 5 }
    },
    {
      id: "energyShield",
      tab: "run",
      permanent: false,
      label: "+1 Energy Shield",
      maxRanks: null,
      cost: { kind: "linear", base: 15, perRank: 10 }
    },
    {
      id: "bomb",
      tab: "run",
      permanent: false,
      label: "+1 Bomb",
      maxRanks: null,
      cost: { kind: "linear", base: 25, perRank: 15 }
    }
  ];
  var shipShopUpgradeTemplates = [
    {
      id: "maxHealth",
      permanent: true,
      label: "+5 Health",
      cost: { kind: "linear", base: 100, perRank: 50 },
      maxRanksForShip: (shipId) => playerShipDef(shipId).maxHealth
    },
    {
      id: "armor",
      permanent: true,
      label: "+1 Armor",
      cost: { kind: "linear", base: 75, perRank: 75 },
      maxRanksForShip: (shipId) => playerShipDef(shipId).maxArmor
    },
    {
      id: "bombCapacity",
      permanent: true,
      label: "+1 Bomb Capacity",
      cost: { kind: "linear", base: 50, perRank: 100 },
      maxRanksForShip: (shipId) => playerShipDef(shipId).maxBombCapacity
    },
    {
      id: "shipSpeed",
      permanent: true,
      label: "+10% Ship Speed",
      cost: { kind: "linear", base: 100, perRank: 100 },
      maxRanksForShip: (shipId) => playerShipDef(shipId).maxShipSpeed
    },
    {
      id: "fireSpeed",
      permanent: true,
      label: "10% Fire Speed",
      cost: { kind: "linear", base: 100, perRank: 100 },
      maxRanksForShip: (shipId) => playerShipDef(shipId).maxFireSpeed
    },
    {
      id: "damage",
      permanent: true,
      label: "+1 Bullet Damage",
      cost: { kind: "linear", base: 100, perRank: 100 },
      maxRanksForShip: (shipId) => playerShipDef(shipId).maxDamage
    },
    {
      id: "combo",
      permanent: true,
      label: "Extend Combo",
      cost: { kind: "schedule", costs: [...COMBO_UPGRADE_COSTS] },
      maxRanksForShip: (shipId) => playerShipDef(shipId).maxCombo
    }
  ];
  var shipUnlockUpgrades = playerShipDefs.filter((ship) => ship.unlockCost !== null).map((ship) => ({
    id: "unlock",
    tab: ship.id,
    permanent: true,
    label: "Unlock",
    maxRanks: 1,
    cost: { kind: "fixed", amount: ship.unlockCost }
  }));
  var shopUpgrades = [
    ...runShopUpgrades,
    ...shipUnlockUpgrades
  ];
  function nextUpgradeCost(def, ownedRank) {
    if (def.maxRanks !== null && ownedRank >= def.maxRanks) {
      return null;
    }
    switch (def.cost.kind) {
      case "linear":
        return def.cost.base + ownedRank * def.cost.perRank;
      case "tierLinear":
        return (ownedRank + 1) * def.cost.base;
      case "schedule": {
        if (ownedRank >= def.cost.costs.length) {
          return null;
        }
        return def.cost.costs[ownedRank];
      }
      case "fixed":
        return def.cost.amount;
    }
  }
  function shipUpgradesFor(shipId) {
    return shipShopUpgradeTemplates.map((template) => ({
      id: template.id,
      tab: shipId,
      permanent: template.permanent,
      label: template.label,
      cost: template.cost,
      maxRanks: template.maxRanksForShip(shipId)
    }));
  }
  function upgradesForTab(tab, isShipUnlocked) {
    if (tab === "run") {
      return [...runShopUpgrades];
    }
    const shipId = tab;
    const unlocked = isShipUnlocked(shipId);
    if (!unlocked) {
      return shipUnlockUpgrades.filter((upgrade) => upgrade.tab === tab);
    }
    return shipUpgradesFor(shipId);
  }

  // src/components/combo-gauge.ts
  var MAX_COMBO_SEGMENTS = MAX_COMBO_UPGRADES;
  var MAX_COMBO_MULTIPLIER = MAX_COMBO_SEGMENTS + 1;
  var COMBO_SEGMENT_HEIGHT = 12;
  var MAX_COMBO_FILL_HEIGHT = MAX_COMBO_SEGMENTS * COMBO_SEGMENT_HEIGHT;
  var COMBO_FILL_WIDTH = 4;
  function buildFrameSprite(segmentCount, borderColor) {
    const fillHeight = segmentCount * COMBO_SEGMENT_HEIGHT;
    const dividerCount = segmentCount - 1;
    const frameWidth = COMBO_FILL_WIDTH + 2;
    const frameHeight = fillHeight + dividerCount + 2;
    const pixels = [];
    for (let x = 0;x < frameWidth; x++) {
      pixels[x] = [];
      for (let y2 = 0;y2 < frameHeight; y2++) {
        pixels[x][y2] = null;
      }
    }
    const left = 0;
    const right = frameWidth - 1;
    const barStart = 2;
    const barEnd = frameWidth - 3;
    function drawHorizontalBar(y2) {
      for (let x = barStart;x <= barEnd; x++) {
        pixels[x][y2] = borderColor;
      }
    }
    for (let y2 = 1;y2 < frameHeight - 1; y2++) {
      pixels[left][y2] = borderColor;
      pixels[right][y2] = borderColor;
    }
    drawHorizontalBar(0);
    drawHorizontalBar(frameHeight - 1);
    for (let seg = 1;seg < segmentCount; seg++) {
      drawHorizontalBar(seg * (COMBO_SEGMENT_HEIGHT + 1));
    }
    pixels[1][1] = borderColor;
    pixels[1][0] = borderColor;
    pixels[right - 1][1] = borderColor;
    pixels[right - 1][0] = borderColor;
    pixels[1][frameHeight - 2] = borderColor;
    pixels[1][frameHeight - 1] = borderColor;
    pixels[right - 1][frameHeight - 2] = borderColor;
    pixels[right - 1][frameHeight - 1] = borderColor;
    return new Sprite(pixels);
  }

  class ComboGauge extends GameObject {
    index = 1;
    color;
    anchorBottom;
    player;
    multiplierDisplay;
    scoreDisplay;
    segmentCount = 0;
    comboPoints = 0;
    pointTotal = 0;
    pointMultiplier = 1;
    fillGaugeSprite;
    constructor(parent, options) {
      super(parent);
      this.position = options.position;
      this.color = options.color || "#ffffff";
      this.anchorBottom = options.anchorBottom ?? options.position.y;
      this.player = options.player;
      this.multiplierDisplay = new TextDisplay(this, {
        font: "arcade-small",
        color: this.color,
        index: 1,
        position: { x: this.position.x, y: this.position.y }
      });
      this.scoreDisplay = new TextDisplay(this, {
        font: "arcade-small",
        color: this.color,
        index: 1,
        position: { x: this.position.x, y: this.position.y }
      });
      this.reset();
    }
    reset() {
      super.reset();
      this.comboPoints = 0;
      this.pointTotal = 0;
      this.syncFromPlayer();
      this.updateMultiplier();
      this.updateGaugeFill();
      this.updateScore();
      this.addChild(this.scoreDisplay);
      this.updateComboVisibility();
    }
    syncFromPlayer() {
      if (this.player) {
        this.segmentCount = this.player.comboSegments;
      }
      if (this.comboActive()) {
        this.sprite = buildFrameSprite(this.segmentCount, this.color);
        const maxPoints = this.activeFillHeight();
        if (this.comboPoints > maxPoints) {
          this.comboPoints = maxPoints;
        }
      } else {
        this.sprite = undefined;
        this.fillGaugeSprite = undefined;
        this.comboPoints = 0;
      }
      this.updateLayout();
      this.updateMultiplier();
      this.updateGaugeFill();
      this.updateComboVisibility();
    }
    renderToFrame(frame) {
      if (this.comboActive() && this.fillGaugeSprite && this.position) {
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
    getMultiplier() {
      return this.pointMultiplier;
    }
    bumpCombo() {
      if (!this.comboActive()) {
        return;
      }
      const maxPoints = this.activeFillHeight();
      if (this.comboPoints < maxPoints) {
        this.comboPoints++;
      }
      this.updateMultiplier();
      this.updateGaugeFill();
    }
    clearCombo() {
      if (!this.comboActive()) {
        return;
      }
      this.comboPoints = 0;
      this.updateMultiplier();
      this.updateGaugeFill();
    }
    comboActive() {
      return this.segmentCount > 0;
    }
    updateComboVisibility() {
      if (this.comboActive()) {
        if (!this.children.includes(this.multiplierDisplay)) {
          this.addChild(this.multiplierDisplay);
        }
      } else {
        this.removeChild(this.multiplierDisplay);
      }
    }
    activeFillHeight() {
      return this.segmentCount * COMBO_SEGMENT_HEIGHT;
    }
    updateLayout() {
      if (!this.position) {
        return;
      }
      if (this.comboActive() && this.sprite) {
        this.position.y = this.anchorBottom - this.sprite.height;
        this.multiplierDisplay.position = {
          x: this.position.x + 7,
          y: this.position.y + this.sprite.height - 5
        };
      }
      this.scoreDisplay.position = {
        x: this.position.x,
        y: this.anchorBottom + 1
      };
      this.repositionDisplays();
    }
    repositionDisplays() {
      this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
      if (this.comboActive()) {
        this.multiplierDisplay.changeMessage(this.pointMultiplier + "x");
      }
    }
    updateScore() {
      this.scoreDisplay.changeMessage(padScoreDisplay(this.pointTotal));
    }
    updateMultiplier() {
      if (!this.comboActive()) {
        this.pointMultiplier = 1;
        return;
      }
      const filledSegments = Math.floor(this.comboPoints / COMBO_SEGMENT_HEIGHT);
      this.pointMultiplier = Math.min(this.segmentCount + 1, 1 + filledSegments, MAX_COMBO_MULTIPLIER);
      this.multiplierDisplay.changeMessage(this.pointMultiplier + "x");
    }
    innerFillHeight() {
      return this.segmentCount * COMBO_SEGMENT_HEIGHT + (this.segmentCount - 1);
    }
    isDividerRow(frameRow) {
      for (let seg = 1;seg < this.segmentCount; seg++) {
        if (frameRow === seg * (COMBO_SEGMENT_HEIGHT + 1)) {
          return true;
        }
      }
      return false;
    }
    updateGaugeFill() {
      if (!this.comboActive()) {
        this.fillGaugeSprite = undefined;
        return;
      }
      const innerHeight = this.innerFillHeight();
      const pixels = new Array(innerHeight).fill(null);
      let filled = 0;
      for (let innerY = innerHeight - 1;innerY >= 0; innerY--) {
        const frameRow = innerY + 1;
        if (this.isDividerRow(frameRow)) {
          continue;
        }
        if (filled < this.comboPoints) {
          pixels[innerY] = colorAtPercent(GreenToRed, 1 - filled / MAX_COMBO_FILL_HEIGHT);
          filled++;
        }
      }
      for (let innerY = 0;innerY < innerHeight; innerY++) {
        const frameRow = innerY + 1;
        if (!this.isDividerRow(frameRow)) {
          continue;
        }
        if (pixels[innerY + 1] != null) {
          pixels[innerY] = pixels[innerY + 1];
        } else if (innerY > 0 && pixels[innerY - 1] != null) {
          pixels[innerY] = pixels[innerY - 1];
        }
      }
      const column = pixels;
      this.fillGaugeSprite = new Sprite([
        column,
        column,
        column,
        column
      ]);
    }
  }

  // src/models/evented-input.ts
  class EventedInput {
    onUp;
    onDown;
    onLeft;
    onRight;
    onFire;
    onStart;
    onSelect;
    upReleased = false;
    downReleased = false;
    leftReleased = false;
    rightReleased = false;
    fireReleased = false;
    startReleased = false;
    constructor(options) {
      this.onUp = options.onUp || function() {};
      this.onDown = options.onDown || function() {};
      this.onLeft = options.onLeft || function() {};
      this.onRight = options.onRight || function() {};
      this.onFire = options.onFire || function() {};
      this.onStart = options.onStart || function() {};
      this.onSelect = options.onSelect || function() {};
      this.reset();
    }
    reset() {
      this.upReleased = false;
      this.downReleased = false;
      this.leftReleased = false;
      this.rightReleased = false;
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
      if (input.movementVector.x < 0.6) {
        this.rightReleased = true;
      }
      if (input.movementVector.x > -0.6) {
        this.leftReleased = true;
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
      if (input.movementVector.x >= 0.6 && this.rightReleased) {
        this.rightReleased = false;
        this.onRight();
      }
      if (input.movementVector.x <= -0.6 && this.leftReleased) {
        this.leftReleased = false;
        this.onLeft();
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
  var SELECTOR_LEFT_X = 65;
  var SELECTOR_RIGHT_X = 125;
  var START_Y = 80;
  var RESET_Y = 95;

  class SlimTitleScreen extends GameObject {
    selectedMenuItem = 0;
    timeSinceSelected = 0;
    selecting = false;
    resetConfirmPending = false;
    selectorShip;
    selectorRight;
    menuItems = [];
    constructor(parent) {
      super(parent);
      this.reset(0, false);
    }
    reset(runsCompleted = 0, showResetSave = false) {
      super.reset();
      this.selectedMenuItem = 0;
      this.timeSinceSelected = 0;
      this.selecting = false;
      this.resetConfirmPending = false;
      this.menuItems = [];
      this.addChrome(runsCompleted);
      this.buildMenu(showResetSave);
      this.createShipSelectors();
      this.updateSelectorPosition();
      this.addChild(new EventedInput({
        onUp: this.onUp.bind(this),
        onDown: this.onDown.bind(this),
        onSelect: this.onSelect.bind(this)
      }));
    }
    addChrome(runsCompleted) {
      this.addChild(new TextDisplay(this, {
        font: "phoenix",
        message: "PHOENIX",
        position: { x: 54, y: 30 },
        preserveSpriteColors: true
      }));
      if (runsCompleted > 0) {
        this.addChild(new TextDisplay(this, {
          font: "arcade-small",
          message: "Runs completed: " + runsCompleted,
          position: { x: 125, y: 140 }
        }));
      }
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
    buildMenu(showResetSave) {
      this.menuItems = [
        { id: "start", message: "Start", position: { x: 90, y: START_Y } }
      ];
      if (showResetSave) {
        this.menuItems.push({
          id: "reset",
          message: "Reset Save",
          position: { x: 80, y: RESET_Y }
        });
      }
      this.menuItems.forEach((item) => {
        item.label = new TextDisplay(this, {
          font: "arcade-small",
          message: item.message,
          position: { ...item.position },
          isPhysicalEntity: true
        });
        this.addChild(item.label);
      });
    }
    createShipSelectors() {
      this.selectorShip = new GameObject;
      this.selectorRight = new GameObject;
      this.selectorShip.sprite = arrowShipSprite();
      this.selectorRight.sprite = arrowShipSprite().invertX();
      this.selectorShip.position = { x: SELECTOR_LEFT_X, y: START_Y };
      this.selectorRight.position = { x: SELECTOR_RIGHT_X, y: START_Y };
      this.addChild(this.selectorShip);
      this.addChild(this.selectorRight);
    }
    updateSelectorPosition() {
      const item = this.menuItems[this.selectedMenuItem];
      if (!item) {
        return;
      }
      this.selectorShip.position.x = SELECTOR_LEFT_X;
      this.selectorRight.position.x = SELECTOR_RIGHT_X;
      this.selectorShip.position.y = item.position.y;
      this.selectorRight.position.y = item.position.y;
    }
    clearResetConfirm() {
      if (!this.resetConfirmPending) {
        return;
      }
      this.resetConfirmPending = false;
      const resetItem = this.menuItems.find((item) => item.id === "reset");
      if (resetItem?.label) {
        resetItem.message = "Reset Save";
        resetItem.label.changeMessage("Reset Save");
      }
    }
    update(dtime) {
      super.update(dtime);
      this.timeSinceSelected += dtime;
      if (this.selecting && this.timeSinceSelected > 595) {
        this.propagateSelection();
      }
    }
    onUp() {
      if (this.selecting || this.selectedMenuItem <= 0) {
        return;
      }
      this.selectedMenuItem--;
      this.clearResetConfirm();
      this.updateSelectorPosition();
    }
    onDown() {
      if (this.selecting || this.selectedMenuItem >= this.menuItems.length - 1) {
        return;
      }
      this.selectedMenuItem++;
      this.clearResetConfirm();
      this.updateSelectorPosition();
    }
    onSelect() {
      if (this.selecting) {
        return;
      }
      const item = this.menuItems[this.selectedMenuItem];
      if (!item) {
        return;
      }
      if (item.id === "reset") {
        if (!this.resetConfirmPending) {
          this.resetConfirmPending = true;
          item.message = "Confirm?";
          item.label?.changeMessage(" Confirm?");
          return;
        }
      }
      this.startSelectionAnimation();
    }
    startSelectionAnimation() {
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
      const item = this.menuItems[this.selectedMenuItem];
      const parent = this.parent;
      if (item?.id === "reset") {
        this.selecting = false;
        parent.resetMetaProgress();
        return;
      }
      parent.startNewGame();
      this.destroy();
    }
  }

  // src/screens/game-over-screen.ts
  var STAT_LABELS = ["Score", "Kills", "Earned", "Spent"];
  var STAT_LINE_Y = [52, 62, 72, 82];
  var STAT_LABEL_X = 20;
  var STAT_VALUE_RIGHT = 180;

  class GameOverScreen extends GameObject {
    resultMessage = {
      font: "arcade",
      message: "GAME OVER",
      position: { x: 67, y: 18 }
    };
    headerDef = {
      font: "arcade-small",
      message: "< hit enter >",
      position: { x: 75, y: 132 }
    };
    result;
    header;
    statLabels;
    statValues;
    inputEvents;
    themeColor = "#fff";
    constructor(parent) {
      super(parent);
      this.result = new TextDisplay(this, this.resultMessage);
      this.header = new TextDisplay(this, this.headerDef);
      this.statLabels = STAT_LINE_Y.map((y2, index) => new TextDisplay(this, {
        font: "arcade-small",
        message: STAT_LABELS[index],
        position: { x: STAT_LABEL_X, y: y2 }
      }));
      this.statValues = STAT_LINE_Y.map((y2) => new TextDisplay(this, {
        font: "arcade-small",
        message: "",
        position: { x: STAT_VALUE_RIGHT, y: y2 }
      }));
      this.inputEvents = new EventedInput({
        onStart: this.onStart.bind(this)
      });
      this.reset();
    }
    reset() {
      super.reset();
      this.addChild(this.result);
      this.addChild(this.header);
      this.statLabels.forEach((line) => this.addChild(line));
      this.statValues.forEach((line) => this.addChild(line));
      this.addChild(this.inputEvents);
      this.inputEvents.reset();
    }
    onStart() {
      this.parent.finishGame();
    }
    setResult(result) {
      if (result === "win") {
        this.themeColor = "green";
        this.result.changeMessage("YOU WIN!");
      } else if (result === "loss") {
        this.themeColor = "red";
        this.result.changeMessage("GAME OVER");
      }
      this.applyThemeColor();
    }
    setRunStats(stats) {
      this.setRightAlignedValue(this.statValues[0], padScoreDisplay(stats.pointsEarned), STAT_LINE_Y[0]);
      this.setRightAlignedValue(this.statValues[1], String(stats.enemiesDestroyed), STAT_LINE_Y[1]);
      this.setRightAlignedValue(this.statValues[2], "$" + stats.dollarsCollected.toFixed(2), STAT_LINE_Y[2]);
      this.setRightAlignedValue(this.statValues[3], "$" + stats.dollarsSpent.toFixed(2), STAT_LINE_Y[3]);
      this.applyThemeColor();
    }
    setRightAlignedValue(display, text, y2) {
      display.position = { x: STAT_VALUE_RIGHT, y: y2 };
      display.changeMessage(text);
      const width = display.width;
      if (width !== undefined && display.position) {
        display.position.x = STAT_VALUE_RIGHT - width;
        display.changeMessage(text);
      }
    }
    applyThemeColor() {
      this.result.updateColor(this.themeColor);
      this.header.updateColor(this.themeColor);
      this.statLabels.forEach((line) => line.updateColor(this.themeColor));
      this.statValues.forEach((line) => line.updateColor(this.themeColor));
    }
  }

  // src/helpers/input-interpreter.ts
  function newInputDescriptor2() {
    return {
      movementVector: { x: 0, y: 0 },
      fire: false,
      bomb: false,
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
      if (keyboard["B"]) {
        gameInput.bomb = true;
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
      if (gamepad["B"]) {
        gameInput.bomb = true;
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

  // src/sprites/energy-shield.ts
  var ENERGY_SHIELD_COLOR = "hsl(179, 92%, 82%)";
  var UPGRADE_RANK_FILL_COLOR = "hsl(120, 100%, 50%)";
  var n5 = null;
  var w4 = "#ffffff";
  function orbSprite(coreColor) {
    const c = coreColor;
    return new Sprite([
      [n5, w4, w4, w4, w4, n5],
      [w4, w4, c, c, w4, w4],
      [w4, c, c, c, c, w4],
      [w4, c, c, c, c, w4],
      [w4, w4, c, c, w4, w4],
      [n5, w4, w4, w4, w4, n5]
    ]);
  }
  function energyShieldOrbSprite() {
    return orbSprite(ENERGY_SHIELD_COLOR);
  }
  function upgradeRankOrbSprite(filled) {
    return orbSprite(filled ? UPGRADE_RANK_FILL_COLOR : null);
  }
  var ENERGY_SHIELD_ORB_SIZE = 6;
  var UPGRADE_RANK_ORB_SIZE = 6;
  var ENERGY_SHIELD_ORB_STRIDE = 5;
  var UPGRADE_RANK_ORB_STRIDE = 5;
  function applySilhouetteOutline(sprite, outlineColor = ENERGY_SHIELD_COLOR) {
    const w0 = sprite.width;
    const h0 = sprite.height;
    const body = [];
    for (let x = 0;x < w0 + 2; x++) {
      body[x] = [];
      for (let y2 = 0;y2 < h0 + 2; y2++) {
        body[x][y2] = null;
      }
    }
    for (let x = 0;x < w0; x++) {
      for (let y2 = 0;y2 < h0; y2++) {
        body[x + 1][y2 + 1] = sprite.cells[x][y2].color;
      }
    }
    const pixels = body.map((col) => col.slice());
    const isBody = (x, y2) => x >= 0 && y2 >= 0 && x < body.length && y2 < body[0].length && !!body[x][y2];
    for (let x = 0;x < pixels.length; x++) {
      for (let y2 = 0;y2 < pixels[0].length; y2++) {
        if (pixels[x][y2])
          continue;
        if (isBody(x - 1, y2) || isBody(x + 1, y2) || isBody(x, y2 - 1) || isBody(x, y2 + 1) || isBody(x - 1, y2 - 1) || isBody(x + 1, y2 - 1) || isBody(x - 1, y2 + 1) || isBody(x + 1, y2 + 1)) {
          pixels[x][y2] = outlineColor;
        }
      }
    }
    const outlined = new Sprite(pixels);
    const guns = sprite.meta.guns || [];
    outlined.meta = {
      ...sprite.meta,
      guns: guns.map((g) => ({ x: g.x + 1, y: g.y + 1 }))
    };
    outlined.setPermanentOffset(sprite.offsetAdjustment);
    return outlined;
  }

  // src/components/upgrade-progress-orbs.ts
  class UpgradeProgressOrbs extends GameObject {
    index = 2;
    owned = 0;
    max = 0;
    rightX = 0;
    rowY = 0;
    constructor(parent, rightX, rowY) {
      super(parent);
      this.rightX = rightX;
      this.rowY = rowY;
      this.position = { x: rightX, y: rowY };
    }
    setProgress(owned, max) {
      const nextOwned = Math.max(0, Math.min(owned, max));
      if (nextOwned === this.owned && max === this.max) {
        return;
      }
      this.owned = nextOwned;
      this.max = max;
      this.rebuild();
    }
    rebuild() {
      this.children = [];
      if (this.max <= 0) {
        return;
      }
      const width = this.max * UPGRADE_RANK_ORB_STRIDE + 1;
      const leftX = this.rightX - width;
      this.position = { x: leftX, y: this.rowY };
      for (let i = 0;i < this.max; i++) {
        const orb = new GameObject(this);
        orb.sprite = upgradeRankOrbSprite(i < this.owned);
        orb.position = {
          x: leftX + i * UPGRADE_RANK_ORB_STRIDE,
          y: this.rowY
        };
        orb.index = this.index;
        this.addChild(orb);
      }
    }
    static get orbSize() {
      return UPGRADE_RANK_ORB_SIZE;
    }
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

  // src/sprites/player-ship.ts
  function playerShipSprite() {
    const n6 = null;
    const t = "#ffffff";
    const c = "#ffe8c8";
    const h = "#fff0e0";
    const m = "#ffd0a8";
    const w5 = "#e87848";
    const e = "#a84028";
    return new Sprite([
      [n6, n6, n6, n6, n6, n6, w5, n6, n6],
      [n6, n6, n6, n6, n6, w5, m, n6, n6],
      [n6, n6, m, m, m, m, m, m, n6],
      [t, t, c, c, c, e, h, e, e],
      [n6, n6, m, m, m, m, m, m, n6],
      [n6, n6, n6, n6, n6, w5, m, n6, n6],
      [n6, n6, n6, n6, n6, n6, w5, n6, n6]
    ], {
      guns: [
        { x: 3, y: 1 }
      ]
    }).rotateLeft();
  }

  // src/sprites/player-ship-double-guns.ts
  function playerShipDoubleGunsSprite() {
    const n6 = null;
    const t = "#ffffff";
    const c = "#ffe0e0";
    const h = "#fff0f0";
    const m = "#e09898";
    const w5 = "#c04040";
    const e = "#702020";
    return new Sprite([
      [n6, n6, n6, n6, n6, w5, w5, n6, n6],
      [n6, n6, n6, n6, n6, n6, m, n6, n6],
      [n6, n6, n6, n6, n6, m, m, n6, n6],
      [n6, n6, m, m, m, m, m, m, n6],
      [n6, t, c, c, c, e, h, e, e],
      [n6, n6, m, m, m, m, m, m, n6],
      [n6, n6, n6, n6, n6, m, m, n6, n6],
      [n6, n6, n6, n6, n6, n6, m, n6, n6],
      [n6, n6, n6, n6, n6, w5, w5, n6, n6]
    ], {
      guns: [
        { x: 0, y: 6 },
        { x: 8, y: 6 }
      ]
    }).rotateLeft();
  }

  // src/sprites/player-ship-wing-guns.ts
  function playerShipWingGunsSprite() {
    const n6 = null;
    const t = "#ffffff";
    const c = "#d0fff8";
    const h = "#e8fff8";
    const m = "#60b8a8";
    const w5 = "#289080";
    const e = "#185848";
    return new Sprite([
      [n6, n6, n6, n6, w5, w5, w5, n6, n6],
      [n6, n6, n6, n6, n6, n6, m, n6, n6],
      [n6, n6, n6, n6, n6, m, m, n6, n6],
      [n6, n6, m, m, m, m, m, m, n6],
      [t, t, c, c, c, e, h, e, e],
      [n6, n6, m, m, m, m, m, m, n6],
      [n6, n6, n6, n6, n6, m, m, n6, n6],
      [n6, n6, n6, n6, n6, n6, m, n6, n6],
      [n6, n6, n6, n6, w5, w5, w5, n6, n6]
    ], {
      guns: [
        { x: 0, y: 5 },
        { x: 4, y: 1 },
        { x: 8, y: 5 }
      ]
    }).rotateLeft();
  }

  // src/sprites/player-ship-radial.ts
  function playerShipRadialSprite() {
    const n6 = null;
    const t = "#ffffff";
    const c = "#f0e0ff";
    const h = "#f8f0ff";
    const m = "#c0a0e0";
    const w5 = "#9040c0";
    const e = "#502878";
    return new Sprite([
      [n6, n6, n6, n6, n6, t, w5, w5, n6],
      [n6, n6, n6, n6, n6, m, m, w5, n6],
      [n6, n6, n6, n6, m, m, m, n6, n6],
      [n6, n6, m, m, m, m, e, n6, n6],
      [t, t, c, c, h, e, e, e, e],
      [n6, n6, m, m, m, m, e, n6, n6],
      [n6, n6, n6, n6, m, m, m, n6, n6],
      [n6, n6, n6, n6, n6, m, m, w5, n6],
      [n6, n6, n6, n6, n6, t, w5, w5, n6]
    ], {
      guns: [
        { x: 0, y: 6 },
        { x: 4, y: 1 },
        { x: 8, y: 6 }
      ]
    }).rotateLeft();
  }

  // src/ships/player-controlled-ship.ts
  var BASE_MAX_LIFE = 20;
  var BASE_SPEED = 50;
  var BASE_FIRE_RATE = 500;
  class PlayerControlledShip extends GameObject {
    type = "player";
    isPhysicalEntity = true;
    index = 5;
    explosion;
    sprite;
    position;
    velocity;
    shipHangar;
    activeShipId;
    lifeUpgrades = 0;
    fullHealPurchases = 0;
    energyShield = 0;
    bombs = 0;
    armor = 0;
    SPEED = BASE_SPEED;
    BULLET_SPEED = 100;
    FIRE_RATE = BASE_FIRE_RATE;
    preventInputControl = true;
    exploding = false;
    team = 0;
    damage = 5;
    timeSinceFired = 0;
    firing;
    shieldOutlineApplied = false;
    bombPressed = false;
    constructor(parent) {
      super(parent);
      this.reset();
    }
    get shipProfile() {
      return this.shipHangar[this.activeShipId];
    }
    get comboSegments() {
      return this.shipProfile.comboSegments;
    }
    set comboSegments(value) {
      this.shipProfile.comboSegments = value;
    }
    get comboUpgrades() {
      return this.shipProfile.comboUpgrades;
    }
    set comboUpgrades(value) {
      this.shipProfile.comboUpgrades = value;
    }
    isShipUnlocked(shipId) {
      return this.shipHangar[shipId].unlocked;
    }
    unlockShip(shipId) {
      this.shipHangar[shipId].unlocked = true;
      this.triggerEvent("persistMeta");
    }
    get bombCapacity() {
      return this.shipProfile.bombCapacityRanks;
    }
    selectShipForRun(shipId) {
      if (!this.isShipUnlocked(shipId)) {
        return;
      }
      this.activeShipId = shipId;
      this.applyPersistentUpgrades();
    }
    refillBombs() {
      this.bombs = this.bombCapacity;
    }
    profileFor(shipId) {
      return this.shipHangar[shipId];
    }
    reset() {
      super.reset();
      this.shipHangar = createStarterHangar();
      this.activeShipId = defaultActiveShipId();
      this.shieldOutlineApplied = false;
      this.clearRunCounters();
      this.resetForNewRun();
    }
    resetForNewRun() {
      super.reset();
      this.clearRunCounters();
      this.activeShipId = defaultActiveShipId();
      this.shieldOutlineApplied = false;
      this.explosion = shipExplosion;
      this.position = { x: -100, y: -100 };
      this.velocity = { x: 0, y: 0 };
      this.BULLET_SPEED = 100;
      this.preventInputControl = true;
      this.exploding = false;
      this.team = 0;
      this.damage = 5;
      this.timeSinceFired = 0;
      this.bombPressed = false;
      this.applyPersistentUpgrades();
    }
    clearRunCounters() {
      this.lifeUpgrades = 0;
      this.fullHealPurchases = 0;
      this.energyShield = 0;
      this.bombs = 0;
    }
    applyPersistentUpgrades() {
      const profile = this.shipProfile;
      this.maxLife = BASE_MAX_LIFE + profile.maxHealthRanks * 5 + this.lifeUpgrades;
      this.life = this.maxLife;
      this.armor = profile.armorRanks;
      this.SPEED = Math.round(BASE_SPEED * Math.pow(1.1, profile.shipSpeedRanks));
      this.FIRE_RATE = Math.ceil(BASE_FIRE_RATE * Math.pow(0.9, profile.fireSpeedRanks));
      this.refillBombs();
      this.refreshShieldVisual();
    }
    syncStatsFromUpgrades(opts) {
      const profile = this.shipProfile;
      const previousMax = this.maxLife || BASE_MAX_LIFE;
      this.maxLife = BASE_MAX_LIFE + profile.maxHealthRanks * 5 + this.lifeUpgrades;
      this.armor = profile.armorRanks;
      this.SPEED = Math.round(BASE_SPEED * Math.pow(1.1, profile.shipSpeedRanks));
      this.FIRE_RATE = Math.ceil(BASE_FIRE_RATE * Math.pow(0.9, profile.fireSpeedRanks));
      if (opts?.healBy !== undefined) {
        this.life = Math.min(this.maxLife, (this.life || 0) + opts.healBy);
      } else if ((this.life || 0) > this.maxLife) {
        this.life = this.maxLife;
      } else if (this.maxLife > previousMax && this.life === previousMax) {
        this.life = this.maxLife;
      }
    }
    refillHealth() {
      this.life = this.maxLife;
    }
    purchaseFullHeal() {
      if (!this.canPurchaseFullHeal()) {
        return;
      }
      this.fullHealPurchases++;
      this.refillHealth();
    }
    canPurchaseFullHeal() {
      return (this.life || 0) < (this.maxLife || 0);
    }
    purchaseRunHealth() {
      this.lifeUpgrades++;
      this.maxLife = (this.maxLife || BASE_MAX_LIFE) + 1;
      this.life = (this.life || 0) + 1;
    }
    purchaseEnergyShield() {
      this.energyShield++;
      this.refreshShieldVisual();
    }
    purchaseBomb() {
      if (this.bombs >= this.bombCapacity) {
        return;
      }
      this.bombs++;
    }
    canPurchaseBomb() {
      return this.bombCapacity > 0 && this.bombs < this.bombCapacity;
    }
    purchaseMaxHealth(shipId) {
      const profile = this.shipHangar[shipId];
      const cap = playerShipDef(shipId).maxHealth;
      if (profile.maxHealthRanks >= cap)
        return;
      profile.maxHealthRanks++;
      if (shipId === this.activeShipId) {
        this.syncStatsFromUpgrades({ healBy: 5 });
      }
      this.triggerEvent("persistMeta");
    }
    purchaseArmor(shipId) {
      const profile = this.shipHangar[shipId];
      const cap = playerShipDef(shipId).maxArmor;
      if (profile.armorRanks >= cap)
        return;
      profile.armorRanks++;
      if (shipId === this.activeShipId) {
        this.syncStatsFromUpgrades();
      }
      this.triggerEvent("persistMeta");
    }
    purchaseBombCapacity(shipId) {
      const profile = this.shipHangar[shipId];
      const cap = playerShipDef(shipId).maxBombCapacity;
      if (profile.bombCapacityRanks >= cap)
        return;
      profile.bombCapacityRanks++;
      this.triggerEvent("persistMeta");
    }
    purchaseShipSpeed(shipId) {
      const profile = this.shipHangar[shipId];
      const cap = playerShipDef(shipId).maxShipSpeed;
      if (profile.shipSpeedRanks >= cap)
        return;
      profile.shipSpeedRanks++;
      if (shipId === this.activeShipId) {
        this.syncStatsFromUpgrades();
      }
      this.triggerEvent("persistMeta");
    }
    purchaseFireSpeed(shipId) {
      const profile = this.shipHangar[shipId];
      const cap = playerShipDef(shipId).maxFireSpeed;
      if (profile.fireSpeedRanks >= cap)
        return;
      profile.fireSpeedRanks++;
      if (shipId === this.activeShipId) {
        this.syncStatsFromUpgrades();
      }
      this.triggerEvent("persistMeta");
    }
    purchaseDamage(shipId) {
      const profile = this.shipHangar[shipId];
      const cap = playerShipDef(shipId).maxDamage;
      if (profile.damageRanks >= cap)
        return;
      profile.damageRanks++;
      this.triggerEvent("persistMeta");
    }
    purchaseCombo(shipId) {
      const profile = this.shipHangar[shipId];
      const cap = playerShipDef(shipId).maxCombo;
      if (profile.comboSegments >= cap)
        return;
      profile.comboSegments++;
      profile.comboUpgrades++;
      this.triggerEvent("persistMeta");
    }
    applyActiveShipSprite() {
      switch (this.activeShipId) {
        case "starter":
          this.sprite = playerShipSprite().rotateRight();
          break;
        case "double":
          this.sprite = playerShipDoubleGunsSprite().rotateRight();
          break;
        case "triple":
          this.sprite = playerShipWingGunsSprite().rotateRight();
          break;
        case "radial":
          this.sprite = playerShipRadialSprite().rotateRight();
          break;
      }
    }
    refreshShieldVisual() {
      if (this.exploding) {
        return;
      }
      if (this.shieldOutlineApplied && this.position) {
        this.position.x += 1;
        this.position.y += 1;
        this.shieldOutlineApplied = false;
      }
      this.applyActiveShipSprite();
      if (this.energyShield > 0 && this.sprite && this.position) {
        this.sprite = applySilhouetteOutline(this.sprite);
        this.position.x -= 1;
        this.position.y -= 1;
        this.shieldOutlineApplied = true;
      }
    }
    static spriteForShipId(shipId) {
      switch (shipId) {
        case "starter":
          return playerShipSprite().rotateRight();
        case "double":
          return playerShipDoubleGunsSprite().rotateRight();
        case "triple":
          return playerShipWingGunsSprite().rotateRight();
        case "radial":
          return playerShipRadialSprite().rotateRight();
      }
    }
    bulletSpreadX(gunIndex, gunCount) {
      if (this.activeShipId === "radial" && gunCount === 3) {
        return (gunIndex - 1) * 10;
      }
      return 0;
    }
    processInput(input) {
      super.processInput(input);
      if (this.preventInputControl || this.exploding || this.destroyed) {
        return;
      }
      this.velocity.x = input.movementVector.x * this.SPEED;
      this.velocity.y = input.movementVector.y * this.SPEED;
      this.firing = input.fire;
      if (input.bomb && !this.bombPressed) {
        this.handleBombPress();
      }
      this.bombPressed = !!input.bomb;
    }
    handleBombPress() {
      const phoenix = this.parent;
      const liveBomb = phoenix?.activeBomb && !phoenix.activeBomb.destroyed && !phoenix.activeBomb.exploding;
      if (liveBomb) {
        this.triggerEvent("detonateBomb");
        return;
      }
      if (this.bombs <= 0 || !this.position || !this.sprite) {
        return;
      }
      this.bombs--;
      this.triggerEvent("spawnBomb", {
        team: this.team,
        position: {
          x: this.position.x + Math.floor(this.sprite.width / 2) - 1,
          y: this.position.y
        }
      });
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
      const guns = this.sprite.meta.guns;
      guns.forEach(function(gun, index) {
        this.triggerEvent("spawnBullet", {
          team: this.team,
          damage: 1 + this.shipProfile.damageRanks,
          velocity: {
            x: this.bulletSpreadX(index, guns.length),
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
      if (damage <= 0) {
        super.applyDamage(damage, sourceEntity);
        return;
      }
      if (this.energyShield > 0) {
        this.energyShield--;
        this.refreshShieldVisual();
        return;
      }
      this.triggerEvent("playerHit");
      const effectiveDamage = Math.max(1, damage - this.armor);
      super.applyDamage(effectiveDamage, sourceEntity);
    }
  }

  // src/levels/hangar.ts
  var TAB_Y = 22;
  var SHIP_TAB_START_X = 100;
  var SHIP_TAB_STRIDE = 22;
  var STAT_BASE_Y = 40;
  var STAT_ROW_STRIDE = 12;
  var STAT_LABEL_X2 = 40;
  var PROGRESS_RIGHT_X = 182;
  var SELECT_Y = 120;
  var SELECT_LABEL_X = 50;
  var SELECTOR_X = 20;

  class Hangar extends GameObject {
    isShop = true;
    index = 1;
    disabledColor = "#777";
    game;
    player;
    input;
    titleText;
    selectText;
    selectorShip;
    tabChrome = [];
    statRows = [];
    activeTabIndex = 0;
    timeSinceSelected = 0;
    selecting = false;
    isDone = false;
    interactive = false;
    constructor(parent, game) {
      super(parent);
      this.game = game;
      this.player = game.player;
      this.input = new EventedInput({
        onLeft: this.onLeft.bind(this),
        onRight: this.onRight.bind(this),
        onSelect: this.onSelect.bind(this)
      });
      this.reset();
    }
    reset() {
      super.reset();
      this.input.reset();
      this.isDone = false;
      this.selecting = false;
      this.interactive = false;
      this.activeTabIndex = 0;
      this.tabChrome = [];
      this.statRows = [];
      this.createTitle();
      this.createTabChrome();
      this.createSelectRow();
      this.createSelectorShip();
      this.addChild(this.input);
    }
    start() {
      this.input.reset();
      this.isDone = false;
      this.selecting = false;
      this.clearStatRows();
      const unlocked = this.unlockedShipIds();
      if (unlocked.length <= 1) {
        this.interactive = false;
        this.hideChrome();
        this.isDone = true;
        return;
      }
      this.interactive = true;
      this.showChrome();
      const activeIndex = playerShipDefs.findIndex((def) => def.id === this.player.activeShipId);
      this.activeTabIndex = activeIndex >= 0 ? activeIndex : 0;
      this.refreshTabChrome();
      this.rebuildStatsForActiveTab();
      this.refreshSelectRow();
    }
    checkIfLevelComplete() {
      return this.isDone;
    }
    update(dtime) {
      super.update(dtime);
      if (!this.interactive) {
        return;
      }
      this.timeSinceSelected += dtime;
      if (this.selecting && this.timeSinceSelected > 595) {
        this.propagateSelection();
      }
    }
    unlockedShipIds() {
      return playerShipDefs.filter((def) => this.player.isShipUnlocked(def.id)).map((def) => def.id);
    }
    activeShipId() {
      return playerShipDefs[this.activeTabIndex].id;
    }
    createTitle() {
      this.titleText = new TextDisplay(this, {
        font: "arcade",
        message: "Hangar",
        position: { x: 70, y: 8 },
        color: this.game.interfaceColor
      });
      this.addChild(this.titleText);
    }
    createTabChrome() {
      this.tabChrome = playerShipDefs.map((def, index) => {
        const sprite = PlayerControlledShip.spriteForShipId(def.id);
        const x = SHIP_TAB_START_X + index * SHIP_TAB_STRIDE;
        const shipIcon = new GameObject;
        shipIcon.sprite = sprite;
        shipIcon.position = { x, y: TAB_Y - 2 };
        shipIcon.index = 2;
        this.addChild(shipIcon);
        const leftBracket = new TextDisplay(this, {
          font: "arcade-small",
          message: "[",
          position: { x: x - 5, y: TAB_Y },
          color: this.game.interfaceColor
        });
        const rightBracket = new TextDisplay(this, {
          font: "arcade-small",
          message: "]",
          position: { x: x + sprite.width + 1, y: TAB_Y },
          color: this.game.interfaceColor
        });
        this.addChild(leftBracket);
        this.addChild(rightBracket);
        return { shipId: def.id, shipIcon, leftBracket, rightBracket };
      });
      this.refreshTabChrome();
    }
    refreshTabChrome() {
      this.tabChrome.forEach((tab, index) => {
        const active = index === this.activeTabIndex;
        const unlocked = this.player.isShipUnlocked(tab.shipId);
        tab.shipIcon.sprite = PlayerControlledShip.spriteForShipId(tab.shipId);
        if (!unlocked) {
          tab.shipIcon.sprite.applyColor(this.disabledColor);
        }
        tab.leftBracket.changeMessage(active ? "[" : " ");
        tab.rightBracket.changeMessage(active ? "]" : " ");
        tab.leftBracket.updateColor(this.game.interfaceColor);
        tab.rightBracket.updateColor(this.game.interfaceColor);
      });
    }
    createSelectRow() {
      this.selectText = new TextDisplay(this, {
        font: "arcade-small",
        message: "Select",
        position: { x: SELECT_LABEL_X, y: SELECT_Y },
        color: this.game.interfaceColor,
        isPhysicalEntity: true
      });
      this.addChild(this.selectText);
    }
    createSelectorShip() {
      this.selectorShip = new GameObject;
      this.selectorShip.sprite = arrowShipSprite();
      this.selectorShip.position = { x: SELECTOR_X, y: SELECT_Y };
      this.addChild(this.selectorShip);
    }
    refreshSelectRow() {
      const unlocked = this.player.isShipUnlocked(this.activeShipId());
      this.selectText.updateColor(unlocked ? this.game.interfaceColor : this.disabledColor);
    }
    hideChrome() {
      if (this.titleText.position) {
        this.titleText.position.y = -100;
      }
      if (this.selectorShip.position) {
        this.selectorShip.position.y = -100;
      }
      if (this.selectText.position) {
        this.selectText.position.y = -100;
      }
      this.tabChrome.forEach((tab) => {
        if (tab.shipIcon.position) {
          tab.shipIcon.position.y = -100;
        }
        if (tab.leftBracket.position) {
          tab.leftBracket.position.y = -100;
        }
        if (tab.rightBracket.position) {
          tab.rightBracket.position.y = -100;
        }
      });
    }
    showChrome() {
      if (this.titleText.position) {
        this.titleText.position.y = 8;
      }
      if (this.selectorShip.position) {
        this.selectorShip.position.y = SELECT_Y;
      }
      if (this.selectText.position) {
        this.selectText.position.y = SELECT_Y;
      }
      this.tabChrome.forEach((tab) => {
        if (tab.shipIcon.position) {
          tab.shipIcon.position.y = TAB_Y - 2;
        }
        if (tab.leftBracket.position) {
          tab.leftBracket.position.y = TAB_Y;
        }
        if (tab.rightBracket.position) {
          tab.rightBracket.position.y = TAB_Y;
        }
      });
    }
    clearStatRows() {
      this.statRows.forEach((row) => {
        this.removeChild(row.label);
        this.removeChild(row.progressOrbs);
      });
      this.statRows = [];
    }
    rebuildStatsForActiveTab() {
      this.clearStatRows();
      const shipId = this.activeShipId();
      if (!this.player.isShipUnlocked(shipId)) {
        return;
      }
      const profile = this.player.profileFor(shipId);
      const def = playerShipDef(shipId);
      const stats = this.statDescriptors(profile, def);
      this.statRows = stats.map((stat, index) => {
        const y2 = STAT_BASE_Y + index * STAT_ROW_STRIDE;
        const label = new TextDisplay(this, {
          font: "arcade-small",
          message: stat.text,
          position: { x: STAT_LABEL_X2, y: y2 },
          color: this.game.interfaceColor
        });
        this.addChild(label);
        const progressOrbs = new UpgradeProgressOrbs(this, PROGRESS_RIGHT_X, y2);
        progressOrbs.setProgress(stat.owned, stat.max);
        this.addChild(progressOrbs);
        return { label, progressOrbs };
      });
    }
    statDescriptors(profile, def) {
      const health = BASE_MAX_LIFE + profile.maxHealthRanks * 5;
      const speedPct = profile.shipSpeedRanks * 10;
      const firePct = profile.fireSpeedRanks * 10;
      const comboMult = profile.comboSegments + 1;
      return [
        {
          text: "Health: " + health,
          owned: profile.maxHealthRanks,
          max: def.maxHealth
        },
        {
          text: "Armor: " + profile.armorRanks,
          owned: profile.armorRanks,
          max: def.maxArmor
        },
        {
          text: "Bombs: " + profile.bombCapacityRanks,
          owned: profile.bombCapacityRanks,
          max: def.maxBombCapacity
        },
        {
          text: "Ship Speed: +" + speedPct + "%",
          owned: profile.shipSpeedRanks,
          max: def.maxShipSpeed
        },
        {
          text: "Fire Rate: +" + firePct + "%",
          owned: profile.fireSpeedRanks,
          max: def.maxFireSpeed
        },
        {
          text: "Damage: " + (1 + profile.damageRanks),
          owned: profile.damageRanks,
          max: def.maxDamage
        },
        {
          text: "Combo: " + comboMult + "x",
          owned: profile.comboSegments,
          max: def.maxCombo
        }
      ];
    }
    setActiveTab(index) {
      if (index < 0 || index >= playerShipDefs.length || index === this.activeTabIndex || this.selecting) {
        return;
      }
      this.activeTabIndex = index;
      this.refreshTabChrome();
      this.rebuildStatsForActiveTab();
      this.refreshSelectRow();
    }
    onLeft() {
      if (!this.interactive || this.selecting) {
        return;
      }
      this.setActiveTab(this.activeTabIndex - 1);
    }
    onRight() {
      if (!this.interactive || this.selecting) {
        return;
      }
      this.setActiveTab(this.activeTabIndex + 1);
    }
    onSelect() {
      if (!this.interactive || this.selecting) {
        return;
      }
      if (!this.player.isShipUnlocked(this.activeShipId())) {
        return;
      }
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
      const shipId = this.activeShipId();
      if (this.player.isShipUnlocked(shipId)) {
        this.player.selectShipForRun(shipId);
        this.game.comboGauge.syncFromPlayer();
      }
      this.selecting = false;
      this.isDone = true;
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

  // src/balance/enemies.ts
  var arrowScout = {
    contactDamage: (dm) => 30 + dm,
    life: (dm) => dm,
    bulletDamage: (dm) => 4 + dm,
    bulletSpeed: 100
  };
  var arrowBoss = {
    contactDamage: (dm) => 50 * dm,
    life: (dm) => 75 + 25 * dm,
    bulletDamage: (dm) => 9 + dm,
    bulletSpeed: 125
  };
  var dashScout = {
    contactDamage: (dm) => 15 + dm,
    life: (dm) => dm + 2,
    bulletDamage: (dm) => 3 + dm * 2,
    bulletSpeed: 125
  };
  var dashBoss = {
    contactDamage: (dm) => 40 * dm,
    life: (dm) => 100 + 50 * dm,
    bulletDamage: (dm) => 5 + dm * 2,
    bulletSpeed: 150
  };

  // src/ships/arrow-boss.ts
  var ENEMY_ORBIT_SPRITE_WIDTH = 8;
  var ENEMY_ORBIT_SPRITE_HEIGHT = 7;

  class ArrowBoss extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = arrowBoss.bulletSpeed;
    team = 1;
    index = 5;
    difficultyMultiplier;
    explosion;
    sprite;
    guns;
    position;
    velocity;
    orbitPathOffset;
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
      this.orbitPathOffset = undefined;
      this.position = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      this.damage = arrowBoss.contactDamage(this.difficultyMultiplier);
      this.life = arrowBoss.life(this.difficultyMultiplier);
      this.maxLife = this.life;
    }
    enableOrbitPathAlignment() {
      this.orbitPathOffset = {
        x: Math.floor((ENEMY_ORBIT_SPRITE_WIDTH - this.sprite.width) / 2),
        y: Math.floor((ENEMY_ORBIT_SPRITE_HEIGHT - this.sprite.height) / 2)
      };
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
        damage: arrowBoss.bulletDamage(this.difficultyMultiplier)
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

  // src/balance/fire.ts
  var randomRateFire = {
    thresholdMinMs: 500,
    thresholdMaxMs: 3500,
    initialDelayMs: 0
  };
  var chainGunFire = {
    fireRateMs: 150,
    burstSize: 5,
    thresholdMinMs: 2000,
    thresholdMaxMs: 6000
  };
  var burstOnPause = {
    burstSize: 3,
    fireRateMs: 120,
    windupMs: 80
  };
  var dashAndPause = {
    dashSpeed: 120,
    pauseSecondsMin: 0.8,
    pauseSecondsMax: 1.6,
    telegraphSeconds: 0.38,
    minDashDistance: 25,
    maxDashDistance: 70,
    initialWaitSecondsMin: 1,
    initialWaitSecondsMax: 10
  };

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
      this.fireRate = opts.fireRate ?? chainGunFire.fireRateMs;
      this.burstSize = opts.burstSize ?? chainGunFire.burstSize;
      this.thresholdMin = opts.thresholdMin ?? chainGunFire.thresholdMinMs;
      this.thresholdMax = opts.thresholdMax ?? chainGunFire.thresholdMaxMs;
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
    BULLET_SPEED = arrowScout.bulletSpeed;
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
      this.damage = arrowScout.contactDamage(this.difficultyMultiplier);
      this.maxLife = arrowScout.life(this.difficultyMultiplier);
      this.life = this.maxLife;
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
        damage: arrowScout.bulletDamage(this.difficultyMultiplier)
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
    initialDelayMs;
    elapsed;
    threshold;
    delayElapsed = 0;
    firing = false;
    constructor(parent, ship, options) {
      super(parent);
      const opts = options || {};
      this.ship = ship;
      this.gunIndex = opts.gunIndex ?? 0;
      this.thresholdMin = opts.thresholdMin ?? randomRateFire.thresholdMinMs;
      this.thresholdMax = opts.thresholdMax ?? randomRateFire.thresholdMaxMs;
      this.initialDelayMs = opts.initialDelayMs ?? randomRateFire.initialDelayMs;
      this.reset();
    }
    start() {
      this.delayElapsed = 0;
      this.firing = this.initialDelayMs <= 0;
      if (this.firing) {
        this.beginFiring();
      }
    }
    update(dtime) {
      if (this.ship.destroyed) {
        this.destroy();
        return;
      }
      if (!this.firing) {
        this.delayElapsed += dtime;
        if (this.delayElapsed >= this.initialDelayMs) {
          this.beginFiring();
        }
        return;
      }
      this.elapsed += dtime;
      if (this.elapsed > this.threshold) {
        this.resetTimer();
        this.ship.fire(this.gunIndex);
      }
    }
    beginFiring() {
      this.firing = true;
      this.resetTimer();
      this.threshold += this.thresholdMax;
    }
    resetTimer() {
      this.elapsed = 0;
      this.threshold = integer(this.thresholdMin, this.thresholdMax);
    }
  }

  // src/components/life-meter.ts
  var BOMB_ICON_SIZE = 3;
  var BOMB_ICON_STRIDE = 4;
  var BOMB_ICON_GAP = 1;

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
    mirror;
    currentLife;
    maxLife;
    currentShield;
    currentBombs;
    shieldOrbs = [];
    bombIcons = [];
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
      this.mirror = !!opts.mirror;
      this.reset();
    }
    reset() {
      super.reset();
      this.currentLife = undefined;
      this.maxLife = undefined;
      this.currentShield = undefined;
      this.currentBombs = undefined;
      this.shieldOrbs = [];
      this.bombIcons = [];
    }
    showsPlayerHudExtras() {
      return !!this.scale && !this.horizontal && this.showBorder;
    }
    entityShield() {
      return this.entity.energyShield || 0;
    }
    entityBombs() {
      return this.entity.bombs || 0;
    }
    update() {
      if (this.entity.destroyed) {
        this.destroy();
        return;
      }
      const lifeChanged = this.entity.life !== this.currentLife || this.entity.maxLife !== this.maxLife;
      const shield = this.entityShield();
      const bombs2 = this.entityBombs();
      const shieldChanged = this.showsPlayerHudExtras() && shield !== this.currentShield;
      const bombsChanged = this.showsPlayerHudExtras() && bombs2 !== this.currentBombs;
      if (lifeChanged) {
        this.currentLife = this.entity.life;
        this.maxLife = this.entity.maxLife;
        if (this.scale && this.maxLife) {
          this.length = this.maxLife * this.scale;
          if (this.length > 140) {
            this.length = 140;
          }
        }
        this.redrawMeter();
      }
      if (lifeChanged || shieldChanged) {
        this.currentShield = shield;
        this.syncShieldOrbs();
      }
      if (lifeChanged || bombsChanged) {
        this.currentBombs = bombs2;
        this.syncBombIcons();
      }
    }
    renderToFrame(frame) {
      if (this.sprite && this.position) {
        this.sprite.renderToFrame(frame, Math.floor(this.position.x), Math.floor(this.position.y), this.index || 0);
      }
      this.shieldOrbs.forEach((orb) => {
        if (orb.sprite && orb.position) {
          orb.sprite.renderToFrame(frame, Math.floor(orb.position.x), Math.floor(orb.position.y), (this.index || 0) + 1);
        }
      });
      this.bombIcons.forEach((icon) => {
        if (icon.sprite && icon.position) {
          icon.sprite.renderToFrame(frame, Math.floor(icon.position.x), Math.floor(icon.position.y), (this.index || 0) + 1);
        }
      });
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
    syncShieldOrbs() {
      if (!this.showsPlayerHudExtras() || !this.position || !this.sprite) {
        this.shieldOrbs = [];
        return;
      }
      const count = this.currentShield || 0;
      this.shieldOrbs = [];
      const barWidth = this.sprite.width;
      const orbX = this.position.x + Math.floor((barWidth - ENERGY_SHIELD_ORB_SIZE) / 2);
      const firstOrbY = this.position.y - ENERGY_SHIELD_ORB_SIZE + 1;
      for (let i = 0;i < count; i++) {
        const orb = new GameObject;
        orb.sprite = energyShieldOrbSprite();
        orb.position = {
          x: orbX,
          y: firstOrbY - i * ENERGY_SHIELD_ORB_STRIDE
        };
        this.shieldOrbs.push(orb);
      }
    }
    syncBombIcons() {
      if (!this.showsPlayerHudExtras() || !this.position || !this.sprite) {
        this.bombIcons = [];
        return;
      }
      const count = this.currentBombs || 0;
      this.bombIcons = [];
      const iconX = this.position.x - BOMB_ICON_SIZE - BOMB_ICON_GAP;
      const firstIconY = this.position.y + this.sprite.height - BOMB_ICON_SIZE;
      for (let i = 0;i < count; i++) {
        const icon = new GameObject;
        icon.sprite = bombSprite();
        icon.position = {
          x: iconX,
          y: firstIconY - i * BOMB_ICON_STRIDE
        };
        this.bombIcons.push(icon);
      }
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
      if (this.mirror) {
        colors.forEach((colorArray) => colorArray.reverse());
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

  // src/balance/economy.ts
  var MONEY_DROP_VALUE = 5;
  var MONEY_DROP_FALL_SPEED = 50;
  function moneyDropDivisor(difficultyMultiplier) {
    return difficultyMultiplier > 5 ? 3 : 4;
  }
  function moneyDropCount(shipCount, difficultyMultiplier) {
    return Math.floor(shipCount / moneyDropDivisor(difficultyMultiplier));
  }
  var BOSS_MONEY_OFFSETS = [
    { x: 0, y: 0 },
    { x: 7, y: 0 },
    { x: 4, y: 8 }
  ];
  function bossMoneyPositions(origin) {
    return BOSS_MONEY_OFFSETS.map((offset) => ({
      x: origin.x + offset.x,
      y: origin.y + offset.y
    }));
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
      this.value = MONEY_DROP_VALUE;
      this.position = { x: position.x, y: position.y };
      this.velocity = velocity ? { x: velocity.x, y: velocity.y } : { x: 0, y: MONEY_DROP_FALL_SPEED };
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
      } else if (sourceEntity && sourceEntity.type === "bomb") {
        this.destroy();
      }
    }
  }

  // src/scripts/move-object-to-point.ts
  function resolveTarget(object, target) {
    const offset = object.orbitPathOffset ?? { x: 0, y: 0 };
    return { x: target.x + offset.x, y: target.y + offset.y };
  }

  class MoveObjectToPoint extends GameObject {
    object;
    target;
    resolvedTarget;
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
      this.resolvedTarget = resolveTarget(this.object, this.target);
      const xDiff = this.resolvedTarget.x - current.x;
      const yDiff = this.resolvedTarget.y - current.y;
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
        this.object.position.x = this.resolvedTarget.x;
        this.object.position.y = this.resolvedTarget.y;
        this.parent.removeChild(this);
      }
    }
    metXThreshold() {
      return this.xPositive && this.object.position.x >= this.resolvedTarget.x || !this.xPositive && this.object.position.x <= this.resolvedTarget.x;
    }
    metYThreshold() {
      return this.yPositive && this.object.position.y >= this.resolvedTarget.y || !this.yPositive && this.object.position.y <= this.resolvedTarget.y;
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

  // src/balance/group-01.ts
  var group01 = {
    bannerMs: 2000,
    columnStartBase: 3,
    columnStartMin: 1,
    columnEndBase: 8,
    columnEndMax: 10,
    columnSpacing: 10,
    columnOffsetX: 39,
    enterY: [-40, -30, -20, -10],
    restY: [45, 55, 65, 75],
    moveTimeSeconds: 3,
    swayOffsetX: 40,
    swayOffsetY: 30,
    bossPatrolY: 1,
    bossPatrolLeftX: 1,
    bossPatrolRightMargin: 5,
    bossPatrolSeconds: 8
  };

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
      this.difficultyMultiplier = difficultyMultiplier + (alternateShip ? 1 : 0);
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
      const start = group01.columnStartMin;
      const end = group01.columnEndMax;
      const time = group01.moveTimeSeconds;
      for (let i = start;i <= end; i++) {
        const x = group01.columnSpacing * i + group01.columnOffsetX;
        this.newShip(x, group01.enterY[0], group01.restY[0], time);
        if (this.rowCount >= 2) {
          this.newShip(x, group01.enterY[1], group01.restY[1], time);
        }
        if (this.rowCount >= 3) {
          this.newShip(x, group01.enterY[2], group01.restY[2], time);
        }
        if (this.rowCount >= 4) {
          this.newShip(x, group01.enterY[3], group01.restY[3], time);
        }
      }
      this.attachMoneyScripts();
      if (this.boss) {
        this.newBossShip();
      }
      if (this.levelName) {
        this.scripts.push(new FadeoutBanner(this, this.levelName, group01.bannerMs));
      }
      this.ships.forEach((ship) => {
        this.addChild(ship);
      });
      this.scripts.forEach((script) => {
        script.start();
        this.addChild(script);
      });
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
      const swayX = group01.swayOffsetX;
      const swayY = group01.swayOffsetY;
      ship.position.x = startX;
      ship.position.y = startY;
      this.scripts.push(new FireSingleGunRandomRate(this, ship));
      this.scripts.push(new ScriptChain(this, false, [
        new MoveObjectToPoint(null, ship, { x: startX, y: endY }, time * 2),
        new MoveObjectToPoint(null, ship, { x: startX - swayX, y: endY }, time),
        new ScriptChain(this, true, [
          new MoveObjectToPoint(null, ship, { x: startX - swayX, y: endY - swayY }, time),
          new MoveObjectToPoint(null, ship, { x: startX + swayX, y: endY - swayY }, time * 2),
          new MoveObjectToPoint(null, ship, { x: startX + swayX, y: endY }, time),
          new MoveObjectToPoint(null, ship, { x: startX - swayX, y: endY }, time * 2)
        ])
      ]));
      this.ships.push(ship);
    }
    newBossShip() {
      const boss = new ArrowBoss(this, this.difficultyMultiplier);
      const gameWidth = this.game.width;
      const bossWidth = boss.sprite.width;
      const patrolY = group01.bossPatrolY;
      const patrolSeconds = group01.bossPatrolSeconds;
      boss.position.x = -this.game.width / 2;
      boss.position.y = patrolY;
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
        new MoveObjectToPoint(null, boss, { x: group01.bossPatrolLeftX, y: patrolY }, patrolSeconds),
        new MoveObjectToPoint(null, boss, {
          x: gameWidth - bossWidth - group01.bossPatrolRightMargin,
          y: patrolY
        }, patrolSeconds)
      ]));
      this.scripts.push(new WatchForDeath(this, boss, () => {
        bossMoneyPositions(boss.position).forEach((pos) => {
          this.addChild(new MoneyDrop(this, pos));
        });
      }));
      this.ships.push(boss);
    }
    attachMoneyScripts() {
      const count = moneyDropCount(this.ships.length, this.difficultyMultiplier);
      const selectedShips = sample(this.ships, count);
      selectedShips.forEach((ship) => {
        this.scripts.push(new WatchForDeath(this, ship, () => {
          this.addChild(new MoneyDrop(this, ship.position));
        }));
      });
    }
  }

  // src/scripts/wait.ts
  class Wait extends GameObject {
    duration;
    elapsed = 0;
    constructor(parent, durationSeconds) {
      super(parent);
      this.duration = durationSeconds;
    }
    start() {
      this.elapsed = 0;
    }
    update(dtime) {
      this.elapsed += dtime / 1000;
      if (this.elapsed >= this.duration) {
        this.parent.removeChild();
      }
    }
  }

  // src/balance/group-02.ts
  var group02 = {
    bannerMs: 2000,
    pathLeft: 4,
    pathInner: 20,
    pathRight: 182,
    pathTop: 4,
    laneGap: 14,
    enterX: -24,
    pathSpeed: 40,
    staggerSeconds: 0.45,
    shipsPerTierBase: 8,
    laneBase: 2,
    laneStep: 2,
    laneMax: 8,
    fireDelayPaddingSeconds: -3
  };
  function group02ShipCount(rowCount) {
    return group02.shipsPerTierBase * (rowCount + 1);
  }
  function group02LaneCount(rowCount) {
    return Math.min(group02.laneBase + rowCount * group02.laneStep, group02.laneMax);
  }

  // src/levels/level-group-02.ts
  class LevelGroup02 extends GameObject {
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
      this.difficultyMultiplier = difficultyMultiplier + (alternateShip ? 1 : 0);
      this.width = this.parent.width;
      this.height = this.parent.height;
      if (rowCount === "boss") {
        rowCount = 1;
        this.boss = true;
      }
      this.game = game;
      this.levelName = levelName;
      this.rowCount = rowCount === "boss" ? 1 : rowCount;
      this.reset();
    }
    start() {
      this.ships = [];
      this.scripts = [];
      const shipCount = this.spawnParade();
      if (this.boss) {
        this.spawnBoss(shipCount * group02.staggerSeconds);
      }
      if (this.levelName) {
        this.scripts.push(new FadeoutBanner(this, this.levelName, group02.bannerMs));
      }
      this.ships.forEach((ship) => this.addChild(ship));
      this.scripts.forEach((script) => {
        script.start();
        this.addChild(script);
      });
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
    spawnParade() {
      const laneYs = this.laneYs();
      const destinations = serpentineDestinations(laneYs);
      const shipCount = group02ShipCount(this.rowCount);
      for (let i = 0;i < shipCount; i++) {
        this.spawnShip(i * group02.staggerSeconds, destinations, group02.pathSpeed);
      }
      this.attachMoneyScripts();
      return shipCount;
    }
    spawnShip(delaySeconds, destinations, speed) {
      const ship = new ArrowShip(this, this.difficultyMultiplier, this.alternateShip);
      ship.position.x = group02.enterX;
      ship.position.y = destinations[0].y;
      this.scripts.push(new FireSingleGunRandomRate(this, ship, {
        initialDelayMs: (delaySeconds + group02.fireDelayPaddingSeconds) * 1000
      }));
      this.scripts.push(buildSerpentineScripts(this, ship, destinations, speed, delaySeconds));
      this.ships.push(ship);
    }
    spawnBoss(delaySeconds) {
      const destinations = serpentineDestinations(this.laneYs());
      const boss = new ArrowBoss(this, this.difficultyMultiplier);
      boss.position.x = group02.enterX;
      boss.position.y = destinations[0].y;
      boss.addChild(new LifeMeter(boss, {
        position: { x: 0, y: 0 },
        length: this.game.width,
        width: 1,
        horizontal: true
      }));
      const fireDelayMs = (delaySeconds + group02.fireDelayPaddingSeconds) * 1000;
      this.scripts.push(new FireSingleGunRandomRate(this, boss, {
        gunIndex: 0,
        initialDelayMs: 0
      }));
      this.scripts.push(new FireSingleGunRandomRate(this, boss, {
        gunIndex: 2,
        initialDelayMs: 0
      }));
      this.scripts.push(new ChainGunFire(this, boss, { gunIndex: 1 }));
      this.scripts.push(buildSerpentineScripts(this, boss, destinations, group02.pathSpeed, delaySeconds));
      this.scripts.push(new WatchForDeath(this, boss, () => {
        bossMoneyPositions(boss.position).forEach((pos) => {
          this.addChild(new MoneyDrop(this, pos));
        });
      }));
      this.ships.push(boss);
    }
    laneYs() {
      const laneCount = group02LaneCount(this.rowCount);
      const lanes = [];
      for (let i = 0;i < laneCount; i++) {
        lanes.push(group02.pathTop + i * group02.laneGap);
      }
      return lanes;
    }
    attachMoneyScripts() {
      const count = moneyDropCount(this.ships.length, this.difficultyMultiplier);
      const selectedShips = sample(this.ships, count);
      selectedShips.forEach((ship) => {
        this.scripts.push(new WatchForDeath(this, ship, () => {
          const pos = ship.position;
          this.addChild(new MoneyDrop(this, { x: pos.x, y: pos.y }));
        }));
      });
    }
  }
  function serpentineDestinations(laneYs) {
    const points = [{ x: group02.pathLeft, y: laneYs[0] }];
    for (let i = 0;i < laneYs.length; i++) {
      const y2 = laneYs[i];
      const goingRight = i % 2 === 0;
      const isLast = i === laneYs.length - 1;
      if (goingRight) {
        points.push({ x: group02.pathRight, y: y2 });
        if (!isLast) {
          points.push({ x: group02.pathRight, y: laneYs[i + 1] });
        }
      } else {
        const leftTarget = isLast ? group02.pathLeft : group02.pathInner;
        points.push({ x: leftTarget, y: y2 });
        if (!isLast) {
          points.push({ x: leftTarget, y: laneYs[i + 1] });
        }
      }
    }
    points.push({ x: group02.pathLeft, y: laneYs[0] });
    return points;
  }
  function travelTime(from, to, speed) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return Math.hypot(dx, dy) / speed;
  }
  function buildSerpentineScripts(level, ship, destinations, speed, delaySeconds) {
    const entry = destinations[0];
    const enterFrom = { x: ship.position.x, y: ship.position.y };
    const loopMoves = [];
    for (let i = 1;i < destinations.length; i++) {
      const from = destinations[i - 1];
      const to = destinations[i];
      loopMoves.push(new MoveObjectToPoint(null, ship, to, travelTime(from, to, speed)));
    }
    return new ScriptChain(level, false, [
      new Wait(null, delaySeconds),
      new MoveObjectToPoint(null, ship, entry, travelTime(enterFrom, entry, speed)),
      new ScriptChain(level, true, loopMoves)
    ]);
  }

  // src/scripts/move-object-in-circle.ts
  function orbitPathOffset(object) {
    return object.orbitPathOffset ?? { x: 0, y: 0 };
  }

  class MoveObjectInCircle extends GameObject {
    object;
    centerX;
    centerY;
    radius;
    angularVelocity;
    angle;
    constructor(parent, object, options) {
      super(parent);
      this.object = object;
      this.centerX = options.center.x;
      this.centerY = options.center.y;
      this.radius = options.radius;
      const direction = options.clockwise ? 1 : -1;
      this.angularVelocity = direction * (2 * Math.PI / options.period);
      this.angle = 0;
    }
    start() {
      const pos = this.object.position;
      const offset = orbitPathOffset(this.object);
      this.angle = Math.atan2(pos.y - offset.y - this.centerY, pos.x - offset.x - this.centerX);
      this.object.velocity.x = 0;
      this.object.velocity.y = 0;
      this.applyPosition();
    }
    update(dtime) {
      if (this.object.destroyed) {
        this.destroy();
        return;
      }
      this.angle += this.angularVelocity * (dtime / 1000);
      this.applyPosition();
    }
    applyPosition() {
      const offset = orbitPathOffset(this.object);
      this.object.position.x = this.centerX + this.radius * Math.cos(this.angle) + offset.x;
      this.object.position.y = this.centerY + this.radius * Math.sin(this.angle) + offset.y;
    }
  }

  // src/balance/group-03.ts
  var group03 = {
    bannerMs: 2000,
    centerX: 100,
    splitY: 60,
    leftOrbit: { x: 55, y: 60 },
    rightOrbit: { x: 145, y: 60 },
    orbitRadius: 45,
    innerOrbitRadius: 33,
    innermostOrbitRadius: 21,
    staggerSeconds: 0.5,
    descentSeconds: 3,
    peelSeconds: 2,
    orbitPeriodSeconds: 8,
    centerProcessionShipCount: 16,
    outerProcessionShipCount: 8,
    innermostProcessionShipCount: 8,
    bossOrbitRadius: 36,
    bossEnterSeconds: 2,
    bossOrbitPeriodSeconds: 6,
    fireDelaySlackSeconds: 2
  };

  // src/levels/level-group-03.ts
  function orbitCenter(orbit) {
    return orbit === "left" ? group03.leftOrbit : group03.rightOrbit;
  }
  function centerOrbitEntryPoint(orbit) {
    const center = orbitCenter(orbit);
    return orbit === "left" ? { x: center.x + group03.orbitRadius, y: center.y } : { x: center.x - group03.orbitRadius, y: center.y };
  }
  function outerOrbitEntryPoint(orbit) {
    const center = orbitCenter(orbit);
    return orbit === "left" ? { x: center.x - group03.innerOrbitRadius, y: center.y } : { x: center.x + group03.innerOrbitRadius, y: center.y };
  }
  function innermostOrbitEntryPoint(orbit) {
    const center = orbitCenter(orbit);
    return orbit === "left" ? { x: center.x + group03.innermostOrbitRadius, y: center.y } : { x: center.x - group03.innermostOrbitRadius, y: center.y };
  }

  class LevelGroup03 extends GameObject {
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
      this.difficultyMultiplier = difficultyMultiplier + (alternateShip ? 1 : 0);
      this.width = this.parent.width;
      this.height = this.parent.height;
      if (rowCount === "boss") {
        rowCount = 1;
        this.boss = true;
      }
      this.game = game;
      this.levelName = levelName;
      this.rowCount = rowCount === "boss" ? 1 : rowCount;
      this.reset();
    }
    start() {
      this.ships = [];
      this.scripts = [];
      this.spawnWave();
      if (this.boss) {
        this.spawnBoss();
      }
      if (this.levelName) {
        this.scripts.push(new FadeoutBanner(this, this.levelName, group03.bannerMs));
      }
      this.ships.forEach((ship) => this.addChild(ship));
      this.scripts.forEach((script) => {
        script.start();
        this.addChild(script);
      });
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
    spawnWave() {
      this.spawnInnermostProcession("left");
      this.spawnInnermostProcession("right");
      if (this.rowCount >= 2) {
        this.spawnOuterProcession("left");
        this.spawnOuterProcession("right");
      }
      if (this.rowCount >= 3) {
        for (let i = 0;i < group03.centerProcessionShipCount; i++) {
          const orbit = i % 2 === 0 ? "left" : "right";
          this.spawnCenterProcessionShip(i, orbit);
        }
      }
      this.attachMoneyScripts();
    }
    spawnCenterProcessionShip(index, orbit) {
      const orbitCenterPoint = orbitCenter(orbit);
      const entryPoint = centerOrbitEntryPoint(orbit);
      const staggerSeconds = index * group03.staggerSeconds;
      const pathSeconds = staggerSeconds + group03.descentSeconds;
      const needsPeel = entryPoint.x !== group03.centerX || entryPoint.y !== group03.splitY;
      this.spawnProcessionShip({
        descentX: group03.centerX,
        staggerSeconds,
        fireDelayMs: (pathSeconds - group03.fireDelaySlackSeconds) * 1000,
        entryPoint,
        orbitCenter: orbitCenterPoint,
        orbitRadius: group03.orbitRadius,
        clockwise: orbit === "left",
        needsPeel
      });
    }
    spawnOuterProcession(orbit) {
      const columnX = outerOrbitEntryPoint(orbit).x;
      for (let i = 0;i < group03.outerProcessionShipCount; i++) {
        const staggerSeconds = i * 2 * group03.staggerSeconds;
        const pathSeconds = staggerSeconds + group03.descentSeconds + group03.peelSeconds;
        this.spawnProcessionShip({
          descentX: columnX,
          staggerSeconds,
          fireDelayMs: (pathSeconds - group03.fireDelaySlackSeconds) * 1000,
          entryPoint: outerOrbitEntryPoint(orbit),
          orbitCenter: orbitCenter(orbit),
          orbitRadius: group03.innerOrbitRadius,
          clockwise: orbit === "right",
          needsPeel: true
        });
      }
    }
    spawnInnermostProcession(orbit) {
      const entryPoint = innermostOrbitEntryPoint(orbit);
      const columnX = entryPoint.x;
      for (let i = 0;i < group03.innermostProcessionShipCount; i++) {
        const staggerSeconds = i * 2 * group03.staggerSeconds;
        const pathSeconds = staggerSeconds + group03.descentSeconds;
        this.spawnProcessionShip({
          descentX: columnX,
          staggerSeconds,
          fireDelayMs: (pathSeconds - group03.fireDelaySlackSeconds) * 1000,
          entryPoint,
          orbitCenter: orbitCenter(orbit),
          orbitRadius: group03.innermostOrbitRadius,
          clockwise: orbit === "left",
          needsPeel: entryPoint.x !== columnX || entryPoint.y !== group03.splitY
        });
      }
    }
    spawnProcessionShip(options) {
      const ship = new ArrowShip(this, this.difficultyMultiplier, this.alternateShip);
      ship.position.x = options.descentX;
      ship.position.y = -20;
      this.scripts.push(new FireSingleGunRandomRate(this, ship, {
        initialDelayMs: options.fireDelayMs
      }));
      this.scripts.push(new ScriptChain(this, false, this.buildShipPath(ship, options.staggerSeconds, options.descentX, options.entryPoint, options.orbitCenter, options.orbitRadius, options.clockwise, options.needsPeel)));
      this.ships.push(ship);
    }
    buildShipPath(ship, staggerSeconds, descentX, entryPoint, orbitCenterPoint, orbitRadius, clockwise, needsPeel) {
      const steps = [];
      if (staggerSeconds > 0) {
        steps.push(new Wait(null, staggerSeconds));
      }
      steps.push(new MoveObjectToPoint(null, ship, { x: descentX, y: group03.splitY }, group03.descentSeconds));
      if (needsPeel) {
        steps.push(new MoveObjectToPoint(null, ship, entryPoint, group03.peelSeconds));
      }
      steps.push(new MoveObjectInCircle(null, ship, {
        center: orbitCenterPoint,
        radius: orbitRadius,
        period: group03.orbitPeriodSeconds,
        clockwise
      }));
      return steps;
    }
    spawnBoss() {
      this.spawnOrbitingBoss("left");
      this.spawnOrbitingBoss("right");
    }
    spawnOrbitingBoss(orbit) {
      const center = orbitCenter(orbit);
      const entryPoint = orbit === "left" ? { x: center.x - group03.bossOrbitRadius, y: center.y } : { x: center.x + group03.bossOrbitRadius, y: center.y };
      const startX = orbit === "left" ? -40 : this.game.width + 20;
      const boss = new ArrowBoss(this, this.difficultyMultiplier);
      boss.enableOrbitPathAlignment();
      const offset = boss.orbitPathOffset;
      boss.position.x = startX + offset.x;
      boss.position.y = center.y + offset.y;
      const halfWidth = Math.floor(this.game.width / 2);
      boss.addChild(new LifeMeter(boss, {
        position: { x: 0, y: 0 },
        anchor: orbit === "left" ? { left: 0, top: 0 } : { left: halfWidth, top: 0 },
        length: halfWidth,
        width: 1,
        horizontal: true,
        mirror: orbit === "left"
      }));
      this.scripts.push(new FireSingleGunRandomRate(this, boss, { gunIndex: 0 }));
      this.scripts.push(new FireSingleGunRandomRate(this, boss, { gunIndex: 2 }));
      this.scripts.push(new ChainGunFire(this, boss, { gunIndex: 1 }));
      this.scripts.push(new ScriptChain(this, false, [
        new MoveObjectToPoint(null, boss, entryPoint, group03.bossEnterSeconds),
        new MoveObjectInCircle(null, boss, {
          center,
          radius: group03.bossOrbitRadius,
          period: group03.bossOrbitPeriodSeconds,
          clockwise: orbit === "right"
        })
      ]));
      this.scripts.push(new WatchForDeath(this, boss, () => {
        bossMoneyPositions(boss.position).forEach((pos) => {
          this.addChild(new MoneyDrop(this, pos));
        });
      }));
      this.ships.push(boss);
    }
    attachMoneyScripts() {
      const count = moneyDropCount(this.ships.length, this.difficultyMultiplier);
      const selectedShips = sample(this.ships, count);
      selectedShips.forEach((ship) => {
        this.scripts.push(new WatchForDeath(this, ship, () => {
          const pos = ship.position;
          this.addChild(new MoneyDrop(this, { x: pos.x, y: pos.y }));
        }));
      });
    }
  }

  // src/sprites/dash-boss.ts
  function buildOrientations() {
    const c1 = "#88eeff";
    const c2 = "#44aacc";
    const c3 = "#226688";
    const w1 = "#eeeeee";
    const g1 = "#999999";
    const g2 = "#555555";
    const nn = null;
    const working = new Sprite([
      [nn, nn, c3, nn, nn, nn, c2, c1, c2, nn, nn, nn, c3, nn, nn],
      [nn, c3, c2, c3, nn, c2, w1, w1, w1, c2, nn, c3, c2, c3, nn],
      [c3, c2, g1, c2, c3, w1, w1, c1, w1, w1, c3, c2, g1, c2, c3],
      [nn, c3, g2, g1, c2, c1, w1, w1, w1, c1, c2, g1, g2, c3, nn],
      [nn, nn, c3, nn, c3, c2, c1, w1, c1, c2, c3, nn, c3, nn, nn],
      [nn, nn, nn, nn, nn, c3, c2, c1, c2, c3, nn, nn, nn, nn, nn],
      [nn, nn, nn, nn, nn, nn, c3, c2, c3, nn, nn, nn, nn, nn, nn],
      [nn, nn, nn, nn, nn, nn, nn, c3, nn, nn, nn, nn, nn, nn, nn]
    ]).rotateRight();
    let guns = [
      { x: 2, y: 4 },
      { x: 7, y: 7 },
      { x: 12, y: 4 }
    ];
    const orientations = [];
    for (let i = 0;i < 4; i++) {
      const cachedGuns = guns.map((g) => ({ x: g.x, y: g.y }));
      const cached = working.clone();
      cached.meta = { guns: cachedGuns };
      orientations.push({ sprite: cached, guns: cachedGuns });
      const sh = working.height;
      guns = guns.map((g) => ({ x: sh - 1 - g.y, y: g.x }));
      working.rotateRight();
    }
    return orientations;
  }
  var dashBossOrientations = buildOrientations();

  // src/ships/dash-boss.ts
  class DashBoss extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = dashBoss.bulletSpeed;
    team = 1;
    index = 5;
    difficultyMultiplier;
    explosion;
    sprite;
    guns;
    position;
    velocity;
    phase = "idle";
    orientationIndex = 0;
    constructor(parent, difficultyMultiplier) {
      super(parent);
      this.difficultyMultiplier = difficultyMultiplier;
      this.reset();
    }
    reset() {
      super.reset();
      this.orientationIndex = 0;
      const orientation = dashBossOrientations[0];
      this.sprite = orientation.sprite;
      this.guns = orientation.guns;
      this.explosion = shipExplosion;
      this.phase = "idle";
      this.position = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      this.damage = dashBoss.contactDamage(this.difficultyMultiplier);
      this.life = dashBoss.life(this.difficultyMultiplier);
      this.maxLife = this.life;
    }
    fire(gunIndex = 0) {
      const gun = this.guns[gunIndex];
      if (!gun)
        return;
      const position = {
        x: this.position.x + gun.x,
        y: this.position.y + gun.y
      };
      const velocity = { x: 0, y: this.BULLET_SPEED };
      this.triggerEvent("spawnBullet", {
        team: this.team,
        position,
        velocity,
        damage: dashBoss.bulletDamage(this.difficultyMultiplier)
      });
      this.addChild(new MuzzleFlash(this, gun));
    }
    spinQuarterLeft() {
      this.applyOrientation((this.orientationIndex + 3) % 4);
    }
    spinQuarterRight() {
      this.applyOrientation((this.orientationIndex + 1) % 4);
    }
    applyOrientation(index) {
      const sw = this.sprite.width;
      const sh = this.sprite.height;
      const cx = this.position.x + sw / 2;
      const cy = this.position.y + sh / 2;
      this.orientationIndex = index;
      const orientation = dashBossOrientations[index];
      this.sprite = orientation.sprite;
      this.guns = orientation.guns;
      this.position.x = cx - this.sprite.width / 2;
      this.position.y = cy - this.sprite.height / 2;
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

  // src/sprites/dash-ship.ts
  function buildOrientations2() {
    const c1 = "#88eeff";
    const c2 = "#44aacc";
    const c3 = "#226688";
    const w1 = "#eeeeee";
    const g1 = "#999999";
    const nn = null;
    const working = new Sprite([
      [nn, nn, c3, c2, c1, c2, c3, nn, nn],
      [nn, c3, c2, w1, w1, w1, c2, c3, nn],
      [c3, c2, g1, c1, w1, c1, g1, c2, c3],
      [nn, c3, nn, c2, c1, c2, nn, c3, nn],
      [nn, nn, nn, nn, c2, nn, nn, nn, nn],
      [nn, nn, nn, nn, c3, nn, nn, nn, nn]
    ]).rotateRight();
    let guns = [{ x: 4, y: 5 }];
    const orientations = [];
    for (let i = 0;i < 4; i++) {
      const cachedGuns = guns.map((g) => ({ x: g.x, y: g.y }));
      const cached = working.clone();
      cached.meta = { guns: cachedGuns };
      orientations.push({ sprite: cached, guns: cachedGuns });
      const sh = working.height;
      guns = guns.map((g) => ({ x: sh - 1 - g.y, y: g.x }));
      working.rotateRight();
    }
    return orientations;
  }
  var dashShipOrientations = buildOrientations2();

  // src/ships/dash-ship.ts
  class DashShip extends GameObject {
    isPhysicalEntity = true;
    BULLET_SPEED = dashScout.bulletSpeed;
    team = 1;
    index = 5;
    difficultyMultiplier;
    explosion;
    sprite;
    gun;
    guns;
    position;
    velocity;
    phase = "idle";
    orientationIndex = 0;
    constructor(parent, difficultyMultiplier) {
      super(parent);
      this.difficultyMultiplier = difficultyMultiplier;
      this.reset();
    }
    reset() {
      super.reset();
      this.orientationIndex = 0;
      const orientation = dashShipOrientations[0];
      this.sprite = orientation.sprite;
      this.guns = orientation.guns;
      this.gun = this.guns[0];
      this.explosion = shipExplosion;
      this.phase = "idle";
      this.position = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
      this.damage = dashScout.contactDamage(this.difficultyMultiplier);
      this.maxLife = dashScout.life(this.difficultyMultiplier);
      this.life = this.maxLife;
    }
    fire(gunIndex = 0) {
      const gun = this.guns[gunIndex] || this.gun;
      const position = {
        x: this.position.x + gun.x,
        y: this.position.y + gun.y
      };
      const velocity = { x: 0, y: this.BULLET_SPEED };
      this.triggerEvent("spawnBullet", {
        team: this.team,
        position,
        velocity,
        damage: dashScout.bulletDamage(this.difficultyMultiplier)
      });
      this.addChild(new MuzzleFlash(this, gun));
    }
    spinQuarterLeft() {
      this.applyOrientation((this.orientationIndex + 3) % 4);
    }
    spinQuarterRight() {
      this.applyOrientation((this.orientationIndex + 1) % 4);
    }
    applyOrientation(index) {
      const sw = this.sprite.width;
      const sh = this.sprite.height;
      const cx = this.position.x + sw / 2;
      const cy = this.position.y + sh / 2;
      this.orientationIndex = index;
      const orientation = dashShipOrientations[index];
      this.sprite = orientation.sprite;
      this.guns = orientation.guns;
      this.gun = this.guns[0];
      this.position.x = cx - this.sprite.width / 2;
      this.position.y = cy - this.sprite.height / 2;
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

  // src/scripts/dash-and-pause.ts
  var TELEGRAPH_QUARTERS = 4;

  class DashAndPause extends GameObject {
    ship;
    bounds;
    dashSpeed;
    pauseSecondsMin;
    pauseSecondsMax;
    telegraphSeconds;
    maxDashDistance;
    minDashDistance;
    initialWaitSecondsMin;
    initialWaitSecondsMax;
    target = null;
    pauseRemaining = 0;
    telegraphElapsed = 0;
    telegraphQuartersDone = 0;
    initialWaitRemaining = 0;
    telegraphSpinRight = false;
    constructor(parent, ship, options) {
      super(parent);
      this.ship = ship;
      this.bounds = options.bounds;
      this.dashSpeed = options.dashSpeed ?? dashAndPause.dashSpeed;
      this.pauseSecondsMin = options.pauseSecondsMin ?? dashAndPause.pauseSecondsMin;
      this.pauseSecondsMax = options.pauseSecondsMax ?? dashAndPause.pauseSecondsMax;
      this.telegraphSeconds = options.telegraphSeconds ?? dashAndPause.telegraphSeconds;
      this.maxDashDistance = options.maxDashDistance ?? dashAndPause.maxDashDistance;
      this.minDashDistance = options.minDashDistance ?? dashAndPause.minDashDistance;
      this.initialWaitSecondsMin = options.initialWaitSecondsMin ?? dashAndPause.initialWaitSecondsMin;
      this.initialWaitSecondsMax = options.initialWaitSecondsMax ?? dashAndPause.initialWaitSecondsMax;
    }
    start() {
      this.ship.phase = "idle";
      this.ship.velocity.x = 0;
      this.ship.velocity.y = 0;
      const minMs = Math.floor(this.initialWaitSecondsMin * 1000);
      const maxMs = Math.floor(this.initialWaitSecondsMax * 1000);
      this.initialWaitRemaining = integer(minMs, maxMs) / 1000;
    }
    update(dtime) {
      if (this.ship.destroyed) {
        this.destroy();
        return;
      }
      const dt = dtime / 1000;
      if (this.ship.phase === "idle") {
        this.initialWaitRemaining -= dt;
        if (this.initialWaitRemaining <= 0) {
          this.beginDash();
        }
        return;
      }
      if (this.ship.phase === "telegraph") {
        this.updateTelegraph(dt);
        return;
      }
      if (this.ship.phase === "pause") {
        this.pauseRemaining -= dt;
        if (this.pauseRemaining <= 0) {
          this.beginDash();
        }
        return;
      }
      if (this.ship.phase === "dash" && this.target) {
        const dx = this.target.x - this.ship.position.x;
        const dy = this.target.y - this.ship.position.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1.5 || this.dashSpeed * dt >= dist) {
          this.ship.position.x = this.target.x;
          this.ship.position.y = this.target.y;
          this.ship.velocity.x = 0;
          this.ship.velocity.y = 0;
          this.beginTelegraph();
          return;
        }
        this.ship.velocity.x = dx / dist * this.dashSpeed;
        this.ship.velocity.y = dy / dist * this.dashSpeed;
      }
    }
    updateTelegraph(dt) {
      this.telegraphElapsed += dt;
      const step = this.telegraphSeconds / TELEGRAPH_QUARTERS;
      while (this.telegraphQuartersDone < TELEGRAPH_QUARTERS && this.telegraphElapsed >= (this.telegraphQuartersDone + 1) * step) {
        if (this.telegraphSpinRight) {
          this.ship.spinQuarterRight();
        } else {
          this.ship.spinQuarterLeft();
        }
        this.telegraphQuartersDone++;
      }
      if (this.telegraphElapsed >= this.telegraphSeconds) {
        this.beginPause();
      }
    }
    beginTelegraph() {
      this.ship.phase = "telegraph";
      this.ship.velocity.x = 0;
      this.ship.velocity.y = 0;
      this.target = null;
      this.telegraphElapsed = 0;
      this.telegraphQuartersDone = 0;
      this.telegraphSpinRight = integer(0, 1) === 1;
    }
    beginPause() {
      this.ship.phase = "pause";
      this.ship.velocity.x = 0;
      this.ship.velocity.y = 0;
      this.target = null;
      const minMs = Math.floor(this.pauseSecondsMin * 1000);
      const maxMs = Math.floor(this.pauseSecondsMax * 1000);
      this.pauseRemaining = integer(minMs, maxMs) / 1000;
    }
    beginDash() {
      this.target = this.pickWaypoint();
      this.ship.phase = "dash";
      const dx = this.target.x - this.ship.position.x;
      const dy = this.target.y - this.ship.position.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.ship.velocity.x = dx / dist * this.dashSpeed;
      this.ship.velocity.y = dy / dist * this.dashSpeed;
    }
    pickWaypoint() {
      const spriteW = this.ship.sprite?.width ?? 8;
      const spriteH = this.ship.sprite?.height ?? 6;
      const left = this.bounds.left;
      const right = Math.max(left, this.bounds.right - spriteW);
      const top = this.bounds.top;
      const bottom = Math.max(top, this.bounds.bottom - spriteH);
      for (let attempt = 0;attempt < 12; attempt++) {
        const x = integer(left, right);
        const y2 = integer(top, bottom);
        const dist = Math.hypot(x - this.ship.position.x, y2 - this.ship.position.y);
        if (dist >= this.minDashDistance && dist <= this.maxDashDistance) {
          return { x, y: y2 };
        }
      }
      return {
        x: integer(left, right),
        y: integer(top, bottom)
      };
    }
  }

  // src/scripts/fire-burst-on-pause.ts
  class FireBurstOnPause extends GameObject {
    ship;
    gunIndex;
    burstSize;
    fireRateMs;
    windupMs;
    lastPhase = "idle";
    shotsRemaining = 0;
    cooldown = 0;
    windup = 0;
    armed = false;
    constructor(parent, ship, options) {
      super(parent);
      const opts = options || {};
      this.ship = ship;
      this.gunIndex = opts.gunIndex ?? 0;
      this.burstSize = opts.burstSize ?? burstOnPause.burstSize;
      this.fireRateMs = opts.fireRateMs ?? burstOnPause.fireRateMs;
      this.windupMs = opts.windupMs ?? burstOnPause.windupMs;
    }
    start() {
      this.lastPhase = this.ship.phase;
      this.shotsRemaining = 0;
      this.armed = false;
    }
    update(dtime) {
      if (this.ship.destroyed) {
        this.destroy();
        return;
      }
      if (this.ship.phase === "pause" && this.lastPhase !== "pause") {
        this.armBurst();
      }
      if (this.ship.phase !== "pause") {
        this.armed = false;
        this.shotsRemaining = 0;
      }
      this.lastPhase = this.ship.phase;
      if (!this.armed || this.shotsRemaining <= 0) {
        return;
      }
      if (this.windup > 0) {
        this.windup -= dtime;
        return;
      }
      this.cooldown -= dtime;
      if (this.cooldown <= 0) {
        this.ship.fire(this.gunIndex);
        this.shotsRemaining--;
        this.cooldown = this.fireRateMs;
        if (this.shotsRemaining <= 0) {
          this.armed = false;
        }
      }
    }
    armBurst() {
      this.armed = true;
      this.shotsRemaining = this.burstSize;
      this.windup = this.windupMs;
      this.cooldown = 0;
    }
  }

  // src/balance/group-04.ts
  var group04 = {
    bannerMs: 2000,
    shipCountBase: 4,
    shipCountPerTier: 3,
    boundsLeft: 8,
    boundsRightInset: 8,
    boundsTop: 12,
    boundsBottomFraction: 0.55,
    bossBoundsBottomFraction: 0.45,
    scout: {
      dashSpeed: 130,
      pauseSecondsMin: 0.55,
      pauseSecondsMax: 1.2,
      minDashDistance: 28,
      maxDashDistance: 75,
      burstFireRateMs: 110,
      burstSizeRowBonus: 3
    },
    boss: {
      dashSpeed: 95,
      pauseSecondsMin: 0.8,
      pauseSecondsMax: 1.6,
      minDashDistance: 35,
      maxDashDistance: 90,
      spawnY: -30,
      bursts: [
        { gunIndex: 0, burstSize: 4, fireRateMs: 90 },
        { gunIndex: 1, burstSize: 5, fireRateMs: 70, windupMs: 40 },
        { gunIndex: 2, burstSize: 4, fireRateMs: 90 }
      ]
    },
    entryWaitOpenerMin: 1,
    entryWaitOpenerMax: 10,
    entryWaitFollowUpMin: 0.5,
    entryWaitFollowUpMax: 5
  };
  function group04ShipCount(rowCount) {
    return group04.shipCountBase + rowCount * group04.shipCountPerTier;
  }

  // src/levels/level-group-04.ts
  class LevelGroup04 extends GameObject {
    difficultyMultiplier;
    width;
    height;
    boss;
    game;
    levelName;
    rowCount;
    ships;
    scripts;
    constructor(parent, game, difficultyMultiplier, _unusedAlternate, rowCount, levelName) {
      super(parent);
      this.difficultyMultiplier = difficultyMultiplier;
      this.width = this.parent.width;
      this.height = this.parent.height;
      if (rowCount === "boss") {
        rowCount = 1;
        this.boss = true;
      }
      this.game = game;
      this.levelName = levelName;
      this.rowCount = typeof rowCount === "number" ? rowCount : 1;
      this.reset();
    }
    start() {
      this.ships = [];
      this.scripts = [];
      this.spawnWave();
      if (this.boss) {
        this.spawnBoss();
      }
      if (this.levelName) {
        this.scripts.push(new FadeoutBanner(this, this.levelName, group04.bannerMs));
      }
      this.ships.forEach((ship) => this.addChild(ship));
      this.scripts.forEach((script) => {
        script.start();
        this.addChild(script);
      });
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
    playBounds() {
      return {
        left: group04.boundsLeft,
        right: this.game.width - group04.boundsRightInset,
        top: group04.boundsTop,
        bottom: Math.floor(this.game.height * group04.boundsBottomFraction)
      };
    }
    entryWaitOptions() {
      if (this.levelName) {
        return {
          initialWaitSecondsMin: group04.entryWaitOpenerMin,
          initialWaitSecondsMax: group04.entryWaitOpenerMax
        };
      }
      return {
        initialWaitSecondsMin: group04.entryWaitFollowUpMin,
        initialWaitSecondsMax: group04.entryWaitFollowUpMax
      };
    }
    spawnWave() {
      const count = group04ShipCount(this.rowCount);
      const bounds = this.playBounds();
      const entryWait = this.entryWaitOptions();
      const scout = group04.scout;
      for (let i = 0;i < count; i++) {
        const ship = new DashShip(this, this.difficultyMultiplier);
        ship.position.x = 20 + i * 37 % Math.max(1, bounds.right - 40);
        ship.position.y = -20 - i % 5 * 12;
        this.scripts.push(new DashAndPause(this, ship, {
          bounds,
          dashSpeed: scout.dashSpeed,
          pauseSecondsMin: scout.pauseSecondsMin,
          pauseSecondsMax: scout.pauseSecondsMax,
          minDashDistance: scout.minDashDistance,
          maxDashDistance: scout.maxDashDistance,
          ...entryWait
        }));
        this.scripts.push(new FireBurstOnPause(this, ship, {
          burstSize: integer(1, this.rowCount + scout.burstSizeRowBonus),
          fireRateMs: scout.burstFireRateMs
        }));
        this.ships.push(ship);
      }
      this.attachMoneyScripts();
    }
    spawnBoss() {
      const bounds = this.playBounds();
      const entryWait = this.entryWaitOptions();
      const bossTuning = group04.boss;
      const boss = new DashBoss(this, this.difficultyMultiplier);
      boss.position.x = Math.floor(this.game.width / 2) - 7;
      boss.position.y = bossTuning.spawnY;
      boss.addChild(new LifeMeter(boss, {
        position: { x: 0, y: 0 },
        length: this.game.width,
        width: 1,
        horizontal: true
      }));
      this.scripts.push(new DashAndPause(this, boss, {
        bounds: {
          ...bounds,
          bottom: Math.floor(this.game.height * group04.bossBoundsBottomFraction)
        },
        dashSpeed: bossTuning.dashSpeed,
        pauseSecondsMin: bossTuning.pauseSecondsMin,
        pauseSecondsMax: bossTuning.pauseSecondsMax,
        minDashDistance: bossTuning.minDashDistance,
        maxDashDistance: bossTuning.maxDashDistance,
        ...entryWait
      }));
      for (const burst of bossTuning.bursts) {
        this.scripts.push(new FireBurstOnPause(this, boss, { ...burst }));
      }
      this.scripts.push(new WatchForDeath(this, boss, () => {
        bossMoneyPositions(boss.position).forEach((pos) => {
          this.addChild(new MoneyDrop(this, pos));
        });
      }));
      this.ships.push(boss);
    }
    attachMoneyScripts() {
      const count = moneyDropCount(this.ships.length, this.difficultyMultiplier);
      if (count < 1)
        return;
      sample(this.ships, count).forEach((ship) => {
        this.scripts.push(new WatchForDeath(this, ship, () => {
          const pos = ship.position;
          this.addChild(new MoneyDrop(this, { x: pos.x, y: pos.y }));
        }));
      });
    }
  }

  // src/levels/shop.ts
  var LIST_BASE_Y = 35;
  var LIST_ROW_STRIDE = 15;
  var LIST_LABEL_X = 70;
  var LIST_COST_X = 40;
  var LEAVE_LABEL_X = 40;
  var PROGRESS_RIGHT_X2 = 182;
  var TAB_Y2 = 12;
  var SHIP_TAB_START_X2 = 100;
  var SHIP_TAB_STRIDE2 = 22;

  class Shop extends GameObject {
    isShop = true;
    index = 1;
    disabledColor = "#777";
    game;
    bank;
    player;
    input;
    tabChrome = [];
    activeTabIndex = 0;
    rows = [];
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
        onLeft: this.onLeft.bind(this),
        onRight: this.onRight.bind(this),
        onSelect: this.onSelect.bind(this)
      });
      this.reset();
    }
    get activeTab() {
      return shopTabs[this.activeTabIndex].id;
    }
    reset() {
      super.reset();
      this.input.reset();
      this.isDoneShopping = false;
      this.selectedMenuItem = 0;
      this.activeTabIndex = 0;
      this.rows = [];
      this.tabChrome = [];
      this.createSelectorShip();
      this.createTabChrome();
      this.rebuildRows();
      this.addChild(this.input);
    }
    start() {
      this.input.reset();
      this.isDoneShopping = false;
      this.refreshTabChrome();
      this.refreshRows();
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
    createTabChrome() {
      let shipTabIndex = 0;
      this.tabChrome = shopTabs.map((def) => {
        if (def.kind === "text") {
          const labelText = def.label || "";
          const labelX = 8;
          const label = new TextDisplay(this, {
            font: "arcade-small",
            message: labelText,
            position: { x: labelX, y: TAB_Y2 },
            color: this.game.interfaceColor
          });
          this.addChild(label);
          const leftBracket2 = new TextDisplay(this, {
            font: "arcade-small",
            message: "[",
            position: { x: labelX - 5, y: TAB_Y2 },
            color: this.game.interfaceColor
          });
          const rightBracket2 = new TextDisplay(this, {
            font: "arcade-small",
            message: "]",
            position: {
              x: labelX + (label.width || 0) + 1,
              y: TAB_Y2
            },
            color: this.game.interfaceColor
          });
          this.addChild(leftBracket2);
          this.addChild(rightBracket2);
          return { def, label, leftBracket: leftBracket2, rightBracket: rightBracket2 };
        }
        const shipId = def.shipId;
        const sprite = PlayerControlledShip.spriteForShipId(shipId);
        const x = SHIP_TAB_START_X2 + shipTabIndex * SHIP_TAB_STRIDE2;
        shipTabIndex++;
        const shipIcon = new GameObject;
        shipIcon.sprite = sprite;
        shipIcon.position = { x, y: TAB_Y2 - 2 };
        shipIcon.index = 2;
        this.addChild(shipIcon);
        const leftBracket = new TextDisplay(this, {
          font: "arcade-small",
          message: "[",
          position: { x: x - 5, y: TAB_Y2 },
          color: this.game.interfaceColor
        });
        const rightBracket = new TextDisplay(this, {
          font: "arcade-small",
          message: "]",
          position: { x: x + sprite.width + 1, y: TAB_Y2 },
          color: this.game.interfaceColor
        });
        this.addChild(leftBracket);
        this.addChild(rightBracket);
        return { def, shipIcon, leftBracket, rightBracket };
      });
      this.refreshTabChrome();
    }
    refreshTabChrome() {
      this.tabChrome.forEach((tab, index) => {
        const active = index === this.activeTabIndex;
        if (tab.def.kind === "text" && tab.label) {
          tab.label.updateColor(active ? this.game.interfaceColor : this.disabledColor);
        } else {
          const shipId = tab.def.shipId;
          const unlocked = this.player.isShipUnlocked(shipId);
          if (tab.shipIcon) {
            tab.shipIcon.sprite = PlayerControlledShip.spriteForShipId(shipId);
            if (!unlocked) {
              tab.shipIcon.sprite.applyColor(this.disabledColor);
            }
          }
        }
        if (tab.leftBracket && tab.rightBracket) {
          tab.leftBracket.changeMessage(active ? "[" : " ");
          tab.rightBracket.changeMessage(active ? "]" : " ");
          tab.leftBracket.updateColor(this.game.interfaceColor);
          tab.rightBracket.updateColor(this.game.interfaceColor);
        }
      });
    }
    clearRows() {
      this.rows.forEach((row) => {
        if (row.description) {
          this.removeChild(row.description);
        }
        if (row.costText) {
          this.removeChild(row.costText);
        }
        if (row.progressOrbs) {
          this.removeChild(row.progressOrbs);
        }
      });
      this.rows = [];
    }
    showsProgressOrbs(upgrade) {
      return upgrade.maxRanks !== null && upgrade.id !== "unlock";
    }
    rebuildRows() {
      this.clearRows();
      const upgrades = upgradesForTab(this.activeTab, (shipId) => this.player.isShipUnlocked(shipId));
      this.rows = [
        ...upgrades.map((upgrade) => ({
          kind: "upgrade",
          upgrade,
          cost: null
        })),
        { kind: "leave", cost: null }
      ];
      this.rows.forEach((row, index) => {
        const y2 = LIST_BASE_Y + index * LIST_ROW_STRIDE;
        const labelX = row.kind === "leave" ? LEAVE_LABEL_X : LIST_LABEL_X;
        row.description = new TextDisplay(this, {
          font: "arcade-small",
          message: " ",
          position: { x: labelX, y: y2 },
          color: this.game.interfaceColor,
          isPhysicalEntity: true
        });
        this.addChild(row.description);
        if (row.kind === "upgrade") {
          row.costText = new TextDisplay(this, {
            font: "arcade-small",
            message: "",
            position: { x: LIST_COST_X, y: y2 },
            color: this.game.interfaceColor,
            isPhysicalEntity: true
          });
          this.addChild(row.costText);
          if (row.upgrade && this.showsProgressOrbs(row.upgrade)) {
            row.progressOrbs = new UpgradeProgressOrbs(this, PROGRESS_RIGHT_X2, y2);
            this.addChild(row.progressOrbs);
          }
        }
      });
      if (this.selectedMenuItem >= this.rows.length) {
        this.selectedMenuItem = Math.max(0, this.rows.length - 1);
      }
      this.refreshRows();
      this.updateSelectorPosition();
    }
    ownedRank(upgrade) {
      const player = this.player;
      switch (upgrade.id) {
        case "fullHeal":
          return player.fullHealPurchases;
        case "health":
          return player.lifeUpgrades;
        case "energyShield":
          return player.energyShield;
        case "bomb":
          return player.bombs;
        case "maxHealth":
          return player.profileFor(upgrade.tab).maxHealthRanks;
        case "armor":
          return player.profileFor(upgrade.tab).armorRanks;
        case "bombCapacity":
          return player.profileFor(upgrade.tab).bombCapacityRanks;
        case "shipSpeed":
          return player.profileFor(upgrade.tab).shipSpeedRanks;
        case "fireSpeed":
          return player.profileFor(upgrade.tab).fireSpeedRanks;
        case "damage":
          return player.profileFor(upgrade.tab).damageRanks;
        case "combo":
          return player.profileFor(upgrade.tab).comboUpgrades;
        case "unlock": {
          const shipId = upgrade.tab;
          return player.isShipUnlocked(shipId) ? 1 : 0;
        }
      }
    }
    rowLabel(upgrade, owned, maxed) {
      if (upgrade.id === "combo") {
        if (maxed)
          return "Combo maxed";
        if (owned === 0)
          return "Unlock Combo";
        return upgrade.label;
      }
      if (upgrade.id === "unlock") {
        return maxed ? "Unlocked" : upgrade.label;
      }
      return upgrade.label;
    }
    refreshRows() {
      this.rows.forEach((row) => {
        if (row.kind === "leave") {
          row.description.changeMessage("Leave Shop");
          row.description.updateColor(this.game.interfaceColor);
          return;
        }
        const upgrade = row.upgrade;
        const owned = this.ownedRank(upgrade);
        const cost = nextUpgradeCost(upgrade, owned);
        row.cost = cost;
        const bombUnavailable = upgrade.id === "bomb" && !this.player.canPurchaseBomb();
        const fullHealUnavailable = upgrade.id === "fullHeal" && !this.player.canPurchaseFullHeal();
        const maxed = cost === null || bombUnavailable || fullHealUnavailable;
        row.description.changeMessage(this.rowLabel(upgrade, owned, maxed));
        row.description.updateColor(maxed ? this.disabledColor : this.game.interfaceColor);
        if (row.costText) {
          row.costText.changeMessage(maxed ? "--" : "$" + cost);
          row.costText.updateColor(maxed || cost > this.bank.value ? this.disabledColor : this.game.interfaceColor);
        }
        if (row.progressOrbs && upgrade.maxRanks !== null) {
          row.progressOrbs.setProgress(owned, upgrade.maxRanks);
        }
      });
    }
    createSelectorShip() {
      this.selectorShip = new GameObject;
      this.selectorShip.sprite = arrowShipSprite();
      this.selectorShip.position = { x: 20, y: 0 };
      this.addChild(this.selectorShip);
      this.updateSelectorPosition();
    }
    updateSelectorPosition() {
      this.selectorShip.position.y = LIST_BASE_Y + this.selectedMenuItem * LIST_ROW_STRIDE;
    }
    setActiveTab(index) {
      if (index < 0 || index >= shopTabs.length || index === this.activeTabIndex) {
        return;
      }
      this.activeTabIndex = index;
      this.selectedMenuItem = 0;
      this.refreshTabChrome();
      this.rebuildRows();
    }
    onUp() {
      if (!this.selecting && this.selectedMenuItem > 0) {
        this.selectedMenuItem--;
        this.updateSelectorPosition();
      }
    }
    onDown() {
      if (!this.selecting && this.selectedMenuItem < this.rows.length - 1) {
        this.selectedMenuItem++;
        this.updateSelectorPosition();
      }
    }
    onLeft() {
      if (!this.selecting) {
        this.setActiveTab(this.activeTabIndex - 1);
      }
    }
    onRight() {
      if (!this.selecting) {
        this.setActiveTab(this.activeTabIndex + 1);
      }
    }
    onSelect() {
      if (this.selecting) {
        return;
      }
      const row = this.rows[this.selectedMenuItem];
      if (!row) {
        return;
      }
      if (row.kind === "leave") {
        this.startPurchaseAnimation();
        return;
      }
      const cost = row.cost;
      if (cost !== null && this.bank.value >= cost && !(row.upgrade?.id === "bomb" && !this.player.canPurchaseBomb()) && !(row.upgrade?.id === "fullHeal" && !this.player.canPurchaseFullHeal())) {
        this.bank.removeMoney(cost);
        this.game.recordDollarsSpent(cost);
        this.startPurchaseAnimation();
      }
    }
    startPurchaseAnimation() {
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
    applyUpgrade(id, tab) {
      const shipId = tab;
      switch (id) {
        case "fullHeal":
          this.player.purchaseFullHeal();
          break;
        case "health":
          this.player.purchaseRunHealth();
          break;
        case "energyShield":
          this.player.purchaseEnergyShield();
          break;
        case "bomb":
          this.player.purchaseBomb();
          break;
        case "maxHealth":
          this.player.purchaseMaxHealth(shipId);
          break;
        case "armor":
          this.player.purchaseArmor(shipId);
          break;
        case "bombCapacity":
          this.player.purchaseBombCapacity(shipId);
          break;
        case "shipSpeed":
          this.player.purchaseShipSpeed(shipId);
          break;
        case "fireSpeed":
          this.player.purchaseFireSpeed(shipId);
          break;
        case "damage":
          this.player.purchaseDamage(shipId);
          break;
        case "combo":
          this.player.purchaseCombo(shipId);
          if (shipId === this.player.activeShipId) {
            this.game.comboGauge.syncFromPlayer();
          }
          break;
        case "unlock":
          this.player.unlockShip(shipId);
          this.refreshTabChrome();
          this.rebuildRows();
          break;
      }
    }
    propagateSelection() {
      const row = this.rows[this.selectedMenuItem];
      if (!row) {
        this.selecting = false;
        return;
      }
      if (row.kind === "leave") {
        this.isDoneShopping = true;
      } else if (row.upgrade) {
        this.applyUpgrade(row.upgrade.id, row.upgrade.tab);
      }
      this.refreshRows();
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
    hangar;
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
      this.hangar = new Hangar(this, this.game);
      this.shop = new Shop(this, this.game);
      this.loadLevels();
    }
    loadLevels() {
      this.levels = [
        this.hangar,
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 2),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 3),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, 4),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, false, "boss"),
        this.shop,
        new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
        new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 2),
        new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 3),
        new LevelGroup02(this, this.game, this.difficultyMultiplier, false, 4),
        new LevelGroup02(this, this.game, this.difficultyMultiplier, false, "boss"),
        this.shop,
        new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
        new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 2),
        new LevelGroup03(this, this.game, this.difficultyMultiplier, false, 3),
        new LevelGroup03(this, this.game, this.difficultyMultiplier, false, "boss"),
        this.shop,
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 2),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 3),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, 4),
        new LevelGroup01(this, this.game, this.difficultyMultiplier, true, "boss"),
        this.shop,
        new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
        new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 2),
        new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 3),
        new LevelGroup02(this, this.game, this.difficultyMultiplier, true, 4),
        new LevelGroup02(this, this.game, this.difficultyMultiplier, true, "boss"),
        this.shop,
        new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 1, this.levelName()),
        new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 2),
        new LevelGroup03(this, this.game, this.difficultyMultiplier, true, 3),
        new LevelGroup03(this, this.game, this.difficultyMultiplier, true, "boss"),
        this.shop,
        new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 1, this.levelName()),
        new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 2),
        new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 3),
        new LevelGroup04(this, this.game, this.difficultyMultiplier, false, 4),
        new LevelGroup04(this, this.game, this.difficultyMultiplier, false, "boss"),
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
      const previousLevel = this.levelIndex > 0 ? this.levels[this.levelIndex - 1] : null;
      const cameFromShop = !!previousLevel?.isShop;
      if (this.currentLevel.isShop) {
        this.game.clearBullets();
        this.clearFlyInScripts();
        this.player.hideOffscreen();
      } else if (this.currentLevel.levelName || cameFromShop) {
        this.addChild(new FlyPlayerInFromBottom(this, this.game).start());
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
    clearFlyInScripts() {
      this.children.filter((child) => child instanceof FlyPlayerInFromBottom).forEach((child) => {
        this.removeChild(child);
      });
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

  // src/models/run-stats.ts
  class RunStats {
    pointsEarned = 0;
    enemiesDestroyed = 0;
    dollarsCollected = 0;
    dollarsSpent = 0;
    reset() {
      this.pointsEarned = 0;
      this.enemiesDestroyed = 0;
      this.dollarsCollected = 0;
      this.dollarsSpent = 0;
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
    runStats;
    gameOver = false;
    paused = false;
    runsCompleted = 0;
    gameOverCallback;
    activeBomb = null;
    constructor(options) {
      super(null);
      this.width = options.width;
      this.height = options.height;
      this.runStats = new RunStats;
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
        position: { x: 1, y: 0 },
        anchorBottom: this.height - 7,
        color: this.interfaceColor,
        player: this.player
      });
      this.lifeMeter = new LifeMeter(this.player, {
        scale: 1,
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
      this.player.reset();
      const save = loadSave();
      if (save) {
        applySave(this, save);
      }
      this.titleScreen.reset(this.runsCompleted, this.hasMetaProgress());
      this.gameOverScreen.reset();
      this.levelManager.reset();
      this.addChild(this.player);
      this.addChild(this.levelManager);
      this.addChild(this.titleScreen);
      this.addChild(this.pauseInputTracker);
    }
    hasMetaProgress() {
      return this.runsCompleted > 0 || hangarHasMetaProgress(this.player.shipHangar);
    }
    persistMeta() {
      writeSave(captureSave(this));
    }
    resetMetaProgress() {
      clearSave();
      this.runsCompleted = 0;
      this.player.shipHangar = createStarterHangar();
      this.titleScreen.reset(0, false);
    }
    clearBullets() {
      this.children.filter(function(entity) {
        return entity.type === "bullet";
      }).forEach(function(bullet) {
        this.removeChild(bullet);
      }.bind(this));
    }
    clearBombs() {
      this.activeBomb = null;
      this.children.filter(function(entity) {
        return entity.type === "bomb";
      }).forEach(function(bomb) {
        this.removeChild(bomb);
      }.bind(this));
    }
    startNewGame() {
      this.runStats.reset();
      this.bank.resetForRun();
      this.comboGauge.reset();
      this.player.resetForNewRun();
      this.levelManager.reset();
      this.clearBombs();
      this.lifeMeter.reset();
      this.addChild(this.bank);
      this.addChild(this.comboGauge);
      this.addChild(this.lifeMeter);
      this.levelManager.start();
    }
    finishGame() {
      this.runsCompleted++;
      this.persistMeta();
      if (this.gameOverCallback) {
        this.gameOverCallback({
          score: this.comboGauge.getScore(),
          level: this.levelManager.levelNameCounter
        });
        this.destroy();
      } else {
        this.returnToMenu();
      }
    }
    returnToMenu() {
      this.gameOver = false;
      this.paused = false;
      this.removeChild(this.gameOverScreen);
      this.removeChild(this.bank);
      this.removeChild(this.comboGauge);
      this.removeChild(this.lifeMeter);
      this.levelManager.stop();
      this.clearBullets();
      this.clearBombs();
      this.gameOverScreen.reset();
      this.titleScreen.reset(this.runsCompleted, this.hasMetaProgress());
      if (!this.children.includes(this.player)) {
        this.addChild(this.player);
      }
      if (!this.children.includes(this.titleScreen)) {
        this.addChild(this.titleScreen);
      }
      this.player.resetForNewRun();
    }
    recordDollarsSpent(amount) {
      this.runStats.dollarsSpent += amount;
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
      pairs.forEach((pair) => {
        const a = pair[0];
        const b = pair[1];
        if (!spriteCollision(a, b)) {
          return;
        }
        if (a.type === "bomb" || b.type === "bomb") {
          const bomb = a.type === "bomb" ? a : b;
          const other = a.type === "bomb" ? b : a;
          if (other.type === "bullet") {
            return;
          }
          if (other.team !== 0 && other.type !== "pickup") {
            bomb.detonate();
          }
          return;
        }
        a.applyDamage(b.damage, b);
        b.applyDamage(a.damage, a);
      });
    }
    checkGameOver() {
      const gameResult = this.player.destroyed ? "loss" : this.levelManager.complete ? "win" : null;
      if (gameResult && !this.gameOver) {
        this.gameOver = true;
        this.runStats.pointsEarned = this.comboGauge.getScore();
        this.gameOverScreen.setResult(gameResult);
        this.gameOverScreen.setRunStats(this.runStats);
        this.removeChild(this.player);
        this.addChild(this.gameOverScreen);
      }
    }
    spawnBullet(data) {
      this.addChild(new Bullet(this, data));
    }
    spawnBomb(data) {
      if (this.activeBomb && !this.activeBomb.destroyed && !this.activeBomb.exploding) {
        return;
      }
      const bomb = new Bomb(this, data);
      this.activeBomb = bomb;
      this.addChild(bomb);
    }
    detonateBomb() {
      if (this.activeBomb && !this.activeBomb.destroyed && !this.activeBomb.exploding) {
        this.activeBomb.detonate();
      }
    }
    bombCleared(bomb) {
      if (this.activeBomb === bomb) {
        this.activeBomb = null;
      }
    }
    applyBombBlast(data) {
      const entities = collectEntities(this, this.physicalEntityMatcher);
      entities.forEach((entity) => {
        if (entity === data.source) {
          return;
        }
        if (circleIntersectsBox(data.center.x, data.center.y, data.radius, entity)) {
          entity.applyDamage(data.damage, data.source);
        }
      });
    }
    enemyDestroyed(data) {
      this.runStats.enemiesDestroyed++;
      this.comboGauge.addPoints(data.shipValue);
    }
    enemyHit() {
      this.comboGauge.bumpCombo();
    }
    playerHit() {
      this.comboGauge.clearCombo();
    }
    moneyCollected(value) {
      const amount = value * this.comboGauge.getMultiplier();
      this.runStats.dollarsCollected += amount;
      this.bank.addMoney(amount);
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
  var renderer = new WebGLRenderer(gameDimensions);
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
  var landscapeFullscreenSettled = false;
  function isLandscape() {
    return window.matchMedia("(orientation: landscape)").matches;
  }
  function requestLandscapeFullscreen() {
    if (landscapeFullscreenSettled || !isLandscape()) {
      return;
    }
    const doc = document;
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      landscapeFullscreenSettled = true;
      return;
    }
    const root = document.documentElement;
    const request = root.requestFullscreen?.bind(root) ?? root.webkitRequestFullscreen?.bind(root);
    if (!request) {
      landscapeFullscreenSettled = true;
      return;
    }
    Promise.resolve(request()).then(function() {
      landscapeFullscreenSettled = true;
    }).catch(function() {
      landscapeFullscreenSettled = true;
    });
  }
  document.addEventListener("pointerdown", requestLandscapeFullscreen, { passive: true });
  document.addEventListener("keydown", requestLandscapeFullscreen);
  runLoop.start();
  window.activeGame = phoenix;
})();
