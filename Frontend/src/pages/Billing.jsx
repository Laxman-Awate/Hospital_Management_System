import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getBills, getBillById, deleteBill } from "../services/billingService";
import AddEditBillModal from "../components/AddEditBillModal";
import { toast } from "react-toastify";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { DollarSign, CheckSquare, Clock, Receipt, Search, Plus, Edit2, Trash2 } from "lucide-react";

function Billing() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 8;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await getBills();
      setBills(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const text = search.toLowerCase();
      return (
        bill.invoice_number?.toLowerCase().includes(text) ||
        bill.patient_name?.toLowerCase().includes(text) ||
        bill.payment_status?.toLowerCase().includes(text) ||
        bill.payment_method?.toLowerCase().includes(text)
      );
    });
  }, [bills, search]);

  const indexOfLast = currentPage * billsPerPage;
  const indexOfFirst = indexOfLast - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBills.length / billsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      await deleteBill(id);
      toast.success("Bill deleted successfully.");
      fetchBills();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete bill.");
    }
  };

  const totalRevenue = bills.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const paidAmount = bills.filter(b => b.payment_status === "Paid").reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const pendingAmount = bills.filter(b => b.payment_status === "Pending").reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const columns = [
    { header: "Invoice #", render: (row) => <span className="font-mono text-sm font-semibold text-slate-700">{row.invoice_number}</span> },
    ...(isAdmin ? [{ header: "Patient", accessor: "patient_name" }] : []),
    { header: "Date", render: (row) => row.payment_date || "—" },
    { header: "Amount", render: (row) => <span className="font-semibold text-slate-800">{fmt(row.total_amount)}</span> },
    { header: "Method", accessor: "payment_method" },
    { header: "Status", render: (row) => <StatusBadge status={row.payment_status} /> },
    ...(isAdmin ? [{ header: "Actions", render: (row) => (
      <div className="flex gap-2">
        <button
          onClick={async () => {
            try {
              const response = await getBillById(row.id);
              setSelectedBill(response.data);
              setIsModalOpen(true);
            } catch { toast.error("Failed to load bill details."); }
          }}
          className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDelete(row.id)}
          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}] : []),
  ];

  return (
    <MainLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{isAdmin ? "Billing" : "My Bills"}</h1>
          <p className="text-slate-500 text-sm mt-1">{isAdmin ? "Manage invoices and payments" : "View your billing summary"}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setSelectedBill(null); setIsModalOpen(true); }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-200"
          >
            <Plus className="w-5 h-5 mr-2" /> Generate Bill
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: fmt(totalRevenue), icon: DollarSign, color: "bg-blue-50 text-blue-600" },
          { label: "Paid", value: fmt(paidAmount), icon: CheckSquare, color: "bg-emerald-50 text-emerald-600" },
          { label: "Pending", value: fmt(pendingAmount), icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Total Bills", value: bills.length, icon: Receipt, color: "bg-purple-50 text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={isAdmin ? "Search by invoice, patient, status..." : "Search by invoice, status, method..."}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl w-full md:w-96 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>
      ) : (
        <Table columns={columns} data={currentBills} keyField="id" emptyMessage="No bills found." />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 text-sm rounded-lg transition-colors ${currentPage === page ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{page}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 text-sm bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}

      {isAdmin && <AddEditBillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchBills} bill={selectedBill} />}
    </MainLayout>
  );
}

export default Billing;