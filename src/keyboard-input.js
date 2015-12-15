 window.newKeyboardInputManager = (function () {

     var KEYS = {
         W: 87, A: 65, S: 83, D: 68,
         SPACE: 32
     };

     return function () {
         document.body.addEventListener('keydown', function (event) {
             console.log('down', event.keyCode);
         });
         document.body.addEventListener('keyup', function (event) {
            //  console.log('up', event);
         });
     };
 }());
