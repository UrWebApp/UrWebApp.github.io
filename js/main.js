

$("#categoriesBtn").click(() => {
    $("#categories").slideToggle();
    $("#categoriesBtn i").toggleClass("fa-solid fa-square-caret-up").toggleClass("fa-solid fa-square-caret-down");
})

$("#tagsBtn").click(() => {
    $("#tags").slideToggle();
    $("#tagsBtn i").toggleClass("fa-solid fa-square-caret-up").toggleClass("fa-solid fa-square-caret-down");
})

$(".input-group-input").addClass("form-control");
$(".input-group-submit").addClass("btn btn-secondary");


$('#barBtn').click(() => {
    $(".leftAside").slideToggle();
})

// 讓 Google Search 外開搜尋，並且搜尋後清空搜尋欄
$(".input-group>button")[0].formTarget = '_blank';
$(".input-group>button").click(() => { $(".input-group-input")[0].value = '' })

// 頁角里程碑
let DateNow = new Date();
let DateDiff = function (sDate1, sDate2) {
    var oDate1 = new Date(sDate1);
    var oDate2 = new Date(sDate2);
    var iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); // 把相差的毫秒數轉換為天數
    return iDays;
};

$("#milestone").html(`<span>Copyright © 2023-${DateNow.getFullYear()} UrWeb. All rights reserved.</span><br><span>This site is in orbit around internet ${DateDiff("2023/1/1",Date.now())} days.</span>`);