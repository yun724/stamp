var homeUrl = "https://" + window.location.host;
var rootPath = "C:/Users/Morph/Documents/Elihigh_Kids_Reading/testfolder/";
var zipForderPath = "";
var copyFolderPath = "";
var animateCLIPath = 'C:/Program Files/Adobe/Adobe Animate 2020/Animate.exe';
var totalFileData = [];
var checkedFileData = [];
var totalFileLength = 0;
var ebookJsonFileName = "book_info.json";
var morphId = "";
var isPossiblePurge = true;
var otherServerIpAdress = "";
var currentProject = "e";
var uploadLange = "part";
var htmljsOnly = "false";
var isPurgePossible = "true";
var isChangeFileName = "false";
var liveServerPurgePossible = "false";
var uploadLinkCopy = "";
var uploadLinkAll = "";

var searchFolderName = "";

function g_callFetch(urladdr, param, method, contentType, callback) {
    //참고 URL
    //https://developer.mozilla.org/ko/docs/Web/API/Fetch_API/Fetch%EC%9D%98_%EC%82%AC%EC%9A%A9%EB%B2%95

    if (method === "") method = "post";
    if (param === null) param = {};
    if (contentType === null) contentType = 'application/json';

    var fetchOption = {
        cache: 'no-cache',
        method: method,
        //credentials: 'same-origin', // include, *same-origin, omit 쿠키 사용하려면 필요
        // 파일을 업로드할 때 "Content-Type"을 "multipart/form-data"로 설정되게 되는데 이 때 해당 header값을 브라우저에서 자동으로 설정할 수 있도록 값을 설정하지 않음
        // (파일을 업로드할 경우 자동으로 "multipart/form-data; boundary=----WebKitFormBoundary..." 으로 설정됨)
        //headers: { 'Content-Type': contentType },
        body: null
    };

    if (method == 'put' || method == 'post') {
        if (contentType == 'multipart/form-data') {
            if (param == null) {
                param = new FormData();
            }

            // param.append('accessId', accessId);
            // param.append('accesstoken', accesstoken);
            contentType = false;

            fetchOption.body = param;
        } else {
            if (param == null) {
                param = {};
            }

            // param.accessId = accessId;
            // param.accesstoken = accesstoken;

            fetchOption.headers = { 'Content-Type': contentType };
            fetchOption.body = JSON.stringify(param);
        }
    } else { //get, delete
        // param = param + '&accessId=' + accessId + '&accesstoken=' + encodeURIComponent(accesstoken);
        urladdr = urladdr + '?' + param;

        fetchOption.headers = { 'Content-Type': contentType };
    }

    fetch(homeUrl + urladdr, fetchOption)
        .then(res => res.json()) //받은 데이터를 json 형식으로 변경
        .then(
            (res) => {
                callback(res);
            }
            // (error) => {
            //     ;
            // }
        );
}

$(document).ready(function () {
    $('#saveLinkPath').hide();
    //프로젝트 선택
    if (localStorage.getItem('currentProject') == null) {
        localStorage.setItem("currentProject", "e");
    }

    selectCompany(localStorage.getItem('currentProject'));
    $("#userNameInput").val(localStorage.getItem('VPNuserName'));
    $("#passWordInput").val(localStorage.getItem('VPNpassWord'));
    $("#morphId").val(localStorage.getItem('morphId'));
    morphId = localStorage.getItem('morphId');
    
    savePath();

    zipForderPath = localStorage.getItem('zipFolderPath');
    $("#zipFolderPath").val(zipForderPath);

    copyFolderPath = localStorage.getItem('copyFolderPath');
    $("#copyFolderPath").val(copyFolderPath);

    const purgeCheckbox = document.getElementById('purgePossible');

    // 체크박스 클릭 이벤트 리스너
    purgeCheckbox.addEventListener('click', function () {
        const isChecked = purgeCheckbox.checked;
        console.log('캐시퍼지가능여부:', !isChecked);
        isPossiblePurge = !isChecked;
        if (isPossiblePurge) {
            $('#ipAdress').val('');
            otherServerIpAdress = "";
            $('#ipAdressInputArea').hide();
        } else {
            $('#ipAdressInputArea').show();
            $('#ipAdress').val('192.168.50.109');
        }
    });

    //웅진 업로드 범위 선택
    const uploadLangeCheckbox = document.getElementById('uploadLange');

    // 체크박스 클릭 이벤트 리스너
    uploadLangeCheckbox.addEventListener('click', function () {
        const isChecked = uploadLangeCheckbox.checked;
        console.log('업로드 전부 할 것인가:', isChecked);
        if (isChecked) {
            uploadLange = "all";
            
        } else {
            uploadLange = "part";
        }
        console.log(uploadLange);
        
    });

    //웅진 업로드 범위 선택
    const htmljsOnlyCheckbox = document.getElementById('htmljsOnly');

    // 체크박스 클릭 이벤트 리스너
    htmljsOnlyCheckbox.addEventListener('click', function () {
        const isChecked = htmljsOnlyCheckbox.checked;
        console.log('html  js 파일만 업로드할것인가', isChecked);
        if (isChecked) {
            htmljsOnly = "true";
            
        } else {
            htmljsOnly = "false";
        }
        console.log(htmljsOnly);
        
    });

     //웅진 퍼지사이트 접속 가능 선택
     const isPurgePossibleCheckbox = document.getElementById('isPurgePossible');
     //최초 강제 퍼지불가능 선택
     isPurgePossibleCheckbox.checked = true;
     isPurgePossible = false;
     console.log(isPurgePossible);
     

     // 체크박스 클릭 이벤트 리스너
     isPurgePossibleCheckbox.addEventListener('click', function () {
         const isChecked = isPurgePossibleCheckbox.checked;
         console.log('퍼지 사이트 접속 가능인가', !isChecked);
         if (isChecked) {
            isPurgePossible = "false";
             
         } else {
            isPurgePossible = "true";
         }
         console.log(isPurgePossible);
         
     });

    //파일명 변경(현재시간)
    const isChangeFileNameCheckbox = document.getElementById('isChangeFileName');

    // 체크박스 클릭 이벤트 리스너
    isChangeFileNameCheckbox.addEventListener('click', function () {
        const isChecked = isChangeFileNameCheckbox.checked;
        console.log('파일/폴더명 바꿀것인가', isChecked);
        if (isChecked) {
            isChangeFileName = "true";
            
        } else {
            isChangeFileName = "false";
        }
        console.log(isChangeFileName);
        
    });

    //운영서버 퍼지 가능 여부
    const liveServerPurgePossibleCheckbox = document.getElementById('liveServerPurgePossible');

    // 체크박스 클릭 이벤트 리스너
    liveServerPurgePossibleCheckbox.addEventListener('click', function () {
        const isChecked = liveServerPurgePossibleCheckbox.checked;
        console.log('운영서버 퍼지 가능한가', isChecked);
        if (isChecked) {
            liveServerPurgePossible = "true";
            
        } else {
            liveServerPurgePossible = "false";
        }
        console.log(liveServerPurgePossible);
        
    });    

    //purge요청할 타 서버 ip 저장
    $('#saveIp').on('click', function () {
        var ipAdress = $('#ipAdress').val();
        if (ipAdress.trim() == "") {
            showAlert("ip를 입력하세요");
            return;
        }

        if (!isValidIpAddress(ipAdress)) {
            showAlert("정확한 형식의 ip주소를 입력하세요");
            return;
        }

        otherServerIpAdress = ipAdress;
        showAlert("ip가 저장되었습니다.");
    });

    $('#deleteAbsolute').on('click', function () {
        
        $('#absolutePath').val("");
        $('#absolutePath').focus();
    });

    //최상위 폴더 경로 저장
    $('#savePath').on('click', function () {
        
        saveRootPath();
        showAlert("경로가 저장되었습니다.");
    });

    function saveRootPath() {
        var absolutePath = $('#absolutePath').val();
        if (absolutePath.trim() == "") {
            showAlert("경로를 입력하세요");
            return;
        }

        savePath();

        // 입력된 경로가 형식과 일치하는지 확인.
        // if (!isValidPath(absolutePath)) {
        //     showAlert("올바른 경로 형식을 입력하세요");
        //     return;
        // }

        // "/" 없으면 강제로 붙힘
        absolutePath = appendSlash(absolutePath);

        rootPath = absolutePath;
        return rootPath;
    }

    //압축파일 경로 저장
    $('#saveZipFolderPath').on('click', function () {
        var absolutePath = $('#zipFolderPath').val();
        if (absolutePath.trim() == "") {
            showAlert("경로를 입력하세요");
            return;
        }

        //로컬스토리지에 저장
        localStorage.setItem("zipFolderPath", absolutePath);

        // 입력된 경로가 형식과 일치하는지 확인.
        // if (!isValidPath(absolutePath)) {
        //     showAlert("올바른 경로 형식을 입력하세요");
        //     return;
        // }

        // "/" 없으면 강제로 붙힘
        absolutePath = appendSlash(absolutePath);

        zipForderPath = absolutePath;
        showAlert("압축파일 경로 저장완료");
    });

    //복제파일 경로 저장 (웅진프로젝트옹)
    $('#saveCopyFolderPath').on('click', function () {
        var absolutePath = $('#copyFolderPath').val();
        if (absolutePath.trim() == "") {
            showAlert("경로를 입력하세요");
            return;
        }

        //로컬스토리지에 저장
        localStorage.setItem("copyFolderPath", absolutePath);

        // 입력된 경로가 형식과 일치하는지 확인.
        // if (!isValidPath(absolutePath)) {
        //     showAlert("올바른 경로 형식을 입력하세요");
        //     return;
        // }

        // "/" 없으면 강제로 붙힘
        absolutePath = appendSlash(absolutePath);

        copyFolderPath = absolutePath;
        showAlert("복제파일 경로 저장완료");
    });

    $('#saveMorphId').on('click', function () {
        morphId = $('#morphId').val();
        localStorage.setItem("morphId", morphId);
        if (morphId.trim() == "") {
            showAlert("아이디를 입력하세요");
            return;
        }
        showAlert("모프아이디 저장완료");
    });

    //입력한 경로 내의 모든 폴더/파일 보여주기
    $('#showButton').on('click', function () {
        rootPath = saveRootPath();
        var folderName = $('#searchFolderName').val();
        getFileList(rootPath, folderName);
    });

    //입력한 경로 내에서 복구용폴더 삭제 후 모든 폴더/파일 보여주기
    $('#deleteRecoverAndShowButton').on('click', function () {

        showConfirm('정말로 "복구" 폴더 및 파일을 삭제하시겠습니까?', function (result) {
            if (result) {
                rootPath = saveRootPath();
                var folderName = $('#searchFolderName').val();
                getFileListAfterDeleteRecoverFolder(rootPath, folderName);
            } else {

            }
        });
    });

    //연령 차시 스텝 입력 후 해당 파일 검색
    $('#logButton').click(function () {
        var age = parseInt($('#age').val());
        var number = parseInt($('#number').val());
        var step = parseInt($('#step').val());

        console.log('Number 1:', age);
        console.log('Number 2:', number);
        console.log('Number 3:', step);

        if (isNaN(age) || isNaN(number) || isNaN(step)) {
            showAlert("정보를 전부 입력하세요");
        } else {
            var fileName = setFileName(age, number, step, "fla");

            // filterInput 박스에 값 설정
            $('#filterInput').val(fileName);
        }
    });

    //입력한 파일명을 포함한 모든 파일 체크상태로 보여주기
    $('#filterButton').on('click', function () {
        checkFiles(true);
    });
    // 모든 선택된 파일 해제
    $('#cancelButton').on('click', function () {
        $('#filterInput').val("");
        checkFiles(false);
    });

    $('#cancelSearchButton').on('click', function () {
        $('#ageInput').val("");
        $('#rangeStartInput').val("");
        $('#rangeEndInput').val("");
        checkFiles(false);
    });

    $('#searchButton').on('click', function () {
        
        checkFiles(false);
        const ageInput = $('#ageInput').val();
        const rangeStartInput = $('#rangeStartInput').val();
        const rangeEndInput = $('#rangeEndInput').val();

        let age = null;
        if (ageInput && !isNaN(ageInput)) {
            age = parseInt(ageInput, 10);
        }

        const rangeStart = parseInt(rangeStartInput, 10);
        const rangeEnd = parseInt(rangeEndInput, 10);

        // if (isNaN(rangeStart) || isNaN(rangeEnd)) {
        //     // 입력값이 숫자가 아닌 경우 예외처리
        //     alert('차시 범위를 올바르게 입력해주세요.');
        //     return;
        // }

        // 검색어를 기준으로 파일 체크
        searchAndCheckFiles(age, rangeStart, rangeEnd);
    });

    // 파일 체크 상태 변경시 선택된 파일들 목록에 저장
    //todo: 체크해제시 작업 추가
    $(document).on('change', '.file input[type="checkbox"]', function () {
        const checkedFiles = new Set();

        // 체크된 파일들을 Set에 추가
        $('.file input[type="checkbox"]:checked').each(function () {
            checkedFiles.add($(this).closest('.file'));
        });

        // 체크된 파일들의 경로 출력
        const checkedFilePaths = [];
        checkedFiles.forEach(function (file) {
            const filePath = getFilePath(file);
            checkedFilePaths.push(filePath);
        });

        // 출력된 경로들을 콘솔이나 다른 곳에 사용하도록 처리
        totalFileData = checkedFilePaths;
        console.log(checkedFilePaths);
    });

    // 체크된 파일 fla 파일의 경우 열고 빌드
    $('#exportButton').on('click', function () {
        totalFileLength = totalFileData.length;
        var openFileNum = 0;

        for (i = 0; i < totalFileData.length; i++) {

            if (totalFileData[i].includes(".fla") || totalFileData[i].includes(".xfl")) {
                console.log(totalFileData[i]);

                if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
                    openFileNum -= 1;
                } else {
                    //모든 파일 열고 빌드
                    openFiles(animateCLIPath, rootPath, totalFileData[i], function () {
                        openFileNum++;
                        //전부 오픈이 되었다면 순차적으로 빌드
                        if (openFileNum == totalFileLength) {
                            console.log("빌드시작");
                            buildFile(true);
                        }
                    });
                }
            } else {
                openFileNum -= 1;
            }
        }
    });

    // 열려있는 모든 파일 순차적으로 빌드하기
    $('#buildAllButton').on('click', function () {
        buildFile(true);
        return;
        totalFileLength = totalFileData.length;
        var openFileNum = 0;

        for (i = 0; i < totalFileData.length; i++) {

            if (totalFileData[i].includes(".fla") || totalFileData[i].includes(".x")) {
                console.log(totalFileData[i]);

                if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
                    openFileNum -= 1;
                } else {
                    buildFileTest(rootPath, totalFileData[i]);
                }
            } else {
                openFileNum -= 1;
            }
        }
    });

    // 열려있는 파일 하나만 빌드하기
    $('#buildOneButton').on('click', function () {
        buildFile(false);
    });

    // 선택된 모든 파일 열기
    $('#openButton').on('click', function () {
        totalFileLength = totalFileData.length;

        for (i = 0; i < totalFileData.length; i++) {
            if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
            } else {
                checkFileAndOpen(rootPath, totalFileData[i]);
            }
        }
    });

    // 폴더 압축하기
    $('#getZip').on('click', function () {
        if (zipForderPath == "") {
            showAlert("압축파일을 저장할 경로를 저장하세요.");
            return;
        }

        var totalLength = totalFileData.length;
        var successNum = 0;
        var failNum = 0;
        var failPath = "";
        
        for (i = 0; i < totalFileData.length; i++) {
            if (totalFileData[i].includes(".fla") || totalFileData[i].includes(".xfl")) {
                if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
                    totalLength -= 1;
                } else {
                    $("#loading").show();

                    console.log("선택된 파일 근처 돌면서 html, js 파일이 동시 존재하는 폴더 찾아서 압축하기");
                    console.log(totalFileData[i]);
                    getZip(rootPath, totalFileData[i], zipForderPath, false, function (isSuccess, filePath) {
                        if (isSuccess == 1 || isSuccess == 0) {
                            successNum += 1;
                        } else {
                            failNum += 1;
                            failPath += filePath + "\n "
                        }

                        if (totalLength == (successNum + failNum)) {
                            $("#loading").hide();
                            showAlert("총 " + totalLength + "개 중 " + successNum + "개 압축 성공 \n\n 압축 실패 :" + failNum + "개 \n" + failPath);
                        }
                    });
                }
            }
        }
    });

    // 그림책 탐험대용 폴더 압축하기
    $('#getEbookZip').on('click', function () {

        $('#textArea').html("");
        if (zipForderPath == "") {
            showAlert("압축파일을 저장할 경로를 저장하세요.");
            return;
        }

        var totalLength = totalFileData.length;
        var successNum = 0;
        var failNum = 0;
        var failPath = "";
        var jsonAddFailMessage = '';

        var consoleTextList = {
            '5세': '',
            '6세': '',
            '7세': ''
        };

        var urlTextList = {
            '5세': '',
            '6세': '',
            '7세': ''
        };

        var maxAddCount = 0;
        var testCount = 0;
        var testCount1 = 0;
        var testCountSuccess1 = 0;
        var testCountSuccess2 = 0;
        deleteFile(zipForderPath, ebookJsonFileName, function () {
            setTimeout(function () {
                copyFile(zipForderPath, ebookJsonFileName, function () {
                    for (i = 0; i < totalFileData.length; i++) {
                        if (totalFileData[i].includes(".fla") || totalFileData[i].includes(".xfl")) {
                            if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
                                totalLength -= 1;
                            } else {
                                console.log("선택된 파일 근처 돌면서 html, js 파일이 동시 존재하는 폴더 찾아서 압축하기");
                                console.log(totalFileData[i]);

                                $("#loading").show();
                                console.log("갯수확인");
                                console.log("갯수확인");
                                
                                testCount += 1;
                                console.log(testCount);
                                getZip(rootPath, totalFileData[i], zipForderPath, true, function (isSuccess, filePath, age, consoleLog, addedCount) {
                                    console.log("갯수확인2");
                                    console.log("갯수확인2");
                                    testCount1 += 1;
                                    console.log(testCount1);
                                    
                                    if (addedCount >= maxAddCount) {
                                        maxAddCount = addedCount;
                                    }
                                    if (isSuccess == 1 || isSuccess == 0) {
                                        if (isSuccess == 1) {
                                            testCountSuccess1 += 1;
                                        } else {
                                            testCountSuccess2 += 1;
                                        }
                                        successNum += 1;

                                        consoleTextList[age + "세"] += "\n" + consoleLog;
                                        urlTextList[age + "세"] += "<br>" + consoleLog;
                                    } else {
                                        failNum += 1;
                                        failPath += filePath + "\n "
                                    }

                                    console.log(testCountSuccess1);
                                    console.log(testCountSuccess2);
                                    if (isSuccess == 0) {
                                        jsonAddFailMessage += '\n 추가실패 파일: ' + filePath;
                                    }

                                    if (totalLength == (successNum + failNum)) {

                                        $("#loading").hide();

                                        var urlText = "";
                                        console.log("그림책탐험대 url 추출");
                                        console.log("");
                                        console.log("[5세]");
                                        console.log(consoleTextList['5세']);
                                        console.log("");
                                        console.log("[6세]");
                                        console.log(consoleTextList['6세']);
                                        console.log("");
                                        console.log("[7세]");
                                         console.log(consoleTextList['7세']);

                                        var urlText = "";
                                        urlText += "그림책탐험대 <br>";
                                        urlText += "<br> [5세] ";
                                        urlText += urlTextList['5세'] + "<br>";
                                        urlText += "<br> [6세]";
                                        urlText += urlTextList['6세'] + "<br>";
                                        urlText += "<br> [7세]";
                                        urlText += urlTextList['7세'] + "<br>";                                        
                                        
                                        $('#textArea').html(urlText);
                                        showConfirm("총 " + totalLength + "개 중 " + successNum + "개 압축 성공 \n\n 압축 실패 :" + failNum + "개 \n" + failPath + "\n 그림책탐험대용 JSON 추가 갯수: " + maxAddCount + "개 " + jsonAddFailMessage + "\n\n 연령별 폴더 압축을 하시겠습니까?", function (result) {
                                            if (result) {
                                                $("#loading").show();
                                                getAgeFolderZip(zipForderPath, function (isSuccess) {

                                                    $("#loading").hide();
                                                    if (isSuccess) {
                                                        showAlert("연령별 그림책 탐험대 압축 성공");
                                                    }
                                                });
                                            } else {
                                            }
                                        });
                                        // showAlert("총 " + totalLength + "개 중 " + successNum + "개 압축 성공 \n 압축 실패 :" + failNum + "개 \n" + failPath);
                                    }
                                });
                            }
                        }
                    }
                });
            }, 300);

        });

    });

    // 선택된 파일들 nas서버링크 업로드 및 추출
    $('#uploadNas').on('click', function () {
        if (morphId == "" || morphId == null) {
            showAlert("사용중인 morphId 를 저장하세요 ex) sw.yoon")
        } else {
            $('#saveLinkPath').hide();
            $("#loading").show();
            var linkPath = "";
            var uploadFileList = [];
            uploadLinkCopy = "";
            uploadLinkAll = "";

            for (let i = 0; i < totalFileData.length; i++) {
                if (totalFileData[i].includes(".fla") || totalFileData[i].includes(".xfl")) {
                    if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
                        totalLength -= 1;
                    } else {
                        console.log("파일복제시작");
                        console.log(totalFileData);
                        uploadFileList.push(totalFileData[i]);   
                    }
                }
            }
        
            copyAndNasUpload(uploadFileList, 0, morphId, linkPath);
        }

    });

   

    
function copyAndNasUpload(uploadFileList, currentCopyNum, morphId, linkPath, func) {
    
    copyAllFiles(uploadFileList[currentCopyNum], "dev", function(result) {
                    
        //카피한 경로에서 조작
        var newRootPath = result.data.filePath;
        console.log("모든파일복사성공");
        console.log(result);
        console.log(newRootPath);
        console.log(uploadFileList[currentCopyNum]);
        if (result.returnValue == -1) {
            $("#loading").hide();
            showAlert("잘못된 이름을 가진 폴더가 복사되었거나 \n html, js 가 포함된 폴더가 없습니다. 확인해주세요");
            return;
        } 
        if (result.returnValue == -2) {
            $("#loading").hide();
            showAlert("복제 폴더 경로가 존재하지 않습니다. : " + copyFolderPath + " \n 확인해 주세요.");
            return;
        } 

        $.post("/uploadNas", { rootPath: newRootPath, filePath: uploadFileList[currentCopyNum], morphId: morphId }, function (result) {
            console.log(result)
            if (result.returnValue == 1) {
                currentCopyNum ++;
                
                console.log("나스업로드링크");
                linkPath += result.data.linkPath + "<br>";
                uploadLinkAll += result.data.linkPath + "<br>";
                console.log(linkPath);

                uploadLinkCopy += result.data.linkPath + "\n";
                $('#textArea').html(linkPath);
                $('#saveLinkPath').show();
                
                //$('#nasLink').html(linkPath);
                if (currentCopyNum < uploadFileList.length) {
                    copyAndNasUpload(uploadFileList, currentCopyNum, morphId, linkPath, func);
                } else {
                    $("#loading").hide();
                    console.log("nas업로드끝");
                    if (func) {
                        func();
                    }
                } 
            } else {
                $("#loading").hide();
                linkPath = result.data.linkPath;
                console.log("링크추출실패: " + linkPath);
            }
        });
    });     
}

    //링크삭제
    $('#deleteLink').on('click', function () {
        $('#nasLink').text("");
    });

    // 그림책 탐험대용 엑셀업데이트하기
    $('#updateExcel').on('click', function () {
        showAlert("이 기능은 관리자의 허가가 필요합니다");
        return;
        updateExcel(function () {

        });
    });

    // ftp서버 업로드
    $('#uploadFtpServer').on('click', function () {
        showConfirm("'정말로 ftp에 업로드하시겠습니까? \n 설정한 압축파일 경로의 5세, 6세, 7세 내의 모든 파일이 ftp로 일괄 업로드 됩니다.'", function (result) {
            if (result) {
                if (zipForderPath == "") {
                    showAlert("압축파일이 저장된 경로를 설정하세요");
                    return;
                }

                uploadFtpServer(zipForderPath);
            } else {
            }
        });

    });

    //웅진 검증기업로드--------------------------------------------
    
    // 업로드 링크 저장
    $('#saveLinkPath').on('click', function () {
        const centerText = document.getElementById('centerText');
        navigator.clipboard.writeText(uploadLinkCopy)
        .then(() => {
            console.log("텍스트가 성공적으로 클립보드에 복사되었습니다.");
            $("#centerText").html("텍스트복사 성공");
            centerText.classList.remove('hidden');
            centerText.style.transform = 'translate(-50%, -50%) scale(1)';
            setTimeout(function() {
                centerText.style.transform = 'translate(-50%, -50%) scale(0)';
                setTimeout(function() {
                    centerText.classList.add('hidden');
                }, 500);
            }, 700);
        })
        .catch(err => {
            console.error("클립보드 복사 중 오류가 발생하였습니다:", err);
        });
        
    });
    
    //html cdn 최초 업로드 셀레니움
    $('#wUpload_html').on('click', function () {
        if (totalFileData.length == 0) {
            showAlert("업로드할 파일을 선택하세요");
            return;
        }
        if (isPurgePossible == "true") {
            uploadWoongin(true);
        } else {
            showAlert("cdn 접속 불가 상태입니다.");
        }
        
    });

    $('#wUpload_html_live').on('click', function () {
        if (totalFileData.length == 0) {
            showAlert("업로드할 파일을 선택하세요");
            return;
        }
        showConfirm("'정말로 상용 서버 cdn에 업로드하시겠습니까?", function (result) {
            if (result) {
                if (isPurgePossible == "true") {
                    uploadWoongin(false);
                } else {
                    showAlert("cdn 접속 불가 상태입니다.");
                }
                
            }
        });
    });

    //검증기업로드
    $('#wUpload_g').on('click', function () {
        if (totalFileData.length == 0) {
            showAlert("업로드할 파일을 선택하세요");
            return;
        }
        uploadLinkCopy = "";
        uploadLinkAll = "";
        dummyPurgeUrlList = [];
        uploadWooningFTP("dev");
    });

    //상용기업로드
    $('#wUpload_s').on('click', function () {
        if (totalFileData.length == 0) {
            showAlert("업로드할 파일을 선택하세요");
            return;
        }
        showConfirm("정말로 상용 서버 ftp에 업로드하시겠습니까?", function (result) {
            if (result) {
                uploadLinkCopy = "";
                uploadLinkAll = "";
                dummyPurgeUrlList = [];
                uploadWooningFTP("live");
            }
        });
        
    });

    //상용/검증/nas 업로드
    $('#wUpload_a').on('click', function () {
        showConfirm("정말로 nas/상용/검증 서버에 한번에 업로드하시겠습니까?", function (result) {
            if (result) {
                if (morphId == "" || morphId == null) {
                    showAlert("사용중인 morphId 를 저장하세요 ex) sw.yoon")
                } else {
                    if (totalFileData.length == 0) {
                        showAlert("업로드할 파일을 선택하세요");
                        return;
                    }
                    dummyPurgeUrlList = [];
                    $('#saveLinkPath').hide();
                    $("#loading").show();
                    var linkPath = "";
                    var uploadFileList = [];
                    uploadLinkCopy = "";
                    uploadLinkAll = "";
        
                    for (let i = 0; i < totalFileData.length; i++) {
                        if (totalFileData[i].includes(".fla") || totalFileData[i].includes(".xfl")) {
                            if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
                                totalLength -= 1;
                            } else {
                                console.log("파일복제시작");
                                console.log(totalFileData);
                                uploadFileList.push(totalFileData[i]);   
                            }
                        }
                    }
                
                    copyAndNasUpload(uploadFileList, 0, morphId, linkPath, function() {
                        uploadWooningFTP("live", function() {
                            uploadWooningFTP("dev", function() {
                                console.log("전부 업로드 완료");
                            });
                        });
                    });
                }
            }
        });
    });
});

var dummyPurgeUrlList = [];
function uploadWooningFTP(location, func = null) {
    $('#saveLinkPath').hide();
    var totalLength = totalFileData.length;
    var successNum = 0;
    var failNum = 0;
    var failPath = "";
    var message = "";
    var uploadPath = "업로드 링크";
    if(func) {
        uploadLinkCopy += "\n";
        uploadLinkAll += "";
    } else {
        console.log("여기를타???????????????");
        uploadLinkCopy = "";
        uploadLinkAll = "";
    }
    
    var purgeUrlList = [];
    var uploadPathList = [];
    var flaFileNameList = [];
    
    //퍼지전용
    var linkPath = "https://bcms2-dev.wjthinkbig.com:8187/admin/main";

    var userName = $("#userNameInput").val().trim();
    if (userName.trim() == "" && isPurgePossible == "true") {
        showAlert("id를 입력하세요");
        return;
    }

    localStorage.setItem("VPNuserName", userName);

    var passWord = $("#passWordInput").val().trim();
    if (passWord.trim() == "" && isPurgePossible == "true") {
        showAlert("비밀번호를 입력하세요");
        return;
    }

    localStorage.setItem("VPNpassWord", passWord);
    localStorage.getItem('VPNpassWord');

    $("#loading").show();
    console.log("파일복제클릭");
    var uploadFileList = [];
    for (let i = 0; i < totalFileData.length; i++) {
        if (totalFileData[i].includes(".fla") || totalFileData[i].includes(".xfl")) {
            if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
                totalLength -= 1;
            } else {
                console.log("파일복제시작");
                console.log(totalFileData);
                uploadFileList.push(totalFileData[i]);   
            }
        }
    }

    copyAndUpload(uploadFileList, 0, message, location, userName, passWord, linkPath, uploadPath, purgeUrlList, flaFileNameList, uploadPathList, func);
}

function copyAndUpload(uploadFileList, currentCopyNum, message, location, userName, passWord, linkPath, uploadPath, purgeUrlList, flaFileNameList, uploadPathList, func) {
    
    copyAllFiles(uploadFileList[currentCopyNum], location, function(result) {
        if (result.returnValue == -1) {
            $("#loading").hide();
            showAlert("폴더 안에 다른 빌드의 결과물이 포함되어 있거나 \n 빌드 결과물이 있는 폴더를 찾을 수 없습니다. \n 확인해 주세요.");
            return;
        } 

        if (result.returnValue == -2) {
            $("#loading").hide();
            showAlert("복제 폴더 경로가 존재하지 않습니다. : " + copyFolderPath + " \n 확인해 주세요.");
            return;
        } 
        
        //카피한 경로에서 조작
        var newRootPath = result.data.filePath;
        console.log("모든파일복사성공");
        console.log(result);
        console.log(newRootPath);
        console.log(uploadFileList[currentCopyNum]);
        
        $.post("/uploadWoonginFtpServer", { folderPath: newRootPath, filePath: uploadFileList[currentCopyNum], location: location, userName: userName, passWord: passWord, linkPath: linkPath, uploadLange: uploadLange,  htmljsOnly: htmljsOnly, isPurgePossible: isPurgePossible, isChangeFileName: isChangeFileName}, function (result) {
            //여기가 실행되어야 다음 for 문이 진행되도록 한다.
            if (result.returnValue == 1) {
                currentCopyNum ++;
                message += "\n " + result.data.flaFileName;
                uploadPath += "<br> " + result.data.uploadPath;
                uploadLinkAll += "<br> " + result.data.uploadPath;

                uploadLinkCopy += result.data.uploadPath + "\n";
                var newPurgeUrlList = [];
                purgeUrlList.forEach(purgeUrl => {
                    newPurgeUrlList.push(purgeUrl);
                });
                result.data.purgeUrlList.forEach(purgeUrl => {
                    newPurgeUrlList.push(purgeUrl);
                });
                purgeUrlList = newPurgeUrlList;
                //한번에 업로드할 경우 앞선 퍼지 내용을 미리 저장
                if (func) {
                    dummyPurgeUrlList.concat(purgeUrlList);
                    purgeUrlList = dummyPurgeUrlList;
                }
                
                uploadPathList.push(result.data.uploadPath);
                flaFileNameList.push(result.data.flaFileName);

                if (currentCopyNum < uploadFileList.length) {
                    copyAndUpload(uploadFileList, currentCopyNum, message, location, userName, passWord, linkPath, uploadPath, purgeUrlList, flaFileNameList, uploadPathList, func);
                } else {
                    if (func) {
                        console.log("링크 이름 확인-=-----------------");
                        $('#textArea').html(uploadLinkAll);
                    } else{
                        console.log("링크 이름 잘못 확인-=-----------------");
                        $('#textArea').html(uploadPath);
                    }
                    
                    $('#saveLinkPath').show();
                    $("#loading").hide();
                    console.log("최종퍼지 urlList: " + purgeUrlList);
                    //최종 퍼지 시작
                    if (isPurgePossible == "true") {
                        
                        if (func && location != "dev") {
                            func();
                        } else {
                            console.log("최종퍼지 시작");
                            showConfirm('ftp 업로드 성공. \n 이어서 퍼지를 진행하겠습니까?', function (result1) {
                                if (result1) {
                                    if (liveServerPurgePossible == "true") {
                                        setTimeout(function() {
                                        
                                            showConfirm('퍼지를 실행할 서버를 선택해주세요. \n 검증서버가 닫힌경우에만 운영서버를 선택하세요', function (result2) {
                                                if (result2) {
                                                    //검증서버로퍼지               
                                                    $("#loading").show();
                                                    $.post("/callPurgeBySelenium", { purgeUrlList: purgeUrlList, userName: userName, passWord: passWord, linkPath: linkPath, flaFileNameList: flaFileNameList, uploadPathList: uploadPathList, serverLocation: "develop"}, function (result) {
                                        
                                                        $("#loading").hide();
                                                        if (result.returnValue == 1) {
                                                            showAlert("퍼지성공");
                                                        } 
                                                    });
                                                } else {
                                                    //운영서버로 퍼지
                                                    $("#loading").show();
                                                    
                                                    $.post("/callPurgeBySelenium", { purgeUrlList: purgeUrlList, userName: userName, passWord: passWord, linkPath: linkPath, flaFileNameList: flaFileNameList, uploadPathList: uploadPathList, serverLocation: "live"}, function (result) {
                                        
                                                        $("#loading").hide();
                                                        if (result.returnValue == 1) {
                                                            showAlert("퍼지성공");
                                                        } 
                                                    });
                                                }
                                                
                                            }, "검증서버로퍼지", "운영서버로퍼지");
                                        }, 1000);
                                    } else {
                                        //검증서버로퍼지               
                                        $("#loading").show();
                                        $.post("/callPurgeBySelenium", { purgeUrlList: purgeUrlList, userName: userName, passWord: passWord, linkPath: linkPath, flaFileNameList: flaFileNameList, uploadPathList: uploadPathList, serverLocation: "develop"}, function (result) {
                            
                                            $("#loading").hide();
                                            if (result.returnValue == 1) {
                                                showAlert("퍼지성공");
                                            } 
                                        });
                                    }
                                    
                                }  else {
                                    
                                }
                            });
                        }
                    
                        
                    } else {
                        //todo: 여러개업로드시 수정
                        if (func && location != "dev") {
                            console.log("다음업로드 진행---------------------------------------");
                            func();
                        } else {
                            showAlert("웅진 ftp 업로드 완료 \n" + message);
                            $("#loading").hide();
                        }
                        
                    }
                    
                }  
            } else {
                if (result.returnValue == -1) {
                    showAlert("네트워크 상의 문제로 업로드가 되지 않았습니다. \n 처음부터 다시 진행해 주세요.");
                } else {
                    showAlert("잘못된 파일명 입니다. 파일명을 확인해 주세요.");
                }
                
                $("#loading").hide();
            }
        });
    });     
}

//웅진 상용/검증 업로드 - html 만 업로드
function uploadWoongin(isDevelop) {
    if (totalFileData.length == 0) {
        return;
    }
    //웅진업로드   
    var totalLength = totalFileData.length;
    
    var successNum = 0;
    var failNum = 0;
    var failPath = "";
    var linkPath = "https://bcms2-dev.wjthinkbig.com:8187/admin/main";
    var filePathList = [];
    var location = "";
    if (isDevelop == true) {
        location = "dev";
    } else {
        location = "live";
    }
    //상용기업로드
    if (isDevelop == false) {
        linkPath = "https://bcms2.wjthinkbig.com:8187/admin/main";
    }
    
    var userName = $("#userNameInput").val().trim();
    if (userName.trim() == "") {
        showAlert("id를 입력하세요");
        return;
    }

    localStorage.setItem("VPNuserName", userName);

    var passWord = $("#passWordInput").val().trim();;
    if (passWord.trim() == "") {
        showAlert("비밀번호를 입력하세요");
        return;
    }

    localStorage.setItem("VPNpassWord", passWord);
    localStorage.getItem('VPNpassWord');
    var timeDelay = 10;
    var newRootPathList = [];
    $("#loading").show();
    for (let i = 0; i < totalFileData.length; i++) {
        if (totalFileData[i].includes(".fla") || totalFileData[i].includes(".xfl")) {
            if (totalFileData[i].includes("RECOVER") || totalFileData[i].includes("복구")) {
                totalLength -= 1;
            } else {
                //상용기일 때는 창을 띄워놓은 상태로 하나의 업로드가 전부 완료되면 다음 업로드가 진행되도록 함(작업필요)
                setTimeout(function (fileData) {
                    return function () {
                        
                        copyAllFiles(fileData, location, function(result) {
                            if (result.returnValue == -1) {
                                $("#loading").hide();
                                showAlert("잘못된 이름을 가진 폴더가 복사되었거나 \n html, js 가 포함된 폴더가 없습니다. 확인해주세요");
                                return;
                            }
                            if (result.returnValue == -2) {
                                $("#loading").hide();
                                showAlert("복제 폴더 경로가 존재하지 않습니다. : " + copyFolderPath + " \n 확인해 주세요.");
                                return;
                            } 
                            //카피한 경로에서 조작
                            var newRootPath = result.data.filePath;
                            newRootPathList.push(newRootPath);
                            var currentTime = result.data.currentTime;
                            if (newRootPathList.length == totalLength) {
                                $.post("/setSeleniumUpload", { rootPath: newRootPath, rootPathList: newRootPathList, filePath: fileData, fileList: totalFileData, userName: userName, passWord: passWord, linkPath: linkPath, isDevelop: isDevelop, currentTime: currentTime }, function (result) {
                                    console.log("selenium 업로드 시작");
                                    console.log(result);
                                    console.log(result.data.message);
            
                                    $("#loading").hide();
                                    if (result.returnValue == -1) {
                                        showAlert("1. 학년, 학기, 단원, 목차번호 등의 데이터가 일치하지 않습니다. \n 2. cdn 페이지 캐시가 만료되었습니다.(동일한 동작 다시실행) \n 3. vpn 접속이 중지되었습니다. 확인해주세요.");
                                    } else {
                                        showConfirm('HTML 파일 업로드 성공. \n 이어서 ftp 업로드를 진행하겠습니까?', function (result) {
                                            if (result) {
                                                if (isDevelop) {
                                                    uploadWooningFTP("dev");    
                                                } else {
                                                    uploadWooningFTP("live");    
                                                }
                                                
                                            } 
                                            
                                        });
                                    }
                                });
                            }
                            
                            
                        });
                        
                    };
                }(totalFileData[i]), timeDelay);
    
                console.log("선택된 파일 근처 돌면서 html, js 파일이 동시 존재하는 폴더 찾기");
                console.log(totalFileData[i]);
                timeDelay = 10000;
            }
        }
    }
}


function copyAllFiles(filePath, location, func) {
    if (copyFolderPath.trim() == "") {
        showAlert("파일복사 할 경로를 저장하세요.");
        return;
    } 
    
    $.post("/copyAllFiles", { rootPath: rootPath, location: location, filePath: filePath, copyFolderPath: copyFolderPath, isChangeFileName: isChangeFileName }, function (result) {
                    
        console.log("파일복사 결과");
        console.log(result.data);

        func(result);
    });
}

function createFileList(data, parentElement) {
    const ul = $('<ul>');
    parentElement.empty().append(ul);

    data.forEach(item => {
        const li = $('<li>');

        if (item.isFile) {
            const checkbox = $('<input type="checkbox">');
            const fileIcon = $('<i class="far fa-file"></i>');
            li.addClass('file');
            li.append(checkbox);
            li.append(fileIcon);
            li.append(item.name);
        } else {
            const folderIcon = $('<i class="far fa-folder"></i>');
            const folder = $('<div class="folder">');
            const subFolder = $('<ul class="sub-folder">');
            folder.append(folderIcon);
            folder.append(item.name);
            folder.on('click', function (e) {
                e.stopPropagation();
                $(this).toggleClass('open');
                $(this).next('.sub-folder').toggleClass('open');
            });

            li.append(folder);
            li.append(subFolder);

            const folderList = item.files || [];
            createFileList(folderList.files, subFolder);
        }

        ul.append(li);
    });
}


function checkFiles(bool) {
    const filterText = $('#filterInput').val().toLowerCase().trim();
    var searchWords = filterText.split(' ');

    const filesToCheck = $('.file');
    const checkedFiles = new Set();

    filesToCheck.each(function () {
        const fileName = $(this).text().toLowerCase();
        const parentFolder = $(this).parents('.sub-folder');

        // 부모 폴더 이름에 "RECOVER" 또는 "복구"가 포함되어 있는지 확인
        const isParentFolderRecover = parentFolder.length > 0 && /(RECOVER|복구)/i.test(parentFolder.prev('.folder').text());

        if (!isParentFolderRecover && !fileName.includes("recover") && !fileName.includes("복구") && (fileName.includes(".fla") || fileName.includes(".xfl"))) {
            const isChecked = searchWords.some(word => fileName.includes(word));

            const checkbox = $(this).find('input[type="checkbox"]');
            if (bool) {
                checkbox.prop('checked', isChecked);

                if (isChecked) {
                    checkedFiles.add($(this));
                }
            } else {
                checkbox.prop('checked', bool);
            }
        }
    });

    // 기존에 체크된 파일들의 부모 폴더와 서브 폴더 열기 처리
    checkedFiles.forEach(function (file) {
        file.parents('.sub-folder').prev('.folder').addClass('open');
        file.parents('.sub-folder').addClass('open');
    });

    // 부모 폴더 이름에 "RECOVER" 또는 "복구"가 포함된 폴더는 체크하지 않도록 처리
    $('.sub-folder').each(function () {
        const parentFolder = $(this).prev('.folder');
        const isParentFolderRecover = /(RECOVER|복구)/i.test(parentFolder.text());

        if (isParentFolderRecover) {
            $(this).find('input[type="checkbox"]').prop('checked', false);
        }
    });

    // 체크된 파일이 없는 폴더 닫기 처리
    $('.folder').each(function () {
        const subFolder = $(this).next('.sub-folder');
        const folderFiles = subFolder.find('.file');
        const isCheckedFiles = folderFiles.filter(function () {
            return $(this).find('input[type="checkbox"]').prop('checked');
        });

        if (isCheckedFiles.length === 0) {
            $(this).removeClass('open');
            subFolder.removeClass('open');
        }
    });

    // 체크된 파일들의 경로 출력
    const checkedFilePaths = [];
    checkedFiles.forEach(function (file) {
        const filePath = getFilePath(file);
        checkedFilePaths.push(filePath);
    });

    // 출력된 경로들을 콘솔이나 다른 곳에 사용하도록 처리
    totalFileData = checkedFilePaths;
    //console.log(checkedFilePaths);
}

// 나이 및 차시범위 적용해서 검색
function searchAndCheckFiles(age, rangeStart, rangeEnd) {
    
    // $("#loading").hide();
    const filterText = $('#filterInput').val().toLowerCase().trim();
    const searchWords = filterText.split(' ');

    const filesToCheck = $('.file');
    const checkedFiles = new Set();

    filesToCheck.each(function () {
        const fileName = $(this).text().toLowerCase();
        const parentFolder = $(this).parents('.sub-folder');

        // 부모 폴더 이름에 "RECOVER" 또는 "복구"가 포함되어 있는지 확인
        const isParentFolderRecover = parentFolder.length > 0 && /(RECOVER|복구)/i.test(parentFolder.prev('.folder').text());

        if (!isParentFolderRecover) {
            // 파일 확장자가 fla 혹은 xfl인지 확인
            const isValidExtension = /(fla|xfl)$/i.test(fileName);

            // 파일명에서 나이와 차시 정보 추출
            const fileInfo = getFileInfo(fileName);
            const extractedAge = fileInfo.age;

            var matchAge = ((age === null || age === undefined || extractedAge === age) && extractedAge != null);

            if (age === null || age === undefined) {
                matchAge = ((extractedAge == 5 || extractedAge == 6 || extractedAge == 7) && extractedAge != null);
            }

            const extractedStep = fileInfo.step;
            var rangeStartTemp = rangeStart;
            var rangeEndTemp = rangeEnd;
            if ((rangeStart == null || isNaN(rangeStart)) && (rangeEnd != null || !isNaN(rangeEnd))) {
                rangeStartTemp = rangeEnd;
            }

            if ((rangeEnd == null || isNaN(rangeEnd)) && (rangeStart != null || !isNaN(rangeStart))) {
                rangeEndTemp = rangeStart;
            }

            const matchStep = ((rangeStartTemp === null || rangeEndTemp === null) || (isNaN(rangeStartTemp) || isNaN(rangeEndTemp) || (extractedStep >= rangeStartTemp && extractedStep <= rangeEndTemp)));

            if (isValidExtension && matchAge && matchStep) {
                const isChecked = searchWords.some(word => fileName.includes(word));

                const checkbox = $(this).find('input[type="checkbox"]');
                checkbox.prop('checked', isChecked);

                if (isChecked) {
                    checkedFiles.add($(this));
                }
            }
        }
    });

    
    // 기존에 체크된 파일들의 부모 폴더와 서브 폴더 열기 처리
    checkedFiles.forEach(function (file) {
        
        file.parents('.sub-folder').prev('.folder').addClass('open');
        file.parents('.sub-folder').addClass('open');
    });

    // 체크된 파일들의 경로 출력
    const checkedFilePaths = [];
    checkedFiles.forEach(function (file) {
        const filePath = getFilePath(file);
        checkedFilePaths.push(filePath);
    });

    // 출력된 경로들을 콘솔이나 다른 곳에 사용하도록 처리
    totalFileData = checkedFilePaths;
    console.log(checkedFilePaths);
}

function getFileInfo(fileName) {
    const parts = fileName.split(/[_-]/);
    let age = null;
    let step = null;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (/^\D*\d+$/.test(part)) {
            age = parseInt(part.replace(/^\D*/, ''), 10);
            step = i < parts.length - 1 ? parseInt(parts[i + 1], 10) : null;
            break;
        }
    }

    const fileInfo = {
        age: age,
        step: step,
    };

    return fileInfo;
}

function getFilePath(file) {
    const fileName = file.text().trim();
    const parentFolder = file.closest('.sub-folder');
    if (parentFolder.length) {
        const parentFolderPath = getFilePath(parentFolder.prev('.folder'));
        return `${parentFolderPath}/${fileName}`;
    }
    return fileName;
}

function getFileList(rootPath, folderName = "") {
    $("#loading").show();

    $.post("/getFileList", { folderPath: rootPath, folderName: folderName }, function (result) {
        console.log("내부 모든 파일/폴더 검사");
        console.log(result)
        $("#loading").hide();
        if (result.returnValue == 1) {
            var data = result.data.fileList.files;
            // totalFileData = data;
            const fileExplorer = $('#fileExplorer');
            createFileList(data, fileExplorer);
            rootPath = rootPath;

        } else {
            showAlert("올바른 경로가 아닙니다. 경로를 다시 입력하세요");
        }
    });
}

function getFileListAfterDeleteRecoverFolder(rootPath, folderName = "") {
    $("#loading").show();

    $.post("/deleteRecoverFolder", { folderPath: rootPath, folderName: folderName }, function (result) {
        console.log("내부 모든 파일/폴더 검사");
        console.log(result)

        $("#loading").hide();
        if (result.returnValue == 1) {
            var data = result.data.fileList.files;
            // totalFileData = data;
            const fileExplorer = $('#fileExplorer');
            createFileList(data, fileExplorer);
            rootPath = rootPath;
        } else {
            showAlert("올바른 경로가 아니거나 \n 원본 파일이 저장되지 않아 복구파일을 삭제할 수 없습니다.");
        }
    });
}

//원하는 파일 삭제
function deleteFile(zipForderPath, jsonFileName, func) {
    $.post("/deleteFile", { zipForderPath: zipForderPath, jsonFileName: jsonFileName }, function (result) {
        console.log(result);
        if (result.returnValue == 1) {
            console.log("파일삭제 완료");
            func();
        } else {
            console.log("파일삭제 실패");
            func();
        }

    });
}

//파일복사
function copyFile(zipForderPath, jsonFileName, func) {
    $.post("/copyFile", { zipForderPath: zipForderPath, jsonFileName: jsonFileName }, function (result) {
        if (result.returnValue == 1) {
            console.log("파일복사 완료");
            func();
        } else {
            console.log("파일복사 실패");
            func();
        }

    });
}

function uploadFtpServer(folderPath) {
    var ipAdress = null;
    if (!isPossiblePurge) {
        ipAdress = otherServerIpAdress;
    }
    $("#loading").show();
    $.post("/uploadFtpServer", { folderPath: folderPath, isPossiblePurge: isPossiblePurge, ipAdressforPurge: ipAdress }, function (result) {
        console.log("ftp업로드 시작");
        console.log(result);

        $("#loading").hide();
        showAlert(result.data.message);
    });
}

function checkFileAndOpen(rootPath, filePath) {
    var formData = new FormData();

    // formData.append('img', file);
    // formData.append('file', file);
    $("#loading").show();

    $.post("/checkFileAndOpen", { rootPath: rootPath, filePath: filePath }, function (result) {
        
        $("#loading").hide();
        if (result.data.isFileOpen) {
            console.log(result);
            console.log("파일열기성공함");
            console.log(result.data.isFileOpen);
            // buildFile(file);
        }
    });
}

function getZip(rootPath, filePath, zipForderPath, isEbook, func) {

    var jsonFileName = null;
    var age = "";
    var consoleLog = "";
    var addedCount = 0;

    if (isEbook) {
        jsonFileName = ebookJsonFileName;
    }
    $.post("/getZip", { rootPath: rootPath, filePath: filePath, zipForderPath: zipForderPath, jsonFileName: jsonFileName, isEbook: isEbook }, function (result) {
        var zipPath = result.data.zipPath;

        if (isEbook) {
            age = result.data.age;
            consoleLog = result.data.consoleLog;
            addedCount = result.data.addedCount;
        }

        if (result.returnValue == 1) {
            console.log("압축성공: " + zipPath);
            func(1, result.data.zipPath, age, consoleLog, addedCount);
        } else if (result.returnValue == -1) {
            console.log("압축실패: " + zipPath);
            func(-1, result.data.zipPath, age, consoleLog, addedCount);
        } else {
            console.log("압축성공: " + zipPath + ", 그림책탐험대 테스트용 json 첨부 오류");
            func(0, result.data.zipPath, age, consoleLog, addedCount);
        }
    });
}

function getAgeFolderZip(zipForderPath, func) {

    $.post("/getAgeFolderZip", { zipForderPath: zipForderPath }, function (result) {

        if (result.returnValue == 1) {
            console.log("압축성공: " + zipForderPath);
            func(true, result.data.zipPath);
        } else {
            console.log("압축실패");
            func(false, result.data.zipPath);
        }
    });
}

function uploadNas(rootPath, filePath, morphId, func) {
    $.post("/uploadNas", { rootPath: rootPath, filePath: filePath, morphId: morphId }, function (result) {
        console.log(result)
        if (result.returnValue == 1) {
            var linkPath = result.data.linkPath;
            console.log("링크추출성공: " + linkPath);
            func(linkPath);
        } else {
            var linkPath = result.data.linkPath;
            console.log("링크추출실패: " + linkPath);
            func(linkPath);
        }
    });
}

function updateExcel(func) {
    $.post("/updateExcelCode", {}, function (result) {
        if (result.returnValue == 1) {
            console.log("업데이트성공");
            func();
        } else {
            console.log("업데이트실패");
            func();
            showAlert("압축에 실패하였습니다.");
        }
    });
}

function getStepCode(filePath) {
    $.post("/getStepCode", { fileName: filePath }, function (result) {

    });
}

function openFiles(animateCLIPath, rootPath, filePath, func) {
    var formData = new FormData();

    // formData.append('img', file);
    // formData.append('file', file);

    $.post("/openFiles", { animateCLIPath: animateCLIPath, rootPath: rootPath, filePath: filePath }, function (result) {
        if (result.returnValue == 0) {
            console.log("오픈실패");
            console.log(result.data.message);
            console.log(result.data.filePath);
        } else {
            console.log("오픈성공");
            console.log(result.data.message);
            console.log(result.data.filePath);
            func();
        }

        console.log(result);
    });
}

function buildFile(isAll) {
    var formData = new FormData();

    // formData.append('img', file);
    // formData.append('file', file);

    $.post("/buildFile", { isAll: isAll }, function (result) {
        if (result.returnValue == 0) {
            console.log("빌드실패");
            console.log(result.data.message);
            console.log(result.data.filePath);
        } else {
            console.log("빌드시작");
        }

        console.log(result);
    });
}

function buildFileTest(rootPath, filePath) {

    $.post("/buildTest", { rootPath: rootPath, filePath: filePath }, function (result) {
        // if (result.returnValue == 0) {
        //     console.log("빌드실패");
        //     console.log(result.data.message);
        //     console.log(result.data.filePath);
        // } else {
        //     console.log("빌드시작");
        // }

        // console.log(result);
    });
}

function xmlParse(rootPath, filePath) {
    var formData = new FormData();

    // formData.append('img', file);
    // formData.append('file', file);

    $.post("/xmlParse", { rootPath: rootPath, filePath: filePath }, function (result) {
        if (result.returnValue == 0) {
            console.log("파싱실패");
            console.log(result.data.message);
            console.log(result.data.filePath);
        } else {
            console.log("파싱성공");
            console.log(result.data.message);
            console.log(result.data.filePath);
        }

        console.log(result);
    });
}


function setFileName(age, number, step, extension) {
    var fileName = "Y" + age + "_" + number + "_" + step + "." + extension;
    return fileName
}

function appendSlash(text) {
    if (!text.endsWith("/")) {
        return text + "/";
    }
    return text;
}

function isValidPath(path) {
    // 경로의 형식을 정의합니다. 여기에서는 슬래시(/)를 기준으로 경로가 구분되는 것을 가정합니다.
    const pathPattern = /^\/?([\w-]+\/)*[\w-]+\/?$/;

    // 입력된 경로가 형식과 일치하는지 확인합니다.
    return pathPattern.test(path);
}

function showAlert(message) {
    // 줄바꿈을 추가한 메시지를 생성합니다.
    const formattedMessage = message.replace(/\n/g, '<br>');

    $('#customAlertMessage').html(formattedMessage); // innerHTML을 사용하여 HTML 태그를 적용합니다.
    $('#customAlertModal').modal('show');
}

function showConfirm(message, callback, okMessage="OK", noMessage="Cancel") {
    
    // 줄바꿈을 추가한 메시지를 생성합니다.
    const formattedMessage = message.replace(/\n/g, '<br>');
    $('#customConfirmNO').html(noMessage);
    $('#customConfirmOK').html(okMessage);
    $('#customConfirmMessage').html(formattedMessage); // innerHTML을 사용하여 HTML 태그를 적용합니다.
    $('#customConfirmModal').modal('show');

    $('#customConfirmOK').off('click').on('click', function () {
        callback(true);
        $('#customConfirmModal').modal('hide');
    });

    $('#customConfirmNO').off('click').on('click', function () {
        callback(false);
        $('#customConfirmModal').modal('hide');
    });
}

function isValidIpAddress(ipAddress) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ipAddress);
}

// 이전 경로를 가져오고, 존재하면 목록에 추가합니다.
function loadPreviousPaths() {
    const previousPaths = JSON.parse(localStorage.getItem('previousPaths')) || [];

    // 이전 경로를 저장할 datalist 엘리먼트를 가져옵니다.
    const dataList = document.getElementById('pathList');
    dataList.innerHTML = ''; // 기존 목록을 지웁니다.

    previousPaths.forEach((path) => {
        // 이전 경로를 모두 추가합니다.
        const option = document.createElement('option');
        option.value = path;
        dataList.appendChild(option);
    });

    // 이전 경로가 하나도 없으면 안내 메시지를 보여줍니다.
    if (previousPaths.length === 0) {
        const option = document.createElement('option');
        option.value = '이전 경로가 없습니다.';
        dataList.appendChild(option);
    }
}

// 이전 경로를 저장합니다.
function savePath() {
    const inputPath = document.getElementById('absolutePath').value;
    let previousPaths = JSON.parse(localStorage.getItem('previousPaths')) || [];
        if (inputPath) {
            // 중복 경로를 제거하고, 새 경로를 배열 앞에 추가합니다.
            previousPaths = [inputPath, ...previousPaths.filter(path => path !== inputPath)];
        }
        
        // 최대 5개의 경로만 유지하도록 설정합니다.
        if (previousPaths.length > 8) {
            previousPaths.pop();
        }
        
        localStorage.setItem('previousPaths', JSON.stringify(previousPaths));
        
        // 경로를 입력란에 설정합니다.
        document.getElementById('absolutePath').value = inputPath;
        
        // 검색 목록을 업데이트합니다.
        updatePathList(previousPaths);
        
        // 이전 경로를 업데이트합니다.
        loadPreviousPaths();
}

// 검색 목록을 업데이트하는 함수
function updatePathList(paths) {
    const datalist = document.getElementById('pathList');
    datalist.innerHTML = ''; // 이전 목록을 지웁니다.

    paths.forEach(path => {
        const option = document.createElement('option');
        option.value = path;
        datalist.appendChild(option);
    });
}


//프로젝트 선택
function selectCompany(company) {
    if (company === 'e') {
        // 엘리하이 버튼이 클릭된 경우의 동작
        console.log('엘리하이가 선택되었습니다.');
        currentProject = "e";
        $("#eliHighButton").css({"background-color": "yellow", "color" : "black"});
        $("#woongjinButton").css({"background-color": "gray", "color" : "white"});
        localStorage.setItem("currentProject", currentProject);

        $("#setPurge").show();
        $(".zipArea").show();
        $("#nasLinkArea").show();
        $("#fileSearchArea2").show();
        $("#updateExcel").show();
        
        $(".woonginUploadArea").hide();
        $(".file-explorer-wrapper").css({"height" : "calc(100vh - 410px)"})

    } else if (company === 'w') {
        // 웅진 버튼이 클릭된 경우의 동작
        console.log('웅진이 선택되었습니다.');
        currentProject = "w";
        $("#eliHighButton").css({"background-color": "gray", "color" : "white"});
        $("#woongjinButton").css({"background-color": "yellow", "color" : "black"});
        localStorage.setItem("currentProject", currentProject);

        $("#setPurge").hide();
        $(".zipArea").hide();
        //$("#nasLinkArea").hide();
        $("#fileSearchArea2").hide();
        $("#updateExcel").hide();
        $(".woonginUploadArea").show();
        $(".file-explorer-wrapper").css({"height" : "calc(100vh - 410px)"})
    }
}




