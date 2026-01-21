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
