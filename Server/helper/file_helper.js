var fs = require('fs');		// FileSystem 모듈
var path = require('path');	// 경로문자열 제어 모듈
var config_ = require('./_config.js');
const { exec } = require('child_process');

const xml2js = require('xml2js');
const archiver = require('archiver');
const ExcelJS = require('exceljs');
const ftp = require('basic-ftp');
const axios = require('axios');



// var AWS = require('aws-sdk');
// var albumBucketName = 'createex01';
// var bucketRegion = 'ap-northeast-2';
// var IdentityPoolId = '23c71dcf7914a8e87f7dc07d0ba36158ede6e95ea63a312c4c4785fa05794860';
// Load the SDK for JavaScript
// Load credentials and set region from JSON file
// AWS.config.loadFromPath('./helper/config.json');

// AWS.config.update({
//   region: bucketRegion,
//   credentials: new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: IdentityPoolId
//   })
// });

// var s3 = new AWS.S3({
//   apiVersion: '2006-03-01',
//   params: {Bucket: albumBucketName}
// });

/**
 * 디렉토리를 순환적으로 생성한다.
 * @param  {String} target     생성할 경로 문자열
 * @param  {int} 	permission 부여할 퍼미션
 * @return {void}   
 */
module.exports.mkdirs = function (target, permission) {
	// 경로가 없다면 수행하지 않는다.
	if (target == undefined || target == null) { return; }
	// 권한값이 없다면 기본값을 부여한다.
	if (permission == undefined) { permission = "0755"; }

	target = target.replace(/\\/gi, "/");	// 윈도우의 경우 '\'를 '/'로 변환.

	var target_list = target.split('/');	// 주어진 경로값을 '/'단위로 자른다.
	var dir = '';							// 한 단계씩 경로를 누적할 변수

	// 주어진 경로가 절대경로 형식이라면 경로를 누적할 변수를 "/"부터 시작한다.
	if (target.substring(0, 1) == "/") { dir = "/"; }
	// 하드디스크 문자열에는 "/"를 추가해 준다. (for windows)
	if (target_list[0].indexOf(":") > -1) { target_list[0] += "/"; }

	// 잘라낸 단계만큼 반복한다.
	for (var i = 0; i < target_list.length; i++) {
		// 현재폴더를 의미한다면 증감식으로 이동
		if (target_list[i] == ".") { continue; }

		// 잘라낸 경로값을 덧붙임
		dir = path.join(dir, target_list[i]);

		// 폴더가 없다면 생성한다.
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			fs.chmodSync(dir, "0755");
			//console.log(dir + "의 폴더가 생성되었습니다.");
		} //else {
		//console.log(dir + "(이)가 이미 존재합니다.")
		//}
	}
};

//저장되어 있는 파일을 삭제
//서버상에 저장된 파일의 path  
//ex)/upload/helloworld.png
module.exports.remove_file = function (res, target, file_path) {

	//전달된 경로값이 없다면 중단한다.
	if (file_path == undefined || file_path == null) {
		var output = [];
		output.push({
			code: -1,
			filepath: 0,
			msg: 'no filepath'
		});
		res.send(output[0]);
	} else {
		var real_path;

		if (target == 'uploads') {
			real_path = config_.uploads.dir + file_path;
		} else if (target == 'profiles') {
			real_path = config_.profiles.dir + file_path;
		} else if (target == 'thumbnails') {
			real_path = config_.thumbnails.dir + file_path;
		} else if (target == 'avatars') {
			real_path = config_.avatars.dir + file_path;
		}
		// console.log("삭제할 파일>>" + real_path);

		if (fs.existsSync(real_path)) {
			fs.unlinkSync(real_path);
			//console.log("삭제완료>>" + real_path);
			var output = [];
			output.push({
				code: 1,
				filepath: real_path,
				msg: 'delete success'
			});
			res.send(output[0]);
		} else {
			var output = [];
			output.push({
				code: 0,
				filepath: real_path,
				msg: 'filepath doesnt exist'
			});
			res.send(output[0]);
		}

	}

	//파일경로에서 path값을 dir로 변경
	// /upload/helloworld.png 에서 "/upload"를 "C:/mynode/_files/upload"로 변경
};

module.exports.scanFolder = function (folderPath, folderName = "") {
	// 폴더 내의 파일 목록 가져오기
	try {
		const files = fs.readdirSync(folderPath);

		const folderObject = {
			name: path.basename(folderPath),
			path: folderPath,
			files: []
		};

		files.forEach((file) => {
			const filePath = path.join(folderPath, file);
			const fileStats = fs.statSync(filePath);

			if (fileStats.isFile()) {
				if(file.includes(".fla") || file.includes(".xfl")) {
					// 파일인 경우, 파일 정보를 JSON 배열에 추가
					folderObject.files.push({
						name: file,
						isFile: true,
						path: filePath,
						//   size: fileStats.size,
						//   modified: fileStats.mtime,
					});
				}
				
			} else if (fileStats.isDirectory()) {
				
				// 폴더인 경우, 재귀적으로 폴더 탐색하여 하위 폴더의 파일들을 계층적으로 처리
				const subFolderPath = path.join(folderPath, file);
				const subFiles = this.scanFolder(subFolderPath);
				folderObject.files.push({
					name: file,
					isFile: false,
					path: subFolderPath,
					files: subFiles,
				});		
				
			}
		});

		return folderObject;
	} catch (error) {
		console.error('Error occurred while reading folder:', error);
		return -1;
	}
};

module.exports.deleteRecoverFolder = function (folderPath, folderName = "") {
	try {
		const files = fs.readdirSync(folderPath);

		const folderObject = {
			name: path.basename(folderPath),
			path: folderPath,
			files: []
		};

		files.forEach((file) => {
			const filePath = path.join(folderPath, file);
			const fileStats = fs.statSync(filePath);

			if (fileStats.isFile()) {
				// 파일인 경우, 파일 정보를 JSON 배열에 추가
				if (
					(file.includes('복구') || file.includes('RECOVER')) &&
					(file.endsWith('.fla') || file.endsWith('.xfl'))
				) {
					fs.unlinkSync(filePath);
				} else {
					if(file.includes(".fla") || file.includes(".xfl")) {
						folderObject.files.push({
							name: file,
							isFile: true,
							path: filePath
						});
					}
				}
			} else if (fileStats.isDirectory()) {
				// 폴더인 경우, 재귀적으로 폴더 탐색하여 하위 폴더의 파일들을 계층적으로 처리
				const subFolderPath = path.join(folderPath, file);
				const subFiles = this.deleteRecoverFolder(subFolderPath);
				if (subFiles == -1) {
					folderObject = -1;
				} else {
					folderObject.files.push({
						name: file,
						isFile: false,
						path: subFolderPath,
						files: subFiles
					});
	
					if (file.includes('복구') || file.includes('RECOVER')) {
						fs.rmdirSync(subFolderPath, { recursive: true });
					}
				}

				
			}
		});
		
		return folderObject;
	} catch (error) {
		
		console.error('Error occurred while reading folder:', error);
		return -1;
	}
};

//나스 업로드
module.exports.uploadNas = function (rootFolderPath, filePath, nasFolderPath, func) {
	const fileOriginName = path.basename(filePath); // 파일명 추출
	const folderName = path.parse(fileOriginName).name; // 확장자를 제외한 파일명 추출
	const targetFolderPath = path.join(nasFolderPath, folderName); // 복사 대상 폴더 경로

	if (rootFolderPath == -1) {
		func(false, folderName + ": 빌드파일(html, js 가 있는 폴더를 찾을 수 없음)");
		return;
	} 

	// folderName 폴더가 이미 존재하는 경우, 내부의 모든 파일 및 폴더를 삭제
	if (fs.existsSync(targetFolderPath)) {
		deleteFolderRecursive(targetFolderPath);
		console.log(`Deleted existing folder: ${targetFolderPath}`);
	}

	// targetFolderPath 폴더 생성
	fs.mkdirSync(targetFolderPath);
	console.log(`Created folder: ${targetFolderPath}`);

	// rootFolderPath 안에 있는 모든 폴더 및 파일 복사하여 targetFolderPath로 붙여넣기
	copyFolderRecursive(rootFolderPath, targetFolderPath);

	console.log('File and folder copy completed');

	// rootFolderPath의 첫 번째 레벨 내부에 있는 HTML 파일 찾기
	const filesInRoot = fs.readdirSync(rootFolderPath);
	const htmlFiles = filesInRoot.filter((file) =>
		fs.statSync(path.join(rootFolderPath, file)).isFile() &&
		path.extname(file).toLowerCase() === '.html'
	);

	if (htmlFiles.length > 0) {
		console.log('HTML files in root folder:');
		for (const htmlFile of htmlFiles) {
			console.log(htmlFile);
			// 추가 기능 수행 (func 인자로 전달된 함수 호출 등)
			if (typeof func === 'function') {
				func(true, folderName + "/" + htmlFile);
			}
			return;
		}
	}
}

// 재귀적으로 폴더 및 파일 복사
function copyFolderRecursive(source, target) {
	if (!fs.existsSync(target)) {
		fs.mkdirSync(target);
	}

	const files = fs.readdirSync(source);

	for (const file of files) {
		const sourcePath = path.join(source, file);
		const targetPath = path.join(target, file);
		if (file.includes('복구') || file.includes('RECOVER')) {

		} else {
			if (fs.lstatSync(sourcePath).isDirectory()) {
				copyFolderRecursive(sourcePath, targetPath);
			} else {
				fs.copyFileSync(sourcePath, targetPath);
			}	
		}
		
	}
}

// 재귀적으로 폴더 및 파일 삭제
function deleteFolderRecursive(folderPath) {
	if (fs.existsSync(folderPath)) {
		const files = fs.readdirSync(folderPath);

		for (const file of files) {
			const filePath = path.join(folderPath, file);

			if (fs.lstatSync(filePath).isDirectory()) {
				deleteFolderRecursive(filePath);
			} else {
				fs.unlinkSync(filePath);
			}
		}

		fs.rmdirSync(folderPath);
	}
}

//파일 압축
module.exports.zipFolder = function (folderPath, filePath, zipFolderPath, func) {
	if (folderPath == -1) {
		func(false, "빌드파일(html, js 가 있는 폴더를 찾을 수 없음)");
		return;
	}

	const fileOriginName = path.basename(filePath); // 파일명 추출
	const fileNameWithoutExtension = path.parse(fileOriginName).name; // 확장자를 제외한 파일명 추출
	getStepCodeFromExcel(fileNameWithoutExtension, function (stepCode, age) {
		console.log('스탭코드가져옴');
		console.log(stepCode);
		const existingZipFileName = stepCode + '.zip';
		let outputFilePath = path.join(folderPath, fileNameWithoutExtension + '.zip');
		if (stepCode) {
			outputFilePath = path.join(folderPath, stepCode + '.zip');
		}

		// 기존 압축 파일을 삭제
		deleteExistingZipFiles(folderPath);

		// 기존 압축 파일을 덮어씌우기 위해 'w' 옵션으로 열기
		const output = fs.createWriteStream(outputFilePath, { flags: 'w' });

		const archive = archiver('zip', {
			zlib: { level: 9 } // 압축 레벨 설정
		});

		output.on('close', function () {
			console.log('압축 파일 저장 완료:', outputFilePath);
			// 두 개의 경로에 모두 저장
			saveZipFile(outputFilePath, zipFolderPath, age);

			if (stepCode == null)  {
				func(false, outputFilePath);
			} else {
				func(true, outputFilePath);
			}
			
		});

		archive.on('error', function (err) {
			console.error('압축 파일 저장 중 오류 발생:', err);
			func(false, outputFilePath);
		});

		archive.pipe(output);

		// 폴더 내의 파일 및 폴더를 순회하며 추가
		const files = fs.readdirSync(folderPath);
		files.forEach(function (file) {
			const filePath = path.join(folderPath, file);
			const stats = fs.statSync(filePath);

			if (stats.isFile()) {
				// 파일인 경우 추가
				if (file !== existingZipFileName && path.extname(file) !== '.zip') {
					// 압축 파일과 .zip 확장자를 가진 파일은 제외
					let fileName = file;
					if (path.extname(file).toLowerCase() === '.html') {
						// HTML 파일의 이름을 'index.html'로 변경
						fileName = 'index.html';
					}
					archive.file(filePath, { name: fileName });
				}
			} else if (stats.isDirectory()) {
				// 폴더인 경우 재귀적으로 추가
				archive.directory(filePath, file);
			}
		});

		archive.finalize();
	});
};

// 기존 압축 파일을 삭제하는 함수
function deleteExistingZipFiles(folderPath) {
	const files = fs.readdirSync(folderPath);
	files.forEach(function (file) {
		const filePath = path.join(folderPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isFile() && path.extname(file) === '.zip') {
			fs.unlinkSync(filePath); // 압축 파일 삭제
		}
	});
}

// 기존 압축 파일을 삭제하는 함수
module.exports.deleteFiles = function (folderPath, fileName, func) {
	// 절대 경로로 변환하여 안전하게 처리합니다.
	folderPath = path.resolve(folderPath);

	// 폴더 내부의 파일 목록을 읽어옵니다.
	fs.readdir(folderPath, (err, files) => {
		if (err) {
			return func(false);
		}

		// 삭제할 파일의 절대 경로를 찾습니다.
		const filePathsToDelete = files
			.filter(file => file === fileName)
			.map(file => path.join(folderPath, file));

		// 삭제할 파일이 없으면 콜백 호출 후 종료합니다.
		if (filePathsToDelete.length === 0) {
			return func(false);
		}

		// 파일 삭제를 시작합니다.
		let deletedCount = 0;
		filePathsToDelete.forEach(filePath => {
			fs.unlink(filePath, err => {
				if (err) {
					// 삭제 중 오류가 발생하면 에러를 콜백으로 전달합니다.
					console.log(err);
					return func(false);
				}
				deletedCount++;

				// 모든 파일 삭제가 완료되면 콜백으로 결과를 전달합니다.
				if (deletedCount === filePathsToDelete.length) {
					console.log("삭제성공")
					func(true);
				}
			});
		});
	});
};

//별도의 연령별 그림책탐험대폴더 압축하기
module.exports.zipEbookAgeFolder = function (zipFolderPath, func) {
	// 이제 age 폴더들을 모두 압축합니다.
	var ageList = ["5", "6", "7"];
	var completeCount = 0;
	for (i = 0; i < ageList.length; i++) {
		var age = ageList[i];
		const ageFolder = path.join(zipFolderPath, age + "세_그림책탐험대");
		const ageFolderZipOutputFilePath = path.join(zipFolderPath, age + '세_그림책탐험대.zip');
		const ageFolderZipOutput = fs.createWriteStream(ageFolderZipOutputFilePath, { flags: 'w' });
		const ageFolderZipArchive = archiver('zip', {
			zlib: { level: 9 } // 압축 레벨 설정
		});

		ageFolderZipOutput.on('close', function () {
			console.log('age 폴더 압축 완료:', ageFolderZipOutputFilePath);
			completeCount += 1;
			if (completeCount == 2) {
				func(true);
			}
		});

		ageFolderZipArchive.on('error', function (err) {
			console.error('age 폴더 압축 중 오류 발생:', err);
			func(false);
		});

		ageFolderZipArchive.pipe(ageFolderZipOutput);

		// age 폴더 압축에 추가할 파일들을 추가합니다.
		ageFolderZipArchive.directory(ageFolder, false);

		ageFolderZipArchive.finalize();
	}
	
};

//그림책탐험대용 압축파일 만들기
module.exports.zipEbookFolder = function (folderPath, filePath, zipFolderPath, jsonFileName, func) {
	if (folderPath == -1) {
		func(-1, "빌드파일(html, js 가 있는 폴더를 찾을 수 없음)", "");
		return;
	}

	const fileOriginName = path.basename(filePath); // 파일명 추출
	const fileNameWithoutExtension = path.parse(fileOriginName).name; // 확장자를 제외한 파일명 추출

	if (fileNameWithoutExtension.charAt(0).toLowerCase() == "a") {
		getAdditionalModuleNumberFromExcel(fileNameWithoutExtension, function (num, age) {
			console.log('번호 가져옴');
			console.log(num);
			console.log(age);

			ebookStepCodeFromExcel(num, age, fileNameWithoutExtension, zipFolderPath, folderPath, jsonFileName, true, func);
		})

		
		return;
	}
	
	getStepCodeFromExcel(fileNameWithoutExtension, function (stepCode, age) {
		console.log('스탭코드가져옴');
		console.log(stepCode);

		//그림책 탐험대 전용 
		if (stepCode == null) {

		}
		ebookStepCodeFromExcel(stepCode, age, fileNameWithoutExtension, zipFolderPath, folderPath, jsonFileName, false, func);
		
	});
};

function ebookStepCodeFromExcel(code, age, fileNameWithoutExtension, zipFolderPath, folderPath, jsonFileName, isAdditional, func) {
	getEbookStepCodeFromExcel(code, isAdditional, function (eBookStepCode, eBookStepName, eBookStudyCode) {
		console.log("그림책탐험대 스탭코드");
		console.log(age + "세");
		console.log(eBookStepName + ": " + eBookStudyCode + "/" + eBookStepCode);
		var consoleLog = eBookStepName + ": " + eBookStudyCode + "/" + eBookStepCode;

		var stepCode = eBookStepCode;
		var stepName = eBookStepName;

		var existingZipFileName = fileNameWithoutExtension + '.zip';
		let outputFilePath = path.join(zipFolderPath, age + "세_그림책탐험대", fileNameWithoutExtension + '.zip');
		if (eBookStepCode) {
			existingZipFileName = eBookStepCode + '.zip';
			outputFilePath = path.join(zipFolderPath, age + "세_그림책탐험대", eBookStepCode + '.zip');
		} else {
			stepCode = fileNameWithoutExtension;
			stepName = fileNameWithoutExtension;
		}

		// age 폴더 생성
		const ageFolderPath = path.join(zipFolderPath, age + "세_그림책탐험대");
		if (!fs.existsSync(ageFolderPath)) {
			fs.mkdirSync(ageFolderPath);
		}

		//그림책탐험대 로컬테스트용 폴더 생성
		const localTestFolderPath = path.join(zipFolderPath, "그림책탐험대_로컬테스트");
		if (!fs.existsSync(localTestFolderPath)) {
			fs.mkdirSync(localTestFolderPath);
		}

		// 기존 압축 파일을 덮어씌우기 위해 'w' 옵션으로 열기
		const output = fs.createWriteStream(outputFilePath, { flags: 'w' });

		const archive = archiver('zip', {
			zlib: { level: 9 } // 압축 레벨 설정
		});

		output.on('close', function () {
			console.log('압축 파일 저장 완료:', outputFilePath);
			saveZipFileForEbook(outputFilePath, localTestFolderPath, stepCode);

			setBookInfoJson(zipFolderPath, jsonFileName, stepCode, stepName, function (result, addedCount) {
				if (result == 1) {
					console.log("스텝코드저장완료");
				} else if (result == 0) {
					console.log("json파싱 오류////////////////////////////");
					console.log("json파싱 오류////////////////////////////");
					console.log("json파싱 오류////////////////////////////");
					console.log("json파싱 오류////////////////////////////");
				} else {
					console.log("json파싱 실패--------------------------------");
					console.log("json파싱 실패--------------------------------");
					console.log("json파싱 실패--------------------------------");
					console.log("json파싱 실패--------------------------------");
					console.log("json파싱 실패--------------------------------");
				}
				if (eBookStepCode == null) {
					func(-1, outputFilePath, age, consoleLog, addedCount);
				} else {
					func(result, outputFilePath, age, consoleLog, addedCount);
				}
				
			});
			
		});

		archive.on('error', function (err) {
			console.error('압축 파일 저장 중 오류 발생:', err);
			func(-1, outputFilePath, age, "", 0);
		});

		archive.pipe(output);

		// 폴더 내의 파일 및 폴더를 순회하며 추가
		const files = fs.readdirSync(folderPath);
		files.forEach(function (file) {
			const filePath = path.join(folderPath, file);
			const stats = fs.statSync(filePath);

			if (stats.isFile()) {
				// 파일인 경우 추가
				if (file !== existingZipFileName && path.extname(file) !== '.zip') {
					// 압축 파일과 .zip 확장자를 가진 파일은 제외
					let fileName = file;
					if (path.extname(file).toLowerCase() === '.html') {
						// HTML 파일의 이름을 'index.html'로 변경
						fileName = 'contents_index.html';
					}
					archive.file(filePath, { name: fileName });
				}
			} else if (stats.isDirectory()) {
				// 폴더인 경우 재귀적으로 추가
				archive.directory(filePath, file);
			}
		});

		// 새로운 파일 추가
		const indexPath = path.join(config_.public_path, 'index.html');
		archive.file(indexPath, { name: 'index.html' });

		archive.finalize();
	});
}

module.exports.copyFile = function (sourceFilePath, targetFilePath, callback) {
	// 절대 경로로 변환하여 안전하게 처리합니다.
	sourceFilePath = path.resolve(sourceFilePath);
	targetFilePath = path.resolve(targetFilePath);

	// 파일 복사
	fs.copyFile(sourceFilePath, targetFilePath, (err) => {
		if (err) {
			callback(err);
		} else {
			callback(null);
		}
	});
}

function setBookInfoJson(zipFolderPath, filaName, stepCode, stepName, func) {
	const filePath = path.join(zipFolderPath, filaName);
	var tempStepCode = processString(stepCode);
	// 새로 추가할 데이터
	const newStepInfo = {
		"contentPath": "http://file.mbest.gscdn.com/elihigh_kids/nod/dev/NOD_EBOOK/L130000007/S130001468.zip",
		"contentVersion": 0,
		"drmPath": "",
		"iconType": "23",
		"mp4Path": "",
		"stepKey": tempStepCode,
		"stepType": "default",
		"title": stepName,
		"type": "html"
	};

	// 파일을 읽어옵니다.
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading file:', err);
			func(-1);
			return;
		}

		var addedCount = 0;
		try {
			// JSON 데이터 파싱
			const jsonData = JSON.parse(data);
			
			// 원하는 데이터를 추가합니다.
			if (jsonData.studySubjectList && jsonData.studySubjectList.length > 0) {
				jsonData.studySubjectList[0].stepInfos.push(newStepInfo);
				addedCount = jsonData.studySubjectList[0].stepInfos.length;
			} else {
				console.error('Error: Invalid JSON format or missing studySubjectList.');
				func(-1, addedCount);
				return;
			}

			// 수정된 데이터를 파일에 씁니다.
			const updatedData = JSON.stringify(jsonData, null, 2);
			fs.writeFile(filePath, updatedData, 'utf8', (err) => {
				if (err) {
					console.error('Error writing file:', err);
					func(-1, addedCount);
					return;
				}
				console.log('Data added successfully!');
				console.log('여기서비교');
				console.log(addedCount);
				console.log(tempStepCode);
				func(1, addedCount)
			});
		} catch (err) {
			//추가 예외처리 필요
			console.log("중복에러 발생-----------------------------");
			console.log("중복에러 발생-----------------------------");
			console.log("중복에러 발생-----------------------------");
			console.log("중복에러 발생-----------------------------");
			console.log("중복에러 발생-----------------------------");
			console.log("중복에러 발생-----------------------------");
			console.log("중복에러 발생-----------------------------");
			console.log("중복에러 발생-----------------------------");
			console.error('Error parsing JSON:', err);
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) {
					console.error('Error reading file:', err);
					func(-1);
					return;
				}
		
				var addedCount = 0;
				try {
					// JSON 데이터 파싱
					const jsonData = JSON.parse(data);
					
					// 원하는 데이터를 추가합니다.
					if (jsonData.studySubjectList && jsonData.studySubjectList.length > 0) {
						jsonData.studySubjectList[0].stepInfos.push(newStepInfo);
						addedCount = jsonData.studySubjectList[0].stepInfos.length;
					} else {
						console.error('Error: Invalid JSON format or missing studySubjectList.');
						func(-1, addedCount);
						return;
					}
		
					// 수정된 데이터를 파일에 씁니다.
					const updatedData = JSON.stringify(jsonData, null, 2);
					fs.writeFile(filePath, updatedData, 'utf8', (err) => {
						if (err) {
							console.error('Error writing file:', err);
							func(-1, addedCount);
							return;
						}
						console.log('Data added successfully!');
						console.log('여기서비교');
						console.log(addedCount);
						console.log(tempStepCode);
						func(1, addedCount);
					});
				} catch (err) {
					//추가 예외처리 필요
					console.log("중복에러 발생2-----------------------------");
					console.log("중복에러 발생2-----------------------------");
					console.log("중복에러 발생2-----------------------------");
					console.log("중복에러 발생2-----------------------------");
					console.log("중복에러 발생2-----------------------------");
					console.error('Error parsing JSON:', err);
					func(0, addedCount);
				}
			});
		}
	});
}

// 두 개의 경로에 압축 파일 저장하는 함수
function saveZipFile(zipFilePath, targetFolderPath, age) {
	const targetAgeFolderPath = path.join(targetFolderPath, age + "세");

	if (!fs.existsSync(targetAgeFolderPath)) {
		fs.mkdirSync(targetAgeFolderPath);
	}

	const targetFilePath = path.join(targetAgeFolderPath, path.basename(zipFilePath));
	const input = fs.createReadStream(zipFilePath);
	const output = fs.createWriteStream(targetFilePath);

	input.pipe(output);
}

function saveZipFileForEbook(zipFilePath, localTestFolderPath, zipFileName) {

	var tempFileName = processString(zipFileName);

	const targetFilePath = path.join(localTestFolderPath, path.basename(tempFileName + ".zip"));

	const input = fs.createReadStream(zipFilePath);
	const output = fs.createWriteStream(targetFilePath);

	input.pipe(output);
}

//그림책탐험대 테스트용 파일명 추출
function processString(str) {
	if (typeof str !== 'string') {
		return null; // 유효하지 않은 문자열이라면 null 반환
	}

	// s로 시작하는 경우 s를 삭제하고 나머지 문자열을 추출
	if (str.startsWith('S')) {
		str = str.substring(1);
	}

	// 만약 s를 뺀 값이 모두 숫자인 경우 해당 변수를 int 타입으로 변환
	if (/^\d+$/.test(str)) {
		return parseInt(str, 10); // 10진수로 변환하여 반환
	}

	return str;
}

// 기존의 zip 파일명 가져오는 함수
function getExistingZipFileName(folderPath) {
	const files = fs.readdirSync(folderPath);
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const filePath = path.join(folderPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isFile() && path.extname(file) === '.zip') {
			return file;
		}
	}
	return null; // 기존의 zip 파일이 없으면 null 반환
}

module.exports.getRootFolderPath = function (filePath, dataId = null) {
	const currentFolderPath = path.dirname(filePath);
	
	const parentFolderPath = path.dirname(currentFolderPath);
	const grandparentFolderPath = path.dirname(parentFolderPath);
	const grandgrandparentFolderPath = path.dirname(grandparentFolderPath);

	// 현재 폴더와 하위 폴더들에 대해 검사
	const rootFolder = findRootFolder(currentFolderPath, dataId);
	console.log("현재 폴더와 하위 폴더들에 대해 검사");
	console.log(rootFolder);
	if (rootFolder) {
		return rootFolder;
	}
	
	// if (hasNumbersAndUnderscoresOrDashes(path.basename(currentFolderPath))) {
	// 	return -1;
	// }

	// 부모 폴더와 하위 폴더들에 대해 검사
	const parentRootFolder = findRootFolder(parentFolderPath, dataId);
	console.log("부모 폴더와 하위 폴더들에 대해 검사");
	console.log(parentRootFolder);
	if (parentRootFolder) {
		return parentRootFolder;
	}

	// if (hasNumbersAndUnderscoresOrDashes(path.basename(parentFolderPath))) {
	// 	return -1;
	// }

	// 상위 2단계 폴더와 하위 폴더들에 대해 검사
	const grandparentRootFolder = findRootFolder(grandparentFolderPath, dataId);
	console.log("상위 2단계 폴더와 하위 폴더들에 대해 검사");
	console.log(grandparentRootFolder);
	if (grandparentRootFolder) {
		return grandparentRootFolder;
	}

	// if (hasNumbersAndUnderscoresOrDashes(path.basename(grandparentFolderPath))) {
	// 	return -1;
	// }

	// 상위 3단계 폴더와 하위 폴더들에 대해 검사
	const grandgrandparentRootFolder = findRootFolder(grandgrandparentFolderPath, dataId);
	if (grandgrandparentRootFolder) {
		return grandgrandparentRootFolder;
	}

	return -1;
}
function findRootFolder(folderPath, dataId) {
	if (path.basename(folderPath).includes("RECOVER")) {
		return false;
	} 

	if (hasHtmlAndJsFiles(folderPath, dataId)) {
		return folderPath;
	}
	
	const subFolders = getSubFolders(folderPath);
	for (const subFolder of subFolders) {
		
		const subFolderPath = path.join(folderPath, subFolder);
		const rootFolder = findRootFolder(subFolderPath, dataId);
		if (rootFolder) {
			return rootFolder;
		}
	}

	return null;
}

function hasHtmlAndJsFiles(folderPath, dataId) {
	if (path.basename(folderPath) != "bin" || path.basename(folderPath).includes("RECOVER")) {
		return false;
	} 

	console.log("폴더이름이 bin 이고 내부에 html, js 파일이 동시 존재하는 폴더 찾음");
	const files = fs.readdirSync(folderPath);
	var isTrue = false;

	const htmlFileExists = files.some(file => path.extname(file).toLowerCase() === '.html');
	const jsFileExists = files.some(file => path.extname(file).toLowerCase() === '.js');
	const folderExist = files.some(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        return stats.isDirectory() && file.includes(dataId);
    });
	const wrongFolderExist = files.some(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        return stats.isDirectory() && ((file != "css" && file != "js" ) && !file.includes(dataId));
    });
	console.log(folderPath);
	console.log("목차아이디랑 일치하는 폴더가 존재여부: " + folderExist);
	console.log("css폴더가 아니고 다른 빌드 결과물의 폴더 존재여부: " + wrongFolderExist);
	if (folderExist == false) {
		return folderExist
	}

	return htmlFileExists && jsFileExists;
}

function getSubFolders(folderPath) {
	return fs.readdirSync(folderPath, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name);
}

function hasNumbersAndUnderscoresOrDashes(folderName) {
	// 정규식 패턴: 숫자와 '_' 또는 '-'가 하나 이상 포함되는지 검사
	const pattern = /\d+[_-]+\d+/;
  
	return pattern.test(folderName);
  }

async function callPurgeAPI(purgeUrlName) {
	try {
		const purgeUrl = 'https://simul.mbest.co.kr/vod/purge.asp';
		const formData = new URLSearchParams();

		// formData에 필요한 데이터 추가
		formData.append('purge_url', purgeUrlName);
		formData.append('purge_ticket', '');

		// POST 요청 보내기
		const response = await axios.post(purgeUrl, formData, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});

		// 응답 처리
		console.log('캐시퍼지 응답완료:' + purgeUrlName);
		//   console.log('캐시퍼지 응답완료:', response.data);
	} catch (error) {
		console.error('API 호출 중 오류:', error);
	}
}

module.exports.callPurgeAPI = async function (purgeUrl) {
	callPurgeAPI(purgeUrl);
}

async function uploadFilesToFTP(folderPath, isPossiblePurge, ipAdressforPurge, func) {
	const host = 'ftp.mbest.gscdn.com'; // FTP 호스트 이름
	const port = 7777; // FTP 포트 번호
	const user = 'morph'; // FTP 사용자 이름
	const password = 'Dpfflahvm7*'; // FTP 비밀번호
	const localRootFolderPath = folderPath; // 로컬 폴더 경로
	var purgeBaseUrl = "http://file.mbest.gscdn.com/elihigh_kids/morph";
	var purgeUrlList = [];

	const remoteFolderPaths = {
		'5세': '/READING/L040000001',
		'6세': '/READING/L040000014',
		'7세': '/READING/L040000027'
	};

	const purgeFolderPaths = {
		'5세': '/dev/READING/L040000001',
		'6세': '/dev/READING/L040000014',
		'7세': '/dev/READING/L040000027'
	};

	const client = new ftp.Client();
	let totalFiles = 0;
	let uploadedFiles = 0;
	var message = "";

	try {
		await client.access({
			host: host,
			port: port,
			user: user,
			password: password
		});

		// 로컬 루트 폴더 안의 모든 폴더에 대해 반복
		const localFolders = fs.readdirSync(localRootFolderPath);

		for (const localFolder of localFolders) {
			const localFolderPath = path.join(localRootFolderPath, localFolder);

			if (!fs.statSync(localFolderPath).isDirectory()) {
				continue; // 폴더가 아닌 경우 건너뜁니다.
			}

			const remoteFolderPath = remoteFolderPaths[localFolder];
			const purgeFolderPath = purgeFolderPaths[localFolder];

			if (!remoteFolderPath) {
				console.log(`Remote folder path not found for "${localFolder}". Skipping...`);
				continue; // 해당 폴더의 원격 경로가 없는 경우 건너뜁니다.
			}

			await client.ensureDir(remoteFolderPath); // 원격 폴더 생성 (이미 존재하는 경우 무시됨)

			const files = fs.readdirSync(localFolderPath);
			totalFiles += files.length;
			// message += "총 업로드 파일 갯수: " + totalFiles + "개 \n\n"

			for (const file of files) {
				const filePath = path.join(localFolderPath, file);
				const fileStats = fs.statSync(filePath);

				if (fileStats.isFile() && (file.endsWith('.zip') || file.endsWith('.rar'))) {
					await client.uploadFrom(filePath, path.join(remoteFolderPath, file)); // 압축 파일만 업로드
					uploadedFiles++;
					console.log(`File "${file}" uploaded successfully`);
					message += `File "${file}" uploaded successfully \n`

					purgeUrlList.push(purgeBaseUrl + purgeFolderPath + "/" + file);

					// 파일 업로드 후에 로컬 파일 삭제
					fs.unlinkSync(filePath);

					console.log(`Local file "${file}" deleted`);
				} else {
					console.log(`Skipped "${file}" - Only zip or rar files are allowed for upload`);
				}
			}
		}
	} catch (error) {
		console.error('Error occurred during file upload:', error);
	} finally {
		client.close();

		if (uploadedFiles === totalFiles) {
			console.log('All files uploaded successfully');
			if (isPossiblePurge == true || isPossiblePurge == "true") {
				//업로드 후 캐시퍼지 날리기 (업로드 딜레이 경우를 대비해서 1초 후 실행)
				setTimeout(function () {
					for (var i = 0; i < purgeUrlList.length; i++) {
						callPurgeAPI(purgeUrlList[i]);
					}
				}, 1000);
			} else {
				for (var i = 0; i < purgeUrlList.length; i++) {
					callPurgeAPItoOther(ipAdressforPurge, purgeUrlList[i]);
				}
			}

			func(true, "총 업로드 파일 갯수: " + totalFiles + "개 \n" + "업로드 성공한 파일: " + uploadedFiles + "개\n\n" + message);
		} else {
			console.log(`File upload completed. ${uploadedFiles} files uploaded out of ${totalFiles}`);
			func(true, `File upload completed. ${uploadedFiles} files uploaded out of ${totalFiles}`);
		}
	}
}

async function callPurgeAPItoOther(ipAdress, purgeUrlName) {
	try {
		var requestUrl = 'http://192.168.50.109:4430/doPurge';
		if (ipAdress != null && ipAdress != "") {
			requestUrl = 'http://' + ipAdress + ':4430/doPurge';
		}
		const formData = new URLSearchParams();

		// formData에 필요한 데이터 추가
		formData.append('purgeUrl', purgeUrlName);

		// POST 요청 보내기
		const response = await axios.post(requestUrl, formData, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});

		// 응답 처리
		console.log('다른서버로부터 캐시퍼지 요청완료:' + response.data);
		//   console.log('캐시퍼지 응답완료:', response.data);
	} catch (error) {
		console.error('API 호출 중 오류:', error);
	}
}

module.exports.uploadFilesToFTP = async function (folderPath, isPossiblePurge, ipAdressforPurge, func) {
	uploadFilesToFTP(folderPath, isPossiblePurge, ipAdressforPurge, func);
}

//fla 파일 빌드
module.exports.buildAnimate = function (flaFilePath) {
	// Adobe Animate CLI 실행 경로
	const animateCLIPath = 'C:/Program Files/Adobe/Adobe Animate 2020/Animate.exe';

	// 빌드 명령어
	const buildCommand = `"${animateCLIPath}" -publish -export html5 -file "${flaFilePath}"`;

	// 빌드 실행
	exec(buildCommand, (error, stdout, stderr) => {
		if (error) {
			console.error(`빌드 중 오류 발생: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`빌드 중 에러 출력:\n${stderr}`);
			return;
		}
		console.log('빌드가 성공적으로 완료되었습니다.');
	});
};

module.exports.openFile = function (filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf8', (err, data) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(data);
		});
	});
};

module.exports.executeLogic = async function (filePath) {
	try {
		const fileData = await this.openFile(filePath);

		// 파일이 성공적으로 열린 후 실행할 코드 작성
		console.log('파일이 열렸습니다.');
		console.log('파일 내용:', fileData);

		// 다음 로직 실행
		console.log('다음 로직을 실행합니다.');
		// ...
	} catch (err) {
		console.error('파일을 열 수 없습니다:', err);
	}
};

module.exports.runAnimateFile = function (absolutePath, callback) {
	// 실행할 Adobe Animate 명령어
	const command = `animate ${absolutePath}`;

	// Adobe Animate 파일 실행
	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error(`Adobe Animate 실행 중 오류가 발생했습니다: ${error}`);
			callback(error, absolutePath);
		} else {
			console.log('Adobe Animate 실행이 완료되었습니다.');
			callback(null, absolutePath);
		}
	});
};

//fla 파일 빌드
module.exports.buildFla = function (flaFilePath, callback) {
	// Adobe Animate CLI 실행 경로
	const animateCLIPath = 'C:/Program Files/Adobe/Adobe Animate 2020/Animate.exe';

	// 빌드 명령어
	const buildCommand = `"${animateCLIPath}" -publish -export html5 -file "${flaFilePath}"`;

	// 빌드 실행
	exec(buildCommand, (error, stdout, stderr) => {
		if (error) {
			console.error(`빌드 중 오류 발생: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`빌드 중 에러 출력:\n${stderr}`);
			return;
		}
		console.log('빌드가 성공적으로 완료되었습니다.');
		callback(null);
	});
};

// 폴더 내의 파일을 다른 디렉토리로 이동하는 함수
module.exports.moveFilesToDirectory = function (sourceDir, targetDir) {
	fs.readdir(sourceDir, (err, files) => {
		if (err) {
			console.error(`파일 이동 중 에러 발생: ${err.message}`);
			return;
		}

		files.forEach((file) => {
			const sourceFilePath = path.join(sourceDir, file);
			const targetFilePath = path.join(targetDir, file);

			fs.rename(sourceFilePath, targetFilePath, (err) => {
				if (err) {
					console.error(`파일 이동 중 에러 발생: ${err.message}`);
					return;
				}

				console.log(`파일을 ${targetDir}로 이동했습니다.`);
			});
		});
	});
}

module.exports.convertToForwardSlash = function (path) {
	if (typeof path !== 'string') {
		return path; // 문자열이 아닌 경우 변환하지 않고 그대로 반환
	}
	return path.replace(/\\/g, '/');
}

// 폴더 내의 모든 파일 검색 함수
function getFilesInDirectory(directory) {
	let files = [];

	fs.readdirSync(directory).forEach((file) => {
		const filePath = path.join(directory, file);
		const stat = fs.statSync(filePath);

		if (stat.isFile()) {
			files.push(filePath);
		} else if (stat.isDirectory()) {
			files = files.concat(getFilesInDirectory(filePath));
		}
	});

	return files;
}

//학습외 차시 넘버 업데이트
module.exports.updateAdditionalNumFromExcel = function (func) {
	const codeFilePath = config_.public_path + '/stepCode.xlsx';
	const code02FilePath = config_.public_path + '/stepCode.xlsx';
	
	async function updateCode02File() {
		const workbook1 = new ExcelJS.Workbook();
		const workbook2 = new ExcelJS.Workbook();

		await workbook1.xlsx.readFile(codeFilePath);
		await workbook2.xlsx.readFile(code02FilePath);

		// const codeSheet1 = workbook1.getWorksheet("학습외");
		const codeSheet1 = workbook1.getWorksheet("학습외_new");
		const codeSheet2 = workbook2.getWorksheet("그림책탐험대");

		const codeStepNameCol1 = findColumnByHeader(codeSheet1, '도서');
		const codeStepCodeCol1 = findColumnByHeader(codeSheet1, 'NO');
		//const codeStepNumberCol1 = findColumnByHeader(codeSheet1, '스탭순서');
		const codeStepNameCol2 = findColumnByHeader(codeSheet2, '스탭명');
		const codeCompareCol2 = findColumnByHeader(codeSheet2, '학습외');

		codeSheet2.eachRow({ includeEmpty: true }, (row2, rowNumber2) => {
			if (rowNumber2 === 1) {
				// 첫 번째 행은 헤더이므로 건너뜁니다.
				return;
			}

			const code02StepName = row2.getCell(codeStepNameCol2).value;
			if (code02StepName !== null) {
				const trimmedCode02StepName = String(code02StepName).trim();
				const colonIndex2 = trimmedCode02StepName.indexOf(':');
				var extractStepName2 = '';

				if (colonIndex2 !== -1) {
					extractStepName2 = trimmedCode02StepName.substring(colonIndex2 + 1).trim();
				} else {
					extractStepName2 = trimmedCode02StepName;
					// console.log("콜론(:)이 발견되지 않았습니다.");
				}

				extractStepName2 = extractStepName2.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');

				var filteredStepName2 = trimmedCode02StepName.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');
				
				if (extractStepName2 !== '') {
					codeSheet1.eachRow({ includeEmpty: true }, (row1, rowNumber1) => {
						if (rowNumber1 === 1) {
							// 첫 번째 두번째 행은 헤더이므로 건너뜁니다.
							return;
						}
						//const stepNum = row1.getCell(codeStepNumberCol1).value;
						const codeStepName1 = row1.getCell(codeStepNameCol1).value;
						if (codeStepName1 !== null) {

							const trimmedCodeStepName1 = String(codeStepName1).trim();
							const colonIndex1 = trimmedCodeStepName1.indexOf(':');
							var extractStepName1 = '';
							
							if (colonIndex1 !== -1) {
								extractStepName1 = trimmedCodeStepName1.substring(colonIndex1 + 1).trim();
							} else {
								extractStepName1 = trimmedCodeStepName1;
							}

							extractStepName1 = extractStepName1.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');

							var filteredStepName1 = trimmedCodeStepName1.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');
							// 비교예시
							if (filteredStepName1.includes("고양이춤")) {
								console.log(extractStepName1);
								console.log(stepNum);
								// console.log(extractStepName2);
							}
							if (extractStepName1 !== '') {
								//":" 이후 스탭명만 비교
								if (extractStepName1.replace(/\s/g, '') == extractStepName2.replace(/\s/g, '')) {
									const codeStepCode1 = row1.getCell(codeStepCodeCol1).value;
									row2.getCell(codeCompareCol2).value = codeStepCode1;
									return false; // 스탭명이 일치하는 행을 찾았으므로 반복문을 종료합니다.
								}

								//":" 포함 스탭명 비교
								// if (filteredStepName1.replace(/\s/g, '') == filteredStepName2.replace(/\s/g, '')) {
								// 	const codeStepCode1 = row1.getCell(codeStepCodeCol1).value;
								// 	row2.getCell(codeCompareCol2).value = codeStepCode1;
								// 	return false; // 스탭명이 일치하는 행을 찾았으므로 반복문을 종료합니다.
								// }
							}
						}
					});
				}
			}
		});

		await workbook2.xlsx.writeFile(code02FilePath);
		console.log('stepCode.xlsx 파일 업데이트 완료:', code02FilePath);
		func(true);
	}

	// 열 헤더를 기준으로 열 인덱스를 찾는 함수
	function findColumnByHeader(sheet, header) {
		const headerRow = sheet.getRow(1);
		for (let col = 1; col <= sheet.columnCount; col++) {
			const cellValue = headerRow.getCell(col).value;
			if (cellValue === header) {
				return col;
			}
		}
		return null;
	}

	updateCode02File().catch((error) => {
		console.error('오류 발생:', error);
		func(false);
	});
}

module.exports.updateStepCodeFromExcel = function (func) {
	const codeFilePath = config_.public_path + '/stepCode.xlsx';
	const code02FilePath = config_.public_path + '/stepCode.xlsx';
	

	async function updateCode02File() {
		const workbook1 = new ExcelJS.Workbook();
		const workbook2 = new ExcelJS.Workbook();

		await workbook1.xlsx.readFile(codeFilePath);
		await workbook2.xlsx.readFile(code02FilePath);

		const codeSheet1 = workbook1.getWorksheet("독서");
		const codeSheet2 = workbook2.getWorksheet("그림책탐험대");

		const codeStepNameCol1 = findColumnByHeader(codeSheet1, '스탭명');
		const codeStepCodeCol1 = findColumnByHeader(codeSheet1, '스탭코드');
		const codeStepNumberCol1 = findColumnByHeader(codeSheet1, '스탭순서');
		const codeStepNameCol2 = findColumnByHeader(codeSheet2, '스탭명');
		const codeCompareCol2 = findColumnByHeader(codeSheet2, '비교');

		codeSheet2.eachRow({ includeEmpty: true }, (row2, rowNumber2) => {
			if (rowNumber2 === 1) {
				// 첫 번째 행은 헤더이므로 건너뜁니다.
				return;
			}

			const code02StepName = row2.getCell(codeStepNameCol2).value;
			if (code02StepName !== null) {
				const trimmedCode02StepName = String(code02StepName).trim();
				const colonIndex2 = trimmedCode02StepName.indexOf(':');
				var extractStepName2 = '';

				if (colonIndex2 !== -1) {
					extractStepName2 = trimmedCode02StepName.substring(colonIndex2 + 1).trim();
				} else {
					extractStepName2 = trimmedCode02StepName;
					// console.log("콜론(:)이 발견되지 않았습니다.");
				}

				extractStepName2 = extractStepName2.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');

				var filteredStepName2 = trimmedCode02StepName.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');
				
				if (extractStepName2 !== '') {
					codeSheet1.eachRow({ includeEmpty: true }, (row1, rowNumber1) => {
						if (rowNumber1 === 1) {
							// 첫 번째 행은 헤더이므로 건너뜁니다.
							return;
						}
						const stepNum = row1.getCell(codeStepNumberCol1).value;
						const codeStepName1 = row1.getCell(codeStepNameCol1).value;
						if (codeStepName1 !== null && (stepNum == 3 || stepNum == "3")) {

							const trimmedCodeStepName1 = String(codeStepName1).trim();
							const colonIndex1 = trimmedCodeStepName1.indexOf(':');
							var extractStepName1 = '';
							
							if (colonIndex1 !== -1) {
								extractStepName1 = trimmedCodeStepName1.substring(colonIndex1 + 1).trim();
							} else {
								extractStepName1 = trimmedCodeStepName1;
							}

							extractStepName1 = extractStepName1.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');

							var filteredStepName1 = trimmedCodeStepName1.replace(/[^\uAC00-\uD7A3a-zA-Z]/g, '');
							// 비교예시
							// if (filteredStepName1.includes("코딱지")) {
							// 	console.log(extractStepName1);
							// 	console.log(stepNum);
							// 	// console.log(extractStepName2);
							// }
							if (extractStepName1 !== '') {
								//":" 이후 스탭명만 비교
								if (extractStepName1.replace(/\s/g, '') == extractStepName2.replace(/\s/g, '')) {
									const codeStepCode1 = row1.getCell(codeStepCodeCol1).value;
									row2.getCell(codeCompareCol2).value = codeStepCode1;
									return false; // 스탭명이 일치하는 행을 찾았으므로 반복문을 종료합니다.
								}

								//":" 포함 스탭명 비교
								// if (filteredStepName1.replace(/\s/g, '') == filteredStepName2.replace(/\s/g, '')) {
								// 	const codeStepCode1 = row1.getCell(codeStepCodeCol1).value;
								// 	row2.getCell(codeCompareCol2).value = codeStepCode1;
								// 	return false; // 스탭명이 일치하는 행을 찾았으므로 반복문을 종료합니다.
								// }
							}
						}
					});
				}
			}
		});

		await workbook2.xlsx.writeFile(code02FilePath);
		console.log('stepCode.xlsx 파일 업데이트 완료:', code02FilePath);
		func(true);
	}

	// 열 헤더를 기준으로 열 인덱스를 찾는 함수
	function findColumnByHeader(sheet, header) {
		const headerRow = sheet.getRow(1);
		for (let col = 1; col <= sheet.columnCount; col++) {
			const cellValue = headerRow.getCell(col).value;
			if (cellValue === header) {
				return col;
			}
		}
		return null;
	}

	updateCode02File().catch((error) => {
		console.error('오류 발생:', error);
		func(false);
	});
}

module.exports.getStepCodeFromExcel = async function (fileName, func) {
	getStepCodeFromExcel(fileName, func);
}

async function getStepCodeFromExcel(fileName, func) {
	const workbook = new ExcelJS.Workbook();
	var exelFilePath = config_.public_path + "/stepCode.xlsx";

	await workbook.xlsx.readFile(exelFilePath);

	const worksheet = workbook.getWorksheet('독서');

	const extractedNumbers = fileName
		.replace(/[^\d_-]/g, '') // 숫자, "_", "-"를 제외한 모든 문자 제거
		.split(/[_-]/) // "_" 또는 "-"로 구분하여 배열로 분리
		.map(Number); // 숫자로 변환
	var age = 5;
	var chapter = 1;
	var step = 1;
	if (extractedNumbers.length != 3) {
		func("noMatchCode_" + fileName);
		return false;
	} else {
		for (var i = 0; i <= extractedNumbers.length; i++) {
			if (i == 0) {
				age = extractedNumbers[i] - 4;
			} else if (i == 1) {
				chapter = extractedNumbers[i];
			} else if (i == 2) {
				step = extractedNumbers[i];
			}
		}
	}

	const stepCodeColumnName = "스탭코드";

	const stepCodeColumnIndex = worksheet.getRow(1).values.findIndex((cellValue) => {
		const columnName = cellValue && cellValue.toString().trim();
		return columnName === stepCodeColumnName;
	});

	//console.log(stepCodeColumnIndex);

	let rowIndex = null;
	worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
		if (rowNumber === 1) {
			// 1행에서 각 열의 인덱스를 찾기
			const columnIndexMap = {};
			row.eachCell({ includeEmpty: true }, (cell, columnIndex) => {
				const columnName = cell.value && cell.value.toString().trim();
				columnIndexMap[columnName] = columnIndex;
			});

			const stepIndex = columnIndexMap['강좌키'] - 1;
			const chapterIndex = columnIndexMap['차시순서'];
			const stepOrderIndex = columnIndexMap['스탭순서'];

			// 1단계, 20, 3을 가진 행의 인덱스를 찾기
			worksheet.eachRow({ includeEmpty: true }, (rowData, index) => {


				const stepValue = rowData.getCell(stepIndex).value && rowData.getCell(stepIndex).value.toString().trim();
				const chapterValue = rowData.getCell(chapterIndex).value && rowData.getCell(chapterIndex).value.toString().trim();
				const stepOrderValue = rowData.getCell(stepOrderIndex).value && rowData.getCell(stepOrderIndex).value.toString().trim();

				if (stepValue == age + '단계' && chapterValue == chapter && stepOrderValue == step) {
					rowIndex = index;
				}
			});
		}
	});
	
	//맞는값을 찾지 못한 경우
	if (rowIndex == null) {
		func(null, age + 4);
		return;
	} 	

	const cell = worksheet.getCell(rowIndex, stepCodeColumnIndex);
	const value = cell.value;

	func(value, age + 4);
}

//학습외 차시 엑셀로부터 number 얻어오기
module.exports.getAdditionalModuleNumberFromExcel = async function (fileName, func) {
	getAdditionalModuleNumberFromExcel(fileName, func);
}

async function getAdditionalModuleNumberFromExcel(fileName, func) {
	const workbook = new ExcelJS.Workbook();
	var exelFilePath = config_.public_path + "/stepCode.xlsx";

	await workbook.xlsx.readFile(exelFilePath);

	// const worksheet = workbook.getWorksheet('학습외');
	const worksheet = workbook.getWorksheet('학습외_new');

	const extractedNumbers = fileName
		.replace(/[^\d_-]/g, '') // 숫자, "_", "-"를 제외한 모든 문자 제거
		.split(/[_-]/) // "_" 또는 "-"로 구분하여 배열로 분리
		.map(Number); // 숫자로 변환
	var age = 1;
	var num = 1;
	if (extractedNumbers.length != 2) {
		func("noMatchCode_" + fileName);
		return false;
	} else {
		for (var i = 0; i <= extractedNumbers.length; i++) {
			if (i == 0) {
				age = extractedNumbers[i];
			} else if (i == 1) {
				num = extractedNumbers[i];
			} 
		}
		// 번호에 따라 연령 강제설정
		if (num <= 89) {
			age = 5;
		} else if ((num > 89 && num <= 172) || num == 308) {
			age = 6;
		} else {
			age = 7;
		}
	}

	const stepCodeColumnName = "NO";

	const stepCodeColumnIndex = worksheet.getRow(1).values.findIndex((cellValue) => {
		const columnName = cellValue && cellValue.toString().trim();
		return columnName === stepCodeColumnName;
	});

	console.log(stepCodeColumnIndex);
	console.log(stepCodeColumnIndex);
	console.log(stepCodeColumnIndex);

	let rowIndex = null;
	worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
		if (rowNumber === 1) {
			// 2행에서 각 열의 인덱스를 찾기
			const columnIndexMap = {};
			row.eachCell({ includeEmpty: true }, (cell, columnIndex) => {
				const columnName = cell.value && cell.value.toString().trim();
				columnIndexMap[columnName] = columnIndex;
			});

			const stepIndex = columnIndexMap['NO'];
			
			// 행의 인덱스를 찾기
			worksheet.eachRow({ includeEmpty: true }, (rowData, index) => {


				const stepValue = rowData.getCell(stepIndex).value && rowData.getCell(stepIndex).value.toString().trim();

				if (stepValue == num) {
					rowIndex = index;
				}
			});
		}
	});
	
	//맞는값을 찾지 못한 경우
	if (rowIndex == null) {
		 console.log("맞는 값을 못찾음")
		func(null, null);
		return;
	} 	

	const cell = worksheet.getCell(rowIndex, stepCodeColumnIndex);
	const value = cell.value;

	func(value, age);
}

module.exports.getEbookStepCodeFromExcel = async function (originStepCode, isAdditional, func) {
	getEbookStepCodeFromExcel(originStepCode, isAdditional, func);
}

async function getEbookStepCodeFromExcel(originStepCode, isAdditional, func) {
	const workbook = new ExcelJS.Workbook();
	var exelFilePath = config_.public_path + "/stepCode.xlsx";
	await workbook.xlsx.readFile(exelFilePath);
	const worksheet = workbook.getWorksheet('그림책탐험대');

	//그림책탐험대 전용


	const stepCodeColumnName = "스탭코드";

	const stepCodeColumnIndex = worksheet.getRow(1).values.findIndex((cellValue) => {
		const columnName = cellValue && cellValue.toString().trim();
		return columnName === stepCodeColumnName;
	});

	// console.log(stepCodeColumnIndex);

	const stepNameColumnName = "스탭명";

	const stepNameColumnIndex = worksheet.getRow(1).values.findIndex((cellValue) => {
		const columnName = cellValue && cellValue.toString().trim();
		return columnName === stepNameColumnName;
	});

	// console.log(stepNameColumnIndex);

	const studyCodeColumnName = "강좌코드";

	const studyCodeColumnIndex = worksheet.getRow(1).values.findIndex((cellValue) => {
		const columnName = cellValue && cellValue.toString().trim();
		return columnName === studyCodeColumnName;
	});

	// console.log(studyCodeColumnIndex);

	let rowIndex = null;
	worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
		if (rowNumber === 1) {
			// 1행에서 각 열의 인덱스를 찾기
			const columnIndexMap = {};
			row.eachCell({ includeEmpty: true }, (cell, columnIndex) => {
				const columnName = cell.value && cell.value.toString().trim();
				columnIndexMap[columnName] = columnIndex;
			});

			var chapterIndex = columnIndexMap['비교'];
			if (isAdditional == true) {
				chapterIndex = columnIndexMap['학습외'];
			}			

			worksheet.eachRow({ includeEmpty: true }, (rowData, index) => {
				const chapterValue = rowData.getCell(chapterIndex).value && rowData.getCell(chapterIndex).value.toString().trim();

				if (chapterValue == originStepCode) {
					rowIndex = index;
				}
			});
		}
	});

	if (rowIndex) {
		const cell = worksheet.getCell(rowIndex, stepCodeColumnIndex);
		const value = cell.value;

		const stepNameCell = worksheet.getCell(rowIndex, stepNameColumnIndex);
		const stepNameValue = stepNameCell.value;

		const studyCodeCell = worksheet.getCell(rowIndex, studyCodeColumnIndex);
		const studyCodeValue = studyCodeCell.value;
		func(value, stepNameValue, studyCodeValue);
	} else {
		func(null, null, null);
	}
}

//웅진 관련------------------------------------------------------------
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const glob = require('glob');

module.exports.callPurgeBySelenium = async function (purgeUrlList, userName, passWord, linkPath, flaFileNameList, uploadPathList, serverLocation, func) {
	callPurgeBySelenium(purgeUrlList, userName, passWord, linkPath, flaFileNameList, uploadPathList, serverLocation, func);
}

//퍼지를 위한 셀레니움 동작
async function callPurgeBySelenium(purgeUrlList, userName, passWord, linkPath, flaFileNameList, uploadPathList, serverLocation, func) {
	var chromeOptions = new chrome.Options();
    chromeOptions.addArguments('--start-maximized');

	var isLogined = true;
	var driver = null;
	//셀레니움 driver 저장
	//개발기업로드 
	console.log(serverLocation);
	console.log(serverLocation);
	console.log(serverLocation);
	var uploadLink = "https://bcms2-dev.wjthinkbig.com:8187/admin/main";
	if (serverLocation == "develop") {
		//로그인 안 되어있는 상태
		// driver = new Builder()
		// 	.forBrowser('chrome')
		// 	.setChromeOptions(chromeOptions)
		// 	.build();
		// isLogined = false;
		console.log("개발서버에서퍼지");		
		console.log(developeCdnDriver);
		if (developeCdnDriver == null) {
			developeCdnDriver = new Builder()
			.forBrowser('chrome')
			.setChromeOptions(chromeOptions)
			.build();
			isLogined = false;
		} 
		driver = developeCdnDriver;
	}
	//운영기업로드
	else {
		uploadLink = "https://bcms2.wjthinkbig.com:8187/admin/main";
		if (liveCdnDriver == null) {
			liveCdnDriver = new Builder()
			.forBrowser('chrome')
			.setChromeOptions(chromeOptions)
			.build();
			isLogined = false;
		}

		driver = liveCdnDriver;
	}		

    (async function () {
        try {
			if (isLogined == false) {
				// 로그인
				await login(uploadLink, userName, passWord);
			}

            // 퍼지 관리
            await navigateToPurge();

            // 성공 시 응답
            
        } catch (error) {
            console.error('An error occurred:', error);
			//driver객체 초기화
			if (serverLocation != "develop") {
				liveCdnDriver = null;
			} else {
				developeCdnDriver = null;
			}
			
            // 에러 시 응답
            func(false, purgeUrlList, flaFileNameList, uploadPathList, error);
            return; // 이 부분을 추가하여 함수 실행 중단
        } finally {
			if (serverLocation == "develop") {
				//await driver.quit();
			}
			func(true, purgeUrlList, flaFileNameList, uploadPathList, "퍼지성공");
        }
    })();

    async function login(site, userName, passWord) {
		await driver.get(site);
        await driver.sleep(2000);

		// 엘리먼트가 나타날 때까지 대기
		await driver.wait(until.elementLocated(By.name('j_username')), 5000);

		// 엘리먼트를 찾아서 값 입력
		await driver.findElement(By.name('j_username')).sendKeys(userName);

		// 비밀번호 입력
		await driver.findElement(By.name('j_password')).sendKeys(passWord);
		
		// 로그인 버튼 클릭
		await driver.findElement(By.xpath('/html/body/div[1]/div/div[2]/div/form/fieldset/p/button')).click();		
		// 로그인 버튼 클릭 60초 대기
		if (serverLocation != "develop") {
			await driver.sleep(60000);
		}
		
        console.log("로그인완료");
    }

	async function navigateToPurge() {
        // 스마트올플랫폼 버튼 클릭
        await driver.findElement(By.xpath('/html/body/div[1]/div/div/div[4]/div/ul/li[13]/a')).click();

        await driver.sleep(2000);
		//파일업로드 관리 클릭
		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[1]/div/ul/li[7]/a')).click();
		await driver.sleep(1000);
		
		//퍼지 키 입력
		for (const purgeUrl of purgeUrlList) {
			await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div[1]/table/tbody/tr/td[2]/form/input')).sendKeys(purgeUrl);
			await driver.sleep(1000);
			await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div[1]/table/tbody/tr/td[3]/button')).click();
			await driver.sleep(1000);
			// 알림창 확인
			//await driver.switchTo().alert().accept();
			//await driver.sleep(1000);
			try {
				await driver.wait(until.alertIsPresent(), 600000, '퍼지에 성공하였습니다.');
				await driver.sleep(1000);
				await driver.switchTo().alert().accept();
				await driver.sleep(1000);
				console.log(`${purgeUrl} success`);
			} catch (error) {
				console.log(`10분 동안 ${purgeUrl} 퍼지되지 않았어요`);
			}
		}		
	}
}


//작업중-----------------------------------
module.exports.checkDataId = async function (filePath, func) {
	checkDataId(filePath, func);
}

async function checkDataId(filePath, func) {
	const codeFilePath = config_.public_path + '/woongin.xlsx';

	async function readExelFile(filePath) {
		var filaNameData = getWoongingInfoByFileName(filePath);
		var grade = filaNameData["grade"];
		var semester = filaNameData["semester"];
		var unit = filaNameData["unit"];
		var dataId = filaNameData["dataId"];

		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.readFile(codeFilePath);
		const codeSheet = workbook.getWorksheet("메타 커리큘럼");
	
		// 각 열의 인덱스 가져오기
		const codeStepNameCol_0 = findColumnByHeader(codeSheet, '학년');
		const codeStepNameCol_1 = findColumnByHeader(codeSheet, '학기');
		const codeStepNameCol_2 = findColumnByHeader(codeSheet, '단원순서');
		const codeStepNameCol_4 = findColumnByHeader(codeSheet, '목차고유번호');
		const codeStepNameCol_5 = findColumnByHeader(codeSheet, '파일명');
	
		// 원하는 조건을 만족하는 행 찾기
		let targetRow;
		codeSheet.eachRow((row, rowNumber) => {
			if (
				row.getCell(codeStepNameCol_0).value === grade + '학년' &&
				row.getCell(codeStepNameCol_1).value === semester + '학기' &&
				row.getCell(codeStepNameCol_2).value === unit &&
				row.getCell(codeStepNameCol_4).value === dataId
			) {
				targetRow = row;
				return false; // 반복 중지
			}
		});
	
		if (targetRow) {
			const fileName = targetRow.getCell(codeStepNameCol_5).value;
			
			console.log("찾은 파일명:", fileName);
			console.log(fileName.result);
			console.log(filePath);
			console.log(getWoongingInfoByFileName(fileName.result)['dataId']);
			console.log(dataId);
			if (getWoongingInfoByFileName(fileName.result)['dataId'] == dataId) {
				func(true);
			} else {
				func(true);
			}
			
		} else {
			console.log("해당하는 행을 찾을 수 없습니다.");
			func(true);
		}
	}

	readExelFile(filePath);

	// 열 헤더를 기준으로 열 인덱스를 찾는 함수
	function findColumnByHeader(sheet, header) {
		const headerRow = sheet.getRow(1);
		for (let col = 1; col <= sheet.columnCount; col++) {
			const cellValue = headerRow.getCell(col).value;
			if (cellValue === header) {
				return col;
			}
		}
		return null;
	}
}

module.exports.uploadWoonginFilesToFTP = async function (folderPath, filePath, location, userName, passWord, linkPath, uploadLange, htmljsOnly, isPurgePossible, func) {
	uploadWoonginFilesToFTP(folderPath, filePath, location, userName, passWord, linkPath, uploadLange, htmljsOnly, isPurgePossible,func);
}

async function uploadWoonginFilesToFTP(folderPath, filePath, location, userName, passWord, linkPath, uploadLange, htmljsOnly, isPurgePossible, func) {
	const host = 'wjth.ftp.scs.skcdn.co.kr'; // FTP 호스트 이름
	const port = 10021; // FTP 포트 번호
	const user = 'morph'; // FTP 사용자 이름
	const password = 'morph01!'; // FTP 비밀번호

	var localRootFolderPath = folderPath; // 로컬 폴더 경로

	// func(true, folderPath, filePath);
	// return;
	var purgeUrlList = [];

	//원격 기본경로
	var remoteFolderPath = "/WJTH_CACHE/BLLCONTENTS_DEV/ACT/KORN";
	var linkFolderPath = "https://cache.wjthinkbig.com/BLLCONTENTS_DEV/ACT/KORN";

	//운영기 업로드 경로 변경
	if (location != "dev") {
		remoteFolderPath = "/WJTH_CACHE/BLLCONTENTS/ACT/KORN";
		linkFolderPath = "https://cache.wjthinkbig.com/BLLCONTENTS/ACT/KORN";
	}

	var fileOriginName = path.basename(filePath); // 파일명 추출
	var flaFileName = path.parse(fileOriginName).name; // 확장자를 제외한 파일명 추출

	var newPath = getFTPPathName(flaFileName);
	
	//업로드 될 경로 최종결정
	//remoteFolderPath = remoteFolderPath + "/" + newPath + "/test";
	remoteFolderPath = remoteFolderPath + "/" + newPath;

	//업로드최종경로
	console.log("업로드 최종 경로");
	console.log(remoteFolderPath);
	console.log(localRootFolderPath);
	console.log(uploadLange);
	// func(true, localRootFolderPath, uploadLange);

	// return;
	var uploadPath = linkFolderPath + "/" + newPath + "/" + getHtmlFileName(flaFileName) + ".HTML";
	console.log(uploadPath);

	purgeUrlList.push(remoteFolderPath + "/*");

	var client = new ftp.Client();
	//테스트
	//func(false, purgeUrlList, flaFileName, uploadPath);

	try {
		await client.access({
			host: host,
			port: port,
			user: user,
			password: password
		});

		//각 파일 및 폴더 업로드
		await uploadFilesRecursively(localRootFolderPath, remoteFolderPath, client);
		
	} catch (error) {
		console.error('Error occurred during file upload:', error,);
		func(false, purgeUrlList, flaFileName, uploadPath);
	} finally {
		client.close();

		console.log('All files uploaded successfully');
			
		for (var purgeURL of purgeUrlList) {
			console.log(purgeURL);
		}

		// 퍼지사이트 접속 안될 때
		if (isPurgePossible == "true") {
			console.log("퍼지사이트 접속 시작");
			//callPurgeBySelenium(purgeUrlList, userName, passWord, linkPath, flaFileName, uploadPath, func);
		} else {
			console.log("퍼지사이트 접속불가");
		}
		func(true, purgeUrlList, flaFileName, uploadPath);
	}

	// //각 파일 및 폴더 업로드
	async function uploadFilesRecursively(localFolderPath, remoteFolderPath, client) {
		const files = fs.readdirSync(localFolderPath);
		
		// 폴더 우선순위로 저장되도록 순서변경
		const folders = [];
		const otherFiles = [];

		// 파일 및 폴더를 구분하여 각 배열에 추가
		files.forEach(file => {
			const filePath = path.join(localFolderPath, file);
			const stats = fs.statSync(filePath);
			if (stats.isDirectory()) {
				folders.push(file);
			} else {
				otherFiles.push(file);
			}
		});

		const newFiles = [];
		folders.forEach(folder => {
			newFiles.push(folder);
		});
		otherFiles.forEach(file => {
			newFiles.push(file);
		});

		console.log("파일및폴더목록");
		console.log(newFiles);
		
		for (const file of newFiles) {
			if (file.includes('복구') || file.includes('RECOVER')) {
				continue;
			}
			const filePath = path.join(localFolderPath, file);
			if (!fs.existsSync(filePath)) {
				console.error(`File or directory "${filePath}" not found`);
				continue; // 파일 또는 디렉토리가 없으면 다음 항목으로 넘어감
			}

			const fileStats = fs.statSync(filePath);
			const remoteFilePath = `${remoteFolderPath}/${path.basename(file)}`;
			
			//html, js 파일만 업로드
			if (htmljsOnly == "true") {
				
				console.log("html, js 파일만 업로드");
				const extname = path.extname(file);
				if (fileStats.isFile()) {
					//html , js 파일만 업로드
					if (extname === '.HTML' || extname === '.html' || extname === '.JS' || extname === '.js') {
						if (uploadLange != "all") {
							if (path.basename(file).toLocaleLowerCase() != "createjs.min.js")	 {
								
								await client.uploadFrom(filePath, remoteFilePath);
								console.log(`File "${remoteFilePath}" uploaded successfully`);
								purgeUrlList.push(remoteFolderPath + "/" + file);
							}
						} else {
							
							await client.uploadFrom(filePath, remoteFilePath);
							console.log(`File "${remoteFilePath}" uploaded successfully`);
							//purgeUrlList.push(remoteFolderPath + "/" + file);
						}
					}
				}	
			} 
			else {
				if (fileStats.isFile()) {
					//css, create.min.js, DebugScript 제외하고 업로드 
					if (uploadLange != "all") {

						if (path.basename(file).toLocaleLowerCase() != "createjs.min.js" && path.basename(file).toLocaleLowerCase() != "debugscript.js")	 {
							
							await client.uploadFrom(filePath, remoteFilePath);
							console.log(`File "${remoteFilePath}" uploaded successfully`);
							//purgeUrlList.push(remoteFolderPath + "/" + file);
						}
					} else {
						if (path.basename(file).toLocaleLowerCase() != "debugscript.js") {
							await client.uploadFrom(filePath, remoteFilePath);
							console.log(`File "${remoteFilePath}" uploaded successfully`);
							//purgeUrlList.push(remoteFolderPath + "/" + file);
						}
						
					}
					
				} else if (fileStats.isDirectory()) {
					if (uploadLange != "all") {
						if (path.basename(file).toLocaleLowerCase() != "css") {
							// If it's a directory, recursively upload its contents
							const newRemoteFolderPath = `${remoteFolderPath}/${file}`;
							// Ensure the directory exists on the remote server
							await client.ensureDir(newRemoteFolderPath);
							console.log(`Directory "${remoteFilePath}" created successfully on remote server`);

							if (!purgeUrlList.includes(newRemoteFolderPath + "/*")) {
								purgeUrlList.push(newRemoteFolderPath + "/*");
							}
							
							// Recursively upload files in the subdirectory
							await uploadFilesRecursively(filePath, newRemoteFolderPath, client);
						}
					} else {
						// If it's a directory, recursively upload its contents
						const newRemoteFolderPath = `${remoteFolderPath}/${file}`;
						// Ensure the directory exists on the remote server
						await client.ensureDir(newRemoteFolderPath);
						console.log(`Directory "${remoteFilePath}" created successfully on remote server`);

						if (!purgeUrlList.includes(newRemoteFolderPath + "/*")) {
							purgeUrlList.push(newRemoteFolderPath + "/*");
						}

						// Recursively upload files in the subdirectory
						await uploadFilesRecursively(filePath, newRemoteFolderPath, client);
					}
					
				}
			}

			
		}
	}
}

var liveCdnDriver = null;
var developeCdnDriver = null;

module.exports.setSeleniumUpload = async function (userName, passWord, rootPathList, fileList, rootFolderPath, filePath, linkPath, currentTime, func) {
    setSeleniumUpload(userName, passWord, rootPathList, fileList, rootFolderPath, filePath, linkPath, currentTime, func);
};

function setSeleniumUpload(userName, passWord, rootPathList, fileList, rootFolderPath, filePath, linkPath, currentTime, func) {
    var chromeOptions = new chrome.Options();
    chromeOptions.addArguments('--start-maximized');

    const site = linkPath;
	var isDevelop = true;
	if (site == "https://bcms2.wjthinkbig.com:8187/admin/main") {
		isDevelop = false;
	}
	console.log(site);
	
	var isLogined = true;
	var driver = null;
	//셀레니움 driver 저장
	//개발기업로드 
	if (isDevelop == true) {
		//로그인 안 되어있는 상태
		if (developeCdnDriver == null) {
			developeCdnDriver = new Builder()
			.forBrowser('chrome')
			.setChromeOptions(chromeOptions)
			.build();
			isLogined = false;
		} 
		driver = developeCdnDriver;
		
	}
	//운영기업로드
	else {
		if (liveCdnDriver == null) {
			liveCdnDriver = new Builder()
			.forBrowser('chrome')
			.setChromeOptions(chromeOptions)
			.build();
			isLogined = false;
		}

		driver = liveCdnDriver;
	}

    // const driver = new Builder()
    //     .forBrowser('chrome')
    //     .setChromeOptions(chromeOptions)
    //     .build();

	var cornerNameList = [];
	let gradeList = [];
	let semesterList = [];
	let unitList = [];
	var dataIdList = [];
	var gradeOptionList = [];
	var semesterOptionList = [];

	var htmlFileList = [];

	for (var i = 0; i< fileList.length; i++) {
		cornerNameList.push("");
		gradeList.push(1);
		semesterList.push(1);
		unitList.push(1);
		dataIdList.push(1);
		gradeOptionList.push(1);
		semesterOptionList.push(1);

		htmlFileList.push("");
	}
	
	for (var i = 0; i< fileList.length; i++) {
		var fileOriginName = path.basename(fileList[i]); // 이 부분을 수정
		var fileNameWithoutExtension = path.parse(fileOriginName).name;
		
		var extractedNumbers = fileNameWithoutExtension
			.split(/[_-]/);

		var filaNameData = getWoongingInfoByFileName(fileNameWithoutExtension);
		cornerNameList[i] = filaNameData["cornerName"];
		gradeList[i] = filaNameData["grade"];
		semesterList[i] = filaNameData["semester"];
		
		unitList[i] = filaNameData["unit"];
		dataIdList[i] = filaNameData["dataId"];
		//2학년 단원 선택?
		unitList[i] = unitList*2 - 1;
	
		gradeOptionList[i] = gradeList[i] + 3;
		semesterOptionList[i] = semesterList[i] === 1 ? 2 : 4;

		htmlFileList[i] = rootPathList[i] + '/' + getHtmlFileName(fileNameWithoutExtension) + ".HTML";
	}

	var fileOriginName = path.basename(filePath); // 이 부분을 수정
	var fileNameWithoutExtension = path.parse(fileOriginName).name;
	console.log(fileOriginName);
	console.log(fileNameWithoutExtension);
	var filaNameData = getWoongingInfoByFileName(fileNameWithoutExtension);

	var extractedNumbers = fileNameWithoutExtension
		.split(/[_-]/);
		

	let cornerName = '';
	let grade = 1;
	let semester = 1;
	let unit = 1;
	var dataId = 1;
	
	if (extractedNumbers.length === 6) {
		[cornerName, grade, semester, unit, _, dataId] = extractedNumbers;
	} else {
		//func("noMatchCode_" + filePath);
		//return false;
	}

	grade = Number(grade);
	semester = Number(semester);
	//2학년 단원 선택?
	unit = Number(unit);
	dataId = Number(dataId);

	unit = unit*2 - 1;

	console.log("학년학기단원 데이터아이디정보");
	
	console.log(dataIdList);
	console.log(gradeOptionList);
	console.log(semesterOptionList);
	console.log(htmlFileList);	

	console.log(gradeList);
	
	//const html_file = file_path + '/' + cornerName + "_" + dataId + "_" + currentTime + '.html';
	// const js_main_file = file_path + '/' + cornerName + "_" + dataId + "_" + currentTime + '.js';
	// const createminjs = file_path + '/' + "createjs.min" + '.js';
	// const css_path = file_path + '/css';
	//console.log(html_file);

    (async function () {
        try {
			const handles1 = await driver.getAllWindowHandles();

			if (handles1.length > 0) {
				console.log("하나 이상의 창이 열려 있습니다.");
				console.log(handles1.length);
				// 여기에 원하는 동작 추가
				
			} else {
				console.log("현재 창이 열려 있지 않습니다.");
				console.log(handles1.length);
				// 여기에 원하는 동작 추가
				
			}
			
            // 로그인
			if (isLogined == false) {
				await login(site, userName, passWord);
			}
            
			for (var i = 0; i < fileList.length; i++) {
				// 목차 관리
				await navigateToMokcha(gradeOptionList[i], semesterOptionList[i], dataIdList[i]);            

				// 새로운 탭으로 포커스 전환
				// const handles = await driver.getAllWindowHandles();
				// const newTabHandle = handles[i + 1];
				// await driver.switchTo().window(newTabHandle);

                const handles = await driver.getAllWindowHandles();
                const newTabHandle = handles[0];
                await driver.switchTo().window(newTabHandle);

                // 현재 탭을 닫음
                await driver.close();

                // 새로운 탭의 핸들을 얻기 위해 다시 핸들을 가져옴
                const remainingHandles = await driver.getAllWindowHandles();
                // 새로운 탭의 핸들을 선택
                const remainingTabHandle = remainingHandles[0];
                // 새로운 탭으로 스위치
                await driver.switchTo().window(remainingTabHandle);
	
				// html 업로드
				await uploadFile(htmlFileList[i]);
			}

            

            // index.js 업로드
            //await uploadFile(js_main_file);

			//create.min.js 업로드
			//await uploadFile(createminjs);

            // 이미지 업로드
            //await uploadFiles('images', rootFolderPath + '/' + cornerName + "_" + dataId + '/images/*');

            // JS 업로드
            //await uploadFiles('js', rootFolderPath + '/' + cornerName + "_" + dataId + '/js/*');

            // 사운드 업로드
            //await uploadFiles('sounds', rootFolderPath + '/' + cornerName + "_" + dataId + '/sounds/*');

			// 영상파일
			//await uploadFiles('mp4', rootFolderPath + '/' + cornerName + "_" + dataId + '/mp4/*');

			//await uploadAllFolders(css_path);
			// 지정된 경로의 모든 폴더를 찾아내어 파일 업로드
			const targetFolderPath = path.join(rootFolderPath, cornerName + "_" + dataId + "_" + currentTime);
			//await uploadAllFolders(targetFolderPath);

            // 성공 시 응답
            await func(true, 'success all upload');
        } catch (error) {
            console.error('An error occurred:', error);
			//driver객체 초기화
			if (isDevelop == true) {
				developeCdnDriver = null;
			} else {
				liveCdnDriver = null;
			}
			
            // 에러 시 응답
            await func(false, error);
            return; // 이 부분을 추가하여 함수 실행 중단
        } finally {
            //await driver.quit();
        }
    })();

	async function uploadAllFolders(rootPath) {
		const subFolders = fs.readdirSync(rootPath);
	
		for (const subFolder of subFolders) {
			const subFolderPath = path.join(rootPath, subFolder);
			if (fs.statSync(subFolderPath).isDirectory()) {
				console.log("폴더명");
				console.log(subFolder);
				await uploadFiles(subFolder, `${subFolderPath}/*`);
			}
		}
	}

    async function login(site, userName, passWord) {
		await driver.get(site);
        await driver.sleep(2000);

		//개발 서버인 경우 미리 로그인 함
		if (isDevelop == true) {
			// 엘리먼트가 나타날 때까지 대기
			await driver.wait(until.elementLocated(By.name('j_username')), 5000);

			// 엘리먼트를 찾아서 값 입력
			await driver.findElement(By.name('j_username')).sendKeys(userName);
	
			// 비밀번호 입력
			await driver.findElement(By.name('j_password')).sendKeys(passWord);
	
			// 로그인 버튼 클릭
			await driver.findElement(By.xpath('/html/body/div[1]/div/div[2]/div/form/fieldset/p/button')).click();
		}  else {
			// 엘리먼트가 나타날 때까지 대기
			await driver.wait(until.elementLocated(By.name('j_username')), 5000);
			
			// 엘리먼트를 찾아서 값 입력
			await driver.findElement(By.name('j_username')).sendKeys(userName);
			
			// 비밀번호 입력
			await driver.findElement(By.name('j_password')).sendKeys(passWord);
			// 로그인 버튼 클릭 60초 대기
			await driver.findElement(By.xpath('/html/body/div[1]/div/div[2]/div/form/fieldset/p/button')).click();
			await driver.sleep(60000);
		}
        console.log("로그인완료");
    }

	async function navigateToMokcha(grade, semester, dataId) {
		// 스마트올플랫폼 버튼 클릭
        await driver.findElement(By.xpath('/html/body/div[1]/div/div/div[4]/div/ul/li[13]/a')).click();

        await driver.sleep(2000);

		//목차관리
		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[1]/div/ul/li[5]/a')).click();
		await driver.sleep(1000);
		//과목
		if (isDevelop == true) {
			//await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/form[1]/div/div/div[2]/fieldset/table/tbody/tr[1]/td[2]/select/option[58]')).click();
			await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/form[1]/div/div/div[2]/fieldset/table/tbody/tr[1]/td[2]/select/option[@value="KORN"]')).click();
		} else {
			//await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/form[1]/div/div/div[2]/fieldset/table/tbody/tr[1]/td[2]/select/option[54]')).click();
			await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/form[1]/div/div/div[2]/fieldset/table/tbody/tr[1]/td[2]/select/option[@value="KORN"]')).click();
		}
		
		await driver.sleep(1000);
		// 1학년은 option[4], 2학년은 option[5] 추후 변수값으로 변경
		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/form[1]/div/div/div[2]/fieldset/table/tbody/tr[1]/td[4]/select/option[' + grade + ']')).click();
		await driver.sleep(1000);
		// 1학기는 option[2], 2학기는 option[4] 추후 변수값으로 변경
		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/form[1]/div/div/div[2]/fieldset/table/tbody/tr[1]/td[6]/select/option[' + semester + ']')).click();
		await driver.sleep(1000);
		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/form/div[1]/div/div[2]/fieldset/table/tbody/tr[1]/td[8]/select/option[2]')).click();
		await driver.sleep(4000);

		// 단원 선택 (변수로 변경 가능)
		// await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/form/div[1]/div/div[2]/fieldset/table/tbody/tr[1]/td[14]/select/option[' + unit + ']')).click();
		// await driver.sleep(2000);
		// data-id 값으로 항목 선택 (변수로 변경 가능)
		await driver.findElement(By.xpath('//td[@data-id="' + dataId + '"]/a')).click();
		await driver.sleep(10000);
		// Edit 버튼 클릭
		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[1]/form/table[2]/tbody/tr[9]/td[2]/a')).click();
		await driver.sleep(4000);
	}

	async function uploadFile(file) {
		// 파일 업로드 index.js 의 경우 업로드 란에 기본  string 삭제 후 시작
		// if (file == js_main_file) {
		// 	await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[1]/form/table[2]/tbody/tr[4]/td[3]/input')).clear();
		// 	await driver.sleep(1000);

		// 	await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[1]/form/table[2]/tbody/tr[5]/td[2]/div[1]/input')).sendKeys(file);
		// 	await driver.sleep(1000);	
		// } 
		// //index.html 인 경우
		// else {
		// 	await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[1]/form/table[2]/tbody/tr[1]/td[3]/div[2]/table/tbody/tr[2]/td/div/input')).sendKeys(file);
		// 	await driver.sleep(1000);	
		// }

		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[1]/form/table[2]/tbody/tr[1]/td[3]/div[2]/table/tbody/tr[2]/td/div/input')).sendKeys(file);
		await driver.sleep(1000);	
		// 저장버튼 클릭
		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[2]/div/div[2]/button[2]')).click();
		await driver.sleep(1000);

		// 알림창 확인
		await driver.switchTo().alert().accept();
		await driver.sleep(1000);

		// 10분 내로 저장 대기
		try {
			await driver.wait(until.alertIsPresent(), 600000, '저장되었습니다.');
			await driver.sleep(1000);
			await driver.switchTo().alert().accept();
			await driver.sleep(1000);
			console.log('Success');
		} catch (error) {
			console.log('10분 동안 업로드되지 않았어요');
		}
	}

	async function uploadFiles(uploadType, filesPath) {
		const files = glob.sync(filesPath);
		const uploadString = files.join('\n');
	
		console.log(`\nupload_string for ${uploadType}: ${uploadString}`);
	
		// 파일 업로드 클리어
		await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[1]/form/table[2]/tbody/tr[4]/td[3]/input')).clear();
		await driver.sleep(1000);
	
		if (uploadString) {
			// 타입에 따라 이름과 업로드 문자열 설정
			await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[1]/form/table[2]/tbody/tr[4]/td[3]/input')).sendKeys(cornerName + "_" + dataId + "_" + currentTime + "/" + uploadType);
			await driver.sleep(1000);
			await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[1]/form/table[2]/tbody/tr[5]/td[2]/div[1]/input')).sendKeys(uploadString);
			await driver.sleep(2000);
	
			// 저장버튼 클릭
			await driver.findElement(By.xpath('/html/body/div[2]/div[1]/div[2]/div/div/div[2]/div/div[2]/button[2]')).click();
			await driver.sleep(1000);
	
			// 알림창 확인
			await driver.switchTo().alert().accept();
			await driver.sleep(1000);
	
			// 10분 내로 저장 대기
			try {
				await driver.wait(until.alertIsPresent(), 600000, '저장되었습니다.');
				await driver.sleep(1000);
				await driver.switchTo().alert().accept();
				await driver.sleep(1000);
				console.log(`${uploadType} success`);
			} catch (error) {
				console.log(`10분 동안 ${uploadType} 업로드되지 않았어요`);
			}
		} else {
			console.log(`No files to upload for ${uploadType}`);
			// 파일이 없는 경우에도 다음으로 진행할 수 있도록 처리
		}
	}
	
}

module.exports.copyAllFiles = function (rootFolderPath, filePath, copyFolderPath, isChangeFileName, location, func) {
	const fileOriginName = path.basename(filePath); // 파일명 추출
	const flaFileName = path.parse(fileOriginName).name; // 확장자를 제외한 파일명 추출
	const targetFolderPath = path.join(copyFolderPath, flaFileName); // 복사 대상 폴더 경로
	
	if (rootFolderPath == -1) {
		func(false, flaFileName + ": 빌드파일(html, js 가 있는 폴더를 찾을 수 없음)", 0);
		return;
	} 
	
	if(!fs.existsSync(copyFolderPath)) {
		console.log("복제폴더 경로가 존재하지 않음");
		func(-2, copyFolderPath + ": 복제폴더 경로가 존재하지 않음", 0);
		return;
	} 

	// flaFileName 폴더가 이미 존재하는 경우, 내부의 모든 파일 및 폴더를 삭제
	if (fs.existsSync(targetFolderPath)) {
		deleteFolderRecursive(targetFolderPath);
		console.log(`Deleted existing folder: ${targetFolderPath}`);
	}
	
	// targetFolderPath 폴더 생성
	fs.mkdirSync(targetFolderPath);
	console.log(`Created folder: ${targetFolderPath}`);

	// rootFolderPath 안에 있는 모든 폴더 및 파일 복사하여 targetFolderPath로 붙여넣기
	copyFolderRecursive(rootFolderPath, targetFolderPath);

	console.log('File and folder copy completed');

	// rootFolderPath의 첫 번째 레벨 내부에 있는 HTML 파일 찾기
	const filesInRoot = fs.readdirSync(rootFolderPath);
	const htmlFiles = filesInRoot.filter((file) =>
		fs.statSync(path.join(rootFolderPath, file)).isFile() &&
		path.extname(file).toLowerCase() === '.html'
	);

	const jsFiles = filesInRoot.filter((file) =>
		fs.statSync(path.join(rootFolderPath, file)).isFile() &&
		path.extname(file).toLowerCase() === '.js'
	);

	
	if (jsFiles.length > 0) {
		console.log('js files in root folder:');
		for (const jsFile of jsFiles) {
			console.log(targetFolderPath + '/' + jsFile);
			//여기서  js 파일명 및 파일 안의 코드를 변경
			
			
		}
	}

	if (htmlFiles.length == 1) {
		console.log('HTML files in root folder:');
		for (const htmlFile of htmlFiles) {
			console.log(targetFolderPath + '/' + htmlFile);
			// 추가 기능 수행 (func 인자로 전달된 함수 호출 등)
			//여기서 html 파일명 및 파일 안의 코드를 변경

			var fileName = path.parse(htmlFile).name; // 확장자를 제외한 파일명 추출

			convertFileAndFolders(targetFolderPath, fileName, flaFileName, isChangeFileName, location, function(currentTime) {
				if (typeof func === 'function') {
					func(true, targetFolderPath, currentTime);
				}
				return;
			});
		}
	}
}

function getHtmlFileName(filePath) {
	
	var newName = "";
    var filaNameData = getWoongingInfoByFileName(filePath);

	//단원명 강제로 1로 저장?!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	//newName = "GR1" + filaNameData["grade"] + "_" + filaNameData["semester"] + "_" + filaNameData["unit"] + "_" + filaNameData["dataId"] + "_1";
	newName = "GR1" + filaNameData["grade"] + "_" + filaNameData["semester"] + "_1" + "_" + filaNameData["dataId"] + "_1";

	return newName;
}

module.exports.getWoongingInfoByFileName = function(filePath) {
	getWoongingInfoByFileName(filePath);

	return getWoongingInfoByFileName(filePath);
}

function getWoongingInfoByFileName(filePath) {
	//const inputString = "G1_1_U0_P4_Gt_5629974";
	//const inputString = "gt_1_1_1_4_5629974";
	const inputString = filePath;
	const firstChar = inputString.charAt(0);
	let cornerName = '';
	let grade = 1;
	let semester = 1;
	let unit = 1;
	var dataId = 1;
	//신규 명명법
	if (firstChar === 'G') {
		const regex = /\d+/g;

		const numbers = inputString.match(regex).map(Number);
		console.log(numbers);
		grade = numbers[0];
		semester = numbers[1];
		unit = numbers[2];
		//1학년의 경우는 1을 + 해준다
		if (grade == 1) {
			unit += 1;
		}
		//목차번호는 가장 마지막
		dataId = numbers[numbers.length - 1];
	} 
	//구 명명법
	else {
		const extractedNumbers = inputString
        .split(/[_-]/);

		if (extractedNumbers.length === 6) {
			[cornerName, grade, semester, unit, _, dataId] = extractedNumbers;
		} else {
		}

		grade = Number(grade);
		semester = Number(semester);
		unit = Number(unit);
		dataId = Number(dataId);
	}

	console.log("학년학기단원 데이터아이디정보");
	var data = {"cornerName": cornerName, "grade": grade, "semester": semester, "unit": unit, "dataId": dataId };
	console.log(data["cornerName"]);
	console.log(data["grade"]);
	console.log(data["semester"]);
	console.log(data["unit"]);
	console.log(data["dataId"]);

	return data;
}

function getFTPPathName(filePath) {
	
	var newName = "";
    var filaNameData = getWoongingInfoByFileName(filePath);

	newName = "GR1" + filaNameData["grade"] + "/" + filaNameData["semester"] + "/" + filaNameData["unit"];
	console.log(newName);
	return newName;
}

function convertFileAndFolders(rootFolderPath, fileName, flaFileName, isChangeFileName, location, func) {
    const currentTime = Date.now();
    const newFileName = `${fileName}_${currentTime}`;

	//html 파일명을 ftp 용 조건에 맞게 변경
	var newHtmlFileName = getHtmlFileName(flaFileName);

    // 디렉터리를 동기적으로 읽기
    const files = fs.readdirSync(rootFolderPath);
	console.log(location);
	console.log(location);
	console.log(location);
    // 파일 및 폴더 이름 변경
    files.forEach(file => {
        const filePath = path.join(rootFolderPath, file);
        const fileStat = fs.statSync(filePath);

		if (location == "live") {
			//개발/운영에 따라 참조 경로 변경
			if (fileStat.isFile()) {
				const extname = path.extname(file);
				const basename = path.basename(file, extname);
				if (extname === '.html' && basename === fileName) {
					// 파일 내용 읽기
					let content = fs.readFileSync(filePath, 'utf8');
					
					// 파일 내용에서 fileName을 newFileName로 변경
					content = content.replace(new RegExp('BLLCONTENTS_DEV', 'g'), 'BLLCONTENTS');

					// 변경된 내용 파일에 쓰기
					fs.writeFileSync(filePath, content, 'utf8');
				}
			}		
		}

		if (isChangeFileName == "false") {
			// 파일인 경우 파일 내용 수정
			if (fileStat.isFile()) {
				const extname = path.extname(file);
				const UperExtName = ".HTML";
				const basename = path.basename(file, extname);
				if (extname === '.html' && basename === fileName) {
					const newFilePath = path.join(rootFolderPath, `${newHtmlFileName}${UperExtName}`);
					fs.renameSync(filePath, newFilePath);
				}
			}

			return;
		} else {
			 // 파일이나 폴더의 이름이 fileName과 일치하는 경우 이름 변경
			 if (file === fileName) {
				const newFilePath = path.join(rootFolderPath, newFileName);
				fs.renameSync(filePath, newFilePath);
			}
	
			// 파일인 경우 파일 내용 수정
			if (fileStat.isFile()) {
				const extname = path.extname(file);
				const UperExtName = ".HTML";
				const basename = path.basename(file, extname);
				if (extname === '.html' && basename === fileName) {
					const newFilePath = path.join(rootFolderPath, `${newHtmlFileName}${UperExtName}`);
					fs.renameSync(filePath, newFilePath);
	
					// 파일 내용 읽기
					let content = fs.readFileSync(newFilePath, 'utf8');
	
					// 파일 내용에서 fileName을 newFileName로 변경
					content = content.replace(new RegExp(`${fileName}(?!\\()`, 'g'), newFileName);
	
					// 변경된 내용 파일에 쓰기
					fs.writeFileSync(newFilePath, content, 'utf8');
				} else if (extname === '.js' && fs.readFileSync(filePath, 'utf8').includes(fileName)) {
					const newFilePath = path.join(rootFolderPath, `${newFileName}${extname}`);
					fs.renameSync(filePath, newFilePath);
	
					// 파일 내용 읽기
					let content = fs.readFileSync(newFilePath, 'utf8');
					// 파일 내용에서 fileName + "/"를 newFileName + "/"로 변경
					content = content.replace(new RegExp(`${fileName}\\/`, 'g'), `${newFileName}/`);
	
					// 변경된 내용 파일에 쓰기
					fs.writeFileSync(newFilePath, content, 'utf8');
					
				}
			}
		}
		

       
    });

    // 변환 완료 후 abc 함수 호출
    func(currentTime);
}


//   module.exports = {
// 	replaceSymbolImage,
// 	getFilesInDirectory
//   };