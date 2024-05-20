/**
 * 라우팅 정보를 설정한다.
 * @path 	: URL 경로
 * @method 	: 데이터 전송 방식 (get,post,put,delete,all)
 * @src 	: 라우터에 연결될 함수가 정의된 소스파일 경로
 * @module 	: 라우터에 연결될 함수의 이름
 */
module.exports = [
    
	//-------------------PAGE-----------------
    {path: '/', method:'get', src:'./controllers/page.js', module:'page.main'},
    {path: '/stamp', method:'get', src:'./controllers/page.js', module:'page.stamp'},
    {path: '/agreement', method:'get', src:'./controllers/page.js', module:'page.agreement'},
    //-------------------manage.js-----------------
    {path:'/getDatabaseInfo', method:'post', src:'./controllers/manage.js', module:'manage.getDatabaseInfo'},
    {path:'/setDatabaseInfo', method:'post', src:'./controllers/manage.js', module:'manage.setDatabaseInfo'},
    
];


