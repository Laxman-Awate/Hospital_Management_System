import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";

const inputClass = "block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

function AddEditDoctorModal({ isOpen, onClose, onSuccess, doctor }) {
  const initialState = {
    full_name: "", email: "", password: "", specialization: "",
    qualification: "", experience: "", consultation_fee: "",
    department: "", phone: "", available_days: "", available_time: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        full_name: doctor.full_name || "", email: doctor.email || "", password: "",
        specialization: doctor.specialization || "", qualification: doctor.qualification || "",
        experience: doctor.experience || "", consultation_fee: doctor.consultation_fee || "",
        department: doctor.department || "", phone: doctor.phone || "",
        available_days: doctor.available_days || "", available_time: doctor.available_time || "",
      });
    } else {
      setFormData(initialState);
    }
  }, [doctor, isOpen]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.specialization) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!doctor && !formData.password) {
      toast.error("Password is required.");
      return;
    }
    setLoading(true);
    try {
      const { createDoctor, updateDoctor } = await import("../services/doctorService");
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
      toast.error(doctor ? "Failed to update doctor." : "Failed to add doctor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doctor ? "Edit Doctor" : "Add New Doctor"} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
          <input type="text" name="full_name" placeholder="Dr. Jane Smith" value={formData.full_name} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
          <input type="email" name="email" placeholder="doctor@hospital.com" value={formData.email} onChange={handleChange} className={inputClass} required />
        </div>
        {!doctor && (
          <div>
            <label className={labelClass}>Password <span className="text-red-500">*</span></label>
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className={inputClass} required />
          </div>
        )}
        <div>
          <label className={labelClass}>Specialization <span className="text-red-500">*</span></label>
          <input type="text" name="specialization" placeholder="Cardiology" value={formData.specialization} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Qualification</label>
          <input type="text" name="qualification" placeholder="MBBS, MD" value={formData.qualification} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Experience (Years)</label>
          <input type="number" name="experience" placeholder="5" value={formData.experience} onChange={handleChange} className={inputClass} min="0" />
        </div>
        <div>
          <label className={labelClass}>Consultation Fee</label>
          <input type="number" name="consultation_fee" placeholder="500" value={formData.consultation_fee} onChange={handleChange} className={inputClass} min="0" />
        </div>
        <div>
          <label className={labelClass}>Department</label>
          <input type="text" name="department" placeholder="Cardiology Dept." value={formData.department} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input type="text" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Available Days</label>
          <input type="text" name="available_days" placeholder="Mon-Fri" value={formData.available_days} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Available Time</label>
          <input type="text" name="available_time" placeholder="10:00 AM - 5:00 PM" value={formData.available_time} onChange={handleChange} className={inputClass} />
        </div>

        <div className="md:col-span-2 flex gap-3 pt-2 border-t border-slate-100 mt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-70 transition-colors shadow-sm">
            {loading ? "Saving..." : doctor ? "Update Doctor" : "Add Doctor"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddEditDoctorModal;