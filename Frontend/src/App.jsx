import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import AppointmentAssistant from "./pages/AppointmentAssistant";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor"
        element={
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient"
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />

      <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />

      <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />

      <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />

         <Route path="/assistant" element={<ProtectedRoute><AppointmentAssistant /></ProtectedRoute>} />



    </Routes>
  );
}

export default App;