from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import cv2
import numpy as np
import os
import base64
from datetime import datetime
import csv
from sheets import log_to_google_sheets  # ✅ Make sure this is configured

app = Flask(__name__)
CORS(app)

DATASET_DIR = "dataset"
LOGS_DIR = "logs"

# Load known faces from dataset folder
def load_known_faces():
    encodings = []
    names = []
    for file in os.listdir(DATASET_DIR):
        if file.lower().endswith(".jpg"):
            image = face_recognition.load_image_file(os.path.join(DATASET_DIR, file))
            encs = face_recognition.face_encodings(image)
            if encs:
                encodings.append(encs[0])
                names.append(file.split("_")[0])  # e.g., "arnab_1.jpg" -> "arnab"
    return encodings, names

# Decode base64 image from frontend
def decode_image(data):
    encoded_data = data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

@app.route("/api/register", methods=["POST"])
def register():
    content = request.json
    image_data = content['image']
    name = content['name']
    count = len([f for f in os.listdir(DATASET_DIR) if f.startswith(name)]) + 1
    filename = f"{name}_{count}.jpg"
    img = decode_image(image_data)
    path = os.path.join(DATASET_DIR, filename)
    cv2.imwrite(path, img)
    return jsonify({"status": "success", "saved": filename})

@app.route("/api/recognize", methods=["POST"])
def recognize():
    content = request.json
    image_data = content['image']
    frame = decode_image(image_data)

    known_encodings, known_names = load_known_faces()
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_frame)
    face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

    name = "Unknown"
    if face_encodings:
        match_results = face_recognition.compare_faces(known_encodings, face_encodings[0])
        if True in match_results:
            matched_index = match_results.index(True)
            name = known_names[matched_index]

    return jsonify({"name": name})

@app.route("/api/insert_attendance", methods=["POST"])
def insert_attendance():
    content = request.json
    name = content["name"]

    if name == "Unknown":
        return jsonify({"error": "Unknown face, not logged."}), 400

    today = datetime.now().strftime("%Y-%m-%d")
    timestamp = datetime.now().strftime("%H:%M:%S")
    log_path = os.path.join(LOGS_DIR, f"attendance_{today}.csv")

    os.makedirs(LOGS_DIR, exist_ok=True)
    with open(log_path, "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([name, today, timestamp])

    try:
        log_to_google_sheets(name)
    except Exception as e:
        print("Google Sheets logging failed:", e)

    return jsonify({"status": "logged", "name": name})

@app.route("/api/logs", methods=["GET"])
def get_logs():
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join(LOGS_DIR, f"attendance_{today}.csv")
    data = []
    if os.path.exists(log_file):
        with open(log_file, newline="") as f:
            reader = csv.reader(f)
            data = list(reader)
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
