/*----------------------------------------------------------
 | 1) 모듈참조
 -----------------------------------------------------------*/
var config = require('./helper/_config.js');
// var log_helper_normal = require('./helper/log_helper_normal.js');
var web_helper = require('./helper/web_helper.js');
var routes = require('./routes.js');
// npm install express --saveUninitialized
var express = require('express');
// node 내장 모듈
var url = require('url');
// npm install express-useragent --save
var useragent = require('express-useragent');
// node 내장 모듈
var path = require('path');
// npm install serve-static --save
var static = require('serve-static');
// npm install serve-favicon --save
var favicon = require('serve-favicon');
// npm install body-parser --save
var bodyParser = require('body-parser');
// npm install method-override --save
var methodOverride = require('method-override');
var fileUpload = require('express-fileupload');
var fs = require('fs');
//https 인증 정보
var options = {
    // ca: fs.readFileSync(''),
    // key: fs.readFileSync('private.pem'),
    // cert: fs.readFileSync('naranggo_com.crt'),
    //pfx: fs.readFileSync('_wildcard_naranggo_com.pfx'),
    //passphrase: '56862'
}

//http2 전송방식 사용.
var spdy = require('spdy');
// redis example

// var redis = require('redis');

// var redisClient = redis.createClient();
// npm install express-session --save
var expressSession = require('express-session');
var expressMysqlSession = require('express-mysql-session')(expressSession);

// var RedisStore = require('connect-redis')(expressSession);
 
//현재 라이브용 후에 테스트용으로 교체(인증토큰 발급 서버)
// var client = redis.createClient(6379,'rm-clustertest-002.qgzpzm.0001.apn2.cache.amazonaws.com', {no_ready_check: true});
//현재 테스트용 후에 라이브용으로 교체(인증토큰 발급 서버)
// var client = redis.createClient(6379, config.redisAccesstokenServerTest, {no_ready_check: true});
//로컬피씨용 인증서버 발급서버 
// var client = redis.createClient(6379, config.redisIP, {no_ready_check: true});
// var client = redis.createClient(6379,'35.221.109.164', {no_ready_check: true});
// var client = redis.createClient(6379,'192.168.3.132', {no_ready_check: true});

//현재 테스트용 후에 라이브용으로 교체(번역 캐싱 서버)
// var client_transe = redis.createClient(6381,'nrg-translate-001.qgzpzm.0001.apn2.cache.amazonaws.com', {no_ready_check: true});
// var client_transe = redis.createClient(6381,'127.0.0.1', {no_ready_check: true});
// var client_transe = redis.createClient(6381,'35.221.109.164', {no_ready_check: true});
// var client_transe = redis.createClient(6381,'192.168.3.132', {no_ready_check: true});
//테스트용 (번역 캐싱 서버)
// var client_transe = redis.createClient(6381, config.redisTranslateServerTest, {no_ready_check: true});
// fs.readFile('naranggo_com.crt', function(err, data) {
   
//    console.log(data.toString('utf-8'))
// })

// fs.readFile('naranggo_com.crt', function(err, data) {
   
//    console.log(data.toString('utf-8'))
// })

/*----------------------------------------------------------
    | 2) Express 객체 생성
    -----------------------------------------------------------*/
var app = express(); 
app.use(fileUpload());

/*
 * 개발할 때 debug 하기 위한 webpack dev middleware를 설정합니다.
 * dev용 config를 따로 만들지 않고, 기존 config(webpack.config) 파일에 devtool option만 추가하여 사용합니다.
 */
if (process.env.NODE_ENV == 'development') {
    var webpack = require('webpack');
    var webpackDevMiddleware = require('webpack-dev-middleware');

    var webpack_config = require('./webpack.config');

    webpack_config[0].devtool = 'inline-source-map'; // debug를 위해 reactjs용 코드와 매핑해주는 옵션
    webpack_config[0].output.publicPath = '/dist/';

    var compiler = webpack(webpack_config);

    app.use(webpackDevMiddleware(compiler, {
        publicPath: '/dist/'
    }));
}

/*----------------------------------------------------------
    | 3) 클라이언트의 접속이 발생한 경우 호출됨.
    -----------------------------------------------------------*/
/** UserAgent 모듈 탑재 */
//  --> 미들웨어의 콜백함수에 전달되는 req, res객체를 확장하기 때문에
//      다른 모듈들보다 먼저 설정되어야 한다.
app.use(useragent.express());
 
var maxAge =  60 * 60 * 24 * 30;
    
app.use(function(req, res, next) {
    //req.cache = client;  //redis cache 객체 생성
    //번역용 redis
    // req.cache1 = client_transe;  //redis cache 객체 생성

    //story_map.html 파일을 제외한 파일들만 캐시를 적용한다.
    //path 가 '/' 인게 story_map.html 을 호출하는 API 의 주소이다 (basehtml.js 파일 참고)
    if (req.path != '/')
    {
        res.setHeader('Cache-Control', 'public, max-age=' + maxAge);
        // res.setHeader('Cache-Control', 'must-revalidate');
        // res.setHeader('Cache-Control', 'no-cache');\
            
        // res.setHeader('X-Frame-Options', true);
        // res.setHeader('Access-Control-Allow-Origin', '*');
        // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Cache-Control');
        // res.setHeader("X-Frame-Options", "ALLOW-FROM https://www.google.com");
        // res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
        // console.log("클라이언트가 접속했습니다. >> %s", req.originalUrl);
    }

    var ext = req.url.substring(req.url.lastIndexOf('.')+1).toLowerCase();

    var noitems = ['ico','css','js','gif','jpg','png'];
    // favicon에 대한 요청이 아닌 경우만 로그 남기기
    if(noitems.indexOf(ext) < 0) {
        // 클라이언트가 접속한 시간 측정
        var begin = Date.now(); 

        /** (1) 접속 발생시 사용자 정보 남기기 */
        // log_helper.debug("------------ client connection ------------");

        // 클라이언트의 IP주소
        var ip = req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    req.connection.socket.remoteAddress;

        // 클라이언트의 디바이스 정보 기록 (UserAgent 사용)
        // console.log('[client] %s / %s / %s (%s) / %s',
        //                     ip, req.useragent.os, req.useragent.browser,
        //                     req.useragent.version, req.useragent.platform);
        /** (2) 사용자가 접속한 페이지 주소 남기기 */
        // 전송방식과 URL
        var current_url = url.format({
            protocol: req.protocol,     // http://
            host: req.get('host'),      // localhost
            port: req.port,             // :3000
            pathname: req.originalUrl   // /hello_static.html
        });

        // console.log("[http %s] %s, %j", req.method, decodeURIComponent(current_url), req.headers);
        // console.log("[http %s] %s", req.method, decodeURIComponent(current_url));

        /** (3) 접속 종료시 전체 수행시간 남기기 */
        res.on('finish', function() {
            var end = Date.now();   // 접속 종료시간
            var time = end - begin; // 종료시간-시작시간 ==> 실행시간
            // console.log('[runtime] %ds', time/1000);
            // log_helper.debug("---------- client disconnection ------------");
            // log_helper.debug(); // 빈 줄 표시
        });
            
    }

    next(); // URL요청에 맞는 다음 미들웨어로 제어를 넘김
});

/*----------------------------------------------------------
    | 4) Express 객체의 기본 설정
    -----------------------------------------------------------*/
/** POST 파라미터 수신 모듈 설정.
    추가 모듈들 중 UserAgent를 제외하고 가장 먼저 설정해야 함 */
// body-parser를 이용해 application/x-www-form-urlencoded 파싱
// extended: true --> 지속적 사용.
// extended: false --> 한번만 사용.
// app.use(express.limit(100000));
app.use(bodyParser.text({limit:'50mb'}));     // TEXT형식의 파라미터 수신 가능.
app.use(bodyParser.json({limit: '50mb'}));     // JSON형식의 파라미터 수신 가능.
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());     // JSON형식의 파라미터 수신 가능.
// app.use(bodyParser.text());     // TEXT형식의 파라미터 수신 가능.
// app.use(bodyParser.limit('5000mb'));
// 동적 요청에 대한 응답을 보낼 때 etag 생성을 하지 않도록 설정
    
/** HTTP 전송방식 확장 */
app.use(methodOverride('X-HTTP-Method'));          // Microsoft
app.use(methodOverride('X-HTTP-Method-Override')); // Google/GData
app.use(methodOverride('X-Method-Override'));      // IBM
app.use(methodOverride('_method'));                // HTML form

// 생성자 파라미터는 쿠키 암호화 처리에 사용되는 키값
// app.use(cookieParser(config.secure.cookie_encrypt_key));

// // 세션 설정
// app.use(expressSession({
//     store: new RedisStore({
//         client: redisClient,
//         host: 'rm-clustertest.qgzpzm.ng.0001.apn2.cache.amazonaws.com',
//         port: 6379
//     }),
//     secret: '1234',
//     resave: true,
//     saveUninitialized: true,
//     cookie: {
//         path: '/',
//         httpOnly: true,
//         secure: false,
//         maxAge: 1000 * 60* 60 * 24 * 30
//     }
//     // // 암호화 키
//     // secret: config.secure.session_encrypt_key,
//     // // 세션을 쿠키 상태로 노출시킬지 여부
//     // resave: false,
//     // // 세션이 저장되기 전에 uninitialized 상태로 미리 만들어서 저장
//     // saveUninitialized: false,
//     // // db세션 사용.
//     // store: new expressMysqlSession(config.database)
// }));

// app.use(function(req, res, next) {
//     req.cache = redisClient;
// });
app.use(expressSession({
    // 암호화 키
    secret: config.secure.session_encrypt_key,
    // 세션을 쿠키 상태로 노출시킬지 여부
    resave: false,
    // 세션이 저장되기 전에 uninitialized 상태로 미리 만들어서 저장
    saveUninitialized: false,
    // db세션 사용.
    store: new expressMysqlSession(config.database)
}));

/** 업로드 설정 */
// 파일이 저장될 경로를 생성
// file_helper.mkdirs(config.upload.dir);
// 파일이 저장될 경로를 URL에 연결
// app.use(config.upload.path, static(config.upload.dir));

/** WebHelper를 통한 req, res 객체의 기능 확장 */
app.use(web_helper());

/** HTML파일들이 노출될 경로 지정하기 */
// --> "http://<hostname>:<port>/폴더명/파일명" 형식으로 public 폴더의 자원에 접근 가능.
var public_path = path.join(__dirname, './public');
// app.use(static(public_path));
//html 파일 기본경로 설정
app.use(static(config.public_path));
console.log("기본경로");
console.log(config.public_path);


/** favicon 설정 */
// app.use(favicon(public_path + '/favicon.ico'));
// app.use(favicon(config.favicon_path));

/** 라우터 객체 설정 */
var router = express.Router();
// 라우터 객체를 app 객체에 등록 --> 에러핸들러보다 먼저 추가되어야 함.
app.use('/', router);

/*----------------------------------------------------------
    | 5) Express서버에 각 URL별 미들웨어(페이지) 구성
    -----------------------------------------------------------*/
// routes.js 파일에 정의된 항목들에 대한 반복 처리
routes.forEach(function(item, index) {
    /** 참조할 함수 찾기 */
    var controller = require(item.src);         // src값을 사용하여 JS 소스파일 로드하기
    var module_name = item.module.split(".");   // 함수이름의 "."을 기준으로 하여 배열로 분리
    var module = null;                          // 로드해야 할 함수에 대한 참조 변수

    // 분리된 배열의 길이가 1이라면? --> 이름에 "."이 없다면?
    if (module_name.length == 1) {
        // JS소스에서 함수 이름을 사용하여 function참조
        module = controller[item.module];
    } else {
        // 분리된 배열을 사용하여 참조할 함수에 계층적으로 접근
        module = controller[module_name[0]][module_name[1]];
    }
        
    /** 참조할 함수를 routes.js 파일에서 명시한 전송방식에 따라 route 처리 */
    switch (item.method.toLowerCase()) {
        case 'get':
            router.route(item.path).get(module);
            break;
        case 'post':
            router.route(item.path).post(module);
            break;
        case 'put':
            router.route(item.path).put(module);
            break;
        case 'delete':
            router.route(item.path).delete(module);
            break;
        default:
            router.route(item.path).all(module);
            break;
    }
    /** 어떤 기능이 로드되었는지 로그로 기록 */
    console.log('module loaded :: %s >> %s', item.method, item.path);
});

// 서버의 500에러에 대한 응답 처리
app.use(function (err, req, res, next) {
    console.log(err);
    // console.log(next)
    // res.sendException(500, "500 Error", error)
    res.sendError("500 Error", err);
});

// 정의되지 않은 URL인 경우에 대한 응답 처리
app.use("*", function(req, res, next) {
    res.sendNotFound("Can not find URL = " + req.originalUrl + ", information = " + req.useragent.source);
});

/*----------------------------------------------------------
    | 6) 설정한 내용을 기반으로 서버 구동 시작
    -----------------------------------------------------------*/
// 웹 서버를 시작
app.listen(config.server_port, function() {
    console.log("*------------------------------------------------*");
    console.log("|        Watch&Ring Single Server Start " + config.server_port +"       |");
    console.log("*------------------------------------------------*");

    console.log();
});    