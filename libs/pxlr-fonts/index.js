DefineModule('pxlr/fonts', function () {
    return {
        name: "pxlr-fonts",
        information: "Collection of pixel fonts meant for use with the pxlr engine"
    };
});

/* provide namespace backwards compatibility for v1 */
DefineModule('fonts/arcade', function (require) {
    return require('pxlr/fonts/arcade');
});
DefineModule('fonts/arcade-small', function (require) {
    return require('pxlr/fonts/arcade-small');
});
DefineModule('fonts/phoenix', function (require) {
    return require('pxlr/fonts/phoenix');
});
