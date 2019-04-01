
$(document).ready(function () {
        $('.modal').modal();
  function checkIfSignIn(){
    $.get('/signedInStatus',function(data){
      sessionStorage.setItem("signedIn", data.status)
      sessionStorage.setItem("name", data.name);
    });
  }

  $(function () {
      $('#background').width($(window).width()).height($(window).height()-64)
      $('.parallax').parallax();
  });
  
  $(window).resize(function()
  {
      $('#background').width($(window).width()).height($(window).height()-64)
  });
});