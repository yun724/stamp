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

module.exports.page = {
    main: function(req, res, next) {
        // 데이터베이스 접속 객체를 참조할 변수
        var dbcon = null;
        // 검색어 파라미터를 저장할 변수
        // 콜백함수의 중첩을 배열의 병렬로 구성하여 순차적으로 실행한다.
        async.waterfall(
            // 순차적으로 수행되어야 하는 절차들 
            [
                /** step-1: 접속할 html 파일 읽기 */
                function(callback) {  
                    var output = [];
                    console.log("dddddd");
                    // 개발환경이면 story_map_dev.html 로 메인페이지 연결
                    // 라이브 환경이면 story_map.html 로 메인페이지 연결
                    fs.readFile('./www/main.html', function(error, data) {
                        if (error) {
                            output.push({
                                rep_code: util_helper.rep_code(-1, error),
                                result: {}
                            });
                            callback(null, output[0]);
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(data);
                        }
                    })

                },

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
    
    stamp: function(req, res, next) {
        // 데이터베이스 접속 객체를 참조할 변수
        var dbcon = null;
        // 검색어 파라미터를 저장할 변수
        // 콜백함수의 중첩을 배열의 병렬로 구성하여 순차적으로 실행한다.
        async.waterfall(
            // 순차적으로 수행되어야 하는 절차들 
            [
                /** step-1: 접속할 html 파일 읽기 */
                function(callback) {  
                    var output = [];
                    console.log("oooooo");
                    // 개발환경이면 story_map_dev.html 로 메인페이지 연결
                    // 라이브 환경이면 story_map.html 로 메인페이지 연결
                    fs.readFile('./www/stamp.html', function(error, data) {
                        if (error) {
                            output.push({
                                rep_code: util_helper.rep_code(-1, error),
                                result: {}
                            });
                            callback(null, output[0]);
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(data);
                        }
                    })

                },

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
    
    agreement: function(req, res, next) {
        // 데이터베이스 접속 객체를 참조할 변수
        var dbcon = null;
        // 검색어 파라미터를 저장할 변수
        // 콜백함수의 중첩을 배열의 병렬로 구성하여 순차적으로 실행한다.
        async.waterfall(
            // 순차적으로 수행되어야 하는 절차들 
            [
                /** step-1: 접속할 html 파일 읽기 */
                function(callback) {  
                    var output = [];
                    
                    // 개발환경이면 story_map_dev.html 로 메인페이지 연결
                    // 라이브 환경이면 story_map.html 로 메인페이지 연결
                    fs.readFile('./www/agreement.html', function(error, data) {
                        if (error) {
                            output.push({
                                rep_code: util_helper.rep_code(-1, error),
                                result: {}
                            });
                            callback(null, output[0]);
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(data);
                        }
                    })

                },

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