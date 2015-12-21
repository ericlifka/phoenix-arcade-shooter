window.PhoenixEnemyShip = DefineClass(GameObject, {
    constructor: function () {
        this.super('constructor', arguments);

        this.sprite = newPhoenixPlayerShipSprite().rotateLeft();
        this.position = { x: 0, y: 0 };
    }
});
