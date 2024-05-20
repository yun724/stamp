
$(document).ready(function () {

    if (localStorage.getItem('isLogined') == "y") {
        console.log("이메일을 통한 로그인 상태");
        //movePage("stamp");
    }
    
    getTestDBResult();
    

    setTimeout(function() {
        // console.log("aaa");
        // $("#middleArea").css({
        //     "bottom": "300px"
        // });

        $("#topArea_titleArea_contents").text(
            `Congraturations!
            You may now enterdsSS
            the lucky draw
            `
        );

        setTimeout(function() {
            
        }, 2000);


    }, 3000);
    
    //이베일 등록 버튼
    $('#setEmail').click(function() {
        // movePage("agreement");
        // return;
        var email = $('.email-input').val().trim();
        console.log(email)
        if (isValidEmail(email)) {
            setEmail(email);
        } else {
            alert('Invalid email address.');
        }
        
    });
});



function getTestDBResult() {
    //$("#loading").show();

    $.post("/getDatabaseInfo", { }, function (result) {
        console.log(result)
        //$("#loading").hide();
        if (result.returnValue == 1) {
            

        } else {
            
        }
    });
}

function setEmail(str) {
    var username = "jjhomeyun@gmail.com11";
    $.post("/setDatabaseInfo", { username: str }, function (result) {
        console.log(result);
        //$("#loading").hide();
        if (result.returnValue == 1) {
            console.log("이메일등록 성공") // 약관동의 페이지로 이동
            setTimeout(function() {
                movePage("agreement");
            }, 500);

        } else {
            console.log("중복이메일 존재");
            alert('same Email already exist');
            movePage("stamp");
        }
    });
}