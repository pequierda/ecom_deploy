// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'planner' | 'admin';
  allowedRoles?: ('client' | 'planner' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowedRoles 
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Logging out..</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role permission
  const hasRequiredRole = requiredRole ? user.role === requiredRole : true;
  const hasAllowedRole = allowedRoles ? allowedRoles.includes(user.role) : true;

  if (!hasRequiredRole && !hasAllowedRole) {
    // Show unauthorized page instead of just redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page. This area is restricted to {requiredRole || allowedRoles?.join(', ')} users only.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Redirect to appropriate dashboard based on user's actual role
                  const redirectPath = user.role === 'client' ? '/client/dashboard' 
                                     : user.role === 'planner' ? '/planner/dashboard'
                                     : '/bplo/dashboard';
                  window.location.href = redirectPath;
                }}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Go to My Dashboard
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Return to Home
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>Current role: <span className="font-medium capitalize">{user.role}</span></p>
              <p>Required role: <span className="font-medium capitalize">{requiredRole || allowedRoles?.join(', ')}</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;