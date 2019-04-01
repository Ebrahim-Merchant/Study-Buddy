$(document).ready(function () {
    $('#content').load("html/welcome_card.html")


    $("#content").on('click', '#signUp',function () {
        $(".modal").load("html/modals/sign_up_modal.html").modal();
        $(".modal").modal('open');
    });

       $("#content").on('click', '#login',function () {
        $(".modal").load("html/modals/login_modal.html").modal();
        $(".modal").modal('open');
    })
})