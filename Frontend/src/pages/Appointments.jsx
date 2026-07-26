import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAppointments, getAppointmentById, deleteAppointment } from "../services/appointmentService";
import AddEditAppointmentModal from "../components/AddEditAppointmentModal";
import { toast } from "react-toastify";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";
import { Calendar, Clock, CheckCircle, XCircle, Search, Plus, Edit2, Trash2 } from "lucide-react";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 8;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
     const response = await getAppointments();
     setAppointments(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const text = search.toLowerCase();
      return (
        appointment.patient?.toLowerCase().includes(text) ||
        appointment.doctor?.toLowerCase().includes(text) ||
        appointment.status?.toLowerCase().includes(text) ||
        appointment.reason?.toLowerCase().includes(text)
      );
    });
  }, [appointments, search]);

  const indexOfLast = currentPage * appointmentsPerPage;
  const indexOfFirst = indexOfLast - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      toast.success("Appointment deleted successfully.");
      fetchAppointments();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete appointment.");
    }
  };

  const columns = [
    { header: "Patient", accessor: "patient" },
    { header: "Doctor", accessor: "doctor" },
    { header: "Date", accessor: "date" },
    { header: "Time", accessor: "time" },
    { header: "Reason", render: (row) => <span className="max-w-xs truncate block text-slate-600 text-sm">{row.reason || "—"}</span> },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-2">
        <button
          onClick={async () => {
            try {
              const response = await getAppointmentById(row.id);
              setSelectedAppointment(response.data);
              setIsModalOpen(true);
            } catch { toast.error("Failed to load appointment details."); }
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
          <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all patient appointments</p>
        </div>
        <button
          onClick={() => { setSelectedAppointment(null); setIsModalOpen(true); }}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-5 h-5 mr-2" /> Book Appointment
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: appointments.length, icon: Calendar, color: "bg-blue-50 text-blue-600" },
          { label: "Scheduled", value: appointments.filter(a => a.status === "Scheduled").length, icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Completed", value: appointments.filter(a => a.status === "Completed").length, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
          { label: "Cancelled", value: appointments.filter(a => a.status === "Cancelled").length, icon: XCircle, color: "bg-red-50 text-red-600" },
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
          placeholder="Search by patient, doctor, status..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-96 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
      ) : (
        <Table columns={columns} data={currentAppointments} keyField="id" emptyMessage="No appointments found." />
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

      <AddEditAppointmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAppointments} appointment={selectedAppointment} />
    </MainLayout>
  );
}

export default Appointments;