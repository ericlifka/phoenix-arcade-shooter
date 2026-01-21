import GameObject from './game-object.js';

export default class ScriptChain extends GameObject {
    constructor(parent, repeat, scripts) {
        super(parent);

        this.repeat = repeat;
        this.scripts = scripts;
        this.scriptIndex = 0;
        this.activeScript = null;

        const self = this;
        scripts.forEach(function (script) {
            script.parent = self;
        });
    }

    start() {
        this.activeScript = this.scripts[this.scriptIndex];
        this.activeScript.start();
    }

    update(dtime) {
        this.activeScript.update(dtime);
    }

    removeChild() {
        this.scriptIndex++;
        if (this.scriptIndex >= this.scripts.length) {
            if (this.repeat) {
                this.scriptIndex = 0;
            } else {
                this.parent.removeChild(this);
                return;
            }
        }

        this.activeScript = this.scripts[this.scriptIndex];
        this.activeScript.start();
    }
}
