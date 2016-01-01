DefineModule('helpers/collisions', function (require) {
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
            return true;
        }
    };
});
