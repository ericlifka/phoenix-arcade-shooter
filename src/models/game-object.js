DefineModule('models/game-object', function (require) {
    return DefineClass({
        damage: 0,
        constructor: function (parentObj) {
            this.parent = parentObj;

            this.reset();
        },
        reset: function () {
            this.children = [];
            this.destroyed = false;
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

            if (this.sprite) {
                this.sprite.update(dtime);
            }

            if (this.position && this.velocity) {
                this.position.x += this.velocity.x * dtime / 1000;
                this.position.y += this.velocity.y * dtime / 1000;
            }

            this.checkBoundaries();

            if (this.exploding && this.sprite.finished) {
                this.destroy();
            }
        },
        checkBoundaries: function () {
            /* a place to verify that objects are within the screen constraints */
        },
        renderToFrame: function (frame) {
            this.children.forEach(function (child) {
                if (typeof child.renderToFrame === "function") {
                    child.renderToFrame(frame);
                }
            });

            if (this.sprite && this.position) {
                this.sprite.renderToFrame(frame, Math.floor(this.position.x), Math.floor(this.position.y), this.index || 0);
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

            this.children = null; // may need to iterate through children and destroy them too
            this.destroyed = true;
        },
        applyDamage: function (damage) {
            if (this.maxLife) {
                this.life -= damage;

                if (this.life <= 0) {
                    this.exploding = true;
                    this.sprite = this.explosion();

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
    });
});
