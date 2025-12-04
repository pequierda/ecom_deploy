// components/DashboardSidebar.tsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User,
  Briefcase,
  Shield,
  LogOut
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
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sidebarItems = getSidebarItems(user.role, handleLogout);

  const getRoleColor = (role: string) => {
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

  // Get current path for active state
  const currentPath = location.pathname;

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } min-h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center`}>
                <RoleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 capitalize">
                  {user.role} Panel
                </h2>
                <p className="text-xs text-gray-500 truncate">{user.name}</p>
              </div>
            </div>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
                onClick={item.onClick}
                className={`
                  w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600
                  ${isCollapsed ? 'justify-center' : 'justify-start'}
                  ${item.name === 'Logout' ? 'mt-auto' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <IconComponent className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} flex-shrink-0`} />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </button>
            );
          }

          // Handle regular navigation items
          const isActive = item.active || currentPath.includes(item.name.toLowerCase().replace(' ', '-'));
          
          return (
            <Link
              key={index}
              to={`/${user.role}/${item.name.toLowerCase().replace(' ', '-')}`}
              className={`
                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? `bg-gradient-to-r ${getRoleColor(user.role)} text-white shadow-md` 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <IconComponent className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} flex-shrink-0`} />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
              {!isCollapsed && isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>WeddingMart v1.0</p>
            <p className="mt-1">© 2024 All rights reserved</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;