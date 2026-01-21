(function () {
/* start:pxlr-core */
DefineModule('pxlr/core', function () {
    return {
        name: "pxlr-core",
        information: "Backbone utilities and core classes of pxlr"
    };
});

/* provide namespace backwards compatibility for v1 */
DefineModule('models/animation', function (require) {
    return require('pxlr/core/animation');
});
DefineModule('models/cell-grid', function (require) {
    return require('pxlr/core/cell-grid');
});
DefineModule('models/sprite', function (require) {
    return require('pxlr/core/sprite');
});
DefineModule('models/sprite-group', function (require) {
    return require('pxlr/core/sprite-group');
});

DefineModule('pxlr/core/animation', function () {
    return DefineClass({
        finished: false,
        constructor: function (options) {
            this.frames = options.frames;
            this.millisPerFrame = options.millisPerFrame || 100;
            this.currentFrame = options.offsetIndex || 0;
            this.loop = options.loop;

            this.width = this.frames[ 0 ].width;
            this.height = this.frames[ 0 ].height;
            this.millisEllapsedOnFrame = 0;
        },
        update: function (dtime) {
            if (this.finished) return;

            this.millisEllapsedOnFrame += dtime;

            if (this.millisEllapsedOnFrame >= this.millisPerFrame) {
                this.millisEllapsedOnFrame -= this.millisPerFrame;
                this.currentFrame += 1;

                if (this.currentFrame >= this.frames.length) {
                    if (this.loop) {
                        this.currentFrame = 0;
                    }
                    else {
                        this.finished = true;
                    }
                }
            }
        },
        renderToFrame: function (frame, x, y, index) {
            if (this.finished) return;

            this.frames[ this.currentFrame ].renderToFrame(frame, x, y, index);
        }
    });
});

DefineModule('pxlr/core/cell-grid', function () {
    return DefineClass({
        iterateCells: function (handler) {
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    handler(this.cells[ x ][ y ], x, y);
                }
            }
        },
        cellAt: function (x, y) {
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                return this.cells[ x ][ y ];
            }
            else {
                return { x: -1, y: -1, color: "#000000", index: -1 };
            }
        }
    });
});

DefineModule('pxlr/core/sprite-group', function () {
    return DefineClass({
        constructor: function (sprites) {
            this.spriteDescriptors = sprites || [];

            this.width = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
                return descriptor.x + descriptor.sprite.width;
            }));

            this.height = Math.max.apply(null, this.spriteDescriptors.map(function (descriptor) {
                return descriptor.y + descriptor.sprite.height;
            }));
        },

        update: function (dtime) {
            var finished = true;

            this.spriteDescriptors.forEach(function (descriptor) {
                descriptor.sprite.update(dtime);

                if (!descriptor.sprite.finished) {
                    finished = false;
                }
            });

            this.finished = finished;
        },

        renderToFrame: function (frame, x, y, index) {
            this.spriteDescriptors.forEach(function (descriptor) {
                descriptor.sprite.renderToFrame(
                    frame,
                    x + descriptor.x,
                    y + descriptor.y,
                    index
                );
            });
        }
    });
});

DefineModule('pxlr/core/sprite', function (require) {
    var CellGrid = require('pxlr/core/cell-grid');

    var Sprite = DefineClass(CellGrid, {
        finished: true,
        constructor: function Sprite(pixels, meta) {
            this.meta = meta || {};
            this.width = pixels.length;
            this.height = pixels[ 0 ].length;
            this.offsetAdjustment = { x: 0, y: 0 };

            this.cells = [];
            for (var x = 0; x < this.width; x++) {
                this.cells[ x ] = [];
                for (var y = 0; y < this.height; y++) {
                    this.cells[ x ][ y ] = {
                        x: x,
                        y: y,
                        color: pixels[ x ][ y ]
                    };
                }
            }
        },
        setPermanentOffset: function (offset) {
            offset = offset || { };
            this.offsetAdjustment.x = offset.x || 0;
            this.offsetAdjustment.y = offset.y || 0;

            return this;
        },
        applyColor: function (color) {
            this.iterateCells(function (cell) {
                if (cell.color) {
                    cell.color = color;
                }
            });

            return this;
        },
        update: function (dtime) {
            /*
             sprites ignore updates by default, but accept the event
             so that the api signature of sprites and animations matches
             */
        },
        renderToFrame: function (frame, x, y, index) {
            index = index || 0;
            var offset_x = this.offsetAdjustment.x;
            var offset_y = this.offsetAdjustment.y;
            this.iterateCells(function (cell, _x, _y) {
                if (cell.color) {
                    var frameCell = frame.cellAt(x + _x + offset_x, y + _y + offset_y);
                    if (index >= frameCell.index) {
                        frameCell.color = cell.color;
                        frameCell.index = index;
                    }
                }
            });
        },
        clone: function () {
            var colorGrid = [];
            for (var x = 0; x < this.width; x++) {
                colorGrid[ x ] = [];
                for (var y = 0; y < this.height; y++) {
                    colorGrid[ x ][ y ] = this.cells[ x ][ y ].color;
                }
            }

            var sprite = new Sprite(colorGrid);
            sprite.setPermanentOffset(this.offsetAdjustment);

            return sprite;
        },
        rotateLeft: function () {
            var width = this.width;
            var height = this.height;
            var oldCells = this.cells;
            var newCells = [];
            var x, y;

            for (x = 0; x < height; x++) {
                newCells[ x ] = [];
            }

            for (x = 0; x < width; x++) {
                for (y = 0; y < height; y++) {
                    newCells[ y ][ width - x - 1 ] = {
                        x: y,
                        y: width - x - 1,
                        color: oldCells[ x ][ y ].color
                    };
                }
            }

            this.width = height;
            this.height = width;
            this.cells = newCells;
            return this;
        },
        rotateRight: function () {
            return this
                .rotateLeft()
                .rotateLeft()
                .rotateLeft();
        },
        invertX: function () {
            for (var x = 0; x < this.width / 2; x++) {
                var left = this.cells[ x ];
                var right = this.cells[ this.width - x - 1 ];
                this.cells[ x ] = right;
                this.cells[ this.width - x - 1 ] = left;
            }
            return this;
        },
        invertY: function () {
            for (var x = 0; x < this.width; x++) {
                this.cells[ x ].reverse();
            }
            return this;
        }
    });

    return Sprite;
});
/* end:pxlr-core */
}());
