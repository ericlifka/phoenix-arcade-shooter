DefineModule('phoenix/title-screen', function (require) {
    var GameObject = require('models/game-object');
    var TextDisplay = require('components/text-display');
    var ArrowShip = require('phoenix/sprites/arrow-ship');

    return DefineClass(GameObject, {
        reset: function () {
            this.super('reset');

            this.selectedMenuItem = 0;
            this.timeSinceChanged = 0;
            this.timeSinceSelected = 0;
            this.CHANGE_DELAY = 200;

            this.inputReleased = false;
            this.selecting = false;

            this.addChild(new TextDisplay(this, {
                font: "phoenix",
                message: "PHOENIX",
                position: { x: 50, y: 30 }
            }));

            this.menuItems = [
                new TextDisplay(this, {
                    font: "arcade-small",
                    message: "New",
                    position: { x: 90, y: 90 },
                    explodable: true
                }),
                new TextDisplay(this, {
                    font: "arcade-small",
                    message: "Load",
                    position: { x: 89, y: 105 },
                    explodable: true
                }),
                new TextDisplay(this, {
                    font: "arcade-small",
                    message: "controls",
                    position: { x: 84, y: 120 },
                    explodable: true
                })
            ];
            this.menuItems.forEach(function (item) {
                this.parent.addChild(item);
            }.bind(this));

            this.selectorLeft = new GameObject();
            this.selectorRight = new GameObject();

            this.selectorLeft.sprite = new ArrowShip();
            this.selectorRight.sprite = new ArrowShip().invertX();

            this.selectorLeft.position = { x: 70, y: 90 };
            this.selectorRight.position = { x: 115, y: 90 };

            this.addChild(this.selectorLeft);
            this.addChild(this.selectorRight);
        },

        processInput: function (input) {
            if (!input.menuSelect && !input.fire) {
                this.inputReleased = true;
            }

            if (this.timeSinceChanged > this.CHANGE_DELAY) {
                if (this.inputReleased && (input.menuSelect || input.fire)) {
                    this.timeSinceChanged = 0;
                    this.chooseSelected();
                }

                if (Math.abs(input.movementVector.y) > 0.6) {
                    this.timeSinceChanged = 0;
                    if (input.movementVector.y > 0) {
                        this.selectedMenuItem++;
                    } else {
                        this.selectedMenuItem--;
                    }

                    if (this.selectedMenuItem >= this.menuItems.length) {
                        this.selectedMenuItem = this.menuItems.length - 1;
                    }
                    if (this.selectedMenuItem < 0) {
                        this.selectedMenuItem = 0;
                    }
                }
            }

            this.updateSelectorPosition();
        },

        update: function (dtime) {
            this.super('update', arguments);

            this.timeSinceChanged += dtime;
            this.timeSinceSelected += dtime;

            if (this.selecting && this.timeSinceSelected > 595) {
                this.destroy();
                this.parent.startNewGame();
            }
        },

        updateSelectorPosition: function () {
            if (!this.selecting) {
                if (this.selectedMenuItem === 0) {
                    this.selectorLeft.position.y = 90;
                    this.selectorRight.position.y = 90;
                }
                else if (this.selectedMenuItem === 1) {
                    this.selectorLeft.position.y = 105;
                    this.selectorRight.position.y = 105;
                }
                else {
                    this.selectorLeft.position.y = 120;
                    this.selectorRight.position.y = 120;
                }
            }
        },

        chooseSelected: function () {
            if (!this.selecting) {
                this.selecting = true;
                this.timeSinceSelected = 0;

                var x1 = this.selectorLeft.position.x + this.selectorLeft.sprite.width;
                var x2 = this.selectorRight.position.x;
                var y = this.selectorLeft.position.y + Math.floor(this.selectorLeft.sprite.height / 2);

                this.parent.spawnBullet(2, { x: x1, y: y }, { x: 50, y: 0 });
                this.parent.spawnBullet(3, { x: x2, y: y }, { x: -50, y: 0 });
            }
        },

        destroy: function () {
            var parent = this.parent;
            this.menuItems.forEach(function (item) {
                parent.removeChild(item);
            });

            this.super('destroy');
        }
    });
});
