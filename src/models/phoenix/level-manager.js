window.PhoenixLevelManager = DefineClass({
    levels: [
        {

        }
    ],
    constructor: function (game) {
        this.game = game;
        this.activeScripts = [ ];
        this.nextLevel = 0;
    },
    startLevel: function () {
        this.currentLevel = this.levels[ this.nextLevel ];
        this.nextLevel++;

        
    }
});
