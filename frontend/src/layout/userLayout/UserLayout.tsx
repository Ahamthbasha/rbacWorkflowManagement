// components/layout/UserLayout.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  History, 
  Settings, 
  Menu, 
  X,
  Shield,
  Bell,
  Search,
  ChevronDown,
  UserCircle,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { clearUserDetails } from '../../redux/slices/userSlice';
import { logout } from '../../api/auth/userAuth';
import { toast } from 'react-toastify';
import type { RootState } from '../../redux/store';

const UserLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
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

  // Navigation items for user
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/my-requests', label: 'My Requests', icon: FileText },
    { path: '/create-request', label: 'Create Request', icon: PlusCircle },
    { path: '/request-history', label: 'Request History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  // Stats for sidebar overview
  const stats = {
    totalRequests: 12,
    pendingRequests: 3,
    approvedRequests: 8,
    rejectedRequests: 1,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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

        {/* User Info Section */}
        <div className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-white">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {isSidebarOpen && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {user.name || 'User'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {user.email || 'user@example.com'}
              </p>
              <span className="mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Role: {user.role || 'User'}
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
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </div>

          {/* Quick Stats Section */}
          {isSidebarOpen && (
            <div className="mt-8 px-4 py-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Request Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Requests</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.totalRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center text-gray-600 dark:text-gray-400">
                    <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                    Pending
                  </span>
                  <span className="font-semibold text-yellow-600">{stats.pendingRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center text-gray-600 dark:text-gray-400">
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Approved
                  </span>
                  <span className="font-semibold text-green-600">{stats.approvedRequests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center text-gray-600 dark:text-gray-400">
                    <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                    Rejected
                  </span>
                  <span className="font-semibold text-red-600">{stats.rejectedRequests}</span>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side - Page title */}
              <div className="flex items-center flex-1">
                <button
                  onClick={toggleSidebar}
                  className="mr-4 p-2 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden lg:flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Welcome back, {user.name?.split(' ')[0] || 'User'}!
                  </h1>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1">
                  <Search className="h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="bg-transparent border-none outline-none px-2 py-1 text-sm w-48"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-white" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Settings
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;