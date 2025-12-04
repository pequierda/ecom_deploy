// components/DashboardLayout.tsx
import React, { useState, useEffect } from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { getSidebarItems, type SidebarItem } from '../config/sidebarConfig';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  subtitle,
  maxWidth = false
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { user, logout, getFullName, getInitials } = useAuthStore();
  const navigate = useNavigate();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sidebar items for search
  const sidebarItems: SidebarItem[] = user 
    ? getSidebarItems(user.role, () => logout(navigate), user) 
    : [];

  // Filter items by search query (ignore Logout and clickable-only items)
  const filteredItems = searchQuery
    ? sidebarItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) && !item.onClick
      )
    : [];

  // Handle suggestion click
  const handleSelect = (item: SidebarItem) => {
    setSearchQuery("");
    setShowSuggestions(false);
    navigate(item.path);
  };

  // Centralized logout
  const handleLogout = async () => {
    console.log('🔥 DashboardLayout handleLogout called - using centralized logout');
    await logout(navigate);
  };

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

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className={`bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 ${isMobile ? 'pl-16' : ''}`}>
          <div className="flex items-center justify-between min-w-0">
            {/* Brand */}
            <div className="flex items-center space-x-4 min-w-0">
              <h1 className="text-2xl font-bold text-pink-600 truncate">WeddingMart</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Search */}
              <div className="relative hidden lg:block w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // small delay so click works
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full"
                />

                {/* Floating Suggestions */}
                {showSuggestions && filteredItems.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {user && (
                  <>
                    <div className="hidden sm:block text-right min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{getFullName()}</p>
                      <p className="text-xs text-gray-500 capitalize truncate">{user.role}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                      {getInitials()}
                    </div>
                  </>
                )}
                
                {/* Desktop Logout */}
                {!isMobile && (
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className={`p-6 ${maxWidth ? "max-w-7xl mx-auto" : "w-full"}`}>
            {/* Page Title */}
            {title && (
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                {subtitle && (
                  <p className="text-lg text-gray-600 mt-2">{subtitle}</p>
                )}
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
