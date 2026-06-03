
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Shield,
  ChevronDown
} from 'lucide-react';
import { clearUserDetails } from '../../redux/slices/userSlice';
import { logout } from '../../api/auth/userAuth';
import { toast } from 'react-toastify';
import type { RootState } from '../../redux/store';

const UserLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const user = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(clearUserDetails());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/myRequests', label: 'My Requests', icon: FileText },
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
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 shrink-0" />
            {isSidebarOpen && (
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RBA Workflow
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

        {/* User Info */}
        <div className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-3">
            <span className="text-xl font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {isSidebarOpen && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {user.name || 'User'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {user.email || 'user@example.com'}
              </p>
              <span className="mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {user.role || 'User'}
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
          {/* Left: Page breadcrumb / greeting */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
              {user.name || 'User'}
            </h2>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">

            {/* User avatar + name */}
            <div className="flex items-center space-x-2 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.name || 'User'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
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
            <p>Role-Based Access Management System</p>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default UserLayout;