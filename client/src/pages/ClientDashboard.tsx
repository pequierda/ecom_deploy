import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Users,
  CreditCard,
  MessageCircle,
  CheckCircle,
  User,
  Clock,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuthStore } from "../stores/authStore";

type Overview = {
  total_bookings: number;
  upcoming_bookings: number;
  completed_bookings: number;
};

type Payments = {
  total_paid: number;
  total_payments: number;
  verified_payments: number;
  pending_payments: number;
  total_payment_amount: number;
};

type Booking = {
  booking_id: string;
  package_title: string;
  planner_business: string;
  status: string;
  wedding_date: string;
  venue: string;
  package_price: number;
};

type NextEvent = {
  package_title: string;
  planner_business: string;
  wedding_date: string;
  wedding_time?: string;
  venue: string;
  status: string;
  days_until_event: number;
};

type MonthlyTrend = any; // Replace with actual type if available

type Stats = {
  overview: Overview;
  payments: Payments;
  recent_bookings: Booking[];
  next_event: NextEvent | null;
  monthly_trend: MonthlyTrend;
};

const ClientDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // State management
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Redirect if no user
  if (!user) {
    navigate('/login');
    return null;
  }

  // Fetch client stats
  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/stats/client`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Client stats received:', data);
        
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch stats');
        }
      } catch (err) {
        console.error('❌ Error fetching client stats:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientStats();
  }, [API_BASE_URL]);

  // Helper function to calculate days until event
  const calculateDaysUntil = (dateString: string) => {
    if (!dateString) return 0;
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Loading Dashboard...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your wedding dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Dashboard Error">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // No stats data
  if (!stats) {
    return (
      <DashboardLayout title="No Data Available">
        <div className="text-center py-12">
          <p className="text-gray-600">No wedding data available yet.</p>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, payments, recent_bookings, next_event, monthly_trend } = stats;

  return (
    <DashboardLayout 
      title={`Welcome back, ${user.first_name}!`}
      subtitle="Here's what's happening with your wedding planning"
    >
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{overview.total_bookings}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-pink-600" />
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{overview.upcoming_bookings}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{overview.completed_bookings}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(payments.total_paid)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Next Event and Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Next Event */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-pink-600" />
            Next Event
          </h2>
          
          {next_event ? (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900">{next_event.package_title}</h3>
                <p className="text-gray-600">{next_event.planner_business}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(next_event.wedding_date)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{next_event.wedding_time || 'TBD'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{next_event.venue}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(next_event.status)}`}>
                    {next_event.status}
                  </span>
                </div>
              </div>

              {next_event.days_until_event >= 0 && (
                <div className="mt-4 p-4 bg-pink-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">{next_event.days_until_event} days</p>
                    <p className="text-pink-700 text-sm">until your event</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming events scheduled</p>
              <button 
                onClick={() => navigate('/services')}
                className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Browse Packages
              </button>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
            Payment Summary
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Payments:</span>
              <span className="font-medium">{payments.total_payments}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified Payments:</span>
              <span className="font-medium text-green-600">{payments.verified_payments}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Payments:</span>
              <span className="font-medium text-yellow-600">{payments.pending_payments}</span>
            </div>
            
            <hr className="border-gray-200" />
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold">{formatCurrency(payments.total_payment_amount)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-bold text-green-600">{formatCurrency(payments.total_paid)}</span>
            </div>

            {payments.total_payment_amount > payments.total_paid && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 text-sm font-medium">
                  Outstanding: {formatCurrency(payments.total_payment_amount - payments.total_paid)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2 text-pink-600" />
            Your Recent Bookings
          </h2>
          <button 
            onClick={() => navigate('/client/bookings/')}
            className="text-pink-600 hover:text-pink-700 font-medium text-sm"
          >
            View All Bookings
          </button>
        </div>

        {recent_bookings && recent_bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent_bookings.map((booking) => (
              <div key={booking.booking_id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{booking.package_title}</h3>
                      <p className="text-sm text-gray-600">
                        <Users className="inline w-4 h-4 mr-1" />
                        {booking.planner_business}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Wedding Date:</span>
                      <span className="font-medium">{formatDate(booking.wedding_date)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Venue:</span>
                      <span className="font-medium">{booking.venue}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-bold text-pink-600">{formatCurrency(booking.package_price)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/client/service/${booking.booking_id}`)}
                      className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                    >
                      View Details
                    </button>
                    <button className="flex-1 bg-white border border-pink-600 text-pink-600 hover:bg-pink-50 py-2 px-3 rounded-lg text-sm transition-colors">
                      Contact Planner
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-4">Start planning your dream wedding by browsing our packages</p>
            <button 
              onClick={() => navigate('/services')}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Wedding Packages
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/services')}
            className="flex items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <CalendarIcon className="w-5 h-5 text-pink-600 mr-2" />
            <span className="text-pink-700 font-medium">Browse Packages</span>
          </button>
          
          <button 
            onClick={() => navigate('/client/bookings')}
            className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium">My Bookings</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <MessageCircle className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-purple-700 font-medium">Messages</span>
          </button>
          
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <CreditCard className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">Payments</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;