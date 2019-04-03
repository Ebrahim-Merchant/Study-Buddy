import pyrebase
from flask import Flask, current_app, send_from_directory
from flask_socketio import SocketIO
import os
import sys

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
auth = firebase.auth()

@app.route("/")
def hello():

    print(app.static_url_path + '\\index.html'+ " "+app.static_folder, file=sys.stdout)
    return current_app.send_static_file('index.html')

@app.route("/login")
def login(email, password):
    auth.sign_in_with_email_and_password(email, password)


@socketio.on('message')
def handle_message(message):
    print('received message: ' + message)


if __name__ == '__main__':
    socketio.run(app)
