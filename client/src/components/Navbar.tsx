import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Heart, 
  User, 
  Calendar, 
  Phone, 
  LogIn,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface NavbarProps {
  isLoggedIn?: boolean;
  setIsLoggedIn?: (value: boolean) => void;
  role?: 'admin' | 'planner' | 'client';
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false, setIsLoggedIn, role }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getLogoutRedirectPath } = useAuthStore();

  // Use the role from auth store if available, otherwise use the prop
  const currentRole = user?.role || role;
  const currentIsLoggedIn = user !== null || isLoggedIn;

  // Base navigation
  const navigationItems = [
    { name: 'Home', href: '/', icon: Heart },
    { name: 'Services', href: '/services', icon: Calendar },
    { name: 'About', href: '/about', icon: User },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  // Get dashboard path based on role
  const getDashboardPath = () => {
    if (currentRole === 'admin') return '/admin/dashboard';
    if (currentRole === 'planner') return '/planner/dashboard';
    if (currentRole === 'client') return '/client/dashboard';
    return '/'; // Fallback for unauthenticated users
  };

  // Add dashboard link to navigation if logged in
  if (currentIsLoggedIn && currentRole) {
    navigationItems.push({ 
      name: `${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Dashboard`, 
      href: getDashboardPath(), 
      icon: LayoutDashboard 
    });
  }

  const isActiveLink = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      // Capture user role BEFORE logout to avoid timing issues
      const currentUserRole = user?.role;
      console.log('🔍 Navbar - Current user role before logout:', currentUserRole);
      
      // Calculate redirect path explicitly
      let redirectPath = '/'; // Default for clients and fallback
      if (currentUserRole === 'admin' || currentUserRole === 'planner') {
        redirectPath = '/login';
      }
      
      console.log('🔍 Navbar - Will redirect to:', redirectPath);
      
      await logout();
      setIsLoggedIn?.(false);
      closeMenu();
      
      // Navigate to the calculated path
      console.log('🔍 Navbar - Navigating to:', redirectPath);
      navigate(redirectPath);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if current page is 404/not found
  const isNotFoundPage = location.pathname === '/not-found';

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              WeddingMart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActiveLink(item.href)
                      ? 'text-pink-600 bg-pink-50'
                      : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Dashboard button for 404 pages */}
            {isNotFoundPage && currentIsLoggedIn && currentRole && (
              <Link
                to={getDashboardPath()}
                className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!currentIsLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeMenu}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActiveLink(item.href)
                        ? 'text-pink-600 bg-pink-50'
                        : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Dashboard button for 404 pages in mobile */}
              {isNotFoundPage && currentIsLoggedIn && currentRole && (
                <Link
                  to={getDashboardPath()}
                  onClick={closeMenu}
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Go to Dashboard</span>
                </Link>
              )}

              {/* Mobile Auth Buttons */}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                {!currentIsLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors duration-200"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-md hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Sign Up</span>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;