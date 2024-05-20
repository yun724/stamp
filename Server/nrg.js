/*----------------------------------------------------------
 | /app.js
 |----------------------------------------------------------
 | 클러스터가 적용된 프로그램 메인
 -----------------------------------------------------------*/

// var log_helper_normal = require('./helper/log_helper_normal.js');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log("*------------------------------------------------*");
    console.log("|                NarangGo Main Server Start                 |");
    console.log("|              Process count :::: " + numCPUs + "              |");
    console.log("*------------------------------------------------*");

    // require("./alertmessage.js");
    // 클러스터 워커 프로세스 포크
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('online', function (worker) {
        console.log('worker ' + worker.process.pid + ' running');
    });
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
        // if (code == 200) {
        //종료 코드가 200인 경우, 워커 재생성
        cluster.fork();
    });
} else { 
    require('./server.js');
}