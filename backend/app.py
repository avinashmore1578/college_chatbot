from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import pyttsx3
import difflib
import threading

app = Flask(__name__)
CORS(app)

# MySQL connection
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Avinash@2004",  # Set your MySQL password
    database="college_chatbot"
)
cursor = conn.cursor(dictionary=True)

# Text-to-speech setup
engine = pyttsx3.init()

def speak(text):
    def run():
        engine.say(text)
        engine.runAndWait()
    threading.Thread(target=run).start()

def find_best_answer(user_question):
    cursor.execute("SELECT * FROM faq")
    data = cursor.fetchall()

    questions = [row['question'] for row in data]
    matches = difflib.get_close_matches(user_question, questions, n=1, cutoff=0.4)

    if matches:
        for row in data:
            if row['question'] == matches[0]:
                return row['answer']

    # No match found
    return None

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data.get("message", "").strip()

    if not user_input:
        return jsonify({"reply": "Please enter a question."})

    speak(f"User asked: {user_input}")

    reply = find_best_answer(user_input)

    if reply:
        speak(f"Bot says: {reply}")
    else:
        reply = "Sorry, I don't know the answer to that yet."
        speak(reply)

    return jsonify({"reply": reply})

@app.route("/")
def home():
    return "✅ College Chatbot Backend with MySQL and TTS is running."

if __name__ == "__main__":
    app.run(debug=True)
