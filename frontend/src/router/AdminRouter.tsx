import { Routes, Route } from "react-router-dom";
import AdminSessionRoute from "../protecter/adminProtecter/AdminSessionRoute";
import LoginPage from "../pages/admin/Auth/Login";
import AdminPrivateRoute from "../protecter/adminProtecter/AdminPrivateRoute";
// import AdminLayout from "../layout/adminLayout/AdminLayout";

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
        {/* <Route element={<AdminLayout />}>
          
          
        </Route> */}
      </Route>
    </Routes>
  );
};

export default AdminRouter;