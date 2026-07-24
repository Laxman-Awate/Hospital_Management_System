import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, Users, User, Calendar, Receipt, FileText, Bell, MessageSquare, Hospital
} from "lucide-react";

function Sidebar({ isOpen, setIsSidebarOpen }) {
    const { user } = useAuth();
    const role = user?.role;
    const location = useLocation();

    const menuItems = {
        Admin: [
            { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { path: "/doctors", label: "Doctors", icon: User },
            { path: "/patients", label: "Patients", icon: Users },
            { path: "/appointments", label: "Appointments", icon: Calendar },
            { path: "/billing", label: "Billing", icon: Receipt },
            { path: "/prescriptions", label: "Prescriptions", icon: FileText },
            { path: "/notifications", label: "Notifications", icon: Bell },
            { path: "/assistant", label: "AI Assistant", icon: MessageSquare },
        ],
        Doctor: [
            { path: "/doctor", label: "Dashboard", icon: LayoutDashboard },
            { path: "/appointments", label: "Appointments", icon: Calendar },
            { path: "/patients", label: "My Patients", icon: Users },
            { path: "/prescriptions", label: "Prescriptions", icon: FileText },
            { path: "/notifications", label: "Notifications", icon: Bell },
            { path: "/assistant", label: "AI Assistant", icon: MessageSquare },
        ],
        Patient: [
            { path: "/patient", label: "Dashboard", icon: LayoutDashboard },
            { path: "/appointments", label: "Appointments", icon: Calendar },
            { path: "/prescriptions", label: "My Prescriptions", icon: FileText },
            { path: "/billing", label: "My Bills", icon: Receipt },
            { path: "/notifications", label: "Notifications", icon: Bell },
            { path: "/assistant", label: "AI Assistant", icon: MessageSquare },
        ]
    };

    const links = menuItems[role] || [];

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-xl flex flex-col`}>
            {/* Header */}
            <div className="flex items-center justify-center h-16 bg-slate-950 border-b border-slate-800">
                <Hospital className="w-8 h-8 text-blue-500 mr-3" />
                <span className="text-xl font-bold text-white tracking-wide">MediCare</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-1.5 px-3">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path || (location.pathname === '/' && link.path.includes(role.toLowerCase()));
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                                        : 'hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-200' : 'text-slate-400 group-hover:text-white'}`} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Profile */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                        {user?.full_name?.charAt(0) || "U"}
                    </div>
                    <div className="ml-3 truncate">
                        <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
