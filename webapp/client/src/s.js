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
