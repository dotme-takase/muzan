//function called by the Tick instance at a set interval
var _ = new Object();
_.initializing = true;
function tick() {
    _.context.updateTree();

    for (var k in _.context.characters) {
        var character = _.context.characters[k];
        AppUtils.updatePosition(character);
        _.context.collideBlocks(character);
    }

    _.context.afterCharactersUpdate();
    _.context.view.x = _.canvas.width / 2 - player.x;
    _.context.view.y = _.canvas.height / 2 - player.y;
    _.stage.update();

    var point = _.context.getMapPoint(player);
    var floor = _.context.floorMap[point.y][point.x];

    if (_.context.playData) {
        _.scoreField.text = "B" + _.context.playData.floorNumber + "F: " + player.HP + " / 100";
    }

    if (!_.initializing) {
        if (player.HP <= 0) {
            _.initializing = true;
            $.dataStore.put('playData', null);
            setTimeout(function () {
                if (_.context.playData.hasOwnProperty('enemy')) {
                    var date = formatDate(new Date(), 'yyyy/MM/dd HH:mm');
                    var record = {
                        enemy:_.context.playData.enemy.name,
                        floor:_.context.playData.floorNumber,
                        date:date
                    }
                    var rank = $.localRanking.insert(_.context.playData.floorNumber, record);
                    if (rank == null) {
                        rank = "out";
                    }
                    $('#stageCanvas').fadeOut("slow", function () {
                        location.href = $.appPath + "/../ranking.html#" + rank;
                    });
                }
            }, 1000);
        } else if ((floor != null) && (floor.indexOf("s1") === 0)) {
            _.initializing = true;
            _.context.playData.enemy = null;
            _.context.playData.floorNumber++;
            _.context.playData.id = uuid();
            $.dataStore.put('playData', _.context.playData);
            _.context.playSound("downstair");
            $('#stageCanvas').fadeOut('normal', function () {
                location.href = "screen.html?pdid=" + _.context.playData.id;
            });
            $.showLoading();
        } else {
            _.context.drawMap(point, _.stage);
        }
    }
}
var __tileBmps = {};
var __blockMap = [];
var __sounds = null;
var enemyData = [
    {
        body:'1_128',
        name:'Militia',
        HP:10,
        speed:8,
        items:{
            rightArm:"shortSword",
            leftArm:"woodenShield",
            dropItems:{
                woodenShield:3,
                aidBox:5
            }
        }
    },
    {
        body:'2_128',
        name:'Militia',
        HP:10,
        speed:8,
        items:{
            rightArm:"shortSword",
            leftArm:"woodenShield",
            dropItems:{
                woodenShield:3,
                aidBox:5
            }
        },
        handMap:BaseCharacter.HANDMAP_2X
    },
    {
        body:1,
        name:'Militia',
        HP:10,
        speed:8,
        items:{
            rightArm:"shortSword",
            leftArm:"woodenShield",
            dropItems:{
                woodenShield:3,
                aidBox:5
            }
        }
    },
    {
        body:5,
        name:'Thief',
        HP:10,
        speed:10,
        items:{
            rightArm:"shortSword",
            leftArm:null,
            dropItems:{
                fasterShortSword:1,
                aidBox:3
            }
        }
    },
    {
        body:4,
        name:'Soldier',
        HP:15,
        speed:7,
        items:{
            rightArm:"shortSword",
            leftArm:"bronzeShield",
            dropItems:{
                bronzeShield:3,
                aidBox:5
            }
        }
    },
    {
        body:2,
        name:'IronNight',
        HP:40,
        speed:6,
        items:{
            rightArm:"longSword",
            leftArm:null,
            dropItems:{
                longSword:3,
                aidBox:5
            }
        }
    },
    {
        body:5,
        name:'Thief',
        HP:20,
        speed:12,
        items:{
            rightArm:"fasterShortSword",
            leftArm:null,
            dropItems:{
                katana:2,
                fasterShortSword:6,
                aidBox:8
            }
        }
    },
    {
        body:6,
        name:'Barbarian',
        HP:40,
        speed:7,
        items:{
            rightArm:"handAxe",
            leftArm:"bronzeShield",
            dropItems:{
                handAxe:5,
                bronzeShield:3,
                aidBox:5
            }
        }
    },
    {
        body:4,
        name:'Soldier',
        HP:40,
        speed:10,
        items:{
            rightArm:"ryuyotou",
            leftArm:"ironShield",
            dropItems:{
                ryuyotou:2,
                ironShield:3,
                aidBox:3
            }
        }
    },
    {
        body:3,
        name:'RedSamurai',
        HP:50,
        speed:12,
        items:{
            rightArm:"katana",
            leftArm:null,
            dropItems:{
                katana:1,
                aidBox:5
            }
        }
    },
    {
        body:5,
        name:'Thief',
        HP:40,
        speed:14,
        items:{
            rightArm:"katana",
            leftArm:"redShield",
            dropItems:{
                katana:3,
                redShield:1,
                aidBox:5
            }
        }
    },
    {
        body:2,
        name:'IronNight',
        HP:80,
        speed:7,
        items:{
            rightArm:"broadSword",
            leftArm:"blueShield",
            dropItems:{
                broadSword:1,
                blueShield:2,
                aidBox:5
            }
        }
    }
];

var itemData = {
    shortSword:{
        type:BitmapItem.TYPE_SWORD,
        range:20,
        bonusPoint:4,
        speed:1
    },
    longSword:{
        type:BitmapItem.TYPE_SWORD,
        range:28,
        bonusPoint:8,
        speed:0
    },
    fasterShortSword:{
        type:BitmapItem.TYPE_SWORD,
        range:20,
        bonusPoint:5,
        speed:2
    },
    handAxe:{
        type:BitmapItem.TYPE_SWORD,
        range:22,
        bonusPoint:16,
        speed:-2
    },
    katana:{
        type:BitmapItem.TYPE_SWORD,
        range:28,
        bonusPoint:10,
        speed:1
    },
    ryuyotou:{
        type:BitmapItem.TYPE_SWORD,
        range:24,
        bonusPoint:13,
        speed:-1
    },
    broadSword:{
        type:BitmapItem.TYPE_SWORD,
        range:32,
        bonusPoint:12,
        speed:0
    },
    woodenShield:{
        type:BitmapItem.TYPE_SHIELD,
        HP:10,
        bonusPoint:4
    },
    bronzeShield:{
        type:BitmapItem.TYPE_SHIELD,
        HP:40,
        bonusPoint:5
    },
    ironShield:{
        type:BitmapItem.TYPE_SHIELD,
        HP:80,
        bonusPoint:6
    },
    blueShield:{
        type:BitmapItem.TYPE_SHIELD,
        HP:60,
        bonusPoint:12
    },
    redShield:{type:BitmapItem.TYPE_SHIELD,
        HP:70,
        bonusPoint:16
    },
    aidBox:{
        type:BitmapItem.TYPE_MISC,
        onUse:function (character, target) {
            var aid = 50;
            character.context.addEffect(character.x,
                character.y,
                'heal');
            _.context.playSound("heal");
            character.HP += Math.min(100 - character.HP,
                aid);
        }
    }
};


//initialize function, called when page loads.
$.loadTiles = function (filename, callback) {
    $.showLoading();
    $('#stageCanvas').hide();
    delete $.spriteSheetTiles;
    for (var name in __tileBmps) {
        delete __tileBmps[name];
    }
    delete __tileBmps;

    $.spriteSheetTiles = new createjs.SpriteSheet({
        images:[$.appPath + "/img/" + filename + ".png"],
        frames:{width:__tileSize, height:__tileSize},
        animations:{
            w1:[9, 9],
            w1_tl1:[0, 0],
            w1_t1:[1, 1],
            w1_tr1:[2, 2],
            w1_l1:[5, 5],
            w1_r1:[7, 7],
            w1_bl1:[10, 10],
            w1_b1:[11, 11],
            w1_br1:[12, 12],
            w1_br2:[3, 3],
            w1_bl2:[4, 4],
            w1_tr2:[8, 8],
            w1_tl2:[9, 9],
            f1:[16, 16],
            s1:[21, 21]
        }
    });
    $.spriteSheetTiles.onComplete = function () {
        var names = $.spriteSheetTiles.getAnimations();
        for (var k in names) {
            var name = names[k];
            var bitmap = new createjs.Bitmap(createjs.SpriteSheetUtils.extractFrame($.spriteSheetTiles, name));
            __tileBmps[name] = bitmap;
        }
        $.hideLoading();
        $('#stageCanvas').fadeIn();
        callback.call(this);
    }
};

$.initializeFirst = function () {
    function initializeGame(playData) {
        _.stage = new createjs.Stage(_.canvas);
        _.context = new AppContext(playData);
        _.context.initializeStage(__blockMap, __tileBmps, __sounds);
        _.stage.addChild(_.context.view);

        _.scoreField = new createjs.Text("", "bold 12px Arial", "#FFFFFF");
        _.scoreField.textAlign = "right";
        _.scoreField.y = 22;
        window.onorientationchange();

        var spriteSheetEffects = new createjs.SpriteSheet({
            images:[$.appPath + "/img/effect.png"],
            frames:{width:128, height:128, regX:64, regY:64},
            animations:{
                damage:[0, 4],
                parried:[5, 9],
                heal:[10, 24],
                dead:[25, 39]
            }
        });
        _.context.initializeEffectList(new createjs.BitmapAnimation(spriteSheetEffects));

        var spriteSheetSwords = new createjs.SpriteSheet({
            images:[$.appPath + "/img/swords.png"],
            frames:{width:32, height:64, regX:15, regY:55},
            animations:{
                shortSword:0,
                shortSword_:0,
                longSword:1,
                longSword_:1,
                fasterShortSword:2,
                fasterShortSword_:2,
                handAxe:3,
                handAxe_:3,
                katana:4,
                katana_:4,
                ryuyotou:5,
                ryuyotou_:5,
                broadSword:6,
                broadSword_:6
            }
        });

        var spriteSheetShields = new createjs.SpriteSheet({
            images:[$.appPath + "/img/shields.png"],
            frames:{width:32, height:32, regX:16, regY:20},
            animations:{
                woodenShield:0,
                woodenShield_:16,
                bronzeShield:1,
                bronzeShield_:17,
                ironShield:2,
                ironShield_:18,
                blueShield:3,
                blueShield_:19,
                redShield:4,
                redShield_:20
            }
        });

        var spriteSheetItems = new createjs.SpriteSheet({
            images:[$.appPath + "/img/items.png"],
            frames:{width:32, height:32, regX:16, regY:20},
            animations:{
                aidBox:0
            }
        });

        for (var i in itemData) {
            if (itemData.hasOwnProperty(i)) {
                var item = itemData[i];
                switch (item.type) {
                    case BitmapItem.TYPE_SWORD:
                        _.context.itemMaster[i] = new BitmapItem(spriteSheetSwords, item);
                        _.context.itemMaster[i].gotoAndStop(i);
                        break;
                    case BitmapItem.TYPE_SHIELD:
                        _.context.itemMaster[i] = new BitmapItem(spriteSheetShields, item);
                        _.context.itemMaster[i].gotoAndStop(i);
                        break;
                    case BitmapItem.TYPE_MISC:
                        _.context.itemMaster[i] = new BitmapItem(spriteSheetItems, item);
                        _.context.itemMaster[i].gotoAndStop(i);
                        break;
                    default:
                }
            }
        }

        var spriteSheetPlayer = new createjs.SpriteSheet({
            images:[$.appPath + "/img/player.png"],
            frames:{width:64, height:64, regX:32, regY:32},
            animations:BaseCharacter.BODY_ANIMATION
        });

        var playerAnim = new createjs.BitmapAnimation(spriteSheetPlayer);
        playerAnim.name = "player";
        playerAnim.gotoAndPlay("walk");     //animate
        playerAnim.currentFrame = 0;

        player = new BaseCharacter(_.context, playerAnim, BaseCharacter.HANDMAP_STANDARD,
            _.context.itemMaster[_.context.playData.rightArm],
            _.context.itemMaster[_.context.playData.leftArm]);
        player.isPlayer = true;
        player.onUpdate = _.context.collideBlocks;
        player.x = 384;
        player.y = 384;
        player.HP = 100;
        player.teamNumber = 1;
        player.onTick = function () {
            AppUtils.inputAction(player);
            player.updateFrame();
            player.checkDropItem();
        }


        _.context.addCharacter(player);
        _.context.addToStage(player);


        for (var i = 0; i < enemyData.length; i++) {
            var _enemyData = enemyData[i];
            var _enemySize = 64;
            var _bodyName = _enemyData.body.toString();
            if (_bodyName.match(/.*_/)) {
                _enemySize = parseInt(_bodyName.replace(/.*_/, ''));
            }
            var spriteSheetEnemy = new createjs.SpriteSheet({
                images:[$.appPath + "/img/enemy" + _bodyName + ".png"],
                frames:{width:_enemySize, height:_enemySize, regX:_enemySize / 2, regY:_enemySize / 2},
                animations:BaseCharacter.BODY_ANIMATION
            });
            var enemyAnim = new createjs.BitmapAnimation(spriteSheetEnemy);
            enemyAnim.name = "enemy";
            enemyAnim.gotoAndPlay("walk");     //animate
            enemyAnim.currentFrame = 0;
            _enemyData["anim"] = enemyAnim;
        }

        function enemyTickFunction(enemy) {
            return function () {
                AppUtils.simpleAction(enemy, _.context);
                enemy.updateFrame();
            }
        }

        var floorBonus = Math.floor(_.context.playData.floorNumber / 3);
        var enemyNum = 6 + Math.min(floorBonus, 10);
        for (var i = 0; i < enemyNum; i++) {
            var index = Math.floor(Math.random() * 2.5) + Math.min(floorBonus, enemyData.length);
            var _enemy = enemyData[index];
            if (!_enemy.hasOwnProperty('handMap')) {
                _enemy.handMap = BaseCharacter.HANDMAP_STANDARD;
            }
            var _enemyAnim = _enemy.anim.clone();
            var enemy = new BaseCharacter(_.context, _enemyAnim, _enemy.handMap,
                _.context.itemMaster[_enemy.items['rightArm']],
                _.context.itemMaster[_enemy.items['leftArm']]);
            for (var k in _enemy) {
                if (k != "anim") {
                    enemy[k] = _enemy[k];
                }
            }

            enemy.onUpdate = _.context.collideBlocks;
            enemy.x = Math.random() * 2048;
            enemy.y = Math.random() * 2048;
            enemy.frame = 0;
            enemy.mode = EnemyMode.RANDOM_WALK;
            enemy.onTick = enemyTickFunction(enemy);

            if (_enemy.hasOwnProperty("items")
                && _enemy.items.hasOwnProperty("dropItems")) {
                for (var j in _enemy.items.dropItems) {
                    if (_.context.itemMaster.hasOwnProperty(j)) {
                        enemy.addToDropList(_.context.itemMaster[j], _enemy.items.dropItems[j]);
                    }
                }
            }
            _.context.addCharacter(enemy);
            _.context.addToStage(enemy);

        }

        _.stage.addChild(_.scoreField);
        createjs.Ticker.init();
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(16);
        createjs.Ticker.addListener(window);

        //////
        var onDrag = function (e) {
            var CANVAS_LEFT = $(_.canvas).offset().left;
            var CANVAS_TOP = $(_.canvas).offset().top;
            var touchEnable = typeof event != "undefined" && typeof event.touches != "undefined";
            if (touchEnable && event.touches[0]) {
                player.axisX = event.touches[0].pageX - CANVAS_LEFT - _.canvas.width / 2;
                player.axisY = event.touches[0].pageY - CANVAS_TOP - _.canvas.height / 2;
                e.preventDefault();
            } else {
                player.axisX = e.pageX - CANVAS_LEFT - _.canvas.width / 2;
                player.axisY = e.pageY - CANVAS_TOP - _.canvas.height / 2;
                e.preventDefault();
            }
        }

        player.isMouseDown = false;
        player.clickDuration = false;
        player.isMouseClick = false;
        player.isCursor = false;
        player.axisX = 0;
        player.axisY = 0;
        $(_.canvas).on("mousedown touchstart",
            function (e) {
                player.isMouseDown = true;
                onDrag(e);
                if (Math.pow(player.axisX, 2) + Math.pow(player.axisY, 2) < Math.pow(32, 2)) {
                    player.isCursor = true;
                }
                player.clickDuration = true;
                setTimeout(function () {
                    player.clickDuration = false;
                }, 100);
            }).on("mousemove touchmove",
            function (e) {
                onDrag(e);
            }).on("mouseup touchend mouseleave touchleave", function (e) {
                player.isCursor = player.isMouseDown = false;
                if (player.clickDuration) {
                    player.isMouseClick = true;
                } else {
                    player.axisX = player.axisY = 0;
                }
                player.vX = player.vY = 0;
            });
        if (typeof $.mobile != "undefined") {
            $.hideLoading();
            $('#stageCanvas').fadeIn();
        }
        _.initializing = false;
    }

    function init() {
        //Sound
        function preloadNotSupported() {
            var agent = navigator.userAgent;
            if (agent.indexOf('Linux; U; Android ') != -1
                || agent.indexOf('iPhone; U') != -1
                || agent.indexOf('iPad; U') != -1) {
                return true;
            }
            return false;
        }

        function loadSound() {
            var sounds = [
                "attack",
                "defeat",
                "downstair",
                "heal",
                "hit",
                "parried",
                "pickup"
            ];
            var path = $.appPath + "/se";
            if (typeof AppMobi != "undefined") {

            } else if (buzz.isSupported()) {
                __sounds = new Array();
                buzz.defaults.preload = true;
                if (buzz.isOGGSupported() || buzz.isWAVSupported() || buzz.isMP3Supported()) {
                    for (var k in sounds) {
                        var soundName = sounds[k];
                        __sounds[soundName] = new buzz.sound(path + "/" + soundName, {formats:[ "ogg", "mp3", "wav" ]});
                    }
                } else {
                    __sounds = null;
                }
            }
        }

        loadSound();
        //Sound

        //blockMap
        var floor = 0;
        var playData = $.dataStore.get('playData', null);
        var urlParams = getUrlParams();
        if ((playData != null)
            && (urlParams != null)
            && (playData.id == urlParams['pdid'])) {
            floor = playData.floorNumber;
        } else {
            playData = null;
        }
        $.dataStore.put('playData', null);

        $.loadTiles("tiles" + ((Math.floor(floor / 3) % 3) + 1), function () {
            if (floor < 5) {
                __blockMap = MapGenerator.generate(3, 3);
            } else if (floor < 10) {
                __blockMap = MapGenerator.generate(4, 3);
            } else if (floor < 15) {
                __blockMap = MapGenerator.generate(4, 4);
            } else if (floor < 20) {
                __blockMap = MapGenerator.generate(5, 4);
            } else {
                __blockMap = MapGenerator.generate(5, 5);
            }
            initializeGame(playData);
        });
        //blockMap
    }

    init();
};

$.hideLoading = function () {
    if ($.hasOwnProperty('mobile')) {
        $.mobile.hidePageLoadingMsg();
    }
};

$.showLoading = function () {
    if ($.hasOwnProperty('mobile')) {
        $.mobile.showPageLoadingMsg();
    }
};

window.onorientationchange = function () {
    $("#canvasWrapper").width(window.innerWidth);
    $("#canvasWrapper").height(window.innerHeight);
    if (_.canvas) {
        _.canvas.width = window.innerWidth;
        _.canvas.height = window.innerHeight;
        if (_.scoreField) {
            _.scoreField.x = _.canvas.width - 10;
        }
    }
    setTimeout(scrollTo, 100, 0, 1);
};