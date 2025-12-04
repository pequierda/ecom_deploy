// components/RoleProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: ('client' | 'planner' | 'admin')[];
  requireApproved?: boolean; // For specific planner features that require approval
  allowPending?: boolean; // For routes that pending planners can access (like status page)
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRoles,
  requireApproved = false,
  allowPending = false
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's role is in the required roles
  if (!requiredRoles.includes(user.role)) {
    return <Navigate to="/not-found" replace />;
  }

  // Allow all authenticated users with correct roles to access their routes
  // Planner approval status will be handled within the components themselves
  return <>{children}</>;
};

// Higher-order component for easier use
export const withRoleProtection = (
  Component: React.ComponentType,
  requiredRoles: ('client' | 'planner' | 'admin')[],
  options?: { requireApproved?: boolean; allowPending?: boolean }
) => {
  return (props: any) => (
    <RoleProtectedRoute 
      requiredRoles={requiredRoles} 
      requireApproved={options?.requireApproved}
      allowPending={options?.allowPending}
    >
      <Component {...props} />
    </RoleProtectedRoute>
  );
};

// Utility hook for checking permissions in components
export const usePermissions = () => {
  const { user, isAuthenticated, getPlannerStatus, isPlannerApproved } = useAuthStore();

  return {
    isAuthenticated,
    user,
    isAdmin: user?.role === 'admin',
    isPlanner: user?.role === 'planner',
    isClient: user?.role === 'client',
    isPlannerApproved: isPlannerApproved(),
    plannerStatus: getPlannerStatus(),
    
    // Permission checkers
    canAccessPlannerFeatures: () => {
      return user?.role === 'planner' && isPlannerApproved();
    },
    
    canAccessAdminFeatures: () => {
      return user?.role === 'admin';
    },
    
    canAccessClientFeatures: () => {
      return user?.role === 'client';
    },
    
    // Role-based component renderer
    renderForRole: (role: string, component: React.ReactNode) => {
      if (user?.role === role) {
        return component;
      }
      return null;
    },
    
    // Conditional renderer for planner approval status
    renderForPlannerStatus: (status: string, component: React.ReactNode) => {
      if (user?.role === 'planner' && getPlannerStatus() === status) {
        return component;
      }
      return null;
    }
  };
};

export default RoleProtectedRoute;