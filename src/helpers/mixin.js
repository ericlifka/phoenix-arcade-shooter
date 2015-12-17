window.MixIn = function (_class, properties) {
    Object.keys(properties).forEach(function (key) {
        _class.prototype[ key ] = properties[ key ];
    });
};

window.DefineClass = function (Base, definition) {
    if (typeof Base === "object" && !definition) {
        definition = Base;
        Base = function () { };
    }

    function Constructor() {
        if (typeof this.constructor === "function") {
            this.constructor.apply(this, arguments);
        }
    }

    Constructor.prototype = new Base();
    MixIn(Constructor, definition);

    return Constructor;
};
