

$("#categoriesBtn").click(()=>{
    $("#categories").slideToggle();
    $("#categoriesBtn i").toggleClass("fa-solid fa-square-caret-up").toggleClass("fa-solid fa-square-caret-down");
})

$("#tagsBtn").click(()=>{
    $("#tags").slideToggle();
    $("#tagsBtn i").toggleClass("fa-solid fa-square-caret-up").toggleClass("fa-solid fa-square-caret-down");
})

$(".input-group-input").addClass("form-control");
$(".input-group-submit").addClass("btn btn-secondary");