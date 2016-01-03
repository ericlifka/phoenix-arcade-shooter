DefineModule('models/game-object', function (require) {
    return DefineClass({
        damage: 0,
        constructor: function (parentObj) {
            this.parent = parentObj;
            this.children = [];
        },
        processInput: function (input) {
            this.children.forEach(function (child) {
                if (typeof child.processInput === "function") {
                    child.processInput(input);
                }
            });
        },
        update: function (dtime) {
            this.children.forEach(function (child) {
                if (typeof child.update === "function") {
                    child.update(dtime);
                }
            });

            if (this.position && this.velocity) {
                this.position.x += this.velocity.x * dtime / 1000;
                this.position.y += this.velocity.y * dtime / 1000;
            }

            this.checkBoundaries();
        },
        checkBoundaries: function () {
        },
        renderToFrame: function (frame) {
            this.children.forEach(function (child) {
                if (typeof child.renderToFrame === "function") {
                    child.renderToFrame(frame);
                }
            });

            if (this.sprite && this.position) {
                this.sprite.renderToFrame(Math.floor(this.position.x), Math.floor(this.position.y), frame);
            }
        },
        addChild: function (child) {
            if (child) {
                this.children.push(child);
            }
        },
        removeChild: function (child) {
            if (child) {
                var index = this.children.indexOf(child);
                if (index >= 0) {
                    this.children.splice(index, 1);
                }
            }
        },
        destroy: function () {
            if (this.parent && this.parent.removeChild) {
                this.parent.removeChild(this);
            }

            this.destroyed = true;
        },
        applyDamage: function (damage) {
            /* no good base implementation, needs to be overridden */
        }
    });
});
