window.GameObject = function GameObject() {};
GameObject.prototype = {
    processInput: function (input) {
        if (this.children) {
            this.children.forEach(function (child) {
                if (typeof child.processInput === "function") {
                    child.processInput(input);
                }
            });
        }
    },
    update: function (dtime) {
        if (this.children) {
            this.children.forEach(function (child) {
                if (typeof child.update === "function") {
                    child.update(dtime);
                }
            });
        }
    },
    renderToFrame: function (frame) {
        if (this.children) {
            this.children.forEach(function (child) {
                if (typeof child.renderToFrame === "function") {
                    child.renderToFrame(frame);
                }
            });
        }
    },
    addChild: function (child) {
        if (this.children && child) {
            this.children.push(child);
        }
    },
    removeChild: function (child) {
        if (this.children && child) {
            var index = this.children.indexOf(child);
            if (index >= 0) {
                this.children.splice(index, 1);
            }
        }
    }
};
