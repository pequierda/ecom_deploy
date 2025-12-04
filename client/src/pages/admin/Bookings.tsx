// pages/admin/Bookings.tsx
import React, { useState } from 'react';
import { Calendar, Search, Filter, Eye, AlertTriangle, DollarSign, Users, MapPin, Clock, Download, FileText } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';

const AdminBookings = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const bookings = [
    {
      id: 1,
      bookingNumber: 'WB-2025-001',
      clientName: 'Sarah & Miguel Rodriguez',
      plannerName: 'Maria Santos',
      businessName: 'Creative Events PH',
      packageName: 'Premium Wedding Package',
      weddingDate: '2025-06-20',
      bookingDate: '2025-01-10',
      venue: 'Garden Paradise Resort, Tagaytay',
      amount: 85000,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'GCash',
      clientEmail: 'sarah.rodriguez@gmail.com',
      clientPhone: '+63 912 345 6789',
      guestCount: 120,
      specialRequests: 'White and gold theme, vegetarian options needed',
      permits: {
        venue: 'approved',
        catering: 'approved',
        music: 'approved'
      }
    },
    {
      id: 2,
      bookingNumber: 'WB-2025-002',
      clientName: 'Maria & Carlos Santos',
      plannerName: 'Carlos Mendoza',
      businessName: 'Seaside Weddings Co.',
      packageName: 'Garden Wedding Special',
      weddingDate: '2025-07-15',
      bookingDate: '2025-01-08',
      venue: 'Botanical Garden, Antipolo',
      amount: 65000,
      status: 'pending',
      paymentStatus: 'partial',
      paymentMethod: 'Bank Transfer',
      clientEmail: 'maria.santos@yahoo.com',
      clientPhone: '+63 917 654 3210',
      guestCount: 80,
      specialRequests: 'Outdoor ceremony, backup plan needed for rain',
      permits: {
        venue: 'pending',
        catering: 'approved',
        music: 'pending'
      }
    },
    {
      id: 3,
      bookingNumber: 'WB-2025-003',
      clientName: 'Anna & David Kim',
      plannerName: 'Lisa Gonzalez',
      businessName: 'Mountain View Events',
      packageName: 'Destination Wedding',
      weddingDate: '2025-08-10',
      bookingDate: '2024-12-15',
      venue: 'Seaside Chapel, Bataan',
      amount: 120000,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card',
      clientEmail: 'anna.kim@outlook.com',
      clientPhone: '+63 928 987 6543',
      guestCount: 50,
      specialRequests: 'Destination wedding with travel coordination',
      permits: {
        venue: 'approved',
        catering: 'approved',
        music: 'approved'
      }
    },
    {
      id: 4,
      bookingNumber: 'WB-2025-004',
      clientName: 'Lisa & Mark Gonzalez',
      plannerName: 'Anna Kim',
      businessName: 'Simple Celebrations',
      packageName: 'Budget Wedding Package',
      weddingDate: '2025-09-25',
      bookingDate: '2025-01-05',
      venue: 'Community Center, Quezon City',
      amount: 35000,
      status: 'disputed',
      paymentStatus: 'pending',
      paymentMethod: 'Cash',
      clientEmail: 'lisa.gonzalez@gmail.com',
      clientPhone: '+63 933 123 4567',
      guestCount: 60,
      specialRequests: 'Budget-friendly options, simple setup',
      permits: {
        venue: 'expired',
        catering: 'rejected',
        music: 'pending'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'disputed': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPermitStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.plannerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || booking.status === activeTab;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const bookingDate = new Date(booking.weddingDate);
      const now = new Date();
      const diffTime = bookingDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'this_month': matchesDate = diffDays <= 30 && diffDays > 0; break;
        case 'next_3_months': matchesDate = diffDays <= 90 && diffDays > 0; break;
        case 'past': matchesDate = diffDays < 0; break;
      }
    }
    
    return matchesSearch && matchesTab && matchesDate;
  });

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    disputedBookings: bookings.filter(b => b.status === 'disputed').length,
    totalRevenue: bookings.reduce((sum, b) => sum + b.amount, 0),
    averageBookingValue: bookings.reduce((sum, b) => sum + b.amount, 0) / bookings.length
  };

  const getDaysUntilWedding = (weddingDate: string) => {
    const today = new Date();
    const wedding = new Date(weddingDate);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout 
      title="Booking Management"
      subtitle="Monitor and oversee all wedding bookings in the system"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmedBookings}</p>
              <p className="text-sm text-gray-600">Confirmed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.disputedBookings}</p>
              <p className="text-sm text-gray-600">Disputes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-pink-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">₱{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600">Total Value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="border-b border-gray-200 flex-1">
            <nav className="-mb-px flex space-x-8">
              {['all', 'pending', 'confirmed', 'completed', 'disputed', 'cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm w-64"
              />
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            >
              <option value="all">All Dates</option>
              <option value="this_month">This Month</option>
              <option value="next_3_months">Next 3 Months</option>
              <option value="past">Past Events</option>
            </select>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {filteredBookings.map((booking) => {
          const daysUntil = getDaysUntilWedding(booking.weddingDate);
          const hasPermitIssues = Object.values(booking.permits).some(status => 
            status === 'rejected' || status === 'expired'
          );
          
          return (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.clientName}</h3>
                      <span className="text-sm text-gray-500">#{booking.bookingNumber}</span>
                      {hasPermitIssues && (
                        <AlertTriangle className="w-4 h-4 text-red-500" title="Permit issues detected" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{booking.packageName}</p>
                    <p className="text-xs text-gray-500">
                      Planner: {booking.plannerName} • {booking.businessName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus === 'paid' ? 'Paid' : 
                         booking.paymentStatus === 'partial' ? 'Partial' : 
                         booking.paymentStatus === 'pending' ? 'Payment Pending' : booking.paymentStatus}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">₱{booking.amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  {/* Left Column - Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{new Date(booking.weddingDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        daysUntil <= 30 ? 'bg-red-100 text-red-800' :
                        daysUntil <= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {daysUntil > 0 ? `${daysUntil} days` : 'Past due'}
                      </span>
                    </div>
                    
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                      <span>{booking.venue}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-3 text-gray-400" />
                      <span>{booking.guestCount} guests</span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600">Payment:</span>
                      <span className="ml-2 text-gray-900">{booking.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Middle Column - Client Info */}
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Client Contact:</span>
                    </div>
                    <div className="text-sm text-gray-600">{booking.clientEmail}</div>
                    <div className="text-sm text-gray-600">{booking.clientPhone}</div>
                    
                    <div className="text-sm">
                      <span className="text-gray-600">Booked on:</span>
                      <span className="ml-2 text-gray-900">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    
                    {booking.specialRequests && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">Special Requests:</span>
                        <p className="text-gray-600 mt-1">{booking.specialRequests}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Permits */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Required Permits</h4>
                    {Object.entries(booking.permits).map(([permit, status]) => (
                      <div key={permit} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{permit}</span>
                        <span className={`text-xs font-medium ${getPermitStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                    
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <FileText className="w-4 h-4 mr-2" />
                      Contract
                    </button>
                    
                    {hasPermitIssues && (
                      <button className="inline-flex items-center px-3 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 bg-white hover:bg-orange-50">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Resolve Permits
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {booking.status === 'disputed' && (
                      <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        Mediate Dispute
                      </button>
                    )}
                    
                    {booking.status === 'pending' && (
                      <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-pink-600 hover:bg-pink-700">
                        Monitor Progress
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">
            {searchQuery || dateFilter !== 'all' || activeTab !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No bookings have been made yet.'}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBookings;