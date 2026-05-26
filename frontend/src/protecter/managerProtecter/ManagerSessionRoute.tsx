// protecter/managerProtecter/ManagerSessionRoute.tsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {type RootState } from '../../redux/store';

interface ManagerSessionRouteProps {
  children: React.ReactNode;
}

const ManagerSessionRoute: React.FC<ManagerSessionRouteProps> = ({ children }) => {
  // Check from localStorage
  const managerFromStorage = localStorage.getItem('manager');
  
  // Optionally check from Redux store
  const managerFromStore = useSelector((state: RootState) => state.manager);
  
  // If manager is already logged in, redirect to manager dashboard
  if (managerFromStorage || managerFromStore.managerId) {
    return <Navigate to='/manager/dashboard' replace />;
  }

  return children;
};

export default ManagerSessionRoute;