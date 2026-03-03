import { useNavigate } from "react-router-dom";

export default function DashboardLayout({ title, children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">
        <div className="p-6 text-2xl font-bold text-primary">
          AROGYAM
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => navigate(`/${role}`)}
            className="w-full text-left px-4 py-2 rounded hover:bg-primary/10">
            Dashboard
          </button>

          {role === "doctor" && (
            <>
              <button className="w-full text-left px-4 py-2 rounded bg-primary/10 font-semibold">
                Appointments
              </button>
            </>
          )}
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="m-4 bg-primary text-white py-2 rounded-lg"
        >
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 pt-24">
        <h1 className="text-3xl font-bold text-primary mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
}