if (typeof exports == "undefined") {
    exports = {
        error:function (sMessage) {
        },
        inspect:function (o) {
        }
    };
}


var uuid = exports.uuid = function () {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

var getUrlParams = exports.getUrlParams = function () {
    var url = location.href;
    var result = {};
    url = url.replace(/.*\?(.*?)/, "$1");
    var keyValueList = url.split("&");
    for (var i = 0; i < keyValueList.length; i++) {
        var keyValue = keyValueList[i].split("=");
        result[keyValue[0]] = keyValue[1];
    }
    return result;
};

var escapeHTML = exports.escapeHTML = function (value) {
    var replaceChars = function (ch) {
        switch (ch) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "'":
                return "&#39;";
            case '"':
                return "&quot;";
        }
        return "?";
    };

    return String(value).replace(/[<>&"']/g, replaceChars);
};


var unescapeHTML = exports.unescapeHTML = function (value) {
    return value.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#039;/g, '\'')
        .replace(/&#034;/g, '\"')
        .replace(/&quot;/g, '\"');
};

var simpleHTML = exports.simpleHTML = function (value) {
    var html = "";
    var re = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g;
    var htmlTemp = escapeHTML(value)
        .replace(/ /g, "<nbsp\/>");

    var matchLinks = htmlTemp.match(re);
    if (matchLinks) {
        for (var i = 0; i < matchLinks.length; i++) {
            var n1 = matchLinks[i];
            var n2 = wrapLongText(n1);
            htmlTemp = htmlTemp.replace(n1, '<a target="_blank" href="' + n1 + '">' + n2 + '<\/a>');
        }
    }

    var lines = htmlTemp.replace(/<nbsp\/>/g, "&nbsp;")
        .split(/\r|\n|\r\n/);

    var size = lines.length;
    for (var i = 0; i < size; i++) {
        html += lines[i];
        html += "<br\/>"
    }
    return html;
};

var wrapLongText = exports.wrapLongText = function (str, step) {
    if (typeof str !== "string") {
        return "";
    }
    if (!step || !isNaN(step)) {
        step = 6;
    }
    var size = str.length;
    var count = size / step;
    var j = 0;
    var res = "";
    for (var i = 0; i < count; i++) {
        res += escapeHTML(str.substring(j, j + step));
        res += "<wbr/>";
        j += step;
    }

    if (count * step < size) {
        res += str.substring(count * step);
    }
    return res;
};


var formatDate = exports.formatDate = function (date, format) {

    var result = format;

    var f;
    var rep;

    var yobi = new Array('&#26085;', '&#26376;', '&#28779;', '&#27700;',
        '&#26408;', '&#37329;', '&#22303;');

    f = 'yyyy';
    if (result.indexOf(f) > -1) {
        rep = date.getFullYear();
        result = result.replace(/yyyy/, rep);
    }

    f = 'MM';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getMonth() + 1, 2);
        result = result.replace(/MM/, rep);
    }

    f = 'ddd';
    if (result.indexOf(f) > -1) {
        rep = yobi[date.getDay()];
        result = result.replace(/ddd/, rep);
    }

    f = 'dd';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getDate(), 2);
        result = result.replace(/dd/, rep);
    }

    f = 'HH';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getHours(), 2);
        result = result.replace(/HH/, rep);
    }

    f = 'mm';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getMinutes(), 2);
        result = result.replace(/mm/, rep);
    }

    f = 'ss';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getSeconds(), 2);
        result = result.replace(/ss/, rep);
    }

    f = 'fff';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getMilliseconds(), 3);
        result = result.replace(/fff/, rep);
    }

    return result;

}

var parseDate = exports.parseDate = function (date, format) {
    var year = 1990;
    var month = 01;
    var day = 01;
    var hour = 00;
    var minute = 00;
    var second = 00;
    var millisecond = 000;

    var f;
    var idx;

    f = 'yyyy';
    idx = format.indexOf(f);
    if (idx > -1) {
        year = date.substr(idx, f.length);
    }

    f = 'MM';
    idx = format.indexOf(f);
    if (idx > -1) {
        month = parseInt(date.substr(idx, f.length), 10) - 1;
    }

    f = 'dd';
    idx = format.indexOf(f);
    if (idx > -1) {
        day = date.substr(idx, f.length);
    }

    f = 'HH';
    idx = format.indexOf(f);
    if (idx > -1) {
        hour = date.substr(idx, f.length);
    }

    f = 'mm';
    idx = format.indexOf(f);
    if (idx > -1) {
        minute = date.substr(idx, f.length);
    }

    f = 'ss';
    idx = format.indexOf(f);
    if (idx > -1) {
        second = date.substr(idx, f.length);
    }

    f = 'fff';
    idx = format.indexOf(f);
    if (idx > -1) {
        millisecond = date.substr(idx, f.length);
    }

    var result = new Date(year, month, day, hour, minute, second, millisecond);

    return result;

}

var comPadZero = exports.comPadZero = function (value, length) {
    return new Array(length - ('' + value).length + 1).join('0') + value;
}

var LocalData = {
    put:function (name, value) {
        if ((typeof AppMobi != "undefined")
            && (typeof AppMobi.cache != "undefined")) {
            AppMobi.cache.setCookie(name, JSON.stringify(value), -1);
        } else {
            $.cookie(name, JSON.stringify(value));
        }
    },
    get:function (name, defaultValue) {
        var value = null;
        if ((typeof AppMobi != "undefined")
            && (typeof AppMobi.cache != "undefined")) {
            value = AppMobi.cache.getCookie(name);
        } else {
            value = $.cookie(name);
        }
        if ((typeof value !== "undefined") && (value != null)) {
            try {
                var pValue = JSON.parse(value);
                return pValue;
            } catch (e) {

            }
        }
        return defaultValue;
    }
};

var LocalRanking = {
    dataKey:"localRanking",
    maxRank:10,
    insert:function (point, record) {
        var data = LocalRanking.load();
        if (data == null) {
            data = new Array();
        }
        record.point = point;
        var rankedIn = false;
        for (var i = 0; i < LocalRanking.maxRank; i++) {
            if (i + 1 > data.length) {
                rankedIn = true;
                data[i] = record;
                break;
            } else if (data.hasOwnProperty(i)) {
                var oldRecord = data[i];
                if (point >= oldRecord.point) {
                    rankedIn = true;
                    for (var j = LocalRanking.maxRank - 1; j > i; j--) {
                        data[j] = data[j - 1];
                    }
                    data[i] = record;
                    break;
                }
            }
        }
        if (rankedIn) {
            LocalData.put(LocalRanking.dataKey, data);
            return i;
        }
        return null;
    },
    load:function () {
        return LocalData.get(LocalRanking.dataKey, null);
    }
};

//////////////////////////

$(document).ready(function () {
    $.locale = navigator.userLanguage || navigator.browserLanguage || navigator.language;

    $.i18nLoaded = null;
    $.i18nLoadedCalled = false;
    $.i18nLoadedCallback = function () {
        if (!$.i18nLoadedCalled && (typeof $.i18nLoaded == "function")) {
            $.i18nLoaded();
            $.i18nLoadedCalled = true;
        } else {
            setTimeout($.i18nLoadedCallback, 200);
        }
    };
    $.i18n.properties({
        name:'Messages',
        path:'js/plugins/bundle/',
        mode:'both',
        language:'ja',
        callback:$.i18nLoadedCallback
    });
});
