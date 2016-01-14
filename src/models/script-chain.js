DefineModule('models/script-chain', function (require) {
    var GameObject = require('models/game-object');
    return DefineClass(GameObject, {
        constructor: function (parent, repeat, scripts) {
            this.super('constructor', arguments);

            this.repeat = repeat;
            this.scripts = scripts;
            this.scriptIndex = 0;
            this.activeScript = null;
        },

        start: function () {
            this.activeScript = this.scripts[ this.scriptIndex ];
            this.activeScript.start();
        },

        update: function (dtime) {
            this.activeScript.update(dtime);
        },

        removeChild: function () {
            this.scriptIndex++;
            if (this.scriptIndex > this.scripts.length) {
                if (this.repeat) {
                    this.scriptIndex = 0;
                } else {
                    this.parent.removeChild(this);
                    return;
                }
            }

            this.activeScript = this.scripts[ this.scriptIndex ];
            this.activeScript.start();
        }
    });
});
