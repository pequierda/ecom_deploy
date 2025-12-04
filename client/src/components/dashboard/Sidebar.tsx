import "react";
import { Shield, User, X } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

const Sidebar = ({
  role,
  sidebarItems = [],
  userData,
  isOpen,
  onClose,
}: {
  role: string;
  sidebarItems: Array<{
    name: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    active?: boolean;
    onClick?: () => void;
  }>;
  userData: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const getRoleIcon = () => {
    switch (role) {
      case "admin":
        return <Shield className="w-5 h-5 text-white" />;
      case "planner":
      case "client":
      default:
        return <User className="w-5 h-5 text-white" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return "bg-pink-500";
      case "planner":
        return "bg-blue-500";
      case "client":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 ${getRoleColor()} rounded-lg`}
          >
            {getRoleIcon()}
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-900">
            {role === "admin" && "BPLO Admin"}
            {role === "planner" && "Event Planner"}
            {role === "client" && "Client Portal"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-6 px-3">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const color = getRoleColor().split("-")[1];

          return (
            <button
              key={item.name}
              onClick={
                item.onClick
                  ? item.onClick
                  : () => console.log(`${item.name} clicked`)
              }
              className={`w-full flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                item.active
                  ? `bg-${color}-50 text-${color}-700 border-r-2 border-${color}-500`
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div
            className={`w-10 h-10 ${getRoleColor()} rounded-full flex items-center justify-center`}
          >
            {getRoleIcon()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{userData.name}</p>
            <p className="text-xs text-gray-500">
              {role === "admin" && "System Administrator"}
              {role === "planner" && "Event Planner"}
              {role === "client" && "Client"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
