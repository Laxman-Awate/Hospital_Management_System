import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";

const inputClass = "block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

function AddEditAppointmentModal({ isOpen, onClose, onSuccess, appointment }) {
  const [formData, setFormData] = useState({
    patient_id: "", doctor_id: "", appointment_date: "",
    appointment_time: "", reason: "", status: "Scheduled",
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPatientsAndDoctors = async () => {
      try {
        const { getPatients } = await import("../services/patientService");
        const { getDoctors } = await import("../services/doctorService");
        const [patientsRes, doctorsRes] = await Promise.all([getPatients(), getDoctors()]);
        setPatients(patientsRes.data.patients || []);
        setDoctors(doctorsRes.data.doctors || []);
      } catch (error) { console.error(error); }
    };
    if (isOpen) fetchPatientsAndDoctors();
  }, [isOpen]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id || "", doctor_id: appointment.doctor_id || "",
        appointment_date: appointment.appointment_date || "", appointment_time: appointment.appointment_time || "",
        reason: appointment.reason || "", status: appointment.status || "Scheduled",
      });
    } else {
      setFormData({ patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "", reason: "", status: "Scheduled" });
    }
  }, [appointment, isOpen]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time || !formData.reason) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const { createAppointment, updateAppointment } = await import("../services/appointmentService");
      if (appointment) {
        await updateAppointment(appointment.id, formData);
        toast.success("Appointment updated successfully.");
      } else {
        await createAppointment(formData);
        toast.success("Appointment booked successfully.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(appointment ? "Failed to update appointment." : "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={appointment ? "Edit Appointment" : "Book New Appointment"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Patient <span className="text-red-500">*</span></label>
          <select name="patient_id" value={formData.patient_id} onChange={handleChange} className={inputClass} required>
            <option value="">Select Patient</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name} (ID: {p.id})</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Doctor <span className="text-red-500">*</span></label>
          <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} className={inputClass} required>
            <option value="">Select Doctor</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.full_name} — {d.specialization}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date <span className="text-red-500">*</span></label>
            <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Time <span className="text-red-500">*</span></label>
            <input type="time" name="appointment_time" value={formData.appointment_time} onChange={handleChange} className={inputClass} required />
          </div>
        </div>
        <div>
          <label className={labelClass}>Reason <span className="text-red-500">*</span></label>
          <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" placeholder="Describe the reason for visit..." className={`${inputClass} resize-none`} required />
        </div>
        {appointment && (
          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-Show">No-Show</option>
            </select>
          </div>
        )}
        <div className="flex gap-3 pt-2 border-t border-slate-100 mt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-70 transition-colors shadow-sm">
            {loading ? "Saving..." : appointment ? "Update" : "Book Appointment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddEditAppointmentModal;
