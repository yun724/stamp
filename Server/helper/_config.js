/*----------------------------------------------------------
 | /helper/_config.js
 |----------------------------------------------------------
 | 시스템 전체 환경설정 파일
 -----------------------------------------------------------*/

/** (1) 모듈 참조 */
var path = require('path');
var fs = require('fs');
var url = require('url');
// var log_helper_normal = require('./log_helper_normal.js');

function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }

    }
    return '0.0.0.0';
}
var currentIP = getIPAddress();
var serverDomain = ''
var dataBaseIP = '';
var dataBaseName = '';
var dataBaseUser = 'admin';
var dataBasePassWord = 'morph1234';
var redisIP = '';
var serverPort = 443;
var serverPortReplace = '';

switch(currentIP) {
    case '10.4.10.6': //QA 서버
       serverDomain = 'test';
       dataBaseIP = '127.0.0.1';
       dataBaseName = 'database_1';
       redisIP = '10.4.10.6';
	   break;
	case '10.4.10.7': //Live 서버
       serverDomain = 'unimain';
       dataBaseIP = '127.0.0.1';
       dataBaseName = 'database_1database_1';
       redisIP = '10.4.10.7';
	   break;
	default : //내부 개발 서버
	   serverDomain = 'unimain-dev-yoon';
       dataBaseIP = '127.0.0.1';
       dataBaseName = 'database_1';
       redisIP = '35.200.76.226';
       serverPort = 4430;
       serverPortReplace = ':' + serverPort;
       break;
}

dataBaseIP = '127.0.0.1';
dataBaseName = 'testDB';

console.log("현재아이피");
console.log(currentIP);
console.log("현재포트");
console.log(serverPort);
console.log(__dirname);

/** (2) 환경설정 정보 */
var config = {
    /*현재 IP*/
    // currentIP: currentIP,
    currentIP: "127.0.0.1",

    redisIP: redisIP,
    /** 로그파일 저장 경로 및 출력 레벨*/
    log: {
        debug: {
            path: path.join(__dirname, '../_files/_logs'),
            level: 'sql'
        },
        error: {
            path: path.join(__dirname, '../_files/_errorlogs'),
            level: 'error'
        }
    },

    /** 웹 기본 메인 서버 포트번호 */
    server_port: serverPort,
    
    AdminAccesskey: 'naranggo!@fighting',
    //현재 서버 url 이름
    nowUrlName: serverDomain,
    homeUrl: 'https://' + serverDomain + '.naranggo.com' + serverPortReplace + '/',

    // /** public 디렉토리 경로 */
    public_path: path.join(__dirname, '../www'),

    // * favicon 경로 
    // favicon_path: path.join(__dirname, '../www/favicon.png'),

    /** 쿠키 저장시 사용할 도메인 */
    // 1) localhost인 경우 공백으로 설정
    // 2) 도메인이 itpaper.co.kr 인 경우 앞에 점을 붙여서 명시 --> ".itpaper.co.kr"
    cookie_domain: '',

    /** 보안키 (암호화 키) */
    secure: {
        cookie_encrypt_key: '1234567890',
        session_encrypt_key: '0987654321'
    },

    /** 메일 발송 정보 */
    sendmail_info: {
        service: 'Gmail',
        auth: {
            user: '',
            pass: ''
        }
    },
    server_local: {
        dir: path.join(__dirname, '../')
    },
    /** 업로드 경로 */
    upload: {
        path: '/upload',
        dir: path.join(__dirname, '../_files/upload'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** voice 파일 업로드 경로 */
    voice: {
        path: '/voice',
        dir: path.join(__dirname, '../voice/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 업로드 경로 */
    uploads: {
        path: '/upload',
        dir: path.join(__dirname, '../uploads/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 업로드 경로 */
    thumbnails: {
        path: '/thumbnails',
        dir: path.join(__dirname, '../thumbnails/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 업로드 경로 */
    thumbnails50: {
        path: '/thumbnails50',
        dir: path.join(__dirname, '../thumbnails50/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 업로드 경로 */
    profiles: {
        path: '/profiles',
        dir: path.join(__dirname, '../profiles/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    profiles_thumbnails: {
        path: '/profiles_thumbnails',
        dir: path.join(__dirname, '../profiles_thumbnails/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 업로드 경로 */
    avatars: {
        path: '/avatars',
        dir: path.join(__dirname, '../avatars/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    avatars_thumbnails: {
        path: '/avatars_thumbnails',
        dir: path.join(__dirname, '../avatars_thumbnails/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    markers: {
        path: '/markers',
        dir: path.join(__dirname, '../markers/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    markers_thumbnails: {
        path: '/markers_thumbnails',
        dir: path.join(__dirname, '../markers_thumbnails/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 업로드 경로 */
    items: {
        path: '/items',
        dir: path.join(__dirname, '../items/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 업로드 경로 */
    items_thumbnails: {
        path: '/items_thumbnails',
        dir: path.join(__dirname, '../items_thumbnails/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 업로드 경로 */
    items_thumbnails50: {
        path: '/items_thumbnails50',
        dir: path.join(__dirname, '../items_thumbnails50/'),
        max_size: 1024 * 1024 * 20,
        max_count: 10
    },

    /** 썸네일 이미지 생성 경로 */
    // thumbnail_path: path.join(__dirname, '../_files/thumbnails'),
    /** 데이터베이스 접속 정보 */
    database: {
        //서버 내장 DB 
        host: dataBaseIP, // MYSQL 서버 주소 (테스트 서버 GCP IP)
        port: 3306, // MySQL 설치시 기본값 3306
        user: dataBaseUser, // 접근 권한 아이디 (root=관리자)
        password: dataBasePassWord, // 설치시 입력한 비밀번호
        database: dataBaseName, // 사용할 데이터베이스 이름
        connectionLimit: 100, // 최대 커넥션 수
        connectTimeout: 2000, // 커넥션 타임아웃
        canRetry: true, // 재접속 가능 여부
        waitForConnections: true, // 커넥션 풀이 다 찬 경우 처리
        charset: "utf8mb4"
    }
}

module.exports = config;