// Step 1: Basic React App Skeleton

import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-center p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/register" element={<RegisterFace />} />
          <Route path="/success" element={<Success />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Welcome To Nyza Engineering Design</h1>
      <Link to="/attendance" className="btn bg-blue-500">Attendance</Link>
      <Link to="/logs" className="btn bg-green-500">Show Logs</Link>
      <Link to="/register" className="btn bg-purple-500">Add New Face</Link>
    </div>
  );
}

function Attendance() {
  const webcamRef = useRef(null);
  const [name, setName] = useState("Recognizing...");
  const navigate = useNavigate();

  const recognizeFace = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const res = await fetch("/api/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageSrc })
    });
    const data = await res.json();
    setName(data.name);
  };

  const insertAttendance = async () => {
    if (name && name !== "Unknown") {
      navigate("/success");
    } else {
      alert("Cannot confirm face. Please ensure you're in frame.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      recognizeFace();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-blue-600 mb-2">Attendance</h2>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="mx-auto my-4 rounded border" />
      <p className="text-lg font-bold text-gray-700">Detected: <span className="text-indigo-600">{name}</span></p>
      <div className="flex flex-col items-center gap-2 mt-4">
        <button onClick={insertAttendance} className="btn bg-blue-600">Insert</button>
        <Link to="/" className="btn bg-gray-500">Go back</Link>
      </div>
    </div>
  );
}

function Success() {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold text-green-600">Attendance successfully logged</h2>
      <p className="text-green-600 my-2">Attendance logged successfully</p>
      <div className="flex gap-2">
        <Link to="/attendance" className="btn bg-blue-600">New attendance</Link>
        <Link to="/" className="btn bg-gray-600">Done</Link>
      </div>
    </div>
  );
}

function RegisterFace() {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);

  const capture = async () => {
    if (!name.trim()) {
      alert("Please enter a name before capturing.");
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageSrc, name })
    });
    setCount(count + 1);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold text-purple-600">Register Face</h2>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="mx-auto my-4 rounded border" />
      <p className="text-green-700">Image captured: {count}</p>
      <input
        className="input border p-2 rounded text-center"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Person name..."
      />
      <button onClick={capture} className="btn bg-purple-600 mt-2">Capture</button>
      <Link to="/" className="btn bg-gray-600 mt-2">Done</Link>
    </div>
  );
}

function Logs() {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-green-700">Attendance Logs</h2>
      <a
        href="https://docs.google.com/spreadsheets/d/1SxjHRf4eVyyLU5OeQAZy17iaSHituaeH3mwppOdVF6w/edit?gid=0#gid=0"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        View Logs on Google Sheets
      </a>
    </div>
  );
}
