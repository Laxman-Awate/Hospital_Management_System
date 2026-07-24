import React from 'react';

function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    
    let colorClass = "bg-slate-100 text-slate-700 border-slate-200";
    
    if (["completed", "paid", "active", "success"].includes(s)) {
        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (["pending", "processing", "waiting"].includes(s)) {
        colorClass = "bg-amber-50 text-amber-700 border-amber-200";
    } else if (["cancelled", "failed", "inactive"].includes(s)) {
        colorClass = "bg-red-50 text-red-700 border-red-200";
    }

    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colorClass}`}>
            {status}
        </span>
    );
}

export default StatusBadge;
