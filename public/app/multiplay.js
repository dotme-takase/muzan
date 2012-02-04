//function called by the Tick instance at a set interval
var canvas, stage, context;
var scoreField;
var gameSocketIO = null;
var socketTimeout = 100;
var player = null;

function tick() {
    //context.updateTree();
    //context.afterCharactersUpdate();

    context.view.x = canvas.width / 2 - player.x;
    context.view.y = canvas.height / 2 - player.y;
    stage.update();
    scoreField.text = player.HP + " / 256";

    if (socketTimeout > 0) {
        socketTimeout--;
    } else if (socketTimeout == 0) {
        socketTimeout = -1;
        if (player.HP > 0) {
            if (window.confirm("ソケット通信に失敗しました。\nシングルプレイモードに移動しますか？")) {
                location.href = "/";
            }
        }
    }
}
var __tileBmps = {};
var __blockMap = [];


//initialize function, called when page loads.
$(function() {
    function init() {
        var imageTiles = new Image();
        imageTiles.src = "/app/img/tiles.png";
        imageTiles.onload = function() {
            var spriteSheetTiles = new SpriteSheet({
                images: ["/app/img/tiles.png"],
                frames: {width:__tileSize, height:__tileSize},
                animations:{
                    w1 : [9, 9],
                    w1_tl1 : [0, 0],
                    w1_t1 : [1, 1],
                    w1_tr1 : [2, 2],
                    w1_l1 : [8, 8],
                    w1_r1 : [10, 10],
                    w1_bl1 : [16, 16],
                    w1_b1 : [17, 17],
                    w1_br1 : [18, 18],
                    w1_br2 : [3, 3],
                    w1_bl2 : [4, 4],
                    w1_tr2 : [11, 11],
                    w1_tl2 : [12, 12],
                    d1_t1 : [5, 5],
                    d1_b1 : [6, 6],
                    d1_l1 : [13, 13],
                    d1_r1 : [14, 14],
                    d2_b1 : [19, 19],
                    d2_r1 : [20, 20],
                    d2_l1 : [21, 21],
                    d2_t1 : [22, 22],
                    f1: [56,56]
                }
            });
            var names = spriteSheetTiles.getAnimations();
            for (var k in names) {
                var name = names[k];
                var bitmap = new Bitmap(SpriteSheetUtils.extractFrame(spriteSheetTiles, name));
                __tileBmps[name] = bitmap;
            }
            $.get("/g/init", function(data) {
                initializeGame(data.context, data.context.characters[data.stateId]);
            });

        };
    }

    function initializeGame(serverContext, playerState) {
        canvas = document.getElementById("stageCanvas");
        stage = new Stage(canvas);
        context = new AppContext();
        __blockMap = serverContext.blockMap;
        context.initializeStage(__blockMap, __tileBmps);
        stage.addChild(context.view);

        scoreField = new Text("", "bold 12px Arial", "#FFFFFF");
        scoreField.textAlign = "right";
        scoreField.x = canvas.width - 10;
        scoreField.y = 22;

        stage.addChild(scoreField);

        var spriteSheetEffects = new SpriteSheet({
            images: ["/app/img/effect.png"],
            frames: {width:128, height:128, regX:64, regY:64},
            animations: {
                damage: [0, 4],
                parried: [5, 9],
                defence: [10, 24],
                dead: [25, 39]
            }
        });

        context.effectsAnim = new BitmapAnimation(spriteSheetEffects);
        var spriteSheetSwords = new SpriteSheet({
            images: ["/app/img/swords.png"],
            frames: {width:32, height:64, regX:15, regY:55},
            animations: {
                sword: 0
            }
        });
        var swordAnim = new BitmapAnimation(spriteSheetSwords);
        swordAnim.name = "sword";
        swordAnim.gotoAndStop("sword");     //animate

        var spriteSheetShields = new SpriteSheet({
            images: ["/app/img/shields.png"],
            frames: {width:32, height:32, regX:16, regY:20},
            animations: {
                shield: 0,
                shield_: 1
            }
        });

        var shieldAnim = new BitmapAnimation(spriteSheetShields);
        shieldAnim.name = "shield";
        shieldAnim.gotoAndStop("shield");     //animate

        var spriteSheetPlayer = new SpriteSheet({
            images: ["/app/img/player.png"],
            frames: {width:64, height:64, regX:32, regY:32},
            animations: {
                walk: [0, 7],
                attack: [10, 15],
                defence: [8, 10],
                damage: [0, 1],
                parried: [0, 7]
            }
        });

        var playerAnim = new BitmapAnimation(spriteSheetPlayer);
        playerAnim.name = "player";
        playerAnim.gotoAndPlay("walk");     //animate
        playerAnim.currentFrame = 0;

        player = new BaseCharacter(context, playerAnim.clone(), _basicHandMap, swordAnim.clone(), shieldAnim.clone());
        player.jsonToState(playerState);
        player.tick = function() {
            if (player.HP <= 0) {
                return;
            }
            AppUtils.inputAction(player, context);
            player.updateFrame();
            AppUtils.updatePosition(player);
            context.collideBlocks(player);
            gameSocketIO.emit("player", player.stateToJson());
        }
        context.addCharacter(player, player.x, player.y);
        context.addToStage(player);


        var spriteSheetEnemy = new SpriteSheet({
            images: ["/app/img/enemy.png"],
            frames: {width:64, height:64, regX:32, regY:32},
            animations: {
                walk: [0, 7],
                attack: [10, 15],
                defence: [8, 10],
                damage: [0, 1],
                parried: [0, 7]
            }
        });
        var enemyAnim = new BitmapAnimation(spriteSheetEnemy);
        enemyAnim.name = "player";
        enemyAnim.gotoAndPlay("walk");     //animate
        enemyAnim.currentFrame = 0;

        Ticker.setFPS(20);
        Ticker.addListener(window);

        //////
        player.isMouseDown = false;
        player.isCursor = false;
        player.axisX = 0;
        player.axisY = 0;
        $(canvas).on("mousedown touchstart",
            function(e) {
                player.isMouseDown = true;
                onDrag(e);
                if (Math.pow(player.axisX, 2) + Math.pow(player.axisY, 2) < Math.pow(32, 2)) {
                    player.isCursor = true;
                }
            }).on("mousemove touchmove",
            function(e) {
                onDrag(e);
            }).on("mouseup touchend mouseleave touchleave", function(e) {
                player.isCursor = player.isMouseDown = false;
                player.axisX = player.axisY = 0;
                player.vX = player.vY = 0;
            });

        var onDrag = function(e) {
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

        //socket
        gameSocketIO = io.connect("", {
            'reconnect': true,
            'reconnection delay': 500,
            'max reconnection attempts': 10
        });

        gameSocketIO.on('disconnect', function () {
            setTimeout($.onTimeOut, 300000);
        });

        gameSocketIO.on('connect_failed', function (reason) {
            setTimeout($.onTimeOut, 300000);
        });

        function characterTickFunction(character) {
            return function() {
                if (player.stateId == context.currentHostId
                    && character.teamNumber == 0) {
                    AppUtils.simpleAction(character, context);
                    character.updateFrame();
                    AppUtils.updatePosition(character);
                    context.collideBlocks(character);
                    gameSocketIO.emit("npc", character.stateToJson());
                } else {
                    character.updateFrame();
                }
            }
        }

        gameSocketIO.on('tick', function(data) {
            var characters = data.context.characters;
            context.currentHostId = data.context.currentHostId;

            for (var stateId in context.characters) {
                if (typeof characters[stateId] == "undefined") {
                    var character = context.characters[stateId];
                    character.HP = 0;
                    context.addEffect(character.x, character.y, "dead");
                    context.removeFromStage(character);
                    delete context.characters[stateId];
                }
            }

            var diffClientTime = player.clientTime - data.clientTime;
            if (diffClientTime > __maxDiffClientTime) {
                return false;
            }
            socketTimeout = 100;

            for (var stateId in characters) {
                var json = characters[stateId];
                var character = context.characters[stateId];
                if (typeof character == "undefined") {
                    if (json.teamNumber == 0) {
                        var _enemyAnim = enemyAnim.clone();
                        character = new BaseCharacter(context, _enemyAnim, _basicHandMap, swordAnim.clone(), null);
                    } else {
                        character = new BaseCharacter(context, playerAnim.clone(), _basicHandMap, swordAnim.clone(), shieldAnim.clone());
                    }
                    character.jsonToState(json);
                    character.tick = characterTickFunction(character);
                    context.addCharacter(character);
                    context.addToStage(character);
                } else {
                    character.jsonToState(json);
                }
            }
        });
    }

    init();
});