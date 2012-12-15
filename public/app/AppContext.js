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
var __maxEffectSize = 20;
var __tileSize = 128;
exports.currentContext = null;
var AppContext = exports.AppContext = function (playData) {
    var _this = this;
    _this.tileSize = __tileSize;
    _this.currentHostId = -1;
    _this.view = null;
    _this.blockMap = null;
    _this.floorMap = null;
    _this.autoMap = null;
    _this.mapBounds = null;
    _this.childIndex = 0;

    _this.characters = {};
    _this.characterPreviousPoints = {};
    _this.characterTree = null;
    _this.items = {};
    _this.dropItems = [];
    _this.itemMaster = {};
    _this.blocks = [];
    //_this.blockTree = null;
    _this.mapTips = null;
    _this.heavyTasks = [];
    _this.sounds = null;
    _this.effectsAnimList;

    if (playData) {
        _this.playData = playData;
    } else {
        _this.playData = {
            id: null,
            floorNumber:1,
            rightArm:"shortSword",
            leftArm:"woodenShield"
        };
    }

    this.updateTree = function () {
        _this.characterTree.clear();
        for (var k in _this.characters) {
            var character = _this.characters[k];
            _this.characterTree.insert(character);
        }
    };

    _this.initializeEffectList = function(effect){
        _this.effectsAnimList = new Array();
        for(var i = 0; i < __maxEffectSize; i++){
            _this.effectsAnimList.push(effect.clone());
        }
    };

    _this.addEffect = function (x, y, name) {
        var newEffect = _this.effectsAnimList.shift();
        newEffect.x = x;
        newEffect.y = y;
        newEffect.gotoAndPlay(name);
        newEffect.onAnimationEnd = function () {
            _this.view.removeChild(newEffect);
        }
        _this.view.addChild(newEffect);
        _this.effectsAnimList.push(newEffect);
    };

    _this.playSound = function (name) {
        if (typeof AppMobi != "undefined") {
            var path = $.appPath + "/se";
            try {
                AppMobi.player.playSound(path + "/" + name + ".mp3");
            } catch (e) {
            }
        } else if (_this.sounds && buzz) {
            if (_this.sounds.hasOwnProperty(name)) {
                var sound = _this.sounds[name];
                sound.play();
            }
        }
    };

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
    };

    _this.warpToRandom = function (character) {
        var arr = [];
        for (var i = 0; i < _this.blockMap.length; i++) {
            for (var j = 0; j < _this.blockMap[0].length; j++) {
                var block = _this.blockMap[i][j];
                if (block == null) {
                    arr.push({x:(j + 0.5) * _this.tileSize, y:(i + 0.5) * _this.tileSize});
                }
            }
        }
        var point = arr[Math.max(0, (Math.floor(Math.random() * arr.length) - 1))];
        character.x = point.x;
        character.y = point.y;
        if (_this.characterPreviousPoints.hasOwnProperty(character.stateId)) {
            delete _this.characterPreviousPoints[character.stateId];
        }
    };

    _this.getRandomPoint = function () {
        var arr = [];
        for (var i = 0; i < _this.blockMap.length; i++) {
            for (var j = 0; j < _this.blockMap[0].length; j++) {
                var block = _this.blockMap[i][j];
                if (block == null) {
                    arr.push({x:j, y:i});
                }
            }
        }
        return arr[Math.max(0, (Math.floor(Math.random() * arr.length) - 1))];
    };

    _this.loadBlockMap = function (blockMap) {
        _this.blockMap = blockMap;
        _this.mapBounds = new createjs.Rectangle(0, 0, _this.tileSize * _this.blockMap[0].length, _this.tileSize * _this.blockMap.length);
        _this.characterTree = new QuadTree(_this.mapBounds, false);
        _this.mapTips = null;
    };

    _this.collideCharacters = function (obj) {
        var oldX = obj.x;
        var oldY = obj.y;
        var isNPC = obj.teamNumber == 0;
        var otherCharacters = _this.characters;//_this.characterTree.retrieve(obj);
        //var otherCharacters = _this.characterTree.retrieve(obj);
        var len = otherCharacters.length;
        for (var k in otherCharacters) {
            //for (var k = 0; k < len; k++) {
            var other = otherCharacters[k];
            if (other != obj) {
                var deltaX = other.x - oldX;
                var deltaY = other.y - oldY;
                var range = (other.width / 2 + obj.width / 2);
                var collisionRange = range * 0.6;
                var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                var theta = Math.atan2(deltaY, deltaX);
                var angleForOther = (theta * 180 / Math.PI) - obj.direction;
                angleForOther = AppUtils.fixAngle(angleForOther);
                var angleForObj = (theta * 180 / Math.PI) - 180 - other.direction;
                angleForObj = AppUtils.fixAngle(angleForObj);

                if (obj.teamNumber != other.teamNumber
                    && obj.isAction && !obj.isWalk
                    && (obj.action == CharacterAction.ATTACK)
                    && (obj.attackFrame > 2)) {

                    var weaponRange = 0;
                    var weaponPoint = 0;
                    if (obj.rightArm.type == BitmapItem.TYPE_SWORD) {
                        weaponRange = obj.rightArm.range;
                        weaponPoint = obj.rightArm.bonusPoint;
                    }


                    if ((distance < range + weaponRange)
                        && ((angleForOther > -20) && (angleForOther < 80))) {
                        // right
                        if ((other.isAction && (other.action == CharacterAction.DEFENCE)
                            && (other.leftArm != null && other.leftArm.type == BitmapItem.TYPE_SHIELD))
                            && ((angleForObj > -30) && (angleForObj < 30))) {
                            var kickBackRange = -1 * Math.random() * obj.width / 2 / 2;
                            obj.x -= Math.cos(theta) * kickBackRange;
                            obj.y -= Math.sin(theta) * kickBackRange;
                            _this.collideBlocks(obj);
                            obj.isAction = true;
                            obj.action = CharacterAction.PARRIED;
                            obj.parriedCount = 1;
                            other.leftArm.onUse(other, obj);
                        } else if (!other.isAction || (other.action != CharacterAction.DAMAGE)) {
                            var kickBackRange = -1 * Math.random() * obj.width / 2 / 2;
                            other.vX -= Math.cos(theta) * kickBackRange;
                            other.vY -= Math.sin(theta) * kickBackRange;
                            other.isAction = true;
                            other.action = CharacterAction.DAMAGE;
                            other.HP -= Math.ceil(weaponPoint * (Math.random() * 0.20 + 1));
                            if((player.context.playData != null) && (other == player)){
                                player.context.playData.enemy = obj;
                            }
                        }
                    }
                }

                if (distance < collisionRange) {
                    obj.x -= Math.cos(theta) * (collisionRange - distance);
                    obj.y -= Math.sin(theta) * (collisionRange - distance);
                    _this.collideBlocks(obj);
                }
            }
        }
    };

    _this.getMapPoint = function (obj) {
        return {
            x:Math.floor(obj.x / _this.tileSize),
            y:Math.floor(obj.y / _this.tileSize)
        }
    };

    _this.collideBlocks = function (obj) {
        var oldX = obj.x;
        var oldY = obj.y;

        // 1 / (2 * Math.sqrt(2))
        //var deltaW = obj.width * 0.5;
        //var deltaH = obj.height * 0.5;
        //var delta = 4;
        var deltaW = 4;
        var deltaH = 4;
        var delta = 0;


        //var nearBlocks = _this.blockTree.retrieve({x:obj.x - obj.width / 2, y:obj.y - obj.height / 2, width:obj.width, height:obj.height});
        var mapPoint = _this.getMapPoint(obj);
        var nearBlocks = [];
        for (var _y = mapPoint.y - 2; _y < mapPoint.y + 3; _y++) {
            for (var _x = mapPoint.x - 2; _x < mapPoint.x + 3; _x++) {
                if ((typeof _this.blockMap[_y] != "undefined")
                    && (typeof _this.blockMap[_y][_x] != "undefined")
                    && (_this.blockMap[_y][_x] != null)) {
                    nearBlocks.push({
                        x:_x * _this.tileSize,
                        y:_y * _this.tileSize
                    });
                }
            }
        }
        var len = nearBlocks.length;
        for (var i = 0; i < len; i++) {
            var block = nearBlocks[i];
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

        if (_this.floorMap) {
            for (var k in _this.characters) {
                var character = _this.characters[k];
                var mapPoint = _this.getMapPoint(character);
                var floor = _this.floorMap[mapPoint.y][mapPoint.x];
                if (_this.characterPreviousPoints.hasOwnProperty(character.stateId)) {
                    var prev = _this.characterPreviousPoints[character.stateId];
                    var prevMapPoint = _this.getMapPoint(prev);
                    var dX = Math.abs(mapPoint.x - prevMapPoint.x);
                    var dY = Math.abs(mapPoint.y - prevMapPoint.y);
                    if (!floor) {
                        character.x = prev.x;
                        character.y = prev.y
                    } else if ((dX > 1) || (dY > 1)) {
                        character.x = prev.x;
                        character.y = prev.y
                    }
                }
                if (floor) {
                    _this.characterPreviousPoints[character.stateId] = {'x':character.x, 'y':character.y};
                }
            }
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
    _this.initializeStage = function (blockMap, tileBmps, sounds) {
        var tileNumber =  (Math.floor((_this.playData.floorNumber - 1) / 3) % 3) + 1;
        _this.loadBlockMap(blockMap);
        _this.view = new createjs.Container();
        var lastChild = null;
        var goal = _this.getRandomPoint();
        _this.floorMap = [];
        for (var i = 0; i < _this.blockMap.length; i++) {
            var line = [];
            for (var j = 0; j < _this.blockMap[0].length; j++) {
                var floorName = null;
                //place grass on all tiles
                var block = _this.blockMap[i][j];
                if ((block == null)
                    || (block.substring(0, 1) != "w")) {
                    if (j == goal.x && i == goal.y) {
                        floorName = "s1";
                    } else {
                        floorName = "f1";
                    }
                    var tileBmp1 = tileBmps[floorName].clone();
                    tileBmp1.x = j * _this.tileSize;
                    tileBmp1.y = i * _this.tileSize;
                    lastChild = _this.view.addChild(tileBmp1);
                }
                line[j] = floorName;
            }
            _this.floorMap[i] = line;
        }
        //_this.childIndex = _this.view.getChildIndex(lastChild) + 1;

        for (var i = 0; i < _this.blockMap.length; i++) {
            for (var j = 0; j < _this.blockMap[0].length; j++) {
                var block = _this.blockMap[i][j];
                if (block && (block != "w1")) {
                    var blockName = block;
                    var tileBmp2 = tileBmps[blockName].clone();
                    tileBmp2.x = j * _this.tileSize;
                    tileBmp2.y = i * _this.tileSize;
                    tileBmp2.width = _this.tileSize;
                    tileBmp2.height = _this.tileSize;

                    _this.blocks.push(tileBmp2);
                    //_this.blockTree.insert(tileBmp2);
                    lastChild = _this.view.addChild(tileBmp2);
                }
            }
        }
        _this.childIndex = _this.view.getChildIndex(lastChild) + 1;
        _this.sounds = sounds;
    };

    _this.drawMap = function (point, stage) {
        var tipSize = 6;
        var range = 2;

        function drawAutoMap() {
            var g = new createjs.Graphics();
            for (var i = 0; i < _this.floorMap.length; i++) {
                for (var j = 0; j < _this.floorMap[0].length; j++) {
                    if (_this.autoMap[i][j] == 1) {
                        var floor = _this.floorMap[i][j];
                        var _x = j * tipSize;
                        var _y = i * tipSize;
                        if ((floor != null) && (floor.indexOf("f1") === 0)) {
                            g.beginFill(createjs.Graphics.getRGB(128, 160, 255, 0.7));
                            g.drawRect(_x, _y, tipSize, tipSize);
                        } else if ((floor != null) && (floor.indexOf("s1") === 0)) {
                            g.beginFill(createjs.Graphics.getRGB(255, 255, 128, 0.7));
                            g.drawRect(_x, _y, tipSize, tipSize);
                        }
                    }
                }
            }
            return g;
        }

        function updateAutoMap() {
            var result = false;
            for (var i = point.y - range; i <= point.y + range; i++) {
                for (var j = point.x - range; j <= point.x + range; j++) {
                    if (typeof _this.autoMap[i] != "undefined") {
                        if (typeof _this.autoMap[i][j] != "undefined") {
                            if (_this.autoMap[i][j] == 0) {
                                result = true;
                                _this.autoMap[i][j] = 1;
                            }
                        }
                    }
                }
            }
            return result;
        }

        if (_this.mapTips == null) {

            _this.autoMap = [];
            for (var i = 0; i < _this.floorMap.length; i++) {
                _this.autoMap[i] = AppUtils.filledArray(0, _this.floorMap[0].length);
            }

            updateAutoMap();
            var g2 = new createjs.Graphics();
            g2.beginFill(createjs.Graphics.getRGB(64, 255, 64, 0.7));
            g2.drawRect(0, 0, 6, 6);

            _this.mapTips = {
                background:new createjs.Shape(drawAutoMap()),
                player:new createjs.Shape(g2)
            }
            _this.mapTips.background.cache(0, 0, 300, 300);
            _this.mapTips.player.cache(0, 0, 6, 6);
            stage.addChild(_this.mapTips.background);
            stage.addChild(_this.mapTips.player);
        } else {
            if (updateAutoMap()) {
                stage.removeChild(_this.mapTips.player);
                stage.removeChild(_this.mapTips.background);
                _this.mapTips.background = new createjs.Shape(drawAutoMap());
                _this.mapTips.background.cache(0, 0, 300, 300);
                stage.addChild(_this.mapTips.background);
                stage.addChild(_this.mapTips.player);
            }
        }
        _this.mapTips.player.x = point.x * tipSize;
        _this.mapTips.player.y = point.y * tipSize;
    };
};

var AppUtils = exports.AppUtils = {
    updatePosition:function (character) {
        character.x += character.vX;
        character.y += character.vY;
    },
    pathToTarget:function (character, target, context) {
        var SEARCH_LEVEL = 3;
        var trail = [];

        var nodeMax = 0;
        var retryMax = 0;
        var goalCount = 0;

        var mapHeight = context.floorMap.length;
        var mapWidth = context.floorMap[0].length;

        var Node = function (x, y) {
            var _this = this;
            /** x座標 */
            this.x = 0;
            /** y座標 */
            this.y = 0;

            if ((typeof x != "undefined")
                && (typeof y != "undefined")) {
                this.x = x;
                this.y = y;
            }
            /** 次のノード */
            this.next = null;

            /**
             * 次のノードを返します。
             * @return 次のノード
             */
            this.getNext = function () {
                return _this.next;
            };

            /**
             * 次のノードを設定します。
             * @param next 次のノード
             */
            this.setNext = function (next) {
                _this.next = next;
            };

            /**
             * ノードを次のノードとの間に挿入します。
             * @param node 挿入するノード
             */
            this.insert = function (node) {
                node.setNext(_this.next);
                _this.next = node;
            };

            /**
             * 次のノードを取り除きます。
             */
            this.removeNext = function () {
                _this.next = _this.next.getNext();
            };
        };

        var isStreet = function (x, y) {
            if (typeof y == "undefined") {
                return isStreet(x.x, x.y);
            }
            if ((y < 0) || (y >= mapHeight)
                || (x < 0) || (x >= mapWidth)
                || (context.floorMap[y][x] == null)) {
                return false;
            }
            return true;
        };

        var isStraightPoint = function (x1, y1, x2, y2) {
            if (x1 == x2) {
                var start = Math.min(y1, y2);
                var end = Math.max(y1, y2);
                for (var y = start; y <= end; y++) {
                    if (!isStreet(x1, y)) {
                        return false;
                    }

                }
                return true;
            } else if (y1 == y2) {
                var start = Math.min(x1, x2);
                var end = Math.max(x1, x2);
                for (var x = start; x <= end; x++) {
                    if (!isStreet(x, y1)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };

        var isStraight = function (node, nextNode) {
            if (typeof nextNode == "undefined") {
                if (node == null) {
                    return false;
                }
                return isStraight(node, node.getNext());
            }
            if (node == null || nextNode == null) {
                return false;
            }
            return isStraightPoint(node.x, node.y, nextNode.x, nextNode.y);
        };

        var countNode = function (node) {
            var count = 1;
            while ((node = node.getNext()) != null) {
                count++;
            }
            return count;
        };

        var searchRoute = function (node, level) {
            // 次に進むノードを取得
            if (node == null) {
                return;
            }
            var nextNode = node.getNext();

            // 終端なら探索終了
            if (nextNode == null) return;
            // 対象のノードが進入不可能な位置にあるなら探索終了
            if (!isStreet(node) || !isStreet(nextNode)) {
                return;
            }
            // 一直線に進めるなら探索終了
            if (isStraight(node)) {
                return;
            }

            // 進めない場合は、中継ノードを求め挿入
            var relayNode = searchRelayNode(node);
            if (relayNode != null) {
                //
                for (var i = 0; i < trail.length; i++) {
                    var trailNode = trail[i];
                    if ((trailNode.x == relayNode.x)
                        && (trailNode.y == relayNode.y)) {
                        console.log("no route");
                        return null;
                    }
                }
                trail.push(relayNode);

                /*
                 console.log("relay " + relayNode.x + ", " + relayNode.y
                 + " to " + goalPos.x + ", " + goalPos.y);

                 console.log("from " + node.x + ", " + node.y
                 + " to " + goalPos.x + ", " + goalPos.y);
                 */

                node.insert(relayNode);
                // 余分なノードを除去
                if (isStraight(relayNode, nextNode.getNext())) {
                    relayNode.removeNext();
                }
                // 再帰的に探索
                if (level >= SEARCH_LEVEL) {
                    searchRoute(relayNode, ++level);
                }
                searchRoute(node, ++level);
            }

            // 最大ノード数を集計
            var count = countNode(node);
            nodeMax = Math.max(nodeMax, count);
        };

        var searchRelayNode = function (node) {
            var nextNode = node.getNext();
            // 中間点を求める
            var x = Math.round((node.x + nextNode.x) / 2);
            var y = Math.round((node.y + nextNode.y) / 2);
            var relayNode = new Node(x, y);

            // 次のノードとの位置関係で場合分けする
            if (node.x == nextNode.x) {
                // 上下に移動可能な場所を探す
                for (var d = 0; d <= mapWidth; d++) {
                    if (isStreet(relayNode.x + d, relayNode.y)) {
                        relayNode.x = relayNode.x + d;
                        break;
                    } else if (isStreet(relayNode.x - d, relayNode.y)) {
                        relayNode.x = relayNode.x - d;
                        break;
                    }
                }
            } else if (node.y == nextNode.y) {
                // 左右に移動可能な場所を探す
                for (var d = 0; d <= mapHeight; d++) {
                    if (isStreet(relayNode.x, relayNode.y + d)) {
                        relayNode.y = relayNode.y + d;
                        break;
                    } else if (isStreet(relayNode.x, relayNode.y - d)) {
                        relayNode.y = relayNode.y - d;
                        break;
                    }
                }
            } else {
                // 1回曲がって到達可能か？
                if (isStraightPoint(node.x, node.y, node.x, nextNode.y) &&
                    isStraightPoint(node.x, nextNode.y, nextNode.x, nextNode.y)) {
                    relayNode.x = node.x;
                    relayNode.y = nextNode.y;
                } else if (isStraightPoint(node.x, node.y, nextNode.x, node.y) &&
                    isStraightPoint(nextNode.x, node.y, nextNode.x, nextNode.y)) {
                    relayNode.x = nextNode.x;
                    relayNode.y = node.y;
                } else {
                    var dx = node.x < nextNode.x ? 1 : -1;
                    var dy = node.y < nextNode.y ? 1 : -1;

                    for (var d = 0; d <= mapWidth; d++) {
                        if (isStreet(relayNode.x + d, relayNode.y - d * (dx * dy))) {
                            relayNode.x += d;
                            relayNode.y -= d * (dx * dy);
                            break;
                        } else if (isStreet(relayNode.x - d, relayNode.y + d * (dx * dy))) {
                            relayNode.x -= d;
                            relayNode.y += d * (dx * dy);
                            break;
                        }
                    }
                }
            }
            return relayNode;
        };

        var startPos = context.getMapPoint(character);
        var goalPos = context.getMapPoint(target);
        var startNode = new Node(startPos.x, startPos.y);
        var goalNode = new Node(goalPos.x, goalPos.y);
        startNode.setNext(goalNode);
        searchRoute(startNode, 1);
    },
    pathToRandom:function (character, context) {
        var result = [];
        var vectors = [
            [1, 0],
            [0, -1],
            [-1, 0],
            [0, 1]
        ];

        function restart(list, index) {
            var start = index % list.length;
            return list.slice(start).concat(list.slice(0, start));
        }

        var _vectors = vectors;
        for (var j = 0; j < 100; j++) {
            var mapHeight = context.floorMap.length;
            var mapWidth = context.floorMap[0].length;
            var vectorsSize = vectors.length;
            var mapPt = context.getMapPoint(character);
            for (var i = 0; i < vectorsSize; i++) {
                var v = _vectors[i];
                var x = mapPt.x + v[0];
                var y = mapPt.y + v[1];
                //マップが範囲外または壁(O)の場合はcontinue
                if ((y < 0) || (y >= mapHeight)
                    || (x < 0) || (x >= mapWidth)
                    || (context.floorMap[y][x] == null)) {
                    continue;
                }
                result.push({x:x, y:y});
                _vectors = restart(_vectors, i);
                break;
            }
        }
        return result;
    },
    pathToTargetByAStar:function (character, target, context, maxDepth) {
        var depth = 0;
        if (!target) {
            for (var k in context.characters) {
                var other = context.characters[k];
                if (other.teamNumber != character.teamNumber) {
                    target = other;
                    break;
                }
            }
        }
        if (!maxDepth) {
            maxDepth = 100;
        }

        var Node = function (x, y) {
            var _this = this;
            if ((typeof x != "undefined")
                && (typeof y != "undefined")) {
                _this.pos = {x:x, y:y};
            } else {
                _this.pos = context.getMapPoint(character);
            }
            _this.goal = context.getMapPoint(target);

            _this.hs = Math.pow((_this.pos.x - _this.goal.x), 2)
                + Math.pow((_this.pos.y - _this.goal.y), 2);
            _this.fs = 0;
            _this.ownerList = null;
            _this.parentNode = null;

            _this.isGoal = function () {
                return ((_this.goal.x == _this.pos.x) && (_this.goal.y == _this.pos.y));
            };
        };

        var NodeList = function (list) {
            var _this = this;
            _this.list = list;
            _this.find = function (x, y) {
                var self = _this.list;
                for (var k in self) {
                    var t = self[k];
                    if ((t.pos.x == x) && (t.pos.y == y)) {
                        return t;
                    }
                }
                return null;
            };

            _this.remove = function (node) {
                var self = _this.list;
                for (var k = 0; k < self.length; k++) {
                    if (self.hasOwnProperty(k)) {
                        if (node == self[k]) {
                            self.splice(k, 1);
                            delete node;
                            break;
                        }
                    }
                }
            };

            _this.append = function (object) {
                _this.list.push(object);
            };

            _this.minFs = function () {
                var min = null;
                var self = _this.list;
                var node = null;
                for (var k in self) {
                    if (self.hasOwnProperty(k)) {
                        node = self[k];
                        if ((min == null) || (min > node.fs)) {
                            min = node.fs;
                        }
                    }
                }
                return node;
            };
        };

        //スタート位置とゴール位置を設定
        var startNode = new Node();
        var endNode = null;
        var mapHeight = context.floorMap.length;
        var mapWidth = context.floorMap[0].length;

        //OpenリストとCloseリストを設定
        var openList = new NodeList([]);
        var closeList = new NodeList([]);
        startNode.fs = startNode.hs;
        openList.append(startNode);

        var vectors = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ];
        var vectorsSize = vectors.length;

        while (true) {
            depth++;
            if (depth > maxDepth) {
                break;
            }

            //Openリストが空になったら解なし
            if (openList.list.length == 0) {
                break;
            }
            //Openリストからf*が最少のノードnを取得
            var n = openList.minFs();
            if (n == null) {
                break;
            }
            openList.remove(n)
            closeList.append(n)

            //最小ノードがゴールだったら終了
            if (n.isGoal()) {
                endNode = n;
                break;
            }


            //f*() = g*() + h*() -> g*() = f*() - h*()
            var n_gs = n.fs - n.hs;

            //ノードnの移動可能方向のノードを調べる
            for (var i = 0; i < vectorsSize; i++) {
                var v = vectors[i];
                var x = n.pos.x + v[0];
                var y = n.pos.y + v[1];
                //マップが範囲外または壁(O)の場合はcontinue
                if ((y < 0) || (y >= mapHeight)
                    || (x < 0) || (x >= mapWidth)
                    || (context.floorMap[y][x] == null)) {
                    continue;
                }

                //移動先のノードがOpen,Closeのどちらのリストに
                //格納されているか、または新規ノードなのかを調べる
                var m = openList.find(x, y);
                var dist = Math.pow((n.pos.x - x), 2)
                    + Math.pow((n.pos.y - y), 2);
                if (m) {
                    //移動先のノードがOpenリストに格納されていた場合、
                    //より小さいf*ならばノードmのf*を更新し、親を書き換え
                    if (m.fs > n_gs + m.hs + dist) {
                        m.fs = n_gs + m.hs + dist;
                        m.parentNode = n;
                    }
                } else {
                    m = closeList.find(x, y)
                    if (m) {
                        //移動先のノードがCloseリストに格納されていた場合、
                        //より小さいf*ならばノードmのf*を更新し、親を書き換え
                        //かつ、Openリストに移動する
                        if (m.fs > n_gs + m.hs + dist) {
                            m.fs = n_gs + m.hs + dist;
                            m.parentNode = n;
                            openList.append(m);
                            closeList.remove(m);
                        }

                    } else {
                        //新規ノードならばOpenリストにノードに追加
                        m = new Node(x, y);
                        m.fs = n_gs + m.hs + dist
                        m.parentNode = n
                        openList.append(m);
                    }
                }
            }
        }
        //endノードから親を辿っていくと、最短ルートを示す
        var list = null;
        if (endNode != null) {
            list = [];
            var n = endNode;
            var count = 0;
            while ((n != null) && (n.parentNode != null)) {
                list.unshift({x:n.pos.x, y:n.pos.y});
                n = n.parentNode;
            }
        }
        if (context.heavyTasks.indexOf(character.stateId)) {
            var i = context.heavyTasks.indexOf(character.stateId);
            context.heavyTasks.splice(i, 1);
        }
        return list;
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
        var pathDeltaX, pathDeltaY, pathTheta;
        if (character.target) {
            deltaX = character.target.x - character.x;
            deltaY = character.target.y - character.y;
            range = character.target.height / 2 + character.target.height / 2;
            distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            theta = Math.atan2(deltaY, deltaX);
            angleForTarget = (theta * 180 / Math.PI) - character.direction;
        } else {
            theta = 0;
            angleForTarget = (theta * 180 / Math.PI) - character.direction;
            searchTarget();
        }
        if (character.isAction && (character.action == CharacterAction.DAMAGE
            || character.action == CharacterAction.DEAD
            || character.action == CharacterAction.PARRIED)) {
            character.isWalk = false;
        } else {
            if (character.mode == EnemyMode.RANDOM_WALK) {
                if ((!character.hasOwnProperty("path"))
                    || (!character.path)) {

                    var target;
                    if (character.target) {
                        target = character.target;
                    } else {
                        target = {x:0, y:0};
                        target = context.warpToRandom(target);
                    }
                    if (context.heavyTasks.length < 2) {
                        if (context.heavyTasks.indexOf(character.stateId) < 0) {
                            context.heavyTasks.push(character.stateId);
                            setTimeout(function () {
                                    character.path = AppUtils.pathToTargetByAStar(character, target, context);
                                    if (character.path != null) {
                                        character.nextToTarget = character.path.shift();
                                    }
                                }, (1000 * Math.random())
                            );
                        }
                    }
                    character.path = AppUtils.pathToRandom(character, context);
                    character.nextToTarget = character.path.shift();
                }
                if (character.target) {
                    if ((distance < range * 5)
                        && (angleForTarget > -60) && (angleForTarget < 60)) {
                        character.mode = EnemyMode.ATTACK_TO_TARGET;
                    } else if (character.action == CharacterAction.DAMAGE) {
                        character.mode = EnemyMode.ATTACK_TO_TARGET;
                        character.direction = (theta * 180 / Math.PI);
                    }
                }

                if (character.mode != EnemyMode.ATTACK_TO_TARGET) {
                    character.isWalk = true;
                    if ((!character.target)
                        || (Math.random() * 100 > 80)) {
                        //change to nearest target
                        searchTarget();
                    } else if (character.hasOwnProperty("nextToTarget")
                        && (character.nextToTarget != null)) {
                        var mapPt = context.getMapPoint(character);
                        if ((character.nextToTarget.x == mapPt.x)
                            && (character.nextToTarget.y == mapPt.y)) {
                            character.nextToTarget = character.path.shift();
                        }
                        if (character.nextToTarget) {
                            var nextPoint = {x:(character.nextToTarget.x + 0.5) * context.tileSize,
                                y:(character.nextToTarget.y + 0.5) * context.tileSize};
                            var _deltaX = nextPoint.x - character.x;
                            var _deltaY = nextPoint.y - character.y;
                            var _theta = Math.atan2(_deltaY, _deltaX);
                            character.direction = (_theta * 180 / Math.PI);
                        }
                    }
                    if (character.path.length == 0) {
                        character.path = null;
                    }
                }
            } else if (character.mode == EnemyMode.ATTACK_TO_TARGET) {
                if (character.target.HP <= 0) {
                    character.mode = EnemyMode.RANDOM_WALK;
                } else if (distance < range + character.rightArm.range) {
                    var dice = Math.random() * 4;
                    if (!character.isAction) {
                        character.isWalk = false;
                        character.isAction = true;
                        character.action = CharacterAction.DEFENCE_MOTION;
                        character.aiWait = Math.max((10 - character.speed) + Math.round(dice), 0);
                    } else {
                        if (character.isWalk) {
                            character.action = CharacterAction.NONE;
                            character.isAction = false;
                        }
                        if ((character.action == CharacterAction.DEFENCE)
                            || (character.action == CharacterAction.DEFENCE_MOTION)) {
                            if (character.aiWait <= 0) {
                                character.action = CharacterAction.ATTACK;
                            }
                        }
                    }
                } else {
                    character.isWalk = true;
                }
                character.direction = (theta * 180 / Math.PI);
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
            if (_this.isMouseDown || _this.isMouseClick) {
                _this.direction = (Math.atan2(_this.axisY, _this.axisX) * 180 / Math.PI);
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
                if (!_this.isAction && _this.isMouseClick) {
                    _this.isAction = true;
                    _this.action = CharacterAction.DEFENCE_MOTION;
                }

                if (_this.isAction) {
                    if (_this.action == CharacterAction.ATTACK) {
                    } else if ((_this.action == CharacterAction.DEFENCE)
                        && (_this.defenceCount > 0)) {
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
        _this.isMouseClick = false;
    },
    filledArray:function (v, length) {
        var array = [];
        for (var i = 0; i < length; array[i++] = v);
        return array;
    },
    fixAngle:function (angle) {
        angle = angle % 360;
        if (angle > 180) {
            angle -= 360;
        } else if (angle < -180) {
            angle += 360;
        }
        return angle;
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


String.prototype.startsWith = function (prefix, toffset) {
    var i = 0;
    if (toffset && (typeof toffset === 'number')) {
        i = toffset;
    }
    return this.slice(i).indexOf(prefix) === 0;
};

String.prototype.endsWith = function (suffix) {
    var sub = this.length - suffix.length;
    return (sub >= 0) && (this.lastIndexOf(suffix) === sub);
};

String.prototype.chop = function () {
    return this.substring(0, this.length - 1);
};


