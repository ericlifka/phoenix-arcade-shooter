const DUMMY_CELL = { x: -1, y: -1, color: null, index: -1 };

class CollisionDetectionFrame {
    collisionDetected = false;

    constructor() {
        this.cells = [];
    }

    cellAt(x, y) {
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

function entityToBoundingBox(entity) {
    return {
        x1: entity.position.x,
        x2: entity.position.x + entity.sprite.width,
        y1: entity.position.y,
        y2: entity.position.y + entity.sprite.height
    };
}

export function boxCollision(entityA, entityB) {
    const a = entityToBoundingBox(entityA);
    const b = entityToBoundingBox(entityB);

    return (
        a.x1 < b.x2 &&
        a.x2 > b.x1 &&
        a.y1 < b.y2 &&
        a.y2 > b.y1
    );
}

export function spriteCollision(entityA, entityB) {
    const collisionFrame = new CollisionDetectionFrame();

    entityA.renderToFrame(collisionFrame);
    entityB.renderToFrame(collisionFrame);

    return collisionFrame.collisionDetected;
}
