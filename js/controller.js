/**
 * Author: Ebrahim Merchant
 * This is a controller to load different views
 */

$(document).ready(function () {

    /**
     * Login status
     */

    //Check if user is current logged in 
    if (auth.currentUser == null) {
        notLoggedIn()
    }
    else {
        loggedIn()
    }

    //OnStateListener for when Auth status changes
    auth.onAuthStateChanged(function (user) {
        if (user) {
            loggedIn()
        }
        else {
            notLoggedIn()
        }
    });

    //If logged in then show them a view to join or create a new room
    function loggedIn() {
        $('#content').load("html/join.html")
        $('.tooltipped').tooltip();
        $("#signInNavBar").empty()
        $("#signInNavBar").append(
            "<li><a class ='waves-effect waves-light' id='logout' href='#'>Logout</a></li>")
    }

    //If not logged in then show them a view to sign up or login
    function notLoggedIn() {
        $('#content').load("html/welcome_card.html")
        $("#signInNavBar").empty()
        $("#signInNavBar").append(
            "<li><a class='waves-effect waves-light red' id='signUp' href='#'>Sign Up</a></li>" +
            "<li><a class ='waves-effect waves-light' id='login' href='#'>Login</a></li>")
    }


    /**
     * Login and Signup - Section
     */

    //OnClickListener if logout is clicked
    $("#signInNavBar").on('click', '#logout', function () {
        auth.signOut()
    });

    //OnClickListener if signup is clicked
    //Modal
    $("#content").on('click', '#signUp', function () {
        $(".modal").empty();
        $(".modal").load("html/modals/sign_up_modal.html").modal();
        $(".modal").modal('open'); 
    });

    //NavBAr
    $("#signInNavBar").on('click', '#signUp', function () {
        $(".modal").empty();
        $(".modal").load("html/modals/sign_up_modal.html").modal();
        $(".modal").modal('open');

    });

    /**
     * OnClickListener if login is clicked
     */
    //Modal
    $("#content").on('click', '#login', function () {
        $(".modal").empty();
        $(".modal").load("html/modals/login_modal.html").modal();
        $(".modal").modal('open');
    })
    //NavBar
    $("#signInNavBar").on('click', '#login', function () {
        $(".modal").empty();
        $(".modal").load("html/modals/login_modal.html").modal();
        $(".modal").modal('open');
    })


    
    /**
     * Join and Create Modal - Section
     */

    //OnClickListener for joining room
    $("#content").on('click', '#joinRoom', function () {
        $(".modal").empty();
        $(".modal").load("html/modals/join_room_modal.html").modal();
        $.get('/getRooms').then(function(data){
            for(var i = 0; i<data.length;i++){
                $("#rooms").append('<a href="chat_room/'+data[i]["key"]+'" class="collection-item">'+data[i]["Topic"]+"</a>")
            }
        })
        $(".modal").modal('open');
    });


    //OnClickListener for creating a room loads create room modal
    $("#content").on('click', '#makeRoom', function () {
        $(".modal").empty();
        $(".modal").load("html/modals/create_room_modal.html").modal();
        $(".modal").modal('open');
    });

    //Adds bullet points when enter is pressed
    $('.modal').on('keyup', "#textarea", function (e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            var current_topic = $(this).val()
            if (current_topic.substring(0, 1) != "•") {
                current_topic = "• " + current_topic
            }
            $(this).val(current_topic + "• ");
        }
    });

    //OnClickListener when submitting a creating a room
    $(".modal").on('click', "#createGroup", function () {
        var topic_points = $("#textarea").val()
        topic_points = topic_points.replace("• ","");
        topic_points = topic_points.split("\n• ");
        console.log(topic_points)
        var topic = $("#topic").val()
        var roomId = push_data_firebase(topic, topic_points);
        window.location.replace(window.location.origin + "/chat_room/"+roomId)
        // createGroup(roomId);
    });

    //Pushing topics to firebase
    function push_data_firebase(topic, topic_points) {
        var newRoomId = database.ref('activeRooms').push().key;
        database.ref('activeRooms/' + newRoomId).set({
            "Topic": topic,
            "Topic_Point": topic_points
        });
        return newRoomId;
    }
})