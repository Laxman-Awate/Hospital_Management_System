import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createPatient,
  updatePatient,
} from "../services/patientService";

function AddEditPatientModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
}) {
  const initialState = {
    user_id: "",
    age: "",
    gender: "",
    phone: "",
    blood_group: "",
    date_of_birth: "",
    address: "",
    emergency_contact: "",
    medical_history: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        user_id: patient.user_id || "",
        age: patient.age || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        blood_group: patient.blood_group || "",
        date_of_birth: patient.date_of_birth || "",
        address: patient.address || "",
        emergency_contact: patient.emergency_contact || "",
        medical_history: patient.medical_history || "",
      });
    } else {
      setFormData(initialState);
    }
  }, [patient]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      if (patient) {
        await updatePatient(patient.id, formData);
        toast.success("Patient updated successfully");
      } else {
        await createPatient(formData);
        toast.success("Patient added successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Operation failed."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">

        {/* Header */}

        <div className="flex justify-between items-center border-b px-6 py-4">

          <h2 className="text-2xl font-bold text-blue-700">

            {patient ? "Edit Patient" : "Add Patient"}

          </h2>

          <button
            onClick={onClose}
            className="text-2xl hover:text-red-600"
          >
            ×
          </button>

        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <input
            type="number"
            name="user_id"
            placeholder="User ID"
            value={formData.user_id}
            onChange={handleChange}
            disabled={patient}
            required
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
            className="border rounded-lg p-3"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="border rounded-lg p-3"
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="border rounded-lg p-3"
          />

          <input
            name="blood_group"
            placeholder="Blood Group"
            value={formData.blood_group}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            name="emergency_contact"
            placeholder="Emergency Contact"
            value={formData.emergency_contact}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="border rounded-lg p-3"
          />

          <textarea
            rows="4"
            name="medical_history"
            placeholder="Medical History"
            value={formData.medical_history}
            onChange={handleChange}
            className="border rounded-lg p-3 md:col-span-2 resize-none"
          />

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving
                ? "Saving..."
                : patient
                ? "Update Patient"
                : "Add Patient"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddEditPatientModal;