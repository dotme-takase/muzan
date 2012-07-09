//function called by the Tick instance at a set interval
var floorNumber = 1;
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

    scoreField.text = "B" + floorNumber + "F: " + player.HP + " / 100";
    if (!initializing) {
        if (player.HP <= 0) {
            initializing = true;
            setTimeout(function () {
                if (window.confirm('Retry?')) {
                    $.resetStage();
                }
            }, 1000);
        } else if (floor == "s1") {
            initializing = true;
            floorNumber++;
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
        speed:8
    },
    {
        HP:80,
        speed:6
    },
    {
        HP:30,
        speed:10
    },
    {
        HP:40,
        speed:9
    },
    {
        HP:10,
        speed:14
    }
];

//initialize function, called when page loads.
$(function () {
        function init() {
            var imageTiles = new Image();
            imageTiles.src = "/app/img/tiles.png";
            imageTiles.onload = function () {
                var spriteSheetTiles = new SpriteSheet({
                    images:["/app/img/tiles.png"],
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
                    initializeGame();
                });

            };
        }

        function initializeGame() {
            canvas = document.getElementById("stageCanvas");
            stage = new Stage(canvas);
            context = new AppContext();
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
                    sabel:0,
                    sabel_:0
                }
            });

            //load swords
            var swordAnim = new BitmapItem(spriteSheetSwords);
            swordAnim.TYPE = BitmapItem.TYPE_SWORD;
            swordAnim.gotoAndStop("sabel");     //animate

            var spriteSheetShields = new SpriteSheet({
                images:["/app/img/shields.png"],
                frames:{width:32, height:32, regX:16, regY:20},
                animations:{
                    wooden_shield:0,
                    wooden_shield_:16
                }
            });

            var shieldAnim = new BitmapItem(spriteSheetShields);
            shieldAnim.TYPE = BitmapItem.TYPE_SHIELD;
            shieldAnim.HP = 10;
            shieldAnim.BONUS_POINT = 4;
            shieldAnim.gotoAndStop("wooden_shield");     //animate


            var spriteSheetItems = new SpriteSheet({
                images:["/app/img/items.png"],
                frames:{width:32, height:32, regX:16, regY:20},
                animations:{
                    aid_box:0
                }
            });

            var aidBox = new BitmapItem(spriteSheetItems);
            aidBox.TYPE = null;
            aidBox.onUse = function (character, target) {
                var aid = 50;
                character.context.addEffect(character.x, character.y, 'heal');
                character.HP += Math.min(100 - character.HP, aid);
            };
            aidBox.gotoAndStop("aid_box");     //animate

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

            player = new BaseCharacter(context, playerAnim, _basicHandMap, swordAnim, shieldAnim);
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
                var enemy = new BaseCharacter(context, _enemyAnim, _basicHandMap, swordAnim, shieldAnim);
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
                enemy.addToDropList(shieldAnim, 1);
                enemy.addToDropList(aidBox, 5);

                context.addCharacter(enemy);
                context.addToStage(enemy);

                /* --debug
                 var stateIdField = new Text(enemy.stateId, "bold 12px Arial", "#00FFFF");
                 stateIdField.textAlign = "center";
                 stateIdField.x = 0;
                 stateIdField.y = 0;
                 enemy.addChild(stateIdField);
                 */
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
            initializeGame();
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