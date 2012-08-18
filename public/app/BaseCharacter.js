// BaseCharacter
var _basicHandMap = [
    [
        [0, 26, 90, false],
        [-13, 26, 105, false],
        [-21, 19, 130, false],
        [-13, 26, 105, false],
        [0, 26, 90, false],
        [17, 19, 75, false],
        [23, 10, 50, false],
        [17, 19, 75, false],
        [0, 26, 260, false],
        [-23, 16, 290, false],
        [-24, -3, 310, false],
        [-13, 26, 180, false],
        [0, 26, 160, false],
        [23, 16, 115, false],
        [28, -7, 60, false],
        [17, 19, 75, false]
    ],
    [
        [3, -27, 0, false],
        [17, -19, 15, false],
        [23, -10, 30, false],
        [17, -19, 15, false],
        [3, -27, 0, false],
        [-13, -26, -25, false],
        [-21, -19, -40, false],
        [-13, -26, -25, false],
        [3, -27, 0, false],
        [23, -19, 50, false],
        [28, 7, 90, false],
        [17, -19, 0, false],
        [3, -27, -15, false],
        [-23, -19, -30, false],
        [-24, 3, -65, false],
        [-13, -26, -75, false]
    ]
];

var BaseCharacter = function (context, bodyAnim, handMap, rightArm, leftArm) {
    this.initialize(context, bodyAnim, handMap, rightArm, leftArm);
};
var p = BaseCharacter.prototype = new Container();


p.Container_initialize = p.initialize;

p.stateToJson = function () {
    var json = {};
    json.stateId = this.stateId;
    json.speed = this.speed;
    json.direction = this.direction;
    json.vX = this.vX;
    json.vY = this.vY;
    json.isAction = this.isAction;
    json.action = this.action;
    json.parriedCount = this.parriedCount;
    json.attackFrame = this.attackFrame;
    json.isWalk = this.isWalk;
    json.mode = this.mode;
    json.HP = this.HP;
    json.teamNumber = this.teamNumber;

    json.x = this.x;
    json.y = this.y;
    json.rotation = this.rotation;
    json.px = this.px;
    json.py = this.py;

    json.currentAnimationFrame = this.currentAnimationFrame;
    json.currentAnimation = this.currentAnimation;
    json.width = this.width;
    json.height = this.height;
    json.clientTime = this.clientTime;
    return json;
};

p.jsonToState = function (json) {
    this.stateId = json.stateId;
    this.speed = json.speed;
    this.direction = json.direction;
    this.vX = json.vX;
    this.vY = json.vY;
    this.isAction = json.isAction;
    this.action = json.action;
    this.parriedCount = json.parriedCount;
    this.attackFrame = json.attackFrame;
    this.isWalk = json.isWalk;
    this.mode = json.mode;
    this.HP = json.HP;
    this.teamNumber = json.teamNumber;

    this.x = json.x;
    this.y = json.y;
    this.rotation = json.rotation;
    this.px = json.px;
    this.py = json.py;
};

p.initialize = function (context, bodyAnim, handMap, rightArm, leftArm) {
    this.context = context;
    this.Container_initialize();
    this.bodyAnim = bodyAnim;
    this.bodyAnim.reverseFrame = false;
    this.handMap = handMap;
    this.speed = 10;
    this.direction = 90;
    this.vX = 0;
    this.vY = 0;
    this.px = this.x;
    this.py = this.y;
    this.isAction = false;
    this.action = CharacterAction.NONE;
    this.parriedCount = 0;
    this.attackFrame = 0;
    this.isWalk = false;
    this.HP = 20;
    this.teamNumber = 0;
    this.clientTime = 0;
    this.dropList = [];
    this.isPlayer = false;

    if (rightArm) {
        this.equipRight(rightArm);
    }

    this.addChild(this.bodyAnim);
    this.spriteSheet = this.bodyAnim.spriteSheet;

    if (leftArm) {
        this.equipLeft(leftArm);
    }
    this.width = this.spriteSheet._frameWidth;
    this.height = this.spriteSheet._frameHeight;
};

p.equipLeft = function (item) {
    var _this = this;
    _this.ejectLeft();
    _this.leftArm = item.clone();
    if (_this.leftArm.currentAnimation.endsWith("_")) {
        _this.leftArm.gotoAndStop(_this.leftArm.currentAnimation.chop());
    }
    _this.addChild(_this.leftArm);
    var handMapPos = _this.handMap[1][_this.bodyAnim.currentFrame];
    _this.leftArm.x = handMapPos[0];
    _this.leftArm.y = handMapPos[1];
    _this.leftArm.rotation = handMapPos[2];

    if (_this.isPlayer) {
        context.playData.leftArm = _this.leftArm.currentAnimation;
    }
};

p.equipRight = function (item) {
    var _this = this;
    _this.ejectRight();
    _this.rightArm = item.clone();
    if (_this.rightArm.currentAnimation.endsWith("_")) {
        _this.rightArm.gotoAndStop(_this.rightArm.currentAnimation.chop());
    }

    _this.addChildAt(_this.rightArm, 0);

    var handMapPos = _this.handMap[0][_this.bodyAnim.currentFrame];
    _this.rightArm.x = handMapPos[0];
    _this.rightArm.y = handMapPos[1];
    _this.rightArm.rotation = handMapPos[2];

    if (_this.isPlayer) {
        context.playData.rightArm = _this.rightArm.currentAnimation;
    }
};

p.ejectLeft = function () {
    var _this = this;
    if (_this.leftArm) {
        _this.removeChild(_this.leftArm);
        _this.leftArm = null;
        if (_this.isPlayer) {
            context.playData.leftArm = null;
        }
    }
};

p.ejectRight = function () {
    var _this = this;
    if (_this.rightArm) {
        _this.removeChild(_this.rightArm);
        _this.rightArm = null;
        if (_this.isPlayer) {
            context.playData.rightArm = null;
        }
    }
};


p.addToDropList = function (item, rate) {
    var _this = this;
    _this.dropList.push({
        item:item,
        rate:rate
    });
};

p.die = function () {
    var _this = this;
    _this.HP = 0;
    _this.action = CharacterAction.DEAD;
    if (Math.floor(Math.random() * 100) < 80) {
        var rateSum = 0;
        var rateMap = {};
        for (var k in _this.dropList) {
            if (_this.dropList.hasOwnProperty(k)) {
                rateSum += parseInt(_this.dropList[k]['rate']);
                rateMap[rateSum] = _this.dropList[k]['item'];
            }
        }
        var dice = Math.floor(Math.random() * rateSum);
        for (var k2 in rateMap) {
            if (dice < k2) {
                if (rateMap.hasOwnProperty(k2)) {
                    rateMap[k2].drop(_this.context, _this.x, _this.y);
                }
                break;
            }
        }
    }
};

//clientSide
p.updateFrame = function () {
    var _this = this;
    _this.alpha = 1;

    if (_this.HP <= 0) {
        _this.die();
    }

    if (_this.isWalk) {
        _this.bodyAnim.paused = false;
        _this.bodyAnim.onAnimationEnd = function () {
            _this.bodyAnim.currentAnimationFrame = 0;
            _this.bodyAnim.gotoAndPlay("walk");     //animate
        };
        _this.vX = Math.cos(_this.direction * Math.PI / 180) * _this.speed;
        _this.vY = Math.sin(_this.direction * Math.PI / 180) * _this.speed;
    } else if (_this.isAction) {
        if (_this.action == CharacterAction.DEFENCE_MOTION) {
            if (_this.bodyAnim.currentAnimation != "defence") {
                _this.bodyAnim.gotoAndPlay("defence");
                _this.bodyAnim.onAnimationEnd = function () {
                    _this.vX = _this.vY = 0;
                    _this.action = CharacterAction.DEFENCE;
                    var endFrame = _this.bodyAnim.currentFrame +
                        _this.bodyAnim.spriteSheet.getNumFrames(_this.bodyAnim.currentAnimation) - 1;
                    _this.bodyAnim.gotoAndStop(endFrame);
                    _this.bodyAnim.paused = true;
                };
            }
            _this.vX = Math.cos(_this.direction * Math.PI / 180) * -2;
            _this.vY = Math.sin(_this.direction * Math.PI / 180) * -2;
        } else if (_this.action == CharacterAction.DEFENCE) {

        } else if (_this.action == CharacterAction.PARRIED) {
            if (_this.bodyAnim.currentAnimation != "parried") {
                _this.bodyAnim.gotoAndPlay("parried");
                if (_this.parriedCount > 0) {
                    _this.context.addEffect(_this.x, _this.y, "parried");
                }
                _this.bodyAnim.onAnimationEnd = function () {

                    if (_this.parriedCount <= 0) {
                        _this.vX = _this.vY = 0;
                        _this.action = CharacterAction.NONE;
                    } else {
                        _this.parriedCount--;
                        _this.bodyAnim.currentAnimationFrame = 0;
                        _this.bodyAnim.gotoAndPlay("parried");
                    }
                };
            }
            _this.vX = Math.cos(_this.direction * Math.PI / 180) * -1;
            _this.vY = Math.sin(_this.direction * Math.PI / 180) * -1;
        } else if (_this.action == CharacterAction.DAMAGE) {
            if (_this.bodyAnim.currentAnimation != "damage") {
                _this.bodyAnim.gotoAndPlay("damage");
                _this.context.addEffect(_this.x, _this.y, "damage");
                _this.bodyAnim.onAnimationEnd = function () {
                    _this.vX = _this.vY = 0;
                    _this.action = CharacterAction.NONE;
                };
            }
            _this.alpha = 0.5;
        } else if (_this.action == CharacterAction.DEAD) {
            delete _this.context.characters[_this.stateId];
            for (var i = 0; i < 4; i++) {
                _this.context.addEffect(_this.x + Math.random() * 8 - 16, _this.y + Math.random() * 8 - 16, "dead");
            }
            _this.context.removeFromStage(_this);
        } else if (_this.action == CharacterAction.ATTACK) {
            _this.attackFrame = _this.bodyAnim.currentAnimationFrame;
            if ((_this.bodyAnim.currentAnimation == null)
                || (_this.bodyAnim.currentAnimation.indexOf("attack") != 0)) {
                var weaponSpeed = 2;
                if (_this.rightArm) {
                    if (_this.bodyAnim.currentFrame == 10) {
                        weaponSpeed = 0;
                    } else {
                        weaponSpeed = _this.rightArm.speed;
                    }
                }
                if (weaponSpeed >= 2) {
                    _this.bodyAnim.gotoAndPlay("attack_2");
                } else if (weaponSpeed == 1) {
                    _this.bodyAnim.gotoAndPlay("attack_1");
                } else if (weaponSpeed == -1) {
                    _this.bodyAnim.gotoAndPlay("attack__1")
                } else if (weaponSpeed <= -2) {
                    _this.bodyAnim.gotoAndPlay("attack__2");
                } else {
                    _this.bodyAnim.gotoAndPlay("attack");
                }
                _this.bodyAnim.onAnimationEnd = function () {
                    if (_this.action != CharacterAction.ATTACK) {
                        return;
                    }
                    _this.attackFrame = 0;
                    _this.vX = _this.vY = 0;
                    _this.action = CharacterAction.NONE;
                };
            }

            if (_this.bodyAnim.currentFrame < 10) {
                _this.vX = Math.cos(_this.direction * Math.PI / 180) * -2;
                _this.vY = Math.sin(_this.direction * Math.PI / 180) * -2;
            } else if (_this.bodyAnim.currentFrame > 13) {
                _this.vX = Math.cos(_this.direction * Math.PI / 180) * -3;
                _this.vY = Math.sin(_this.direction * Math.PI / 180) * -3;
            } else {
                _this.vX = Math.cos(_this.direction * Math.PI / 180) * 3;
                _this.vY = Math.sin(_this.direction * Math.PI / 180) * 3;
            }
        } else if (_this.action == CharacterAction.NONE) {
            _this.isAction = false;
            _this.vX = _this.vY = 0;
            _this.bodyAnim.gotoAndStop("walk");     //animate
            _this.bodyAnim.paused = true;
        }
    } else {
        _this.isAction = false;
        _this.vX = _this.vY = 0;
        _this.bodyAnim.gotoAndStop("walk");     //animate
        _this.bodyAnim.paused = true;
    }

    _this.rotation = _this.direction;
    if (_this.rightArm) {
        var handMapPos = _this.handMap[0][_this.bodyAnim.currentFrame];
        _this.rightArm.x = handMapPos[0];
        _this.rightArm.y = handMapPos[1];
        _this.rightArm.rotation = handMapPos[2];
    }

    if (_this.leftArm) {
        var lhandMapPos = _this.handMap[1][_this.bodyAnim.currentFrame];
        _this.leftArm.x = lhandMapPos[0];
        _this.leftArm.y = lhandMapPos[1];
        _this.leftArm.rotation = lhandMapPos[2];
    }
    _this.clientTime++;
};

p.checkDropItem = function () {
    var _this = this;
    var dropItems = _this.context.dropItems;
    for (var k in dropItems) {
        if (dropItems.hasOwnProperty(k)) {
            var item = dropItems[k];
            var deltaX = item.x - _this.x;
            var deltaY = item.y - _this.y;
            var collisionRange = _this.width / 2;
            var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            if (distance < collisionRange) {
                item.onPick(_this);
                break;
            }
        }
    }
};