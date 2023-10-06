

$("#categoriesBtn").click(() => {
    $("#categories").slideToggle();
    // $("#categoriesBtn i").toggleClass("fa-solid fa-square-caret-up").toggleClass("fa-solid fa-square-caret-down");
    $("#categoriesBtn div").toggleClass("uponIcon").toggleClass("downIcon");
})

$("#tagsBtn").click(() => {
    $("#tags").slideToggle();
    // $("#tagsBtn i").toggleClass("fa-solid fa-square-caret-up").toggleClass("fa-solid fa-square-caret-down");
    $("#tagsBtn div").toggleClass("uponIcon").toggleClass("downIcon");
})

$("#authorsBtn").click(() => {
    $("#authors").slideToggle();
    // $("#authorsBtn i").toggleClass("fa-solid fa-square-caret-up").toggleClass("fa-solid fa-square-caret-down");
    $("#authorsBtn div").toggleClass("uponIcon").toggleClass("downIcon");
})

$(".input-group-input").addClass("form-control");
$(".input-group-submit").addClass("btn btn-secondary");


$('#barBtn').click(() => {
    $(".leftAside").slideToggle();
})

$('.mobileBtn').click(()=>{
    $("#tocModal").fadeToggle();
})

function tocModalClose(){
    $("#tocModal").fadeOut();
}

$('#tocModal a').click(()=>{
    tocModalClose();
})

// 讓 Google Search 外開搜尋
$(".input-group>button")[0].formTarget = '_blank';

// 頁角里程碑
let DateNow = new Date();
let DateDiff = function (sDate1, sDate2) {
    var oDate1 = new Date(sDate1);
    var oDate2 = new Date(sDate2);
    var iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); // 把相差的毫秒數轉換為天數
    return iDays;
};

// <span class="material-symbols-outlined">sprint</span>
// <span class="material-symbols-outlined">transfer_within_a_station</span>

$("#milestone").html(`
<span>Copyright © 2023-${DateNow.getFullYear()} UrWeb. All rights reserved.</span><br>
<span>This site is in orbit around internet ${DateDiff("2023/1/1",Date.now())} days.</span>
<div class="sprintIcon"></div><br>
<div class="withinStationIcon"></div>
<span class="waline-pageview-count" data-path="/"></span>
people have witnessed it all. `);

let addTotalViews = fetch("https://waline-urweb.vercel.app/article?lang=zh-TW", {
    "headers": {
      "accept": "*/*",
      "accept-language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json",
      "pragma": "no-cache",
      "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site"
    },
    "referrer": "https://urwebapp.github.io/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "{\"path\":\"/\",\"type\":\"time\",\"action\":\"inc\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
});

function responsiveIframe() {
    let els = parent.document.getElementsByClassName("responsiveIframe");
    Array.prototype.forEach.call(els, (el)=> { 
        console.log(el.parentElement.offsetHeight )
        el.height = el.parentElement.offsetHeight;
    });
}