import LandingPage from "../pages/user/Home/LandingPage";  
import UserLayout from "../layout/userLayout/UserLayout";  
import Login from "../pages/user/Auth/Login";  
import Register from "../pages/user/Auth/Register"; 
import { Routes, Route } from "react-router-dom";
import UserSessionRoute from "../protecter/userProtecter/UserSessionRoute";
import UserPrivateRoute from "../protecter/userProtecter/UserPrivateRoute";
import CreateRequest from "../pages/user/request/CreateRequest";
import MyRequests from "../pages/user/request/MyRequests";
import RequestDetail from "../pages/user/request/RequestDetail";
import EditRequest from "../pages/user/request/EditRequest";
import UserDashboard from "../pages/user/request/UserDashboard";
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
        <Route element={<UserLayout/>}>
        <Route path="/dashboard" element={<UserDashboard/>}/>
        <Route  path='/createRequest' element={<CreateRequest/>}/>
        <Route path="/myRequests" element={<MyRequests/>}/>
        <Route path="/editRequest/:requestId" element={<EditRequest/>} />
        <Route path="/requests/:requestId" element={<RequestDetail/>}/>
        </Route>
        </Route>
    </Routes>
  );
};

export default UserRouter;