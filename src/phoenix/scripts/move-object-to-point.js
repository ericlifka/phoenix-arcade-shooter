DefineModule('phoenix/scripts/move-object-to-point', function (require) {
    var GameObject = require('models/game-object');

    return DefineClass(GameObject, {
        constructor: function (parent, object, targetPoint, timeDelta) {
            this.super('constructor', arguments);

            this.object = object;
            this.target = targetPoint;
            this.delta = timeDelta;
        },
        start: function () {
            var current = this.object.position;

            var xDiff = this.target.x - current.x;
            var yDiff = this.target.y - current.y;

            this.object.velocity.x = xDiff / this.delta;
            this.object.velocity.y = yDiff / this.delta;

            this.xPositive = xDiff > 0;
            this.yPositive = yDiff > 0;
        },
        update: function (dtime) {
            this.super('update', arguments);

            var xPositive = this.xPositive;
            var yPositive = this.yPositive;
            var position = this.object.position;
            var target = this.target;

            if (xPositive && position.x > target.x ||
                !xPositive && position.x < target.x ||
                yPositive && position.y > target.y ||
                !yPositive && position.y < target.y) {

                this.object.velocity.x = 0;
                this.object.velocity.y = 0;

                this.object.position.x = target.x;
                this.object.position.y = target.y;

                this.parent.removeChild(this);
            }
        }
    });
});
