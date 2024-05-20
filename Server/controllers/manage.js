var config = require('../helper/_config.js');
var util_helper = require('../helper/util_helper.js');
var file_helper = require('../helper/file_helper.js');
var db_helper = require('../helper/db_helper.js');
// var log_helper = require('../helper/log_helper.js');
// npm install async --save
var async = require('async');
var path = require('path');
var fs = require('fs');
const { exec } = require('child_process');

module.exports.manage = {
    /** 특정 폴더 내의 파일/폴더 리스트 조회하기 */
    /** method : get  */
    /** path:/getDatabaseInfo */
    getDatabaseInfo: function (req, res, next) {
        // 데이터베이스 접속 객체를 참조할 변수
        var dbcon = null;
        var err = null;

        var folderPath = null;
        var folderName = null;

        var result = { returnValue: 0, data: {}, message: '' };

        // 콜백함수의 중첩을 배열의 병렬로 구성하여 순차적으로 실행한다.
        async.waterfall(
            // 순차적으로 수행되어야 하는 절차들 
            [
                /** step-0: 파라미터 받기 */
                function (callback) {
                    // folderPath = req.post('folderPath');
                    // folderName = req.post('folderName');

                    callback(null);
                },

                function (callback) {
                    db_helper(function (con) {
                        dbcon = con;
                        callback(null);
                    });
                },

                function (callback) {
                    var sql = 'select * from userinfo';

                    // dbcon.query(sql, [idblog, idblog], function(err, result) {
                    dbcon.query(sql, [], function (err, result) {
                        if (err) {
                            console.log("DB Error : " + sql);

                            result.returnValue = -1;

                            util_helper.returnResult(err, res, dbcon, result);
                        } else {
                            var tagarray = [];
                            if (result.length > 0) {
                                console.log("결과값");
                                console.log(result);
                                // for (var i = 0; i < result.length; i++) {
                                //     if (result[i].tag) {
                                //         tagarray = result[i].tag.split(' ');
                                //         result[i].tag = tagarray;
                                //     } else {
                                //         result[i].tag = [];
                                //     }
                                // }

                                result.returnValue = 1;
                                result.data = {
                                }

                                util_helper.returnResult(err, res, dbcon, result);
                            } else {
                                console.log("DB Error : " + sql);

                                result.returnValue = -1;

                                util_helper.returnResult(err, res, dbcon, result);
                            }
                        }

                    });
                },
            ]
        );
    },

    /** 특정 폴더 내의 파일/폴더 리스트 조회하기 */
    /** method : post  */
    /** path:/setDatabaseInfo */
    setDatabaseInfo: function (req, res, next) {
        // 데이터베이스 접속 객체를 참조할 변수
        var dbcon = null;
        var err = null;

        var username = null;
    
        var resultData = { returnValue: 0, data: {}, message: '' };

        // 콜백함수의 중첩을 배열의 병렬로 구성하여 순차적으로 실행한다.
        async.waterfall(
            // 순차적으로 수행되어야 하는 절차들 
            [
                /** step-0: 파라미터 받기 */
                function (callback) {
                    username = req.post('username');

                    callback(null);
                },

                function (callback) {
                    db_helper(function (con) {
                        dbcon = con;
                        callback(null);
                    });
                },

                // function (callback) {
                //     var sql = " select email from userinfo where email = ?";
                //     dbcon.query(sql, [username], function (err, result) {
                //         if (err) {
                //             resultData.returnValue = -1;

                //             util_helper.returnResult(err, res, dbcon, resultData);
                //         } else {
                //             if (result.length < 1) {
                //                 callback(null);
                //             } else {
                //                 // 동일한 이름의 아이템이 있음
                //                 resultData.returnValue = -2;
                //                 console.log("이미있음");

                //                 util_helper.returnResult(err, res, dbcon, resultData);
                //             }
                //         }
                //     });
                // },

                function (callback) {
                    var sql = `
                    INSERT INTO userinfo (email)
                    SELECT (?) 
                    FROM dual 
                    WHERE NOT EXISTS (
                        SELECT * FROM userinfo WHERE email = (?)
                    )
                    `;
                    
                    // var sql = "insert into userinfo (email) values (?)";
                    dbcon.query(sql, [username, username], function (err, result) {
                        if (err) {
                            resultData.returnValue = -1;

                            util_helper.returnResult(err, res, dbcon, resultData);
                        } else {
                            if (result.affectedRows != 0) {
                                console.log("등록성공");
                                console.log(result);
                                resultData.returnValue = 1;
                                resultData.data = result;
                                
                                util_helper.returnResult(err, res, dbcon, resultData);
                            } else {
                                result.returnValue = -1;

                                util_helper.returnResult(err, res, dbcon, resultData);
                            }
                        }
                    });
                }
            ]
        );
    },
}