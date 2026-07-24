import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import MainLayout from "../layouts/MainLayout";
import AddEditPrescriptionModal from "../components/AddEditPrescriptionModal";
import { deletePrescription, getPrescriptionById, getPrescriptions } from "../services/prescriptionService";
import { useAuth } from "../context/AuthContext";
import Table from "../components/Table";
import { FileText, CalendarDays, Filter, Search, Plus, Edit2, Trash2 } from "lucide-react";

function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const perPage = 8;
  const canWrite = ["Admin", "Doctor"].includes(user?.role);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await getPrescriptions();
      setPrescriptions(response.data || []);
      setPage(1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const filtered = useMemo(() => prescriptions.filter((item) => {
    const term = search.toLowerCase();
    return [item.patient_name, item.doctor_name, item.diagnosis, item.medicines, String(item.appointment_id)]
      .some((value) => value?.toLowerCase().includes(term));
  }), [prescriptions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  const editPrescription = async (id) => {
    try {
      const response = await getPrescriptionById(id);
      setSelectedPrescription(response.data);
      setModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load prescription details.");
    }
  };

  const removePrescription = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) return;
    try {
      await deletePrescription(id);
      toast.success("Prescription deleted successfully.");
      fetchPrescriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete prescription.");
    }
  };

  const actionColumn = canWrite ? [{
    header: "Actions",
    render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => editPrescription(row.id)} className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
        <button onClick={() => removePrescription(row.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
      </div>
    )
  }] : [];

  const columns = [
    { header: "Appt #", render: (row) => <span className="font-mono text-sm text-slate-600">#{row.appointment_id}</span> },
    { header: "Patient", accessor: "patient_name" },
    { header: "Doctor", accessor: "doctor_name" },
    { header: "Diagnosis", render: (row) => <span className="max-w-xs truncate block text-slate-700">{row.diagnosis}</span> },
    { header: "Medicines", render: (row) => <span className="max-w-xs truncate block text-slate-600 text-sm">{row.medicines}</span> },
    { header: "Next Visit", render: (row) => row.next_visit ? (
      <span className="flex items-center text-teal-600 text-sm"><CalendarDays className="w-3.5 h-3.5 mr-1" />{row.next_visit}</span>
    ) : <span className="text-slate-400">—</span> },
    ...actionColumn,
  ];

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{user?.role === "Patient" ? "My Prescriptions" : "Prescriptions"}</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage patient prescriptions</p>
        </div>
        {canWrite && (
          <button onClick={() => { setSelectedPrescription(null); setModalOpen(true); }} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-200">
            <Plus className="w-5 h-5 mr-2" /> Create Prescription
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Prescriptions", value: prescriptions.length, icon: FileText, color: "bg-blue-50 text-blue-600" },
          { label: "With Follow-up", value: prescriptions.filter(i => i.next_visit).length, icon: CalendarDays, color: "bg-emerald-50 text-emerald-600" },
          { label: "Showing Results", value: filtered.length, icon: Filter, color: "bg-purple-50 text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
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
        <input type="text" placeholder="Search by patient, doctor, diagnosis..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-96 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
      ) : (
        <Table columns={columns} data={current} keyField="id" emptyMessage="No prescriptions found." />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Previous</button>
          <span className="text-sm text-slate-500">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}

      <AddEditPrescriptionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchPrescriptions} prescription={selectedPrescription} />
    </MainLayout>
  );
}

export default Prescriptions;
