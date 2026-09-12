import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getMedicalRecords } from "../services/medicalRecordService";
import { toast } from "react-toastify";
import { ClipboardList, Calendar, User, Stethoscope, Search, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getMedicalRecords();
      setRecords(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load medical records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((rec) => {
    const text = search.toLowerCase();
    return (
      (rec.doctor_name || "").toLowerCase().includes(text) ||
      (rec.patient_name || "").toLowerCase().includes(text) ||
      (rec.diagnosis || "").toLowerCase().includes(text) ||
      (rec.chief_complaint || "").toLowerCase().includes(text) ||
      (rec.symptoms || "").toLowerCase().includes(text)
    );
  });

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {user?.role === "Patient" ? "My Medical Records" : "Medical Consultation Records"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === "Patient"
              ? "View all your official doctor-approved consultation records and treatment notes."
              : "Review official patient medical consultation history."}
          </p>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search records by doctor, diagnosis, complaint..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-96 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-700">No medical records available.</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Once a doctor completes and approves a consultation, official records will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span>Dr. {rec.doctor_name || "Doctor"}</span>
                    </div>
                    {user?.role !== "Patient" && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> Patient: {rec.patient_name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {rec.created_at ? rec.created_at.split("T")[0] : "N/A"}
                  </span>
                </div>

                {/* Grid of details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-500 block uppercase text-[10px] tracking-wider mb-1">
                      Chief Complaint
                    </span>
                    <p className="text-slate-800 font-medium">{rec.chief_complaint || "—"}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-500 block uppercase text-[10px] tracking-wider mb-1">
                      Symptoms
                    </span>
                    <p className="text-slate-800 font-medium">{rec.symptoms || "—"}</p>
                  </div>

                  <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 sm:col-span-2">
                    <span className="font-semibold text-blue-800 block uppercase text-[10px] tracking-wider mb-1">
                      Diagnosis
                    </span>
                    <p className="text-blue-950 font-bold text-sm">{rec.diagnosis || "No diagnosis specified"}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="font-semibold text-slate-500 block uppercase text-[10px] tracking-wider mb-1">
                      Clinical Notes
                    </span>
                    <p className="text-slate-700 whitespace-pre-wrap">{rec.clinical_notes || "—"}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-500 block uppercase text-[10px] tracking-wider mb-1">
                      Recommended Tests
                    </span>
                    <p className="text-slate-800 font-medium">{rec.recommended_tests || "None"}</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-500 block uppercase text-[10px] tracking-wider mb-1">
                      Treatment Notes
                    </span>
                    <p className="text-slate-800 font-medium">{rec.treatment_notes || "—"}</p>
                  </div>

                  {rec.follow_up_date && (
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 sm:col-span-2">
                      <span className="font-semibold text-emerald-800 block uppercase text-[10px] tracking-wider mb-0.5">
                        Follow-up Visit Date
                      </span>
                      <p className="text-emerald-900 font-semibold">{rec.follow_up_date}</p>
                    </div>
                  )}

                  {rec.remarks && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 sm:col-span-2">
                      <span className="font-semibold text-slate-500 block uppercase text-[10px] tracking-wider mb-1">
                        Remarks
                      </span>
                      <p className="text-slate-700">{rec.remarks}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default MedicalRecords;
