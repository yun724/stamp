/*----------------------------------------------------------
 | /helper/web_helper.js
 |----------------------------------------------------------
 | Express 모듈이 갖는 req, res 객체의 기능을 확장하기 위한 모듈
 -----------------------------------------------------------*/

var config = require('./_config.js');
// var log_helper = require('./log_helper.js');
var path = require('path');
// npm install multer --save
var multer = require('multer');

module.exports = function() {
    return function(req, res, next) {
        /** get,post,put,delete 파라미터를 수신하여 값을 리턴하는 함수.
            값이 존재하지 않을 경우 def의 값을 대신 리턴한다. */
        req.get_param = function(method, key, def) {
            // 기본값이 없다면 null로 강제 설정
            if (def == undefined) { def = null; }
            // console.log(method)
            // console.log(key)
            // console.log(def)

            // 파라미터를 HTTP 전송방식에 따라 받기
            var result = null;
            if (method.toUpperCase() == 'GET') { // GET방식이나 URL파라미터 받기
                result = this.query[key] || this.params[key];
            } else {    // POST,PUT,DELETE 파라미터 받기
                // console.log(result);
                // console.log("body:"+this.body)
                result = this.body[key];
            }

            // 파라미터 값이 존재한다면?
            if (result !== undefined) {
                if(!Array.isArray(result)) {
                    if (result.length < 1) {
                        result = def; // 리턴할 변수에 파라미터 값 저장
                    }
                }
            } else {

                result = def;
            }

            // log_helper.debug('[HTTP %s PARAMS] %s=%s', method, key, result);
            return result;
        };

        /** get 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.get = function(key, def) {
            return this.get_param('GET', key, def);
        };

        /** post 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.post = function(key, def) {
            return this.get_param('POST', key, def);
        };

        /** put 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.put = function(key, def) {
            return this.get_param('PUT', key, def);
        };

        /** delete 파라미터 수신 함수 --> _get_param 함수를 호출한다. */
        req.delete = function(key, def) {
            return this.get_param('DELETE', key, def);
        };

        /** 응답 결과를 JSON으로 보내기 위한 함수. */
        res.sendAccessdenied = function(data) {
            var json = {
                status: 200,
                server_message: 'OK',
                code: -7
            }

            if (data != undefined) {
                for (var attrname in data) {
                    json[attrname] = data[attrname];
                }
            }

            // log_helper.debug('[STATUS %d] %s', json.status, json.result);
            this.status(json.status).send(json);
        };

        /** 응답 결과를 JSON으로 보내기 위한 함수. */
        res.sendJson = function(data) {
            var json = {
                status: 200,
                server_message: 'OK'
            }

            if (data != undefined) {
                for (var attrname in data) {
                    json[attrname] = data[attrname];
                }
            }
            // log_helper.debug('[STATUS %d] %s', json.status, json.result);
            // console.log('[STATUS %d] %s', json.status, json.result)
            this.status(json.status).send(json);
        };

        /** 서버의 예외상황을 브라우저에게 JSON으로 전달하기 위한 함수 */
        res.sendException = function(status, message, error) {
            var server_message = null;

            switch (status) {
                case 400: server_message = 'Bad Request';    break; 
                case 404: server_message = "Page Not Found"; break;
                case 500: server_message = "Server Error";   break;
            }

            var json = { 
                status: status, 
                server_message: server_message, 
                rep_code: {
                    code: -6, 
                    message: message
                },
                result: {} 
            };
            console.log('[STATUS %d-%s] %s', json.status, json.server_message, json.rep_code.message);
 
            if (error != undefined) {
                json.error = error.message;
                console.log(error);
            }

            this.status(json.status).send(json);
        };

        /** 잘못된 요청에 대한 결과를 응답한다. */
        res.sendBadRequest = function(message) {
            res.sendException(400, message);
        };

        /** 페이지를 찾을 수 없음을 응답한다. */
        res.sendNotFound = function(message) {
            res.sendException(404, message);
        };

        /** 서버의 런타임에러 정보를 응답한다. */
        res.sendError = function(message) {
            res.sendException(500, message);
        };

        /** req객체에 업로드 기능을 추가한다. */
        req.multipart = multer({
            // 스토리지 설정
            storage: multer.diskStorage({
                // 업로드 될 파일이 저장될 폴더를 콜백함수에 전달한다.
                destination: function(req, file, callback) {
                    callback(null, config.upload.dir);
                },
                // 업로드 된 파일이 저장될 파일이름 규칙을 설정하여 콜백에 전달한다.
                filename: function(req, file, callback) {
                    // 업로드 된 파일의 정보를 로그로 기록
                    // log_helper.debug("%j", file);
                    // 원본 파일 이름
                    var fileName = file.originalname;
                    // 파일의 확장자만 추출
                    var extName = fileName.substring(fileName.lastIndexOf('.'));
                    // 현재시각으로 파일이름 재생성
                    var saveName = Date.now().toString() + extName.toLowerCase();
                    // 업로드 정보에 온라인상의 파일 URL을 추가한다.
                    file.webpath = path.join(config.upload.path, saveName).replace(/\\/gi, "/");
                    // 저장된 파일이름을 콜백함수에게 전달
                    callback(null, saveName);
                }
            }),
            limits: { // 업로드 제약
                files: config.upload.max_count,
                fileSize: config.upload.max_size
            }
        });

        next();
    };
}
