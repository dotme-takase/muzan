if (typeof exports == "undefined") {
    exports = {
        error:function (sMessage) {
        },
        inspect:function (o) {
        }
    };
}

if (typeof require == "function") {
    //force load QueadTree
    if (typeof window == "undefined") {
        window = {};
    }
    if (typeof Rectangle == "undefined") {
        Rectangle = function (b, a, c, d) {
            this.x = b == null ? 0 : b;
            this.y = a == null ? 0 : a;
            this.width = c == null ? 0 : c;
            this.height = d == null ? 0 : d
        };
    }
    require("./QuadTree.js");
    QuadTree = window.QuadTree;
}

function guid(delim) {
    function isString(obj) {
        return ( typeof(obj) == "string" || obj instanceof String );
    }

    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    if (!isString(delim)) {
        delim = "-";
    }
    return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
}

//Constants
var EnemyMode = exports.EnemyMode = {
    RANDOM_WALK:1,
    ATTACK_TO_TARGET:2,
    BYPASS_LEFT_TO_TARGET:3,
    BYPASS_RIGHT_TO_TARGET:4
};

var CharacterAction = exports.CharacterAction = {
    NONE:0,
    DEFENCE_MOTION:1,
    DEFENCE:2,
    ATTACK:3,
    PARRIED:4,
    DAMAGE:5,
    DEAD:6
};
var __maxDiffClientTime = 20;
var __tileSize = 128;
exports.currentContext = null;
var AppContext = exports.AppContext = function () {
    var _this = this;
    _this.tileSize = __tileSize;
    _this.currentHostId = -1;
    _this.view = null;
    _this.blockMap = null;
    _this.mapBounds = null;
    _this.childIndex = 0;

    _this.characters = {};
    _this.characterTree = null;
    _this.blocks = [];
    _this.blockTree = null;

    this.updateTree = function () {
        _this.characterTree.clear();
        for (var k in _this.characters) {
            var character = _this.characters[k];
            _this.characterTree.insert(character);
        }
    }


    _this.effectsAnim;
    _this.addEffect = function (x, y, name) {
        var newEffect = _this.effectsAnim.clone();
        newEffect.x = x;
        newEffect.y = y;
        newEffect.gotoAndPlay(name);
        newEffect.onAnimationEnd = function () {
            _this.view.removeChild(newEffect);
        }
        _this.view.addChild(newEffect);
    }

    _this.addCharacter = function (character, x, y) {
        if (typeof character.stateId == "undefined") {
            character.stateId = guid();
        }
        _this.characters[character.stateId] = character;
        _this.characterTree.insert(character);
        if ((typeof x !== "undefined") &&
            (typeof y !== "undefined")) {
            character.x = x;
            character.y = y;
        } else {
            _this.warpToRandom(character);
        }
        character.px = character.x;
        character.py = character.y;
    }

    _this.warpToRandom = function (character) {
        var arr = [];
        for (var i = 0; i < _this.blockMap[0].length; i++) {
            for (var j = 0; j < _this.blockMap.length; j++) {
                var block = _this.blockMap[j][i];
                if (block == null) {
                    arr.push({x:(i + 0.5) * _this.tileSize, y:(j + 0.5) * _this.tileSize});
                }
            }
        }
        var point = arr[Math.max(0, (Math.floor(Math.random() * arr.length) - 1))];
        character.x = point.x;
        character.y = point.y;
    }

    _this.loadBlockMap = function (blockMap) {
        _this.blockMap = blockMap;
        _this.mapBounds = new Rectangle(0, 0, _this.tileSize * _this.blockMap[0].length, _this.tileSize * _this.blockMap.length);
        _this.blockTree = new QuadTree(_this.mapBounds, false);
        _this.characterTree = new QuadTree(_this.mapBounds, false);
    }

    function fixAngle(angle) {
        if (angle > 360) {
        }
        angle = angle % 360;
        if (angle > 180) {
            angle -= 360;
        }
        return angle;
    }

    _this.collideCharacters = function (obj) {
        var oldX = obj.x;
        var oldY = obj.y;
        var isNPC = obj.teamNumber == 0;
        var otherCharacters = _this.characterTree.retrieve(obj);
        var len = otherCharacters.length;
        for (var k = 0; k < len; k++) {
            var other = otherCharacters[k];
            if (other != obj) {
                var deltaX = other.x - oldX;
                var deltaY = other.y - oldY;
                var range = (other.width / 2 + obj.width / 2);
                var collisionRange = range * 0.6;
                var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                var theta = Math.atan2(deltaX, deltaY);
                var angleForOther = 90 - (theta * 180 / Math.PI) - obj.direction;
                angleForOther = fixAngle(angleForOther);
                var theta2 = Math.atan2(-1 * deltaX, -1 * deltaY);
                var angleForObj = 90 - (theta2 * 180 / Math.PI) - other.direction;
                angleForObj = fixAngle(angleForObj);

                if (obj.teamNumber != other.teamNumber
                    && obj.isAction && !obj.isWalk
                    && (obj.action == CharacterAction.ATTACK)
                    && (obj.attackFrame > 2)) {
                    if ((distance < range + 32)
                        && ((angleForOther > -20) && (angleForOther < 80))) {
                        // right
                        if ((other.isAction && (other.action == CharacterAction.DEFENCE)
                            && (other.leftArm != null && other.leftArm.name == "shield"))
                            && ((angleForObj > -30) && (angleForObj < 60))) {
                            var kickBackRange = -1 * Math.random() * obj.width / 2 / 2;
                            obj.x += Math.cos(theta) * kickBackRange;
                            obj.y += Math.sin(theta) * kickBackRange;
                            _this.collideBlocks(obj);
                            obj.isAction = true;
                            obj.action = CharacterAction.PARRIED;
                            obj.parriedCount = 1;
                        } else if (!other.isAction || (other.action != CharacterAction.DAMAGE)) {
                            var kickBackRange = -1 * Math.random() * obj.width / 2 / 2;
                            other.vX += Math.cos(theta) * kickBackRange;
                            other.vY += Math.sin(theta) * kickBackRange;
                            other.isAction = true;
                            other.action = CharacterAction.DAMAGE;
                            other.HP -= Math.ceil(Math.random() * 5 + 5);
                        }
                    }
                }

                if (distance < collisionRange) {
                    obj.x += Math.cos(theta) * (collisionRange - distance);
                    obj.y += Math.sin(theta) * (collisionRange - distance);
                    _this.collideBlocks(obj);
                }
            }
        }
    };

    _this.collideBlocks = function (obj) {
        var oldX = obj.x;
        var oldY = obj.y;

        // 1 / (2 * Math.sqrt(2))
        //var deltaW = obj.width * 0.5;
        //var deltaH = obj.height * 0.5;
        //var delta = 4;
        var deltaW = 0;
        var deltaH = 0;
        var delta = 0;


        var nearBlocks = _this.blockTree.retrieve({x:obj.x - obj.width / 2, y:obj.y - obj.height / 2, width:obj.width, height:obj.height});
        var len = nearBlocks.length;
        for (var i = 0; i < len; i++) {
            var block = nearBlocks[i];
            block.alpha = 1;
            var isFixed = false;
            if (oldY > block.y - deltaH
                && oldY < block.y + _this.tileSize + deltaH
                && obj.px >= block.x + _this.tileSize + obj.width / 2
                && oldX < block.x + _this.tileSize + obj.width / 2) {
                obj.x = block.x + _this.tileSize + obj.width / 2 + delta;
                isFixed = true;
            }

            if (oldY > block.y - deltaH
                && oldY < block.y + _this.tileSize + deltaH
                && oldX > block.x - obj.width / 2
                && obj.px <= block.x - obj.width / 2) {
                obj.x = block.x - obj.width / 2 - delta;
                isFixed = true;
            }

            if (obj.py >= block.y + _this.tileSize + obj.height / 2
                && oldY < block.y + _this.tileSize + obj.height / 2
                && oldX > block.x - deltaW
                && oldX < block.x + _this.tileSize + deltaW) {
                obj.y = block.y + _this.tileSize + obj.height / 2 + delta;
                isFixed = true;
            }

            if (oldY > block.y - obj.height / 2
                && obj.py <= block.y - obj.height / 2
                && oldX > block.x - deltaW
                && oldX < block.x + _this.tileSize + deltaW) {
                obj.y = block.y - obj.height / 2 - delta;
                isFixed = true;
            }

            if (!isFixed) {
                if (oldY > block.y - obj.height / 2
                    && oldY <= block.y
                    && oldX > block.x - deltaW
                    && oldX < block.x + _this.tileSize + deltaW) {
                    obj.y = block.y - obj.height / 2 - delta;
                }
                if (oldY > block.y - deltaH
                    && oldY < block.y + _this.tileSize + deltaH
                    && oldX > block.x - obj.width / 2
                    && oldX <= block.x) {
                    obj.x = block.x - obj.width / 2 - delta;
                }
                if (oldY >= block.y
                    && oldY < block.y + _this.tileSize + obj.height / 2
                    && oldX > block.x - deltaW
                    && oldX < block.x + _this.tileSize + deltaW) {
                    obj.y = block.y + _this.tileSize + obj.height / 2 + delta;
                }
                if (oldY > block.y - deltaH
                    && oldY < block.y + _this.tileSize + deltaH
                    && oldX >= block.x
                    && oldX < block.x + _this.tileSize + obj.width / 2) {
                    obj.x = block.x + _this.tileSize + obj.width / 2 + delta;
                }
            }
        }
        obj.px = obj.x;
        obj.py = obj.y;
    };

    _this.collideCharactersOnServer = function (character) {
        _this.updateTree();
        _this.collideCharacters(character);
        var characters = _this.characterTree.retrieve(character);
        for (var k in characters) {
            var character = characters;
            _this.collideBlocks(character);
        }
    };

    _this.afterCharactersUpdate = function () {
        for (var k in _this.characters) {
            var character = _this.characters[k];
            _this.collideCharacters(character);
        }
        for (var k in _this.characters) {
            var character = _this.characters[k];
            _this.collideBlocks(character);
        }
    };

    //ClientSide
    _this.removeFromStage = function (obj) {
        if (_this.view) {
            _this.view.removeChild(obj);
        }
    };
    _this.addToStage = function (obj) {
        if (_this.childIndex) {
            return _this.view.addChildAt(obj, _this.childIndex);
        } else {
            return _this.view.addChild(obj);
        }
    };
    _this.initializeStage = function (blockMap, tileBmps) {
        _this.loadBlockMap(blockMap);
        _this.view = new Container();
        var lastChild = null;
        for (var i = 0; i < _this.blockMap[0].length; i++) {
            for (var j = 0; j < _this.blockMap.length; j++) {
                //place grass on all tiles
                var tileBmp1 = tileBmps["f1"].clone();
                tileBmp1.x = i * _this.tileSize;
                tileBmp1.y = j * _this.tileSize;
                lastChild = _this.view.addChild(tileBmp1);
            }
        }
        _this.childIndex = _this.view.getChildIndex(lastChild);

        for (var i = 0; i < _this.blockMap[0].length; i++) {
            for (var j = 0; j < _this.blockMap.length; j++) {
                var block = _this.blockMap[j][i];
                if (block) {
                    var tileBmp2 = tileBmps[block].clone();
                    tileBmp2.x = i * _this.tileSize;
                    tileBmp2.y = j * _this.tileSize;
                    tileBmp2.width = _this.tileSize;
                    tileBmp2.height = _this.tileSize;

                    _this.blocks.push(tileBmp2);
                    _this.blockTree.insert(tileBmp2);
                    _this.view.addChild(tileBmp2);
                }
            }
        }
    };
};

var AppUtils = exports.AppUtils = {
    updatePosition:function (character) {
        character.x += character.vX;
        character.y += character.vY;
    },
    simpleAction:function (character, context) {
        function searchTarget() {
            var tempTarget = null;
            var tempDistance = 0;
            for (var k in context.characters) {
                var other = context.characters[k];
                if (other.teamNumber != character.teamNumber) {
                    var otherDistance = Math.sqrt(Math.pow((other.x - character.x), 2)
                        + Math.pow((other.y - character.y), 2));
                    if (tempTarget) {
                        if (otherDistance < tempDistance) {
                            tempTarget = other;
                            tempDistance = otherDistance;
                        }
                    } else {
                        tempTarget = other;
                        tempDistance = otherDistance;
                    }
                }
            }
            if (tempTarget) {
                character.target = tempTarget;
            }
        }

        if (typeof character.aiWait == "undefined") {
            character.aiWait = 0;
        } else if (character.aiWait > 0) {
            character.aiWait--;
        }

        var deltaX, deltaY, range, distance, theta, angleForTarget;
        if (character.target) {
            deltaX = character.target.x - character.x;
            deltaY = character.target.y - character.y;
            range = character.target.height / 2 + character.target.height / 2;
            distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            theta = Math.atan2(deltaX, deltaY);
            angleForTarget = 90 - (theta * 180 / Math.PI) - character.direction;
        } else {
            theta = 0;
            angleForTarget = 90 - (theta * 180 / Math.PI) - character.direction;
            searchTarget();
        }
        if (character.isAction && (character.action == CharacterAction.DAMAGE
            || character.action == CharacterAction.DEAD
            || character.action == CharacterAction.PARRIED)) {
            character.isWalk = false;
        } else {
            if (character.mode == EnemyMode.RANDOM_WALK) {
                if (character.target) {
                    if ((distance < range * 3)
                        && (angleForTarget > -80) && (angleForTarget < 80)) {
                        character.mode = EnemyMode.ATTACK_TO_TARGET;
                    } else if (character.action == CharacterAction.DAMAGE) {
                        character.mode = EnemyMode.ATTACK_TO_TARGET;
                    }
                }
                character.isWalk = true;
                if (Math.random() * 100 > 80) {
                    character.direction = Math.random() * 360;
                    searchTarget();
                }
            } else if (character.mode == EnemyMode.ATTACK_TO_TARGET) {
                if (character.target.HP <= 0) {
                    character.mode = EnemyMode.RANDOM_WALK;
                } else if (distance < range * 1.5) {
                    var dice = Math.random() * 20;
                    if (!character.isAction) {
                        character.isWalk = false;
                        character.isAction = true;
                        character.action = CharacterAction.DEFENCE_MOTION;
                        character.aiWait = 4 + Math.round(dice / 10);
                    } else {
                        if (character.isWalk) {
                            character.action = CharacterAction.NONE;
                            character.isAction = false;
                        }
                        if (character.action == CharacterAction.DEFENCE) {
                            if (character.aiWait <= 0) {
                                character.action = CharacterAction.ATTACK;
                            }
                        }
                    }
                } else {
                    character.isWalk = true;
                }
                character.direction = 90 - (theta * 180 / Math.PI);
                if (distance > range * 5) {
                    character.mode = EnemyMode.RANDOM_WALK;
                }
            }
        }
    },
    inputAction:function (character, context) {
        var _this = character;
        if (typeof _this.defenceCount == "undefined") {
            _this.defenceCount = -1;
        }
        if (_this.isAction && (_this.action == CharacterAction.DAMAGE
            || _this.action == CharacterAction.DEAD
            || _this.action == CharacterAction.PARRIED)) {
            _this.isWalk = false;
        } else {
            if (_this.isMouseDown) {
                _this.direction = 90 - (Math.atan2(_this.axisX, _this.axisY) * 180 / Math.PI);
            }

            if (_this.isCursor) {
                _this.isWalk = true;
                _this.isAction = false;
            } else if (_this.isMouseDown) {
                _this.isWalk = false;
                if (_this.isAction) {
                    if (_this.action == CharacterAction.DEFENCE) {
                        if (_this.defenceCount > 0) {
                            _this.defenceCount--;
                        }
                    }
                } else {
                    _this.isAction = true;
                    _this.action = CharacterAction.DEFENCE_MOTION;
                    _this.defenceCount = 8;
                }
            } else {
                _this.isWalk = false;
                if (_this.isAction) {
                    if (_this.action == CharacterAction.ATTACK) {
                    } else if (_this.action == CharacterAction.DEFENCE
                        && _this.defenceCount > 0) {
                        _this.action = CharacterAction.ATTACK;
                    } else if (_this.action == CharacterAction.DEFENCE_MOTION) {
                        _this.action = CharacterAction.ATTACK;
                    } else {
                        _this.isAction = false;
                        _this.action = CharacterAction.NONE;
                    }
                } else {

                }
            }
        }
    }
}

exports.createStateJson = function (stateId) {
    var json = {};
    json.stateId = stateId;
    json.speed = 5;
    json.width = json.height = 0;
    json.direction = 0;
    json.vX = 0;
    json.vY = 0;
    json.isAction = false;
    json.action = CharacterAction.NONE;
    json.parriedCount = 0;
    json.isWalk = false;
    json.HP = 10;
    json.teamNumber = 0;

    json.x = 0;
    json.y = 0;
    json.rotation = 0;
    json.px = 0;
    json.py = 0;

    json.expire = 200;
    return json;
};
