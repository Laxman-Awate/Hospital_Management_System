import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Modal from "./Modal";

const inputClass = "block w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

function AddEditBillModal({ isOpen, onClose, onSuccess, bill }) {
  const [formData, setFormData] = useState({
    appointment_id: "", consultation_fee: "", medicine_charge: "",
    lab_charge: "", other_charge: "", payment_method: "Cash", payment_status: "Pending",
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { getAppointments } = await import("../services/appointmentService");
        const res = await getAppointments();
        setAppointments(res.data || []);
      } catch (error) { console.error(error); }
    };
    if (isOpen) fetchAppointments();
  }, [isOpen]);

  useEffect(() => {
    if (bill) {
      setFormData({
        appointment_id: bill.appointment_id || "", consultation_fee: bill.consultation_fee || "",
        medicine_charge: bill.medicine_charge || "", lab_charge: bill.lab_charge || "",
        other_charge: bill.other_charge || "", payment_method: bill.payment_method || "Cash",
        payment_status: bill.payment_status || "Pending",
      });
    } else {
      setFormData({ appointment_id: "", consultation_fee: "", medicine_charge: "", lab_charge: "", other_charge: "", payment_method: "Cash", payment_status: "Pending" });
    }
  }, [bill, isOpen]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const calculateTotal = () =>
    (parseFloat(formData.consultation_fee) || 0) + (parseFloat(formData.medicine_charge) || 0) +
    (parseFloat(formData.lab_charge) || 0) + (parseFloat(formData.other_charge) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appointment_id) { toast.error("Please select an appointment."); return; }
    const billData = {
      ...formData,
      consultation_fee: parseFloat(formData.consultation_fee) || 0,
      medicine_charge: parseFloat(formData.medicine_charge) || 0,
      lab_charge: parseFloat(formData.lab_charge) || 0,
      other_charge: parseFloat(formData.other_charge) || 0,
      total_amount: calculateTotal(),
    };
    setLoading(true);
    try {
      const { createBill, updateBill } = await import("../services/billingService");
      if (bill) {
        await updateBill(bill.id, billData);
        toast.success("Bill updated successfully.");
      } else {
        await createBill(billData);
        toast.success("Bill generated successfully.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(bill ? "Failed to update bill." : "Failed to generate bill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={bill ? "Edit Bill" : "Generate New Bill"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Appointment <span className="text-red-500">*</span></label>
          <select name="appointment_id" value={formData.appointment_id} onChange={handleChange} className={inputClass} required>
            <option value="">Select Appointment</option>
            {appointments.map((a) => <option key={a.id} value={a.id}>{a.patient} — Dr. {a.doctor} ({a.date})</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "consultation_fee", label: "Consultation Fee" },
            { name: "medicine_charge", label: "Medicine Charge" },
            { name: "lab_charge", label: "Lab Charge" },
            { name: "other_charge", label: "Other Charge" },
          ].map((field) => (
            <div key={field.name}>
              <label className={labelClass}>{field.label}</label>
              <input type="number" name={field.name} value={formData[field.name]} onChange={handleChange} min="0" step="0.01" placeholder="0.00" className={inputClass} />
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-700">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Payment Method</label>
            <select name="payment_method" value={formData.payment_method} onChange={handleChange} className={inputClass}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Insurance">Insurance</option>
              <option value="Online">Online</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Payment Status</label>
            <select name="payment_status" value={formData.payment_status} onChange={handleChange} className={inputClass}>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-100 mt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-70 transition-colors shadow-sm">
            {loading ? "Saving..." : bill ? "Update Bill" : "Generate Bill"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddEditBillModal;
