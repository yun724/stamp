
$(document).ready(function () {
    // $('#openCamera').on('click', function() {
    //     $('#cameraInput').click();
    // });

    // $('#cameraInput').on('change', function(event) {
    //     if (event.target.files.length > 0) {
    //         var file = event.target.files[0];
    //         console.log('File selected:', file);
    //     }
    // });

    // function onScanSuccess(decodedText, decodedResult) {
    //     // Handle the result here
    //     console.log(`Code matched = ${decodedText}`, decodedResult);
    //     $('#qr-reader-results').text(`QR Code: ${decodedText}`);
    // }

    // function onScanFailure(error) {
    //     // Handle scan failure, usually better to ignore and keep scanning.
    //     console.warn(`Code scan error = ${error}`);
    // }

    // let html5QrcodeScanner = new Html5QrcodeScanner(
    //     "qr-reader", { fps: 10, qrbox: 250 });
    // html5QrcodeScanner.render(onScanSuccess, onScanFailure);



    if (localStorage.getItem('isLogined') == "y") {
        console.log("이메일을 통한 로그인 상태");
    }
    
    // 현재 페이지의 URL에서 매개변수 추출
    const urlParams = new URLSearchParams(window.location.search);
    const stampValue = urlParams.get('stamp');
    
    if (Number(stampValue) >= 3) {

    }
    var reloadNum = 0;
    if (stampValue) {
        setStamp(Number(stampValue));
        setTimeout(function() {
            movePage("stamp");
        }, 100);
    }
    var isResetPossible = false;
    setTimeout(function() {
        var currentStampStatus = getStampArray();
        var stampCount = 0;
        
        for (var i = 0; i < currentStampStatus.length; i++) {
            //해당 도장이 채워져 있다면
            if (currentStampStatus[i]) {
                stampCount ++;
                $(".section:nth-child(" + (i + 1) + ") .content img").attr("src", "img/stamp_on.png");
                $(".section:nth-child(" + (i + 1) + ") span").css({"color": "darkslateblue"});
            } else {
                $(".section:nth-child(" + (i + 1) + ") .content img").attr("src", "img/stamp_off.png");
                $(".section:nth-child(" + (i + 1) + ") span").css({"color": "lightgray"});
            }
        }
        localStorage.setItem("stampStatus", stampCount);

        $("#stampClearButton").text(stampCount + "/3");
        $("#topArea_titleArea_contents").html(stampStatus[Number(localStorage.getItem("stampStatus"))][localStorage.getItem("language")]);

        if (stampCount == 3) {
            isResetPossible = true;
            $("#stampClearButton").css({
                "background-color": "skyblue",
                "color": "black"
            });
        }
    }, 50);

    $("#stampClearButton").click(function() {
        
        if(!isResetPossible) {
            movePage("stamp");
            return;
        }
        
        resetStamp();
        setTimeout(function() {
            movePage("stamp");
            console.log("룰렛 돌림 및 초기화");
        }, 200);
    })
});


