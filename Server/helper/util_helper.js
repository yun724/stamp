var os = require('os');

/**
 * 객체의 깊은 복사 처리 함수
 * @param  {object} obj 복사할 원본 객체
 * @return {object}     복사된 객체
 */
module.exports.clone = function(obj) {
    // 참조복사가 발생하지 않는 요소라면 수행할 필요가 없으므로 원본을 그대로 리턴
    if (obj == undefined || obj == null || typeof obj != "object") {
        return obj;
    }

    // 객체의 생성자를 통해서 동일한 틀의 빈 객체를 생성
    var copy = obj.constructor();

    // 원본의 모든 키에 대한 반복 처리
    for (var attr in obj) {
        if (typeof obj[attr] == 'object') {
            // 복사할 값이 하위 객체라면 이 요소만을 다시 함수 스스로에게 전달
            copy[attr] = this.clone(obj[attr]);
        } else {
            // 복사본에 원본과 같은 키를 생성하면서 값 복사 처리
            copy[attr] = obj[attr];
        }
    }
    return copy;
};

/**
 * 현재 시스템의 IP주소를 조회하여 배열로 리턴한다.
 * @return {Array}   
 */
module.exports.myip = function() {
    var ip_address = [];
    var nets = os.networkInterfaces();

    for (var attr in nets) {
        var item = nets[attr];
        for (var j = 0; j < item.length; j++) {
            // 주소형식이 IPv4이면서 로컬아이피가 아닌 경우
            if (item[j].family == 'IPv4' && item[j].address != '127.0.0.1') {
                ip_address.push(item[j].address);
            }
        }
    }

    return ip_address;
};


/**
 * 현재 시스템의 시각을 리턴한다.
 */
module.exports.getDateTime = function() {
    var now = new Date();
    var datetime = {
        yy: now.getFullYear(),
        mm: now.getMonth(),
        dd: now.getDate(),
        hh: now.getHours(),
        mi: now.getMinutes(),
        ss: now.getSeconds()
    };
    return datetime;
};

module.exports.leadingZeros = function(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (var i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
};

module.exports.getDday = function(y, m, d) {
    // 오늘 날짜
    var today = new Date();
    // 파라미터로 받은 날짜
    // 정상적인 날짜값을 받은 경우, Javascript의 객체에 전달할 때는 "-1"처리해 주어야 한다.
    var dday = new Date(y, m - 1, d);
    // 두 날짜간의 차이를 구한다.
    var cnt = dday.getTime() - today.getTime();
    // 남은 날짜는 1시간이라도 1일로 계산해야 하므로, 연산결과를 올림한다.
    var n = Math.ceil(cnt / (24 * 60 * 60 * 1000));
    return n;
};

module.exports.random = function(n1, n2) {
    return parseInt(Math.random() * (n2 - n1 + 1)) + n1;
};

module.exports.get_random_string = function(len) {
    var temp = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var temp_len = temp.length;
    var str = '';

    for (var i = 0; i < len; i++) {
        var p = this.random(0, temp_len - 1);
        var word = temp.substring(p, p + 1);
        str += word;
    }
    return str;
};

module.exports.cho_hangul = function(str) {
    var cho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    var result = "";
    for (i = 0; i < str.length; i++) {
        code = str.charCodeAt(i) - 44032;
        if (code > -1 && code < 11172) result += cho[Math.floor(code / 588)];
    }
    return result;
};

module.exports.rep_code = function(code, message) {
    var rep_code = {
        code: code,
        message: message
    }
    return rep_code;
};

module.exports.nullcheck = function(res, iduser, accessId, accesstoken, dbcon, callback) {    
    var output = [];
    if (iduser !== undefined && accesstoken !== undefined && accessId !== undefined) {
        if (iduser !== null && accesstoken !== null && accessId !== null) {
            iduser = iduser.toString();
            accesstoken = accesstoken.toString();
            accessId = accessId.toString();

            if (iduser.trim() != '' && accesstoken.trim() != '' && accessId.trim() != '') {
                if (iduser != accessId || accessId == '' || accesstoken == '' || iduser == '') {
                    console.log("iduser, accessId, accesstoken null check and access denied to " + iduser);
                    output.push({
                        rep_code: {
                            code: -9,
                            message: "access denied"
                        },
                        result: {}
                    });
                    res.sendJson(output[0]);
                } else {
                    callback(null);
                }
            } else {
                console.log("iduser, accessId, accesstoken null check and access denied to " + iduser);
                output.push({
                    rep_code: {
                        code: -9,
                        message: "access denied"
                    },
                    result: {}
                });
                res.sendJson(output[0]);
            }
        } else {
            console.log("iduser, accessId, accesstoken null check and access denied to " + iduser);
            output.push({
                rep_code: {
                    code: -9,
                    message: "access denied"
                },
                result: {}
            });
            res.sendJson(output[0]);
        }

    } else {
        console.log("iduser, accessId, accesstoken null check and access denied to " + iduser);
        output.push({
            rep_code: {
                code: -9,
                message: "access denied"
            },
            result: {}
        });
        res.sendJson(output[0]);
    }

};

module.exports.formatDate = function(date) {
    return date.getFullYear() + '년 ' +
        (date.getMonth() + 1) + '월 ' +
        date.getDate() + '일 ' +
        date.getHours() + '시 ' +
        date.getMinutes() + '분';

}

module.exports.formatDateforManager = function(date) {
    return date.getFullYear() + '/' +
        (date.getMonth() + 1) + '/' +
        date.getDate() + '  ' +
        date.getHours() + ':' +
        date.getMinutes();

}

module.exports.returnResult = function (err, res, dbcon, result) {
    // 임대된 접속객체가 존재할 경우 반납
    if (dbcon) {
        dbcon.close();
    }

    // 에러가 존재할 경우 에러메시지 전송
    if (err) {
        if (typeof err === 'string') {
            res.sendBadRequest(err);
        } else {
            res.sendError(err);
        }
    } else {
        res.sendJson(result);
    }
}