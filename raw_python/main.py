import face_recognition
import cv2
import os
import csv
from datetime import datetime

known_encodings = []
known_names = []

for file in os.listdir("dataset"):
    if file.lower().endswith(".jpg"):
        image = face_recognition.load_image_file(f"dataset/{file}")
        encodings = face_recognition.face_encodings(image)
        if encodings:
            known_encodings.append(encodings[0])
            base_name = os.path.splitext(file)[0]
            person_name = base_name.split("_")[0]
            known_names.append(person_name)
        else:
            print(f"⚠️ No face found in {file}")

cap = cv2.VideoCapture(0)
today = datetime.now().strftime("%Y-%m-%d")
log_file = f"logs/attendance_{today}.csv"

last_name = ""
confirmed = set()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    for encoding, location in zip(face_encodings, face_locations):
        matches = face_recognition.compare_faces(known_encodings, encoding)
        name = "Unknown"

        if True in matches:
            match_index = matches.index(True)
            name = known_names[match_index]

        last_name = name  # update last detected name

        top, right, bottom, left = [v * 4 for v in location]
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
        cv2.putText(frame, name, (left, top - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,255,255), 2)

    cv2.imshow("Face Attendance - Press L to confirm", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break
    elif key == ord("l") and last_name != "Unknown" and last_name not in confirmed:
        confirmed.add(last_name)
        now = datetime.now()
        with open(log_file, "a", newline="") as f:
            writer = csv.writer(f)
            writer.writerow([last_name, now.strftime("%Y-%m-%d"), now.strftime("%H:%M:%S")])
        print(f"✅ Logged: {last_name} at {now.strftime('%H:%M:%S')}")

cap.release()
cv2.destroyAllWindows()
