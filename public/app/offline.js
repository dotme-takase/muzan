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
        HP:20,
        speed:8,
        items:{
            rightArm:"shortSword",
            leftArm:"woodenShield",
            dropItems:{
                woodenShield:1
            }
        }
    },
    {
        HP:80,
        speed:6,
        items:{
            rightArm:"longSword",
            leftArm:"ironShield",
            dropItems:{
                longSword:1,
                handAxe:1,
                ironShield:1,
                aidBox:2
            }
        }
    },
    {
        HP:30,
        speed:10,
        items:{
            rightArm:"katana",
            leftArm:null,
            dropItems:{
                katana:1,
                aidBox:2
            }
        }
    },
    {
        HP:40,
        speed:9,
        items:{
            rightArm:"ryuyotou",
            leftArm:"bronzeShield",
            dropItems:{
                ryuyotou:1,
                bronzeShield:2,
                aidBox:2
            }
        }
    },
    {
        HP:10,
        speed:14,
        items:{
            rightArm:"shortSword",
            leftArm:null,
            dropItems:{
                aidBox:1
            }
        }
    }
];

var itemData = {
    shortSword:{
        TYPE:BitmapItem.TYPE_SWORD,
        RANGE:26,
        BONUS_POINT:5
    },
    handAxe:{
        TYPE:BitmapItem.TYPE_SWORD,
        RANGE:26,
        BONUS_POINT:12
    },
    katana:{
        TYPE:BitmapItem.TYPE_SWORD,
        RANGE:36,
        BONUS_POINT:8
    },
    ryuyotou:{
        TYPE:BitmapItem.TYPE_SWORD,
        RANGE:32,
        BONUS_POINT:10
    },
    longSword:{
        TYPE:BitmapItem.TYPE_SWORD,
        RANGE:40,
        BONUS_POINT:12
    },
    woodenShield:{
        TYPE:BitmapItem.TYPE_SHIELD,
        HP:10,
        BONUS_POINT:4},
    bronzeShield:{
        TYPE:BitmapItem.TYPE_SHIELD,
        HP:40,
        BONUS_POINT:5
    },
    ironShield:{
        TYPE:BitmapItem.TYPE_SHIELD,
        HP:80,
        BONUS_POINT:6
    },
    blueShield:{
        TYPE:BitmapItem.TYPE_SHIELD,
        HP:60,
        BONUS_POINT:12
    },
    redShield:{TYPE:BitmapItem.TYPE_SHIELD,
        HP:70,
        BONUS_POINT:16
    },
    aidBox:{
        TYPE:BitmapItem.TYPE_MISC,
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
                    handAxe:1,
                    handAxe_:1,
                    katana:2,
                    katana_:2,
                    ryuyotou:3,
                    ryuyotou_:3,
                    longSword:4,
                    longSword_:4
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
                    switch (item.TYPE) {
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
                var spriteSheetEnemy = new SpriteSheet({
                    images:["/app/img/enemy" + (i + 1) + ".png"],
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
                enemyData[i]["anim"] = enemyAnim;
            }

            function enemyTickFunction(enemy) {
                return function () {
                    AppUtils.simpleAction(enemy, context);
                    enemy.updateFrame();
                }
            }

            var enemyNum = 16;
            for (var i = 0; i < enemyNum; i++) {
                var index = Math.floor(Math.random() * enemyData.length);
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