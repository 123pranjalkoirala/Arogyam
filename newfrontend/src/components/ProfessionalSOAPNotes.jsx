// Professional SOAP Notes Component - Real Medical Documentation System
import { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Save, Clock, User, Activity, Edit2, X, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function SOAPNotes({ appointmentId, patientId, onSave }) {
  const [soapNotes, setSoapNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    vitalSigns: {
      bloodPressure: { systolic: "", diastolic: "" },
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
      bmi: ""
    },
    diagnosis: [],
    medications: [],
    investigations: [],
    followUp: {
      date: "",
      notes: "",
      type: "in_person"
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [savedSOAP, setSavedSOAP] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showInvestigationForm, setShowInvestigationForm] = useState(false);

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
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSoapNotes(data.data);
          setSavedSOAP(data.data);
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error("Error loading SOAP note:", error);
    }
  };

  // Handle form field changes
  const handleInputChange = (section, field, value) => {
    setSoapNotes(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSoapNotes(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  // Add diagnosis
  const addDiagnosis = () => {
    setSoapNotes(prev => ({
      ...prev,
      diagnosis: [...prev.diagnosis, { code: "", description: "", severity: "moderate" }]
    }));
    setShowDiagnosisForm(false);
  };

  const updateDiagnosis = (index, field, value) => {
    setSoapNotes(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeDiagnosis = (index) => {
    setSoapNotes(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.filter((_, i) => i !== index)
    }));
  };

  // Add medication
  const addMedication = () => {
    setSoapNotes(prev => ({
      ...prev,
      medications: [...prev.medications, { 
        name: "", 
        dosage: "", 
        frequency: "", 
        duration: "", 
        instructions: "" 
      }]
    }));
    setShowMedicationForm(false);
  };

  const updateMedication = (index, field, value) => {
    setSoapNotes(prev => ({
      ...prev,
      medications: prev.medications.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeMedication = (index) => {
    setSoapNotes(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  // Add investigation
  const addInvestigation = () => {
    setSoapNotes(prev => ({
      ...prev,
      investigations: [...prev.investigations, { 
        type: "lab", 
        name: "", 
        result: "", 
        normalRange: "", 
        status: "ordered" 
      }]
    }));
    setShowInvestigationForm(false);
  };

  const updateInvestigation = (index, field, value) => {
    setSoapNotes(prev => ({
      ...prev,
      investigations: prev.investigations.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeInvestigation = (index) => {
    setSoapNotes(prev => ({
      ...prev,
      investigations: prev.investigations.filter((_, i) => i !== index)
    }));
  };

  // Calculate BMI
  const calculateBMI = () => {
    const height = parseFloat(soapNotes.vitalSigns.height) / 100; // Convert cm to m
    const weight = parseFloat(soapNotes.vitalSigns.weight);
    if (height > 0 && weight > 0) {
      const bmi = (weight / (height * height)).toFixed(1);
      handleNestedInputChange('vitalSigns', '', 'bmi', bmi);
    }
  };

  // Save SOAP note
  const handleSaveSOAP = async () => {
    if (!soapNotes.subjective || !soapNotes.objective || !soapNotes.assessment || !soapNotes.plan) {
      toast.error("Please complete all main SOAP sections (Subjective, Objective, Assessment, Plan)");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = savedSOAP ? 
        `http://localhost:5000/api/soap/${savedSOAP._id}` : 
        `http://localhost:5000/api/soap/`;
      
      const method = savedSOAP ? "PUT" : "POST";
      const body = savedSOAP ? 
        { ...soapNotes } : 
        { appointmentId, soapNotes };

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(savedSOAP ? "SOAP note updated successfully" : "SOAP note saved successfully");
          setSavedSOAP(data.data);
          setIsEditing(true);
          if (onSave) onSave();
        }
      } else {
        toast.error("Failed to save SOAP note");
      }
    } catch (error) {
      toast.error("Error saving SOAP note");
      console.error("Error saving SOAP note:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sign SOAP note
  const handleSignSOAP = async () => {
    if (!savedSOAP) {
      toast.error("Please save the SOAP note first");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/soap/${savedSOAP._id}/sign`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("SOAP note signed successfully");
          setSavedSOAP(data.data);
        }
      } else {
        toast.error("Failed to sign SOAP note");
      }
    } catch (error) {
      toast.error("Error signing SOAP note");
      console.error("Error signing SOAP note:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-gray-900">Professional SOAP Notes</h3>
          {savedSOAP && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              savedSOAP.status === 'signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {savedSOAP.status.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveSOAP}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save"}
          </button>
          {savedSOAP && savedSOAP.status !== 'signed' && (
            <button
              onClick={handleSignSOAP}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Sign Note
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main SOAP Sections */}
        <div className="space-y-4">
          {/* Subjective */}
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-gray-900">Subjective (S)</h4>
              <span className="text-xs text-gray-500">Patient's reported symptoms and history</span>
            </div>
            <textarea
              value={soapNotes.subjective}
              onChange={(e) => handleInputChange('subjective', '', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter patient's subjective complaints, history, symptoms..."
            />
          </div>

          {/* Objective */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-gray-900">Objective (O)</h4>
              <span className="text-xs text-gray-500">Exam findings, vitals, lab results</span>
            </div>
            <textarea
              value={soapNotes.objective}
              onChange={(e) => handleInputChange('objective', '', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter objective findings: vital signs, exam results, lab values..."
            />
          </div>

          {/* Assessment */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-yellow-500" />
              <h4 className="font-semibold text-gray-900">Assessment (A)</h4>
              <span className="text-xs text-gray-500">Diagnosis and clinical impression</span>
            </div>
            <textarea
              value={soapNotes.assessment}
              onChange={(e) => handleInputChange('assessment', '', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter assessment: diagnosis, severity, prognosis..."
            />
          </div>

          {/* Plan */}
          <div className="border-l-4 border-red-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-red-500" />
              <h4 className="font-semibold text-gray-900">Plan (P)</h4>
              <span className="text-xs text-gray-500">Treatment and follow-up plan</span>
            </div>
            <textarea
              value={soapNotes.plan}
              onChange={(e) => handleInputChange('plan', '', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              placeholder="Enter plan: medications, treatments, follow-up, patient education..."
            />
          </div>
        </div>

        {/* Additional Medical Details */}
        <div className="space-y-4">
          {/* Vital Signs */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Vital Signs</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure (Systolic/Diastolic)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={soapNotes.vitalSigns.bloodPressure.systolic}
                    onChange={(e) => handleNestedInputChange('vitalSigns', 'bloodPressure', 'systolic', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="120"
                  />
                  <input
                    type="number"
                    value={soapNotes.vitalSigns.bloodPressure.diastolic}
                    onChange={(e) => handleNestedInputChange('vitalSigns', 'bloodPressure', 'diastolic', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="80"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={soapNotes.vitalSigns.heartRate}
                  onChange={(e) => handleNestedInputChange('vitalSigns', '', 'heartRate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="72"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  value={soapNotes.vitalSigns.temperature}
                  onChange={(e) => handleNestedInputChange('vitalSigns', '', 'temperature', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="98.6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Oxygen Saturation (%)</label>
                <input
                  type="number"
                  value={soapNotes.vitalSigns.oxygenSaturation}
                  onChange={(e) => handleNestedInputChange('vitalSigns', '', 'oxygenSaturation', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="98"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={soapNotes.vitalSigns.weight}
                  onChange={(e) => handleNestedInputChange('vitalSigns', '', 'weight', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={soapNotes.vitalSigns.height}
                    onChange={(e) => handleNestedInputChange('vitalSigns', '', 'height', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="170"
                  />
                  <button
                    onClick={calculateBMI}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    Calc BMI
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                <input
                  type="text"
                  value={soapNotes.vitalSigns.bmi}
                  onChange={(e) => handleNestedInputChange('vitalSigns', '', 'bmi', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                  placeholder="24.2"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Diagnosis (ICD-10)</h4>
              <button
                onClick={() => setShowDiagnosisForm(!showDiagnosisForm)}
                className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Diagnosis
              </button>
            </div>
            {soapNotes.diagnosis.map((diagnosis, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Diagnosis #{index + 1}</span>
                  <button
                    onClick={() => removeDiagnosis(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={diagnosis.code}
                    onChange={(e) => updateDiagnosis(index, 'code', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ICD-10 Code (e.g., I10)"
                  />
                  <input
                    type="text"
                    value={diagnosis.description}
                    onChange={(e) => updateDiagnosis(index, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Diagnosis description"
                  />
                  <select
                    value={diagnosis.severity}
                    onChange={(e) => updateDiagnosis(index, 'severity', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Medications */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Medications</h4>
              <button
                onClick={() => setShowMedicationForm(!showMedicationForm)}
                className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Medication
              </button>
            </div>
            {soapNotes.medications.map((medication, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Medication #{index + 1}</span>
                  <button
                    onClick={() => removeMedication(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Medication name"
                  />
                  <input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Dosage (e.g., 500mg)"
                  />
                  <input
                    type="text"
                    value={medication.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Frequency (e.g., twice daily)"
                  />
                  <input
                    type="text"
                    value={medication.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Duration (e.g., 7 days)"
                  />
                  <textarea
                    value={medication.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={2}
                    placeholder="Special instructions"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Follow-up */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Follow-up Plan</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={soapNotes.followUp.date}
                  onChange={(e) => handleNestedInputChange('followUp', '', 'date', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Type</label>
                <select
                  value={soapNotes.followUp.type}
                  onChange={(e) => handleNestedInputChange('followUp', '', 'type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="in_person">In Person</option>
                  <option value="telemedicine">Telemedicine</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Notes</label>
                <textarea
                  value={soapNotes.followUp.notes}
                  onChange={(e) => handleNestedInputChange('followUp', '', 'notes', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Follow-up instructions and notes"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
