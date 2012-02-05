/*
 * GET home page.
 */
var appUtils = require('../utils/appUtils.js');
var fs = require('fs');
exports.game = require('./game.js');

//mini game
exports.typing = function(req, res) {
    if (req.session && req.session.stateId) {
    } else if (req.session) {
        req.session.stateId = appUtils.generateGuid();
        req.session.save();
    }
    res.render('typing', { title: 'Express' })
};


exports.test = function(req, res) {
    var Canvas = require('canvas')
        , canvas = new Canvas(200, 200)
        , ctx = canvas.getContext('2d');

    ctx.font = '30px Impact';
    ctx.rotate(.1);
    ctx.fillText("Awesome!", 50, 100);

    var te = ctx.measureText('Awesome!');
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.lineTo(50 + te.width, 102);
    ctx.stroke();

    if (req.session && req.session.stateId) {
    } else if (req.session) {
        req.session.stateId = appUtils.generateGuid();
        req.session.save();
    }
    res.render('admin/test', { image: canvas.toDataURL() })
};

var armorMap = [
    [0, 0, 0],
    [0, 0, 15],
    [0, 0, 30],
    [0, 0, 15],
    [0, 0, 0],
    [0, 0, -15],
    [0, 0, -30],
    [0, 0, -15],
    [0, 0, 0],
    [0, 0, 55],
    [0, 0, 100],
    [0, 0, 15],
    [0, 0, 0],
    [0, 0, -55],
    [0, 0, -100],
    [0, 0, -15]
];

exports.postTest = function(req, res) {
    if (req.body && req.body.image && !req.body.image.error) {
        var image = req.body.image;
        var type = image.type;
        var availableTypes = ["image/gif", "image/jpeg", "image/png"];
        if (availableTypes.indexOf(type) < 0) {
            var error = new Error("Not Supported type " + type);
            console.log(error);
            res.redirect("/");
        }
        //res.contentType(image.type);

        var gear = fs.readFileSync(__dirname + '/../public/images/gear.png');
        var Canvas = require('canvas')
            , Image = Canvas.Image
            , canvas = new Canvas(512, 512)
            , ctx = canvas.getContext('2d');

        var img = new Image;
        var buf = new Buffer(image.value, "base64");
        img.src = buf;

        var w = 64;
        var h = 64;
       
        var fX = 0;
        var fY = 0;
        for (var k in armorMap) {
            if (fX == 8) {
                fX = 0;
                fY++;
            }
            var map = armorMap[k];
            var offX = fX * w + map[0];
            var offY = fY * h + map[1];
            var r = map[2] * Math.PI / 180;

            ctx.save();
            ctx.translate(0.5 * w + offX, 0.5 * h + offY);
            ctx.rotate(r);
            ctx.translate(-0.5 * w, -0.5 * h);
            ctx.drawImage(img, 0, 0, w, h);
            ctx.restore();
            fX++;
        }

        //res.send(new Buffer(canvas.toBuffer(), "base64"));
        res.render('admin/test', { image: canvas.toDataURL() });

    } else {
        res.redirect("/");
    }
}