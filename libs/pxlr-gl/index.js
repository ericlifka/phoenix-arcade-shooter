DefineModule('pxlr/gl', function () {
  return {
    name: "pxlr-gl",
    information: "Rendering pipeline for pxlr"
  }
});

DefineModule('views/canvas-renderer', function (require) {
  return require('pxlr/gl/canvas');
});
