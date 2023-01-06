

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