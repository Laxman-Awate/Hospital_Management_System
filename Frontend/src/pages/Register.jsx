import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { Mail, Lock, User, Hospital, Shield, ArrowRight } from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Patient",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);
      const response = await registerUser(formData);
      setMessage(response.message || "Registration Successful");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed. Please try again.");
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
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Create Account</h1>
            <p className="text-slate-500 text-sm mt-1">Join MediCare today</p>
        </div>

        {message && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm flex items-center border border-emerald-100 font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                      type="text"
                      name="full_name"
                      placeholder="John Doe"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors"
                      onChange={handleChange}
                      required
                  />
              </div>
          </div>

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
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors"
                      onChange={handleChange}
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
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors"
                      onChange={handleChange}
                      required
                  />
              </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Role</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                      name="role"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-slate-50/50 transition-colors appearance-none"
                      onChange={handleChange}
                      value={formData.role}
                  >
                      <option value="Patient">Patient</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Admin">Admin</option>
                  </select>
              </div>
          </div>

          <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
              {loading ? "Registering..." : <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>}
          </button>

        </form>

        <p className="text-center mt-8 text-sm text-slate-600">
          Already have an account?
          <Link className="text-blue-600 font-medium hover:text-blue-500 ml-1.5 transition-colors" to="/login">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
