import {
  Home,
  Users,
  MessageCircle,
  User,
  Settings,
  Calendar,
  UserCheck,
  CreditCard,
  LogOut,
  Package,
  ClipboardList,
  BarChart3,
  FileText,
  TrendingUp,
  AlertCircle,
  Clock
} from "lucide-react";

export interface SidebarItem {
  name: string;
  icon: React.ComponentType<any>;
  path: string;
  onClick?: () => void;
  disabled?: boolean;
  requiresApproval?: boolean;
  badge?: string;
  active?: boolean;
}

// Get planner status from user object
const getPlannerStatus = (user: any) => {
  return user?.plannerProfile?.status || 'pending';
};

// Check if planner is approved
const isPlannerApproved = (user: any) => {
  return user?.role === 'planner' && getPlannerStatus(user) === 'approved';
};

export const getSidebarItems = (role: string, handleLogout: () => void, user?: any): SidebarItem[] => {
  switch (role) {
    case "admin":
      return [
        { name: "Dashboard", icon: Home, path: "/bplo/dashboard" },
        // { name: "Users", icon: Users, path: "/admin/users" },
        { name: "Planners", icon: UserCheck, path: "/admin/planners" },
        // { name: "Services", icon: Package, path: "/admin/services" },
        // { name: "Bookings", icon: ClipboardList, path: "/admin/bookings" },
        { name: "Reports", icon: FileText, path: "/admin/reports" },
        // { name: "Analytics", icon: TrendingUp, path: "/admin/analytics" },
        { name: "Settings", icon: Settings, path: "/admin/settings" },
        { name: "Logout", icon: LogOut, path: "", onClick: handleLogout },
      ];

    case "planner":
      const plannerStatus = getPlannerStatus(user);
      const isApproved = isPlannerApproved(user);

      const plannerItems: SidebarItem[] = [
        { 
          name: "Dashboard", 
          icon: Home, 
          path: "/planner/dashboard",
          disabled: !isApproved,
          requiresApproval: true
        },
        { 
          name: "Services", 
          icon: Package, 
          path: "/planner/services",
          disabled: !isApproved,
          requiresApproval: true
        },
        { 
          name: "Bookings", 
          icon: ClipboardList, 
          path: "/planner/bookings",
          disabled: !isApproved,
          requiresApproval: true
        },
        // { 
        //   name: "Calendar", 
        //   icon: Calendar, 
        //   path: "/planner/calendar",
        //   disabled: !isApproved,
        //   requiresApproval: true
        // },
        { 
          name: "Clients", 
          icon: Users, 
          path: "/planner/clients",
          disabled: !isApproved,
          requiresApproval: true
        },
        { 
          name: "Reports", 
          icon: BarChart3, 
          path: "/planner/reports",
          disabled: !isApproved,
          requiresApproval: true
        },
        { 
          name: "Profile", 
          icon: User, 
          path: "/planner/profile",
          badge: plannerStatus === 'pending' ? 'Pending' : plannerStatus === 'rejected' ? 'Rejected' : undefined
        },
        { name: "Logout", icon: LogOut, path: "", onClick: handleLogout },
      ];

      // Add status indicator for pending/rejected planners
      if (plannerStatus !== 'approved') {
        plannerItems.unshift({
          name: plannerStatus === 'pending' ? 'Approval Pending' : 'Account Rejected',
          icon: plannerStatus === 'pending' ? Clock : AlertCircle,
          path: '/planner/profile',
          badge: plannerStatus === 'pending' ? 'Review' : 'Contact Support'
        });
      }

      return plannerItems;

    case "client":
      return [
        { name: "Dashboard", icon: Home, path: "/client/dashboard" },
        { name: "Bookings", icon: Calendar, path: "/client/bookings" },
        { name: "Profile", icon: User, path: "/client/profile" },
        { name: "Payments", icon: CreditCard, path: "/client/payments" },
        { name: "Logout", icon: LogOut, path: "", onClick: handleLogout },
      ];

    default:
      return [
        { name: "Dashboard", icon: Home, path: "/" },
        { name: "Logout", icon: LogOut, path: "", onClick: handleLogout },
      ];
  }
};