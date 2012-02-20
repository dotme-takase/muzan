/*
 * GET home page.
 */
var AppContext = require('../public/app/AppContext.js');
var MapGenerator = require('../public/app/MapGenerator.js').MapGenerator;
var appUtils = require('../utils/appUtils.js');

var __blockMap = [
    ["w1_br2", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_bl2"]
    ,
    ["w1_r1", "w1_tl1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_tr1", "w1_tl1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_tr1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, null, null, null, null, null, "w1_r1", "w1_l1", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "d2_l1", null, null, null, "w1_br2", "w1_bl2", null, "w1_r1", "w1_l1", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, null, null, "w1_r1", "w1_l1", null, "w1_r1", "w1_l1", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_bl1", "w1_b1", "w1_b1", "w1_b1", "w1_br1", "w1_l1", null, "w1_r1", "w1_l1", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_tl1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_tl2", null, "w1_r1", "w1_l1", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, null, null, null, null, null, "w1_r1", "w1_l1", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, "w1_br2", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_br1", "w1_bl1", "w1_bl2", null, "w1_br2", "w1_b1", "w1_br1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, "w1_tr2", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_tr1", "w1_tl1", "w1_tl2", null, "w1_tr2", "w1_t1", "w1_tr1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, null, null, null, null, null, "w1_r1", "w1_l1", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, "w1_br2", "w1_bl2", null, null, null, "w1_r1", "w1_l1", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, "w1_r1", "w1_l1", null, null, null, "w1_tr2", "w1_tl2", null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_l1", null, "w1_r1", "w1_l1", null, null, null, null, null, null, null, null, null, "w1_r1", "w1_l1"]
    ,
    ["w1_r1", "w1_bl1", "w1_b1", "w1_br1", "w1_bl1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_b1", "w1_br1", "w1_l1"]
    ,
    ["w1_tr2", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_t1", "w1_tl2"]
];

var socketList = {};
var presentIdList = [];
exports.initializeSocket = function(io, connect, sessionStore) {

    io.configure('production', function() {
        io.set('log level', 1);
    });

    //============ Initialize =======================================
    var parseCookie = connect.utils.parseCookie;
    var Session = connect.middleware.session.Session;
    io.configure(function () {
        io.set('authorization', function (handshakeData, callback) {
            if (handshakeData.headers.cookie) {
                var cookie = handshakeData.headers.cookie;
                var sessionID = parseCookie(cookie)['connect.sid'];
                handshakeData.cookie = cookie;
                handshakeData.sessionID = sessionID;
                handshakeData.sessionStore = sessionStore;
                sessionStore.get(sessionID, function (err, session) {
                    if (err) {
                        callback(err.message, false);
                    } else {
                        handshakeData.session = new Session(handshakeData, session);
                        callback(null, true);
                    }
                });
            } else {
                return callback('Cookie not found.', false);
            }
        });
    });

    io.sockets.on('connection', function(socket) {
        var handshake = socket.handshake;
        var cid = parseCookie(handshake.cookie)['connect.sid'];

        if (handshake.session && handshake.session.stateId) {
            var myStateId = handshake.session.stateId;
            //ToDo keep alive
            var intervalID = setInterval(function () {
                handshake.session.reload(function() {
                    console.log("reload", handshake.session);
                    handshake.session.touch().save();
                });
            }, 36000000);

            var tickID = setInterval(function() {
                var _clientTime = 0;
                var _characters = AppContext.currentContext.characters;
                if (typeof _characters[myStateId] != "undefined") {
                    _clientTime = _characters[myStateId].clientTime;
                }

                var data = {
                    context: AppContext.currentContext,
                    clientTime: _clientTime
                };
                if (typeof stockTicks[myStateId] != "undefined"
                    && stockTicks[myStateId] <= maxStockTicks) {
                    socket.emit('tick', data);
                }
            }, 25);

            socket.on('player', function (data) {
                var stateId = data.stateId;
                if (stateId == myStateId) {
                    var character = AppContext.currentContext.characters[stateId] = data;
                    clientTimes[stateId] = character.clientTime;
                    character.expire = 200;
                    AppContext.currentContext.collideCharactersOnServer(character);

                    //
                    if (AppContext.currentContext.currentHostId == -1) {
                        AppContext.currentContext.currentHostId = stateId;
                    }
                    stockTicks[stateId]++;
                }
            });

            socket.on('npc', function (data) {
                if (myStateId == AppContext.currentContext.currentHostId) {
                    var stateId = data.stateId;
                    var character = AppContext.currentContext.characters[stateId] = data;
                    character.expire = 200;
                    AppContext.currentContext.collideCharactersOnServer(character);
                }
            });

            // on disconnect
            socket.on('disconnect', function () {
                if (myStateId == AppContext.currentContext.currentHostId) {
                    AppContext.currentContext.currentHostId = -1;
                }
                clearInterval(intervalID);
                clearInterval(tickID);
            });
        }
    });
    //============ /Initialize ======================================
}

exports.isPresent = function(userId) {
    if (typeof socketList !== "undefined" && socketList[userId]) {
        for (var k in socketList[userId]) {
            console.log(userId + "is present: " + k);
            return true;
        }
    }
    return false;
}

exports.emit = function (userId, name, data) {
    if (exports.isPresent(userId)) {
        var userSocketList = socketList[userId];
        for (var cid in userSocketList) {
            userSocketList[cid].emit(name, data);
        }
    }
}

//server side
var AppContext = require("../public/app/AppContext.js");
var AppContextClass = AppContext.AppContext;
var globalTick;
var stockTicks = [];
var maxStockTicks = 1;
var clientTimes = [];
var appendEnemyNum = 5;

function initializeAppContext() {
    AppContext.currentContext = new AppContextClass();
    var genMap = MapGenerator.generate();
    AppContext.currentContext.loadBlockMap(genMap);

    for (var i = 0; i < appendEnemyNum; i++) {
        var enemy = AppContext.createStateJson();
        enemy.speed = 8;
        enemy.mode = AppContext.EnemyMode.RANDOM_WALK;
        AppContext.currentContext.addCharacter(enemy);
    }
    clearInterval(globalTick);
}
initializeAppContext();
globalTick = setInterval(function() {
    var enemyNum = 0;
    var playerNum = 0;
    var hostExists = false;
    for (var k in  AppContext.currentContext.characters) {
        var character = AppContext.currentContext.characters[k];
        stockTicks[k] = 0;

        if (character.stateId == AppContext.currentContext.currentHostId) {
            hostExists = true;
        }
        if (character.teamNumber == 0) {
            enemyNum++;
        } else {
            playerNum++;
        }
        //expire
        character.expire--;
        if (character.expire < 0) {
            character.HP = 0;
            character.action = AppContext.CharacterAction.DEAD;
            delete AppContext.currentContext.characters[character.stateId];
        }

        //catcher in the rye
        {
            if (character.x < 0) {
                AppContext.currentContext.warpToRandom(character);
            }
            if (character.y < 0) {
                AppContext.currentContext.warpToRandom(character);
            }
            if (character.x > AppContext.currentContext.mapBounds.width) {
                AppContext.currentContext.warpToRandom(character);
            }
            if (character.y > AppContext.currentContext.mapBounds.height) {
                AppContext.currentContext.warpToRandom(character);
            }
        }
    }
    if (!hostExists) {
        AppContext.currentContext.currentHostId == -1;
    }

    if (enemyNum < appendEnemyNum / 2) {
        var newAppendNum = appendEnemyNum + (appendEnemyNum * playerNum / 2) - enemyNum;
        for (var i = 0; i < newAppendNum; i++) {
            var enemy = AppContext.createStateJson();
            enemy.speed = 8;
            enemy.mode = AppContext.EnemyMode.RANDOM_WALK;
            AppContext.currentContext.addCharacter(enemy);
        }
    }

    AppContext.currentContext.updateTree();
    AppContext.currentContext.afterCharactersUpdate();
}, 50);

exports.init = function(req, res) {
    initializeAppContext();
    var data = {
        context: AppContext.currentContext
    };
    if (req.session && req.session.stateId) {
        var stateId = req.session.stateId;
        stockTicks[stateId] = 0;
        if (typeof AppContext.currentContext.characters[stateId] == "undefined") {
            var character = AppContext.createStateJson(stateId);
            character.speed = 10;
            character.HP = 256;
            character.teamNumber = stateId;
            AppContext.currentContext.addCharacter(character);
        }
        data.stateId = stateId;
    }
    res.json(data);
};

exports.multiplay = function(req, res) {
    if (req.session && req.session.stateId) {
    } else if (req.session) {
        req.session.stateId = appUtils.generateGuid();
        req.session.save();
    }
    res.render('multiplay', { title: 'Express' })
};

exports.practice = function(req, res) {
    if (req.session && req.session.stateId) {
    } else if (req.session) {
        req.session.stateId = appUtils.generateGuid();
        req.session.save();
    }
    res.render('practice', { title: 'Express' })
};