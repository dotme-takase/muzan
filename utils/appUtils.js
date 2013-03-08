var crypto = require('crypto');
var settings = require("../settings.js").get();

exports.encrypt = function (text) {
    var cipher = crypto.createCipher('aes-256-cbc', settings.securityKey);
    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

exports.decrypt = function (encrypted) {
    var decipher = crypto.createDecipher('aes-256-cbc', settings.securityKey);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

exports.clone = function(obj) {
    var f = function() {
    };
    f.prototype = obj;
    return new f;
}

exports.initCallback = function(callback) {
    if (typeof callback !== "function") {
        return function() {
        };
    } else {
        return callback;
    }
}

function guid(delim) {
    function isString(obj) {
        return ( typeof(obj) == "string" || obj instanceof String );
    }

    var S4 = function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    if (!isString(delim)) {
        delim = "-";
    }
    return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
}

exports.generateGuid = function() {
    return guid("");
}