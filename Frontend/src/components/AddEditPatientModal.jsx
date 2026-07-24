import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createPatient, updatePatient } from "../services/patientService";
import Modal from "./Modal";

const inputClass = "block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

function AddEditPatientModal({ isOpen, onClose, onSuccess, patient }) {
  const initialState = {
    full_name: "", email: "", password: "", age: "", gender: "",
    phone: "", blood_group: "", date_of_birth: "", address: "",
    emergency_contact: "", medical_history: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || "", email: patient.email || "", password: "",
        age: patient.age || "", gender: patient.gender || "", phone: patient.phone || "",
        blood_group: patient.blood_group || "", date_of_birth: patient.date_of_birth || "",
        address: patient.address || "", emergency_contact: patient.emergency_contact || "",
        medical_history: patient.medical_history || "",
      });
    } else {
      setFormData(initialState);
    }
  }, [patient, isOpen]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
      toast.error(error?.response?.data?.message || "Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={patient ? "Edit Patient" : "Add New Patient"} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
          <input name="full_name" placeholder="John Doe" value={formData.full_name} onChange={handleChange} disabled={!!patient} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
          <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} disabled={!!patient} required className={inputClass} />
        </div>
        {!patient && (
          <div>
            <label className={labelClass}>Password <span className="text-red-500">*</span></label>
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className={inputClass} />
          </div>
        )}
        <div>
          <label className={labelClass}>Age <span className="text-red-500">*</span></label>
          <input type="number" name="age" placeholder="25" value={formData.age} onChange={handleChange} required className={inputClass} min="0" />
        </div>
        <div>
          <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
          <select name="gender" value={formData.gender} onChange={handleChange} required className={inputClass}>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
          <input name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Blood Group</label>
          <input name="blood_group" placeholder="A+" value={formData.blood_group} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Date of Birth</label>
          <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Emergency Contact</label>
          <input name="emergency_contact" placeholder="+91 98765 00000" value={formData.emergency_contact} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input name="address" placeholder="123 Main St, City" value={formData.address} onChange={handleChange} className={inputClass} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Medical History</label>
          <textarea rows="3" name="medical_history" placeholder="Previous conditions, allergies..." value={formData.medical_history} onChange={handleChange} className={`${inputClass} resize-none`} />
        </div>

        <div className="md:col-span-2 flex gap-3 pt-2 border-t border-slate-100 mt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-70 transition-colors shadow-sm">
            {saving ? "Saving..." : patient ? "Update Patient" : "Add Patient"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddEditPatientModal;
