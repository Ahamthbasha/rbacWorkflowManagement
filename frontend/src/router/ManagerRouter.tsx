// router/managerRouter.tsx
import { Routes, Route } from "react-router-dom";
import ManagerSessionRoute from "../protecter/managerProtecter/ManagerSessionRoute";
import ManagerPrivateRoute from "../protecter/managerProtecter/ManagerPrivateRoute";
import ManagerLogin from "../pages/manager/Auth/Login";
import ManagerRegister from "../pages/manager/Auth/Register";
import ManagerLayout from "../layout/managerLayout/ManagerLayout";
import ManagerRequests from "../pages/manager/Request/ManagerRequests";
import PendingRequests from "../pages/manager/Request/PendingRequests";
import ManagerRequestDetail from "../pages/manager/Request/ManagerRequestDetail";
import ManagerDashboard from "../pages/manager/Request/ManagerDashboard";


const ManagerRouter = () => {
  return (
    <Routes>
      {/* Public routes - accessible only when NOT logged in */}
      <Route
        path="/login"
        element={
          <ManagerSessionRoute>
            <ManagerLogin />
          </ManagerSessionRoute>
        }
      />
      <Route
        path="/register"
        element={
          <ManagerSessionRoute>
            <ManagerRegister />
          </ManagerSessionRoute>
        }
      />

      {/* Protected routes - accessible only when logged in */}
      <Route element={<ManagerPrivateRoute />}>
        <Route element={<ManagerLayout/>}>
        <Route path="dashboard" element={<ManagerDashboard/>}/>
        <Route path="requests" element={<ManagerRequests/>}/>
        <Route path="requests/pending" element={<PendingRequests/>}/>
        <Route path="requests/:requestId" element={<ManagerRequestDetail/>}/>
        </Route>
      </Route>
    </Routes>
  );
};

export default ManagerRouter;