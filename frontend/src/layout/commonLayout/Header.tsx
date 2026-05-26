// components/layout/Header.tsx
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { clearUserDetails } from "../../redux/slices/userSlice";
import { logout } from "../../api/auth/userAuth";
import { toast } from "react-toastify";
import type { RootState } from "../../redux/store";
import { 
  FileText, 
  LogOut, 
  User, 
  History, 
  Menu, 
  X,
  LayoutDashboard,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Shield,
  ChevronDown,
  Building2,
  Crown
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { adminLogout } from "../../api/auth/adminAuth";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const user = useSelector((state: RootState) => state.user);
  const isLoggedIn = !!user.userId;
  const userRole = user.role;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAuthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (userRole === 'admin') {
        await adminLogout();
      } else if (userRole === 'manager') {
        // await managerLogout();
      } else {
        await logout();
      }
      
      dispatch(clearUserDetails());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAuthRedirect = (role: string, isLogin: boolean) => {
    setIsAuthDropdownOpen(false);
    if (isLogin) {
      if (role === 'admin') {
        navigate('/admin/login');
      } else if (role === 'manager') {
        navigate('/manager/login');
      } else {
        navigate('/login');
      }
    } else {
      if (role === 'admin') {
        navigate('/admin/register');
      } else if (role === 'manager') {
        navigate('/manager/register');
      } else {
        navigate('/register');
      }
    }
  };

  // Get role-based navigation items
  const getNavItems = () => {
    const commonItems = [
      { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["user", "manager", "admin"] },
    ];

    const roleSpecificItems = {
      user: [
        { path: "/myRequests", label: "My Requests", icon: FileText, roles: ["user"] },
        { path: "/create-request", label: "Create Request", icon: CheckCircle, roles: ["user"] },
      ],
      manager: [
        { path: "/pending-requests", label: "Pending Approvals", icon: Clock, roles: ["manager"] },
        { path: "/team-requests", label: "Team Requests", icon: Users, roles: ["manager"] },
      ],
      admin: [
        { path: "/admin/all-requests", label: "All Requests", icon: History, roles: ["admin"] },
        { path: "/admin/user-management", label: "User Management", icon: Users, roles: ["admin"] },
        { path: "/admin/system-settings", label: "Settings", icon: Settings, roles: ["admin"] },
      ],
    };

    let items = [...commonItems];
    
    if (userRole === 'user') {
      items = [...items, ...roleSpecificItems.user];
    } else if (userRole === 'manager') {
      items = [...items, ...roleSpecificItems.manager];
    } else if (userRole === 'admin') {
      items = [...items, ...roleSpecificItems.admin];
    }

    return items;
  };

  const navItems = getNavItems();

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      default:
        return 'User';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
            >
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RBA Workflow
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Navigation Links */}
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-md text-sm font-medium transition-colors"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                ))}

                {/* Role Badge */}
                <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                  <Shield className="h-3 w-3 inline mr-1" />
                  {getRoleDisplayName()}
                </div>

                {/* Profile Dropdown/Button */}
                <div className="relative ml-3">
                  <button
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user.name?.split(" ")[0] || "User"}
                    </span>
                  </button>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                {/* Auth Dropdown Button */}
                <button
                  onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Get Started
                  <ChevronDown className="h-4 w-4 ml-2" />
                </button>

                {/* Auth Dropdown Menu */}
                {isAuthDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-2">
                      {/* Login Section */}
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Login as
                        </div>
                        <button
                          onClick={() => handleAuthRedirect('user', true)}
                          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="h-5 w-5 text-green-600 mr-3" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              User Login
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Access your dashboard
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleAuthRedirect('manager', true)}
                          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Manager Login
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Review and approve requests
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleAuthRedirect('admin', true)}
                          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Crown className="h-5 w-5 text-purple-600 mr-3" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Admin Login
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              System administration
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                      {/* Sign Up Section */}
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Create Account as
                        </div>
                        <button
                          onClick={() => handleAuthRedirect('user', false)}
                          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User className="h-5 w-5 text-green-600 mr-3" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              User Sign Up
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Create a user account
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => handleAuthRedirect('manager', false)}
                          className="w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Manager Sign Up
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Register as a manager
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" />
            ) : (
              <Menu className="block h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          {isLoggedIn ? (
            <>
              {/* User Info in Mobile */}
              <div className="flex items-center space-x-3 px-3 py-4 border-b dark:border-gray-800">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email || ""}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                    {getRoleDisplayName()}
                  </span>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              ))}

              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2">
              {/* Login Options */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Login as
              </div>
              <button
                onClick={() => {
                  handleAuthRedirect('user', true);
                  closeMobileMenu();
                }}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <User className="h-5 w-5 mr-3 text-green-600" />
                User Login
              </button>
              <button
                onClick={() => {
                  handleAuthRedirect('manager', true);
                  closeMobileMenu();
                }}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Building2 className="h-5 w-5 mr-3 text-blue-600" />
                Manager Login
              </button>
              <button
                onClick={() => {
                  handleAuthRedirect('admin', true);
                  closeMobileMenu();
                }}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Crown className="h-5 w-5 mr-3 text-purple-600" />
                Admin Login
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

              {/* Sign Up Options */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Create Account as
              </div>
              <button
                onClick={() => {
                  handleAuthRedirect('user', false);
                  closeMobileMenu();
                }}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <User className="h-5 w-5 mr-3 text-green-600" />
                User Sign Up
              </button>
              <button
                onClick={() => {
                  handleAuthRedirect('manager', false);
                  closeMobileMenu();
                }}
                className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Building2 className="h-5 w-5 mr-3 text-blue-600" />
                Manager Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;