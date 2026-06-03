
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {type RootState } from '../../redux/store';

const ManagerPrivateRoute = () => {
  const managerFromStorage = localStorage.getItem("manager");
  const isManagerAuthenticated = Boolean(managerFromStorage);
  const manager = useSelector((state: RootState) => state.manager);
  const isManagerInStore = Boolean(manager.managerId);

  return (isManagerAuthenticated || isManagerInStore) ? <Outlet /> : <Navigate to='/manager/login' replace />;
};

export default ManagerPrivateRoute;