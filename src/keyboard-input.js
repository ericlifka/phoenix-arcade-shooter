 window.newKeyboardInputManager = (function () {

     var KEYS = {
         87: W, 65: A, 83: S, 68: D,
         32: SPACE
     };

     var inputState = {
         W: false, A: false, S: false, D: false,
         SPACE: false
     }

     return function () {
         document.body.addEventListener('keydown', function (event) {
             console.log('down', event.keyCode);
         });
         document.body.addEventListener('keyup', function (event) {
            //  console.log('up', event);
         });
     };
 }());
