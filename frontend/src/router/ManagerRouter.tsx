// router/managerRouter.tsx
import { Routes, Route } from "react-router-dom";
import ManagerSessionRoute from "../protecter/managerProtecter/ManagerSessionRoute";
import ManagerPrivateRoute from "../protecter/managerProtecter/ManagerPrivateRoute";
// import ManagerLayout from "../layout/managerLayout/ManagerLayout";
import ManagerLogin from "../pages/manager/Auth/Login";
import ManagerRegister from "../pages/manager/Auth/Register";


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
        
      </Route>
    </Routes>
  );
};

export default ManagerRouter;