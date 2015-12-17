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
    MixIn(Constructor, {
        super: function (name, args) {
            // WARNING: this is known to only work for one level of base class
            // if the base class has a parent and uses a super call it won't work
            if (typeof Base.prototype[ name ] === "function") {
                Base.prototype[ name ].apply(this, args);
            }
        }
    });

    return Constructor;
};
