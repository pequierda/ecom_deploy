// config/routes.ts
export interface RouteConfig {
  path: string;
  name: string;
  description: string;
  requiredRole?: 'client' | 'planner' | 'admin';
  allowedRoles?: ('client' | 'planner' | 'admin')[];
  showInNav?: boolean;
}

export const CLIENT_ROUTES: RouteConfig[] = [
  {
    path: '/client/dashboard',
    name: 'Dashboard',
    description: 'Client dashboard overview',
    requiredRole: 'client',
    showInNav: true
  },
  {
    path: '/client/bookings',
    name: 'My Bookings',
    description: 'View and manage your bookings',
    requiredRole: 'client',
    showInNav: true
  },
  {
    path: '/client/profile',
    name: 'Profile',
    description: 'Manage your profile information',
    requiredRole: 'client',
    showInNav: true
  },
  {
    path: '/client/payments',
    name: 'Payments',
    description: 'View payment history and manage payment methods',
    requiredRole: 'client',
    showInNav: true
  },
  {
    path: '/client/messages',
    name: 'Messages',
    description: 'Communicate with your wedding planner',
    requiredRole: 'client',
    showInNav: true
  }
];

export const PLANNER_ROUTES: RouteConfig[] = [
  {
    path: '/planner/dashboard',
    name: 'Dashboard',
    description: 'Planner dashboard overview',
    requiredRole: 'planner',
    showInNav: true
  },
  {
    path: '/planner/clients',
    name: 'Clients',
    description: 'Manage your clients',
    requiredRole: 'planner',
    showInNav: true
  },
  {
    path: '/planner/services',
    name: 'Services',
    description: 'Manage your services and packages',
    requiredRole: 'planner',
    showInNav: true
  },
  {
    path: '/planner/bookings',
    name: 'Bookings',
    description: 'View and manage client bookings',
    requiredRole: 'planner',
    showInNav: true
  },
  {
    path: '/planner/calendar',
    name: 'Calendar',
    description: 'View your schedule and appointments',
    requiredRole: 'planner',
    showInNav: true
  },
  {
    path: '/planner/reports',
    name: 'Reports',
    description: 'View business reports and analytics',
    requiredRole: 'planner',
    showInNav: true
  },
  {
    path: '/planner/profile',
    name: 'Profile',
    description: 'Manage your business profile',
    requiredRole: 'planner',
    showInNav: true
  }
];

export const ADMIN_ROUTES: RouteConfig[] = [
  {
    path: '/bplo/dashboard',
    name: 'Dashboard',
    description: 'Admin dashboard overview',
    requiredRole: 'admin',
    showInNav: true
  },
  {
    path: '/admin/users',
    name: 'Users',
    description: 'Manage system users',
    requiredRole: 'admin',
    showInNav: true
  },
  {
    path: '/admin/planners',
    name: 'Planners',
    description: 'Manage wedding planners',
    requiredRole: 'admin',
    showInNav: true
  },
  {
    path: '/admin/services',
    name: 'Services',
    description: 'Oversee all services',
    requiredRole: 'admin',
    showInNav: true
  },
  {
    path: '/admin/bookings',
    name: 'Bookings',
    description: 'Monitor all bookings',
    requiredRole: 'admin',
    showInNav: true
  },
  {
    path: '/admin/reports',
    name: 'Reports',
    description: 'System-wide reports',
    requiredRole: 'admin',
    showInNav: true
  },
  {
    path: '/admin/settings',
    name: 'Settings',
    description: 'System configuration',
    requiredRole: 'admin',
    showInNav: true
  },
  {
    path: '/admin/analytics',
    name: 'Analytics',
    description: 'Platform analytics and insights',
    requiredRole: 'admin',
    showInNav: true
  }
];

export const PUBLIC_ROUTES: RouteConfig[] = [
  {
    path: '/',
    name: 'Home',
    description: 'Homepage',
    showInNav: true
  },
  {
    path: '/services',
    name: 'Services',
    description: 'Browse wedding services',
    showInNav: true
  },
  {
    path: '/about',
    name: 'About',
    description: 'About WeddingMart',
    showInNav: true
  },
  {
    path: '/contact',
    name: 'Contact',
    description: 'Contact us',
    showInNav: true
  }
];

export const PROTECTED_ROUTES: RouteConfig[] = [
  {
    path: '/booking',
    name: 'Booking',
    description: 'Make a booking',
    allowedRoles: ['client', 'planner', 'admin']
  }
];

// Helper function to get routes by role
export const getRoutesByRole = (role: 'client' | 'planner' | 'admin') => {
  switch (role) {
    case 'client':
      return CLIENT_ROUTES;
    case 'planner':
      return PLANNER_ROUTES;
    case 'admin':
      return ADMIN_ROUTES;
    default:
      return [];
  }
};

// Helper function to check if user has access to route
export const hasAccessToRoute = (
  route: RouteConfig, 
  userRole: 'client' | 'planner' | 'admin'
): boolean => {
  if (route.requiredRole) {
    return route.requiredRole === userRole;
  }
  
  if (route.allowedRoles) {
    return route.allowedRoles.includes(userRole);
  }
  
  return true; // Public route
};