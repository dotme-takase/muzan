var _canvas = document.getElementById("canvas");


///
var LoadingIcon = function () {
    this.initialize.apply(this, arguments)
};
LoadingIcon.prototype = {
    initialize:function (rgb) {
        this.size = 5;
        var element = _canvas,
            ctx = element.getContext('2d');
        this.element = element;
        ctx.translate(Math.floor(_canvas.width / 2)
            , Math.floor(_canvas.height / 2));
        ctx.rotate(-Math.PI / 2);
        this.ctx = ctx;
        this.rgb = rgb || '0, 0, 0';
        this.alpha = [ 1.0, 0.8, 0.6, 0.3, 0.3, 0.2, 0.1, 0.1 ];
    },
    drawCircle:function () {
        var ctx = this.ctx;
        ctx.clearRect(Math.floor(-1 * _canvas.width / 2)
            , Math.floor(-1 * _canvas.height / 2)
            , Math.floor(_canvas.width / 2)
            , Math.floor(_canvas.height / 2));

        for (var i in this.alpha) {
            this.drawBar(this.alpha[i]);
        }
        ctx.rotate(Math.PI / 4);
    },
    drawBar:function (alpha) {
        var ctx = this.ctx;
        ctx.fillStyle = 'rgba(' + this.rgb + ',' + alpha + ')';
        ctx.rotate(-Math.PI / 4);
        ctx.beginPath();
        for (var i = 0; i < this.size; i++) {
            ctx.arc(8 + i, 8 + i, 2, 0, Math.PI * 2, true);
        }
        ctx.fill();
    },
    start:function () {
        var self = this;
        this.timer = window.setInterval(function () {
            self.drawCircle();
        }, 100);
        return this;
    },
    stop:function () {
        window.clearInterval(this.timer);
    }
};

var loading = new LoadingIcon('128,128,128');
loading.start();
///

createjs = {};
ejecta.require('ejecta-heart-createjs.js');
ejecta.require('AppContext.js');
ejecta.require('QuadTree.js');
ejecta.require('BaseCharacter.js');
ejecta.require('BitmapItem.js');
ejecta.require('MapGenerator.js');
ejecta.require('offline.js');

// i18n
ejecta.require('ejecta-i18n.js');
ejecta.require('TextLink.js');
__.i18nLoaded = null;
__.i18nLoadedCalled = false;
__.i18nLoadedCallback = function () {
    if (!__.i18nLoadedCalled && (typeof __.i18nLoaded == "function")) {
        __.i18nLoaded();
        __.i18nLoadedCalled = true;
    } else {
        setTimeout(__.i18nLoadedCallback, 200);
    }
};
__.i18n.properties({
    name:'Messages',
    path:'bundle/',
    mode:'both',
    language:'ja',
    callback:__.i18nLoadedCallback
});

__.i18nLoaded = function () {
    app.canvas = _canvas;
    app.rootPath = ".";
    app.onInitialized = function () {
        app.viewApp.addChild(new createjs.Shape((new createjs.Graphics())
            .beginFill('#000000')
            .drawRect(0, 0, app.canvas.width, app.canvas.height)
        ));

        //Main Menu
        __.mainMenu = new createjs.Container();
        __.mainMenu.addChild(new createjs.Shape((new createjs.Graphics())
            .beginFill('#000000')
            .drawRect(0, 0, app.canvas.width, app.canvas.height)
        ));
        __.mainMenu.addChild(new createjs.Bitmap("img/title.png"));


        new TextLink(
            __.mainMenu,
            {
                x:4,
                y:app.canvas.height - 100,
                width:app.canvas.width - 8,
                height:48
            },
            __.i18n.prop("menuStartGame"),
            "#FFFFFF",
            "#282226",
            function () {
                createjs.Tween.get(__.mainMenu).to({alpha:0}, 200, createjs.Ease.circIn);
                createjs.Tween.get(app.viewApp).to({alpha:0}, 300, createjs.Ease.circIn);
                app.pause = false;
            }
        );

        new TextLink(
            __.mainMenu,
            {
                x:4,
                y:app.canvas.height - 50,
                width:app.canvas.width - 8,
                height:48
            },
            __.i18n.prop("menuRanking"),
            "#FFFFFF",
            "#282226",
            function () {
                createjs.Tween.get(__.mainMenu).to({alpha:0}, 200, createjs.Ease.circIn);
                createjs.Tween.get(__.ranking).to({alpha:1.0}, 200, createjs.Ease.circIn);
            }
        );
        app.viewApp.addChild(__.mainMenu);

        //Ranking
        __.ranking = new createjs.Container();
        __.ranking.addChild(new createjs.Shape((new createjs.Graphics())
            .beginFill('#000000')
            .drawRect(0, 0, app.canvas.width, app.canvas.height)
        ));

        __.ranking.alpha = 0;
        var rankHeight = 32;
        var rankNum = Math.floor(app.canvas.height / (rankHeight + 2));
        for (var i = 0; i < rankNum; i++) {
            var ranking = LocalRanking.load();
            var text = "";
            if ((ranking != null) && (i < ranking.length)) {
                var record = ranking[i];
                if (record != null) {
                    text = __.i18n.prop('textRecordDefeated',
                        record.floor, __.i18n.prop('npc' + record.enemy), i + 1);
                }
            }
            new TextLink(
                __.ranking,
                {
                    x:4,
                    y:2 + (rankHeight + 2) * i,
                    width:app.canvas.width - 8,
                    height:rankHeight
                },
                text,
                "#FFFFFF",
                "#333333",
                function () {
                    createjs.Tween.get(__.ranking).to({alpha:0}, 200, createjs.Ease.circIn);
                    createjs.Tween.get(__.mainMenu).to({alpha:1.0}, 200, createjs.Ease.circIn);
                }
            );
        }
        app.viewApp.addChild(__.ranking);
    };
    app.onGameover = function () {
        createjs.Tween.get(__.ranking).to({alpha:1}, 300, createjs.Ease.circIn);
        createjs.Tween.get(app.viewApp).to({alpha:1}, 200, createjs.Ease.circIn);
        app.initializeGame(null);
        app.pause = true;
    }
    app.initializeFirst();
    setTimeout(function () {
        loading.stop();
    }, 500);
//app.pause = false;
}
;



