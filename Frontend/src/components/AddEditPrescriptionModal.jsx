import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createPrescription, updatePrescription } from "../services/prescriptionService";

function AddEditPrescriptionModal({ isOpen, onClose, onSuccess, prescription }) {
  const [formData, setFormData] = useState({
    appointment_id: "",
    diagnosis: "",
    medicines: "",
    instructions: "",
    next_visit: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      appointment_id: prescription?.appointment_id || "",
      diagnosis: prescription?.diagnosis || "",
      medicines: prescription?.medicines || "",
      instructions: prescription?.instructions || "",
      next_visit: prescription?.next_visit || "",
    });
  }, [prescription, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!prescription && !formData.appointment_id) {
      toast.error("Appointment ID is required.");
      return;
    }
    if (!formData.diagnosis.trim() || !formData.medicines.trim() || !formData.instructions.trim()) {
      toast.error("Please fill in diagnosis, medicines, and instructions.");
      return;
    }

    setLoading(true);
    try {
      if (prescription) {
        const updates = { ...formData };
        delete updates.appointment_id;
        await updatePrescription(prescription.id, updates);
      } else {
        await createPrescription({ ...formData, appointment_id: Number(formData.appointment_id) });
      }
      toast.success(prescription ? "Prescription updated successfully." : "Prescription created successfully.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save the prescription.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-6">{prescription ? "Edit Prescription" : "Create Prescription"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!prescription && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment ID *</label>
              <input name="appointment_id" type="number" min="1" value={formData.appointment_id} onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })} className="w-full border rounded-lg px-4 py-2" required />
              <p className="text-xs text-gray-500 mt-1">Doctor and patient are securely taken from this appointment.</p>
            </div>
          )}
          {[["diagnosis", "Diagnosis"], ["medicines", "Medicines"], ["instructions", "Instructions"]].map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
              <textarea name={name} rows="3" value={formData[name]} onChange={(e) => setFormData({ ...formData, [name]: e.target.value })} className="w-full border rounded-lg px-4 py-2" required />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Visit</label>
            <input name="next_visit" type="date" value={formData.next_visit} onChange={(e) => setFormData({ ...formData, next_visit: e.target.value })} className="w-full border rounded-lg px-4 py-2" />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50">{loading ? "Saving..." : prescription ? "Update" : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEditPrescriptionModal;
