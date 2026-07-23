import MainLayout from "../layouts/MainLayout";
import DashboardCard from "../components/DashboardCard";

function AdminDashboard() {

    return (

        <MainLayout>

            <h1 className="text-3xl font-bold mb-6">

                Admin Dashboard

            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <DashboardCard
                    title="Patients"
                    value="0"
                />

                <DashboardCard
                    title="Doctors"
                    value="0"
                />

                <DashboardCard
                    title="Appointments"
                    value="0"
                />

                <DashboardCard
                    title="Revenue"
                    value="₹0"
                />

            </div>

        </MainLayout>

    );

}

export default AdminDashboard;