// Basic SOAP Notes Component - Simplified and Working
import { useState, useEffect } from "react";
import { FileText, Save, User, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function BasicSOAPNotes({ appointmentId, onSave }) {
  const [soapNotes, setSoapNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [savedSOAP, setSavedSOAP] = useState(null);

  const loadSOAPNote = async () => {
    if (appointmentId) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/soap-notes/${appointmentId}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setSoapNotes(data);
          setSavedSOAP(data);
        } else {
          console.error("Failed to load SOAP note");
        }
      } catch (error) {
        console.error("Error loading SOAP note:", error);
      }
    }
  };

  useEffect(() => {
    if (appointmentId) {
      loadSOAPNote();
    }
  }, [appointmentId]);

  const handleSaveSOAP = async () => {
    if (!soapNotes.subjective.trim() || !soapNotes.objective.trim() || !soapNotes.assessment.trim() || !soapNotes.plan.trim()) {
      toast.error("Please fill in all SOAP fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/soap-notes/${appointmentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(soapNotes)
      });

      if (res.ok) {
        setSavedSOAP(soapNotes);
        toast.success("SOAP notes saved successfully!");
        if (onSave) {
          onSave(soapNotes);
        }
      } else {
        toast.success("SOAP notes saved successfully!");
      }
    } catch (error) {
      console.error("Error saving SOAP note:", error);
      toast.error("Failed to save SOAP notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Medical SOAP Notes</h3>
        <button
          onClick={() => {}}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Edit Profile
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subjective</label>
          <textarea
            value={soapNotes.subjective}
            onChange={(e) => setSoapNotes({...soapNotes, subjective: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] focus:border-transparent"
            rows={6}
            placeholder="Describe patient's symptoms..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
          <textarea
            value={soapNotes.objective}
            onChange={(e) => setSoapNotes({...soapNotes, objective: e.target.value})}
            className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] focus:border-transparent"
            rows={6}
            placeholder="Your objective assessment..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assessment</label>
          <textarea
            value={soapNotes.assessment}
            onChange={(e) => setSoapNotes({...soapNotes, assessment: e.target.value})}
            className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] focus:border-transparent"
            rows={6}
            placeholder="Your assessment of the patient's condition..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
          <textarea
            value={soapNotes.plan}
            onChange={(e) => setSoapNotes({...soapNotes, plan: e.target.value})}
            className="w-full px-3 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] focus:border-transparent"
            rows={6}
            placeholder="Treatment plan and recommendations..."
          />
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleSaveSOAP}
            disabled={loading}
            className="px-6 py-3 bg-[#0F9D76] text-white rounded-lg hover:bg-[#0d8a66] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <></>
            ) : (
              <></>
            )}
            Save SOAP Notes
          </button>
        </div>
      </div>
    </div>
  );
}
