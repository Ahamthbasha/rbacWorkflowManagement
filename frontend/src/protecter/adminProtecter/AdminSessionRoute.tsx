import { Navigate } from "react-router-dom";

interface AdminSessionRouteProps {
  children: React.ReactNode;
}

const AdminSessionRoute: React.FC<AdminSessionRouteProps> = ({ children }) => {
    const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated');

    if (isAdminAuthenticated) {
        return <Navigate to='/admin/job-roles' replace />;
    }

    return <>{children}</>;
}

export default AdminSessionRoute;