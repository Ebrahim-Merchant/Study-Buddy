
$(document).ready(function () {

  function checkIfSignIn(){
    $.get('/signedInStatus',function(data){
      sessionStorage.setItem("signedIn", data.status)
      sessionStorage.setItem("name", data.name);
    });
  }

  $(function () {
      $('#index-banner').width($(window).width()).height($(window).height()-64)
      $('.parallax').parallax();
  });
  
  $(window).resize(function()
  {
      $('#index-banner').width($(window).width()).height($(window).height()-64)
  });
});