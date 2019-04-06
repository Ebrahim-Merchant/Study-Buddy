import pyrebase
from flask import Flask,session, current_app, send_from_directory, jsonify
from flask_socketio import emit, send, SocketIO, join_room, leave_room
import os
import sys
import requests


#Firebase Init
config = {
    "apiKey": "AIzaSyDCb-dS1ulUx1jiatzyKViayr5uVe1EAfU",
    "authDomain": "studentshare-d1f58.firebaseapp.com",
    "databaseURL": "https://studentshare-d1f58.firebaseio.com",
    "projectId": "studentshare-d1f58",
    "storageBucket": "studentshare-d1f58.appspot.com",
    "messagingSenderId": "672869013696"
}

app = Flask(__name__, static_folder=os.getcwd(), static_url_path='')
app.config['SECRET_KEY'] = config["apiKey"]
socketio = SocketIO(app)

firebase = pyrebase.initialize_app(config)
db = firebase.database()



@app.route("/")
def hello():
    return current_app.send_static_file('index.html')



#Search for Universities from an API
@app.route("/university_names/<search_term>")
def university_names(search_term):
    r = requests.get("http://universities.hipolabs.com/search?name="+search_term)
    jsonFile = r.json()
    Universities = {}
    if len(jsonFile) > 10:
        range_end = 10
    else:
        range_end = len(jsonFile)

    for i in range(0, range_end):
        Universities['"'+jsonFile[i]["name"]+'"'] = ""    
    return jsonify(Universities)
        
   
#Setup ChatRoom
@app.route("/chat_room/<chat_id>")
def login(chat_id):
    session['roomId'] = chat_id
    return current_app.send_static_file('html/chat_room.html')


#Gets the topics for active rooms
@app.route("/getTopics")
def get_topics():
    id = session.get("roomId")
    val = db.child("activeRooms").child(id).get()
    return jsonify(val.val())



#Sends answers to original sender
@socketio.on('send_answer', namespace="/chat")
def handle_message2(message):
    question = message["question"]
    qType = message["qType"]
    userId = message["userId"]
    origin = message["origin"]
    answer = message["answer"]  
    displayName = message["displayName"]
    room = session.get('roomId')
    emit('question_result', 
        {"question": question,
         "qType": qType,
         "displayName": displayName,
         "userId": userId,
         "origin": origin,
         "answer": answer}, 
         room=room)


#Get all active rooms
@app.route("/getRooms")
def search_topics():
    all_users = db.child("activeRooms").get()
    vals = []
    for user in all_users.each():
        temp_dict = user.val()
        temp_d = {}
        temp_d["Topic"] = temp_dict["Topic"]
        temp_d["key"] = user.key()
        vals.append(temp_d) # {name": "Mortimer 'Morty' Smith"}    
    return jsonify(vals)


#Send question to everyone but the origin sender
@socketio.on('send_questions', namespace="/chat")
def handle_message1(message):
    question = message["question"]
    qType = message["qType"]
    senderId = message["senderId"]
    options = message["options"]
    answer = message["answer"]
    room = session.get('roomId')
    print(message)
    emit('question', {"question": question, "qType": qType, "senderId": senderId,"options": options, "answer": answer}, room=room)


#Send question to everyone but the origin sender
@socketio.on('send', namespace="/chat")
def handle_message(message):
    room = session.get('roomId')
    print(message)
    emit('message', {'name': message["displayName"] , "msg": message['msg'], "userId": message["userId"] }, room=room)



#Join a chat room
@socketio.on('join', namespace="/chat")
def joined(message):
    """Sent by clients when they enter a room.
    A status message is broadcast to all people in the room."""
    room = session.get("roomId")
    name = message["displayName"] 
    userId = message["userId"]
    print(userId)
    if "users" in session:
        users = session.get["users"]
        users.append({message["userId"]: message["displayName"]})
        session["users"] = users
    else:
        session["users"] = [{message["userId"]: message["displayName"]}]   
    join_room(room)
    print(session["users"])
    emit('joined_room', {'msg': name + ' has entered the room.'}, room=room)

#Leave a chat room
@socketio.on('leave', namespace='/chat')
def left(message):
    """Sent by clients when they leave a room.
    A status message is broadcast to all people in the room."""
    room = session.get('room')
    leave_room(room)
    print(message)
    emit('left', {'msg': message["displayName"] + ' has left the room.'}, room=room)


if __name__ == '__main__':
    socketio.run(app,debug = True)
