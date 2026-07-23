import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getDoctors, getDoctorById, deleteDoctor } from "../services/doctorService";
import AddEditDoctorModal from "../components/AddEditDoctorModal";
import { toast } from "react-toastify";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 5;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const fetchDoctors = async () => {
  try {
    setLoading(true);

    const response = await getDoctors();

    console.log("Doctors API Response:", response);

    const doctorsData =
      response?.data?.data ||
      response?.data?.doctors ||
      response?.data ||
      [];

    setDoctors(Array.isArray(doctorsData) ? doctorsData : []);

    setCurrentPage(1);
  } catch (error) {
    console.error(error);
    toast.error("Failed to load doctors.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDoctors();
  }, []);

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoctor(id);
      toast.success("Doctor deleted successfully.");
      fetchDoctors();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete doctor.");
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Doctors</h1>
        <button
          onClick={() => {
            setSelectedDoctor(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-500 text-sm">Total Doctors</h3>
          <p className="text-3xl font-bold text-blue-600">{doctors.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-500 text-sm">Active Doctors</h3>
          <p className="text-3xl font-bold text-green-600">{filteredDoctors.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-500 text-sm">Specializations</h3>
          <p className="text-3xl font-bold text-purple-600">
            {new Set(doctors.map(d => d.specialization)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-500 text-sm">Available Now</h3>
          <p className="text-3xl font-bold text-orange-600">
              {
                doctors.filter(
                  doctor =>
                    doctor.available_days &&
                    doctor.available_time
                ).length
              }
            </p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, specialization..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-4 py-2 w-full md:w-96"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Specialization</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Qualification</th>
                <th className="p-3">Experience</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDoctors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <p className="text-gray-500 text-lg">No doctors found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new doctor</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentDoctors.map((doctor) => (
                  <tr
                    key={doctor.id}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="p-3">{doctor.id}</td>
                    <td className="p-3">{doctor.full_name}</td>
                    <td className="p-3">{doctor.email}</td>
                    <td className="p-3">{doctor.specialization}</td>
                    <td className="p-3">{doctor.phone}</td>
                    <td className="p-3">{doctor.qualification}</td>
                    <td className="p-3">{doctor.experience} years</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const response = await getDoctorById(doctor.id);

                            setSelectedDoctor(
                              response.data.data || response.data
                            );
                            setIsModalOpen(true);
                          } catch (error) {
                            console.error(error);
                            toast.error("Failed to load doctor details.");
                          }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doctor.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <AddEditDoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDoctors}
        doctor={selectedDoctor}
      />
    </MainLayout>
  );
}

export default Doctors;