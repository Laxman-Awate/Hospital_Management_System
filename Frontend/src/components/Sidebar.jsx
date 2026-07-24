import { Link } from "react-router-dom";

function Sidebar() {

    return (

        <div className="w-64 bg-blue-700 text-white min-h-screen">

            <h2 className="text-2xl font-bold p-6 border-b">
                HMS
            </h2>

            <nav className="flex flex-col mt-4">

                <Link className="px-6 py-3 hover:bg-blue-600" to="/admin">
                    Dashboard
                </Link>

                <Link className="px-6 py-3 hover:bg-blue-600" to="/patients">
                    Patients
                </Link>

                <Link className="px-6 py-3 hover:bg-blue-600" to="/doctors">
                    Doctors
                </Link>

                <Link className="px-6 py-3 hover:bg-blue-600" to="/appointments">
                    Appointments
                </Link>

                <Link className="px-6 py-3 hover:bg-blue-600" to="/billing">
                    Billing
                </Link>

                <Link className="px-6 py-3 hover:bg-blue-600" to="/prescriptions">
                    Prescriptions
                </Link>

                <Link className="px-6 py-3 hover:bg-blue-600" to="/assistant">
                    AI Assistant
                </Link>

            </nav>

        </div>

    );

}

export default Sidebar;
