import { Cell } from '../types/rendering';

interface BoundingBox {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}

interface CollisionEntity {
    position: { x: number; y: number };
    sprite: { width: number; height: number };
    renderToFrame(frame: any): void;
}

const DUMMY_CELL: Cell = { x: -1, y: -1, color: '', index: -1 };

/**
 * Frame buffer used for pixel-perfect collision detection
 * Detects collisions by rendering both entities and checking for overlapping pixels
 */
class CollisionDetectionFrame {
    collisionDetected = false;
    private cells: boolean[][] = [];

    cellAt(x: number, y: number): Cell {
        if (!this.collisionDetected) {
            if (!this.cells[x]) {
                this.cells[x] = [];
            }

            if (!this.cells[x][y]) {
                this.cells[x][y] = true;
            }
            else {
                this.collisionDetected = true;
            }
        }

        return DUMMY_CELL;
    }
}

function entityToBoundingBox(entity: CollisionEntity): BoundingBox {
    return {
        x1: entity.position.x,
        x2: entity.position.x + entity.sprite.width,
        y1: entity.position.y,
        y2: entity.position.y + entity.sprite.height
    };
}

/**
 * Fast bounding box collision detection
 * Returns true if the rectangular bounds of two entities overlap
 */
export function boxCollision(entityA: CollisionEntity, entityB: CollisionEntity): boolean {
    const a = entityToBoundingBox(entityA);
    const b = entityToBoundingBox(entityB);

    return (
        a.x1 < b.x2 &&
        a.x2 > b.x1 &&
        a.y1 < b.y2 &&
        a.y2 > b.y1
    );
}

/**
 * Pixel-perfect sprite collision detection
 * More expensive than boxCollision but more accurate
 * Returns true if any rendered pixels from both entities overlap
 */
export function spriteCollision(entityA: CollisionEntity, entityB: CollisionEntity): boolean {
    const collisionFrame = new CollisionDetectionFrame();

    entityA.renderToFrame(collisionFrame);
    entityB.renderToFrame(collisionFrame);

    return collisionFrame.collisionDetected;
}
