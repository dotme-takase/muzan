var url = require("url");
exports.get = function() {
    var redisOpts = {
        "hostname" : null,
        "port" : null,
        "password" : null,
        "options" : null
    };
    if (process.env.REDISTOGO_URL) {
        var redisUri = url.parse(process.env.REDISTOGO_URL);
        redisOpts = {
            "hostname": redisUri.hostname,
            "port": redisUri.port,
            "password": redisUri.auth.split(':')[1]
        };
    }
    return {
        "appUrl":"http://localhost:3000",
        "facebook" : {
            "appId" : "********",
            "secretKey": "********"
        },
        "google" : {
            "appId" : "********",
            "secretKey": "********"
        },
        "twitter" : {
            "appId" : "********",
            "secretKey": "********"
        },
        "mysql" : {
            "hostname" : "localhost",
            "port" : 3306,
            "user" : "******",
            "password" : "******",
            "dbname" : "******"
        },
        "redis" : redisOpts,
        "smtp" : {
            "host": '******',
            "port": 587,
            "ssl": false,
            "use_authentication": true,
            "user": '******',
            "pass": '******'
        },
        "mailSender" : "******",
        "securityKey" : "******",
        "chatExpireDays": 7,
        "limitPerPage": 10,
        "maxRoom": 10,
        "maxMember":200,
        "disableWebSocket": false
    };
};
