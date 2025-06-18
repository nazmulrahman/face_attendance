
# Face Attendance System

This is a complete web-based face attendance system with admin panel, real-time face recognition, dataset management, and Google Sheets integration.

---

## 🚀 Features

- Real-time face recognition using webcam
- Register new faces (with multiple angles)
- Attendance logging to CSV and Google Sheets
- Admin panel for:
  - Adding new faces
  - Viewing logs
  - Exporting logs
  - Deleting old logs
  - Managing dataset (view/delete/search)

---

## 📦 Technologies Used

- **Frontend**: React.js, TailwindCSS, Webcam.js
- **Backend**: Flask (Python), OpenCV, face_recognition
- **Integration**: Google Sheets API (via service account)

---

## 🗂 Project Structure

```
face_attendance_system/
├── client/        # React Frontend
│   ├── src/
│   │   └── App.js, index.css, etc.
│   ├── tailwind.config.js
│   └── package.json
├── server/        # Flask Backend
│   ├── app.py
│   ├── sheets.py
│   └── credentials.json
├── dataset/       # Registered images
├── logs/          # Attendance CSV files
```

---

## 🧪 Setup Instructions

### 1. Backend (Python)
```bash
cd server
pip install -r requirements.txt
python app.py
```

### 2. Frontend (React)
```bash
cd client
npm install
npm start
```

### 3. Tailwind CSS Setup (if needed)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Add to `tailwind.config.js`:
```js
content: ["./src/**/*.{js,jsx,ts,tsx}"]
```

---

## 🛠 Admin Credentials
- Username: `admin`
- Password: `1234`

---

## 🔐 Google Sheets Integration

- Enable Google Sheets API
- Create Service Account
- Share your sheet with the service email
- Save `credentials.json` in `server/`

---

## 📌 Deployment

- Use `npm run build` to generate frontend assets
- Serve `client/build/` via NGINX or static server
- Use Gunicorn or WSGI server for Flask backend

---

## ✅ License

MIT © <a href="https://nyzaengineering.com">Nyza Engineering Design</a>