window.newPhoenixModel = (function () {
    function Phoenix() {
        this.position_x = 10;
        this.position_y = 10;
    }

    Phoenix.prototype = {
        processInput: function () {
        },
        update: function () {
        },
        renderToFrame: function (frame) {
            frame.cells[ this.position_x ][ this.position_y ].color = "white";
        }
    };

    return function () {
        return new Phoenix();
    };
}());
