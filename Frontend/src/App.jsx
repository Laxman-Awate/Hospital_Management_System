import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AccessDenied from "./pages/AccessDenied";

import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Prescriptions from "./pages/Prescriptions";
import Notifications from "./pages/Notifications";
import MedicalRecords from "./pages/MedicalRecords";
import Home from "./pages/Home";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<AccessDenied />} />

      {/* Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={["Doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={["Patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/patients" element={<ProtectedRoute allowedRoles={["Admin", "Doctor"]}><Patients /></ProtectedRoute>} />
      <Route path="/doctors" element={<ProtectedRoute allowedRoles={["Admin"]}><Doctors /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute allowedRoles={["Admin", "Doctor", "Patient"]}><Appointments /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute allowedRoles={["Admin", "Patient"]}><Billing /></ProtectedRoute>} />
      <Route path="/prescriptions" element={<ProtectedRoute allowedRoles={["Admin", "Doctor", "Patient"]}><Prescriptions /></ProtectedRoute>} />
      <Route path="/medical-records" element={<ProtectedRoute allowedRoles={["Admin", "Doctor", "Patient"]}><MedicalRecords /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={["Admin", "Doctor", "Patient"]}><Notifications /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
