import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getDoctors, getDoctorById, deleteDoctor } from "../services/doctorService";
import AddEditDoctorModal from "../components/AddEditDoctorModal";
import { toast } from "react-toastify";
import Table from "../components/Table";
import { Users, Stethoscope, Star, Clock, Search, Plus, Edit2, Trash2 } from "lucide-react";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 8;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getDoctors();
      const doctorsData = response?.data?.data || response?.data?.doctors || response?.data || [];
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const text = search.toLowerCase();
      return (
        doctor.full_name?.toLowerCase().includes(text) ||
        doctor.email?.toLowerCase().includes(text) ||
        doctor.specialization?.toLowerCase().includes(text) ||
        doctor.phone?.toLowerCase().includes(text)
      );
    });
  }, [doctors, search]);

  const indexOfLast = currentPage * doctorsPerPage;
  const indexOfFirst = indexOfLast - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await deleteDoctor(id);
      toast.success("Doctor deleted successfully.");
      fetchDoctors();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete doctor.");
    }
  };

  const columns = [
    { header: "Name", render: (row) => (
      <div className="flex items-center">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
          {row.full_name?.charAt(0) || "D"}
        </div>
        <div>
          <p className="font-medium text-slate-900">Dr. {row.full_name}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      </div>
    )},
    { header: "Specialization", accessor: "specialization" },
    { header: "Qualification", accessor: "qualification" },
    { header: "Phone", accessor: "phone" },
    { header: "Experience", render: (row) => `${row.experience || 0} yrs` },
    { header: "Available Days", render: (row) => <span className="text-xs text-slate-600">{row.available_days || "—"}</span> },
    { header: "Actions", render: (row) => (
      <div className="flex gap-2">
        <button
          onClick={async () => {
            try {
              const response = await getDoctorById(row.id);
              setSelectedDoctor(response.data.data || response.data);
              setIsModalOpen(true);
            } catch { toast.error("Failed to load doctor details."); }
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
          <h1 className="text-3xl font-bold text-slate-800">Doctors</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all registered doctors</p>
        </div>
        <button
          onClick={() => { setSelectedDoctor(null); setIsModalOpen(true); }}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Doctors", value: doctors.length, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Active Doctors", value: filteredDoctors.length, icon: Stethoscope, color: "bg-emerald-50 text-emerald-600" },
          { label: "Specializations", value: new Set(doctors.map(d => d.specialization)).size, icon: Star, color: "bg-purple-50 text-purple-600" },
          { label: "Available Now", value: doctors.filter(d => d.available_days && d.available_time).length, icon: Clock, color: "bg-amber-50 text-amber-600" },
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
          placeholder="Search by name, email, specialization..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-96 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
      ) : (
        <Table columns={columns} data={currentDoctors} keyField="id" emptyMessage="No doctors found. Add your first doctor to get started." />
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

      <AddEditDoctorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchDoctors} doctor={selectedDoctor} />
    </MainLayout>
  );
}

export default Doctors;