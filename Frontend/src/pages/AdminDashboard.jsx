import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "react-toastify";
import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";
import { Users, UserPlus, Calendar, CalendarCheck, Clock, CheckCircle, XCircle, Receipt, DollarSign, Wallet } from "lucide-react";
import {
  getDashboardSummary,
  getMonthlyAppointments,
  getMonthlyRevenue,
  getPatientGrowth,
  getRecentAppointments,
  getRecentNotifications,
  getRecentPrescriptions,
} from "../services/dashboardService";

const currency = (amount) => `₹${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function ChartPanel({ title, children }) {
  return (
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-96">
          <h2 className="font-semibold text-lg text-slate-800 mb-6">{title}</h2>
          <div className="flex-1 min-h-0 w-full">{children}</div>
      </section>
  );
}

function AdminDashboard() {
  const [summary, setSummary] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  
    const loadDashboard = async () => {
      try {
        const [summaryRes, revenueRes, appointmentsRes, growthRes, recentRes, notificationsRes, prescriptionsRes] = await Promise.all([
          getDashboardSummary(), getMonthlyRevenue(), getMonthlyAppointments(), getPatientGrowth(),
          getRecentAppointments(), getRecentNotifications(), getRecentPrescriptions(),
        ]);
        setSummary(summaryRes.data || {});
        setRevenue(revenueRes.data || []);
        setAppointments(appointmentsRes.data || []);
        setGrowth(growthRes.data || []);
        setRecentAppointments(recentRes.data || []);
        setNotifications(notificationsRes.data || []);
        setPrescriptions(prescriptionsRes.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load dashboard analytics.");
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
    loadDashboard();
  }, []);

  const cards = [
    { title: "Total Doctors", value: summary.total_doctors, color: "blue", icon: Users },
    { title: "Total Patients", value: summary.total_patients, color: "emerald", icon: UserPlus },
    { title: "Total Appointments", value: summary.total_appointments, color: "teal", icon: Calendar },
    { title: "Today's Appointments", value: summary.today_appointments, color: "blue", icon: CalendarCheck },
    { title: "Pending Appointments", value: summary.pending_appointments, color: "amber", icon: Clock },
    { title: "Completed Appointments", value: summary.completed_appointments, color: "emerald", icon: CheckCircle },
    { title: "Cancelled Appointments", value: summary.cancelled_appointments, color: "red", icon: XCircle },
    { title: "Total Bills", value: summary.total_bills, color: "teal", icon: Receipt },
    { title: "Today's Revenue", value: currency(summary.today_revenue), color: "blue", icon: DollarSign },
    { title: "Total Revenue", value: currency(summary.total_revenue), color: "emerald", icon: Wallet },
  ];

  const apptColumns = [
    { header: "Patient", accessor: "patient" },
    { header: "Doctor", accessor: "doctor" },
    { header: "Date", accessor: "date" },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Hospital performance at a glance</p>
      </div>

      {loading ? (
          <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
      ) : (
      <>
        {/* Top KPI Cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {cards.map((c) => (
              <DashboardCard key={c.title} title={c.title} value={c.value ?? 0} color={c.color} icon={c.icon} />
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <ChartPanel title="Monthly Revenue">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(value) => currency(value)} cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
              </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Monthly Appointments">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={appointments}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Line type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
              </ResponsiveContainer>
          </ChartPanel>
        </div>

        {/* Charts Row 2 + Notifications */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2">
              <ChartPanel title="Patient Growth">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growth}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                          <Area type="monotone" dataKey="patients" stroke="#0ea5e9" fill="#e0f2fe" strokeWidth={3} />
                      </AreaChart>
                  </ResponsiveContainer>
              </ChartPanel>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-96">
              <h2 className="font-semibold text-lg text-slate-800 mb-6 flex items-center justify-between">
                  Recent Notifications
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{notifications.length} new</span>
              </h2>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                  {notifications.length ? notifications.map((item) => (
                      <div key={item.id} className="relative pl-4 border-l-2 border-blue-200 hover:border-blue-500 transition-colors">
                          <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.message}</p>
                          <p className="text-[10px] font-semibold text-blue-600 mt-1 uppercase tracking-wider">{item.type}</p>
                      </div>
                  )) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <Clock className="w-8 h-8 mb-2 opacity-50" />
                          <p>No recent notifications.</p>
                      </div>
                  )}
              </div>
          </section>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="flex flex-col">
              <h2 className="font-semibold text-lg text-slate-800 mb-4">Latest Appointments</h2>
              <Table 
                  columns={apptColumns} 
                  data={recentAppointments} 
                  emptyMessage="No recent appointments found." 
              />
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
              <h2 className="font-semibold text-lg text-slate-800 mb-6">Recent Prescriptions</h2>
              <div className="space-y-4 flex-1">
                  {prescriptions.length ? prescriptions.map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                          <div>
                              <p className="font-medium text-slate-800">
                                  {item.patient_name || "Patient"} 
                                  <span className="font-normal text-slate-500 ml-2 text-sm">· Dr. {item.doctor_name || "Unknown"}</span>
                              </p>
                              <p className="text-sm text-slate-600 mt-1 truncate max-w-sm">{item.diagnosis}</p>
                          </div>
                          <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-100">
                              Appt #{item.appointment_id}
                          </span>
                      </div>
                  )) : (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                          <FileText className="w-8 h-8 mb-2 opacity-50" />
                          <p>No recent prescriptions.</p>
                      </div>
                  )}
              </div>
          </section>
        </div>
      </>)}
    </MainLayout>
  );
}

export default AdminDashboard;
