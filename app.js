/**
 * Module dependencies.
 */
var settings = require("./settings.js").get();

var express = require('express')
    , routes = require('./routes')

var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(require('./utils/customizedBodyParser.js')());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

var io = require('socket.io').listen(app);
var connect = require('express/node_modules/connect');


// Routes
//single
app.get('/g/init', routes.game.init);
app.get('/', routes.game.practice);

//multiplay
app.get('/m', routes.game.multiplay);

//mini game
app.get('/t', routes.typing);

//admin
app.get('/admin/test', routes.test);
app.post('/admin/test', routes.postTest);

var port = process.env.PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
