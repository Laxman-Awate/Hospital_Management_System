import { useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");

    };

    return (

        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">

            <h1 className="text-2xl font-bold">

                Hospital Management System

            </h1>

            <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded"
            >
                Logout
            </button>

        </div>

    );

}

export default Navbar;