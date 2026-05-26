// layout/managerLayout/ManagerLayout.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users, 
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
  AlertCircle,
  Home,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { clearManagerDetails } from '../../redux/slices/managerSlice';
import { managerLogout } from '../../api/auth/managerAuth';
import { toast } from 'react-toastify';
import type { RootState } from '../../redux/store';

const ManagerLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Navigation items for manager
  const navItems = [
    { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/manager/pending-requests', label: 'Pending Approvals', icon: Clock },
    { path: '/manager/team-requests', label: 'Team Requests', icon: Users },
    { path: '/manager/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/manager/settings', label: 'Settings', icon: Settings },
  ];

  // Stats for sidebar overview
  const stats = {
    totalRequests: 24,
    pendingRequests: 8,
    approvedRequests: 14,
    rejectedRequests: 2,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/manager/dashboard" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            {isSidebarOpen && (
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Manager Portal
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="hidden lg:block p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Manager Info Section */}
        <div className="flex flex-col items-center py-6 border-b border-gray-200 dark:border-gray-800">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-white">
              {manager.name?.charAt(0).toUpperCase() || 'M'}
            </span>
          </div>
          {isSidebarOpen && (
            <>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {manager.name || 'Manager'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {manager.email || 'manager@example.com'}
              </p>
              <div className="flex items-center mt-2 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Briefcase className="h-3 w-3 text-blue-600 mr-1" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {manager.department || 'Department'}
                </span>
              </div>
              <span className="mt-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Role: Manager
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
                onClick={() => setIsMobileSidebarOpen(false)}
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
      <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side - Menu button and page title */}
              <div className="flex items-center flex-1">
                <button
                  onClick={toggleMobileSidebar}
                  className="lg:hidden mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  onClick={toggleSidebar}
                  className="hidden lg:block mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden lg:flex items-center space-x-2">
                  <Home className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">/</span>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Manager Dashboard
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
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <UserCircle className="h-5 w-5 text-white" />
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <Link
                        to="/manager/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/manager/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Settings
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileOpen(false);
                        }}
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

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  © {new Date().getFullYear()} RBA Workflow. All rights reserved.
                </p>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Manager Portal - Role Based Access Control</span>
              </div>

              <div className="flex space-x-4">
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                  Help
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ManagerLayout;