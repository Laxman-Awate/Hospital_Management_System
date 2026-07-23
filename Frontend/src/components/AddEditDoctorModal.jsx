import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AddEditDoctorModal({ isOpen, onClose, onSuccess, doctor }) {
  const initialState = {
    full_name: "",
    email: "",
    password: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultation_fee: "",
    department: "",
    phone: "",
    available_days: "",
    available_time: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        full_name: doctor.full_name || "",
        email: doctor.email || "",
        password: "",
        specialization: doctor.specialization || "",
        qualification: doctor.qualification || "",
        experience: doctor.experience || "",
        consultation_fee: doctor.consultation_fee || "",
        department: doctor.department || "",
        phone: doctor.phone || "",
        available_days: doctor.available_days || "",
        available_time: doctor.available_time || "",
      });
    } else {
      setFormData(initialState);
    }
  }, [doctor]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.specialization
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!doctor && !formData.password) {
      toast.error("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const { createDoctor, updateDoctor } = await import(
        "../services/doctorService"
      );

      if (doctor) {
        await updateDoctor(doctor.id, formData);
        toast.success("Doctor updated successfully.");
      } else {
        await createDoctor(formData);
        toast.success("Doctor added successfully.");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        doctor
          ? "Failed to update doctor."
          : "Failed to add doctor."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">

          <h2 className="text-2xl font-bold mb-6">
            {doctor ? "Edit Doctor" : "Add Doctor"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            {!doctor && (
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
                required
              />
            )}

            <input
              type="text"
              name="specialization"
              placeholder="Specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <input
              type="text"
              name="qualification"
              placeholder="Qualification"
              value={formData.qualification}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              type="number"
              name="experience"
              placeholder="Experience (Years)"
              value={formData.experience}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              type="number"
              name="consultation_fee"
              placeholder="Consultation Fee"
              value={formData.consultation_fee}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              name="available_days"
              placeholder="Available Days (Mon-Fri)"
              value={formData.available_days}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              name="available_time"
              placeholder="Available Time (10:00 AM - 5:00 PM)"
              value={formData.available_time}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                {loading
                  ? "Saving..."
                  : doctor
                  ? "Update Doctor"
                  : "Add Doctor"}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}

export default AddEditDoctorModal;