import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { configureAxiosInterceptors } from "./services/axios"; 
import UserRouter from './router/UserRouter';
import AdminRouter from "./router/AdminRouter";
import ManagerRouter from "./router/ManagerRouter";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    configureAxiosInterceptors(dispatch, navigate);
  }, [dispatch, navigate]);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/*" element={<UserRouter />} />
        <Route path="/admin/*" element={<AdminRouter />} />
        <Route path="/manager/*" element={<ManagerRouter/>}/>
      </Routes>
    </>
  );
};

export default App;