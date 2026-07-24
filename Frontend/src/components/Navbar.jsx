import { useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { Menu, LogOut, Search, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar({ toggleSidebar }) {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Helper to format path name
    const getPageTitle = () => {
        const path = location.pathname.split("/")[1];
        if (!path) return "Dashboard";
        return path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
    };

    return (
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                
                {/* Left Section */}
                <div className="flex items-center">
                    <button 
                        onClick={toggleSidebar}
                        className="p-2 mr-4 text-slate-500 rounded-lg hover:bg-slate-100 focus:outline-none md:hidden"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-semibold text-slate-800 hidden sm:block">
                        {getPageTitle()}
                    </h1>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Optional Search */}
                    <div className="hidden md:flex relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="w-4 h-4 text-slate-400" />
                        </span>
                        <input 
                            type="text" 
                            className="w-64 py-2 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Search..."
                        />
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                    <NotificationBell />

                    <div className="relative group cursor-pointer">
                        <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.full_name}</span>
                            <UserCircle className="w-8 h-8 text-slate-400" />
                        </div>
                        
                        {/* Dropdown on hover */}
                        <div className="absolute right-0 w-48 mt-1 py-2 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right scale-95 group-hover:scale-100">
                            <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                <p className="text-sm text-slate-900 font-medium truncate">{user?.full_name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}

export default Navbar;
