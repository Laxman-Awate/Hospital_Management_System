import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import MainLayout from "../layouts/MainLayout";
import AddEditPrescriptionModal from "../components/AddEditPrescriptionModal";
import { deletePrescription, getPrescriptionById, getPrescriptions } from "../services/prescriptionService";
import { useAuth } from "../context/AuthContext";

function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const perPage = 5;
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

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{user?.role === "Patient" ? "My Prescriptions" : "Prescriptions"}</h1>
        {canWrite && <button onClick={() => { setSelectedPrescription(null); setModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">+ Create Prescription</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5"><h3 className="text-gray-500 text-sm">Total Prescriptions</h3><p className="text-3xl font-bold text-blue-600">{prescriptions.length}</p></div>
        <div className="bg-white rounded-xl shadow p-5"><h3 className="text-gray-500 text-sm">With Follow-up</h3><p className="text-3xl font-bold text-green-600">{prescriptions.filter((item) => item.next_visit).length}</p></div>
        <div className="bg-white rounded-xl shadow p-5"><h3 className="text-gray-500 text-sm">Showing Results</h3><p className="text-3xl font-bold text-purple-600">{filtered.length}</p></div>
      </div>
      <div className="mb-6"><input type="text" placeholder="Search by patient, doctor, diagnosis..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="border rounded-lg px-4 py-2 w-full md:w-96" /></div>
      {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div> : (
        <div className="overflow-x-auto bg-white shadow rounded-lg"><table className="w-full"><thead className="bg-blue-600 text-white"><tr><th className="p-3">Appointment</th><th className="p-3">Patient</th><th className="p-3">Doctor</th><th className="p-3">Diagnosis</th><th className="p-3">Medicines</th><th className="p-3">Next Visit</th>{canWrite && <th className="p-3">Actions</th>}</tr></thead><tbody>{current.length === 0 ? <tr><td colSpan={canWrite ? 7 : 6} className="text-center py-12 text-gray-500">No prescriptions found.</td></tr> : current.map((item) => <tr key={item.id} className="border-b hover:bg-gray-100"><td className="p-3">#{item.appointment_id}</td><td className="p-3">{item.patient_name}</td><td className="p-3">{item.doctor_name}</td><td className="p-3 max-w-xs truncate">{item.diagnosis}</td><td className="p-3 max-w-xs truncate">{item.medicines}</td><td className="p-3">{item.next_visit || "—"}</td>{canWrite && <td className="p-3 flex gap-2"><button onClick={() => editPrescription(item.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">Edit</button><button onClick={() => removePrescription(item.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button></td>}</tr>)}</tbody></table></div>
      )}
      {totalPages > 1 && <div className="flex justify-center gap-2 mt-6"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg">Previous</button><span className="px-4 py-2">{page} / {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg">Next</button></div>}
      <AddEditPrescriptionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchPrescriptions} prescription={selectedPrescription} />
    </MainLayout>
  );
}

export default Prescriptions;
