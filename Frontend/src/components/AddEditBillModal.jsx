import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function AddEditBillModal({ isOpen, onClose, onSuccess, bill }) {
  const [formData, setFormData] = useState({
    appointment_id: "",
    consultation_fee: "",
    medicine_charge: "",
    lab_charge: "",
    other_charge: "",
    payment_method: "Cash",
    payment_status: "Pending",
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { getAppointments } = await import("../services/appointmentService");
        const appointmentsRes = await getAppointments();
        setAppointments(appointmentsRes.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    if (isOpen) {
      fetchAppointments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (bill) {
      setFormData({
        appointment_id: bill.appointment_id || "",
        consultation_fee: bill.consultation_fee || "",
        medicine_charge: bill.medicine_charge || "",
        lab_charge: bill.lab_charge || "",
        other_charge: bill.other_charge || "",
        payment_method: bill.payment_method || "Cash",
        payment_status: bill.payment_status || "Pending",
      });
    } else {
      setFormData({
        appointment_id: "",
        consultation_fee: "",
        medicine_charge: "",
        lab_charge: "",
        other_charge: "",
        payment_method: "Cash",
        payment_status: "Pending",
      });
    }
  }, [bill]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    const consultation = parseFloat(formData.consultation_fee) || 0;
    const medicine = parseFloat(formData.medicine_charge) || 0;
    const lab = parseFloat(formData.lab_charge) || 0;
    const other = parseFloat(formData.other_charge) || 0;
    return consultation + medicine + lab + other;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointment_id) {
      toast.error("Please select an appointment.");
      return;
    }

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {bill ? "Edit Bill" : "Generate New Bill"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment *
              </label>
              <select
                name="appointment_id"
                value={formData.appointment_id}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Appointment</option>
                {appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.patient} - {appointment.doctor} ({appointment.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Fee
                </label>
                <input
                  type="number"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Charge
                </label>
                <input
                  type="number"
                  name="medicine_charge"
                  value={formData.medicine_charge}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lab Charge
                </label>
                <input
                  type="number"
                  name="lab_charge"
                  value={formData.lab_charge}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Charge
                </label>
                <input
                  type="number"
                  name="other_charge"
                  value={formData.other_charge}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving..." : bill ? "Update" : "Generate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEditBillModal;
