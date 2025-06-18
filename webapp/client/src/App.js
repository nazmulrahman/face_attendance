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
      await fetch("/api/insert_attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
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
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Failed to fetch logs:", err));
  }, []);

  const paginatedLogs = logs.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(logs.length / rowsPerPage);

  const exportCSV = () => {
    const csvContent = ["Name,Date,Time", ...logs.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_logs.csv");
    link.click();
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-green-700 mb-2">Attendance Logs</h2>

      <div className="mb-4">
        <label className="mr-2">Show:</label>
        <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} className="border p-1">
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div className="overflow-x-auto max-w-4xl mx-auto mb-6">
        <table className="table-auto w-full border border-gray-300">
          <thead>
            <tr className="bg-green-200">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((row, idx) => (
              <tr key={idx} className="bg-white border-t">
                <td className="px-4 py-2">{row[0]}</td>
                <td className="px-4 py-2">{row[1]}</td>
                <td className="px-4 py-2">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4 flex justify-center gap-2">
        {page > 0 && (
          <button onClick={() => setPage(page - 1)} className="btn bg-green-500 text-white">Previous</button>
        )}
        {page + 1 < totalPages && (
          <button onClick={() => setPage(page + 1)} className="btn bg-green-600 text-white">Next</button>
        )}
      </div>

      <div className="flex flex-col gap-2 items-center">
        <button onClick={exportCSV} className="btn bg-yellow-500 text-white">Export as CSV</button>
        <a
          href="https://docs.google.com/spreadsheets/d/1SxjHRf4eVyyLU5OeQAZy17iaSHituaeH3mwppOdVF6w"
          target="_blank"
          rel="noopener noreferrer"
          className="btn bg-blue-500 text-white"
        >
          View Logs on Google Sheets
        </a>
        <Link to="/" className="btn bg-gray-600">Home</Link>
      </div>
    </div>
  );
}
