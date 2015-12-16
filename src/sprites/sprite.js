window.newSprite = (function () {

    function Sprite(pixels) {
        this.cells = pixels;
        this.width = pixels.length;
        this.height = pixels[0].length;
    }
    Sprite.prototype = new CellGrid();
    Sprite.prototype.renderToFrame = function (x, y, frame) {
        frame.cellAt(x, y).color = "white";
    };

    return function (spritePixels) {
        return new Sprite(spritePixels);
    }
}());
