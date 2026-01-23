// Basic SOAP Notes Component - Simplified and Working
import { useState, useEffect } from "react";
import { FileText, Save, User, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function BasicSOAPNotes({ appointmentId, patientId, onSave }) {
  const [soapNotes, setSoapNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [savedSOAP, setSavedSOAP] = useState(null);

  // Load existing SOAP note if available
  useEffect(() => {
    if (appointmentId) {
      loadSOAPNote();
    }
  }, [appointmentId]);

  const loadSOAPNote = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/soap/appointment/${appointmentId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : {}
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.soap) {
          setSoapNotes({
            subjective: data.soap.subjective || "",
            objective: data.soap.objective || "",
            assessment: data.soap.assessment || "",
            plan: data.soap.plan || ""
          });
          setSavedSOAP(data.soap);
        }
      }
    } catch (error) {
      console.error("Error loading SOAP note:", error);
    }
  };

  const handleSave = async () => {
    if (!soapNotes.subjective || !soapNotes.objective || !soapNotes.assessment || !soapNotes.plan) {
      toast.error("Please fill all SOAP sections");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const method = savedSOAP ? "PUT" : "POST";
      const url = savedSOAP 
        ? `http://localhost:5000/api/soap/${savedSOAP._id}`
        : `http://localhost:5000/api/soap`;

      const payload = {
        appointmentId,
        patientId,
        subjective: soapNotes.subjective,
        objective: soapNotes.objective,
        assessment: soapNotes.assessment,
        plan: soapNotes.plan
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : {}
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("SOAP note saved successfully!");
        setSavedSOAP(data.soap);
        if (onSave) {
          onSave(data.soap);
        }
      } else {
        toast.error(data.message || "Failed to save SOAP note");
      }
    } catch (error) {
      console.error("Error saving SOAP note:", error);
      toast.error("Failed to save SOAP note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-800">SOAP Notes</h3>
      </div>

      <div className="space-y-6">
        {/* Subjective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Subjective (Patient's complaints)
          </label>
          <textarea
            value={soapNotes.subjective}
            onChange={(e) => setSoapNotes({...soapNotes, subjective: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Patient's reported symptoms, feelings, concerns..."
          />
        </div>

        {/* Objective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4 inline mr-1" />
            Objective (Clinical findings)
          </label>
          <textarea
            value={soapNotes.objective}
            onChange={(e) => setSoapNotes({...soapNotes, objective: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Vital signs, examination results, observations..."
          />
        </div>

        {/* Assessment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment (Diagnosis)
          </label>
          <textarea
            value={soapNotes.assessment}
            onChange={(e) => setSoapNotes({...soapNotes, assessment: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Clinical diagnosis and problem identification..."
          />
        </div>

        {/* Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan (Treatment)
          </label>
          <textarea
            value={soapNotes.plan}
            onChange={(e) => setSoapNotes({...soapNotes, plan: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Treatment plan, medications, follow-up instructions..."
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save SOAP Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
