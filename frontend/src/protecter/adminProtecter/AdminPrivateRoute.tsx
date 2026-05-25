import { Navigate, Outlet } from "react-router-dom";

const AdminPrivateRoute = () => {
    const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated');

    return isAdminAuthenticated ? <Outlet /> : <Navigate to='/admin/login' replace />;
}

export default AdminPrivateRoute;