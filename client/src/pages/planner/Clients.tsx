import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Users,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Eye,
  MessageCircle,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import {
  useClients,
  useClientStats,
  useClientActions,
  usePlannerPermissions,
} from "../../hooks/useClients";
import type { ClientFilters } from "../../services/clientService";

const PlannerClients = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedClients, setExpandedClients] = useState(new Set());

  // Memoize filters to prevent unnecessary re-renders
  const filters: ClientFilters = useMemo(
    () => ({
      search: debouncedSearchTerm,
      status: statusFilter !== "all" ? statusFilter : undefined,
      page: currentPage,
      limit: 20,
    }),
    [debouncedSearchTerm, statusFilter, currentPage]
  );

  // Hooks
  const { clients, loading, error, pagination, refetch } = useClients(filters);
  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats,
  } = useClientStats();
  const { sendMessage, loading: actionsLoading } = useClientActions();
  const { canAccessClients, isPlannerApproved } = usePlannerPermissions();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Refetch stats only once on mount
  useEffect(() => {
    refetchStats();
  }, []); // Empty dependency array

  // Check permissions
  useEffect(() => {
    if (!canAccessClients) {
      console.error(
        "Access denied: User is not a planner or not authenticated"
      );
    }

    if (!isPlannerApproved) {
      console.warn("Planner account is not yet approved");
    }
  }, [canAccessClients, isPlannerApproved]);

  // Memoized event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  const handleStatusFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value);
      setCurrentPage(1); // Reset to first page on filter change
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSendMessage = useCallback(
    async (clientId: number) => {
      // Simple prompt for demo - replace with proper modal/form
      const message = prompt("Enter your message:");
      if (message) {
        try {
          await sendMessage(clientId, { message });
          alert("Message sent successfully!");
        } catch (err) {
          alert("Failed to send message");
        }
      }
    },
    [sendMessage]
  );

  const handleViewClient = useCallback((clientId: number) => {
    // Navigate to client details page or open modal
    console.log("View client:", clientId);
    // You can implement navigation here
  }, []);

  const handleCallClient = useCallback((phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`);
    }
  }, []);

  // Toggle expanded view for clients with multiple bookings
  const toggleClientExpanded = useCallback((clientId: number) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  }, []);

  // Utility Functions
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  // Render booking count badge
  const renderBookingCount = useCallback((client: any) => {
    if (!client.bookingCount || client.bookingCount <= 1) return null;
    
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
        {client.bookingCount} bookings
      </span>
    );
  }, []);

  // Calculate total spent for a client
  const calculateTotalSpent = useCallback((client: any) => {
    if (!client.packages || client.packages.length === 0) return "₱0";
    
    const total = client.packages.reduce((sum: number, pkg: any) => {
      return sum + parseFloat(pkg.packagePrice || 0);
    }, 0);
    
    return `₱${total.toLocaleString()}`;
  }, []);

  // Render individual booking row
  const renderBookingRow = useCallback((client: any, booking: any, index: number) => {
    return (
      <tr key={`${client.id}-${booking.bookingId}`} className="bg-gray-50">
        <td className="px-6 py-3 pl-12">
          <div className="flex items-center text-sm">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600 mr-3">
              {index + 1}
            </div>
            <div>
              <div className="text-xs text-gray-500">Booking #{booking.bookingId}</div>
              <div className="text-xs text-gray-400">
                {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-3">
          <div className="text-sm text-gray-900">
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {new Date(booking.weddingDate).toLocaleDateString()}
            </div>
            <div className="flex items-center mb-1">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              {booking.weddingTime || "Not set"}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate max-w-32">
                {booking.weddingLocation || "Not specified"}
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-3">
          <div className="text-sm">
            <div className="font-medium text-gray-800">{booking.packageName}</div>
            <div className="text-gray-500">₱{Number(booking.packagePrice).toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">
              Paid: ₱{Number(booking.paidAmount).toLocaleString()}
            </div>
          </div>
        </td>
        <td className="px-6 py-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status?.charAt(0).toUpperCase() +
              booking.status?.slice(1).replace('_', ' ') || 'Unknown'}
          </span>
          {booking.notes && (
            <div className="text-xs text-gray-500 mt-1 truncate max-w-24">
              {booking.notes}
            </div>
          )}
        </td>
        <td className="px-6 py-3 text-sm font-medium text-gray-900">
          ₱{Number(booking.packagePrice).toLocaleString()}
        </td>
        <td className="px-6 py-3 text-sm space-x-2">
          <button
            onClick={() => handleViewClient(client.id)}
            className="text-pink-600 hover:text-pink-700 p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSendMessage(client.id)}
            className="text-blue-600 hover:text-blue-700 p-1"
            title="Send Message"
            disabled={!isPlannerApproved || actionsLoading}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </td>
      </tr>
    );
  }, [getStatusColor, handleViewClient, handleSendMessage, isPlannerApproved, actionsLoading]);

  // Memoized pagination component
  const renderPagination = useCallback(() => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(
      1,
      pagination.currentPage - Math.floor(maxVisible / 2)
    );
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded ${
            i === pagination.currentPage
              ? "bg-pink-500 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-6 space-x-1">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  }, [pagination, handlePageChange]);

  // Permission denied state
  if (!canAccessClients) {
    return (
      <DashboardLayout
        title="My Clients"
        subtitle="Manage your wedding planning clients"
      >
        <div className="flex justify-center items-center h-64">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div className="ml-2">
            <p className="text-red-600 font-medium">Access Denied</p>
            <p className="text-gray-600">
              Only planners can access client data.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Loading State
  if (loading && clients.length === 0) {
    return (
      <DashboardLayout
        title="My Clients"
        subtitle="Manage your wedding planning clients"
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Loading clients...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Error State
  if (error) {
    return (
      <DashboardLayout
        title="My Clients"
        subtitle="Manage your wedding planning clients"
      >
        <div className="flex justify-center items-center h-64">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <div className="ml-2">
            <p className="text-red-600 font-medium">Error loading clients</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Clients"
      subtitle="Manage your wedding planning clients"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalClients || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Projects
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.activeProjects || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.completed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Planner approval notice */}
      {!isPlannerApproved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              Your planner account is pending approval. Some features may be
              limited until your account is approved.
            </p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(loading || actionsLoading) && (
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wedding Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => {
                const isExpanded = expandedClients.has(client.id);
                const hasMultipleBookings = client.bookingCount > 1;
                const latestBooking = client.bookings && client.bookings.length > 0 
                  ? client.bookings[0] 
                  : null;

                return (
                  <React.Fragment key={client.id}>
                    {/* Main client row */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {client.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {client.name}
                              {renderBookingCount(client)}
                              {hasMultipleBookings && (
                                <button
                                  onClick={() => toggleClientExpanded(client.id)}
                                  className="ml-2 p-1 hover:bg-gray-200 rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {latestBooking 
                              ? new Date(latestBooking.weddingDate).toLocaleDateString()
                              : "Not set"}
                          </div>
                          <div className="flex items-center mb-1">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="truncate max-w-32">
                              {latestBooking?.weddingLocation || client.venue || "Not specified"}
                            </span>
                          </div>
                          {hasMultipleBookings && (
                            <div className="text-xs text-blue-600">
                              {isExpanded ? 'Hide' : 'Show'} all bookings
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {latestBooking ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-800">{latestBooking.packageName}</div>
                            <div className="text-gray-500">₱{Number(latestBooking.packagePrice).toLocaleString()}</div>
                            {hasMultipleBookings && (
                              <div className="text-xs text-blue-600">
                                +{client.bookingCount - 1} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No packages</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            client.status
                          )}`}
                        >
                          {client.status?.charAt(0).toUpperCase() +
                            client.status?.slice(1).replace('_', ' ') || 'Unknown'}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Last: {client.lastContact}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {calculateTotalSpent(client)}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleViewClient(client.id)}
                          className="text-pink-600 hover:text-pink-700 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendMessage(client.id)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Send Message"
                          disabled={!isPlannerApproved || actionsLoading}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCallClient(client.phone)}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Call Client"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded booking rows */}
                    {isExpanded && hasMultipleBookings && client.bookings && (
                      client.bookings.map((booking, index) => 
                        renderBookingRow(client, booking, index)
                      )
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Empty State */}
      {clients.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No clients found
          </h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "You haven't received any bookings yet."}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PlannerClients;