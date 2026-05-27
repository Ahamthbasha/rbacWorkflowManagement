import { Routes, Route } from "react-router-dom";
import AdminSessionRoute from "../protecter/adminProtecter/AdminSessionRoute";
import LoginPage from "../pages/admin/Auth/Login";
import AdminPrivateRoute from "../protecter/adminProtecter/AdminPrivateRoute";
import AdminLayout from "../layout/adminLayout/AdminLayout";
import AdminDashboard from "../pages/admin/Request/AdminDashboard";
import AdminRequests from "../pages/admin/Request/AdminRequests";
import AdminRequestDetail from "../pages/admin/Request/AdminRequestDetail";

const AdminRouter = () => {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <AdminSessionRoute>
            <LoginPage />
          </AdminSessionRoute>
        }
      />
      <Route element={<AdminPrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="requests/:requestId" element={<AdminRequestDetail />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRouter;