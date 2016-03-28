DefineModule('components/money-drop', function (require) {
    var GameObject = require('models/game-object');
    var ArcadeFont = require('fonts/arcade');

    return DefineClass(GameObject, {
        isPhysicalEntity: true,
        type: "pickup",
        team: 1,
        index: 4,

        constructor: function (parent, position, velocity) {
            this.super('constructor', arguments);

            this.position = position;
            this.velocity = { x: 0, y: 50 };
            this.sprite = ArcadeFont[ '$' ];
        },
        checkBoundaries: function () {
            if (this.position.x < 0
                || this.position.y < 0
                || this.position.x > this.parent.width
                || this.position.y > this.parent.height) {

                this.destroy();
            }
        },
        applyDamage: function (damage, sourceEntity) {
            if (sourceEntity.type === "player") {
                console.log("GET MONEY GET PAID!");
                this.destroy();
            }
        }
    });
});
