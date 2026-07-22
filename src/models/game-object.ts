import { Position, Velocity, Acceleration } from '../types/rendering';
import { InputState } from '../types/game';

/**
 * Base class for all game entities
 * Provides lifecycle methods, parent-child hierarchy, input processing, and rendering
 */
export default class GameObject {
    // Core properties
    parent?: GameObject | null;
    children: GameObject[];
    destroyed: boolean;

    // Optional properties (not all GameObjects have these)
    damage?: number;
    life?: number;
    maxLife?: number;
    position?: Position;
    velocity?: Velocity;
    acceleration?: Acceleration;
    sprite?: any; // Complex type, using any for now
    index?: number;
    exploding?: boolean;
    explosion?: () => any;

    constructor(parentObj?: GameObject | null) {
        this.parent = parentObj;
        this.children = [];
        this.destroyed = false;
        this.damage = 0;
    }

    reset(): void {
        this.children = [];
        this.destroyed = false;
    }

    /**
     * Trigger an event by bubbling up the parent chain
     * Useful for child entities to communicate with parents
     */
    triggerEvent(event: string, data?: any): void {
        let entityRef = this.parent;

        while (entityRef) {
            if (typeof (entityRef as any)[event] === 'function') {
                (entityRef as any)[event](data);
                return;
            }

            entityRef = entityRef.parent;
        }

        console.error("Couldn't find event '" + event + "' in parent chain of ", this);
    }

    processInput(input: InputState): void {
        this.children && this.children.forEach((child) => {
            if (typeof child.processInput === "function") {
                child.processInput(input);
            }
        });
    }

    update(dtime: number): void {
        if (this.children) {
            // Snapshot so removeChild during update doesn't skip siblings.
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

    /**
     * Override in subclasses to enforce screen boundaries
     */
    checkBoundaries(): void {
        /* a place to verify that objects are within the screen constraints */
    }

    renderToFrame(frame: any): void {
        this.children && this.children.forEach((child) => {
            if (typeof child.renderToFrame === "function") {
                child.renderToFrame(frame);
            }
        });

        if (this.sprite && this.position) {
            this.sprite.renderToFrame(frame, Math.floor(this.position.x), Math.floor(this.position.y), this.index || 0);
        }
    }

    addChild(child?: GameObject): void {
        if (child && this.children) {
            this.children.push(child);
        }
    }

    removeChild(child?: GameObject): void {
        if (child && this.children) {
            const index = this.children.indexOf(child);
            if (index >= 0) {
                this.children.splice(index, 1);
            }
        }
    }

    destroy(): void {
        if (this.parent && this.parent.removeChild) {
            this.parent.removeChild(this);
        }

        (this.children as any) = null; // may need to iterate through children and destroy them too
        this.destroyed = true;
    }

    applyDamage(damage: number, sourceEntity?: GameObject): void {
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
