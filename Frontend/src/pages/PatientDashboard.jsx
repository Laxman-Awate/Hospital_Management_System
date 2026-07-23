import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    totalBills: 0,
    paidBills: 0,
    pendingBills: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        const { getAppointments } = await import("../services/appointmentService");
        const { getBills } = await import("../services/billingService");

        const [appointmentsRes, billsRes] = await Promise.all([
          getAppointments(),
          getBills(),
        ]);

        const appointments = appointmentsRes.data || [];
        const bills = billsRes.data || [];

        const patientAppointments = appointments.filter(a => a.patient_id === user?.id);
        const patientBills = bills.filter(b => b.patient_id === user?.id);

        const totalAmount = patientBills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
        const paidBills = patientBills.filter(b => b.payment_status === "Paid").length;
        const pendingBills = patientBills.filter(b => b.payment_status === "Pending").length;

        setStats({
          appointments: patientAppointments.length,
          scheduledAppointments: patientAppointments.filter(a => a.status === "Scheduled").length,
          completedAppointments: patientAppointments.filter(a => a.status === "Completed").length,
          totalBills: patientBills.length,
          paidBills,
          pendingBills,
          totalAmount,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchPatientStats();
    }
  }, [user]);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.full_name || "Patient"}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Appointments"
              value={stats.appointments}
              icon="📅"
              color="blue"
            />
            <DashboardCard
              title="Scheduled"
              value={stats.scheduledAppointments}
              icon="📋"
              color="green"
            />
            <DashboardCard
              title="Completed"
              value={stats.completedAppointments}
              icon="✅"
              color="purple"
            />
            <DashboardCard
              title="Total Bills"
              value={stats.totalBills}
              icon="📄"
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Paid Bills"
              value={stats.paidBills}
              icon="💵"
              color="green"
            />
            <DashboardCard
              title="Pending Bills"
              value={stats.pendingBills}
              icon="⏳"
              color="yellow"
            />
            <DashboardCard
              title="Total Amount"
              value={`$${stats.totalAmount.toFixed(2)}`}
              icon="💰"
              color="blue"
            />
            <DashboardCard
              title="Patient ID"
              value={user?.id || "N/A"}
              icon="🆔"
              color="gray"
            />
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default PatientDashboard;