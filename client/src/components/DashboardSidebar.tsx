// components/DashboardSidebar.tsx - Updated with planner approval logic
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User,
  Briefcase,
  Shield,
  X,
  Menu,
  Lock
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { getSidebarItems } from '../config/sidebarConfig';

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  isCollapsed = false, 
  onToggle 
}) => {
  const { user, logout, getFullName } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  // Simplified logout handler using centralized logic
  const handleLogout = async (): Promise<void> => {
    console.log('🔥 DashboardSidebar handleLogout called - using centralized logout');
    await logout(navigate);
  };

  const sidebarItems = getSidebarItems(user.role, handleLogout, user);

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'client':
        return 'from-blue-600 to-blue-700';
      case 'planner':
        return 'from-purple-600 to-purple-700';
      case 'admin':
        return 'from-red-600 to-red-700';
      default:
        return 'from-pink-600 to-pink-700';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return User;
      case 'planner':
        return Briefcase;
      case 'admin':
        return Shield;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon(user.role);
  const currentPath = location.pathname;

  // Mobile Menu Button (appears in header area)
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      type="button"
    >
      {isMobileMenuOpen ? (
        <X className="w-5 h-5 text-gray-600" />
      ) : (
        <Menu className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );

  // Sidebar Content Component
  const SidebarContent = () => (
    <div className="min-h-screen bg-white border-r border-gray-200 flex flex-col w-64">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center`}>
              <RoleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 capitalize">
                {user.role} Panel
              </h2>
              <p className="text-xs text-gray-500 truncate">{getFullName()}</p>
              {/* Show approval status for planners */}
              {user.role === 'planner' && user.plannerProfile?.status !== 'approved' && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.plannerProfile?.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.plannerProfile?.status === 'pending' ? 'Pending' : 'Rejected'}
                </span>
              )}
            </div>
          </div>
          
          {/* Desktop toggle button */}
          {!isMobile && onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item, index) => {
          const IconComponent = item.icon;
          
          // Handle logout and other clickable items
          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.disabled ? undefined : item.onClick}
                type="button"
                disabled={item.disabled}
                className={`w-full flex items-center justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.disabled 
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                }`}
                title={item.disabled ? 'Requires approval' : item.name}
              >
                <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                {item.disabled && <Lock className="w-3 h-3 ml-auto text-gray-400" />}
              </button>
            );
          }

          // Handle regular navigation items
          const isActive = currentPath === item.path;
          
          // If item is disabled, render as disabled button instead of link
          if (item.disabled) {
            return (
              <div
                key={index}
                className="flex items-center justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-400 cursor-not-allowed bg-gray-50"
                title="Requires approval"
              >
                <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                <Lock className="w-3 h-3 ml-auto" />
                {item.badge && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`
                flex items-center justify-start px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? `bg-gradient-to-r ${getRoleColor(user.role)} text-white shadow-md` 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={item.name}
            >
              <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
              )}
              {item.badge && !isActive && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  item.badge === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  item.badge === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Approval Status Banner for Planners */}
      {user.role === 'planner' && user.plannerProfile?.status !== 'approved' && (
        <div className="p-4 border-t border-gray-200">
          <div className={`p-3 rounded-lg ${
            user.plannerProfile?.status === 'pending' 
              ? 'bg-yellow-50 border border-yellow-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <Lock className={`w-4 h-4 mr-2 ${
                user.plannerProfile?.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <p className={`text-xs font-medium ${
                user.plannerProfile?.status === 'pending' ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {user.plannerProfile?.status === 'pending' 
                  ? 'Account pending approval' 
                  : 'Account rejected'
                }
              </p>
            </div>
            <p className={`text-xs mt-1 ${
              user.plannerProfile?.status === 'pending' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {user.plannerProfile?.status === 'pending' 
                ? 'Most features are locked until approval'
                : 'Contact support for assistance'
              }
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>WeddingMart v1.0</p>
          <p className="mt-1">© 2024 All rights reserved</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton />
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className={`${
            isCollapsed ? 'w-16' : 'w-64'
          } transition-all duration-300 ease-in-out`}
        >
          {isCollapsed ? (
            // Collapsed Desktop Sidebar
            <div className="w-16 min-h-screen bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-center">
                  {onToggle && (
                    <button
                      onClick={onToggle}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                      type="button"
                      title="Expand sidebar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <nav className="flex-1 p-4 space-y-1">
                {sidebarItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = currentPath === item.path;
                  
                  if (item.onClick) {
                    return (
                      <button
                        key={index}
                        onClick={item.disabled ? undefined : item.onClick}
                        type="button"
                        disabled={item.disabled}
                        className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          item.disabled 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                        }`}
                        title={item.disabled ? 'Requires approval' : item.name}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                      </button>
                    );
                  }

                  if (item.disabled) {
                    return (
                      <div
                        key={index}
                        className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-400 cursor-not-allowed"
                        title="Requires approval"
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                      </div>
                    );
                  }
                  
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      className={`
                        flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActive 
                          ? `bg-gradient-to-r ${getRoleColor(user.role)} text-white shadow-md` 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      title={item.name}
                    >
                      <IconComponent className="w-5 h-5 flex-shrink-0" />
                    </Link>
                  );
                })}
              </nav>
            </div>
          ) : (
            // Expanded Desktop Sidebar
            <SidebarContent />
          )}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-transparent bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Sidebar */}
          <div className="fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};

export default DashboardSidebar;