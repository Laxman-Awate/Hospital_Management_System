import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import MainLayout from "../layouts/MainLayout";
import { deleteNotification, getNotifications, markNotificationRead } from "../services/notificationService";
import { Bell, BellOff, Check, Trash2, Search } from "lucide-react";

const typeColors = {
  info: "bg-blue-50 border-blue-200 text-blue-700",
  success: "bg-emerald-50 border-emerald-200 text-emerald-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  error: "bg-red-50 border-red-200 text-red-700",
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const filtered = useMemo(() => notifications.filter((item) => {
    const term = search.toLowerCase();
    return [item.title, item.message, item.type].some((v) => v?.toLowerCase().includes(term));
  }), [notifications, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice((page - 1) * perPage, page * perPage);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(item => item.id === id ? { ...item, is_read: true } : item));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to mark notification as read.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await deleteNotification(id);
      toast.success("Notification deleted.");
      setNotifications(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete notification.");
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Stay up to date with your alerts</p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-xl font-medium text-sm">
            <Bell className="w-4 h-4" />
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search notifications..."
          className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-96 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
      ) : current.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center flex flex-col items-center">
          <BellOff className="w-14 h-14 text-slate-200 mb-4" />
          <h3 className="text-lg font-semibold text-slate-500">No notifications found</h3>
          <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {current.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all ${!item.is_read ? "border-l-4 border-l-blue-500 border-slate-100" : "border-slate-100"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-slate-800 truncate">{item.title}</h2>
                  {!item.is_read && (
                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-full">New</span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-line line-clamp-3">{item.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[item.type?.toLowerCase()] || "bg-slate-50 border-slate-200 text-slate-600"}`}>{item.type}</span>
                  {item.created_at && <span className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</span>}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {!item.is_read && (
                  <button
                    onClick={() => markRead(item.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-medium"
                  >
                    <Check className="w-4 h-4" /> Mark read
                  </button>
                )}
                <button
                  onClick={() => remove(item.id)}
                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Previous</button>
          <span className="text-sm text-slate-500">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}
    </MainLayout>
  );
}

export default Notifications;
