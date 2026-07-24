import React from 'react';

function DashboardCard({ title, value, icon: Icon, trend, trendValue, color = "blue" }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
        teal: "bg-teal-50 text-teal-600"
    };

    const iconColorClass = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl ${iconColorClass} transition-colors group-hover:scale-110 duration-200`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium flex items-center ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </span>
                    <span className="text-slate-400 ml-2">vs last month</span>
                </div>
            )}
        </div>
    );
}

export default DashboardCard;