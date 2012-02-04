//function called by the Tick instance at a set interval
var canvas, stage, context;
var scoreField, subjectField;

var tick;

function timeToString(time) {
    var str = time.toString();
    if (str.length > 2) {
        return str.substr(0, str.length - 2) + "." + str.substr(str.length - 2);
    } else {
        return str;
    }
}

//initialize function, called when page loads.
$(function() {
        tick = function() {
            scoreField.text = timeToString($.typing.status.time);
            stage.update();
            $("#src").attr('src', canvas.toDataURL());
        }

        $.typing = {};
        function init() {
            initializeGame();
        }

        function initializeGame() {
            canvas = document.getElementById("stageCanvas");
            stage = new Stage(canvas);
            $.typing.subjectMasterList = [
                {
                    text:"こんにちは",
                    standardTime: 3000
                },
                {
                    text:"おはようございます",
                    standardTime: 3000
                },
                {
                    text:"お疲れさまでした",
                    standardTime: 3000
                },
                {
                    text:"いつも大変お世話になっております",
                    standardTime: 5000
                },
                {
                    text:"お手数ですが、よろしくお願いいたします",
                    standardTime: 5000
                },
                {
                    text:"この度は誠に申し訳ございませんでした",
                    standardTime: 5000
                },
                {
                    text:"今週末のご予定はいかがですか",
                    standardTime: 5000
                },
                {
                    text:"後ほどお電話させていただきます",
                    standardTime: 5000
                },
                {
                    text:"貴社ますますご盛栄のこととお喜び申し上げます",
                    standardTime: 10000
                },
                {
                    text:"近日中に具体的なお打合せに参上いたしたく、\nご都合お伺いいたします",
                    standardTime: 10000
                },
                {
                    text:"今後とも、弊社製品をご愛顧くださいますよう\nお願い申し上げます",
                    standardTime: 10000
                },
                {
                    text:"平素は格別のお引立てを賜り、\n厚くお礼申し上げます",
                    standardTime: 10000
                },
                {
                    text:"よろしくご手配くださいますよう\nお願い申し上げます",
                    standardTime: 10000
                }
            ];


            function shuffle(list) {
                var i = list.length;

                while (--i) {
                    var j = Math.floor(Math.random() * (i + 1));
                    if (i == j) continue;
                    var k = list[i];
                    list[i] = list[j];
                    list[j] = k;
                }
                return list;
            }

            $.typing.subjectList = shuffle($.typing.subjectMasterList).slice(0, 5);
            $.typing.status = {
                subjectIndex: -1,
                score: 0,
                time: 0,
                results: []
            };
            $.typing.currentSubject = function() {
                return $.typing.subjectList[$.typing.status.subjectIndex];
            };

            setInterval(function() {
                $.typing.status.time++;
            }, 1);

            scoreField = new Text("", "bold 12px Arial", "#AAAAAA");
            scoreField.textAlign = "right";
            scoreField.x = canvas.width - 10;
            scoreField.y = 22;
            stage.addChild(scoreField);

            subjectField = new Text("", "bold 16 Arial", "#666666");
            subjectField.textAlign = "center";
            subjectField.x = canvas.width / 2;
            subjectField.y = 64;
            stage.addChild(subjectField);

            var spriteSheetEffects = new SpriteSheet({
                images: ["/app/img/effect.png"],
                frames: {width:128, height:128, regX:64, regY:64},
                animations: {
                    hit: [0, 4],
                    submit: [5, 9]
                }
            });

            function nextSubject() {
                $.typing.status.subjectIndex++;
                subjectField.text = $.typing.currentSubject().text;
            }

            $.typing.onSubmit = function() {

            }
            Ticker.setFPS(20);
            Ticker.addListener(window);
            nextSubject();
        }


        init();
    }

);