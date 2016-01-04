DefineModule('helpers/collisions', function (require) {

    var DUMMY_CELL = { x: -1, y: -1, color: null };
    var CollisionDetectionFrame = DefineClass({
        collisionDetected: false,

        constructor: function () {
            this.cells = [ ];
        },

        cellAt: function (x, y) {
            if (!this.collisionDetected) {
                if (!this.cells[ x ]) {
                    this.cells[ x ] = [ ];
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
