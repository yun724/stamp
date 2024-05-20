var domain = "http://192.168.50.65:4430/"
var homeUrl = domain;
var stampState = localStorage.getItem("stampStatus");
var isLogined = localStorage.getItem('isLogined');
var starImage = "<img src='img/img_star.png' style='width: 25px; height: 30px;' alt='Star Image'>";

var stampArray = [];


$(document).ready(function () {
    init();
});
var stars = "{_1: 'y', _2: 'y', _3: 'y'}"
function init() {
    loadLanguage(getStorageItem("language"));    
    getStampArray();
}

function getStorageItem(str) {
    if (localStorage.getItem(str)) {
        return localStorage.getItem(str);
    } 

    return null;
}

function resetStamp() {
    localStorage.removeItem("stampArray");
}

//이메일 형식 검사
function isValidEmail(email) {
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
}

//페이지 이동
function movePage(string) {
    //나중에 메인도메인으로 대체
    window.location.href = homeUrl + string;
}

// Event listener for language change
document.addEventListener('DOMContentLoaded', () => {
    if(!document.getElementById('languageSelect')) {
        return;
    }
    
    document.getElementById('languageSelect').addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        console.log("언어변환감지");
        console.log(selectedLang);
        localStorage.setItem('language', selectedLang);
        
        loadLanguage(selectedLang);
        
    });

    document.getElementById('languageSelect').value = getStorageItem("language");

    // Load the default language
    //loadLanguage('en');
});

function loadLanguage(lang) {
    if (!lang) {
        lang = "en";
    }

    $('[data-i18n]').each(function() {
        const key = $(this).data('i18n');
        $(this).html(translations[lang][key]);
        //로컬스토리지를 사용해야 하는 경우 별도로 변경?
        $("#topArea_titleArea_contents").html(stampStatus[Number(localStorage.getItem("stampStatus"))][localStorage.getItem("language")]);
    });

    
}

function parsingStrToJson(str) {
    // JSON 형식으로 변환하기 위해 문자열을 수정
    let jsonString = str
    .replace(/'/g, '"')       // 작은따옴표를 큰따옴표로 변경
    .replace(/([a-zA-Z0-9_]+):/g, '"$1":');  // 키를 큰따옴표로 감쌈

    // 문자열을 JSON 객체로 변환
    let jsonObject = JSON.parse(jsonString);
    return jsonObject;
}

function setStamp(idx) {
    stampArray = getStampArray();
    stampArray[idx] = true;
    localStorage.setItem("stampArray",  JSON.stringify(stampArray));
}

function getStampArray() {
    if (localStorage.getItem("stampArray")) {
        return JSON.parse(localStorage.getItem("stampArray"));
    } else{
        stampArray = [false, false, false];
        localStorage.setItem("stampArray",  JSON.stringify(stampArray));
    }
}
