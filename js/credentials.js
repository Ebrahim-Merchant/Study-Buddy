 // Initialize Firebase
        var config = {
          apiKey: "AIzaSyDCb-dS1ulUx1jiatzyKViayr5uVe1EAfU",
          authDomain: "studentshare-d1f58.firebaseapp.com",
          databaseURL: "https://studentshare-d1f58.firebaseio.com",
          projectId: "studentshare-d1f58",
          storageBucket: "studentshare-d1f58.appspot.com",
          messagingSenderId: "672869013696"
        };
        firebase.initializeApp(config);
        var auth = firebase.auth()
        var database = firebase.database();
