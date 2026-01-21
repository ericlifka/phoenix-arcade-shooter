/**
 * Type definitions for the custom pixel rendering system
 */

// Cell represents a single pixel in the sprite/frame system
export interface Cell {
    x: number;
    y: number;
    color: string;
    index: number;
}

// Grid of cells (used in sprites and frames)
export type CellGrid = Cell[][];

// Position in 2D space
export interface Position {
    x: number;
    y: number;
}

// Velocity for movement
export interface Velocity {
    x: number;
    y: number;
}

// Acceleration for physics
export interface Acceleration {
    x: number;
    y: number;
}

// Anchor point options for positioning
export interface Anchor {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
}

// Frame dimensions
export interface Dimensions {
    width: number;
    height: number;
}

// Game dimensions with optional container and embedded flag
export interface GameDimensions extends Dimensions {
    container?: HTMLElement;
    embedded?: boolean;
}

// Animation options
export interface AnimationOptions {
    frames: any[]; // Array of sprites
    millisPerFrame?: number;
    loop?: boolean;
    offsetIndex?: number;
}

// Font metadata
export interface FontMeta {
    width: number;
    height: number;
    lineHeight: number;
    letterSpacing: number;
    credit?: string;
}

// Font definition (character sprites with metadata)
export interface Font {
    meta: FontMeta;
    [char: string]: any; // Character sprites or meta
}
