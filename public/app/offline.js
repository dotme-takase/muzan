//function called by the Tick instance at a set interval
var app = new Object();
app.pause = true;
app.initializing = true;
app.onInitialized = null;
app.onGameover = null;
app.viewApp = null;
app.currentRank = "";
function tick() {
    if (!app.pause) {
        try {
            app.context.updateTree();
            for (var k in app.context.characters) {
                var character = app.context.characters[k];
                AppUtils.updatePosition(character);
                app.context.collideBlocks(character);
            }

            app.context.afterCharactersUpdate();
            app.context.view.x = app.canvas.width / 2 - player.x;
            app.context.view.y = app.canvas.height / 2 - player.y;
            app.stage.update();

            var point = app.context.getMapPoint(player);
            var floor = app.context.floorMap[point.y][point.x];

            if (!app.initializing) {
                if (player.HP <= 0) {
                    app.initializing = true;
                    LocalData.put('playData', null);
                    setTimeout(function () {
                        if (app.context.playData.hasOwnProperty('enemy')) {
                            var date = AppUtils.formatDate(new Date(), 'yyyy/MM/dd HH:mm');
                            var record = {
                                enemy:app.context.playData.enemy.name,
                                floor:app.context.playData.floorNumber,
                                date:date
                            }
                            var rank = LocalRanking.insert(app.context.playData.floorNumber, record);
                            if (rank == null) {
                                rank = "out";
                            }
                            if (app.onGameover) {
                                app.currentRank = rank;
                                app.onGameover();
                            }
                        }
                    }, 1000);
                } else if ((floor != null) && (floor.indexOf("s1") === 0)) {
                    app.initializing = true;
                    app.context.playData.enemy = null;
                    app.context.playData.floorNumber++;
                    app.context.playData.id = AppUtils.uuid();
                    LocalData.put('playData', app.context.playData);
                    app.context.playSound("downstair");
                    app.initializeGame(app.context.playData);
                    app.showLoading();
                } else {
                    app.context.drawMap(point);
                }
            }
        } catch (e) {
            console.log(e);
        }
    } else {
        app.stage.update();
    }
}
var __tileBmps = {};
var __blockMap = [];
var __sounds = null;
var enemyData = [
    {
        body:1,
        name:'Militia',
        HP:10,
        speed:5,
        items:{
            rightArm:"shortSword",
            leftArm:null,
            dropItems:{
                aidBox:5
            }
        }
    },
    {
        body:1,
        name:'Militia',
        HP:10,
        speed:5,
        items:{
            rightArm:"shortSword",
            leftArm:null,
            dropItems:{
                woodenShield:3,
                aidBox:5
            }
        }
    },
    {
        body:1,
        name:'Militia',
        HP:10,
        speed:5,
        items:{
            rightArm:"shortSword",
            leftArm:"woodenShield",
            dropItems:{
                bronzeShield:1,
                woodenShield:3,
                aidBox:5
            }
        }
    },
    {
        body:5,
        name:'Thief',
        HP:10,
        speed:8,
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
        speed:6,
        items:{
            rightArm:"longSword",
            leftArm:null,
            dropItems:{
                longSword:1,
                aidBox:5
            }
        }
    },
    {
        body:4,
        name:'Soldier',
        HP:15,
        speed:6,
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
        speed:5,
        items:{
            rightArm:"longSword",
            leftArm:null,
            dropItems:{
                longSword:4,
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
            app.context.playSound("heal");
            character.HP += Math.min(100 - character.HP,
                aid);
        }
    }
};


//initialize function, called when page loads.
app.loadTiles = function (filename, callback) {
    delete app.spriteSheetTiles;
    for (var name in __tileBmps) {
        delete __tileBmps[name];
    }
    delete __tileBmps;

    app.spriteSheetTiles = new createjs.SpriteSheet({
        images:[app.rootPath + "/img/" + filename + ".png"],
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
    app.spriteSheetTiles.onComplete = function () {
        var names = app.spriteSheetTiles.getAnimations();
        var hasDataURL = false;
        try {
            var _canvas = createjs.SpriteSheetUtils._workingContext.canvas;
            hasDataURL = typeof _canvas.toDataURL !== 'undefined';
        } catch (ignore) {
        }
        for (var k in names) {
            var name = names[k];
            if (hasDataURL) {
                var bitmap = new createjs.Bitmap(createjs.SpriteSheetUtils.extractFrame(app.spriteSheetTiles, name));
                __tileBmps[name] = bitmap;
            } else {
                var bitmapAnim = new createjs.BitmapAnimation(app.spriteSheetTiles);
                bitmapAnim.gotoAndPlay(name);
                __tileBmps[name] = bitmapAnim;
            }
        }
        app.hideLoading();
        callback.call(this);
    };
};

app.initializeFirst = function () {
    if (app.stage) {
        app.stage.removeAllChildren();
    }
    app.stage = new createjs.Stage(app.canvas);
    app.contextView = new createjs.Container();
    app.stage.addChild(app.contextView);
    app.contextViewUI = new createjs.Container();
    app.stage.addChild(app.contextViewUI);
    app.viewApp = new createjs.Container();
    app.stage.addChild(app.viewApp);
    app.viewLoading = new createjs.Container();
    app.stage.addChild(app.viewLoading);

    app.viewLoading.addChild(new createjs.Shape((new createjs.Graphics())
        .beginFill('#000000')
        .drawRect(0, 0, app.canvas.width, app.canvas.height)
    ));
    var loadingText = new createjs.Text("", "italic bold 24px Arial", "#FFFFFF");
    loadingText.text = "LOADING";
    loadingText.textAlign = "center";
    loadingText.x = app.canvas.width / 2;
    loadingText.y = (app.canvas.height / 2) - 24;
    createjs.Tween.get(loadingText, {repeat:true}).to({alpha:0.2}, 500).to({alpha:1.0}, 500);
    app.viewLoading.addChild(loadingText);

    if (app.onInitialized) {
        app.onInitialized();
    }

    app.spriteSheetEffects = new createjs.SpriteSheet({
        images:[app.rootPath + "/img/effect.png"],
        frames:{width:128, height:128, regX:64, regY:64},
        animations:{
            damage:[0, 4],
            parried:[5, 9],
            heal:[10, 24],
            dead:[25, 39]
        }
    });

    app.spriteSheetSwords = new createjs.SpriteSheet({
        images:[app.rootPath + "/img/swords.png"],
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

    app.spriteSheetShields = new createjs.SpriteSheet({
        images:[app.rootPath + "/img/shields.png"],
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

    app.spriteSheetItems = new createjs.SpriteSheet({
        images:[app.rootPath + "/img/items.png"],
        frames:{width:32, height:32, regX:16, regY:20},
        animations:{
            aidBox:0
        }
    });

    app.spriteSheetPlayer = new createjs.SpriteSheet({
        images:[app.rootPath + "/img/player.png"],
        frames:{width:64, height:64, regX:32, regY:32},
        animations:BaseCharacter.BODY_ANIMATION
    });

    for (var i = 0; i < enemyData.length; i++) {
        var _enemyData = enemyData[i];
        var _enemySize = 64;
        var _bodyName = _enemyData.body.toString();
        if (_bodyName.match(/.*_/)) {
            _enemySize = parseInt(_bodyName.replace(/.*_/, ''));
        }
        var spriteSheetEnemy = new createjs.SpriteSheet({
            images:[app.rootPath + "/img/enemy" + _bodyName + ".png"],
            frames:{width:_enemySize, height:_enemySize, regX:_enemySize / 2, regY:_enemySize / 2},
            animations:BaseCharacter.BODY_ANIMATION
        });
        var enemyAnim = new createjs.BitmapAnimation(spriteSheetEnemy);
        enemyAnim.name = "enemy";
        enemyAnim.gotoAndPlay("walk");     //animate
        enemyAnim.currentFrame = 0;
        _enemyData["anim"] = enemyAnim;
    }

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
        var path = app.rootPath + "/se";
        if (typeof AppMobi != "undefined") {

        } else if (typeof ejecta != 'undefined') {
            __sounds = new Array();
            for (var k in sounds) {
                var a = new Audio();
                var soundName = sounds[k];
                a.src = path + "/" + soundName + ".mp3"
                __sounds[soundName] = a;
            }
        } else if ((typeof AppMobi != "undefined") && (buzz.isSupported())) {
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

    // initialize playData
    var playData = LocalData.get('playData', null);
    var urlParams = document.hasOwnProperty('getUrlParams') ? getUrlParams() : null;
    if ((playData != null)
        && (urlParams != null)
        && (playData.id == urlParams['pdid'])) {
    } else {
        playData = null;
    }
    LocalData.put('playData', null);
    app.initializeGame(playData);
};

app.initializeGame = function (playData) {
    app.initializing = true;
    var floor = 0;
    if (playData != null) {
        floor = playData.floorNumber;
    }
    //load tile bitmaps
    app.loadTiles("tiles" + ((Math.floor(floor / 3) % 3) + 1), function () {
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
        app.initializeGameDelegete(playData);
    });
};

app.initializeGameDelegete = function (playData) {
    app.context = new AppContext(app.contextView, app.contextViewUI, playData);
    app.context.rootPath = app.rootPath;
    app.context.initializeStage(__blockMap, __tileBmps, __sounds);
    window.onorientationchange();

    app.context.initializeEffectList(new createjs.BitmapAnimation(app.spriteSheetEffects));

    for (var i in itemData) {
        if (itemData.hasOwnProperty(i)) {
            var item = itemData[i];
            switch (item.type) {
                case BitmapItem.TYPE_SWORD:
                    app.context.itemMaster[i] = new BitmapItem(app.spriteSheetSwords, item);
                    app.context.itemMaster[i].gotoAndStop(i);
                    break;
                case BitmapItem.TYPE_SHIELD:
                    app.context.itemMaster[i] = new BitmapItem(app.spriteSheetShields, item);
                    app.context.itemMaster[i].gotoAndStop(i);
                    break;
                case BitmapItem.TYPE_MISC:
                    app.context.itemMaster[i] = new BitmapItem(app.spriteSheetItems, item);
                    app.context.itemMaster[i].gotoAndStop(i);
                    break;
                default:
            }
        }
    }

    var playerAnim = new createjs.BitmapAnimation(app.spriteSheetPlayer);
    playerAnim.name = "player";
    playerAnim.gotoAndPlay("walk");     //animate
    playerAnim.currentFrame = 0;

    player = new BaseCharacter(app.context, playerAnim, BaseCharacter.HANDMAP_STANDARD,
        app.context.itemMaster[app.context.playData.rightArm],
        app.context.itemMaster[app.context.playData.leftArm]);
    player.isPlayer = true;
    player.onUpdate = app.context.collideBlocks;
    player.x = 384;
    player.y = 384;
    player.HP = 100;
    player.teamNumber = 1;
    player.onTick = function () {
        AppUtils.inputAction(player);
        player.updateFrame();
        player.checkDropItem();
    }

    app.context.player = player;
    app.context.addCharacter(player);
    app.context.addToStage(player);

    function enemyTickFunction(enemy) {
        return function () {
            AppUtils.simpleAction(enemy, app.context);
            enemy.updateFrame();
        }
    }

    var floorBonus = Math.floor(app.context.playData.floorNumber / 3);
    var enemyNum = 6 + Math.min(floorBonus, 10);
    for (var i = 0; i < enemyNum; i++) {
        var index = Math.floor(Math.random() * 2.5) + Math.min(floorBonus, enemyData.length);
        var _enemy = enemyData[index];
        if (!_enemy.hasOwnProperty('handMap')) {
            _enemy.handMap = BaseCharacter.HANDMAP_STANDARD;
        }
        var _enemyAnim = _enemy.anim.clone();
        var enemy = new BaseCharacter(app.context, _enemyAnim, _enemy.handMap,
            app.context.itemMaster[_enemy.items['rightArm']],
            app.context.itemMaster[_enemy.items['leftArm']]);
        for (var k in _enemy) {
            if (k != "anim") {
                enemy[k] = _enemy[k];
            }
        }

        enemy.onUpdate = app.context.collideBlocks;
        enemy.x = Math.random() * 2048;
        enemy.y = Math.random() * 2048;
        enemy.frame = 0;
        enemy.mode = EnemyMode.RANDOM_WALK;
        enemy.onTick = enemyTickFunction(enemy);

        if (_enemy.hasOwnProperty("items")
            && _enemy.items.hasOwnProperty("dropItems")) {
            for (var j in _enemy.items.dropItems) {
                if (app.context.itemMaster.hasOwnProperty(j)) {
                    enemy.addToDropList(app.context.itemMaster[j], _enemy.items.dropItems[j]);
                }
            }
        }
        app.context.addCharacter(enemy);
        app.context.addToStage(enemy);

    }

    createjs.Ticker.addListener(window);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(20);

    for (var i in app.context.characters)(function (i) {
        var character = app.context.characters[i];
        var delegate = character.onTick;
        character.onTick = function () {
            if (!app.pause) {
                delegate();
            }
        }
    })(i);

    //////
    player.isMouseDown = false;
    player.clickDuration = false;
    player.isMouseClick = false;
    player.isCursor = false;
    player.axisX = 0;
    player.axisY = 0;

    var onDrag = function (e) {
        if (typeof event == 'undefined') {
            event = e;
        }
        var CANVAS_LEFT = typeof $ != "undefined" ? $(app.canvas).offset().left : 0;
        var CANVAS_TOP = typeof $ != "undefined" ? $(app.canvas).offset().top : 0;
        var touchEnable = typeof event != "undefined" && typeof event.touches != "undefined";
        if (touchEnable && event.touches[0]) {
            player.axisX = event.touches[0].pageX - CANVAS_LEFT - app.canvas.width / 2;
            player.axisY = event.touches[0].pageY - CANVAS_TOP - app.canvas.height / 2;
            e.preventDefault();
        } else {
            player.axisX = e.pageX - CANVAS_LEFT - app.canvas.width / 2;
            player.axisY = e.pageY - CANVAS_TOP - app.canvas.height / 2;
            e.preventDefault();
        }
    };

    player.onMouseDown = function (e) {
        player.isMouseDown = true;
        onDrag(e);
        if (Math.pow(player.axisX, 2) + Math.pow(player.axisY, 2) < Math.pow(32, 2)) {
            player.isCursor = true;
        }
        player.clickDuration = true;
        setTimeout(function () {
            player.clickDuration = false;
        }, 100);
    };
    player.onMouseMove = function (e) {
        onDrag(e);
    };
    player.onMouseUp = function (e) {
        player.isCursor = player.isMouseDown = false;
        if (player.clickDuration) {
            player.isMouseClick = true;
        } else {
            player.axisX = player.axisY = 0;
        }
        player.vX = player.vY = 0;
    };

    app.canvas.addEventListener('mousedown', player.onMouseDown);
    app.canvas.addEventListener('touchstart', player.onMouseDown);

    app.canvas.addEventListener('mousemove', player.onMouseMove);
    app.canvas.addEventListener('touchmove', player.onMouseMove);

    app.canvas.addEventListener('mouseup', player.onMouseUp);
    app.canvas.addEventListener('touchend', player.onMouseUp);
    app.canvas.addEventListener('mouseleave', player.onMouseUp);
    app.canvas.addEventListener('touchleave', player.onMouseUp);

    app.hideLoading();
    app.initializing = false;
}

app.hideLoading = function () {
    createjs.Tween.get(app.viewLoading).to({alpha:0}, 500, createjs.Ease.circIn);
};

app.showLoading = function () {
    createjs.Tween.get(app.viewLoading).to({alpha:1.0}, 100, createjs.Ease.circIn);
};

window.onorientationchange = function () {
    if (app.canvas) {
        app.canvas.width = window.innerWidth;
        app.canvas.height = window.innerHeight;
    }
    //setTimeout(scrollTo, 100, 0, 1);
};