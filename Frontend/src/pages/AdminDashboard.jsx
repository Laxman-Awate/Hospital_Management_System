import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";
import { toast } from "react-toastify";

function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    revenue: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    paidBills: 0,
    pendingBills: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { getPatients } = await import("../services/patientService");
        const { getDoctors } = await import("../services/doctorService");
        const { getAppointments } = await import("../services/appointmentService");
        const { getBills } = await import("../services/billingService");

        const [patientsRes, doctorsRes, appointmentsRes, billsRes] = await Promise.all([
          getPatients(),
          getDoctors(),
          getAppointments(),
          getBills(),
        ]);

        const patients = patientsRes.data.patients || [];
        const doctors = doctorsRes.data.doctors || [];
        const appointments = appointmentsRes.data || [];
        const bills = billsRes.data || [];

        const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
        const paidBills = bills.filter(b => b.payment_status === "Paid").length;
        const pendingBills = bills.filter(b => b.payment_status === "Pending").length;

        setStats({
          patients: patients.length,
          doctors: doctors.length,
          appointments: appointments.length,
          revenue: totalRevenue,
          scheduledAppointments: appointments.filter(a => a.status === "Scheduled").length,
          completedAppointments: appointments.filter(a => a.status === "Completed").length,
          paidBills,
          pendingBills,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Patients"
              value={stats.patients}
              icon="👥"
              color="blue"
            />
            <DashboardCard
              title="Total Doctors"
              value={stats.doctors}
              icon="👨‍⚕️"
              color="green"
            />
            <DashboardCard
              title="Total Appointments"
              value={stats.appointments}
              icon="📅"
              color="purple"
            />
            <DashboardCard
              title="Total Revenue"
              value={`$${stats.revenue.toFixed(2)}`}
              icon="💰"
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Scheduled Appointments"
              value={stats.scheduledAppointments}
              icon="📋"
              color="blue"
            />
            <DashboardCard
              title="Completed Appointments"
              value={stats.completedAppointments}
              icon="✅"
              color="green"
            />
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
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default AdminDashboard;