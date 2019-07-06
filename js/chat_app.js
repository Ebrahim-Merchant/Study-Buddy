/**
 * Author: Ebrahim Merchant
 * Handles the chat view
 */

$(document).ready(function () {

    //Init variables
    $('select').formSelect();
    var senderId = ""
    var question = ""
    var qType = ""
    var currentUser = sessionStorage.getItem("displayName");
    var id = sessionStorage.getItem("uid");


    //Sockets IO connect to the server
    var socket = io.connect(window.location.origin + "/chat");
    socket.on('connect', function () {
        console.log("connected");
        sessionStorage.getItem("currentRoom")
        socket.emit('join', { "displayName": currentUser, "userId": id });
    });


    $('select').on('change', function () {
        if (this.value == 1) {
            addTrueFalseForm();
        }
        else if (this.value == 2) {
            addMQ();
        }
    });


    /**
    * Sockets Event Listener
    */

    //EventListener for when someone joins room
    socket.on('joined_room', function (data) {
        //Adds it the chat
        $('#chat').append(addJoinedChat(data.msg));
    });


    //EventListener for when someone leaves
    socket.on('left', function (data) {
        $('#chat').append(addJoinedChat(data.msg));
    });

    //When someone sends message
    socket.on('message', function (data) {
        if (data["userId"] == auth.currentUser.uid) {
            //if current user adds it to as personal message
            $('#chat').append(addPersonalMessage(data["msg"]))
            $('#chat').scrollTop($('#chat')[0].scrollHeight);
        }
        else {
            //if other user adds a normal message
            $('#chat').append(addMessage(data["msg"], data["name"]))
            $('#chat').scrollTop($('#chat')[0].scrollHeight);
        }
    });

    //EventListener for when someone sends a questions
    socket.on('question', function (data) {
        if (data["senderId"] != id) {   //If its not original sender displays question
            senderId = data["senderId"];
            question = data["question"];
            $('#chat').append(
                addSendQuestion(
                    data["question"],
                    data["options"],
                    data["qType"],
                    data["answer"],
                    data["senderId"]
                )
            )
            $('#chat').scrollTop($('#chat')[0].scrollHeight);
        }
    })

    //Gets result for question
    socket.on('question_result', function (data) {
        if (data["origin"] == id) {   //Checks if result is returned and displays to sender
            $("#answers").append(
                "<li class='collection-item'><h6>"
                + data["displayName"]
                + '</h6>' + data["question"]
                + "<br> Answer:"
                + data["answer"] + "</l1>"
            );
        }
    })

    /**
    * jQuery controller handling view clicks
    */
    //Get topic data as soon as the page is loaded
    $.get("/getTopics", function (data) {
        for (var i = 0; i < data["Topic_Point"].length; i++) {
            $("#topicDetails").append("<a href='#' class='collection-item'>"
                + data["Topic_Point"][i]
                + "</a>");
        }
        $("#topic_heading").append(data["Topic"])
    });


    //Question mode button handler
    $("#startQuestion").click(function () {
        $("#startQuestionMode").modal();
        $("#startQuestionMode").modal("open");
    })

    //Leave button handler
    $("#leaveRoom").click(function () {
        socket.emit('leave', { "displayName": currentUser });
        window.location.replace(window.location.origin);
    });

    //If enter is pressed sends message
    $('#message').keypress(function (e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            sendMessage()
        }
    });

    function sendMessage(){
        text = $('#message').val();
            $('#message').val('');
            socket.emit('send', {
                "displayName": currentUser,
                msg: text,
                userId: auth.currentUser.uid
            });
    }

    //Leaves room when you exit window
    window.onbeforeunload = function (event) {
        socket.emit('leave', { "displayName": currentUser });
    };

    //Checks if question has been answered
    $('#chat').on('click', 'input', function () {
        var ref = $(this).parent()
        var ref_parent = ref.parent()
        if ($(this).hasClass('answer')) {
            ref_parent.addClass("green")
            ref.addClass("white-text")
        }
        else {
            ref_parent.addClass("red")
            ref.addClass("white-text")
        }
        socket.emit('send_answer', { "question": question, "displayName": auth.currentUser.displayName, "userId": id, "qType": qType, "origin": senderId, "answer": ref.text() })

    });

    //OnClickListener for adding a new row for MCQ question view in question mode
    $("#question-content").on('click', '#add_option', function () {
        var count = $('#options tr').length / 2 + 1;
        $("#options").append('<tr><td><label><input type="checkbox" id="o' + count + '" /><span></span></label></td>'
            + '<td><input id="option' + count + '" placeholder="Option ' + count + '" type="text"></td><tr>')
    })


    //Handle Question Submit
    $("#sendQuestions").click(function () {
        $("#startQuestionMode").modal("close")
        var option = $('#qType').val()
        var question = $("#question").val()
        var answer = ""
        var qType = ""
        var options = ""
        if (option == 1) {
            if ($('#true').is(':checked')) {
                answer = 1;
            }
            else {
                answer = 2;
            }
            qType = "TF";

            socket.emit('send_questions', { "question": question, "qType": qType, "senderId": id, "options": options, "answer": answer })
        }
        else if (option == 2) {
            var count = $('#options tr').length / 2 + 1;
            var options = []
            for (var i = 1; i < count; i++) {
                options.push($("#option" + i).val())
                if ($('#o' + i).is(':checked')) {
                    answer = 1;
                }
            }
            qType = "MQ"
            socket.emit('send_questions', { "question": question, "qType": qType, "senderId": id, "options": options, "answer": answer })

        }

    });



    //File Uploading mode
    $('#message').on("drop", function (e) {
        var dataTransfer = e.originalEvent.dataTransfer;
        if (dataTransfer && dataTransfer.files.length) {
            e.preventDefault();
            e.stopPropagation();
            $.each(dataTransfer.files, function (i, file) {
                var reader = new FileReader();
                reader.onload = $.proxy(function (file, $fileList, event) {
                    var img = file.type.match('image.*') ? "<img src='" + event.target.result + "' /> " : "";
                    $fileList.prepend($("<li>").append(img + file.name));
                }, this, file, $("#fileList"));
                var r = reader.readAsDataURL(file);
            });
        }
    })


    //Toggle topic details
    $("#topicDetails").on('click', '.collection-item', function () {
        $(this).toggleClass("strike")
    })
    
    //Adds the saved chat to the clipboard
    $("#chat").on("click", "#clipboard", function () {
        if (!$(this).hasClass("teal-text")) {
            var elem = $(this).parent().children("#content").text()
            $(this).addClass("teal-text text-lighten-3")
            $("#clipboardData").append("<li class='collection-item'>" + elem + "</li>");
        }
        else {
            var elem = $(this).parent().children("#content").text()

        }

    })

    /**
    * Templates for different views
    */

    //Views for Add Send Questions
    function addSendQuestion(questions, options, qType, answer, senderId) {
        if (qType == "TF") {
            var message = "<div class='row valign-wrapper' id='" + senderId + "' style='margin-bottom: 0px;'>"
                + "<div class='col s8'>"
                + '<div class="card-panel" style="margin: 10px;margin-left: 5px;padding:10px">'
                + '</p><span id="content">Questions: ' + questions
                + '<table id="options">'
            console.log(answer)
            if (answer == 1) {
                message += '<tr><td><label><input class="answer" type="checkbox" id="true"/><span>True</span></label></td></tr>'
            }
            else {
                message += '<tr><td><label><input type="checkbox" id="true" /><span>True</span></label></td></tr>'
            }

            if (answer == 2) {
                message += '<tr><td><label><input class="answer" type="checkbox" id="false"/><span>False</span></label></td></tr>'
            }
            else {
                message += '<tr><td><label><input type="checkbox" id="false"/><span>False</span></label></td></tr>'
            }
            message += "</div>"
                + "</div>"
                + '<div class="col s3"></div>'
                + "</div>"
        }
        else if (qType == "MQ") {
            var message = "<div class='row valign-wrapper' id='question_card' style='margin-bottom: 0px;'>"
                + "<div class='col s8'>"
                + '<div class="card-panel" style="margin: 10px;margin-left: 5px;padding:10px">'
                + '</p><span id="content">Questions: ' + questions + '</p>'
                + '<table id="options">'
            for (var i = 0; i < options.length; i++) {
                if (answer == i) {
                    message += '<tr><td><label><input type="checkbox" class="answer" id="option_' 
                    + i + '" /> <span>' 
                    + options[i] + '</span></label></td></tr>'
                }
                else {
                    message += '<tr><td><label><input type="checkbox" id="option_' 
                    + i + '" /> <span>' 
                    + options[i] + '</span></label></td></tr>'
                }

            }
            message += "</div>"
                + "</div>"
                + '<div class="col s3"></div>'
                + "</div>"

        }
        return message;
    }

    //Views for a message to chat
    function addMessage(message, name) {
        var message = `<div class='row valign-wrapper' style='margin-bottom: 0px;'>"
            <div class='col s8'>
            <div class="card-panel" style="margin: 10px;margin-left: 5px;padding:10px">
            <p class="grey-text" style="margin: 0px">' + name + '</p><span id="content">` + message
            `</span><i id="clipboard" class="right-align material-icons right">star</i>
            </div>
            </div>
            <div class="col s3"></div>
            </div>`
        return message;
    }

    //Adds joined chat message to chat
    function addJoinedChat(message) {
        var message = "<div class='row valign-wrapper' style='margin-bottom: 0px;'>"
            + '<div class="col s3"></div>'
            + "<div class='col s6'>"
            + '<div class="card-panel center" style="margin: 10px ;padding:10px"><span id="content">'
            + message
            + "</span></div>"
            + "</div>"
            + '<div class="col s3"></div>'
            + '</div>'
        return message;
    }

    //Adds your own message
    function addPersonalMessage(message) {
        var message = '<div class="row valign-wrapper" style="margin-bottom: 0px;">'
            + '<div class="col s4"></div>'
            + '<div class="col s8 blue white-text card-panel" style="margin: 10px;margin-right:15px; padding:10px"><span id="content">'
            + message
            + '</span><i id="clipboard" class="right-align material-icons right">star</i>'
            + '</div>'
            + '</div>'
        return message;
    }


    /**
    * Forms for creating question
    */
    //Add TF form to view
    function addTrueFalseForm() {
        var string = '<div class="row">'
            + '<input placeholder="Question" id ="question" type="text" class="validate">'
            + '<div class="row">'
            + '<div class="col s2">Answer: </div>'
            + '<table id="options">'
            + '<tr><td><label><input type="checkbox" id="true" /><span>True</span></label></td></tr>'
            + '<tr><td><label><input type="checkbox" id="false" /><span>False</span></label></td></tr></table>'
            + '</div>'
        $("#question-content").empty()
        $("#question-content").append(string)
    }

    //Add MCQ form to view
    function addMQ() {
        var string = '<div class="row">'
            + '<input placeholder="Question" id ="question" type="text" class="validate">'
            + '<div class="row"><div class="col s10><p>Answer:</p></div>'
            + '<div class="col s2><a class="btn red waves-effect waves-light" id="add_option" name="action">'
            + '<i class="material-icons">add</i>Add option</a></div></div>'
            + '<table id="options">'
            + '<tr><td><label><input type="checkbox" id="o1" /><span></span></label></td>'
            + '<td><input id="option1" placeholder="Option 1" type="text"></td><tr>'
            + '<tr><td><label><input type="checkbox" id="o2" /><span></span></label></td>'
            + '<td><input id="option2" placeholder="Option 2" type="text"></td><tr>'
            + '<tr><td><label><input type="checkbox" id="o3" /><span></span></label></td>'
            + '<td><input id="option3" placeholder="Option 3" type="text"></td><tr>'
            + '</table>'
            + '</div>'
        $("#question-content").empty()
        $("#question-content").append(string)
    }



});