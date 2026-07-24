import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Hospital, ArrowRight } from "lucide-react";

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
                case "Admin":
                    navigate("/admin");
                    break;
                case "Doctor":
                    navigate("/doctor");
                    break;
                case "Patient":
                    navigate("/patient");
                    break;
                default:
                    navigate("/login");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-slate-50 p-4 font-sans text-slate-900">
            <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl w-full max-w-md p-8 sm:p-10 border border-slate-100">
                
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4 transform -rotate-6">
                        <Hospital className="w-8 h-8 text-white rotate-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 text-sm mt-1">Sign in to your MediCare account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center border border-red-100">
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            "Signing in..."
                        ) : (
                            <>
                                Sign in <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </button>

                </form>

                <p className="text-center mt-8 text-sm text-slate-600">
                    Don't have an account?
                    <Link to="/register" className="text-blue-600 font-medium hover:text-blue-500 ml-1.5 transition-colors">
                        Create account
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Login;