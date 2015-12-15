 window.newKeyboardInputManager = (function () {

      function cloneObj(obj) {
          var nObj = { };
          Object.keys(obj).forEach(function (key) {
              nObj[ key ] = obj[ key ];
          });
          return nObj;
      }
      function newInputDescriptor() {
          return {
              W: false, A: false, S: false, D: false,
              SPACE: false
          };
      }
      function propagateInputClears() {
          Object.keys(clearAfterNext).forEach(function (key) {
              if (clearAfterNext[ key ]) {
                  inputState[ key ] = false;
                  clearAfterNext[ key ] = false;
              }
          });
      }

     var KEYS = {
         87: W, 65: A, 83: S, 68: D,
         32: SPACE
     };

     var inputState = newInputDescriptor();
     var clearAfterNext = newInputDescriptor();


     return function () {
         document.body.addEventListener('keydown', function (event) {
             inputState[ KEYS[ event.keyCode ] ] = true;
             clearAfterNext[ KEYS[ event.keyCode ] ] = false;
         });
         document.body.addEventListener('keyup', function (event) {
            clearAfterNext[ KEYS[ event.keyCode ] ] = true;
         });

         return {
             getInputState: function () {
                 var state = cloneObj(inputState);
                 propagateInputClears();
                 return state;
             }
         };
     };
 }());
