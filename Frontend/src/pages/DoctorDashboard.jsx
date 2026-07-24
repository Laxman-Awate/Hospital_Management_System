import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Calendar, ClipboardList, Clock, CheckCircle, Users, Activity, Stethoscope, Award } from "lucide-react";

function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorStats = async () => {
      try {
        const { getAppointments } = await import("../services/appointmentService");
        const { getPatients } = await import("../services/patientService");

        const [appointmentsRes, patientsRes] = await Promise.all([
          getAppointments(),
          getPatients(),
        ]);

        const appointments = appointmentsRes.data || [];
        const patients = patientsRes.data.patients || [];

        const doctorAppointments = appointments.filter(a => a.doctor_id === user?.id);
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = doctorAppointments.filter(a => a.date === today);

        setStats({
          appointments: doctorAppointments.length,
          scheduledAppointments: doctorAppointments.filter(a => a.status === "Scheduled").length,
          completedAppointments: doctorAppointments.filter(a => a.status === "Completed").length,
          todayAppointments: todayAppointments.length,
          totalPatients: patients.length,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDoctorStats();
    }
  }, [user]);

  return (
    <MainLayout>
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome, Dr. {user?.full_name || "Doctor"}
          </h1>
          <p className="text-slate-500 mt-1">Here is what's happening with your practice today.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Appointments"
              value={stats.appointments}
              icon={Calendar}
              color="blue"
            />
            <DashboardCard
              title="Today's Appointments"
              value={stats.todayAppointments}
              icon={ClipboardList}
              color="emerald"
            />
            <DashboardCard
              title="Scheduled"
              value={stats.scheduledAppointments}
              icon={Clock}
              color="amber"
            />
            <DashboardCard
              title="Completed"
              value={stats.completedAppointments}
              icon={CheckCircle}
              color="teal"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Total Patients"
              value={stats.totalPatients}
              icon={Users}
              color="blue"
            />
            <DashboardCard
              title="Doctor ID"
              value={user?.id || "N/A"}
              icon={Activity}
              color="gray"
            />
            <DashboardCard
              title="Specialization"
              value={user?.specialization || "N/A"}
              icon={Stethoscope}
              color="emerald"
            />
            <DashboardCard
              title="Experience"
              value={`${user?.experience || 0} years`}
              icon={Award}
              color="teal"
            />
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default DoctorDashboard;