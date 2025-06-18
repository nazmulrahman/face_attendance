from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import cv2
import numpy as np
import os
import base64
from datetime import datetime
import csv
from sheets import log_to_google_sheets
from flask import send_from_directory

app = Flask(__name__)
CORS(app)

DATASET_DIR = "dataset"
LOGS_DIR = "logs"

# Load known faces
def load_known_faces():
    encodings, names = [], []
    for file in os.listdir(DATASET_DIR):
        if file.lower().endswith(".jpg"):
            image = face_recognition.load_image_file(os.path.join(DATASET_DIR, file))
            encs = face_recognition.face_encodings(image)
            if encs:
                encodings.append(encs[0])
                names.append(file.split("_")[0])
    return encodings, names

# Decode base64 image
def decode_image(data):
    encoded_data = data.split(',')[1]
    nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@app.route("/api/register", methods=["POST"])
def register():
    content = request.json
    image_data = content['image']
    name = content['name']
    count = len([f for f in os.listdir(DATASET_DIR) if f.startswith(name)]) + 1
    filename = f"{name}_{count}.jpg"
    img = decode_image(image_data)
    os.makedirs(DATASET_DIR, exist_ok=True)
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

@app.route("/api/dataset", methods=["GET"])
def get_dataset():
    images = []
    for file in os.listdir(DATASET_DIR):
        if file.lower().endswith(".jpg"):
            path = os.path.join(DATASET_DIR, file)
            with open(path, "rb") as f:
                encoded = base64.b64encode(f.read()).decode('utf-8')
                images.append({"filename": file, "base64": encoded})
    return jsonify(images)

@app.route("/api/delete", methods=["POST"])
def delete_dataset_image():
    content = request.json
    filename = content.get("filename")
    if filename:
        path = os.path.join(DATASET_DIR, filename)
        if os.path.exists(path):
            os.remove(path)
            return jsonify({"status": "deleted", "filename": filename})
    return jsonify({"status": "error", "message": "File not found"}), 404

@app.route("/api/clear_logs", methods=["POST"])
def clear_logs():
    content = request.json
    target_date = content.get("before_date")
    try:
        cutoff = datetime.strptime(target_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"message": "Invalid date format"}), 400

    deleted_count = 0
    for filename in os.listdir(LOGS_DIR):
        if filename.startswith("attendance_") and filename.endswith(".csv"):
            date_str = filename.replace("attendance_", "").replace(".csv", "")
            try:
                file_date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                continue
            if file_date < cutoff:
                os.remove(os.path.join(LOGS_DIR, filename))
                deleted_count += 1

    return jsonify({"message": f"Deleted {deleted_count} old log files."})

@app.route('/api/list_faces')
def list_faces():
    files = [f for f in os.listdir(DATASET_DIR) if f.lower().endswith(".jpg")]
    return jsonify(files)

@app.route('/dataset/<path:filename>')
def serve_dataset_file(filename):
    return send_from_directory(DATASET_DIR, filename)




if __name__ == "__main__":
    app.run(debug=True, port=5000)
