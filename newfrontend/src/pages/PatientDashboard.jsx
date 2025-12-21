import { useEffect, useState } from "react";

export default function PatientDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/reports", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setReports(data.reports);
  };

  return (
    <div className="min-h-screen pt-28 bg-bg">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary mb-6">My Medical Reports</h1>

        <div className="bg-white rounded-xl shadow p-6">
          {reports.map(r => (
            <div key={r._id} className="flex justify-between py-3 border-b">
              <span>{r.title}</span>
              <a
                href={`http://localhost:5000${r.fileUrl}`}
                target="_blank"
                className="text-primary font-bold"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
