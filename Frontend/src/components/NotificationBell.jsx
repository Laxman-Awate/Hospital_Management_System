import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications } from "../services/notificationService";
import { Bell } from "lucide-react";

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadCount = async () => {
      try {
        const response = await getNotifications();
        if (mounted) setUnreadCount((response.data || []).filter((item) => !item.is_read).length);
      } catch {
        // A failed count request should not interrupt navigation or logout.
      }
    };
    loadCount();
    const interval = window.setInterval(loadCount, 30000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <Link to="/notifications" aria-label="Notifications" className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-50">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
          </span>
      )}
    </Link>
  );
}

export default NotificationBell;
