import Frame from './frame.js';

function maximumPixelSize(width: number, height: number): number {
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;
    let pixelSize = 1;
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

function createCanvasEl(dimensions: WebGLRenderer): HTMLCanvasElement {
    dimensions.fullWidth = dimensions.width * dimensions.pixelSize;
    dimensions.fullHeight = dimensions.height * dimensions.pixelSize;

    const el = document.createElement('canvas');
    el.width = dimensions.fullWidth;
    el.height = dimensions.fullHeight;
    el.classList.add('pixel-engine-canvas');

    return el;
}

const VERTEX_SHADER_SOURCE = `
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

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`;

// Per-instance layout: (cellX, cellY, r, g, b)
const INSTANCE_FLOATS = 5;
const INSTANCE_STRIDE_BYTES = INSTANCE_FLOATS * 4;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('WebGL shader compile failed: ' + info);
    }
    return shader;
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error('WebGL program link failed: ' + info);
    }
    return program;
}

export default class WebGLRenderer {
    width = 80;
    height = 50;
    pixelSize = 1;
    fullWidth!: number;
    fullHeight!: number;
    nextFrame = 0;
    container!: HTMLElement;
    canvas!: HTMLCanvasElement;
    frames!: Frame[];

    private gl!: WebGLRenderingContext;
    private isWebGL2 = false;
    private instancedExt: ANGLE_instanced_arrays | null = null;
    private program!: WebGLProgram;
    private quadBuffer!: WebGLBuffer;
    private instanceBuffer!: WebGLBuffer;
    private instanceData!: Float32Array;
    private aQuadLoc = 0;
    private aInstancePosLoc = 0;
    private aInstanceColorLoc = 0;
    private uResolutionLoc!: WebGLUniformLocation;
    private uPixelSizeLoc!: WebGLUniformLocation;
    private colorCache = new Map<string, [number, number, number]>();
    private colorParseCanvas: HTMLCanvasElement | null = null;
    private colorParseCtx: CanvasRenderingContext2D | null = null;

    constructor(options?: { width?: number; height?: number; container?: HTMLElement }) {
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

    private initGL(): void {
        const gl2 = this.canvas.getContext('webgl2') as WebGL2RenderingContext | null;
        if (gl2) {
            this.gl = gl2 as unknown as WebGLRenderingContext;
            this.isWebGL2 = true;
        } else {
            const gl1 = this.canvas.getContext('webgl', { alpha: false }) as WebGLRenderingContext | null;
            if (!gl1) {
                throw new Error('WebGL is not supported in this browser');
            }
            this.gl = gl1;
            this.instancedExt = gl1.getExtension('ANGLE_instanced_arrays');
            if (!this.instancedExt) {
                throw new Error('ANGLE_instanced_arrays extension is required but not supported');
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

        this.aQuadLoc = gl.getAttribLocation(this.program, 'aQuad');
        this.aInstancePosLoc = gl.getAttribLocation(this.program, 'aInstancePos');
        this.aInstanceColorLoc = gl.getAttribLocation(this.program, 'aInstanceColor');
        this.uResolutionLoc = gl.getUniformLocation(this.program, 'uResolution')!;
        this.uPixelSizeLoc = gl.getUniformLocation(this.program, 'uPixelSize')!;
        gl.uniform2f(this.uResolutionLoc, this.fullWidth, this.fullHeight);
        gl.uniform1f(this.uPixelSizeLoc, this.pixelSize);

        this.quadBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.aQuadLoc);
        gl.vertexAttribPointer(this.aQuadLoc, 2, gl.FLOAT, false, 0, 0);

        const maxInstances = this.width * this.height;
        this.instanceData = new Float32Array(maxInstances * INSTANCE_FLOATS);
        this.instanceBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.instanceData.byteLength, gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(this.aInstancePosLoc);
        gl.vertexAttribPointer(this.aInstancePosLoc, 2, gl.FLOAT, false, INSTANCE_STRIDE_BYTES, 0);
        this.setAttribDivisor(this.aInstancePosLoc, 1);

        gl.enableVertexAttribArray(this.aInstanceColorLoc);
        gl.vertexAttribPointer(this.aInstanceColorLoc, 3, gl.FLOAT, false, INSTANCE_STRIDE_BYTES, 2 * 4);
        this.setAttribDivisor(this.aInstanceColorLoc, 1);
    }

    private setAttribDivisor(loc: number, divisor: number): void {
        if (this.isWebGL2) {
            (this.gl as unknown as WebGL2RenderingContext).vertexAttribDivisor(loc, divisor);
        } else if (this.instancedExt) {
            this.instancedExt.vertexAttribDivisorANGLE(loc, divisor);
        }
    }

    private drawInstanced(count: number): void {
        const gl = this.gl;
        if (this.isWebGL2) {
            (gl as unknown as WebGL2RenderingContext).drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
        } else if (this.instancedExt) {
            this.instancedExt.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, count);
        }
    }

    // Parse any CSS color string into normalized [r, g, b] using a 1x1 offscreen
    // canvas. Cached so each unique color string is parsed at most once.
    private parseColor(color: string): [number, number, number] {
        const cached = this.colorCache.get(color);
        if (cached) {
            return cached;
        }
        if (!this.colorParseCanvas) {
            this.colorParseCanvas = document.createElement('canvas');
            this.colorParseCanvas.width = 1;
            this.colorParseCanvas.height = 1;
            this.colorParseCtx = this.colorParseCanvas.getContext('2d')!;
        }
        const ctx = this.colorParseCtx!;
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = color || '#000000';
        ctx.fillRect(0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        const rgb: [number, number, number] = [data[0] / 255, data[1] / 255, data[2] / 255];
        this.colorCache.set(color, rgb);
        return rgb;
    }

    newRenderFrame(): Frame {
        return this.frames[this.nextFrame];
    }

    renderFrame(_?: Frame): void {
        const frame = this.frames[this.nextFrame];
        const fillColor = frame.fillColor || '#000000';
        const fillRGB = this.parseColor(fillColor);
        const gl = this.gl;

        gl.clearColor(fillRGB[0], fillRGB[1], fillRGB[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const data = this.instanceData;
        const width = this.width;
        const height = this.height;
        let count = 0;
        for (let x = 0; x < width; x++) {
            const col = frame.cells[x];
            for (let y = 0; y < height; y++) {
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

        this.nextFrame = +!this.nextFrame; // switch the frames
    }

    setFillColor(fillColor: string): void {
        this.frames.forEach(function (frame) {
            frame.setFillColor(fillColor);
        });
    }
}
