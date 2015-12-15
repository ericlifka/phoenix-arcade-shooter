 window.newKeyboardInputManager = (function () {

     var KEYS = {
         87: W, 65: A, 83: S, 68: D,
         32: SPACE
     };

     var inputState = {
         W: false, A: false, S: false, D: false,
         SPACE: false
     }

     function cloneObj(obj) {
         var nObj = { };
         Object.keys(obj).forEach(function (key) {
             nObj[ key ] = obj[ key ];
         });
         return nObj;
     }

     return function () {
         document.body.addEventListener('keydown', function (event) {
             inputState[ KEYS[ event.keyCode ] ] = true;
         });
         document.body.addEventListener('keyup', function (event) {
            inputState[ KEYS[ event.keyCode ] ] = false;
         });

         return {
             getInputState: function () {
                 return cloneObj(inputState);
             }
         };
     };
 }());
