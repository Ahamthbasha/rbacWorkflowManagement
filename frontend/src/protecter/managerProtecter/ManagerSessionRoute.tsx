
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {type RootState } from '../../redux/store';

interface ManagerSessionRouteProps {
  children: React.ReactNode;
}

const ManagerSessionRoute: React.FC<ManagerSessionRouteProps> = ({ children }) => {
  const managerFromStorage = localStorage.getItem('manager');
  const managerFromStore = useSelector((state: RootState) => state.manager);
  if (managerFromStorage || managerFromStore.managerId) {
    return <Navigate to='/manager/dashboard' replace />;
  }

  return children;
};

export default ManagerSessionRoute;