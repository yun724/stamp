$(document).ready(function() {
    // Submit 버튼 클릭 시 동의 여부 확인
    $('#agreeButton').click(function() {
        alert('Thank you for agreeing to the terms and conditions.');
        // 여기에 동의 처리 로직 추가
        localStorage.setItem("isLogined", "y");
        setTimeout(function() {
            window.location.href = homeUrl + "stamp";
        }, 1000);
        
    });
});