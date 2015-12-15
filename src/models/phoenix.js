window.newPhoenixModel = (function () {
    function Phoenix() { }
    Phoenix.prototype = {
        processInput: function () {
        },
        update: function () {
        },
        renderToFrame: function () {
        }
    };

    return function () {
        return new Phoenix();
    };
}());
