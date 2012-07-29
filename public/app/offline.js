//function called by the Tick instance at a set interval
var canvas, stage, context;
var scoreField;
var initializing = true;
function tick() {
    context.updateTree();

    for (var k in context.characters) {
        var character = context.characters[k];
        AppUtils.updatePosition(character);
        context.collideBlocks(character);
    }

    context.afterCharactersUpdate();
    context.view.x = canvas.width / 2 - player.x;
    context.view.y = canvas.height / 2 - player.y;
    stage.update();

    var point = context.getMapPoint(player);
    var floor = context.floorMap[point.y][point.x];

    scoreField.text = "B" + context.playData.floorNumber + "F: " + player.HP + " / 100";
    if (!initializing) {
        if (player.HP <= 0) {
            initializing = true;
            setTimeout(function () {
                if (window.confirm('Retry?')) {
                    context.playData = null;
                    $.resetStage();
                }
            }, 1000);
        } else if (floor == "s1") {
            initializing = true;
            context.playData.floorNumber++;
            $.resetStage();
        }
        context.drawMap(point, stage);
    }
}
var __tileBmps = {};
var __blockMap = [];
var enemyData = [
    {
        body:5,
        HP:20,
        speed:10,
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
        HP:20,
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
        body:4,
        HP:30,
        speed:9,
        items:{
            rightArm:"longSword",
            leftArm:"woodenShield",
            dropItems:{
                longSword:1,
                woodenShield:5,
                aidBox:10
            }
        }
    },
    {
        body:2,
        HP:80,
        speed:6,
        items:{
            rightArm:"longSword",
            leftArm:"woodenShield",
            dropItems:{
                longSword:2,
                woodenShield:3,
                aidBox:5
            }
        }
    },
    {
        body:5,
        HP:20,
        speed:14,
        items:{
            rightArm:"fasterShortSword",
            leftArm:null,
            dropItems:{
                fasterShortSword:3,
                aidBox:10
            }
        }
    },
    {
        body:1,
        HP:60,
        speed:9,
        items:{
            rightArm:"longSword",
            leftArm:"bronzeShield",
            dropItems:{
                longSword:5,
                bronzeShield:3,
                aidBox:5
            }
        }
    },
    {
        body:4,
        HP:60,
        speed:10,
        items:{
            rightArm:"ryuyotou",
            leftArm:"ironShield",
            dropItems:{
                ryuyotou:2,
                ironShield:1,
                bronzeShield:3,
                aidBox:3
            }
        }
    },
    {
        body:3,
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
        speed:1
    },
    fasterShortSword:{
        type:BitmapItem.TYPE_SWORD,
        range:18,
        bonusPoint:5,
        speed:2
    },
    handAxe:{
        type:BitmapItem.TYPE_SWORD,
        range:20,
        bonusPoint:14,
        speed:0
    },
    katana:{
        type:BitmapItem.TYPE_SWORD,
        range:28,
        bonusPoint:8,
        speed:2
    },
    ryuyotou:{
        type:BitmapItem.TYPE_SWORD,
        range:24,
        bonusPoint:10,
        speed:0
    },
    broadSword:{
        type:BitmapItem.TYPE_SWORD,
        range:32,
        bonusPoint:12,
        speed:1
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
            character.HP += Math.min(100 - character.HP,
                aid);
        }
    }
};

//initialize function, called when page loads.
$(function () {
        function init() {
            var imageTiles = new Image();
            imageTiles.src = "/app/img/tiles" + Math.ceil(Math.random() * 3) + ".png";
            imageTiles.onload = function () {
                var spriteSheetTiles = new SpriteSheet({
                    images:[imageTiles.src],
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
                var names = spriteSheetTiles.getAnimations();
                for (var k in names) {
                    var name = names[k];
                    var bitmap = new Bitmap(SpriteSheetUtils.extractFrame(spriteSheetTiles, name));
                    __tileBmps[name] = bitmap;
                }
                $.get("/g/init", function (data) {
                    __blockMap = data.context.blockMap;
                    initializeGame(null);
                });

            };
        }

        function initializeGame(playData) {
            canvas = document.getElementById("stageCanvas");
            stage = new Stage(canvas);
            context = new AppContext(playData);
            context.initializeStage(__blockMap, __tileBmps);
            stage.addChild(context.view);

            scoreField = new Text("", "bold 12px Arial", "#FFFFFF");
            scoreField.textAlign = "right";
            scoreField.x = canvas.width - 10;
            scoreField.y = 22;

            var spriteSheetEffects = new SpriteSheet({
                images:["/app/img/effect.png"],
                frames:{width:128, height:128, regX:64, regY:64},
                animations:{
                    damage:[0, 4],
                    parried:[5, 9],
                    heal:[10, 24],
                    dead:[25, 39]
                }
            });

            context.effectsAnim = new BitmapAnimation(spriteSheetEffects);
            var spriteSheetSwords = new SpriteSheet({
                images:["/app/img/swords.png"],
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

            var spriteSheetShields = new SpriteSheet({
                images:["/app/img/shields.png"],
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

            var spriteSheetItems = new SpriteSheet({
                images:["/app/img/items.png"],
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
                            context.itemMaster[i] = new BitmapItem(spriteSheetSwords, item);
                            context.itemMaster[i].gotoAndStop(i);
                            break;
                        case BitmapItem.TYPE_SHIELD:
                            context.itemMaster[i] = new BitmapItem(spriteSheetShields, item);
                            context.itemMaster[i].gotoAndStop(i);
                            break;
                        case BitmapItem.TYPE_MISC:
                            context.itemMaster[i] = new BitmapItem(spriteSheetItems, item);
                            context.itemMaster[i].gotoAndStop(i);
                            break;
                        default:
                    }
                }
            }

            var spriteSheetPlayer = new SpriteSheet({
                images:["/app/img/player.png"],
                frames:{width:64, height:64, regX:32, regY:32},
                animations:{
                    walk:[0, 7],
                    attack:[10, 15],
                    defence:[8, 10],
                    damage:[0, 1],
                    parried:[0, 7]
                }
            });

            var playerAnim = new BitmapAnimation(spriteSheetPlayer);
            playerAnim.name = "player";
            playerAnim.gotoAndPlay("walk");     //animate
            playerAnim.currentFrame = 0;

            player = new BaseCharacter(context, playerAnim, _basicHandMap,
                context.itemMaster[context.playData.rightArm],
                context.itemMaster[context.playData.leftArm]);
            player.isPlayer = true;
            player.onUpdate = context.collideBlocks;
            player.x = 384;
            player.y = 384;
            player.HP = 100;
            player.teamNumber = 1;
            player.onTick = function () {
                AppUtils.inputAction(player);
                player.updateFrame();
                player.checkDropItem();
            }


            context.addCharacter(player);
            context.addToStage(player);


            for (var i = 0; i < enemyData.length; i++) {
                var _enemyData = enemyData[i];
                var spriteSheetEnemy = new SpriteSheet({
                    images:["/app/img/enemy" + _enemyData.body + ".png"],
                    frames:{width:64, height:64, regX:32, regY:32},
                    animations:{
                        walk:[0, 7],
                        attack:[10, 15],
                        defence:[8, 10],
                        damage:[0, 1],
                        parried:[0, 7]
                    }
                });
                var enemyAnim = new BitmapAnimation(spriteSheetEnemy);
                enemyAnim.name = "enemy";
                enemyAnim.gotoAndPlay("walk");     //animate
                enemyAnim.currentFrame = 0;
                _enemyData["anim"] = enemyAnim;
            }

            function enemyTickFunction(enemy) {
                return function () {
                    AppUtils.simpleAction(enemy, context);
                    enemy.updateFrame();
                }
            }

            var floorBonus = Math.floor(context.playData.floorNumber / 3);
            var enemyNum = 10 + Math.min(floorBonus, 6);
            for (var i = 0; i < enemyNum; i++) {
                var index = Math.floor(Math.random() * 2.5) + Math.min(floorBonus, enemyData.length);
                var _enemy = enemyData[index];
                var _enemyAnim = _enemy.anim.clone();
                var enemy = new BaseCharacter(context, _enemyAnim, _basicHandMap,
                    context.itemMaster[_enemy.items['rightArm']],
                    context.itemMaster[_enemy.items['leftArm']]);
                for (var k in _enemy) {
                    if (k != "anim") {
                        enemy[k] = _enemy[k];
                    }
                }

                enemy.onUpdate = context.collideBlocks;
                enemy.x = Math.random() * 2048;
                enemy.y = Math.random() * 2048;
                enemy.frame = 0;
                enemy.mode = EnemyMode.RANDOM_WALK;
                enemy.onTick = enemyTickFunction(enemy);

                if (_enemy.hasOwnProperty("items")
                    && _enemy.items.hasOwnProperty("dropItems")) {
                    for (var j in _enemy.items.dropItems) {
                        if (context.itemMaster.hasOwnProperty(j)) {
                            enemy.addToDropList(context.itemMaster[j], _enemy.items.dropItems[j]);
                        }
                    }
                }
                context.addCharacter(enemy);
                context.addToStage(enemy);

            }

            stage.addChild(scoreField);
            Ticker.init();
            Ticker.useRAF = true;
            Ticker.setFPS(16);
            Ticker.addListener(window);

            //////
            var onDrag = function (e) {
                var CANVAS_LEFT = $(canvas).offset().left;
                var CANVAS_TOP = $(canvas).offset().top;
                var touchEnable = typeof event != "undefined" && typeof event.touches != "undefined";
                if (touchEnable && event.touches[0]) {
                    player.axisX = event.touches[0].pageX - CANVAS_LEFT - canvas.width / 2;
                    player.axisY = event.touches[0].pageY - CANVAS_TOP - canvas.height / 2;
                    e.preventDefault();
                } else {
                    player.axisX = e.pageX - CANVAS_LEFT - canvas.width / 2;
                    player.axisY = e.pageY - CANVAS_TOP - canvas.height / 2;
                    e.preventDefault();
                }
            }

            player.isMouseDown = false;
            player.clickDuration = false;
            player.isMouseClick = false;
            player.isCursor = false;
            player.axisX = 0;
            player.axisY = 0;
            $(canvas).on("mousedown touchstart",
                function (e) {
                    player.isMouseDown = true;
                    onDrag(e);
                    if (Math.pow(player.axisX, 2) + Math.pow(player.axisY, 2) < Math.pow(32, 2)) {
                        player.isCursor = true;
                    }
                    player.clickDuration = true;
                    setTimeout(function () {
                        player.clickDuration = false;
                    }, 60);
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
            window.onorientationchange();
            initializing = false;
        }

        init();

        $.resetStage = function () {
            initializing = true;
            __blockMap = MapGenerator.generate();
            initializeGame(context.playData);
        }
    }

);

window.onorientationchange = function () {
    if (typeof window.orientation == "undefined") {
        canvas.height = 464;
    } else if (window.orientation == 0) {
        canvas.height = 464;
    } else {
        canvas.height = 256;
        setTimeout(scrollTo, 100, 0, 1);
    }
};