import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { configureAxiosInterceptors } from "./services/axios"; 
import UserRouter from './router/UserRouter';
import AdminRouter from "./router/AdminRouter";

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
      </Routes>
    </>
  );
};

export default App;