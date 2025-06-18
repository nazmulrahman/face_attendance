import cv2
import os

name = input("Enter name: ").strip()
if not name:
    print("❌ Name cannot be empty.")
    exit()

if not os.path.exists("dataset"):
    os.makedirs("dataset")

# Count existing images for that name
existing = [f for f in os.listdir("dataset") if f.startswith(name)]
count = len(existing) + 1

cap = cv2.VideoCapture(0)
print("📷 Press SPACE to capture image, ESC to exit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Camera not accessible")
        break

    cv2.imshow("Register Face", frame)
    key = cv2.waitKey(1)
    if key == 27:  # ESC
        print("❌ Exit without saving.")
        break
    elif key == 32:  # SPACE
        filename = f"dataset/{name}_{count}.jpg"
        cv2.imwrite(filename, frame)
        print(f"✅ Saved: {filename}")
        count += 1

cap.release()
cv2.destroyAllWindows()
