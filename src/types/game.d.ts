/**
 * Type definitions for game objects and entities
 */

import { Position, Velocity, Acceleration, Dimensions } from './rendering';

// Base game object interface
export interface GameObjectLike {
    parent?: GameObjectLike | null;
    children?: GameObjectLike[];
    destroyed?: boolean;
    position?: Position;
    velocity?: Velocity;
    acceleration?: Acceleration;
    sprite?: any;
    index?: number;
    damage?: number;
    life?: number;
    maxLife?: number;
    energyShield?: number;

    update?(dtime: number): void;
    processInput?(input: any): void;
    renderToFrame?(frame: any): void;
    reset?(): void;
    destroy?(): void;
    addChild?(child: GameObjectLike): void;
    removeChild?(child: GameObjectLike): void;
}

// Input state from keyboard/gamepad
export interface InputState {
    movementVector: Position;
    fire: boolean;
    bomb: boolean;
    start: boolean;
    up?: boolean;
    down?: boolean;
    left?: boolean;
    right?: boolean;
}

// Bullet options
export interface BulletOptions {
    team?: number;
    position?: Position;
    velocity?: Velocity;
    acceleration?: Acceleration;
    damage?: number;
    life?: number;
    maxLife?: number;
}

// Bomb options
export interface BombOptions {
    team?: number;
    position?: Position;
    velocity?: Velocity;
    acceleration?: Acceleration;
}

// Text display options
export interface TextDisplayOptions {
    message?: string | string[];
    font?: string;
    color?: string;
    /** When true, keep the font's authored multi-color pixels (skip tint). */
    preserveSpriteColors?: boolean;
    position?: Position;
    border?: boolean;
    padding?: number;
    background?: string | null;
    index?: number;
    isPhysicalEntity?: boolean;
}

// Life meter options
export interface LifeMeterOptions {
    position?: Position;
    anchor?: { left?: number; right?: number; top?: number; bottom?: number };
    horizontal?: boolean;
    length?: number;
    width?: number;
    scale?: number;
    showBorder?: boolean;
    borderColor?: string;
    /** When true, fill depletes from the opposite end (e.g. shrink toward screen center). */
    mirror?: boolean;
}

// Combo gauge options
export interface ComboGaugeOptions {
    position: Position;
    anchorBottom?: number;
    color?: string;
    player?: import('../ships/player-controlled-ship.js').default;
}

// Bank (score/money) options
export interface BankOptions {
    position?: Position;
    color?: string;
}

// Script options
export interface ScriptOptions {
    gunIndex?: number;
    fireRate?: number;
    burstSize?: number;
    thresholdMin?: number;
    thresholdMax?: number;
}

// Game over result
export interface GameOverResult {
    score: number;
    level: number;
}

// Collision detection
export interface PhysicalEntity extends GameObjectLike {
    isPhysicalEntity: boolean;
    team?: number;
    type?: string;
    exploding?: boolean;
}
