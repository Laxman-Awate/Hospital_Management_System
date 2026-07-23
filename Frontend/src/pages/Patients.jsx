import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getPatients, deletePatient } from "../services/patientService";
import AddEditPatientModal from "../components/AddEditPatientModal";
import {
  getPatients,
  getPatientById,
  deletePatient,
} from "../services/patientService";

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
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Patient
        </button>

      </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="text-gray-500 text-sm">Total Patients</h3>
        <p className="text-3xl font-bold text-blue-600">
          {patients.length}
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
        <p className="text-center text-lg">
          Loading Patients...
        </p>
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
                    className="text-center py-8"
                  >
                    No patients found.
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

                    <td className="p-3">

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
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                    >
                        Edit
                    </button>
                      <button
                          onClick={() => {
                          setSelectedPatient(null);
                          setIsModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                      >
                        + Add Patient
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

      <div className="flex justify-center items-center mt-6 gap-4">

        <button
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage(currentPage - 1)
          }
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>

          Page {currentPage} of {totalPages || 1}

        </span>

        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() =>
            setCurrentPage(currentPage + 1)
          }
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>

      </div>
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