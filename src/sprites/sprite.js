window.newSprite = (function () {

    function Sprite() { }
    Sprite.prototype = { };

    return function () {
        return new Sprite();
    }
}());
