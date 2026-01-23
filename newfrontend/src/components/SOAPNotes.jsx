// SOAP Notes Component - Medical Documentation System
import { useState } from "react";
import { FileText, Plus, Trash2, Save, Clock, User, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function SOAPNotes({ appointmentId, patientId, onSave }) {
  const [soapNotes, setSoapNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // SOAP Templates for common conditions
  const soapTemplates = {
    "General Checkup": {
      subjective: "Patient presents for routine health checkup. Reports feeling generally well with no specific complaints. Denies fever, chest pain, shortness of breath, abdominal pain, or other acute symptoms. Medications: [List current medications]. Allergies: [List known allergies].",
      objective: "Vital Signs: BP [value], HR [value], RR [value], Temp [value], SpO2 [value]%. General: Well-developed, well-nourished, in no acute distress. HEENT: Normocephalic, PERRLA, mucous membranes moist. Cardiovascular: Regular rate and rhythm, no murmurs. Lungs: Clear bilaterally. Abdomen: Soft, non-tender, no masses. Extremities: No edema, pulses 2+.",
      assessment: "Patient appears to be in good general health. No acute findings identified on examination. Vital signs within normal limits.",
      plan: "1. Continue current medications as prescribed\n2. Maintain healthy lifestyle with regular exercise and balanced diet\n3. Follow up in [time] for routine monitoring\n4. Return sooner if any new symptoms develop\n5. Recommended screenings: [List age-appropriate screenings]"
    },
    "Hypertension Follow-up": {
      subjective: "Patient presents for follow-up of hypertension. Reports [medication adherence]. Denies chest pain, shortness of breath, headache, visual changes, or palpitations. Monitors BP at home: [readings]. Lifestyle: [diet/exercise habits].",
      objective: "BP [value], HR [value], RR [value], Temp [value]. Weight: [value]. Fundoscopic exam: [findings]. Cardiovascular: Regular rhythm, no murmurs. Lungs: Clear. Extremities: No edema. Labs: [recent lab results].",
      assessment: "Blood pressure [controlled/uncontrolled]. Patient [adherent/non-adherent] to medication regimen. [Any complications or target organ damage].",
      plan: "1. Continue [adjust] current antihypertensive regimen\n2. Lifestyle modifications: [specific recommendations]\n3. Home blood pressure monitoring: log readings\n4. Follow up in [time] for BP check\n5. Labs: [order/review relevant labs]\n6. Patient education: [key teaching points]"
    },
    "Diabetes Management": {
      subjective: "Patient with type [1/2] diabetes presents for follow-up. Reports glucose monitoring: [frequency and readings]. Medication adherence: [details]. Diet: [carb counting, meal patterns]. Exercise: [type/frequency]. Symptoms of hypo/hyperglycemia: [report].",
      objective: "Blood glucose: [value]. BP [value]. Weight: [value]. BMI: [value]. Foot exam: [findings]. Eye exam: [findings if available]. Labs: HbA1c [value], fasting glucose [value], lipid panel [values].",
      assessment: "Diabetes [well/poorly] controlled. HbA1c of [value] indicates [control level]. [Any complications identified]. Patient [understands/needs education] about diabetes management.",
      plan: "1. Adjust insulin/oral medications as indicated\n2. Continue glucose monitoring: [frequency]\n3. Dietary recommendations: [specific advice]\n4. Exercise plan: [recommendations]\n5. Follow up in [time]\n6. Labs: [order HbA1c, lipids, renal function]\n7. Preventive care: foot care, eye exams, vaccinations"
    },
    "Respiratory Infection": {
      subjective: "Patient presents with [duration] of [symptoms]. Reports [cough type], [sputum characteristics], [fever], [shortness of breath]. Denies [other symptoms]. Past medical history: [relevant conditions]. Medications: [current meds].",
      objective: "Vital Signs: BP [value], HR [value], RR [value], Temp [value], SpO2 [value]%. General: [appearance]. HEENT: [findings]. Lungs: [auscultation findings]. Cardiovascular: [findings]. [Other relevant exam findings].",
      assessment: "[Likely diagnosis] based on clinical presentation. [Severity assessment]. [Differential diagnoses].",
      plan: "1. Medications: [prescriptions with dosages]\n2. Symptomatic treatment: [recommendations]\n3. Activity restrictions: [if any]\n4. Follow up: [when and for what]\n5. Red flags: [when to seek immediate care]\n6. Preventive measures: [vaccinations, hygiene]"
    }
  };

  const handleTemplateSelect = (templateName) => {
    if (soapTemplates[templateName]) {
      setSoapNotes(soapTemplates[templateName]);
      setIsTemplateMode(false);
      toast.success("Template loaded successfully");
    }
  };

  const handleSaveSOAP = async () => {
    if (!soapNotes.subjective || !soapNotes.objective || !soapNotes.assessment || !soapNotes.plan) {
      toast.error("Please complete all SOAP sections");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/soap-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          patientId,
          soapNotes,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast.success("SOAP notes saved successfully");
        if (onSave) onSave();
      } else {
        toast.error("Failed to save SOAP notes");
      }
    } catch (error) {
      toast.error("Error saving SOAP notes");
    } finally {
      setLoading(false);
    }
  };

  const clearNotes = () => {
    setSoapNotes({
      subjective: "",
      objective: "",
      assessment: "",
      plan: ""
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-gray-900">SOAP Notes</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTemplateMode(!isTemplateMode)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {isTemplateMode ? "Close Templates" : "Use Template"}
          </button>
          <button
            onClick={clearNotes}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Clear
          </button>
        </div>
      </div>

      {/* Template Selection */}
      {isTemplateMode && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3">Select SOAP Template:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.keys(soapTemplates).map((templateName) => (
              <button
                key={templateName}
                onClick={() => handleTemplateSelect(templateName)}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-colors text-sm text-left"
              >
                {templateName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SOAP Sections */}
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
            onChange={(e) => setSoapNotes({...soapNotes, subjective: e.target.value})}
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
            onChange={(e) => setSoapNotes({...soapNotes, objective: e.target.value})}
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
            onChange={(e) => setSoapNotes({...soapNotes, assessment: e.target.value})}
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
            onChange={(e) => setSoapNotes({...soapNotes, plan: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={4}
            placeholder="Enter plan: medications, treatments, follow-up, patient education..."
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSaveSOAP}
          disabled={loading}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save SOAP Notes"}
        </button>
      </div>
    </div>
  );
}
