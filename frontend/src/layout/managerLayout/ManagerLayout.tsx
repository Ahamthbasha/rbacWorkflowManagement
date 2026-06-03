
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, NavLink, Outlet } from 'react-router-dom';
import { 
  FileText,
  Clock,
  Menu, 
  X,
  Shield,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { clearManagerDetails } from '../../redux/slices/managerSlice';
import { managerLogout } from '../../api/auth/managerAuth';
import { toast } from 'react-toastify';
import type { RootState } from '../../redux/store';

const ManagerLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const manager = useSelector((state: RootState) => state.manager);

  const handleLogout = async () => {
    try {
      await managerLogout();
      dispatch(clearManagerDetails());
      toast.success('Logged out successfully');
      navigate('/manager/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
     { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/manager/requests', label: 'All Requests', icon: FileText },
    { path: '/manager/requests/pending', label: 'Pending Approvals', icon: Clock },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <Link to="/manager/requests" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 shrink-0" />
            {isSidebarOpen && (
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Manager Portal
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Manager Info */}
        <div className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
            <span className="text-xl font-bold text-white">
              {manager.name?.charAt(0).toUpperCase() || 'M'}
            </span>
          </div>
          {isSidebarOpen && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {manager.name || 'Manager'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {manager.email || 'manager@example.com'}
              </p>
              <span className="mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Manager
              </span>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isSidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>

        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0">
          {/* Left: Greeting */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
              {manager.name || 'Manager'}
            </h2>
          </div>

          {/* Right: User avatar + name */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {manager.name?.charAt(0).toUpperCase() || 'M'}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {manager.name || 'Manager'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-gray-500 dark:text-gray-400">RBA Workflow</span>
            </div>
            <p>© {currentYear} RBA Workflow. All rights reserved.</p>
            <p>Manager Portal - Role Based Access Control</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default ManagerLayout;