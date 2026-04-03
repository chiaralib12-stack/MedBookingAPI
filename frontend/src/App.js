import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import AdminLogin from "./AdminLogin";
import Dashboard from "./Dashboard";
import Booking from "./Booking";
import Layout from "./Layout";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "./AdminDashboard";
import AdminPanel from "./AdminPanel";
import DoctorDashboard from "./DoctorDashboard";
 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />

        {/* PATIENT */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="patient">
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking"
          element={
            <ProtectedRoute role="patient">
              <Layout>
                <Booking />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* DOCTOR */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute role="doctor">
              <Layout>
                <DoctorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;