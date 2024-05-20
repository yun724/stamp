var db_helper = require('../helper/db_helper.js');
var util_helper = require('../helper/util_helper.js');
var async = require('async');

var fs = require('fs');

var data = null;
fs.readFile('./version.txt', 'utf8', function(err, data1) {
    var fixedResponse = data1.replace(/\\'/g, "'");
    data1 = JSON.parse(fixedResponse);

    data = data1;
});

module.exports.version = {
    /** version체크  */
    /** method : get  */
    /** path:/version/:ver/:platform */
    check: function(req, res, next) {
        // req.accepts('application/json');
        console.log('[VERSION] Checking....');
        var dbcon = null;
        // 검색어 파라미터를 저장할 변수
        var version = null;
        var platform = null;

        var android = 'Android';
        var ios = 'iOS';
        async.waterfall(
            // 순차적으로 수행되어야 하는 절차들 
            [
                function(callback) {
                    version = req.get('ver');
                    if (req.get('platform')) {
                        var platformBuffer = new Buffer(req.get('platform'), 'base64');
                        platform = platformBuffer.toString('utf8');
                    } else {
                        output.push({
                            rep_code: util_helper.rep_code(3, "platform doesnt exist"),
                            result: {}
                        });
                        return res.sendJson(output[0]);
                    }
                    
                    callback(null);
                },

                function(callback) {
                     db_helper(function(con) {
                         dbcon = con;
                         callback(null);
                     });
                 },

                function(callback) {
                    var output = [];

                    if (data.serverstate != 1) {
                        if (platform == android) {
                            if (version == data.androidVersion) {
                                console.log("버전 일치");
                                output.push({
                                    rep_code: util_helper.rep_code(1, "succeed"),
                                    code: 1,
                                    homeUrl: data.homeUrl,
                                    result: {
                                        code: 1,
                                        path: "",
                                        homeUrl: data.homeUrl
                                    }
                                });
                                if (dbcon) {
                                    dbcon.close();
                                }
                                
                                return res.sendJson(output[0]);
                            } else if (version == Number(data.androidVersion) + 1) {
                                console.log("버전 불일치 테섭으로 ");
                                output.push({
                                    rep_code: util_helper.rep_code(2, "succeed"),
                                    code: 1,
                                    homeUrl: data.testhomeurl,
                                    result: {
                                        code: 2,
                                        path: "",
                                        homeUrl: data.testhomeurl
                                    }
                                });
                                if (dbcon) {
                                    dbcon.close();
                                }
                                return res.sendJson(output[0]);
                            } else {
                                console.log("버전 불일치 업데이트 ");
                                output.push({
                                    rep_code: util_helper.rep_code(0, "succeed"),
                                    code: 0,
                                    homeUrl: data.homeUrl,
                                    result: {
                                        code: 0,
                                        path: data.android,
                                        homeUrl: data.homeUrl
                                    }
                                });
                                if (dbcon) {
                                    dbcon.close();
                                }
                                return res.sendJson(output[0]);
                            }
                        } else if (platform == ios) {
                            if (version == data.iosVersion) {
                                output.push({
                                    rep_code: util_helper.rep_code(1, "succeed"),
                                    code: 1,
                                    homeUrl: data.homeUrl,
                                    result: {
                                        code: 1,
                                        path: "",
                                        homeUrl: data.homeUrl
                                    }
                                });
                                if (dbcon) {
                                    dbcon.close();
                                }
                                return res.sendJson(output[0]);
                            } else if (version == Number(data.iosVersion) + 1) {
                                output.push({
                                    rep_code: util_helper.rep_code(2, "succeed"),
                                    code: 1,
                                    homeUrl: data.testhomeurl,
                                    result: {
                                        code: 2,
                                        path: "",
                                        homeUrl: data.testhomeurl
                                    }
                                });
                                if (dbcon) {
                                    dbcon.close();
                                }
                                return res.sendJson(output[0]);
                            } else {
                                output.push({
                                    rep_code: util_helper.rep_code(0, "succeed"),
                                    code: 0,
                                    homeUrl: data.homeUrl,
                                    result: {
                                        code: 0,
                                        path: data.ios,
                                        homeUrl: data.homeUrl
                                    }
                                });
                                if (dbcon) {
                                    dbcon.close();
                                }
                                return res.sendJson(output[0]);
                            }
                        } else {
                            console.log("Platform doesn't covered : " + platform);
                            output.push({
                                rep_code: util_helper.rep_code(0, "Platform doesn't covered "),
                                code: 0,
                                homeUrl: data.homeUrl,
                                result: {
                                    code: 0,
                                    path: "",
                                    homeUrl: data.homeUrl
                                }
                            });
                            if (dbcon) {
                                dbcon.close();
                            }
                            return res.sendJson(output[0]);
                        }
                    } else {
                        console.log("서버 점검중");
                        output.push({
                            rep_code: util_helper.rep_code(2, "서버 점검중"),
                            code: 2,
                            homeUrl: data.homeUrl,
                            result: {
                                code: 2,
                                path: "",
                                homeUrl: data.homeUrl
                            }
                        });
                        if (dbcon) {
                            dbcon.close();
                        }
                        return res.sendJson(output[0]);
                    }
                }
            ],

            // 결과처리 함수
            function(err, result) {
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
        );
    },
}