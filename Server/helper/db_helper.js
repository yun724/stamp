/*----------------------------------------------------------
 | /helper/db_helper.js
 |----------------------------------------------------------
 |  데이터베이스 커넥션 풀 생성 모듈
 -----------------------------------------------------------*/
var config = require('./_config.js'); // 설정정보
// var log_helper = require('./log_helper.js'); // 로그 모듈
// var log_helper_normal = require('./log_helper_normal.js'); // 로그 모듈
var SqlString = require('mysql/lib/protocol/SqlString');
var mysql = require('mysql'); // 데이터베이스 모듈

config.database.queryFormat = function(sql, values, timeZone) {
   sql = SqlString.format(sql, values, false, timeZone);
   sql = sql.replace(/'NOW\(\)'/g, 'NOW()');
   return sql;
};

/** (1) 데이터베이스 커넥션 풀 생성 (설정정보 활용) */
pool = mysql.createPool(config.database);

/** (2) pool 객체가 지원하는 이벤트 정의 */
pool.on('connection', function(connection) {
    // log_helper.sql('[threadId=%d] DATABASE 접속됨', connection.threadId);
});

pool.on('acquire', function(connection) {
    // log_helper_normal.sql('[threadId=%d] Connection 임대됨', connection.threadId);
});

pool.on('enqueue', function() {
    // log_helper.sql('접속이 진행중이거나 모두 임대되어 반납을 기다리는 중...');
});

pool.on('release', function(connection) {
    // log_helper_normal.sql('[threadId=%d] Connection 반납됨 ', connection.threadId);
});

// 프로그램 종료시 발생되는 이벤트
process.on('exit', function() {
    pool.end();     // pool의 데이터베이스 접속 해제
    // log_helper.sql(" >> 모든 DATABASE 접속이 해제됨");
});

/** (3) 생성자 */
var DBHelper = function() {
    /** 임대한 데이터베이스 접속객체가 참조될 변수 */
    this.dbcon = false;
};

/** (4) 메서드 정의 */
DBHelper.prototype = {
    /**
     * 데이터베이스 커넥션 풀을 하나 임대하여 내부적으로 보관한다.
     * @param  {function} callback 처리 성공시 호출될 콜백함수.
     */
    open: function(callback) {
        // 접속중이지 않은 경우만 수행한다.
        if (this.dbcon === false) {
            // pool.getConnection()함수의 콜백 안에서 이 객체를 인식시키기 위한 참조
            var current = this; // <-- DBHelper 객체

            pool.getConnection(function(err, dbcon) {
                // 접속 에러가 발생한 경우
                if (err) {
                    if (dbcon) { dbcon.release(); }
                    // console.log("MySQL Connection Error - %s", err.message);
                    throw err;
                }

                // 미리 준비한 참조객체의 dbcon에 임대한 접속객체를 참조시킨다.
                current.dbcon = dbcon;

                // 성공 콜백이 전달되었다면 호출한다.
                if (callback != undefined) {
                    callback();
                }
            });
        }
    },

    /** 데이터베이스 접속을 해제한다. */
    close: function() {
        if (this.dbcon !== false) {
            this.dbcon.release();
            this.dbcon = false;
        }
    },

    /**
     * SQL문을 실행한다.
     * @param  {String}   sql     실행할 SQL문
     * @param  {Array}    data    sql문의 ?를 치환값에 대한 배열.
     * @param  {function} callback 콜백함수.
     */
    query: function(sql, data, callback) {
        // 임대중인 접속 객체가 없는 경우.
        if (this.dbcon === false) {
            // console.log('[empty pool] no connection..');
            if (callback != undefined) {
                var error = { threadId: 0, errno: 0, message: "연결된 커넥션이 없습니다.", query: sql };
                callback(error, undefined);
            }
            return false;
        }

        // 임대중인 접속 객체의 고유번호
        var threadId = this.dbcon.threadId;
        // SQL을 실행한다 --> q는 sql과 data의 조합결과를 저장하는 객체
        var q = this.dbcon.query(sql, data, function(err, result) {
            // 수행하려는 SQL문을 기록한다.
            // console.log("[threadId=%s] %s", threadId, q.sql);
            // console.log(q)

            // 에러가 존재한다면?
            if (err) {
                console.log('[threadId=%s] Error%s: %s', threadId, err.errno, err.message);
                
                // 콜백함수에게 에러 정보를 전달한다.
                if (callback != undefined) {
                    var error = { threadId: threadId, errno: err.errno, message: err.message, sql: q.sql };
                    callback(error, undefined);
                }

                // 처리 중단
                return false;
            }

            // 처리 결과가 있다면?
            if (result) {
                // SQL의 앞 6글자 추출 --> select, insert, update, delete 중 하나가 됨.
                var query_type = q.sql.substring(0, 6).toLowerCase();

                // SQL문의 종류에 따라서 로그를 각자 다르게 기록함
                if (query_type == 'select') {   // SELECT문인 경우
                    // log_helper.sql('row count: %d', result.length);
                } else { // INSERT,UPDATE,DELETE문인 경우
                    // log_helper.sql('affectedRows: %d', result.affectedRows);
                    if (result.insertId) { // ==> only INSERT
                        // log_helper.sql('insertId: %d', result.insertId);
                    }
                }

                // 콜백함수에게 수행 결과를 전달함
                if (callback != undefined) { callback(undefined, result); }
            }
        });
    }
};

/** (5) 모듈 등록 처리 */
module.exports = function(callback) {
    // db_helper의 객체를 생성한다.
    var db_helper = new DBHelper();
    // 생성된 객체를 통해서 접속객체를 임대하고 결과를 전달받은 콜백함수로 넘긴다.
    db_helper.open(function() {
        callback(db_helper);    
    });
};


