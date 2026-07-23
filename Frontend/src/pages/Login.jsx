import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        try {

            const data = await loginUser(formData);

            login(data.user, data.access_token);

            switch (data.user.role) {

                case "admin":
                    navigate("/admin");
                    break;

                case "doctor":
                    navigate("/doctor");
                    break;

                default:
                    navigate("/patient");
            }

        }

        catch (err) {

            setError(
                err.response?.data?.message || "Login Failed"
            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen flex justify-center items-center bg-gray-100">

            <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8">

                <h1 className="text-3xl font-bold text-center mb-6">

                    Hospital Management

                </h1>

                {error && (

                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">

                        {error}

                    </div>

                )}

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border rounded mb-4"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 border rounded mb-4"
                        required
                    />

                    <button
                        className="w-full bg-blue-600 text-white p-3 rounded"
                    >
                        {
                            loading
                                ? "Logging..."
                                : "Login"
                        }
                    </button>

                </form>

                <p className="text-center mt-4">

                    Don't have an account?

                    <Link
                        to="/register"
                        className="text-blue-600 ml-2"
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Login;