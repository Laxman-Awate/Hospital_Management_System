import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getPatients, getPatientById, deletePatient } from "../services/patientService";
import AddEditPatientModal from "../components/AddEditPatientModal";
import { toast } from "react-toastify";



function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 5;
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

  useEffect(() => {
    fetchPatients();
  }, []);

  // Search

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const text = search.toLowerCase();

      return (
        patient.full_name.toLowerCase().includes(text) ||
        patient.email.toLowerCase().includes(text) ||
        patient.phone.toLowerCase().includes(text) ||
        patient.gender.toLowerCase().includes(text) ||
        patient.blood_group?.toLowerCase().includes(text)
      );
    });
  }, [patients, search]);

  // Pagination

  const indexOfLast = currentPage * patientsPerPage;
  const indexOfFirst = indexOfLast - patientsPerPage;

  const currentPatients = filteredPatients.slice(
    indexOfFirst,
    indexOfLast
  );

  const totalPages = Math.ceil(
    filteredPatients.length / patientsPerPage
  );

  // Delete

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmDelete) return;

    try {
      await deletePatient(id);
      toast.success("Patient deleted successfully.");
      fetchPatients();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete patient.");
    }
    
  };

  return (
    <MainLayout>

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Patients
        </h1>

        <button
          onClick={() => {
            setSelectedPatient(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Patient
        </button>

      </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-gray-500 text-sm">Total Patients</h3>
        <p className="text-3xl font-bold text-blue-600">
          {patients.length}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-gray-500 text-sm">Male Patients</h3>
        <p className="text-3xl font-bold text-green-600">
          {patients.filter(p => p.gender === 'Male').length}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-gray-500 text-sm">Female Patients</h3>
        <p className="text-3xl font-bold text-purple-600">
          {patients.filter(p => p.gender === 'Female').length}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-gray-500 text-sm">Active Patients</h3>
        <p className="text-3xl font-bold text-orange-600">
          {filteredPatients.length}
        </p>
      </div>
    </div>



      {/* Search */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-4 py-2 w-full md:w-96"
        />

      </div>

      {/* Table */}

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
                <th className="p-3">Age</th>
                <th className="p-3">Gender</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Actions</th>

              </tr>

            </thead>

            <tbody>

              {currentPatients.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      <p className="text-gray-500 text-lg">No patients found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new patient</p>
                    </div>
                  </td>

                </tr>

              ) : (

                currentPatients.map((patient) => (

                  <tr
                    key={patient.id}
                    className="border-b hover:bg-gray-100"
                  >

                    <td className="p-3">{patient.id}</td>

                    <td className="p-3">
                      {patient.full_name}
                    </td>

                    <td className="p-3">
                      {patient.email}
                    </td>

                    <td className="p-3">
                      {patient.age}
                    </td>

                    <td className="p-3">
                      {patient.gender}
                    </td>

                    <td className="p-3">
                      {patient.phone}
                    </td>

                    <td className="p-3">
                      {patient.blood_group}
                    </td>

                    <td className="p-3 flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const response = await getPatientById(patient.id);
                            setSelectedPatient(response.data);
                            setIsModalOpen(true);
                          } catch (error) {
                            console.error(error);
                            toast.error("Failed to load patient details.");
                          }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(patient.id)}
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

      {/* Pagination */}

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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
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
         <AddEditPatientModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchPatients}
            patient={selectedPatient}
            />
    </MainLayout>
  );
}

export default Patients;