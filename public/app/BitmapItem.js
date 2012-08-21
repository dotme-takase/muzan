(function (window) {

    var BitmapItem = function (spriteSheet, params) {
        this.initialize(spriteSheet);
        for (var k in params) {
            if (params.hasOwnProperty(k)) {
                this[k] = params[k];
            }
        }
    };

    BitmapItem.TYPE_SWORD = "sword";
    BitmapItem.TYPE_SHIELD = "shield";
    BitmapItem.TYPE_MISC = "misc";

    var p = BitmapItem.prototype = new BitmapAnimation();

    p.BitmapAnimation_initialize = p.initialize;
    p.BitmapAnimation_clone = p.clone;

    p.onPick = function (character) {
        var _this = this;
        var context = character.context;
        switch (_this.type) {
            case BitmapItem.TYPE_SWORD:
                context.playSound("pickup");
                character.equipRight(_this);
                break;
            case BitmapItem.TYPE_SHIELD:
                context.playSound("pickup");
                character.equipLeft(_this);
                break;
            default:
                _this.onUse(character, character);
                break;
        }
        context.removeFromStage(_this);
        for (var k in context.dropItems) {
            if (context.dropItems.hasOwnProperty(k)) {
                if (_this == context.dropItems[k]) {
                    context.dropItems.splice(k, 1);
                    delete _this;
                    break;
                }
            }
        }
        delete _this;
    };

    p.drop = function (context, x, y) {
        var _clone = this.clone();
        if (!_clone.currentAnimation.endsWith("_")) {
            _clone.gotoAndStop(_clone.currentAnimation + "_");
        }
        _clone.x = x;
        _clone.y = y;
        context.dropItems.push(_clone);
        context.addToStage(_clone);
    };

    p.onUse = function (character, target) {
        var _this = this;
        switch (_this.type) {
            case BitmapItem.TYPE_SWORD:
                break;
            case BitmapItem.TYPE_SHIELD:
                var damage = Math.ceil(Math.random() * 5 + 5);
                character.HP -= Math.max(0, (damage - _this.bonusPoint * 2));
                _this.HP -= Math.max(0, damage - _this.bonusPoint);
                if (_this.HP <= 0) {
                    character.ejectLeft();
                }
                break;
        }
    };

    p.clone = function () {
        var _this = this;
        var _clone = _this.BitmapAnimation_clone();
        _clone.BitmapAnimation_clone = _this.BitmapAnimation_clone;
        _clone.HP = _this.HP;
        _clone.bonusPoint = _this.bonusPoint;
        _clone.range = _this.range;
        _clone.speed = _this.speed;
        _clone.type = _this.type;
        _clone.onPick = _this.onPick;
        _clone.drop = _this.drop;
        _clone.onUse = _this.onUse;
        _clone.clone = _this.clone;
        return _clone;
    };

    /**
     * Initialization method.
     * @method initialize
     * @protected
     */
    p.initialize = function (spriteSheet) {
        this.BitmapAnimation_initialize(spriteSheet);
        this.HP = 0;
        this.bonusPoint = 0;
        this.range = 0;
        this.speed = 0;
        this.type = null;
    };

    window.BitmapItem = BitmapItem;
}(window));