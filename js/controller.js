
$(document).ready(function () {
    $('#content').load("html/welcome_card.html")


    $("#content").on('click', '#signUp',function () {
        $(".modal").load("html/modals/sign_up_modal.html").modal();
        $(".modal").modal('open');
            jQuery("input.autocomplete").autocomplete({
                data: {"OnTechU": ""}
            });
    });

    $("#content").on('click', '#login',function () {
        $(".modal").load("html/modals/login_modal.html").modal();
        $(".modal").modal('open');
    })



        $.get("http://universities.hipolabs.com/search", function (data) {
            console.log(data)
            $("input.autocomplete").autocomplete("updateData", data);


        })


})