(function (window) {

    var BitmapItem = function (spriteSheet) {
        this.initialize(spriteSheet);
    }

    BitmapItem.TYPE_SWORD = "sword";
    BitmapItem.TYPE_SHIELD = "shield";

    var p = BitmapItem.prototype = new BitmapAnimation();

    p.BitmapAnimation_initialize = p.initialize;

    p.HP = 0;
    p.BONUS_POINT = 0;
    p.TYPE = null;

    p.onPick = function (character) {
    };

    p.onUse = function (character, target) {
        var _this = this;
        switch (_this.type) {
            case BitmapItem.TYPE_SWORD:
                break
            case BitmapItem.TYPE_SHIELD:
                var damage = Math.ceil(Math.random() * 5 + 5);
                character.HP -= Math.max(0, (damage - _this.BONUS_POINT * 2));
                _this.HP -= Math.max(0, damage - _this.BONUS_POINT);
                if (_this.HP <= 0) {
                    character.leftArm = null;
                    character.removeChild(_this);
                }
                break;
        }

    };

    /**
     * Initialization method.
     * @method initialize
     * @protected
     */
    p.initialize = function (spriteSheet) {
        this.BitmapAnimation_initialize(spriteSheet);
    }

    window.BitmapItem = BitmapItem;
}(window));