import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await registerUser(formData);

      setMessage(response.message || "Registration Successful");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      setMessage(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">
          Register
        </h1>

        {message && (
          <div className="mb-4 text-center text-blue-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            className="w-full border p-3 rounded mb-4"
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-3 rounded mb-4"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-3 rounded mb-4"
            onChange={handleChange}
            required
          />

          <select
            name="role"
            className="w-full border p-3 rounded mb-4"
            onChange={handleChange}
          >
            <option value="Patient">Patient</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
          </select>

          <button
            className="w-full bg-green-600 text-white p-3 rounded"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p className="text-center mt-4">
          Already have an account?
          <Link className="text-blue-600 ml-2" to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;
