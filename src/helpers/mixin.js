window.MixIn = function (_class, properties) {
    Object.keys(properties).forEach(function (key) {
        _class.prototype[ key ] = properties[ key ];
    });
};
