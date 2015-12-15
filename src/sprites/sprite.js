window.newSprite = (function () {

    function Sprite() { }
    Sprite.prototype = {
        renderToFrame: function (x, y, frame) {
            frame.cellAt(x, y).color = "white";
        }
    };

    return function () {
        return new Sprite();
    }
}());
