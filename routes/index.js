/*
 * GET home page.
 */
var appUtils = require('../utils/appUtils.js');
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

    console.log('<img src="' + canvas.toDataURL() + '" />');

    if (req.session && req.session.stateId) {
    } else if (req.session) {
        req.session.stateId = appUtils.generateGuid();
        req.session.save();
    }
    res.render('admin/test', { title: 'Express' })
};