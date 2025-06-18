import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-center p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/register" element={isAdmin ? <RegisterFace /> : <Login setIsAdmin={setIsAdmin} />} />
          <Route path="/logs" element={isAdmin ? <Logs /> : <Login setIsAdmin={setIsAdmin} />} />
          <Route path="/success" element={<Success />} />
          <Route path="/admin" element={<Login setIsAdmin={setIsAdmin} />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/manage-faces" element={isAdmin ? <ManageFaces /> : <Login setIsAdmin={setIsAdmin} />} />
        </Routes>
      </div>
    </Router>
  );
}
function Login({ setIsAdmin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      setIsAdmin(true);
      navigate("/admin-panel");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold text-purple-600 mb-4">Admin Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input border p-2 rounded-xl text-center"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input border p-2 rounded-xl text-center"
      />
      <button
        onClick={handleLogin}
        className="btn bg-purple-500 hover:bg-purple-600 text-white rounded-lg shadow-xl py-2 px-6"
      >
        Login
      </button>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();

  const goToManage = () => {
    navigate("/admin");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Welcome To Nyza Engineering Design</h1>
      <Link to="/attendance" className="btn bg-sky-500/75 hover:bg-sky-500 rounded-lg shadow-xl outline-cyan-500 outline outline-offset-2 py-2 px-6 m-2">Attendance</Link>
      <button onClick={goToManage} className="btn bg-purple-500 hover:bg-purple-600 rounded-lg shadow-xl outline-purple-500 outline outline-offset-2 py-2 px-6 m-2">Manage</button>
    </div>
  );
}


function AdminPanel() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl font-bold text-purple-700 mb-4">Admin Panel</h2>
      <Link to="/logs" className="btn bg-teal-400 hover:bg-teal-500 rounded-lg shadow-xl outline-cyan-500 outline outline-offset-2 py-2 px-6 m-2">Show Logs</Link>
      <Link to="/register" className="btn bg-yellow-400 hover:bg-yellow-500 rounded-lg shadow-xl outline-yellow-500 outline outline-offset-2 py-2 px-6 m-2">Add New Face</Link>
      <Link to="/manage-faces" className="btn bg-red-400 hover:bg-red-500 rounded-lg shadow-xl outline-red-500 outline outline-offset-2 py-2 px-6 m-2">Manage Dataset</Link>
      <Link to="/" className="btn bg-gray-400 hover:bg-gray-500 rounded-lg shadow-xl outline-gray-500 outline outline-offset-2 py-2 px-6 m-2">Home</Link>
    </div>
  );
}

function ManageFaces() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch("/api/dataset")
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(err => console.error("Failed to fetch dataset:", err));
  }, []);

  const deleteImage = async (filename) => {
    if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename })
      });
      setImages(images.filter(img => img.filename !== filename));
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-red-700 mb-4">Manage Dataset</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {images.map((img, i) => (
          <div key={i} className="bg-white shadow-lg rounded p-2">
            <img src={`data:image/jpeg;base64,${img.base64}`} alt={img.filename} className="w-full rounded mb-2" />
            <p className="text-sm font-bold text-gray-700">{img.filename}</p>
            <button onClick={() => deleteImage(img.filename)} className="btn bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-1 mt-2">Delete</button>
          </div>
        ))}
      </div>
      <Link to="/admin-panel" className="btn bg-gray-500 hover:bg-gray-600 rounded-lg shadow-xl outline-gray-500 outline outline-offset-2 py-2 px-6 mt-6 inline-block">Back to Admin Panel</Link>
    </div>
  );
}



// ----Attendance----
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
        <button onClick={insertAttendance} className="btn bg-cyan-500 hover:bg-cyan-600 rounded-lg shadow-xl outline-cyan-500 outline outline-offset-2 py-2 px-6 m-2">Insert</button>
        <Link to="/" className="btn bg-gray-500 rounded-lg shadow-xl outline-cyan-500 outline outline-offset-2 py-2 px-6 m-2">Go back</Link>
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
        <Link to="/attendance" className="btn bg-cyan-500 hover:bg-cyan-600 rounded-lg shadow-xl outline-cyan-500 outline outline-offset-2 ppy-2 px-6">New attendance</Link>
        <Link to="/" className="btn bg-gray-600 rounded-lg shadow-xl outline-cyan-500 outline outline-offset-2 py-2 px-6">Done</Link>
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
      <h2 className="text-5xl font-semibold text-purple-600 py-4 px-8">Register Face</h2>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="mx-auto my-4 rounded border" />
      <p className="text-green-700">Image captured: {count}</p>
      <input
        className="input border p-2 rounded-xl text-center m-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Person name..."
      />
      <button onClick={capture} className="btn bg-sky-400 mt-2 rounded-lg shadow-xl outline-sky-300 outline outline-offset-2 py-2 px-6 mb-4 mt-4">Capture</button>
      <Link to="/admin-panel" className="btn bg-gray-400 mt-2 rounded-lg shadow-xl outline-gray-300 outline outline-offset-2 py-2 px-6">Done</Link>
    </div>
  );
}



// ---------Logs---------

function Logs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateToDelete, setDateToDelete] = useState("");

  useEffect(() => {
    fetch("/api/logs")
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error("Failed to fetch logs:", err));
  }, []);

  const filteredLogs = logs.filter(row =>
    row[0].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedLogs = filteredLogs.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);

  const exportCSV = () => {
    const csvContent = ["Name,Date,Time", ...filteredLogs.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance_logs.csv");
    link.click();
  };

  const clearOldLogs = async () => {
    if (!dateToDelete.trim()) return alert("Please enter a valid date");
    const res = await fetch("/api/clear_logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ before_date: dateToDelete })
    });
    const result = await res.json();
    alert(result.message);
    window.location.reload();
  };

  return (
    <div className="text-center">
      <h2 className="text-5xl font-semibold text-green-700 mb-8">Attendance Logs</h2>

      <div className="mt-10">
        <h3 className="text-xl text-red-600 font-bold mb-2">Clear Old Logs</h3>
        <input
          type="date"
          value={dateToDelete}
          onChange={e => setDateToDelete(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={clearOldLogs}
          className="btn bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-xl py-2 px-6 ml-4"
        >
          Delete Logs Before Date
        </button>
      </div>

{/* Filter Section */}

      <div className="flex mt-8 justify-center items-center gap-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            className="border rounded p-2 mb-4"
          />
        </div>

        <div className="mb-6">
          <label className="mr-2">Show:</label>
          <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(0); }} className="border p-1">
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 items-center mb-4">
          <button onClick={exportCSV} className="btn bg-yellow-500 text-white rounded-lg shadow-xl py-2 px-6 mb-2">Export as CSV</button>
        </div>
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
          <button onClick={() => setPage(page - 1)} className="btn bg-green-500 text-white rounded-lg shadow-xl py-2 px-6 m-2">Previous</button>
        )}
        {page + 1 < totalPages && (
          <button onClick={() => setPage(page + 1)} className="btn bg-green-600 text-white rounded-lg shadow-xl py-2 px-6 m-2">Next</button>
        )}
      </div>

      <Link to="/admin-panel" className="btn bg-gray-400 mt-10 rounded-lg shadow-xl py-2 px-6">Back</Link>
    </div>
  );
}

// export default App;