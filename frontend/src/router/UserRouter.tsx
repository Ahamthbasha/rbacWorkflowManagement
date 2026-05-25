import LandingPage from "../pages/user/Home/LandingPage";  
import UserLayout from "../layout/userLayout/UserLayout";  
import Login from "../pages/user/Auth/Login";  
import Register from "../pages/user/Auth/Register"; 
import { Routes, Route } from "react-router-dom";
import UserSessionRoute from "../protecter/userProtecter/UserSessionRoute";
import UserPrivateRoute from "../protecter/userProtecter/UserPrivateRoute";
const UserRouter = () => {
  return (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/register"
          element={
            <UserSessionRoute>
              <Register />
            </UserSessionRoute>
          }
        />
        <Route
          path="/login"
          element={
            <UserSessionRoute>
              <Login />
            </UserSessionRoute>
          }
        />

        <Route element={<UserPrivateRoute/>}>

        </Route>
    </Routes>
  );
};

export default UserRouter;