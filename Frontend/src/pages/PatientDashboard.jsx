import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Calendar, ClipboardList, CheckCircle, FileText, CheckSquare, Clock, DollarSign, UserCircle, Bell } from "lucide-react";

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
    patientId: null,
   });
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientStats = async () => {
      try {
        const { getAppointments } = await import("../services/appointmentService");
        const { getBills } = await import("../services/billingService");
        const { getNotifications } = await import("../services/notificationService");

        const [appointmentsRes, billsRes, notificationsRes] = await Promise.all([
          getAppointments(),
          getBills(),
          getNotifications(),
        ]);

        const patientAppointments = appointmentsRes.data || [];
        const patientBills = billsRes.data || [];
        const patientNotifications = notificationsRes.data || [];
        const patientId = patientAppointments.length > 0 ? patientAppointments[0].patient_id : null;

        setAppointments(patientAppointments);
        setBills(patientBills);
        setNotifications(patientNotifications);

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
          patientId,
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
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome, {user?.full_name || "Patient"}
          </h1>
          <p className="text-slate-500 mt-1">Here is a summary of your medical profile and bills.</p>
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
              title="Scheduled"
              value={stats.scheduledAppointments}
              icon={ClipboardList}
              color="emerald"
            />
            <DashboardCard
              title="Completed"
              value={stats.completedAppointments}
              icon={CheckCircle}
              color="teal"
            />
            <DashboardCard
              title="Total Bills"
              value={stats.totalBills}
              icon={FileText}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Paid Bills"
              value={stats.paidBills}
              icon={CheckSquare}
              color="emerald"
            />
            <DashboardCard
              title="Pending Bills"
              value={stats.pendingBills}
              icon={Clock}
              color="amber"
            />
            <DashboardCard
              title="Total Amount"
              value={`$${stats.totalAmount.toFixed(2)}`}
              icon={DollarSign}
              color="blue"
            />
            <DashboardCard
                  title="Patient ID"
                  value={stats.patientId || "N/A"}
                  icon={UserCircle}
                  color="gray"
              />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
              <h2 className="font-semibold text-lg text-slate-800 mb-4">Upcoming Appointments</h2>
              <div className="space-y-3">
                {appointments.filter((item) => item.status === "Scheduled").slice(0, 5).length ? (
                  appointments.filter((item) => item.status === "Scheduled").slice(0, 5).map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-3">
                      <p className="font-medium text-slate-800">Dr. {item.doctor}</p>
                      <p className="text-sm text-slate-500">{item.date} at {item.time}</p>
                      <p className="text-xs text-slate-400 mt-1">{item.reason || "No reason provided"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No upcoming appointments.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
              <h2 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2"><Bell className="w-5 h-5" />Recent Notifications</h2>
              <div className="space-y-3">
                {notifications.slice(0, 5).length ? (
                  notifications.slice(0, 5).map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-3">
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No recent notifications.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
              <h2 className="font-semibold text-lg text-slate-800 mb-4">Bill Summary</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between"><span>Total Bills</span><span className="font-medium text-slate-800">{bills.length}</span></div>
                <div className="flex justify-between"><span>Paid</span><span className="font-medium text-slate-800">{stats.paidBills}</span></div>
                <div className="flex justify-between"><span>Pending</span><span className="font-medium text-slate-800">{stats.pendingBills}</span></div>
                <div className="flex justify-between"><span>Total Amount</span><span className="font-medium text-slate-800">${stats.totalAmount.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default PatientDashboard;