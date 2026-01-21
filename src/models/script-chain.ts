import GameObject from './game-object.js';

interface Script {
    parent?: ScriptChain;
    start(): void;
    update(dtime: number): void;
}

/**
 * Executes a sequence of behavior scripts in order
 * Can optionally loop the script chain
 */
export default class ScriptChain extends GameObject {
    private repeat: boolean;
    private scripts: Script[];
    private scriptIndex: number;
    private activeScript: Script | null;

    constructor(parent: GameObject | null, repeat: boolean, scripts: Script[]) {
        super(parent);

        this.repeat = repeat;
        this.scripts = scripts;
        this.scriptIndex = 0;
        this.activeScript = null;

        const self = this;
        scripts.forEach(function (script) {
            script.parent = self;
        });
        
        this.reset();
    }

    start(): void {
        this.activeScript = this.scripts[this.scriptIndex];
        this.activeScript.start();
    }

    update(dtime: number): void {
        if (this.activeScript) {
            this.activeScript.update(dtime);
        }
    }

    removeChild(): void {
        this.scriptIndex++;
        if (this.scriptIndex >= this.scripts.length) {
            if (this.repeat) {
                this.scriptIndex = 0;
            } else {
                this.parent?.removeChild(this);
                return;
            }
        }

        this.activeScript = this.scripts[this.scriptIndex];
        this.activeScript.start();
    }
}
