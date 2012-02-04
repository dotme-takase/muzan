window.onload = function () {
    //start crafty
    Crafty.init(320, 320, 20);
    //Crafty.canvas.init();
    //the loading screen that will display while our assets load
    Crafty.scene("loading", function () {
        //load takes an array of assets and a callback when complete
        Crafty.load(["/app/img/tiles.png", "/app/img/sprite.png"], function () {
            Crafty.scene("main"); //when everything is loaded, run the main scene
        });
        //black background with some loading text
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: 150, y: 120 })
            .text("Loading")
            .css({ "text-align": "center" });
    });   //automatically play the loading scene
    Crafty.scene("main", function () {
        generateWorld();

        Crafty.c('CustomControls', {
            __move: {isDrag: false, isLeftDown: false, isRightDown: false, direction: 0, speed: 0, moveX:0, moveY:0},
            _speed: 8,
            CustomControls: function(speed) {
                if (speed) this._speed = speed;
                var move = this.__move;
                this.requires("Mouse");
                this._onDrag = function(e) {
                    var xAxis = e.realX - this.x - (this.w / 2);
                    var yAxis = e.realY - this.y - (this.h / 2);

                    move.speed = this._speed;//Math.min(Math.sqrt(xAxis * xAxis + yAxis * yAxis) / (this._width / 2), this._speed);
                    move.direction = 90 - (Math.atan2(xAxis, yAxis) * 180 / Math.PI);
                };

                this._stopDrag = function(e) {
                    move.isDrag = false;
                    move.moveX = move.moveY = 0;
                    Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", this._onDrag);
                };

                this._onMouseDown = function(e) {
                    if (move.isDrag) {
                        return false;
                    }
                    console.log(e.which);
                    if (e.which == 3) {
                        move.isRightDown = true;
                    } else if (e.which == 1) {
                        move.isLeftDown = true;
                    }

                    Crafty.addEvent(this, Crafty.stage.elem, "mousemove", this._onDragElse);
                    Crafty.addEvent(this, Crafty.stage.elem, "mouseup", this._onMouseUp);
                    this._onDragElse(e);
                };

                this._onDragElse = function(e) {
                    var xAxis = e.realX - this.x - (this.w / 2);
                    var yAxis = e.realY - this.y - (this.h / 2);

                    move.direction = 90 - (Math.atan2(xAxis, yAxis) * 180 / Math.PI);
                };

                this._onMouseUp = function(e) {
                    move.isRightDown = move.isLeftDown = false;
                    Crafty.removeEvent(this, Crafty.stage.elem, "mousemove", this._onDragElse);
                };

                this.bind('EnterFrame',
                    function() {
                        var isWalking = true;
                        if (!this.isPlaying("player_walk")) {
                            this.sprite(0, 0, 0, 0);
                            this.animate("player_walk", 20);
                        } else if (!isWalking) {
                            this.sprite(0, 0, 0, 0);
                            this.stop("player_walk", 20);
                            move.speed = 0;
                        }

                        move.moveX = Math.cos(move.direction * Math.PI / 180) * move.speed;
                        move.moveY = -1 * Math.sin(move.direction * Math.PI / 180) * move.speed;
                        if (move.moveX) {
                            this.x += move.moveX;
                        }
                        if (move.moveY) {
                            this.y -= move.moveY;
                        }

                        Crafty.viewport.x = 160 - this.x;
                        Crafty.viewport.y = 160 - this.y;
                        this.rotation = move.direction;


                        if (move.isLeftDown) {
                            if (!this.isPlaying("player_right_attack")) {
                                this.animate("player_right_attack", 20);
                            }
                        } else if (move.isRightDown) {
                            if (!this.isPlaying("player_left_defend")) {
                                this.animate("player_left_defend", 20);
                            }
                        }
                    }).bind('Change',
                    function(e) {
                        var framePos = [this.__coord[0] / this.__coord[2], this.__coord[1] / this.__coord[3]];
                        var handMapPos = handMap[framePos[1]][framePos[0]];

                        var theta = this.rotation * Math.PI / 180;
                        var handMapPos2 = [
                            handMapPos[0] * Math.cos(theta) - handMapPos[1] * Math.sin(theta),
                            handMapPos[0] * Math.sin(theta) + handMapPos[1] * Math.cos(theta)
                        ];

                        if (this.isPlaying("player_right_attack")) {
                            if (framePos[0] < this._frame.frameTime - 1) {
                                move.speed = 1;
                            } else {
                                move.speed = -3.6 * (this._frame.frameTime);
                            }
                        }

                        rightArm.x = (this.x + this.w / 2) - rightArm._origin.x + handMapPos2[0];
                        rightArm.y = (this.y + this.h / 2) - rightArm._origin.y + handMapPos2[1];
                        rightArm.rotation = this.rotation + handMapPos[2];
                    }).bind('KeyDown',
                    function(e) {
                        //default movement booleans to false

                        //if keys are down, set the direction
                        if (e.keyCode === Crafty.keys.RIGHT_ARROW) move.right = true;
                        if (e.keyCode === Crafty.keys.LEFT_ARROW) move.left = true;
                        if (e.keyCode === Crafty.keys.UP_ARROW) move.up = true;
                        if (e.keyCode === Crafty.keys.DOWN_ARROW) move.down = true;

                    }).bind('KeyUp',
                    function(e) {
                        //if key is released, stop moving
                        if (e.keyCode === Crafty.keys.RIGHT_ARROW) move.right = false;
                        if (e.keyCode === Crafty.keys.LEFT_ARROW) move.left = false;
                        if (e.keyCode === Crafty.keys.UP_ARROW) move.up = false;
                        if (e.keyCode === Crafty.keys.DOWN_ARROW) move.down = false;
                    }).bind('MouseDown',
                    function(e) {
                        move.isDrag = true;
                        Crafty.addEvent(this, Crafty.stage.elem, "mousemove", this._onDrag);
                        Crafty.addEvent(this, Crafty.stage.elem, "mouseout", this._stopDrag);
                        Crafty.addEvent(this, Crafty.stage.elem, "mouseup", this._stopDrag);
                    }).bind('MouseUp', function(e) {
                        this._stopDrag();
                    });

                Crafty.addEvent(this, Crafty.stage.elem, "mousedown", this._onMouseDown);
                return this;
            }
        });

        //create our player entity with some premade components
        player = Crafty.e("2D, Canvas, player_walk, Mouse, CustomControls, SpriteAnimation")
            .origin("center")
            .attr({x: 256, y: 256, w: 64, h: 64, z: 10})
            .CustomControls(3)
            .animate("player_walk", 0, 0, 7)
            .animate("player_left_attack", 0, 0, 0)
            .animate("player_left_defend", 0, 1, 3)
            .animate("player_right_attack", 3, 1, 7)
            .animate("player_right_defend", 0, 0, 0);

        rightArm = Crafty.e("2D, Canvas, sword")
            .origin(15, 55)
            .attr({x: 256, y: 256, w: 32, h: 64, z: 8});

        Crafty.viewport.x = -64;
        Crafty.viewport.y = -128;
    });

    function generateWorld() {
        //loop through all tiles
        for (var i = 0; i < 16; i++) {
            for (var j = 0; j < 16; j++) {
                //place grass on all tiles

                Crafty.e("2D, Canvas, f1")
                    .attr({ x: i * 128, y: j * 128, z:1 });
                var block = blockMap[j][i];
                if (block) {
                    Crafty.e("2D, Canvas, " + block)
                        .attr({ x: i * 128, y: j * 128, z:20 });
                }

            }
        }
    }

    Crafty.sprite(128, "/app/img/tiles.png", {
        w1 : [1, 1],
        w1_tl1 : [0, 0],
        w1_t1 : [1, 0],
        w1_tr1 : [2, 0],
        w1_l1 : [0, 1],
        w1_r1 : [2, 1],
        w1_bl1 : [0, 2],
        w1_b1 : [1, 2],
        w1_br1 : [2, 2],
        w1_br2 : [3, 0],
        w1_bl2 : [4, 0],
        w1_tr2 : [3, 1],
        w1_tl2 : [4, 1],
        d1_t1 : [5, 0],
        d1_b1 : [6, 0],
        d1_l1 : [5, 1],
        d1_r1 : [6, 1],
        d2_b1 : [3, 2],
        d2_r1 : [4, 2],
        d2_l1 : [5, 2],
        d2_t1 : [6, 2],
        f1: [0,6]
    });

    Crafty.sprite(64, "/app/img/sprite.png", {
        player_walk: [0, 0],
        player_attack: [0, 1],
        enemy_walk: [0, 2],
        enemy_attack: [0, 3]
    });

    Crafty.sprite(32, "/app/img/swords.png", {
        sword: [0, 0, 1, 2]
    });

    Crafty.sprite(64, "/app/img/shields.png", {
        shield: [0, 1]
    });

    var handMap = [
        [
            [-1, 25, 90, false],
            [-8, 26, 105, false],
            [-21, 25, 130, false],
            [-8, 26, 105, false],
            [-1, 25, 90, false],
            [13, 21, 75, false],
            [20, 12, 50, false],
            [13, 21, 75, false]
        ]
        ,
        [
            [-1, 26, 260, false],
            [-23, 18, 290, false],
            [-27, -5, 310, false],
            [-12, 25, 180, false],
            [-1, 26, 160, false],
            [20, 20, 115, false],
            [28, 2, 60, false],
            [13, 21, 75, false]
        ]
    ];

    var blockMap = [
        ["w1_br2", "w1_b1", "w1_b1", "w1_b1", "d1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_bl2"]
        ,
        ["w1_r1", "w1_tl1", "w1_t1", "w1_t1", "d1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_tr1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "d2_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
        ,
        ["w1_r1", "w1_bl1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_br1", "w1_l1"]
        ,
        ["w1_tr2", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_tl2"]
    ];
    Crafty.scene("loading");
};
