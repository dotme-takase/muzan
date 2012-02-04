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
    if (req.session && req.session.stateId) {
    } else if (req.session) {
        req.session.stateId = appUtils.generateGuid();
        req.session.save();
    }
    res.render('admin/test', { title: 'Express' })
};