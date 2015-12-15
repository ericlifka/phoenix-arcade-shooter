 window.newKeyboardInputManager = (function () {

     return function () {
         document.body.addEventListener('keydown', function (event) {
             console.log('down', event);
         });
         document.body.addEventListener('keyup', function (event) {
             console.log('up', event);
         });
     };
 }());
