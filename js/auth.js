/**
 * Author: Ebrahim Merchant
 * This is a authentication controller
 * It handles logging in users
 * As well as signing up new users 
 */
$(document).ready(function () {

    //OnClick Listener for on click Login
    $(".modal").on('click', '#loginBtn', function () {

        //Gets info from the view
        email = $("#emailLogin").val()
        password = $("#passwordLogin").val()

        if (email == "" && password == "") {
            $("#error").text("Please enter username and password")
        }
        else {
            //Sends data to firebase to authentication
            auth.signInWithEmailAndPassword(email, password)
            .then(function(){
                $(".modal").modal("close");
            })            
            .catch(function (error) {
                $("#error").text(error.message);
            });
        }
    });


    //OnClick Listener for on Sign Up
    $(".modal").on('click', '#signUpBtn', function () {

        //Gets info from the view
        var email = $("#emailSignUp").val()
        var password = $("#passwordSignUp").val()
        var first_name = $("#first_name_signUp").val()
        var last_name = $("#last_name_signUp").val()
        var universityName = $("#university").val()
        var error = $("errorSignUp")


        //Checks if anything is new
        if (email == "" && password == "") {
            $("#errorSignUp").text("Please enter username and password")
        } else if (first_name == "" && last_name == "" && universityName == "") {
            $("#errorSignUp").text("Please enter your name and university name")
        }
        else {
            //Creates a new user with email and password
            auth.createUserWithEmailAndPassword(email, password)
                .catch(function (error) {
                    // Handle Errors here
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    if (errorCode == 'auth/weak-password') {
                        error.text("The password is too weak")
                    } else {
                        error.text(errorMessage)
                    }
                })
                .then(function (user) {
                    //Gets created user
                    if (user) {
                        //Adds additional info into the database
                        var current_user = user.user
                        current_user.updateProfile({
                            "displayName": first_name + " " + last_name
                        });
                        writeUserData(current_user.uid, universityName);
                        $(".modal").modal("close");
                    }
                });
        }
    });



    //Adds University name
    function writeUserData(userId, universityName) {
        database.ref('users/' + userId).set({
            University: universityName
        });
    }
    

    //Event listener for when user state changes. It adds them to the sesssion
    auth.onAuthStateChanged(function (user) {
        if (user) {
            sessionStorage.setItem("displayName", user.displayName)
            sessionStorage.setItem("email", user.email)
            sessionStorage.setItem("emailVerified", user.emailVerified)
            sessionStorage.setItem("photoURL", user.photoURL)
            sessionStorage.setItem("uid", user.uid)
            sessionStorage.setItem("providerData", user.providerData)

        } else {
            sessionStorage.clear();
        }
    });

})