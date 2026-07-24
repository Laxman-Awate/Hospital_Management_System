import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getPatients, getPatientById, deletePatient } from "../services/patientService";
import AddEditPatientModal from "../components/AddEditPatientModal";
import { toast } from "react-toastify";
import Table from "../components/Table";
import { Users, UserCheck, UserX, Activity, Search, Plus, Edit2, Trash2 } from "lucide-react";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 8;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const text = search.toLowerCase();
      return (
        patient.full_name?.toLowerCase().includes(text) ||
        patient.email?.toLowerCase().includes(text) ||
        patient.phone?.toLowerCase().includes(text) ||
        patient.gender?.toLowerCase().includes(text) ||
        patient.blood_group?.toLowerCase().includes(text)
      );
    });
  }, [patients, search]);

  const indexOfLast = currentPage * patientsPerPage;
  const indexOfFirst = indexOfLast - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await deletePatient(id);
      toast.success("Patient deleted successfully.");
      fetchPatients();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete patient.");
    }
  };

  const bloodGroupColors = { "A+": "bg-red-50 text-red-700", "A-": "bg-red-50 text-red-700", "B+": "bg-blue-50 text-blue-700", "B-": "bg-blue-50 text-blue-700", "AB+": "bg-purple-50 text-purple-700", "AB-": "bg-purple-50 text-purple-700", "O+": "bg-emerald-50 text-emerald-700", "O-": "bg-emerald-50 text-emerald-700" };

  const columns = [
    { header: "Patient", render: (row) => (
      <div className="flex items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold mr-3 ${row.gender === "Female" ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"}`}>
          {row.full_name?.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-slate-900">{row.full_name}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      </div>
    )},
    { header: "Age / Gender", render: (row) => <span className="text-slate-600">{row.age} · {row.gender}</span> },
    { header: "Phone", accessor: "phone" },
    { header: "Blood Group", render: (row) => row.blood_group ? (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${bloodGroupColors[row.blood_group] || "bg-slate-50 text-slate-600"}`}>{row.blood_group}</span>
    ) : "—" },
    { header: "D.O.B", render: (row) => row.date_of_birth || "—" },
    { header: "Actions", render: (row) => (
      <div className="flex gap-2">
        <button
          onClick={async () => {
            try {
              const response = await getPatientById(row.id);
              setSelectedPatient(response.data);
              setIsModalOpen(true);
            } catch { toast.error("Failed to load patient details."); }
          }}
          className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(row.id)}
          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all registered patients</p>
        </div>
        <button
          onClick={() => { setSelectedPatient(null); setIsModalOpen(true); }}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Patient
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Patients", value: patients.length, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Male Patients", value: patients.filter(p => p.gender === "Male").length, icon: UserCheck, color: "bg-sky-50 text-sky-600" },
          { label: "Female Patients", value: patients.filter(p => p.gender === "Female").length, icon: UserX, color: "bg-pink-50 text-pink-600" },
          { label: "Active", value: filteredPatients.length, icon: Activity, color: "bg-emerald-50 text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-96 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
      ) : (
        <Table columns={columns} data={currentPatients} keyField="id" emptyMessage="No patients found." />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 text-sm rounded-lg transition-colors ${currentPage === page ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{page}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}

      <AddEditPatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchPatients} patient={selectedPatient} />
    </MainLayout>
  );
}

export default Patients;