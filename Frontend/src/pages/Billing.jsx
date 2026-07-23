import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getBills, getBillById, deleteBill } from "../services/billingService";
import AddEditBillModal from "../components/AddEditBillModal";
import { toast } from "react-toastify";

function Billing() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 5;
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

  useEffect(() => {
    fetchBills();
  }, []);

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bill?"
    );
    if (!confirmDelete) return;

    try {
      await deleteBill(id);
      toast.success("Bill deleted successfully.");
      fetchBills();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete bill.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Partial":
        return "bg-blue-100 text-blue-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
  const paidAmount = bills
    .filter(b => b.payment_status === "Paid")
    .reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
  const pendingAmount = bills
    .filter(b => b.payment_status === "Pending")
    .reduce((sum, bill) => sum + (bill.total_amount || 0), 0);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Billing</h1>
        <button
          onClick={() => {
            setSelectedBill(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Generate Bill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-500 text-sm">Paid</h3>
          <p className="text-3xl font-bold text-green-600">${paidAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-500 text-sm">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-500 text-sm">Total Bills</h3>
          <p className="text-3xl font-bold text-purple-600">{bills.length}</p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by invoice, patient, status..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-4 py-2 w-full md:w-96"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-1z"></path>
                      </svg>
                      <p className="text-gray-500 text-lg">No bills found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or generate a new bill</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="p-3 font-medium">{bill.invoice_number}</td>
                    <td className="p-3">{bill.patient_name || "N/A"}</td>
                    <td className="p-3">{bill.payment_date || "N/A"}</td>
                    <td className="p-3 font-medium">${(bill.total_amount || 0).toFixed(2)}</td>
                    <td className="p-3">{bill.payment_method}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.payment_status)}`}>
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const response = await getBillById(bill.id);
                            setSelectedBill(response.data);
                            setIsModalOpen(true);
                          } catch (error) {
                            console.error(error);
                            toast.error("Failed to load bill details.");
                          }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bill.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <AddEditBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchBills}
        bill={selectedBill}
      />
    </MainLayout>
  );
}

export default Billing;